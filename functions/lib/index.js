"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.captionProxy = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const app_1 = __importDefault(require("./app"));
// Set global options for all functions
(0, v2_1.setGlobalOptions)({
    maxInstances: 10,
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60
});
// Export the Express app as a Cloud Function
exports.captionProxy = (0, https_1.onRequest)({
    cors: true,
    enforceAppCheck: false, // Set to true if using App Check
    invoker: 'public' // Allow public access, but rate limited
}, app_1.default);
// Export individual functions for testing
var app_2 = require("./app");
Object.defineProperty(exports, "app", { enumerable: true, get: function () { return __importDefault(app_2).default; } });
//# sourceMappingURL=index.js.map