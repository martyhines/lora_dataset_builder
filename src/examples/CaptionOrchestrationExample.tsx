import React from 'react';
import { useImages, useCaptionGeneration, useAutoCaptionGeneration } from '../hooks';

/**
 * Example component demonstrating the Caption Orchestration System
 * This shows how to use the hooks together for automatic caption generation
 */
export function CaptionOrchestrationExample() {
  const { images, loading, error } = useImages();
  const {
    generateCaptions,
    regenerateCaptions,
    isGenerating,
    generationStatuses,
    getGenerationStats
  } = useCaptionGeneration();

  const {
    isAutoGenerating,
    triggerManualGeneration,
    getAutoGenerationStats,
    resetProcessedImages
  } = useAutoCaptionGeneration(images, {
    enabled: true,
    providers: ['openai', 'gemini'],
    batchSize: 5,
    delay: 1000
  });

  const stats = getGenerationStats();
  const autoStats = getAutoGenerationStats();

  if (loading) {
    return <div>Loading images...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Caption Orchestration System</h1>
      
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Generation Statistics</h3>
          <div className="space-y-1 text-sm">
            <div>Total: {stats.total}</div>
            <div>Processing: {stats.processing}</div>
            <div>Complete: {stats.complete}</div>
            <div>Error: {stats.error}</div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Auto-Generation Status</h3>
          <div className="space-y-1 text-sm">
            <div>Total Images: {autoStats.totalImages}</div>
            <div>Pending: {autoStats.pendingGeneration}</div>
            <div>Processing: {isAutoGenerating ? 'Yes' : 'No'}</div>
            <div>Has Error: {autoStats.hasError ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => resetProcessedImages()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isGenerating || isAutoGenerating}
        >
          Reset Auto-Generation
        </button>
        
        <button
          onClick={() => {
            const pendingImages = images.filter(img => 
              img.status === 'pending' || img.candidates.length === 0
            );
            if (pendingImages.length > 0) {
              triggerManualGeneration(pendingImages.map(img => img.id));
            }
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={isGenerating || isAutoGenerating}
        >
          Trigger Manual Generation
        </button>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => {
          const generationStatus = generationStatuses.find(s => s.imageId === image.id);
          
          return (
            <div key={image.id} className="border rounded-lg p-4">
              <img
                src={image.downloadURL}
                alt={image.filename}
                className="w-full h-32 object-cover rounded mb-2"
              />
              
              <div className="text-sm space-y-1">
                <div className="font-medium">{image.filename}</div>
                <div>Status: <span className={getStatusColor(image.status)}>{image.status}</span></div>
                <div>Candidates: {image.candidates.length}</div>
                
                {generationStatus && (
                  <div className="text-xs bg-gray-50 p-2 rounded">
                    <div>Providers: {generationStatus.completedProviders}/{generationStatus.totalProviders}</div>
                    <div>Failed: {generationStatus.failedProviders}</div>
                    {generationStatus.errors.length > 0 && (
                      <div className="text-red-600">Errors: {generationStatus.errors.length}</div>
                    )}
                  </div>
                )}
                
                {image.candidates.length > 0 && (
                  <div className="space-y-1">
                    <div className="font-medium text-xs">Captions:</div>
                    {image.candidates.map((candidate, idx) => (
                      <div key={idx} className="text-xs bg-blue-50 p-1 rounded">
                        <div className="font-medium">{candidate.modelId}</div>
                        <div className="truncate">{candidate.caption}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => generateCaptions(image)}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={isGenerating || image.status === 'processing'}
                  >
                    Generate
                  </button>
                  
                  {image.candidates.length > 0 && (
                    <button
                      onClick={() => regenerateCaptions(image.id)}
                      className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                      disabled={isGenerating || image.status === 'processing'}
                    >
                      Regenerate
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No images uploaded yet. Upload some images to see the caption orchestration in action!
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'text-yellow-600';
    case 'processing': return 'text-blue-600';
    case 'complete': return 'text-green-600';
    case 'error': return 'text-red-600';
    default: return 'text-gray-600';
  }
}