import axios, { AxiosError } from 'axios';
import React from 'react';

interface ErrorDisplayProps {
    error: Error | AxiosError;  
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
        return <h1>The application is not yet available for you.</h1>;
    }
    if (axios.isAxiosError(error) && error.response?.status === 429) {
        // I wanted to show a message to tell the user when they can retry, but : https://community.spotify.com/t5/Spotify-for-Developers/retry-after-header-not-accessible-in-web-app/td-p/5433144
        return <h1>Too many requests : Retry later</h1>;
    }
    return <h1>Something went wrong.</h1>;
};

export default ErrorDisplay;