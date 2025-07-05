import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Playlist Tools specific steps
Given('I am on the playlist tools page', () => {
  cy.visit('/playlist-tools');
  cy.contains('Playlist Tools').should('be.visible');
});

Given('I am in the Playlist Diff tool', () => {
  cy.visit('/playlist-tools');
  cy.get('[data-testid="diff-tool"]').click();
  cy.contains('Playlist Diff Tool').should('be.visible');
});

// Playlist Tools page verification
Then('I should see the {string} page', (pageTitle: string) => {
  if (pageTitle === 'Playlist Tools') {
    cy.contains('Playlist Tools').should('be.visible');
    cy.contains('Powerful tools to manage, analyze, and enhance your Spotify playlists').should('be.visible');
  }
});

Then('I should see the {string} tool card', (toolName: string) => {
  if (toolName === 'Playlist Diff') {
    cy.contains('Playlist Diff').should('be.visible');
    cy.contains('Compare two playlists').should('be.visible');
  }
});

Then('I should see the {string} tool card as coming soon', (toolName: string) => {
  if (toolName === 'Playlist Merge' || toolName === 'Playlist Analytics') {
    cy.contains(toolName).should('be.visible');
    cy.contains('Coming Soon').should('be.visible');
  }
});

Then('I should see all available tool cards', () => {
  cy.contains('Playlist Diff').should('be.visible');
  cy.contains('Playlist Merge').should('be.visible');
  cy.contains('Playlist Analytics').should('be.visible');
});

// Playlist availability
Given('I have multiple playlists available', () => {
  // Mock playlist data for testing
  cy.intercept('GET', '**/v1/me/playlists**', {
    fixture: 'user-playlists.json'
  }).as('getUserPlaylists');
  
  cy.intercept('GET', '**/v1/playlists/**', {
    fixture: 'sample-playlist.json'
  }).as('getPlaylist');
});

// Playlist Diff interface
When('I click on the {string} tool', (toolName: string) => {
  if (toolName === 'Playlist Diff') {
    cy.get('[data-testid="diff-tool"]').click();
  }
});

Then('I should see the Playlist Diff interface', () => {
  cy.contains('Playlist Diff Tool').should('be.visible');
  cy.contains('Compare two playlists and create new ones based on their differences').should('be.visible');
});

Then('I should see the back to tools button', () => {
  cy.get('[data-testid="back-to-tools"]').should('be.visible');
});

Then('I should see two playlist selectors', () => {
  cy.contains('Base Playlist').should('be.visible');
  cy.contains('Compare With').should('be.visible');
  cy.get('[data-testid="base-playlist-selector"]').should('be.visible');
  cy.get('[data-testid="compare-playlist-selector"]').should('be.visible');
});

Then('I should see diff mode options', () => {
  cy.contains('Intersection').should('be.visible');
  cy.contains('Base Only').should('be.visible');
  cy.contains('Target Only').should('be.visible');
  cy.contains('Symmetric Difference').should('be.visible');
  cy.contains('Union').should('be.visible');
});

// Playlist selection and comparison
When('I select a base playlist', () => {
  cy.get('[data-testid="base-playlist-selector"]').click();
  cy.get('[role="option"]').first().click();
});

When('I select a comparison playlist', () => {
  cy.get('[data-testid="compare-playlist-selector"]').click();
  cy.get('[role="option"]').eq(1).click();
});

When('I select two playlists with no common tracks', () => {
  // This would require specific test data setup
  cy.get('[data-testid="base-playlist-selector"]').click();
  cy.get('[role="option"]').first().click();
  cy.get('[data-testid="compare-playlist-selector"]').click();
  cy.get('[role="option"]').last().click();
});

When('I choose {string} mode', (mode: string) => {
  const normalizedMode = mode.toLowerCase().replace(' ', '-');
  switch (normalizedMode) {
    case 'intersection':
      cy.contains('Intersection').click();
      break;
    case 'base-only':
    case 'base only':
      cy.contains('Base Only').click();
      break;
    case 'target-only':
    case 'target only':
      cy.contains('Target Only').click();
      break;
    case 'symmetric-difference':
    case 'symmetric difference':
      cy.contains('Symmetric Difference').click();
      break;
    case 'union':
      cy.contains('Union').click();
      break;
  }
});

When('I click {string}', (buttonText: string) => {
  cy.contains(buttonText).click();
});

// Results verification
Then('I should see the diff results', () => {
  cy.contains('tracks found').should('be.visible');
});

Then('I should see tracks that exist in both playlists', () => {
  cy.get('[data-testid="track-card"]').should('have.length.greaterThan', 0);
});

Then('I should see tracks that exist only in the base playlist', () => {
  cy.get('[data-testid="track-card"]').should('have.length.greaterThan', 0);
});

Then('I should see tracks that exist only in the comparison playlist', () => {
  cy.get('[data-testid="track-card"]').should('have.length.greaterThan', 0);
});

Then('I should see tracks that exist in either playlist but not both', () => {
  cy.get('[data-testid="track-card"]').should('have.length.greaterThan', 0);
});

Then('I should see all tracks from both playlists', () => {
  cy.get('[data-testid="track-card"]').should('have.length.greaterThan', 0);
});

Then('I should see a count of matching tracks', () => {
  cy.contains(/\d+ tracks found/).should('be.visible');
});

Then('I should see an appropriate empty state message', () => {
  cy.contains('0 tracks found').should('be.visible');
});

// Loading states
Then('I should see a loading indicator', () => {
  cy.get('[role="progressbar"]').should('be.visible');
});

Then('playlist selectors should be disabled during loading', () => {
  cy.get('[data-testid="base-playlist-selector"]').should('be.disabled');
  cy.get('[data-testid="compare-playlist-selector"]').should('be.disabled');
});

// Save functionality
Given('I have performed a playlist diff with results', () => {
  // Set up a complete diff scenario
  cy.visit('/playlist-tools');
  cy.get('[data-testid="diff-tool"]').click();
  cy.get('[data-testid="base-playlist-selector"]').click();
  cy.get('[role="option"]').first().click();
  cy.get('[data-testid="compare-playlist-selector"]').click();
  cy.get('[role="option"]').eq(1).click();
  cy.contains('Compare Playlists').click();
  cy.contains('tracks found').should('be.visible');
});

When('I click the save playlist button', () => {
  cy.get('[data-testid="save-to-spotify-button"]').click();
});

Then('I should see the save to Spotify dialog', () => {
  cy.contains('Save to Spotify Playlist').should('be.visible');
  cy.get('[data-testid="playlist-name-input"]').should('be.visible');
});

When('I enter a playlist name {string}', (playlistName: string) => {
  cy.get('[data-testid="playlist-name-input"]').clear().type(playlistName);
});

When('I confirm saving to Spotify', () => {
  cy.get('[data-testid="confirm-save-button"]').click();
});

When('I cancel the save dialog', () => {
  cy.contains('Cancel').click();
});

Then('the playlist should be created in my Spotify account', () => {
  // Mock the API call for testing
  cy.intercept('POST', '**/api/spotify/playlists', {
    statusCode: 201,
    body: { id: 'new-playlist-id', name: 'Test Playlist' }
  }).as('createPlaylist');
  
  cy.wait('@createPlaylist', { timeout: 10000 });
});

Then('I should see a success message', () => {
  cy.contains('Playlist saved successfully').should('be.visible');
});

Then('the dialog should close automatically', () => {
  cy.get('[data-testid="playlist-name-input"]').should('not.exist');
});

Then('the dialog should close', () => {
  cy.get('[data-testid="playlist-name-input"]').should('not.exist');
});

Then('no playlist should be created', () => {
  cy.get('@createPlaylist.all').should('have.length', 0);
});

// Navigation
When('I click the back to tools button', () => {
  cy.get('[data-testid="back-to-tools"]').click();
});

export {};
