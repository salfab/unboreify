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
