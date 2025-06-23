# API Redirects Test Suite Documentation

This document describes the Cypress E2E test suite for validating Netlify API redirects and proxying functionality in the Unboreify application.

## Overview

The test suite validates that the Netlify configuration properly redirects API calls from:
- `/api/deejai/*` → `https://deej-ai.online/api/v1/*`
- `/api/setlistfm/*` → `https://api.setlist.fm/rest/1.0/*`

## Test Categories

### @integration Tests
- **Purpose**: Test application behavior with mocked APIs
- **Always runnable**: Yes
- **Description**: These tests use `cy.intercept()` to mock API responses and validate that the application can handle redirected API calls correctly.

### @error-handling Tests  
- **Purpose**: Test error scenarios with mocked APIs
- **Always runnable**: Yes
- **Description**: These tests mock API errors (500, 429) and verify the application handles them gracefully.

### @config-validation Tests
- **Purpose**: Test netlify.toml configuration
- **Always runnable**: Yes
- **Description**: These tests validate that the `netlify.toml` file has correct redirect configurations.

### @real-api Tests
- **Purpose**: Test actual external API communication through Netlify redirects
- **Requires**: Netlify dev server
- **Description**: These tests make real HTTP requests to external APIs via Netlify redirects. No mocking.

### @connectivity Tests
- **Purpose**: Basic connectivity tests that work without API keys
- **Requires**: Netlify dev server
- **Description**: These tests verify that redirects work at the network level, regardless of authentication.

### @post-requests Tests
- **Purpose**: Test POST requests to external APIs
- **Requires**: Netlify dev server
- **Description**: These tests verify that POST requests are properly redirected to external APIs.

## Running Tests

### Regular Tests (Mocked APIs)
```bash
# Run all tests (mocked integration tests will pass)
pnpm cypress:run --spec "cypress/e2e/features/api_redirects.feature"

# Run only integration tests
cypress run --env "grepTags=@integration"

# Run only error handling tests
cypress run --env "grepTags=@error-handling"

# Run only config validation tests
cypress run --env "grepTags=@config-validation"
```

### Real API Tests (Netlify Dev Required)
```bash
# 1. Start Netlify dev server (runs on localhost:8888)
pnpm dev:netlify

# 2. In another terminal, run real API tests
pnpm cypress:run --spec "cypress/e2e/features/api_redirects.feature"

# Or run specific real API test categories
cypress run --env "grepTags=@real-api"
cypress run --env "grepTags=@connectivity"
cypress run --env "grepTags=@post-requests"
```

## Test Behavior

### When Running Against Vite Dev (localhost:3000)
- **@integration, @error-handling, @config-validation**: ✅ Pass normally
- **@real-api, @connectivity, @post-requests**: ⚠️ Detect HTML response, log warning, skip strict validation

### When Running Against Netlify Dev (localhost:8888)
- **All test categories**: ✅ Pass with full validation
- **Real API tests**: Make actual HTTP requests to external services

## Expected Test Results

### Successful Scenarios
- **200**: Successful API response
- **403**: Forbidden (no API key) - indicates redirect worked
- **404**: Not found (valid redirect but endpoint doesn't exist)
- **422**: Unprocessable entity (invalid parameters)
- **500/502/504**: External API server errors - indicates redirect worked but API unavailable

### Validation Logic
1. **Content-Type check**: Distinguishes between HTML (Vite) and JSON (Netlify)
2. **Status code validation**: Accepts various valid HTTP responses
3. **Response body analysis**: Ensures responses come from external APIs, not Netlify errors
4. **Graceful degradation**: Tests adapt based on environment

## Test Files

### Feature File
- `cypress/e2e/features/api_redirects.feature` - Gherkin scenarios

### Step Definitions
- `cypress/support/step_definitions/api_redirects.steps.ts` - Test implementation

### Configuration
- `netlify.toml` - Redirect configuration (validated in tests)

## Key Features

### Robust Error Handling
- Tests accept both string and object error responses
- Distinguishes between external API errors and Netlify errors
- Gracefully handles timeouts and connectivity issues

### Environment Detection
- Automatically detects Vite vs Netlify dev environments
- Adjusts test expectations based on environment
- Provides clear logging and warnings

### Comprehensive Coverage
- Tests both GET and POST requests
- Validates configuration files
- Tests both successful and error scenarios
- Includes connectivity tests that work without API keys

## Troubleshooting

### "HTML response received" warnings
- **Cause**: Tests are running against Vite dev server instead of Netlify dev
- **Solution**: Start with `pnpm dev:netlify` instead of `pnpm dev`

### 500 errors from external APIs
- **Expected**: External APIs may return server errors
- **Validation**: Tests verify these are real API errors, not Netlify proxy issues

### Missing test elements
- **Error handling tests**: Check that the application has proper error UI components
- **Integration tests**: Verify test IDs exist in components

## API Key Requirements

### Deejai API (deej-ai.online)
- Some endpoints may require authentication
- Tests handle 403 Forbidden responses gracefully

### Setlist.fm API
- Requires API key in `x-api-key` header for most endpoints
- Tests include basic API key in requests
- Tests handle authentication errors gracefully

## Continuous Integration

The test suite is designed to work in CI environments:
- Mocked tests always pass regardless of external dependencies
- Real API tests gracefully degrade when Netlify dev is not available
- Clear logging helps diagnose issues
- No flaky tests due to external API dependencies
