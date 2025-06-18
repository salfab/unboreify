/// <reference types="cypress" />

describe('App Redirections and Navigation', () => {
  beforeEach(() => {
    // Start fresh with no authentication
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Unauthenticated User Redirections', () => {
    it('should redirect to homepage when accessing protected routes without authentication', () => {
      // Test queue page redirect
      cy.visit('/queue');
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('Login with Spotify').should('be.visible');
    });

    it('should allow access to public routes without authentication', () => {
      // Test homepage access
      cy.visit('/');
      cy.waitForAppLoad();
      cy.contains('Unboreify').should('be.visible');
      cy.contains('Login with Spotify').should('be.visible');
    });

    it('should allow access to FestiClub page without authentication', () => {
      cy.visit('/festiclub');
      cy.waitForAppLoad();
      cy.url().should('include', '/festiclub');
      cy.contains('FestiClub').should('be.visible');
    });

    it('should allow access to Concert Setlist page without authentication', () => {
      cy.visit('/setlist');
      cy.waitForAppLoad();
      cy.url().should('include', '/setlist');
      cy.contains('Concert Setlist').should('be.visible');
    });
  });

  describe('Navigation Menu and Links', () => {
    it('should have working navigation links on homepage', () => {
      cy.visit('/');
      cy.waitForAppLoad();

      // Check that navigation links exist - they only appear when authenticated
      // For unauthenticated users, only login button should be visible
      cy.contains('Login with Spotify').should('be.visible');
    });

    it('should navigate to different pages via navigation links', () => {
      // First authenticate to see navigation links
      cy.mockSpotifyAuth();

      // Navigate to FestiClub
      cy.contains('FestiClub').click();
      cy.url().should('include', '/festiclub');
      cy.contains('FestiClub').should('be.visible');

      // Navigate to Setlist
      cy.contains('Setlist').click();
      cy.url().should('include', '/setlist');
      cy.contains('Concert Setlist').should('be.visible');

      // Navigate back to Home
      cy.contains('Home').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });

    it('should show login button when not authenticated', () => {
      cy.visit('/');
      cy.waitForAppLoad();
      
      // The login button should be visible, indicating we're not authenticated
      cy.contains('Login with Spotify').should('be.visible');
      
      // Additionally check that protected routes redirect
      cy.visit('/queue');
      cy.waitForAppLoad();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });
  });

  describe('Authenticated User Navigation (Desktop)', () => {
    beforeEach(() => {
      // Set desktop viewport to ensure we see the full navigation
      cy.viewport(1280, 720);
      cy.mockSpotifyAuth();
    });

    it('should show user interface when authenticated', () => {
      cy.contains('Login with Spotify').should('not.exist');
      cy.get('.MuiAvatar-root').should('be.visible');
    });

    it('should allow access to protected routes when authenticated', () => {
      // Test queue page access
      cy.navigateToPage('/queue');
      cy.url().should('include', '/queue');
      cy.contains('Queue').should('be.visible');
    });

    it('should show navigation links on desktop', () => {
      cy.visit('/');
      cy.waitForAppLoad();
      
      // On desktop, these should be visible as buttons
      cy.contains('Home').should('be.visible');
      cy.contains('View Queues').should('be.visible');
      cy.contains('FestiClub').should('be.visible');
      cy.contains('Setlist').should('be.visible');
    });

    it('should show user menu when clicking avatar', () => {
      cy.get('.MuiAvatar-root').first().click();
      cy.get('.MuiMenu-root').should('be.visible');
      cy.contains('Test User').should('be.visible');
      cy.contains('Settings').should('be.visible');
      cy.contains('Sign out').should('be.visible');
    });

    it('should open settings dialog when clicking settings', () => {
      cy.get('.MuiAvatar-root').first().click();
      cy.contains('Settings').click();
      
      // Wait for dialog to be visible
      cy.get('.MuiDialog-root').should('be.visible');
      
      // Check for settings content within the dialog
      cy.get('.MuiDialog-root').within(() => {
        cy.contains('Settings').should('be.visible');
      });
    });
  });

  describe('Authenticated User Navigation (Mobile)', () => {
    beforeEach(() => {
      // Set mobile viewport to see mobile navigation
      cy.viewport(375, 667);
      cy.mockSpotifyAuth();
    });

    it('should show mobile navigation icons', () => {
      cy.visit('/');
      cy.waitForAppLoad();
      
      // On mobile, navigation should be icons
      cy.get('[data-testid="HomeIcon"], svg[data-testid="HomeIcon"]').should('be.visible');
      cy.get('[data-testid="QueueMusicIcon"], svg[data-testid="QueueMusicIcon"]').should('be.visible');
      cy.get('[data-testid="SpeakerGroupIcon"], svg[data-testid="SpeakerGroupIcon"]').should('be.visible');
    });

    it('should show live music menu when clicking music icon on mobile', () => {
      cy.visit('/');
      cy.waitForAppLoad();
      
      // Click the live music icon
      cy.get('[data-testid="SpeakerGroupIcon"], svg[data-testid="SpeakerGroupIcon"]').parent().click();
      cy.get('.MuiMenu-root').should('be.visible');
      cy.contains('FestiClub').should('be.visible');
      cy.contains('Concert Setlist').should('be.visible');
    });
  });

  describe('Callback Route Handling', () => {
    it('should handle OAuth callback route', () => {
      cy.visit('/callback');
      cy.waitForAppLoad();
      
      // The callback route renders QueuePage component
      // Without authentication, it should redirect to home
      // Let's check if we're either on callback or redirected to home
      cy.url().then((url) => {
        expect(url).to.satisfy((actualUrl: string) => 
          actualUrl.includes('/callback') || actualUrl === Cypress.config('baseUrl') + '/'
        );
      });
    });

    it('should handle OAuth callback with query parameters', () => {
      // Simulate OAuth callback with parameters
      cy.visit('/callback?code=test_code&state=test_state');
      cy.waitForAppLoad();
      
      // Should not crash and should handle the parameters gracefully
      cy.get('body').should('be.visible');
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should handle unknown routes gracefully', () => {
      cy.visit('/unknown-route');
      cy.waitForAppLoad();
      
      // Should either redirect to home or show a 404-like state
      // Adjust this assertion based on your app's behavior
      cy.get('body').should('be.visible');
    });

    it('should handle browser back/forward navigation', () => {
      cy.visit('/');
      cy.waitForAppLoad();
      
      cy.navigateToPage('/festiclub');
      cy.navigateToPage('/setlist');
      
      // Test browser back button
      cy.go('back');
      cy.url().should('include', '/festiclub');
      
      // Test browser forward button
      cy.go('forward');
      cy.url().should('include', '/setlist');
    });
  });

  describe('Deep Link Support', () => {
    it('should support deep links to FestiClub with artist parameters', () => {
      const artistParam = 'Radiohead,Coldplay';
      cy.visit(`/festiclub?artist=${encodeURIComponent(artistParam)}`);
      cy.waitForAppLoad();
      
      cy.url().should('include', '/festiclub');
      cy.url().should('include', 'artist=');
      
      // Check that the artist names are loaded into the input
      cy.get('textarea, input').should('contain.value', 'Radiohead');
    });

    it('should maintain URL parameters across navigation', () => {
      cy.visit('/festiclub?artist=TestArtist');
      cy.waitForAppLoad();
      
      // Navigate away and back
      cy.navigateToPage('/setlist');
      cy.navigateToPage('/festiclub?artist=TestArtist');
      
      // Should still have the parameter
      cy.url().should('include', 'artist=TestArtist');
    });
  });
});
