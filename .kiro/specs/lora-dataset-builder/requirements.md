# Requirements Document

## Introduction

The LoRa Dataset Builder is a web-based tool that streamlines the creation of LoRa training datasets. Users can upload images, receive AI-generated captions from multiple vision models, select their preferred captions, and export a structured JSON dataset. The application is built as a responsive single-page app with real-time updates and anonymous authentication to minimize friction.

## Requirements

### Requirement 1: Image Upload and Management

**User Story:** As a dataset creator, I want to upload multiple images quickly and efficiently, so that I can build my training dataset without technical barriers.

#### Acceptance Criteria

1. WHEN a user drags images onto the upload zone THEN the system SHALL accept and process all valid image files
2. WHEN a user clicks the upload zone THEN the system SHALL open a file browser for image selection
3. WHEN images are being uploaded THEN the system SHALL display a progress indicator showing upload status
4. WHEN an upload completes THEN the system SHALL store the image in Firebase Storage and create a corresponding Firestore document
5. IF an upload fails THEN the system SHALL display an error message and allow retry
6. WHEN a user uploads images THEN the system SHALL support at least 100 images in a single batch without performance degradation

### Requirement 2: Multi-Model Caption Generation

**User Story:** As a dataset creator, I want to receive captions from multiple AI vision models for each image, so that I can compare and choose the best caption for my training data.

#### Acceptance Criteria

1. WHEN an image is uploaded THEN the system SHALL automatically request captions from all configured vision providers
2. WHEN caption generation is in progress THEN the system SHALL update the image status to "processing"
3. WHEN caption requests are made THEN the system SHALL call providers in parallel to minimize wait time
4. WHEN at least one provider returns a caption THEN the system SHALL mark the image as "complete"
5. IF all providers fail THEN the system SHALL mark the image as "error" and allow manual retry
6. WHEN captions are generated THEN the system SHALL store each result with provider metadata (model ID, timestamp, latency)
7. WHEN providers are configured THEN the system SHALL display at least 2 distinct model captions per image

### Requirement 3: Caption Selection and Editing

**User Story:** As a dataset creator, I want to select and edit captions for each image, so that I can curate high-quality training data that matches my specific needs.

#### Acceptance Criteria

1. WHEN captions are available THEN the system SHALL display all provider results in a selectable list
2. WHEN a user selects a caption THEN the system SHALL update the selectedIndex and persist the choice
3. WHEN a user edits a selected caption THEN the system SHALL save the changes in selectedTextOverride
4. WHEN a user reloads the page THEN the system SHALL restore their previous caption selections and edits
5. WHEN displaying captions THEN the system SHALL show the provider name and allow text expansion for long captions
6. WHEN a user wants to regenerate captions THEN the system SHALL provide options to retry individual providers or all providers

### Requirement 4: Real-time Updates and Synchronization

**User Story:** As a dataset creator, I want to see real-time updates as my images are processed, so that I can track progress and make decisions without refreshing the page.

#### Acceptance Criteria

1. WHEN image processing status changes THEN the system SHALL update the UI immediately via Firestore listeners
2. WHEN new captions arrive THEN the system SHALL display them without requiring page refresh
3. WHEN a user makes selections THEN the system SHALL persist changes to Firestore in real-time
4. WHEN multiple browser tabs are open THEN the system SHALL synchronize changes across all tabs
5. WHEN network connectivity is restored THEN the system SHALL automatically sync any pending changes

### Requirement 5: Dataset Export

**User Story:** As a dataset creator, I want to export my curated dataset as a JSON file, so that I can use it for LoRa training or other machine learning workflows.

#### Acceptance Criteria

1. WHEN the download button is visible THEN the system SHALL only show it if localStorage show_dl_button equals "true"
2. WHEN a user clicks download THEN the system SHALL generate a JSON array with url, filename, and caption fields
3. WHEN generating export data THEN the system SHALL use selectedTextOverride if available, otherwise the selected caption
4. WHEN export is triggered THEN the system SHALL download the file with a descriptive filename
5. WHEN building the dataset THEN the system SHALL include only images that have selected captions
6. WHEN export completes THEN the system SHALL maintain the original image URLs for accessibility

### Requirement 6: Image Management and Deletion

**User Story:** As a dataset creator, I want to remove unwanted images from my dataset, so that I can maintain a clean and relevant training set.

#### Acceptance Criteria

1. WHEN a user clicks delete on an image THEN the system SHALL remove both the Firestore document and Storage file
2. WHEN deletion is in progress THEN the system SHALL show a loading state and prevent duplicate actions
3. WHEN deletion completes THEN the system SHALL remove the image from the UI immediately
4. IF deletion fails THEN the system SHALL display an error message and restore the image in the UI
5. WHEN an image is deleted THEN the system SHALL update the total count and progress indicators

### Requirement 7: Anonymous Authentication and User Management

**User Story:** As a dataset creator, I want to use the application without creating an account, so that I can start building datasets immediately without signup friction.

#### Acceptance Criteria

1. WHEN a user loads the application THEN the system SHALL automatically sign them in anonymously
2. WHEN authentication completes THEN the system SHALL display the anonymous user ID in the footer
3. WHEN a user accesses data THEN the system SHALL enforce that users can only see their own images and settings
4. WHEN authentication fails THEN the system SHALL display an error and provide retry options
5. WHEN a user returns to the application THEN the system SHALL maintain their session and data access

### Requirement 8: Responsive Design and Accessibility

**User Story:** As a dataset creator using various devices, I want the application to work well on desktop and mobile, so that I can manage my datasets from anywhere.

#### Acceptance Criteria

1. WHEN viewed on different screen sizes THEN the system SHALL adapt the grid layout appropriately (1 col mobile, 2-3 tablet, 4+ desktop)
2. WHEN using keyboard navigation THEN the system SHALL provide focus states and keyboard shortcuts for all interactive elements
3. WHEN using screen readers THEN the system SHALL provide appropriate ARIA labels and semantic markup
4. WHEN UI interactions occur THEN the system SHALL respond within 100ms for 95% of client-side operations
5. WHEN the application loads THEN the system SHALL display properly in dark theme with rounded corners and subtle shadows

### Requirement 9: Error Handling and Recovery

**User Story:** As a dataset creator, I want clear feedback when things go wrong and options to recover, so that I can continue working even when individual operations fail.

#### Acceptance Criteria

1. WHEN provider API calls fail THEN the system SHALL record the error in the candidates array and continue with other providers
2. WHEN network errors occur THEN the system SHALL display toast notifications with retry options
3. WHEN upload failures happen THEN the system SHALL show specific error messages and allow individual file retry
4. WHEN all caption providers fail THEN the system SHALL display "Error generating captions" with a retry button
5. WHEN transient errors occur THEN the system SHALL implement exponential backoff for automatic retries

### Requirement 10: Performance and Scalability

**User Story:** As a dataset creator working with large image sets, I want the application to handle my workflow efficiently, so that I can process datasets quickly without performance issues.

#### Acceptance Criteria

1. WHEN processing 50 images THEN the system SHALL complete upload to export workflow within 3 minutes under normal network conditions
2. WHEN caption requests are made THEN the system SHALL achieve 95% success rate for returning at least one caption per image
3. WHEN handling large batches THEN the system SHALL process uploads and captions without blocking the UI
4. WHEN managing memory THEN the system SHALL optimize image handling to prevent browser crashes with 100+ images
5. WHEN making API calls THEN the system SHALL implement appropriate concurrency limits and rate limiting