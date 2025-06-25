Feature: Avatar Menu Layout
  As a user
  I want to click on my avatar in the top navigation
  So that I can access my profile menu without causing layout issues

  Background:
    Given I am on the homepage
    And I am logged in to Spotify

  Scenario: Avatar menu opens without horizontal scrollbar
    When I click on my user avatar
    Then the profile menu should open
    And no horizontal scrollbar should appear on the page
    And the menu should be positioned within the viewport

  Scenario: Avatar menu closes properly
    Given the avatar menu is open
    When I click outside the menu
    Then the profile menu should close
    And no horizontal scrollbar should be present

  Scenario: Avatar menu on queue page with scrollable content
    Given I am on the queue page
    And the page has scrollable content
    When I click on my user avatar
    Then the profile menu should open
    And the vertical scrollbar should remain visible if content overflows
    And no blank scrollbar gutter should appear
    And the page layout should remain stable

  Scenario: Avatar menu positioning on mobile
    Given I am using a mobile viewport
    When I click on my user avatar
    Then the profile menu should open
    And the menu should not extend beyond the viewport
    And no horizontal scrollbar should appear

  Scenario: Avatar menu positioning on desktop
    Given I am using a desktop viewport
    When I click on my user avatar
    Then the profile menu should open
    And the menu should be right-aligned with the avatar
    And no horizontal scrollbar should appear
