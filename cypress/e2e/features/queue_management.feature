Feature: Queue Management
  As an authenticated Spotify user
  I want to manage my music queue
  So that I can control my listening experience

  Background:
    Given I am using a "desktop" device
    And I am logged in to Spotify

  Scenario: Queue operations for authenticated users
    Given I am on the "queue" page
    Then I should see playlist generation options
    And I should see queue operations
    When I click the clear queue button
    Then the queue should be empty
