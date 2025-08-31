import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import app from './app';

// Set global options for all functions
setGlobalOptions({
  maxInstances: process.env.NODE_ENV === 'production' ? 50 : 10,
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 120
});

// Export the Express app as a Cloud Function
export const captionProxy = onRequest(
  {
    cors: process.env.NODE_ENV === 'production' 
      ? ['https://martyhines.github.io', 'https://lora-dataset-builder.github.io']
      : true,
    enforceAppCheck: false, // Set to true if using App Check
    invoker: 'public', // Allow public access, but rate limited
    concurrency: process.env.NODE_ENV === 'production' ? 100 : 10
  },
  app
);

// Export individual functions for testing
export { default as app } from './app';