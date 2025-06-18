// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global test configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on unhandled exceptions
  // You might want to be more specific about which errors to ignore
  console.log('Uncaught exception:', err.message);
  return false;
});

// Set up global hooks
beforeEach(() => {
  // Clear any stored authentication tokens before each test
  cy.clearLocalStorage();
  cy.clearCookies();
});
