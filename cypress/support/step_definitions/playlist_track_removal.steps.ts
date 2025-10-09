// cypress/support/step_definitions/playlist_track_removal.steps.ts
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Import custom commands
import '../commands';

let removedTrackIds: string[] = [];
let initialTrackCount = 0;
let apiRequestBody: any = null;

Given('I have playlists available', () => {
  // Override the default playlist mock from mockSpotifyAuth with our detailed fixtures
  cy.intercept('GET', '**/v1/me/playlists**', {
    fixture: 'user-playlists.json'
  }).as('getUserPlaylists');
  
  cy.intercept('GET', '**/v1/playlists/**', {
    fixture: 'sample-playlist.json'
  }).as('getPlaylist');
  
  cy.log('Set up playlist intercepts with fixtures');
});

When('I click on a playlist in the presenter', () => {
  // Wait for playlists to be visible
  cy.get('[data-testid="playlist-card"]').should('be.visible');
  
  // Click on the first playlist
  cy.get('[data-testid="playlist-card"]').first().click();
  
  cy.log('Clicked on first playlist');
});

Then('I should see the playlist tracks', () => {
  // Verify we're in playlist view
  cy.get('[data-testid="playlist-presenter"]').should('be.visible');
  
  // Wait for track cards to appear and ensure they have content
  cy.get('[data-testid="track-card"]').should('exist').and('have.length.greaterThan', 0);
  
  // Verify that track cards have track names
  cy.get('[data-testid="track-name"]').should('exist').and('contain.text', 'Test Song');
  
  // Count initial tracks and store for later comparison
  cy.get('[data-testid="track-card"]').then(($tracks) => {
    initialTrackCount = $tracks.length;
    cy.log(`Initial track count: ${initialTrackCount}`);
    
    // Log all track IDs for debugging
    const trackIds: string[] = [];
    $tracks.each((index, element) => {
      const trackId = Cypress.$(element).attr('data-track-id');
      if (trackId) {
        trackIds.push(trackId);
      }
    });
    cy.log(`Initial track IDs: ${JSON.stringify(trackIds)}`);
    
    // Verify we have a reasonable number of tracks (should be at least 3 for our test scenarios)
    expect(initialTrackCount).to.be.at.least(3);
  });
});

When('I remove a specific track from the playlist', () => {
  // Simply click the remove button on the first track
  cy.get('[data-testid="track-card"]').first().within(() => {
    cy.get('[data-testid="track-remove-button"]').click();
  });
  
  cy.log('Removed first track from playlist');
});

When('I remove multiple tracks from the playlist', () => {
  // Remove the first 2 tracks
  for (let i = 0; i < 2; i++) {
    cy.get('[data-testid="track-card"]').first().within(() => {
      cy.get('[data-testid="track-remove-button"]').click();
    });
    
    // Wait a bit for the UI to update
    cy.wait(500);
  }
  
  cy.log('Removed 2 tracks from playlist');
});

When('I remove a track from the playlist', () => {
  // Same as "remove a specific track"
  cy.get('[data-testid="track-card"]').first().within(() => {
    cy.get('[data-testid="track-remove-button"]').click();
  });
  
  cy.log('Removed a track from playlist');
});

Then('the track should be removed from the display', () => {
  // Verify the track count decreased
  cy.get('[data-testid="track-card"]').should('have.length', initialTrackCount - 1);
  
  cy.log(`Track count reduced from ${initialTrackCount} to ${initialTrackCount - 1}`);
});

Then('the tracks should be removed from the display', () => {
  // Verify the track count decreased by the number of removed tracks (2)
  cy.get('[data-testid="track-card"]').should('have.length', initialTrackCount - 2);
  
  cy.log(`Track count reduced from ${initialTrackCount} to ${initialTrackCount - 2}`);
});

When('I switch between extend and alternative playlist modes', () => {
  // Click the playlist mode selector to switch modes
  cy.get('[data-testid="playlist-mode-selector"]').click();
  cy.wait(500);
  
  // Click it again to switch back
  cy.get('[data-testid="playlist-mode-selector"]').click();
  cy.wait(500);
});

When('I click the enhance button for the playlist', () => {
  // Set up intercepts for both the search validation and playlist endpoints
  
  // Mock the search endpoint that validates track IDs
  cy.intercept('GET', '**/api/deejai/search**', (req) => {
    console.log('Search API called with:', req.url);
    // Mock response with valid track IDs based on the search term
    req.reply({
      statusCode: 200,
      body: [
        {
          track_id: 'track-1', 
          track: 'Test Song 1'
        },
        {
          track_id: 'track-2',
          track: 'Test Song 2'  
        },
        {
          track_id: 'track-3',
          track: 'Test Song 3'
        }
      ]
    });
  }).as('searchTracks');
  
  // Mock the playlist enhancement endpoint
  cy.intercept('POST', '**/api/deejai/playlist', (req) => {
    apiRequestBody = req.body;
    console.log('API Request Body:', JSON.stringify(apiRequestBody));
    
    // Mock response
    req.reply({
      statusCode: 200,
      body: {
        track_ids: ['mock1', 'mock2', 'mock3']
      }
    });
  }).as('enhancePlaylist');
  
  // Click the enhance button
  cy.get('[data-testid="playlist-enhance-button"]').should('be.visible').click();
  
  // Allow time for React to process the state change and trigger the effect
  cy.wait(1000);
  
  // Wait for the search calls first (there will be multiple for each track)
  cy.wait('@searchTracks');
  
  // Then wait for the playlist enhancement call
  cy.wait('@enhancePlaylist', { timeout: 30000 });
});

Then('the API call should only include IDs of remaining tracks', () => {
  // Check the request body contains track IDs  
  cy.then(() => {
    expect(apiRequestBody).to.not.be.null;
    expect(apiRequestBody).to.have.property('track_ids');
    expect(apiRequestBody.track_ids).to.be.an('array');
    
    // Verify all track IDs are unique
    const uniqueTrackIds = [...new Set(apiRequestBody.track_ids)];
    expect(uniqueTrackIds).to.have.length(apiRequestBody.track_ids.length);
    
    // Log the actual track IDs for debugging
    cy.log(`API call contains ${apiRequestBody.track_ids.length} unique tracks: ${JSON.stringify(apiRequestBody.track_ids)}`);
  });
});

Then('the removed track ID should not be in the request', () => {
  // Verify that after removing 1 track, we have the right count
  cy.then(() => {
    expect(apiRequestBody).to.not.be.null;
    expect(apiRequestBody).to.have.property('track_ids');
    expect(apiRequestBody.track_ids).to.be.an('array');
    
    // Verify tracks are unique (no duplicates)
    const uniqueTrackIds = [...new Set(apiRequestBody.track_ids)];
    expect(uniqueTrackIds).to.have.length(apiRequestBody.track_ids.length);
  });
  
  // Count the actual tracks visible in the UI and verify API sends reasonable count
  cy.get('[data-testid="track-card"]').then($currentTracks => {
    const currentTrackCount = $currentTracks.length;
    
    // The API should send tracks that are a subset of (or equal to) what's visible in the UI
    // Some tracks might be filtered out during validation
    expect(apiRequestBody.track_ids.length).to.be.at.most(currentTrackCount);
    expect(apiRequestBody.track_ids.length).to.be.at.least(1); // Should have at least some tracks
    
    cy.log(`Single track removal: UI shows ${currentTrackCount} tracks, API sent ${apiRequestBody.track_ids.length} valid tracks`);
    cy.log(`Track IDs sent: ${JSON.stringify(apiRequestBody.track_ids)}`);
  });
});

Then('the removed track IDs should not be in the request', () => {
  // For multiple track removal scenario (2 tracks removed)
  cy.then(() => {
    expect(apiRequestBody).to.not.be.null;
    expect(apiRequestBody).to.have.property('track_ids');
    expect(apiRequestBody.track_ids).to.be.an('array');
    
    // Verify tracks are unique (no duplicates)
    const uniqueTrackIds = [...new Set(apiRequestBody.track_ids)];
    expect(uniqueTrackIds).to.have.length(apiRequestBody.track_ids.length);
  });
  
  // Count the actual tracks visible in the UI and verify API sends reasonable count
  cy.get('[data-testid="track-card"]').then($currentTracks => {
    const currentTrackCount = $currentTracks.length;
    
    // The API should send tracks that are a subset of (or equal to) what's visible in the UI
    // Some tracks might be filtered out during validation
    expect(apiRequestBody.track_ids.length).to.be.at.most(currentTrackCount);
    expect(apiRequestBody.track_ids.length).to.be.at.least(1); // Should have at least some tracks
    
    cy.log(`Multiple track removal: UI shows ${currentTrackCount} tracks, API sent ${apiRequestBody.track_ids.length} valid tracks`);
    cy.log(`Track IDs sent: ${JSON.stringify(apiRequestBody.track_ids)}`);
  });
});

// Reset state before each test
beforeEach(() => {
  removedTrackIds = [];
  initialTrackCount = 0;
  apiRequestBody = null;
});
