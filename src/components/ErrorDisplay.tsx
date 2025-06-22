import axios, { AxiosError } from 'axios';
import React from 'react';

interface ErrorDisplayProps {
    error: Error | AxiosError;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
    if (axios.isAxiosError(error)) {

        if (error.response?.status === 403) {
            return <div data-testid="error-boundary"><h1 data-testid="error-message">The application is not yet available for you.</h1></div>;
        }
        if (error.response?.status === 429) {
            // I wanted to show a message to tell the user when they can retry, but : https://community.spotify.com/t5/Spotify-for-Developers/retry-after-header-not-accessible-in-web-app/td-p/5433144
            return <div data-testid="error-boundary"><h1 data-testid="error-message">Too many requests : Retry later</h1></div>;
        }
        return <div data-testid="error-boundary"><h1 data-testid="error-message">Something went wrong</h1><h2>{error.message} - {error.response?.data.error.message}</h2></div>;

    }
    return <div data-testid="error-boundary"><h1 data-testid="error-message">Something went wrong.</h1></div>;
};

export default ErrorDisplay;