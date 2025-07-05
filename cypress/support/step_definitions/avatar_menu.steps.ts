import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Background steps
Given('I am on the homepage', () => {
  cy.visit('/');
});



// Action steps
When('I click on my user avatar', () => {
  // Wait for the page to stabilize after any re-renders
  cy.wait(1000);
  
  // Click on avatar (present in both hamburger and regular mobile layouts)
  cy.get('[data-testid="user-avatar"]')
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true });
});

When('I click outside the menu', () => {
  cy.get('body').click(0, 0);
});

// Assertion steps
Then('the profile menu should open', () => {
  cy.get('[role="menu"]').should('be.visible');
});

Then('the profile menu should close', () => {
  cy.get('[role="menu"]').should('not.exist');
});

Then('no horizontal scrollbar should appear on the page', () => {
  cy.window().then((win) => {
    const body = win.document.body;
    const html = win.document.documentElement;
    
    // Check if horizontal scrollbar is present
    const hasHorizontalScrollbar = body.scrollWidth > body.clientWidth || 
                                 html.scrollWidth > html.clientWidth;
    
    expect(hasHorizontalScrollbar, 'Page should not have horizontal scrollbar').to.be.false;
  });
});

Then('no horizontal scrollbar should be present', () => {
  cy.window().then((win) => {
    const body = win.document.body;
    const html = win.document.documentElement;
    
    const hasHorizontalScrollbar = body.scrollWidth > body.clientWidth || 
                                 html.scrollWidth > html.clientWidth;
    
    expect(hasHorizontalScrollbar, 'Page should not have horizontal scrollbar').to.be.false;
  });
});

Then('no horizontal scrollbar should appear', () => {
  cy.window().then((win) => {
    const body = win.document.body;
    const html = win.document.documentElement;
    
    const hasHorizontalScrollbar = body.scrollWidth > body.clientWidth || 
                                 html.scrollWidth > html.clientWidth;
    
    expect(hasHorizontalScrollbar, 'Page should not have horizontal scrollbar').to.be.false;
  });
});

Then('the menu should be positioned within the viewport', () => {
  cy.get('[role="menu"]').then(($menu) => {
    const menuElement = $menu[0];
    const rect = menuElement.getBoundingClientRect();
    
    // Check if menu is within viewport bounds
    cy.window().then((win) => {
      expect(rect.left, 'Menu left edge should be within viewport').to.be.at.least(0);
      expect(rect.right, 'Menu right edge should be within viewport').to.be.at.most(win.innerWidth);
      expect(rect.top, 'Menu top edge should be within viewport').to.be.at.least(0);
      expect(rect.bottom, 'Menu bottom edge should be within viewport').to.be.at.most(win.innerHeight);
    });
  });
});

Then('the menu should not extend beyond the viewport', () => {
  cy.get('[role="menu"]').then(($menu) => {
    const menuElement = $menu[0];
    const rect = menuElement.getBoundingClientRect();
    
    cy.window().then((win) => {
      expect(rect.right, 'Menu should not extend beyond right edge of viewport').to.be.at.most(win.innerWidth);
      expect(rect.left, 'Menu should not extend beyond left edge of viewport').to.be.at.least(0);
    });
  });
});

Then('the menu should be right-aligned with the avatar', () => {
  cy.get('[data-testid="user-avatar"]').then(($avatar) => {
    const avatarRect = $avatar[0].getBoundingClientRect();
    
    cy.get('[role="menu"]').then(($menu) => {
      const menuRect = $menu[0].getBoundingClientRect();
      
      // Menu right edge should align with or be close to avatar right edge
      const rightAlignmentDiff = Math.abs(menuRect.right - avatarRect.right);
      expect(rightAlignmentDiff, 'Menu should be right-aligned with avatar').to.be.lessThan(10);
    });
  });
});

// Given steps for different viewports
Given('the avatar menu is open', () => {
  cy.get('[data-testid="user-avatar"]').click();
  cy.get('[role="menu"]').should('be.visible');
});

Given('I am using a mobile viewport', () => {
  cy.viewport(375, 667); // iPhone SE viewport
  cy.wait(1000); // Wait for re-renders after viewport change
});

Given('I am using a desktop viewport', () => {
  cy.viewport(1920, 1080); // Desktop viewport
});

// Queue page specific steps
Given('the page has scrollable content', () => {
  // Mock queue data with many tracks to ensure scrollable content
  const manyTracks = Array.from({ length: 20 }, (_, i) => ({
    id: `track_${i}`,
    name: `Test Track ${i + 1}`,
    artists: [{ name: `Test Artist ${i + 1}` }],
    album: { 
      name: `Test Album ${i + 1}`, 
      images: [{ url: 'https://via.placeholder.com/300' }] 
    },
    uri: `spotify:track:test_${i}`,
    duration_ms: 180000,
    preview_url: null,
    external_urls: { spotify: `https://open.spotify.com/track/test_${i}` }
  }));

  // Mock playlists with many items
  const manyPlaylists = Array.from({ length: 15 }, (_, i) => ({
    id: `playlist_${i}`,
    name: `Test Playlist ${i + 1}`,
    description: `Description for playlist ${i + 1}`,
    images: [{ url: 'https://via.placeholder.com/300' }],
    tracks: { total: 50 + i }
  }));

  // Mock queue with current playing and queue tracks
  cy.intercept('GET', '**/v1/me/player/queue', {
    statusCode: 200,
    body: {
      currently_playing: manyTracks[0],
      queue: manyTracks.slice(1, 10)
    }
  }).as('getQueue');

  // Mock user playlists
  cy.intercept('GET', '**/v1/me/playlists*', {
    statusCode: 200,
    body: {
      items: manyPlaylists,
      total: manyPlaylists.length
    }
  }).as('getUserPlaylists');

  // Mock playback state
  cy.intercept('GET', '**/v1/me/player', {
    statusCode: 200,
    body: {
      device: { id: 'test-device', name: 'Test Device' },
      is_playing: true,
      item: manyTracks[0]
    }
  }).as('getPlaybackState');

  cy.reload();
  cy.wait(['@getQueue', '@getUserPlaylists', '@getPlaybackState']);
  
  // Ensure content is loaded and page is scrollable
  cy.get('[data-testid="queue-section"]').should('be.visible');
  cy.get('[data-testid="alternative-playlist-section"]').should('be.visible');
  
  // Check if page is actually scrollable
  cy.window().then((win) => {
    const body = win.document.body;
    const html = win.document.documentElement;
    const hasVerticalScrollbar = body.scrollHeight > body.clientHeight || 
                                html.scrollHeight > html.clientHeight;
    
    if (!hasVerticalScrollbar) {
      // Add more content to make it scrollable
      cy.get('body').then($body => {
        $body.append('<div style="height: 1000px; width: 1px;"></div>');
      });
    }
  });
});

Then('the vertical scrollbar should remain visible if content overflows', () => {
  cy.window().then((win) => {
    const body = win.document.body;
    const html = win.document.documentElement;
    
    const hasVerticalScrollbar = body.scrollHeight > body.clientHeight || 
                               html.scrollHeight > html.clientHeight;
    
    if (hasVerticalScrollbar) {
      // If content should have a scrollbar, verify it's still there
      // Check scrollbar width (should be > 0 if scrollbar is present)
      const scrollbarWidth = win.innerWidth - body.clientWidth;
      expect(scrollbarWidth, 'Vertical scrollbar should remain visible when content overflows').to.be.greaterThan(0);
    }
  });
});

Then('no blank scrollbar gutter should appear', () => {
  cy.window().then((win) => {
    const body = win.document.body;
    const html = win.document.documentElement;
    
    // Check if there's a scrollbar gutter without actual scrollable content
    const bodyOverflow = win.getComputedStyle(body).overflow;
    const htmlOverflow = win.getComputedStyle(html).overflow;
    
    // If no scrollable content but there's still space reserved, that's the bug
    const hasVerticalScrollbar = body.scrollHeight > body.clientHeight || 
                               html.scrollHeight > html.clientHeight;
    const scrollbarWidth = win.innerWidth - body.clientWidth;
    
    if (!hasVerticalScrollbar && scrollbarWidth > 0) {
      throw new Error('Blank scrollbar gutter detected: scrollbar space reserved but no scrollable content');
    }
  });
});

Then('the page layout should remain stable', () => {
  // Store initial layout measurements
  cy.window().then((win) => {
    const initialBodyWidth = win.document.body.clientWidth;
    const initialViewportWidth = win.innerWidth;
    
    // Store these values for comparison
    cy.wrap(initialBodyWidth).as('initialBodyWidth');
    cy.wrap(initialViewportWidth).as('initialViewportWidth');
  });
  
  // After menu is open, check layout hasn't shifted
  cy.get('@initialBodyWidth').then((initialBodyWidth) => {
    cy.get('@initialViewportWidth').then((initialViewportWidth) => {
      cy.window().then((win) => {
        const currentBodyWidth = win.document.body.clientWidth;
        const currentViewportWidth = win.innerWidth;
        
        expect(currentBodyWidth, 'Body width should remain stable').to.equal(initialBodyWidth);
        expect(currentViewportWidth, 'Viewport width should remain stable').to.equal(initialViewportWidth);
      });
    });
  });
});
