# Cypress E2E Testing Setup for Unboreify

## Overview

This project includes comprehensive end-to-end testing using Cypress, with specific support for Spotify OAuth integration and protected route testing.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root with your test credentials:

```bash
# Copy from .env.cypress and fill in your values
cp .env.cypress .env.local
```

Add your test credentials to `.env.local`:

```bash
# Spotify Test Account Credentials (for automated OAuth login)
CYPRESS_SPOTIFY_TEST_USERNAME=your_test_spotify_username
CYPRESS_SPOTIFY_TEST_PASSWORD=your_test_spotify_password

# Spotify App Configuration (should match your regular .env)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SETLIST_FM_API_KEY=your_setlist_fm_api_key
VITE_SETLIST_FM_API_URL=/api/setlistfm
VITE_SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
VITE_API_URL=/api/deejai
```

### 2. Running Tests

#### Development Server
Make sure your development server is running:
```bash
pnpm dev:netlify
```

#### Open Cypress Test Runner (Interactive)
```bash
pnpm cypress:open
```

#### Run Tests in Headless Mode
```bash
pnpm test:e2e
```

#### Run Tests with Browser Visible
```bash
pnpm test:e2e:headed
```

## Test Structure

### Test Files

1. **`cypress/e2e/redirections.cy.ts`** - Tests for app routing and redirections
   - Unauthenticated user redirections
   - Navigation menu functionality
   - Protected route access
   - OAuth callback handling
   - Deep link support

2. **`cypress/e2e/oauth.cy.ts`** - Spotify OAuth integration tests
   - Mock OAuth flow
   - Real OAuth flow (optional)
   - Token management
   - API integration
   - Error handling

3. **`cypress/e2e/app-functionality.cy.ts`** - Core app functionality tests
   - Homepage elements
   - FestiClub page functionality
   - Concert Setlist page
   - Queue page (authenticated)
   - Settings dialog
   - Responsive design

### Custom Commands

The following custom Cypress commands are available:

- `cy.loginToSpotify(username?, password?)` - Performs full OAuth login
- `cy.mockSpotifyAuth()` - Sets up mock authentication (faster for testing)
- `cy.waitForAppLoad()` - Waits for React app to fully load
- `cy.checkSpotifyAuth()` - Checks if user is authenticated
- `cy.navigateToPage(path)` - Navigates to a page and waits for load

## Testing Strategies

### 1. Mock Authentication (Recommended for most tests)

Use `cy.mockSpotifyAuth()` for faster testing without real OAuth:

```typescript
beforeEach(() => {
  cy.mockSpotifyAuth();
});

it('should access protected route', () => {
  cy.navigateToPage('/queue');
  cy.url().should('include', '/queue');
});
```

### 2. Real OAuth Testing (Optional)

For comprehensive OAuth testing, use real credentials:

```typescript
it('should complete OAuth flow', () => {
  cy.loginToSpotify(); // Uses credentials from environment
  cy.checkSpotifyAuth().should('be.true');
});
```

### 3. API Mocking

Mock Spotify API responses for predictable testing:

```typescript
cy.intercept('GET', '**/v1/me', {
  statusCode: 200,
  body: { id: 'test_user', display_name: 'Test User' }
}).as('getCurrentUser');
```

## Security Considerations

- **Never commit real credentials** - Use `.env.local` which is gitignored
- **Use test accounts** - Create dedicated Spotify accounts for testing
- **Rotate credentials** - Regularly update test account passwords
- **Environment separation** - Use different credentials for CI/CD

## CI/CD Integration

For continuous integration, set environment variables in your CI system:

```bash
CYPRESS_SPOTIFY_TEST_USERNAME=ci_test_username
CYPRESS_SPOTIFY_TEST_PASSWORD=ci_test_password
VITE_SPOTIFY_CLIENT_ID=your_client_id
# ... other variables
```

## Troubleshooting

### Common Issues

1. **Tests failing due to OAuth rate limits**
   - Use mock authentication for most tests
   - Only use real OAuth for critical path testing

2. **Flaky tests due to loading timing**
   - Use `cy.waitForAppLoad()` after page navigation
   - Increase timeouts if needed in `cypress.config.ts`

3. **CORS issues in testing**
   - Run tests against `netlify dev` (http://localhost:8888)
   - Ensure proxy configuration is working

4. **Missing test data**
   - Mock API responses for consistent test data
   - Use fixtures for complex test data

### Debug Commands

```bash
# Run specific test file
npx cypress run --spec "cypress/e2e/redirections.cy.ts"

# Run tests with specific browser
npx cypress run --browser chrome

# Run tests in headed mode for debugging
npx cypress run --headed --no-exit

# Open Cypress with environment variables
CYPRESS_SPOTIFY_TEST_USERNAME=test@example.com npx cypress open
```

## Best Practices

1. **Use Page Object Pattern** for complex interactions
2. **Mock external APIs** for predictable tests
3. **Test error states** as well as happy paths
4. **Keep tests independent** - each test should be able to run alone
5. **Use meaningful test descriptions** and organize with `describe` blocks
6. **Clean up after tests** - clear localStorage and cookies
7. **Test responsive design** with different viewport sizes

## Adding New Tests

When adding new tests:

1. Follow the existing file structure
2. Use appropriate `describe` blocks for organization
3. Include both authenticated and unauthenticated scenarios
4. Test error conditions and edge cases
5. Add custom commands to `cypress/support/commands.ts` if needed

## Spotify API Testing Notes

- Some Spotify API endpoints require premium accounts
- Rate limits apply to Spotify API calls
- Use mock data for consistent testing experience
- Test both success and error scenarios for API calls
