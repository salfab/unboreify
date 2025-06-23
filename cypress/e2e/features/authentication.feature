Feature: Spotify OAuth Authentication
  As a user of Unboreify
  I want to authenticate with Spotify
  So that I can access my music data and manage my playlists

  Background:
    Given I am using a "desktop" device
    And I am on the "homepage" page

  Scenario: Successful OAuth login flow
    Given I am not logged in
    When I attempt to log in with Spotify
    And I complete the OAuth flow
    Then I should be authenticated
    And I should see my Spotify profile information

  Scenario: Authentication state persistence
    Given I am logged in to Spotify
    When I reload the page
    And I wait for the page to load
    Then I should be authenticated
    And my authentication state should persist across page reloads

  Scenario: Logout functionality
    Given I am logged in to Spotify
    When I log out using the user menu
    Then I should not be authenticated
    And my tokens should be cleared
    And I should see "Login with Spotify"

  Scenario: Protected route access for authenticated users
    Given I am logged in to Spotify
    When I visit the "queue" page
    Then I should be on the "queue" page
    And I should be able to make authenticated API calls

  Scenario: Protected route redirection for unauthenticated users
    Given I am not logged in
    When I visit the "queue" page
    Then I should be redirected to the homepage
    And I should see "Login with Spotify"

  Scenario: OAuth error handling
    Given I am not logged in
    And the API returns an error
    When I attempt to log in with Spotify  
    And I complete the OAuth flow
    Then I should see an error boundary
    And I should not be authenticated
  Scenario: Token expiration handling
    Given I have an expired authentication token
    When I visit the "queue" page
    Then my token should be refreshed automatically

  Scenario: Token clearing on logout
    Given I am logged in to Spotify
    When I log out using the user menu
    Then my authentication tokens should be completely cleared from storage
    And I should not be able to access protected routes

  Scenario: Authenticated API calls
    Given I am logged in to Spotify
    When I visit the "homepage" page
    Then authenticated API calls should be made successfully
    And I should see my Spotify profile information

  Scenario: API error handling during authentication
    Given I am logged in to Spotify
    And the Spotify API returns an error
    When I visit the "homepage" page
    Then the application should handle the API error gracefully
    And the app should remain functional

  Scenario: OAuth callback error handling
    Given I am not logged in
    When I visit the OAuth callback with an error parameter
    Then the application should handle the OAuth error gracefully
    And I should see appropriate error messaging or redirect

  Scenario: Authentication state verification across app reloads
    Given I am logged in to Spotify
    When I reload the page multiple times
    Then my authentication state should persist consistently
    And I should remain logged in without re-authentication
