# Implementation Plan

- [x] 1. Project Setup and Core Infrastructure
  - Initialize Vite + React + TypeScript project with Tailwind CSS
  - Configure Firebase SDK and environment variables
  - Set up project structure with components, hooks, services, and types directories
  - Create base dark theme configuration and global styles
  - _Requirements: 8.5, 7.1_

- [x] 2. Firebase Authentication and Security
  - Implement anonymous authentication service
  - Create authentication context and hooks
  - Set up Firestore security rules for user data isolation
  - Set up Firebase Storage security rules for user uploads
  - Create user session management and error handling
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 3. Core Data Models and Types
  - Define TypeScript interfaces for ImageDoc and CaptionCandidate
  - Create UserSettings interface and related types
  - Implement data validation functions for all models
  - Create utility functions for data transformation and sanitization
  - _Requirements: 2.6, 3.4, 4.3_

- [x] 4. Firebase Services Layer
  - Implement ImageService with CRUD operations for Firestore
  - Create real-time subscription hooks for image collections
  - Implement Firebase Storage service for image uploads
  - Add error handling and retry logic for Firebase operations
  - Create service layer tests with Firebase emulator
  - _Requirements: 1.4, 4.1, 4.2, 4.3, 6.1_

- [x] 5. Image Upload Infrastructure
  - Create UploadZone component with drag-and-drop functionality
  - Implement file validation (type, size, format checking)
  - Build upload progress tracking and batch processing
  - Add image preprocessing (client-side resizing if needed)
  - Integrate with Firebase Storage for file uploads
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 10.4_

- [x] 6. Caption Provider Proxy API
  - Set up Cloud Function or Cloud Run service for caption proxy
  - Implement OpenAI GPT-4V integration with error handling
  - Implement Google Gemini Vision integration
  - Create extensible provider interface for future models
  - Add request validation, rate limiting, and timeout handling
  - _Requirements: 2.1, 2.2, 2.6, 9.1, 9.4_

- [x] 7. Caption Orchestration System
  - Create CaptionOrchestrator service for parallel provider calls
  - Implement caption generation workflow with status updates
  - Add retry logic and partial success handling
  - Create hooks for triggering and monitoring caption generation
  - Integrate with Firestore for real-time status updates
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.2_

- [x] 8. Image Gallery and Display Components
  - Create responsive GalleryGrid component with CSS Grid
  - Implement ImageCard component with preview and status display
  - Add loading states and error boundaries for image rendering
  - Create real-time listener integration for live updates
  - Implement virtualized scrolling for large image sets
  - _Requirements: 4.1, 4.2, 8.1, 8.4, 10.4_

- [x] 9. Caption Selection and Editing Interface
  - Create CaptionSelector component with radio button selection
  - Implement editable textarea for caption customization
  - Add caption expansion/truncation for long text
  - Create provider metadata display (model name, timing, etc.)
  - Integrate selection persistence with Firestore updates
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Caption Regeneration and Management
  - Add regenerate functionality for individual providers
  - Implement bulk regeneration for all providers
  - Create retry mechanisms for failed caption requests
  - Add manual caption entry when all providers fail
  - Integrate regeneration with existing caption orchestration
  - _Requirements: 3.6, 9.4, 9.5_

- [x] 11. Image Deletion and Cleanup
  - Implement delete functionality for ImageCard component
  - Create transactional deletion (Firestore + Storage cleanup)
  - Add confirmation dialogs and loading states for deletion
  - Implement error handling and rollback for failed deletions
  - Add batch deletion capabilities if needed
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Dataset Export Functionality
  - Create export service to generate JSON dataset format
  - Implement localStorage-gated download button visibility
  - Add dataset generation logic using selected captions and overrides
  - Create file download functionality with proper naming
  - Add export progress indication for large datasets
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 13. Error Handling and User Feedback
  - Implement global error boundary with fallback UI
  - Create toast notification system for transient errors
  - Add specific error states for different failure scenarios
  - Implement retry mechanisms with exponential backoff
  - Create error recovery flows for network and API failures
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 14. Performance Optimization and Monitoring
  - Implement image lazy loading and progressive enhancement
  - Add React.memo and useMemo optimizations for expensive operations
  - Create performance monitoring hooks for key metrics
  - Optimize Firestore queries and implement proper indexing
  - Add client-side caching for frequently accessed data
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 15. Accessibility and Keyboard Navigation
  - Add ARIA labels and semantic markup to all interactive elements
  - Implement keyboard navigation for image selection and caption editing
  - Create focus management for modal dialogs and dynamic content
  - Add screen reader support for status updates and progress indicators
  - Test and fix high contrast mode compatibility
  - _Requirements: 8.2, 8.3_

- [x] 16. Application Shell and Layout
  - Create main App component with authentication wrapper
  - Implement header with title and subtitle
  - Create responsive layout with proper spacing and typography
  - Add footer with anonymous user ID display
  - Integrate dark theme throughout the application
  - _Requirements: 7.2, 8.1, 8.5_

- [x] 17. Toolbar and Global Actions
  - Create Toolbar component with export button
  - Implement localStorage integration for download button visibility
  - Add global statistics display (total images, completed captions)
  - Create batch action capabilities (select all, clear all)
  - Integrate with export functionality
  - _Requirements: 5.1, 5.4_

- [x] 18. Real-time Synchronization and State Management
  - Implement Firestore real-time listeners for all data collections
  - Create state synchronization across browser tabs
  - Add offline support with local state persistence
  - Implement conflict resolution for concurrent edits
  - Create connection status monitoring and recovery
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 19. Build Configuration and Deployment
  - Configure Vite build process with environment variable injection
  - Set up GitHub Pages deployment with gh-pages package
  - Create production Firebase project and configure security rules
  - Deploy caption proxy API to Cloud Functions or Cloud Run
  - Configure CORS and domain settings for production
  - _Requirements: Build & Deploy section_

- [x] 20. Testing and Quality Assurance
  - Write unit tests for all custom hooks and utility functions
  - Create integration tests for Firebase operations using emulator
  - Implement end-to-end tests for critical user workflows
  - Add performance testing for large image batch scenarios
  - Create accessibility testing with automated tools
  - _Requirements: 1.6, 8.2, 10.1, 10.2_

- [x] 21. Documentation and Final Polish
  - Create comprehensive README with setup and deployment instructions
  - Document environment variable configuration
  - Add inline code documentation and TypeScript types
  - Create user guide for adding new vision providers
  - Implement final UI polish and responsive design refinements
  - _Requirements: All requirements validation_