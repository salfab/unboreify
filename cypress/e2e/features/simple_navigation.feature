Feature: Basic App Navigation
  As a user of Unboreify
  I want to navigate the app
  So that I can access different features

  Scenario: Visit homepage without authentication
    Given I am not logged in
    When I visit the "homepage" page
    Then I should see "Login with Spotify"
    And I should not be authenticated

  Scenario: Simple navigation test
    Given I am not logged in
    And I am on the "homepage" page
    Then I should see "Unboreify"
    And the "user-avatar" should not be visible
