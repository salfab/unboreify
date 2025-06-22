Feature: Application Core Features
  As a user of Unboreify
  I want to use the core features like FestiClub and Queue management
  So that I can discover and manage music

  Background:
    Given I am using a "desktop" device

  Scenario: FestiClub artist management
    Given I am not logged in
    And I am on the "festiclub" page
    When I enter artist names "Radiohead, Coldplay"
    Then I should see 2 artist input fields
    When I add another artist field
    Then I should see 3 artist input fields

  Scenario: Concert setlist search
    Given I am not logged in
    And I am on the "setlist" page
    When I search for artist "Radiohead"
    Then I should see artist search suggestions
    When I select a concert from the results
    Then I should see concert search results

  Scenario: Settings dialog functionality
    Given I am logged in to Spotify
    And I am on the "homepage" page
    When I open the settings dialog
    Then I should see the settings dialog
    When I change the playlist multiplier to 5
    And I close the settings dialog
    Then the settings dialog should be closed
    And the playlist multiplier should be 5

  Scenario: Responsive design on different devices
    Given I am not logged in
    And I am on the "homepage" page
    Then the page should be responsive on "mobile"
    And the page should be responsive on "tablet"
    And the page should be responsive on "desktop"

  Scenario: Error handling
    Given I am logged in to Spotify
    And the network is unavailable
    When I visit the "queue" page
    And I trigger a network request
    Then I should see an error message

  Scenario: Loading states
    Given I am logged in to Spotify
    When I visit the "queue" page
    And I generate a playlist
    Then I should see a loading indicator
