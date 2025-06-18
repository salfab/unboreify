// Import commands.js using ES2015 syntax:
import './commands';

// Mount React components for component testing
import { mount } from 'cypress/react';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);
