Feature: App Navigation and Routing
  As a user of Unboreify
  I want to navigate between different pages
  So that I can access all features of the application

  Background:
    Given I am using a "desktop" device

  Scenario: Navigation to public pages when not authenticated
    Given I am not logged in
    When I visit the "homepage" page
    Then I should be on the "homepage" page
    And I should see the "login button"

  Scenario: Navigation menu functionality on desktop
    Given I am logged in to Spotify
    And I am on the "homepage" page
    When I navigate to "festiclub"
    Then I should be on the "festiclub" page
    And I should see artist input fields

  Scenario: Mobile navigation
    Given I am using a "mobile" device
    And I am logged in to Spotify
    And I am on the "homepage" page
    When I open the live music menu on mobile
    Then I should see the live music menu options
    When I click on "festiclub-option"
    Then I should be on the "festiclub" page

  Scenario: User menu functionality
    Given I am logged in to Spotify
    And I am on the "homepage" page
    When I open the user menu
    Then I should see the user menu options
    When I click on "settings-menu-item"
    Then I should see the settings dialog

  Scenario: Deep links with parameters
    Given I am not logged in
    When I navigate using deep links with parameters
    Then I should be on the "festiclub" page
    And the URL parameters should be maintained

  Scenario: Browser navigation
    Given I am logged in to Spotify
    And I am on the "homepage" page
    When I navigate to "festiclub"
    And I navigate to "setlist"
    And I use the browser back button
    Then I should be on the "festiclub" page
    When I use the browser forward button
    Then I should be on the "setlist" page

  Scenario: Responsive navigation
    Given I am logged in to Spotify
    And I am on the "homepage" page
    Then the navigation should be responsive

  Scenario: Protected route redirection for unauthenticated users
    Given I am not logged in
    When I visit the "queue" page
    Then I should be redirected to the homepage
    And I should see "Login with Spotify"

  Scenario: Public route access without authentication
    Given I am not logged in
    When I visit the "homepage" page
    Then I should be on the "homepage" page
    And I should see "Login with Spotify"

  Scenario: FestiClub page access without authentication
    Given I am not logged in
    When I visit the "festiclub" page
    Then I should be on the "festiclub" page
    And I should see the FestiClub interface

  Scenario: Concert Setlist page access without authentication
    Given I am not logged in
    When I visit the "setlist" page
    Then I should be on the "setlist" page
    And I should see the Concert Setlist interface

  Scenario: Navigation menu visibility when authenticated
    Given I am logged in to Spotify
    And I am using a "desktop" device
    When I am on the "homepage" page
    Then I should see desktop navigation links
    And I should see "Home" navigation link
    And I should see "View Queues" navigation link
    And I should see "FestiClub" navigation link
    And I should see "Setlist" navigation link

  Scenario: Mobile navigation menu functionality
    Given I am logged in to Spotify
    And I am using a "mobile" device
    When I am on the "homepage" page
    Then I should see mobile navigation icons
    When I click the live music icon on mobile
    Then I should see the live music menu
    And I should see "FestiClub" option in mobile menu
    And I should see "Concert Setlist" option in mobile menu

  Scenario: Deep link parameter maintenance
    Given I am not logged in
    When I visit the festiclub page with artist parameters
    Then I should be on the "festiclub" page
    And the artist parameters should be loaded into the interface
    When I navigate to another page and return
    Then the URL parameters should still be maintained

  Scenario: OAuth callback route handling
    Given I am not logged in
    When I visit the OAuth callback page
    Then the callback should be handled appropriately
    And the page should not crash

  Scenario: OAuth callback with query parameters
    Given I am not logged in
    When I visit the OAuth callback with authentication parameters
    Then the parameters should be processed correctly
    And the authentication flow should complete

  Scenario: Unknown route handling
    Given I am on any page
    When I visit an unknown route
    Then the application should handle the unknown route gracefully
    And the page should remain functional

  Scenario: URL parameter preservation across navigation
    Given I am on the festiclub page with artist parameters
    When I navigate to the setlist page
    And I navigate back to festiclub with the same parameters
    Then the parameters should be preserved in the URL
    And the artist data should be loaded correctly
