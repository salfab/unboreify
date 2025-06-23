# API Redirects and Proxying Test Suite
#
# This feature tests Netlify API redirects and proxying functionality.
# 
# Test Categories:
# - @integration: Tests app behavior with mocked APIs (always runnable)
# - @error-handling: Tests error scenarios with mocked APIs (always runnable)  
# - @config-validation: Tests netlify.toml configuration (always runnable)
# - @real-api: Tests actual external API communication through Netlify redirects
# - @connectivity: Basic connectivity tests that work without API keys
# - @post-requests: Tests POST requests to external APIs
#
# IMPORTANT: To test REAL redirects (@real-api, @connectivity, @post-requests):
# 1. Start Netlify dev server: pnpm dev:netlify (runs on localhost:8888)
# 2. In another terminal, run tests: pnpm cypress:run --spec "cypress/e2e/features/api_redirects.feature"
# 3. Or filter by tag: cypress run --env "grepTags=@real-api"
#
# When running through regular Vite dev server (pnpm dev), the @real-api tests
# will detect they're not running through Netlify and gracefully handle it.
#
# Real redirect validation:
# - /api/deejai/* -> https://deej-ai.online/api/v1/*
# - /api/setlistfm/* -> https://api.setlist.fm/rest/1.0/*

Feature: API Redirects and Proxying
  As a user of the Unboreify application
  I want API calls to be properly redirected through Netlify
  So that external API integrations work correctly

  Background:
    Given I have a mocked authenticated session

  @integration
  Scenario: Deejai API integration through redirect
    Given I am on the queue page
    When I trigger an application request that uses "/api/deejai/search"
    Then the application should successfully use the redirected API

  @integration  
  Scenario: Setlist.fm API integration through redirect
    Given I am on the setlist page
    When I trigger an application request that uses "/api/setlistfm/search"
    Then the application should successfully use the redirected API

  @error-handling
  Scenario: Network error handling for redirected APIs
    Given the Deejai API is experiencing issues
    When I visit the queue page and try to generate a playlist
    Then I should see an appropriate error response
    And the error should be handled gracefully

  @error-handling
  Scenario: Rate limiting through redirected APIs
    Given the Setlist.fm API is rate limited
    When I visit the setlist page and search for an artist
    Then I should see a rate limit error response
    And the application should handle the rate limit appropriately

  @config-validation
  Scenario: Netlify redirect configuration validation
    Given I examine the netlify.toml configuration
    Then the Deejai API redirect should be properly configured
    And the Setlist.fm API redirect should be properly configured
    And the redirect paths should not conflict with application routes

  @netlify-dev-only @real-api
  Scenario: Real Deejai API redirect with response validation
    Given I am running through Netlify dev server
    When I make a real request to the Deejai API via "/api/deejai/playlist"
    Then the request should be successfully redirected to the real Deejai API
    And I should receive a real response from the external API

  @netlify-dev-only @real-api
  Scenario: Real Setlist.fm API artist search redirect
    Given I am running through Netlify dev server  
    When I make a real request to the Setlist.fm API via "/api/setlistfm/search/artists?artistName=coldplay"
    Then the request should be successfully redirected to the real Setlist.fm API
    And I should receive a real response from the external API

  @netlify-dev-only @real-api
  Scenario: Real Deejai API health check or basic endpoint
    Given I am running through Netlify dev server
    When I make a real request to the Deejai API via "/api/deejai/health"
    Then the request should be successfully redirected to the real Deejai API
    And I should receive a real response from the external API

  @netlify-dev-only @real-api
  Scenario: Real Setlist.fm API with basic search endpoint
    Given I am running through Netlify dev server
    When I make a real request to the Setlist.fm API via "/api/setlistfm/search/setlists?artistName=radiohead"
    Then the request should be successfully redirected to the real Setlist.fm API
    And I should receive a real response from the external API

  @netlify-dev-only @real-api @connectivity
  Scenario: Basic connectivity test for Deejai API redirect
    Given I am running through Netlify dev server
    When I make a request to test basic connectivity to "/api/deejai/"
    Then the redirect should work regardless of authentication

  @netlify-dev-only @real-api @connectivity  
  Scenario: Basic connectivity test for Setlist.fm API redirect
    Given I am running through Netlify dev server
    When I make a request to test basic connectivity to "/api/setlistfm/"
    Then the redirect should work regardless of authentication

  @netlify-dev-only @real-api @post-requests
  Scenario: Real Deejai API POST request for playlist generation
    Given I am running through Netlify dev server
    When I make a real POST request to the Deejai API via "/api/deejai/playlist"
    Then the request should be successfully redirected to the real Deejai API
    And I should see evidence of real Deejai API communication
