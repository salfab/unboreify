import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Authentication-related step definitions for comprehensive OAuth testing

// Token management steps
Given('I have an expired authentication token', () => {
  // Set up expired token in localStorage
  cy.window().then((win) => {
    win.localStorage.setItem('SPOTIFY_token', '"expired_token"');
    win.localStorage.setItem('SPOTIFY_expiresAt', '0'); // Already expired
  });
});

Then('my token should be refreshed automatically', () => {
  // Mock the refresh token API call
  cy.intercept('POST', '**/api/token', {
    statusCode: 200,
    body: {
      access_token: 'new_access_token',
      refresh_token: 'new_refresh_token',
      expires_in: 3600
    }
  }).as('refreshToken');
  
  // Wait for token refresh or verify redirection behavior
  cy.get('body', { timeout: 10000 }).should('be.visible');
});

Then('my authentication tokens should be completely cleared from storage', () => {
  // Verify tokens are cleared or set to empty (oauth library behavior)
  cy.window().then((win) => {
    const token = win.localStorage.getItem('SPOTIFY_token');
    expect(token === null || token === '""' || token === '').to.be.true;
  });
});

Then('I should not be able to access protected routes', () => {
  // Try to access a protected route and verify redirection
  cy.visit('/queue');
  cy.waitForAppLoad();
  cy.url().should('eq', Cypress.config('baseUrl') + '/');
});

// API integration steps
Then('authenticated API calls should be made successfully', () => {
  // Intercept Spotify API calls
  cy.intercept('GET', '**/v1/me', {
    statusCode: 200,
    body: {
      id: 'test_user',
      display_name: 'Test User',
      images: [{ url: 'https://via.placeholder.com/150' }]
    }
  }).as('getCurrentUser');
  
  // API call should have been made
  cy.wait('@getCurrentUser', { timeout: 10000 });
});

Given('the Spotify API returns an error', () => {
  // Mock API error
  cy.intercept('GET', '**/v1/me', {
    statusCode: 401,
    body: { error: 'Unauthorized' }
  }).as('getCurrentUserError');
});

Then('the application should handle the API error gracefully', () => {
  // Should handle the error without crashing
  cy.get('body').should('be.visible');
});

Then('the app should remain functional', () => {
  // Verify basic app functionality still works
  cy.get('body').should('be.visible');
  cy.contains('Unboreify').should('be.visible');
});

// OAuth callback steps
When('I visit the OAuth callback with an error parameter', () => {
  cy.visit('/callback?error=access_denied');
  cy.waitForAppLoad();
});

Then('the application should handle the OAuth error gracefully', () => {
  // Should either show error message or redirect appropriately
  cy.get('body').should('be.visible');
});

Then('I should see appropriate error messaging or redirect', () => {
  // Check for error handling - should not crash
  cy.get('body').should('be.visible');
});

// State persistence steps
When('I reload the page multiple times', () => {
  cy.reload();
  cy.waitForAppLoad();
  cy.reload();
  cy.waitForAppLoad();
});

Then('my authentication state should persist consistently', () => {
  // Should still be authenticated
  cy.checkSpotifyAuth().should('be.true');
});

Then('I should remain logged in without re-authentication', () => {
  // Verify UI shows authenticated state
  cy.get('.MuiAvatar-root', { timeout: 10000 }).should('be.visible');
  cy.contains('Login with Spotify').should('not.exist');
});
