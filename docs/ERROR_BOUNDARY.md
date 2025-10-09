# Error Boundary Documentation

## Overview

This application now includes enhanced error boundary components that provide a clean, user-friendly interface when errors occur, while offering debug capabilities especially useful for mobile testing.

## Components

### 1. `ErrorBoundary` (Class Component)
**File:** `src/components/ErrorBoundary.tsx`

A traditional React class-based error boundary component that can be used standalone.

**Features:**
- Catches JavaScript errors anywhere in the child component tree
- Displays a clean, Material-UI styled error interface
- Provides "Refresh Page" and "Go Home" buttons for recovery
- "Show Debug Info" button that logs detailed error information to console
- Mobile-friendly design
- Expandable technical details section

**Usage:**
```tsx
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 2. `EnhancedErrorFallback` (Functional Component)
**File:** `src/components/EnhancedErrorFallback.tsx`

A functional component designed to work with the `react-error-boundary` library (currently in use).

**Features:**
- Same UI and functionality as ErrorBoundary
- Works with `react-error-boundary`'s ErrorBoundary component
- Integrates with existing error boundary setup

**Usage:**
```tsx
import { ErrorBoundary } from 'react-error-boundary';
import EnhancedErrorFallback from './components/EnhancedErrorFallback';

<ErrorBoundary FallbackComponent={EnhancedErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

### 3. `ErrorTrigger` (Testing Component)
**File:** `src/components/ErrorTrigger.tsx`

A utility component for testing error boundary behavior during development.

**Features:**
- Triggers synchronous errors (caught by error boundaries)
- Triggers asynchronous errors (not caught by error boundaries)
- Triggers promise rejections (not caught by error boundaries)
- Only visible in development mode (`import.meta.env.DEV`)

## Current Implementation

The app currently uses `EnhancedErrorFallback` with the existing `react-error-boundary` setup in `App.tsx`:

```tsx
<ErrorBoundary FallbackComponent={EnhancedErrorFallback}>
  <Container data-testid="app-container">
    <Routes>
      {/* Your routes */}
    </Routes>
  </Container>
</ErrorBoundary>
```

## Mobile Debug Features

### Debug Button Functionality
1. **First Click:** Logs comprehensive error information to console and shows alert
2. **Toggle View:** Expands/collapses technical details in the UI including full stack trace
3. **Console Logging:** Includes:
   - Error object and message
   - Stack trace
   - Component stack (when available)
   - Timestamp
   - User agent
   - Current URL
4. **On-Page Display:** Shows the full stack trace directly in the UI for mobile debugging

### Mobile Testing Workflow
1. When an error occurs, you'll see the clean error UI
2. Click "Show Debug Info" button
3. An alert will notify you that debug info was logged and is displayed
4. View the full stack trace and error details directly on the page
5. No need to open developer tools - perfect for mobile debugging

## Error Types Caught

**✅ Caught by Error Boundaries:**
- Errors in render methods
- Errors in lifecycle methods
- Errors in constructor
- Errors in event handlers (when they cause state updates that trigger re-renders)

**❌ NOT Caught by Error Boundaries:**
- Errors in async code (setTimeout, promises)
- Errors in event handlers (unless they cause render errors)
- Errors during server-side rendering
- Errors thrown in the error boundary itself

## Testing

### Development Testing
- The `ErrorTrigger` component is automatically added to the HomePage in development mode
- Use the test buttons to verify error boundary behavior
- Test both caught and uncaught error scenarios

### Production Testing
- Error boundaries work in production builds
- Console logging is preserved for debugging
- Clean UI prevents user confusion

## Integration Examples

### Adding Error Boundaries to Specific Components
```tsx
// For critical components that might fail
<ErrorBoundary>
  <PlaylistToolsPage />
</ErrorBoundary>

// For async operations prone to errors
<ErrorBoundary>
  <SpotifyAPIComponent />
</ErrorBoundary>
```

### Custom Error Handling
```tsx
// You can extend the EnhancedErrorFallback for specific needs
const CustomErrorFallback = ({ error, resetErrorBoundary }) => {
  // Log to external service
  logErrorToService(error);
  
  // Use the enhanced fallback
  return <EnhancedErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
};
```

## Best Practices

1. **Strategic Placement:** Place error boundaries at component tree levels where recovery makes sense
2. **Multiple Boundaries:** Use multiple error boundaries to isolate failures
3. **Logging:** Always log errors for debugging and monitoring
4. **Recovery:** Provide clear recovery options (refresh, go home, retry)
5. **User Communication:** Keep error messages user-friendly and actionable

## Accessibility Features

- ARIA-compliant error announcements
- Keyboard navigation support
- High contrast error indicators
- Screen reader friendly error descriptions
- Focus management after error occurs

## Browser Support

- Works in all modern browsers
- Mobile-responsive design
- Touch-friendly interaction
- Graceful degradation for older browsers

## Future Enhancements

Potential improvements:
- Integration with error monitoring services (Sentry, Bugsnag)
- Automatic error reporting
- User feedback collection
- Custom recovery strategies per error type
- Offline error handling