// VSCode Cucumber Extension Compatibility Stubs
// This file exists solely to help VSCode Cucumber extensions recognize our step definitions
// The actual implementations are in cypress/support/step_definitions/

// Mock Cucumber functions for VSCode compatibility
function Given(pattern: string, fn: Function) {}
function When(pattern: string, fn: Function) {}
function Then(pattern: string, fn: Function) {}

// Export all step definitions in a format compatible with standard Cucumber.js
// This is for VSCode extension compatibility only

// Common steps
Given('I am using a {string} device', function(deviceType: string) {
  // This is a stub for VSCode extension compatibility
  // Actual implementation is in Cypress step definitions
});

Given('I am not logged in', function() {
  // VSCode compatibility stub
});

Given('I am logged in to Spotify', function() {
  // VSCode compatibility stub
});

Given('I am on the {string} page', function(pageName: string) {
  // VSCode compatibility stub
});

When('I visit the {string} page', function(pageName: string) {
  // VSCode compatibility stub
});

When('I enter artist names {string}', function(artistNames: string) {
  // VSCode compatibility stub
});

When('I add another artist field', function() {
  // VSCode compatibility stub
});

When('I open the settings dialog', function() {
  // VSCode compatibility stub
});

When('I close the settings dialog', function() {
  // VSCode compatibility stub
});

When('I change the playlist multiplier to {int}', function(multiplier: number) {
  // VSCode compatibility stub
});

When('I generate a playlist', function() {
  // VSCode compatibility stub
});

When('I generate an extended playlist', function() {
  // VSCode compatibility stub
});

When('I remove a track from the queue', function() {
  // VSCode compatibility stub
});

When('I remove multiple tracks from the queue', function() {
  // VSCode compatibility stub
});

When('I switch to extend mode', function() {
  // VSCode compatibility stub
});

When('I trigger a network request', function() {
  // VSCode compatibility stub
});

Then('I should see {int} artist input fields', function(count: number) {
  // VSCode compatibility stub
});

Then('I should see the settings dialog', function() {
  // VSCode compatibility stub
});

Then('the settings dialog should be closed', function() {
  // VSCode compatibility stub
});

Then('the playlist multiplier should be {int}', function(multiplier: number) {
  // VSCode compatibility stub
});

Then('the page should be responsive on {string}', function(device: string) {
  // VSCode compatibility stub
});

Then('I should see an error message', function() {
  // VSCode compatibility stub
});

Then('I should see a loading indicator', function() {
  // VSCode compatibility stub
});

Then('the removed track should not be included in the playlist generation request', function() {
  // VSCode compatibility stub
});

Then('I should see an alternative playlist based on remaining tracks', function() {
  // VSCode compatibility stub
});

Then('the removed track should not be included in the enhancement request', function() {
  // VSCode compatibility stub
});

Then('I should see an extended playlist based on remaining tracks', function() {
  // VSCode compatibility stub
});

Then('none of the removed tracks should be included in the playlist generation request', function() {
  // VSCode compatibility stub
});

Given('I have a current queue with tracks', function() {
  // VSCode compatibility stub
});

Given('the network is unavailable', function() {
  // VSCode compatibility stub
});
