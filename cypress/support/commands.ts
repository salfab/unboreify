/// <reference types="cypress" />

// Custom commands for Spotify OAuth and app-specific functionality

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login to Spotify using OAuth with test credentials
       * @param username - Spotify test account username
       * @param password - Spotify test account password
       */
      loginToSpotify(username?: string, password?: string): Chainable<void>;
      
      /**
       * Skip Spotify login and mock the authentication state
       * Useful for testing app functionality without OAuth flow
       */
      mockSpotifyAuth(): Chainable<void>;
      
      /**
       * Wait for the app to be fully loaded
       */
      waitForAppLoad(): Chainable<void>;
      
      /**
       * Check if user is authenticated with Spotify
       */
      checkSpotifyAuth(): Chainable<boolean>;
      
      /**
       * Helper command to navigate to specific pages and wait for them to load
       */
      navigateToPage(path: string): Chainable<void>;
    }
  }
}

/**
 * Custom command to login to Spotify using OAuth flow
 * This command handles the full OAuth process including redirects
 */
Cypress.Commands.add('loginToSpotify', (
  username = Cypress.env('SPOTIFY_TEST_USERNAME'),
  password = Cypress.env('SPOTIFY_TEST_PASSWORD')
) => {
  // Ensure we have test credentials
  if (!username || !password) {
    throw new Error(
      'Spotify test credentials not found. Please set CYPRESS_SPOTIFY_TEST_USERNAME and CYPRESS_SPOTIFY_TEST_PASSWORD in your .env.local file'
    );
  }

  cy.log('Starting Spotify OAuth login process');
  
  // Visit the app homepage
  cy.visit('/');
  
  // Click the login button to start OAuth flow
  cy.contains('Login with Spotify').click();
  
  // Handle the OAuth redirect to Spotify
  cy.origin('https://accounts.spotify.com', { args: { username, password } }, ({ username, password }) => {
    // Wait for Spotify login page to load
    cy.url().should('include', 'accounts.spotify.com');
    
    // Fill in login credentials
    cy.get('#login-username', { timeout: 10000 }).should('be.visible').type(username);
    cy.get('#login-password').should('be.visible').type(password);
    
    // Submit login form
    cy.get('#login-button').click();
    
    // Handle potential 2FA or additional verification steps
    cy.url().then((url) => {
      if (url.includes('authorize')) {
        // If we're on the authorization page, click authorize
        cy.get('[data-testid="auth-accept"]', { timeout: 10000 }).should('be.visible').click();
      }
    });
  });
  
  // Wait for redirect back to our app
  cy.url().should('include', Cypress.env('SPOTIFY_REDIRECT_URI') || 'localhost:8888');
  
  // Wait for authentication to complete
  cy.waitForAppLoad();
  
  // Verify we're logged in
  cy.checkSpotifyAuth().should('be.true');
  
  cy.log('Spotify OAuth login completed successfully');
});

/**
 * Mock Spotify authentication for testing without OAuth
 * This bypasses the OAuth flow and sets up a mock authenticated state
 */
Cypress.Commands.add('mockSpotifyAuth', () => {
  cy.log('Setting up mock Spotify authentication');
  
  // Mock tokens in localStorage (adjust key names based on your auth library)
  const mockTokens = {
    'SPOTIFY_token': '"mock_access_token_for_testing"',
    'SPOTIFY_refreshToken': '"mock_refresh_token_for_testing"',
    'SPOTIFY_expiresAt': (Date.now() + 3600000).toString(), // 1 hour from now
  };
  
  Object.entries(mockTokens).forEach(([key, value]) => {
    cy.window().then((win) => {
      win.localStorage.setItem(key, value);
    });
  });
  
  // Mock user data
  const mockUser = {
    id: 'test_user_id',
    display_name: 'Test User',
    images: [{ url: 'https://via.placeholder.com/150' }]
  };
  
  // Intercept Spotify API calls and return mock data
  cy.intercept('GET', '**/v1/me', { statusCode: 200, body: mockUser }).as('getCurrentUser');
  
  // Mock queue with sample tracks
  const mockTrack = {
    id: 'mock_track_id',
    name: 'Test Song',
    artists: [{ name: 'Test Artist' }],
    album: { name: 'Test Album', images: [{ url: 'https://via.placeholder.com/300' }] },
    duration_ms: 180000,
    external_urls: { spotify: 'https://open.spotify.com/track/mock' }
  };
  
  const mockQueueTrack = {
    id: 'mock_queue_track_id',
    name: 'Test Queue Song',
    artists: [{ name: 'Test Queue Artist' }],
    album: { name: 'Test Queue Album', images: [{ url: 'https://via.placeholder.com/300' }] },
    duration_ms: 200000,
    external_urls: { spotify: 'https://open.spotify.com/track/mock_queue' }
  };
  
  cy.intercept('GET', '**/v1/me/player/queue', { 
    statusCode: 200, 
    body: { 
      currently_playing: mockTrack, 
      queue: [mockQueueTrack] 
    } 
  }).as('getQueue');
  cy.intercept('GET', '**/v1/me/playlists', { 
    statusCode: 200, 
    body: { 
      items: [{
        id: 'mock_playlist_id',
        name: 'Test Playlist',
        tracks: { total: 10 },
        external_urls: { spotify: 'https://open.spotify.com/playlist/mock' }
      }] 
    } 
  }).as('getPlaylists');
  
  // Mock player state
  cy.intercept('GET', '**/v1/me/player', { 
    statusCode: 200, 
    body: { 
      is_playing: false,
      item: mockTrack,
      device: { id: 'mock_device', name: 'Test Device' }
    } 
  }).as('getPlaybackState');
  
  // Mock devices
  cy.intercept('GET', '**/v1/me/player/devices', { 
    statusCode: 200, 
    body: { 
      devices: [{ id: 'mock_device', name: 'Test Device', is_active: true }] 
    } 
  }).as('getDevices');
  
  cy.visit('/');
  cy.waitForAppLoad();
  
  cy.log('Mock Spotify authentication setup completed');
});

/**
 * Wait for the React app to be fully loaded
 */
Cypress.Commands.add('waitForAppLoad', () => {
  // Wait for React app to be rendered
  cy.get('[data-testid="app-container"], .MuiContainer-root, .MuiAppBar-root', { timeout: 10000 }).should('be.visible');
  
  // Wait for any loading spinners to disappear
  cy.get('.MuiCircularProgress-root', { timeout: 15000 }).should('not.exist');
  
  // Additional wait for any async operations to complete
  cy.wait(1000);
});

/**
 * Check if the user is authenticated with Spotify
 */
Cypress.Commands.add('checkSpotifyAuth', () => {
  return cy.window().then((win) => {
    const token = win.localStorage.getItem('SPOTIFY_token');
    // Token is valid if it exists, is not null, not empty string, and not quoted empty string
    return Boolean(token && token !== 'null' && token !== 'undefined' && token !== '""' && token.trim() !== '');
  });
});

// Additional helper commands can be added here

/**
 * Helper command to navigate to specific pages and wait for them to load
 */
Cypress.Commands.add('navigateToPage', (path: string) => {
  cy.visit(path);
  cy.waitForAppLoad();
});

export {};
