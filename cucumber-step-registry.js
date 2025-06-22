// This file creates explicit step mappings for Cucumber VSCode extensions
// It re-exports all steps in a more recognizable format

const steps = {};

// Device steps
steps['I am using a {string} device'] = true;

// Authentication steps  
steps['I am not logged in'] = true;
steps['I am logged in to Spotify'] = true;

// Navigation steps
steps['I am on the {string} page'] = true;
steps['I visit the {string} page'] = true;
steps['I visit the queue page'] = true;

// Artist management steps
steps['I enter artist names {string}'] = true;
steps['I add another artist field'] = true;
steps['I should see {int} artist input fields'] = true;

// Settings steps
steps['I open the settings dialog'] = true;
steps['I close the settings dialog'] = true;
steps['I should see the settings dialog'] = true;
steps['the settings dialog should be closed'] = true;
steps['I change the playlist multiplier to {int}'] = true;
steps['the playlist multiplier should be {int}'] = true;

// Responsive design steps
steps['the page should be responsive on {string}'] = true;

// Error handling steps
steps['the network is unavailable'] = true;
steps['I trigger a network request'] = true;
steps['I should see an error message'] = true;

// Loading states
steps['I should see a loading indicator'] = true;

// Queue management steps
steps['I have a current queue with tracks'] = true;
steps['I remove a track from the queue'] = true;
steps['I remove multiple tracks from the queue'] = true;
steps['I remove all tracks from the queue'] = true;
steps['I generate a playlist'] = true;
steps['I generate an extended playlist'] = true;
steps['I switch to extend mode'] = true;

// Queue verification steps
steps['I should see queue functionality'] = true;
steps['the removed track should not be included in the playlist generation request'] = true;
steps['I should see an alternative playlist based on remaining tracks'] = true;
steps['the removed track should not be included in the enhancement request'] = true;
steps['I should see an extended playlist based on remaining tracks'] = true;
steps['none of the removed tracks should be included in the playlist generation request'] = true;

// New steps
steps['I remove multiple tracks from the alternative playlist'] = true;
steps['the removed tracks should not be included in subsequent playlist requests'] = true;
steps['the track should be included in the playlist generation request'] = true;
steps['I should see a message about empty queue or a default playlist'] = true;
steps['I refresh the page'] = true;
steps['the removed track should still not be visible in the queue'] = true;
steps['I regenerate the playlist'] = true;
steps['I should see fresh recommendations replacing the removed tracks'] = true;
steps['I undo the track removal'] = true;
steps['the track should be visible in the queue again'] = true;

module.exports = steps;
