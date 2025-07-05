Feature: Playlist Track Removal and Enhancement
  As a user of Unboreify
  I want to remove tracks from a playlist and then enhance it
  So that the enhancement only uses the remaining tracks

  Background:
    Given I am logged in to Spotify
    And I am on the "queue" page
    And I have playlists available

  Scenario: Track removal affects playlist enhancement correctly
    When I click on a playlist in the presenter
    Then I should see the playlist tracks
    When I remove a specific track from the playlist
    Then the track should be removed from the display
    When I click the enhance button for the playlist
    Then the API call should only include IDs of remaining tracks
    And the removed track ID should not be in the request

  Scenario: Multiple track removals before enhancement
    When I click on a playlist in the presenter
    Then I should see the playlist tracks
    When I remove multiple tracks from the playlist
    Then the tracks should be removed from the display
    When I click the enhance button for the playlist
    Then the API call should only include IDs of remaining tracks
    And the removed track IDs should not be in the request

  Scenario: Track removal and playlist mode switching
    When I click on a playlist in the presenter
    Then I should see the playlist tracks
    When I remove a track from the playlist
    And I switch between extend and alternative playlist modes
    When I click the enhance button for the playlist
    Then the API call should only include IDs of remaining tracks
