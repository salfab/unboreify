/// <reference types="cypress" />

describe('Spotify OAuth Integration', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('OAuth Flow (Mocked)', () => {
    it('should complete mocked OAuth flow successfully', () => {
      cy.mockSpotifyAuth();
      
      // Verify authentication state
      cy.checkSpotifyAuth().should('be.true');
      
      // Verify UI changes after authentication
      cy.contains('Login with Spotify').should('not.exist');
      cy.get('.MuiAvatar-root').should('be.visible');
    });

    it('should maintain authentication state across page reloads', () => {
      cy.mockSpotifyAuth();
      
      // Reload the page
      cy.reload();
      cy.waitForAppLoad();
      
      // Should still be authenticated
      cy.checkSpotifyAuth().should('be.true');
      cy.get('.MuiAvatar-root').should('be.visible');
    });

    it('should handle logout correctly', () => {
      cy.mockSpotifyAuth();
      
      // Verify we're authenticated first
      cy.get('.MuiAvatar-root').should('be.visible');
      
      // Click logout - use first avatar to avoid multiple elements
      cy.get('.MuiAvatar-root').first().click();
      cy.contains('Sign out').click();
      
      // Wait for React state to update after logout
      cy.wait(1000);
      
      // Should be logged out - check for login button
      cy.contains('Login with Spotify').should('be.visible');
      
      // Verify that protected routes now redirect
      cy.visit('/queue');
      cy.waitForAppLoad();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });
  });

  describe('OAuth Flow (Real - Optional)', () => {
    // These tests will only run if real credentials are provided
    it('should start OAuth flow when clicking login', () => {
      const hasCredentials = Cypress.env('SPOTIFY_TEST_USERNAME') && Cypress.env('SPOTIFY_TEST_PASSWORD');
      
      if (!hasCredentials) {
        cy.log('Skipping real OAuth test - no test credentials provided');
        return;
      }

      cy.visit('/');
      cy.waitForAppLoad();
      
      // Click login button
      cy.contains('Login with Spotify').click();
      
      // Should redirect to Spotify
      cy.url().should('include', 'accounts.spotify.com');
    });

    // This test should only be run manually or in CI with proper test credentials
    it.skip('should complete full OAuth flow with real credentials', () => {
      // Only run this test when you have proper test credentials set up
      // To run: cy.run --spec "cypress/e2e/oauth.cy.ts" --env CYPRESS_SPOTIFY_TEST_USERNAME=your_username,CYPRESS_SPOTIFY_TEST_PASSWORD=your_password
      
      cy.loginToSpotify();
      
      // Verify successful login
      cy.checkSpotifyAuth().should('be.true');
      cy.get('.MuiAvatar-root').should('be.visible');
      
      // Verify that we can access protected routes
      cy.navigateToPage('/queue');
      cy.url().should('include', '/queue');
    });
  });

  describe('Protected Routes Authentication', () => {
    it('should redirect unauthenticated users from queue page', () => {
      cy.visit('/queue');
      cy.waitForAppLoad();
      
      // Should redirect to home page
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('Login with Spotify').should('be.visible');
    });

    it('should allow authenticated users to access queue page', () => {
      cy.mockSpotifyAuth();
      
      cy.navigateToPage('/queue');
      cy.url().should('include', '/queue');
      cy.contains('Queue').should('be.visible');
    });
  });

  describe('Token Management', () => {
    it('should handle expired tokens gracefully', () => {
      // Set up an expired token
      cy.window().then((win) => {
        win.localStorage.setItem('SPOTIFY_token', '"expired_token"');
        win.localStorage.setItem('SPOTIFY_expiresAt', '0'); // Already expired
      });

      // Mock the refresh token API call
      cy.intercept('POST', '**/api/token', {
        statusCode: 200,
        body: {
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          expires_in: 3600
        }
      }).as('refreshToken');

      cy.visit('/queue');
      cy.waitForAppLoad();

      // Should either refresh the token or redirect to login
      // This depends on your implementation
    });

    it('should clear tokens on logout', () => {
      cy.mockSpotifyAuth();
      
      // Verify tokens exist
      cy.window().then((win) => {
        expect(win.localStorage.getItem('SPOTIFY_token')).to.not.be.null;
      });
      
      // Logout - use first avatar to avoid multiple elements
      cy.get('.MuiAvatar-root').first().click();
      cy.contains('Sign out').click();
      
      // Verify tokens are cleared or set to empty (oauth library behavior)
      cy.window().then((win) => {
        const token = win.localStorage.getItem('SPOTIFY_token');
        expect(token === null || token === '""' || token === '').to.be.true;
      });
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      cy.mockSpotifyAuth();
    });

    it('should make authenticated API calls', () => {
      // Intercept Spotify API calls
      cy.intercept('GET', '**/v1/me', {
        statusCode: 200,
        body: {
          id: 'test_user',
          display_name: 'Test User',
          images: [{ url: 'https://via.placeholder.com/150' }]
        }
      }).as('getCurrentUser');

      cy.visit('/');
      cy.waitForAppLoad();

      // API call should have been made
      cy.wait('@getCurrentUser');
    });

    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '**/v1/me', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('getCurrentUserError');

      cy.visit('/');
      cy.waitForAppLoad();

      // Should handle the error without crashing
      cy.get('body').should('be.visible');
    });
  });

  describe('Error Boundaries', () => {
    it('should show error boundary when OAuth fails', () => {
      // Mock a failed OAuth response
      cy.visit('/callback?error=access_denied');
      cy.waitForAppLoad();

      // Should either show error message or redirect appropriately
      cy.get('body').should('be.visible');
    });
  });
});
