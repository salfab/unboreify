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
