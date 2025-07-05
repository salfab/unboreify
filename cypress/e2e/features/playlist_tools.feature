Feature: Playlist Tools
  As a user of Unboreify
  I want to use playlist management tools
  So that I can analyze, compare, and create new playlists from my existing ones

  Background:
    Given I am logged in to Spotify
    And I have multiple playlists available

  Scenario: Access Playlist Tools page
    When I navigate to "playlist-tools"
    Then I should see the "Playlist Tools" page
    And I should see the "Playlist Diff" tool card
    And I should see the "Playlist Merge" tool card as coming soon
    And I should see the "Playlist Analytics" tool card as coming soon

  Scenario: Navigate to Playlist Diff tool
    Given I am on the playlist tools page
    When I click on the "Playlist Diff" tool
    Then I should see the Playlist Diff interface
    And I should see the back to tools button
    And I should see two playlist selectors
    And I should see diff mode options

  Scenario: Compare playlists using intersection mode
    Given I am in the Playlist Diff tool
    When I select a base playlist
    And I select a comparison playlist
    And I choose "intersection" mode
    And I click "Compare Playlists"
    Then I should see the diff results
    And I should see tracks that exist in both playlists
    And I should see a count of matching tracks

  Scenario: Compare playlists using base-only mode
    Given I am in the Playlist Diff tool
    When I select a base playlist
    And I select a comparison playlist
    And I choose "base only" mode
    And I click "Compare Playlists"
    Then I should see the diff results
    And I should see tracks that exist only in the base playlist

  Scenario: Compare playlists using target-only mode
    Given I am in the Playlist Diff tool
    When I select a base playlist
    And I select a comparison playlist
    And I choose "target only" mode
    And I click "Compare Playlists"
    Then I should see the diff results
    And I should see tracks that exist only in the comparison playlist

  Scenario: Compare playlists using symmetric difference mode
    Given I am in the Playlist Diff tool
    When I select a base playlist
    And I select a comparison playlist
    And I choose "symmetric difference" mode
    And I click "Compare Playlists"
    Then I should see the diff results
    And I should see tracks that exist in either playlist but not both

  Scenario: Compare playlists using union mode
    Given I am in the Playlist Diff tool
    When I select a base playlist
    And I select a comparison playlist
    And I choose "union" mode
    And I click "Compare Playlists"
    Then I should see the diff results
    And I should see all tracks from both playlists

  Scenario: Save diff results as new playlist
    Given I have performed a playlist diff with results
    When I click the save playlist button
    Then I should see the save to Spotify dialog
    When I enter a playlist name "My Awesome Diff Result"
    And I confirm saving to Spotify
    Then the playlist should be created in my Spotify account
    And I should see a success message
    And the dialog should close automatically

  Scenario: Cancel playlist save operation
    Given I have performed a playlist diff with results
    When I click the save playlist button
    Then I should see the save to Spotify dialog
    When I cancel the save dialog
    Then the dialog should close
    And no playlist should be created

  Scenario: Return to tools from diff interface
    Given I am in the Playlist Diff tool
    When I click the back to tools button
    Then I should see the "Playlist Tools" page
    And I should see all available tool cards

  Scenario: Diff tool handles empty results gracefully
    Given I am in the Playlist Diff tool
    When I select two playlists with no common tracks
    And I choose "intersection" mode
    And I click "Compare Playlists"
    Then I should see "0 tracks found"
    And I should see an appropriate empty state message

  Scenario: Diff tool shows loading states
    Given I am in the Playlist Diff tool
    When I select a base playlist
    And I select a comparison playlist
    And I click "Compare Playlists"
    Then I should see a loading indicator
    And playlist selectors should be disabled during loading
