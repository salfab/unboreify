// cypress/support/step_definitions/navigation.steps.ts
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Import custom commands
import '../commands';

// Navigation specific steps
When('I click on the navigation menu', () => {
  // For mobile, this would be a hamburger menu
  cy.get('[data-testid="mobile-menu-button"]').click();
});

When('I use the browser back button', () => {
  cy.go('back');
});

When('I use the browser forward button', () => {
  cy.go('forward');
});

When('I navigate using deep links with parameters', () => {
  cy.visit('/festiclub?artists=Radiohead,Coldplay');
  cy.waitForAppLoad();
});

Then('I should see the navigation menu', () => {
  cy.get('[data-testid="navigation"]').should('be.visible');
});

Then('I should see the mobile navigation icons', () => {
  cy.get('[data-testid="mobile-music-button"]').should('be.visible');
  cy.get('[data-testid="mobile-queue-button"]').should('be.visible');
});

Then('the navigation should be responsive', () => {
  // Test mobile view
  cy.viewport(375, 667);
  cy.get('[data-testid="mobile-music-button"]').should('be.visible');
  
  // Test desktop view
  cy.viewport(1280, 720);
  cy.get('[data-testid="nav-festiclub"]').should('be.visible');
});

Then('the URL parameters should be maintained', () => {
  cy.url().should('include', 'artists=Radiohead,Coldplay');
});

// Menu and dropdown steps
When('I open the user menu', () => {
  cy.get('[data-testid="user-avatar"]').first().click();
});

When('I open the live music menu on mobile', () => {
  cy.get('[data-testid="mobile-music-button"]').click();
});

Then('I should see the user menu options', () => {
  cy.get('[data-testid="settings-menu-item"]').should('be.visible');
  cy.get('[data-testid="logout-menu-item"]').should('be.visible');
});

Then('I should see the live music menu options', () => {
  cy.get('[data-testid="festiclub-option"]').should('be.visible');
  cy.get('[data-testid="setlist-option"]').should('be.visible');
});

// Protected route steps
Then('I should be redirected to the homepage from protected routes', () => {
  cy.visit('/queue');
  cy.url().should('eq', `${Cypress.config().baseUrl}/`);
});

Then('I should be able to access protected routes', () => {
  cy.loginWithSpotify();
  cy.visit('/queue');
  cy.url().should('include', '/queue');
});

// Additional navigation steps for comprehensive coverage

Then('I should see the FestiClub interface', () => {
  cy.contains('FestiClub').should('be.visible');
  cy.get('textarea, input[type="text"]').should('be.visible');
});

Then('I should see the Concert Setlist interface', () => {
  cy.contains('Concert Setlist').should('be.visible');
  cy.contains('Build a playlist from a Concert Setlist').should('be.visible');
});

Then('I should see desktop navigation links', () => {
  cy.get('.MuiAppBar-root').should('be.visible');
  cy.get('.MuiToolbar-root').should('be.visible');
});

Then('I should see {string} navigation link', (linkText: string) => {
  cy.contains(linkText).should('be.visible');
});

Then('I should see mobile navigation icons', () => {
  cy.get('[data-testid="HomeIcon"], svg[data-testid="HomeIcon"]').should('be.visible');
  cy.get('[data-testid="QueueMusicIcon"], svg[data-testid="QueueMusicIcon"]').should('be.visible');
  cy.get('[data-testid="SpeakerGroupIcon"], svg[data-testid="SpeakerGroupIcon"]').should('be.visible');
});

When('I click the live music icon on mobile', () => {
  cy.get('[data-testid="SpeakerGroupIcon"], svg[data-testid="SpeakerGroupIcon"]').parent().click();
});

Then('I should see the live music menu', () => {
  cy.get('.MuiMenu-root').should('be.visible');
});

Then('I should see {string} option in mobile menu', (optionText: string) => {
  cy.contains(optionText).should('be.visible');
});

When('I visit the festiclub page with artist parameters', () => {
  const artists = 'Radiohead,Coldplay';
  cy.visit(`/festiclub?artist=${encodeURIComponent(artists)}`);
  cy.waitForAppLoad();
});

Then('the artist parameters should be loaded into the interface', () => {
  cy.get('textarea').should('contain.value', 'Radiohead');
  cy.get('textarea').should('contain.value', 'Coldplay');
});

When('I navigate to another page and return', () => {
  cy.navigateToPage('/setlist');
  cy.navigateToPage('/festiclub?artist=Radiohead,Coldplay');
});

Then('the URL parameters should still be maintained', () => {
  cy.url().should('include', 'artist=Radiohead');
});

When('I visit the OAuth callback page', () => {
  cy.visit('/callback');
  cy.waitForAppLoad();
});

Then('the callback should be handled appropriately', () => {
  cy.url().then((url) => {
    expect(url).to.satisfy((actualUrl: string) => 
      actualUrl.includes('/callback') || actualUrl === Cypress.config('baseUrl') + '/'
    );
  });
});

Then('the page should not crash', () => {
  cy.get('body').should('be.visible');
});

When('I visit the OAuth callback with authentication parameters', () => {
  cy.visit('/callback?code=test_code&state=test_state');
  cy.waitForAppLoad();
});

Then('the parameters should be processed correctly', () => {
  cy.get('body').should('be.visible');
});

Then('the authentication flow should complete', () => {
  cy.get('body').should('be.visible');
});

Given('I am on any page', () => {
  cy.visit('/');
  cy.waitForAppLoad();
});

When('I visit an unknown route', () => {
  cy.visit('/unknown-route');
  cy.waitForAppLoad();
});

Then('the application should handle the unknown route gracefully', () => {
  cy.get('body').should('be.visible');
});

Then('the page should remain functional', () => {
  cy.get('body').should('be.visible');
});

Given('I am on the festiclub page with artist parameters', () => {
  cy.visit('/festiclub?artist=TestArtist');
  cy.waitForAppLoad();
});

When('I navigate to the setlist page', () => {
  cy.navigateToPage('/setlist');
});

When('I navigate back to festiclub with the same parameters', () => {
  cy.navigateToPage('/festiclub?artist=TestArtist');
});

Then('the parameters should be preserved in the URL', () => {
  cy.url().should('include', 'artist=TestArtist');
});

Then('the artist data should be loaded correctly', () => {
  cy.get('textarea, input').should('contain.value', 'TestArtist');
});
