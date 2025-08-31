import { useState } from 'react';
import { Gallery, UploadZone, GlobalErrorBoundary, Toolbar } from './components';
import { SyncStatus } from './components/SyncStatus';
import { ToastProvider } from './hooks/useToast';
import { useImages } from './hooks/useImages';
import { useUpload } from './hooks/useUpload';
import { useCaptionGeneration } from './hooks/useCaptionGeneration';

// Calculate stats for display
function calculateStats(images: any[]) {
  if (!images || !Array.isArray(images)) {
    return { total: 0, withCaptions: 0, needsRetry: 0 };
  }
  return {
    total: images.length,
    withCaptions: images.filter(img => img.candidates && img.candidates.length > 0).length,
    needsRetry: images.filter(img => img.status === 'error').length
  };
}

function AppContent() {
  const { images, batchDeleteImages } = useImages();
  const { uploadFiles, isUploading, overallProgress } = useUpload();
  const { isGenerating } = useCaptionGeneration();
  
  // Local state
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  // Calculate stats
  const stats = calculateStats(images);

  // Event handlers
  const handleFilesSelected = async (files: FileList) => {
    try {
      await uploadFiles(files);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleImageRegenerate = async (imageId: string, providers?: string[]) => {
    console.log('Regenerating captions for image:', imageId, 'with providers:', providers);
    // Implementation would go here
  };

  const handleProviderRegenerate = async (imageId: string, modelId: string) => {
    console.log('Regenerating caption for image:', imageId, 'with model:', modelId);
    // Implementation would go here
  };

  const handleBatchSelectionChange = (imageIds: string[]) => {
    setSelectedImageIds(imageIds);
  };

  const handleBatchDelete = async (imageIds: string[]) => {
    try {
      const result = await batchDeleteImages(imageIds);
      console.log('Batch delete result:', result);
      setSelectedImageIds([]);
      setSelectionMode(false);
      return result;
    } catch (error) {
      console.error('Batch delete failed:', error);
      return { successful: [], failed: [{ imageId: '', error: 'Batch delete failed' }] };
    }
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedImageIds([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700/50 shadow-2xl sticky top-0 z-50" role="banner">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">🎨</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    LoRa Dataset Builder
                  </h1>
                  <p className="text-slate-400 text-sm font-medium">AI-Powered Image Management</p>
                </div>
              </div>
            </div>
          
            {/* Sync Status */}
            <SyncStatus className="flex-shrink-0" />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Overview - Modern Cards */}
        {stats.total > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            <div className="group bg-gradient-to-br from-blue-500/10 to-blue-600/20 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm hover:from-blue-500/20 hover:to-blue-600/30 hover:border-blue-400/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-blue-300 text-sm font-semibold uppercase tracking-wide">Total Images</div>
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 text-lg">📊</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-blue-100 mb-1">{stats.total}</div>
              <div className="text-blue-300/70 text-xs">Images uploaded</div>
            </div>
            
            <div className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm hover:from-emerald-500/20 hover:to-emerald-600/30 hover:border-emerald-400/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-emerald-300 text-sm font-semibold uppercase tracking-wide">With Captions</div>
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-400 text-lg">✅</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-emerald-100 mb-1">{stats.withCaptions}</div>
              <div className="text-emerald-300/70 text-xs">Ready for training</div>
            </div>
            
            <div className="group bg-gradient-to-br from-amber-500/10 to-amber-600/20 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-sm hover:from-amber-500/20 hover:to-amber-600/30 hover:border-amber-400/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-amber-300 text-sm font-semibold uppercase tracking-wide">Processing</div>
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-amber-400 text-lg">⏳</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-amber-100 mb-1">{stats.total - stats.withCaptions}</div>
              <div className="text-amber-300/70 text-xs">Awaiting captions</div>
            </div>
            
            <div className="group bg-gradient-to-br from-red-500/10 to-red-600/20 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm hover:from-red-500/20 hover:to-red-600/30 hover:border-red-400/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-red-300 text-sm font-semibold uppercase tracking-wide">Need Retry</div>
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400 text-lg">⚠️</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-red-100 mb-1">{stats.needsRetry}</div>
              <div className="text-red-300/70 text-xs">Require attention</div>
            </div>
          </section>
        )}

        {/* Toolbar Section */}
        <section 
          id="toolbar-section" 
          className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 shadow-lg" 
          aria-labelledby="toolbar-section-title"
        >
          <h2 id="toolbar-section-title" className="sr-only">Toolbar</h2>
          <Toolbar 
            images={images || []}
            selectedImageIds={selectedImageIds}
            onBatchSelectionChange={handleBatchSelectionChange}
            onBatchDelete={handleBatchDelete}
            selectionMode={selectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
          />
        </section>
        
        {/* Upload Section */}
        <section 
          id="upload-section" 
          className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-fade-in" 
          aria-labelledby="upload-section-title"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📤</span>
            </div>
            <div>
              <h2 id="upload-section-title" className="text-2xl md:text-3xl font-bold text-white">
                Upload Images
              </h2>
              <p className="text-slate-400 text-sm">Drag and drop or click to select images for your dataset</p>
            </div>
          </div>
          <UploadZone
            onFilesSelected={handleFilesSelected}
            isUploading={isUploading}
            progress={overallProgress}
          />
        </section>
        
        {/* Caption Generation Status */}
        {isGenerating && (
          <section 
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-label="Caption generation status"
          >
            <div className="flex items-center gap-4 text-blue-300">
              <div className="animate-spin rounded-full h-6 w-6 border-3 border-blue-400 border-t-transparent" aria-hidden="true"></div>
              <span className="text-lg font-medium">Generating captions...</span>
            </div>
          </section>
        )}
        
        {/* Debug Section - Development Only */}
        {import.meta.env.DEV && (
          <section className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-yellow-300 font-semibold mb-4 text-lg flex items-center">
              <span className="mr-2">🔧</span>
              Debug Tools (Development Only)
            </h3>
            <div className="space-y-4">
              {/* Debug Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-yellow-900/20 rounded-lg p-3">
                  <div className="text-yellow-200 font-medium">Images Count</div>
                  <div className="font-mono text-white text-lg">{images?.length || 0}</div>
                </div>
                <div className="bg-yellow-900/20 rounded-lg p-3">
                  <div className="text-yellow-200 font-medium">Loading State</div>
                  <div className="text-lg font-mono text-white">{(images?.length || 0) === 0 ? 'No images loaded' : 'Images loaded'}</div>
                </div>
              </div>
              
              {/* Debug Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    try {
                      const { db } = await import('./services/firebase');
                      const { collection, addDoc } = await import('firebase/firestore');
                      const testDoc = await addDoc(collection(db, 'images'), {
                        filename: 'test-image.jpg',
                        storagePath: 'test/test-image.jpg',
                        downloadURL: 'https://picsum.photos/400/300?random=1',
                        status: 'complete',
                        candidates: [
                          {
                            modelId: 'test-model',
                            caption: 'A beautiful test image for demonstration purposes',
                            createdAt: Date.now(),
                            latencyMs: 1500,
                            tokensUsed: 25,
                            error: null
                          }
                        ],
                        selectedIndex: 0,
                        selectedTextOverride: null,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                      });
                      console.log('✅ Test document created:', testDoc.id);
                      alert(`Test document created with ID: ${testDoc.id}`);
                    } catch (error) {
                      console.error('❌ Failed to create test document:', error);
                      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  Create Test Image
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { db } = await import('./services/firebase');
                      const { collection, getDocs } = await import('firebase/firestore');
                      const snapshot = await getDocs(collection(db, 'images'));
                      console.log('📊 Images collection has', snapshot.docs.length, 'documents');
                      alert(`Images collection has ${snapshot.docs.length} documents`);
                    } catch (error) {
                      console.error('❌ Failed to read images collection:', error);
                      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  Check Images Collection
                </button>
              </div>
            </div>
          </section>
        )}
        
        {/* Gallery Section */}
        <section id="gallery-section" aria-labelledby="gallery-section-title" className="space-y-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🖼️</span>
              </div>
              <div>
                <h2 id="gallery-section-title" className="text-2xl md:text-3xl font-bold text-white">
                  Your Images
                </h2>
                <p className="text-slate-400 text-sm">Manage and organize your dataset images</p>
              </div>
            </div>
            {stats.total > 0 && (
              <div className="flex items-center space-x-6 text-sm" role="status" aria-live="polite">
                <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 font-medium">{stats.withCaptions}/{stats.total} captioned</span>
                </div>
                {stats.needsRetry > 0 && (
                  <div className="flex items-center space-x-2 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-amber-300 font-medium">{stats.needsRetry} need retry</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <Gallery 
              onImageRegenerate={handleImageRegenerate}
              onRegenerateProvider={handleProviderRegenerate}
              selectedImageIds={selectedImageIds}
              onBatchSelectionChange={handleBatchSelectionChange}
              onBatchDelete={handleBatchDelete}
              selectionMode={selectionMode}
              onToggleSelectionMode={handleToggleSelectionMode}
            />
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-800/90 backdrop-blur-md border-t border-slate-700/50 mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎨</span>
              </div>
              <span className="text-slate-300 font-semibold">LoRa Dataset Builder</span>
            </div>
            <p className="text-slate-400 text-sm mb-2">
              Professional image management and AI-powered caption generation for machine learning datasets by Marty Hines
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
              {/* <span>Built with React</span>
              <span>•</span>
              <span>Powered by Firebase</span>
              <span>•</span>
              <span>Modern Web Technologies</span> */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
