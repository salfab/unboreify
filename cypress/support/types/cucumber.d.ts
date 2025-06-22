// cypress/support/types/cucumber.d.ts
declare global {
  namespace Cypress {
    interface Chainable {
      // Custom commands already defined in commands.ts
      loginWithSpotify(): Chainable<void>;
      logoutFromSpotify(): Chainable<void>;
      waitForAppToLoad(): Chainable<void>;
    }
  }
}

// Step definition context types
export interface StepDefinitionContext {
  currentUser?: {
    displayName: string;
    isAuthenticated: boolean;
  };
  testData?: Record<string, any>;
  page?: string;
  element?: Cypress.Chainable<JQuery<HTMLElement>>;
}

// Common step parameter types
export type AuthState = 'authenticated' | 'unauthenticated';
export type PageName = 'homepage' | 'festiclub' | 'setlist' | 'queue' | 'settings';
export type DeviceType = 'desktop' | 'mobile' | 'tablet';
export type NavigationElement = 'login button' | 'avatar' | 'settings' | 'logout' | 'music icon';

export {};
