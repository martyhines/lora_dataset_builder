import { ImageService } from './imageService';
import type { CaptionCandidate } from '../types';

export class UserCaptionService {
  /**
   * Add a user-generated caption to an image
   * This creates a third caption option alongside the AI-generated ones
   */
  static async addUserCaption(imageId: string, userCaption: string): Promise<boolean> {
    try {
      // Get current candidates
      const imageDoc = await ImageService.getImageById(imageId);
      if (!imageDoc) {
        throw new Error('Image not found');
      }

      // Create user caption candidate
      const userCandidate: CaptionCandidate = {
        modelId: 'user:artistic',
        caption: userCaption,
        createdAt: Date.now(),
        latencyMs: 0,
        tokensUsed: 0,
        error: undefined
      };

      // Add user caption to existing candidates
      const updatedCandidates = [...imageDoc.candidates, userCandidate];

      // Update the image with all three captions
      await ImageService.updateImageCandidates(imageId, updatedCandidates);

      return true;
    } catch (error) {
      console.error('Failed to add user caption:', error);
      return false;
    }
  }

  /**
   * Get all available captions for an image (AI + User)
   */
  static async getImageCaptions(imageId: string): Promise<CaptionCandidate[]> {
    try {
      const imageDoc = await ImageService.getImageById(imageId);
      return imageDoc?.candidates || [];
    } catch (error) {
      console.error('Failed to get image captions:', error);
      return [];
    }
  }

  /**
   * Check if an image already has a user caption
   */
  static async hasUserCaption(imageId: string): Promise<boolean> {
    try {
      const captions = await this.getImageCaptions(imageId);
      return captions.some(c => c.modelId === 'user:artistic');
    } catch (error) {
      console.error('Failed to check user caption:', error);
      return false;
    }
  }
}
