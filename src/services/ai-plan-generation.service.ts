import type { GeneratePlanCommand, GeneratePlanResponseDTO, PlanDetailDTO, GeneratedPlanDTO } from '../types';
import { ValidationError, ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';
import { createSupabaseServerInstance } from '../db/supabase.client';
import { logger } from '../utils/logger';
import type { Json } from '../db/database.types';
import { OpenRouterService } from '../lib/openrouter.service';
import { GooglePlacesService } from './google-places.service';
import type { AstroCookies } from 'astro';

const INITIAL_ESTIMATED_TIME = 90; // 90 seconds
const TIME_UPDATE_INTERVAL = 5000; // 5 seconds in milliseconds

const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;
if (!openRouterApiKey) {
  throw new Error('Missing OPENROUTER_API_KEY environment variable');
}

export class AIPlanGenerationService {
  private readonly openRouter: OpenRouterService;
  private readonly googlePlaces: GooglePlacesService;

  constructor() {
    this.openRouter = new OpenRouterService({
      apiKey: openRouterApiKey,
      siteUrl: 'https://it-is-nice-to-travel.com',
      siteName: 'It Is Nice To Travel',
      defaultModel: 'openai/gpt-4o-mini',
      cacheOptions: {
        enabled: false,
        ttl: 3600,
        maxSize: 100
      }
    });
    this.googlePlaces = new GooglePlacesService();
  }

  async initializeGeneration(
    command: GeneratePlanCommand, 
    context: { headers: Headers; cookies: AstroCookies }
  ): Promise<GeneratePlanResponseDTO> {
    logger.info('Initializing plan generation', { planId: command.planId, userId: command.userId });
    
    const supabase = createSupabaseServerInstance(context);
    
    // Validate the plan and user access
    const plan = await this.validatePlan(command.planId, command.userId, supabase);
    
    // Check if generation is already in progress
    const isInProgress = await this.isGenerationInProgress(command.planId, supabase);
    if (isInProgress) {
      logger.warn('Generation already in progress', { planId: command.planId });
      throw new ConflictError('Generation already in progress for this plan');
    }

    // Check if there's an existing generated plan
    logger.debug('Checking for existing generated plan', { planId: command.planId });
    const { data: existingPlan, error: existingPlanError } = await supabase
      .from('generated_ai_plans')
      .select('id')
      .eq('plan_id', command.planId)
      .maybeSingle();

    let generationRecord;

    if (existingPlan) {
      // Update existing record
      logger.debug('Updating existing generation record', { planId: command.planId });
      const { data: updatedRecord, error } = await supabase
        .from('generated_ai_plans')
        .update({
          status: 'processing',
          content: {} as Json,
          estimated_time_remaining: INITIAL_ESTIMATED_TIME
        })
        .eq('id', existingPlan.id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update generation record', { 
          planId: command.planId, 
          error: error.message 
        });
        throw new Error('Failed to update generation record');
      }
      generationRecord = updatedRecord;
    } else {
      // Create new record
      logger.debug('Creating new generation record', { planId: command.planId });
      const { data: newRecord, error } = await supabase
        .from('generated_ai_plans')
        .insert({
          plan_id: command.planId,
          status: 'processing',
          content: {} as Json,
          estimated_time_remaining: INITIAL_ESTIMATED_TIME
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create generation record', { 
          planId: command.planId, 
          error: error.message 
        });
        throw new Error('Failed to create generation record');
      }
      generationRecord = newRecord;
    }

    // Start the generation process in the background
    this.startGenerationProcess(plan, generationRecord.id, context)
      .catch(error => {
        logger.error('Generation process failed', {
          planId: command.planId,
          error: error instanceof Error ? error.message : JSON.stringify(error)
        });
        this.updateGenerationStatus(generationRecord.id, 'failed', 0, context);
      });

    logger.info('Generation initialized successfully', { 
      planId: command.planId,
      generationId: generationRecord.id 
    });

    // Return immediate response
    return {
      id: generationRecord.id,
      status: 'processing',
      estimated_time: INITIAL_ESTIMATED_TIME
    };
  }

  private async validatePlan(planId: string, userId: string, supabase: any): Promise<PlanDetailDTO> {
    logger.debug('Validating plan', { planId, userId });
    
    // Fetch plan with places
    const { data: plan, error } = await supabase
      .from('generated_user_plans')
      .select(`
        *,
        places (*)
      `)
      .eq('id', planId)
      .single();

    if (error || !plan) {
      logger.warn('Plan not found', { planId });
      throw new NotFoundError('Plan not found');
    }

    // Check ownership
    if (plan.user_id !== userId) {
      logger.warn('Access denied - user does not own the plan', { planId, userId });
      throw new ForbiddenError('Access denied');
    }

    // Validate plan has required data
    if (!plan.places || plan.places.length === 0) {
      logger.warn('Plan validation failed - no places', { planId });
      throw new ValidationError('Plan must have at least one place');
    }

    if (!plan.start_date || !plan.end_date) {
      logger.warn('Plan validation failed - missing dates', { planId });
      throw new ValidationError('Plan must have start and end dates');
    }

    logger.debug('Plan validation successful', { planId });
    return plan as PlanDetailDTO;
  }

  private async isGenerationInProgress(planId: string, supabase: any): Promise<boolean> {
    logger.debug('Checking if generation is in progress', { planId });
    
    const { data, error } = await supabase
      .from('generated_ai_plans')
      .select('status')
      .eq('plan_id', planId)
      .eq('status', 'processing')
      .maybeSingle();

    if (error) {
      logger.error('Failed to check generation status', { 
        planId, 
        error: error.message 
      });
      throw new Error('Failed to check generation status');
    }

    const isInProgress = !!data;
    logger.debug('Generation status check complete', { 
      planId, 
      isInProgress 
    });
    
    return isInProgress;
  }

  private async enrichContentWithImages(content: any, location: string): Promise<any> {
    const enrichedContent = { ...content };

    for (const place of enrichedContent.places) {
      for (const day of place.days) {
        // Enrich schedule items
        for (const item of day.schedule) {
          if (item.activity !== 'Travel' && item.activity !== 'Check-in') {
            item.image_url = await this.googlePlaces.getPlacePhoto(
              item.activity,
              `${place.name}, ${location}`
            );
          }
        }

        // Enrich dining recommendations
        for (const item of day.dining_recommendations) {
          item.image_url = await this.googlePlaces.getPlacePhoto(
            item.name,
            `${place.name}, ${location}`
          );
        }
      }
    }

    return enrichedContent;
  }

  private async startGenerationProcess(
    plan: PlanDetailDTO, 
    generationId: string, 
    context: { headers: Headers; cookies: AstroCookies }
  ): Promise<void> {
    logger.info('Starting generation process', { planId: plan.id });

    const supabase = createSupabaseServerInstance(context);

    // Start the timer update interval
    const startTime = Date.now();
    const updateInterval = setInterval(async () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remainingTime = Math.max(0, INITIAL_ESTIMATED_TIME - elapsedSeconds);
      
      await this.updateGenerationStatus(generationId, 'processing', remainingTime, context);

      if (remainingTime === 0) {
        clearInterval(updateInterval);
      }
    }, TIME_UPDATE_INTERVAL);

    try {
      const prompt = this.buildPrompt(plan);
      logger.debug('Generated prompt', { prompt });
      
      const response = await this.openRouter.chat([
        {
          role: 'system',
          content: `You are a travel planning assistant that creates detailed daily itineraries. You provide specific times, addresses, and descriptions for activities and dining recommendations.

You MUST respond with a valid JSON object in the following format:
{
  "version": "string",
  "places": [
    {
      "name": "string",
      "days": [
        {
          "date": "string",
          "schedule": [
            {
              "time": "string",
              "activity": "string",
              "address": "string",
              "description": "string"
            }
          ],
          "dining_recommendations": [
            {
              "type": "string",
              "name": "string",
              "address": "string",
              "description": "string"
            }
          ]
        }
      ]
    }
  ]
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        temperature: 0.7
      });

      logger.debug('Received response from OpenRouter', { 
        choices: response.choices?.length,
        usage: response.usage
      });

      // Parse the content if it's a string
      const content = typeof response.choices[0].message.content === 'string' 
        ? JSON.parse(response.choices[0].message.content)
        : response.choices[0].message.content;

      // Enrich content with real images
      const enrichedContent = await this.enrichContentWithImages(content, 'Poland');

      // Clear the interval before updating the final status
      clearInterval(updateInterval);

      // Update the generation record with the generated content
      const { error } = await supabase
        .from('generated_ai_plans')
        .update({ 
          status: 'completed',
          content: enrichedContent as unknown as Json,
          estimated_time_remaining: 0
        })
        .eq('id', generationId);

      if (error) {
        throw new Error(`Failed to update generation record: ${error.message}`);
      }

      // Update user plan status to 'generated'
      const { error: updatePlanError } = await supabase
        .from('generated_user_plans')
        .update({ status: 'generated' })
        .eq('id', plan.id);

      if (updatePlanError) {
        throw new Error(`Failed to update plan status: ${updatePlanError.message}`);
      }

      logger.info('Generation completed successfully', { 
        planId: plan.id,
        generationId 
      });
    } catch (error) {
      // Clear the interval before handling the error
      clearInterval(updateInterval);

      logger.error('Generation process failed', {
        planId: plan.id,
        error: error instanceof Error ? error.message : JSON.stringify(error),
        errorObject: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause
        } : error
      });
      
      // Update generation status to failed
      await this.updateGenerationStatus(generationId, 'failed', 0, context)
        .catch(updateError => {
          logger.error('Failed to update generation status', {
            generationId,
            error: updateError instanceof Error ? updateError.message : JSON.stringify(updateError)
          });
        });

      throw error;
    }
  }

  private async updateGenerationStatus(
    generationId: string, 
    status: 'completed' | 'processing' | 'failed',
    estimatedTimeRemaining: number,
    context: { headers: Headers; cookies: AstroCookies }
  ): Promise<void> {
    const supabase = createSupabaseServerInstance(context);
    
    const { error } = await supabase
      .from('generated_ai_plans')
      .update({ 
        status,
        estimated_time_remaining: estimatedTimeRemaining
      })
      .eq('id', generationId);

    if (error) {
      logger.error('Failed to update generation status', {
        generationId,
        status,
        estimatedTimeRemaining,
        error: error.message
      });
    }
  }

  private buildPrompt(plan: PlanDetailDTO): string {
    const preferences = plan.travel_preferences ? `Travel preferences: ${plan.travel_preferences}\n` : '';
    const notes = plan.note ? `Additional notes: ${plan.note}\n` : '';
    
    const placesInfo = plan.places.map(place => 
      `- ${place.name} (${place.start_date} to ${place.end_date})${place.note ? `\n  Note: ${place.note}` : ''}`
    ).join('\n');

    return `Please create a detailed travel itinerary for ${plan.people_count} people.
Trip dates: ${plan.start_date} to ${plan.end_date}
${preferences}${notes}
Places to visit:
${placesInfo}

Please provide a detailed day-by-day itinerary for each place, including:
- Specific times for each activity
- Full addresses for all locations
- Detailed descriptions of activities
- Dining recommendations for each day (breakfast, lunch, dinner)
- Consider travel time between activities
- Account for opening hours and best times to visit
- Include local cultural experiences and hidden gems
- Consider the number of people when suggesting activities and restaurants

The response should be in JSON format matching the specified schema.`;
  }
} 