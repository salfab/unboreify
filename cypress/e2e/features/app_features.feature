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

  # Scenario: Concert setlist search
  #   Given I am not logged in
  #   And I am on the "setlist" page
  #   When I search for artist "Radiohead"
  #   Then I should see artist search suggestions
  #   When I select a concert from the results
  #   Then I should see concert search results

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

  # Scenario: Playlist Generation from queue
  #   Given I am logged in to Spotify
  #   And I have a current queue with tracks
  #   When I visit the "queue" page
  #   And I generate a playlist
  #   Then I should see a loading indicator
  #   And I should see progress updates for playlist generation
  #   When the playlist generation completes
  #   Then I should see an alternative playlist with recommended tracks
  #   And the alternative tracks should be different from the queue tracks
  #   And I should see a success message "You have been unboreified"

  # Simple test to verify queue API mocking works
  Scenario: Queue page shows mocked data
    Given I am logged in to Spotify
    And I have a current queue with tracks
    When I visit the "queue" page
    Then I should see "Radiohead" on the page
    And I should see "Paranoid Android" on the page

  Scenario: Track removal from queue affects playlist generation
    Given I am logged in to Spotify
    And I have a current queue with tracks
    When I visit the "queue" page
    And I remove a track from the queue
    And I generate a playlist
    Then the removed track should not be included in the playlist generation request
    And I should see an alternative playlist based on remaining tracks

  # Scenario: Track removal from alternative playlist
  #   Given I am logged in to Spotify
  #   And I have a generated alternative playlist
  #   When I remove a track from the alternative playlist
  #   Then the track should no longer be visible in the alternative playlist
  #   And the remaining tracks should still be displayed

  Scenario: Enhanced playlist generation excludes removed tracks
    Given I am logged in to Spotify
    And I have a current queue with tracks
    When I visit the "queue" page
    And I remove a track from the queue
    And I enable playlist extension mode
    And I generate an extended playlist
    Then the removed track should not be included in the enhancement request
    And I should see an extended playlist based on remaining tracks

  Scenario: Multiple track removals from queue
    Given I am logged in to Spotify
    And I have a current queue with tracks
    When I visit the "queue" page
    And I remove multiple tracks from the queue
    And I generate a playlist
    Then none of the removed tracks should be included in the playlist generation request
    And I should see an alternative playlist based on remaining tracks

  Scenario: Removing all tracks from queue
    Given I am logged in to Spotify
    And I have a current queue with tracks
    When I visit the "queue" page
    And I remove all tracks from the queue
    And I generate a playlist
    Then I should see a message about empty queue or a default playlist

  Scenario: Track removal persists across page refreshes
    Given I am logged in to Spotify
    And I have a current queue with tracks
    When I visit the "queue" page
    And I remove a track from the queue
    And I refresh the page
    Then the removed track should still not be visible in the queue
    When I generate a playlist
    Then the removed track should not be included in the playlist generation request

  @skip
  Scenario: Alternative playlist track removal and regeneration
    Given I am logged in to Spotify
    And I have a generated alternative playlist
    When I remove multiple tracks from the alternative playlist
    And I regenerate the playlist
    Then the removed tracks should not be included in subsequent playlist requests
    And I should see fresh recommendations replacing the removed tracks

  Scenario: Undo track removal functionality
    Given I am logged in to Spotify
    And I have a current queue with tracks
    When I visit the "queue" page
    And I remove a track from the queue
    And I undo the track removal
    Then the track should be visible in the queue again
    When I generate a playlist
    Then the track should be included in the playlist generation request
