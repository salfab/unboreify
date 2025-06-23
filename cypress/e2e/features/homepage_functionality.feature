Feature: Homepage and Core App Functionality
  As a user of Unboreify
  I want to access and use the main application features
  So that I can interact with my Spotify music effectively

  Background:
    Given I am using a "desktop" device

  Scenario: Homepage elements display for unauthenticated users
    Given I am not logged in
    When I visit the "homepage" page
    Then I should see the Unboreify branding
    And I should see "Make your Spotify playlists less boring"
    And I should see "Login with Spotify"
    And I should see the application footer

  Scenario: Homepage responsive navigation display
    Given I am not logged in
    When I visit the "homepage" page
    Then I should see the app navigation bar
    And I should see the main toolbar
    And the page should be properly styled

  Scenario: FestiClub interface display
    Given I am not logged in
    When I visit the "festiclub" page
    Then I should see "FestiClub" heading
    And I should see artist input fields
    And I should see artist text area

  Scenario: FestiClub artist input functionality
    Given I am not logged in
    And I am on the "festiclub" page
    When I enter multiple artist names in the text area
    Then the artist names should be stored in the text area
    And I should see the entered artist names

  Scenario: FestiClub navigation with artist parameters
    Given I am not logged in
    And I am on the "festiclub" page
    When I enter artist names and navigate with parameters
    Then I should be on the "festiclub" page
    And the URL should contain artist parameters
    And the URL should be updated with the artist data

  Scenario: FestiClub URL parameter loading
    Given I am not logged in
    When I visit the festiclub page with predefined artist parameters
    Then I should be on the "festiclub" page
    And the artist names should be loaded into the text area
    And the predefined artists should be visible

  Scenario: Concert Setlist interface display
    Given I am not logged in
    When I visit the "setlist" page
    Then I should see "Concert Setlist" heading
    And I should see "Build a playlist from a Concert Setlist"
    And I should see artist search autocomplete

  Scenario: Concert Setlist artist search functionality
    Given I am not logged in
    And I am on the "setlist" page
    When I search for an artist in the autocomplete
    Then the artist search should trigger an API call
    And I should see artist search suggestions

  Scenario: Queue interface display for authenticated users
    Given I am logged in to Spotify
    When I visit the "queue" page
    Then I should see the Queue interface
    And I should see queue-related content

  Scenario: Playlist options display for authenticated users
    Given I am logged in to Spotify
    When I visit the "queue" page
    Then I should see playlist options
    And playlist data should be loaded from Spotify

  Scenario: Queue operations for authenticated users
    Given I am logged in to Spotify
    When I visit the "queue" page
    Then I should see current queue data
    And queue information should be loaded from Spotify

  Scenario: Settings dialog opening and closing
    Given I am logged in to Spotify
    And I am on the "homepage" page
    When I open the settings dialog
    Then I should see the settings dialog
    And I should see settings content
    When I close the settings dialog with escape key
    Then the settings dialog should be closed

  Scenario: Settings playlist multiplier adjustment
    Given I am logged in to Spotify
    And I am on the "homepage" page
    When I open the settings dialog
    Then I should see playlist multiplier controls
    And I should be able to adjust settings values

  Scenario: Network error handling
    Given I am on any page
    And the network returns server errors
    When I trigger network requests
    Then the application should handle network errors gracefully
    And the app should remain functional

  Scenario: Error boundary functionality
    Given I am on any page
    When React errors occur in the application
    Then error boundaries should catch the errors
    And the app should display appropriate error handling

  Scenario: Mobile viewport responsiveness
    Given I am using a "mobile" device
    When I visit the "homepage" page
    Then I should see the Unboreify branding
    And I should see the mobile-optimized navigation
    And the page should be responsive for mobile

  Scenario: Tablet viewport responsiveness
    Given I am using a "tablet" device
    When I visit the "homepage" page
    Then I should see the Unboreify branding
    And I should see the tablet-optimized navigation
    And the page should be responsive for tablet

  Scenario: Mobile navigation adaptation
    Given I am using a "mobile" device
    When I visit the "homepage" page
    Then the navigation should adapt for mobile viewports
    And I should see mobile-appropriate navigation elements
