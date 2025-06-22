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
