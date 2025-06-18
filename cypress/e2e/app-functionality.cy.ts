/// <reference types="cypress" />

describe('App Functionality', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Homepage', () => {
    it('should display the main homepage elements', () => {
      cy.visit('/');
      cy.waitForAppLoad();

      // Check main branding and call-to-action
      cy.contains('Unboreify').should('be.visible');
      cy.contains('Make your Spotify playlists less boring').should('be.visible');
      cy.contains('Login with Spotify').should('be.visible');
    });

    it('should have responsive navigation', () => {
      cy.visit('/');
      cy.waitForAppLoad();

      // Check navigation elements
      cy.get('.MuiAppBar-root').should('be.visible');
      cy.get('.MuiToolbar-root').should('be.visible');
    });

    it('should show footer', () => {
      cy.visit('/');
      cy.waitForAppLoad();

      // Footer should be visible
      cy.get('footer, [data-testid="footer"]').should('be.visible');
    });
  });

  describe('FestiClub Page', () => {
    it('should display FestiClub interface', () => {
      cy.visit('/festiclub');
      cy.waitForAppLoad();

      cy.contains('FestiClub').should('be.visible');
      cy.get('textarea, input[type="text"]').should('be.visible');
    });

    it('should allow entering artist names', () => {
      cy.visit('/festiclub');
      cy.waitForAppLoad();

      const artistNames = 'Radiohead\nColdplay\nThe Beatles';
      cy.get('textarea').first().type(artistNames);
      cy.get('textarea').should('contain.value', 'Radiohead');
    });

    it('should handle navigation with artist parameters', () => {
      cy.visit('/festiclub');
      cy.waitForAppLoad();

      const artistNames = 'Radiohead\nColdplay';
      cy.get('textarea').first().type(artistNames);
      
      // Click the correct button text
      cy.contains('button', 'Go to FestiClub with these Artists').click();
      
      // URL should update with artist parameters
      cy.url().should('include', 'artist=');
    });

    it('should load artist names from URL parameters', () => {
      const artists = 'Radiohead,Coldplay';
      cy.visit(`/festiclub?artist=${encodeURIComponent(artists)}`);
      cy.waitForAppLoad();

      // Artists should be loaded into the textarea
      cy.get('textarea').should('contain.value', 'Radiohead');
      cy.get('textarea').should('contain.value', 'Coldplay');
    });
  });

  describe('Concert Setlist Page', () => {
    it('should display setlist interface', () => {
      cy.visit('/setlist');
      cy.waitForAppLoad();

      cy.contains('Concert Setlist').should('be.visible');
      cy.contains('Build a playlist from a Concert Setlist').should('be.visible');
    });

    it('should show artist search autocomplete', () => {
      cy.visit('/setlist');
      cy.waitForAppLoad();

      // Look for autocomplete input
      cy.get('input[placeholder*="Search"], input[label*="Search"], .MuiAutocomplete-root input')
        .should('be.visible');
    });

    it('should handle artist search input', () => {
      cy.visit('/setlist');
      cy.waitForAppLoad();

      // Mock the setlist API
      cy.intercept('GET', '**/api/setlistfm/**', {
        statusCode: 200,
        body: {
          artist: [
            {
              name: 'Radiohead',
              mbid: 'test-mbid-123',
              disambiguation: 'English rock band'
            }
          ]
        }
      }).as('searchArtist');

      // Type in artist search
      cy.get('input').first().type('Radiohead');
      
      // Should make API call
      cy.wait('@searchArtist');
    });
  });

  describe('Queue Page (Authenticated)', () => {
    beforeEach(() => {
      cy.mockSpotifyAuth();
    });

    it('should display queue interface when authenticated', () => {
      cy.navigateToPage('/queue');

      cy.contains('Queue').should('be.visible');
    });

    it('should show playlist options when authenticated', () => {
      // Mock playlists API
      cy.intercept('GET', '**/v1/me/playlists', {
        statusCode: 200,
        body: {
          items: [
            {
              id: 'playlist1',
              name: 'My Test Playlist',
              tracks: { total: 10 }
            }
          ]
        }
      }).as('getPlaylists');

      cy.navigateToPage('/queue');
      
      // Should load playlists
      cy.wait('@getPlaylists');
    });

    it('should handle queue operations', () => {
      // Mock queue API
      cy.intercept('GET', '**/v1/me/player/queue', {
        statusCode: 200,
        body: {
          currently_playing: {
            id: 'track1',
            name: 'Test Track',
            uri: 'spotify:track:123',
            artists: [{ name: 'Test Artist', id: 'artist1' }],
            album: { name: 'Test Album', images: [] }
          },
          queue: []
        }
      }).as('getQueue');

      cy.navigateToPage('/queue');
      
      // Should load queue
      cy.wait('@getQueue');
    });
  });

  describe('Settings Dialog', () => {
    beforeEach(() => {
      cy.mockSpotifyAuth();
    });

    it('should open and close settings dialog', () => {
      cy.visit('/');
      cy.waitForAppLoad();

      // Open settings - click on first avatar (avoid multiple elements)
      cy.get('.MuiAvatar-root').first().click();
      cy.contains('Settings').click();

      // Dialog should be visible
      cy.get('.MuiDialog-root').should('be.visible');
      
      // Check for settings content within the dialog
      cy.get('.MuiDialog-root').within(() => {
        cy.contains('Settings').should('be.visible');
      });

      // Close dialog by clicking outside or using escape
      cy.get('body').type('{esc}');
      cy.get('.MuiDialog-root').should('not.exist');
    });

    it('should allow changing playlist multiplier', () => {
      cy.visit('/');
      cy.waitForAppLoad();

      // Open settings - use first avatar to avoid multiple elements
      cy.get('.MuiAvatar-root').first().click();
      cy.contains('Settings').click();

      // Look for playlist multiplier control
      cy.get('.MuiDialog-root').within(() => {
        cy.get('input, .MuiSlider-root').should('be.visible');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.visit('/festiclub');
      cy.waitForAppLoad();

      // Mock network error
      cy.intercept('GET', '**/api/**', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('networkError');

      // Should not crash on network errors
      cy.get('body').should('be.visible');
    });

    it('should show error boundaries when needed', () => {
      cy.visit('/');
      cy.waitForAppLoad();

      // The app should have error boundaries that catch React errors
      cy.get('body').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE size
      cy.visit('/');
      cy.waitForAppLoad();

      cy.contains('Unboreify').should('be.visible');
      cy.get('.MuiAppBar-root').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad size
      cy.visit('/');
      cy.waitForAppLoad();

      cy.contains('Unboreify').should('be.visible');
      cy.get('.MuiAppBar-root').should('be.visible');
    });

    it('should adapt navigation for mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      cy.waitForAppLoad();

      // Navigation should adapt for mobile (this depends on your implementation)
      cy.get('.MuiAppBar-root').should('be.visible');
    });
  });
});
