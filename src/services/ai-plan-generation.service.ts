import type { GeneratePlanCommand, GeneratePlanResponseDTO, PlanDetailDTO, GeneratedPlanDTO } from '../types';
import { ValidationError, ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';
import { supabase } from '../db/supabase.client';
import { logger } from '../utils/logger';
import type { Database, Json } from '../db/database.types';

// Mock data for testing
const MOCK_GENERATED_PLAN: GeneratedPlanDTO = {
  id: 'mock-gen-1',
  content: {
    version: '1.0',
    places: [
      {
        name: 'Paris',
        days: [
          {
            date: '2024-03-20',
            schedule: [
              {
                time: '09:00',
                activity: 'Visit the Eiffel Tower',
                address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
                description: 'Start your day with a visit to the iconic Eiffel Tower. Consider going early to avoid crowds.',
                image_url: 'https://example.com/eiffel.jpg'
              },
              {
                time: '12:00',
                activity: 'Lunch at Le Jules Verne',
                address: 'Avenue Gustave Eiffel, 75007 Paris',
                description: 'Enjoy a luxurious lunch with panoramic views of Paris.',
                image_url: 'https://example.com/jules-verne.jpg'
              }
            ],
            dining_recommendations: [
              {
                type: 'lunch',
                name: 'Le Jules Verne',
                address: 'Avenue Gustave Eiffel, 75007 Paris',
                description: 'Michelin-starred restaurant with panoramic views',
                image_url: 'https://example.com/jules-verne.jpg'
              }
            ]
          }
        ]
      }
    ]
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export class AIPlanGenerationService {
  async initializeGeneration(command: GeneratePlanCommand): Promise<GeneratePlanResponseDTO> {
    logger.info('Initializing plan generation', { planId: command.planId, userId: command.userId });
    
    // Validate the plan and user access
    await this.validatePlan(command.planId, command.userId);
    
    // Check if generation is already in progress
    const isInProgress = await this.isGenerationInProgress(command.planId);
    if (isInProgress) {
      logger.warn('Generation already in progress', { planId: command.planId });
      throw new ConflictError('Generation already in progress for this plan');
    }

    // Create generation record with mock data
    logger.debug('Creating generation record with mock data', { planId: command.planId });
    const { data: generationRecord, error } = await supabase
      .from('generated_ai_plans')
      .insert({
        plan_id: command.planId,
        status: 'processing',
        content: JSON.parse(JSON.stringify(MOCK_GENERATED_PLAN.content)) as Json
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

    // In mock implementation, we'll update the status to completed immediately
    await supabase
      .from('generated_ai_plans')
      .update({ 
        status: 'completed' as const,
        content: JSON.parse(JSON.stringify(MOCK_GENERATED_PLAN.content)) as Json
      })
      .eq('id', generationRecord.id);

    // Update user plan status to 'generated'
    const { error: updatePlanError } = await supabase
      .from('generated_user_plans')
      .update({ status: 'generated' })
      .eq('id', command.planId);

    if (updatePlanError) {
      logger.error('Failed to update plan status', { 
        planId: command.planId, 
        error: updatePlanError.message 
      });
      throw new Error('Failed to update plan status');
    }

    logger.info('Generation initialized successfully', { 
      planId: command.planId,
      generationId: generationRecord.id 
    });

    // Return immediate response
    return {
      id: generationRecord.id,
      status: 'processing',
      estimated_time: 90 // Default estimate of 90 seconds
    };
  }

  private async validatePlan(planId: string, userId: string): Promise<void> {
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
  }

  private async isGenerationInProgress(planId: string): Promise<boolean> {
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

  private async startGenerationProcess(planId: string): Promise<void> {
    logger.info('Starting mock generation process', { planId });
    // In mock implementation, we don't need to do anything here
    // The plan is already "generated" with mock data
  }
} 