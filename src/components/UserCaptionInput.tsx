import React, { useState, useEffect } from 'react';
import { UserCaptionService } from '../services/userCaptionService';
import type { CaptionCandidate } from '../types';

interface UserCaptionInputProps {
  imageId: string;
  onCaptionAdded?: (caption: string) => void;
}

export const UserCaptionInput: React.FC<UserCaptionInputProps> = ({
  imageId,
  onCaptionAdded
}) => {
  const [userCaption, setUserCaption] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [existingCaptions, setExistingCaptions] = useState<CaptionCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCaptions();
  }, [imageId]);

  const loadCaptions = async () => {
    try {
      const captions = await UserCaptionService.getImageCaptions(imageId);
      setExistingCaptions(captions);
    } catch (error) {
      console.error('Failed to load captions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCaption.trim()) return;

    setIsAdding(true);
    try {
      const success = await UserCaptionService.addUserCaption(imageId, userCaption.trim());
      if (success) {
        setUserCaption('');
        await loadCaptions(); // Reload captions
        onCaptionAdded?.(userCaption.trim());
      }
    } catch (error) {
      console.error('Failed to add user caption:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const hasUserCaption = existingCaptions.some(c => c.modelId === 'user:artistic');

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-3"></div>
          <div className="h-24 bg-gray-700 rounded mb-3"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <span className="text-purple-400 mr-2">✨</span>
        Add Your Artistic Caption
      </h3>
      
      {hasUserCaption ? (
        <div className="text-green-400 text-sm mb-3">
          ✅ You've already added your artistic caption for this image
        </div>
      ) : (
        <div className="text-blue-300 text-sm mb-3">
          💡 Add your own artistic description to complement the AI captions
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={userCaption}
          onChange={(e) => setUserCaption(e.target.value)}
          placeholder="Describe this image in your own artistic words... (e.g., 'A defiant figure standing against the rain, representing creative resistance')"
          className="w-full h-24 px-3 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          disabled={isAdding || hasUserCaption}
        />
        
        <button
          type="submit"
          disabled={!userCaption.trim() || isAdding || hasUserCaption}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAdding ? 'Adding...' : hasUserCaption ? 'Caption Added' : 'Add My Caption'}
        </button>
      </form>

      {existingCaptions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-500/30">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Current Captions:</h4>
          <div className="space-y-2">
            {existingCaptions.map((caption, index) => (
              <div key={index} className="text-sm">
                <span className="text-purple-400 font-medium">
                  {caption.modelId === 'user:artistic' ? '🎨 Your Caption:' : 
                   caption.modelId.includes('openai') ? '🤖 OpenAI:' : '🧠 Gemini:'}
                </span>
                <span className="text-gray-300 ml-2">{caption.caption}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
