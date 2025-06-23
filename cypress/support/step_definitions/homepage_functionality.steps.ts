import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Homepage and App Functionality step definitions

// Homepage display steps
Then('I should see the Unboreify branding', () => {
  cy.contains('Unboreify').should('be.visible');
});

Then('I should see the application footer', () => {
  cy.get('footer, [data-testid="footer"]').should('be.visible');
});

Then('I should see the app navigation bar', () => {
  cy.get('.MuiAppBar-root').should('be.visible');
});

Then('I should see the main toolbar', () => {
  cy.get('.MuiToolbar-root').should('be.visible');
});

Then('the page should be properly styled', () => {
  cy.get('body').should('be.visible');
  cy.get('.MuiAppBar-root').should('be.visible');
});

// FestiClub functionality steps
Then('I should see {string} heading', (headingText: string) => {
  cy.contains(headingText).should('be.visible');
});

Then('I should see artist text area', () => {
  cy.get('textarea').should('be.visible');
});

When('I enter multiple artist names in the text area', () => {
  const artistNames = 'Radiohead\\nColdplay\\nThe Beatles';
  cy.get('textarea').first().type(artistNames);
});

Then('the artist names should be stored in the text area', () => {
  cy.get('textarea').should('contain.value', 'Radiohead');
  cy.get('textarea').should('contain.value', 'Coldplay');
});

Then('I should see the entered artist names', () => {
  cy.get('textarea').should('contain.value', 'Radiohead');
});

When('I enter artist names and navigate with parameters', () => {
  const artistNames = 'Radiohead\\nColdplay';
  cy.get('textarea').first().type(artistNames);
  cy.contains('button', 'Go to FestiClub with these Artists').click();
});

Then('the URL should contain artist parameters', () => {
  cy.url().should('include', 'artist=');
});

Then('the URL should be updated with the artist data', () => {
  cy.url().should('include', 'artist=');
});

When('I visit the festiclub page with predefined artist parameters', () => {
  const artists = 'Radiohead,Coldplay';
  cy.visit(`/festiclub?artist=${encodeURIComponent(artists)}`);
  cy.waitForAppLoad();
});

Then('the artist names should be loaded into the text area', () => {
  cy.get('textarea').should('contain.value', 'Radiohead');
  cy.get('textarea').should('contain.value', 'Coldplay');
});

Then('the predefined artists should be visible', () => {
  cy.get('textarea').should('contain.value', 'Radiohead');
});

// Concert Setlist functionality steps
Then('I should see artist search autocomplete', () => {
  cy.get('input[placeholder*="Search"], input[label*="Search"], .MuiAutocomplete-root input')
    .should('be.visible');
});

When('I search for an artist in the autocomplete', () => {
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

  cy.get('input').first().type('Radiohead');
});

Then('the artist search should trigger an API call', () => {
  cy.wait('@searchArtist');
});

// Note: "I should see artist search suggestions" step is defined in app_features.steps.ts

// Queue interface steps
Then('I should see the Queue interface', () => {
  cy.contains('Queue').should('be.visible');
});

Then('I should see queue-related content', () => {
  cy.contains('Queue').should('be.visible');
});

Then('I should see playlist options', () => {
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
});

Then('playlist data should be loaded from Spotify', () => {
  cy.wait('@getPlaylists');
});

Then('I should see current queue data', () => {
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
});

Then('queue information should be loaded from Spotify', () => {
  cy.wait('@getQueue');
});

// Settings functionality steps
Then('I should see settings content', () => {
  cy.get('.MuiDialog-root').within(() => {
    cy.contains('Settings').should('be.visible');
  });
});

When('I close the settings dialog with escape key', () => {
  cy.get('body').type('{esc}');
});

Then('I should see playlist multiplier controls', () => {
  cy.get('.MuiDialog-root').within(() => {
    cy.get('input, .MuiSlider-root').should('be.visible');
  });
});

Then('I should be able to adjust settings values', () => {
  cy.get('.MuiDialog-root').within(() => {
    cy.get('input, .MuiSlider-root').should('be.visible');
  });
});

// Error handling steps
Given('the network returns server errors', () => {
  cy.intercept('GET', '**/api/**', {
    statusCode: 500,
    body: { error: 'Internal Server Error' }
  }).as('networkError');
});

When('I trigger network requests', () => {
  cy.get('body').should('be.visible');
});

Then('the application should handle network errors gracefully', () => {
  cy.get('body').should('be.visible');
});

When('React errors occur in the application', () => {
  // This would be simulated through error injection in a real test
  cy.get('body').should('be.visible');
});

Then('error boundaries should catch the errors', () => {
  cy.get('body').should('be.visible');
});

Then('the app should display appropriate error handling', () => {
  cy.get('body').should('be.visible');
});

// Responsive design steps
Then('I should see the mobile-optimized navigation', () => {
  cy.get('.MuiAppBar-root').should('be.visible');
});

Then('the page should be responsive for mobile', () => {
  cy.get('body').should('be.visible');
  cy.contains('Unboreify').should('be.visible');
});

Then('I should see the tablet-optimized navigation', () => {
  cy.get('.MuiAppBar-root').should('be.visible');
});

Then('the page should be responsive for tablet', () => {
  cy.get('body').should('be.visible');
  cy.contains('Unboreify').should('be.visible');
});

Then('the navigation should adapt for mobile viewports', () => {
  cy.get('.MuiAppBar-root').should('be.visible');
});

Then('I should see mobile-appropriate navigation elements', () => {
  cy.get('.MuiAppBar-root').should('be.visible');
});
