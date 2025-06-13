import { logger } from '../utils/logger';

const GOOGLE_API_KEY = import.meta.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_PLACES_API_KEY environment variable');
}

export class GooglePlacesService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = GOOGLE_API_KEY;
  }

  async getPlacePhoto(query: string, location?: string): Promise<string> {
    try {
      // First try to get a photo using Place Search and Place Details
      const placeId = await this.findPlace(query, location);
      if (placeId) {
        const photoUrl = await this.getPhotoByPlaceId(placeId);
        if (photoUrl) {
          return photoUrl;
        }
      }

      // If no photo found, try Place Photos API with textual search
      const photoSearchUrl = await this.searchPlacePhotos(query, location);
      if (photoSearchUrl) {
        return photoSearchUrl;
      }
      
      logger.debug('No photo found for place, using default', { query, location });
      return this.getDefaultPhoto(query);
    } catch (error) {
      logger.error('Failed to get place photo', { query, error });
      return this.getDefaultPhoto(query);
    }
  }

  private async findPlace(query: string, location?: string): Promise<string | null> {
    const params = new URLSearchParams({
      input: `${query}${location ? ` ${location}` : ''}`,
      inputtype: 'textquery',
      key: this.apiKey,
      fields: 'place_id,photos'
    });

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`
      );

      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'ZERO_RESULTS') {
        logger.debug('No places found for query', { query, location });
        return null;
      }

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.candidates?.[0]?.place_id || null;
    } catch (error) {
      logger.error('Failed to find place', { query, location, error });
      return null;
    }
  }

  private async getPhotoByPlaceId(placeId: string): Promise<string | null> {
    const params = new URLSearchParams({
      place_id: placeId,
      key: this.apiKey,
      fields: 'photos'
    });

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?${params}`
      );

      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK' || !data.result?.photos?.[0]?.photo_reference) {
        return null;
      }

      const photoReference = data.result.photos[0].photo_reference;
      return this.buildPhotoUrl(photoReference);
    } catch (error) {
      logger.error('Failed to get place details', { placeId, error });
      return null;
    }
  }

  private async searchPlacePhotos(query: string, location?: string): Promise<string | null> {
    const params = new URLSearchParams({
      query: `${query}${location ? ` ${location}` : ''}`,
      key: this.apiKey,
      type: 'photo'
    });

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
      );

      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results?.[0]?.photos?.[0]?.photo_reference) {
        return null;
      }

      const photoReference = data.results[0].photos[0].photo_reference;
      return this.buildPhotoUrl(photoReference);
    } catch (error) {
      logger.error('Failed to search place photos', { query, location, error });
      return null;
    }
  }

  private buildPhotoUrl(photoReference: string): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  private getDefaultPhoto(type: string): string {
    const defaults: Record<string, string> = {
      restaurant: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png',
      cafe: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/cafe-71.png',
      museum: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/museum-71.png',
      church: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/worship_general-71.png',
      park: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/park-71.png',
      castle: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png',
      hotel: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/lodging-71.png',
      shopping: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/shopping-71.png',
      landmark: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png',
      default: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png'
    };

    const lowercaseType = type.toLowerCase();
    for (const [key, url] of Object.entries(defaults)) {
      if (lowercaseType.includes(key)) {
        return url;
      }
    }

    return defaults.default;
  }
} 