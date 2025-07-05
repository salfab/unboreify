// cypress/support/step_definitions/index.ts
// This file ensures all step definitions are loaded
// Import all step definition files here

import './common.steps';
import './auth.steps';
import './navigation.steps';
import './app_features.steps';
import './playlist_track_removal.steps';

// Re-export for better VSCode compatibility
export * from './common.steps';
export * from './auth.steps'; 
export * from './navigation.steps';
export * from './app_features.steps';
export * from './playlist_track_removal.steps';
