
# Unboreify

Unboreify is a React application that allows users to log into Spotify, view their name, and manage their playback queue by generating an alternative playlist with AI. The app leverages Spotify's OAuth 2.0 for authentication and provides a seamless experience by handling token refresh automatically. 

## Motivation

Spotify's algorithm for "Made for You" playlists tends to feature the same curated songs, even when the same artist has produced numerous other amazing and fitting tracks. This often leads to what can be described as "Spotify algorithm fatigue." I wanted to build an app that finds similar songs but offers a fresh selection of tracks, avoiding the repetition of the same few songs. Unboreify aims to provide a more diverse and engaging listening experience by identifying and playing lesser-known but equally fitting songs.

The alternative playlists are generated using AI, by [using a model ](https://github.com/teticio/Deej-AI) developped by [Robert Dargavel Smith](https://github.com/teticio)

## Features

- Spotify OAuth 2.0 authentication
- Display logged-in user's name
- Replace the current playback queue or playlists with an alternative playlist
- Enhance the the current queue or playlists with similar songs by adding similar songs in between
- Play the generated playlist directly on spotify's play queue, without the need to generate an actual temporary playlist on your account.
- Secure token management with automatic token refresh
- PWA

## Early Development

This project is currently in its early stages of development. It uses the [Deej-AI API](https://deej-ai.online/) to find appropriate tracks. In the future, instead of relying on the existing API, we plan to run our own instance using Docker to make it deployable anywhere. This will be implemented once the proof of concept phase is complete.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PNPM package manager
- Spotify Developer Account
- Netlify CLI

### Installation

1. Clone the repository:

```bash
git clone https://github.com/salfab/unboreify.git
cd unboreify
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file in the root directory and add your Spotify Client ID and Redirect URI:

```plaintext
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

4. Start the development server using Netlify Dev to benefit from redirects and avoid CORS issues:

```bash
netlify dev
```

Your app should now be running at `http://localhost:8888`.

### Deployment

This project is set up to deploy using Netlify's CI/CD.

## Token Management

- Access tokens are short-lived (typically 1 hour). The app uses refresh tokens to obtain new access tokens without requiring user re-authentication.
- Refresh tokens are long-lived and are stored in the local session of the browser. The app handles token refresh automatically.

## Using Deej-AI API

This application currently uses the [Deej-AI API](https://deej-ai.online/) for additional functionality. The AI model, developed by the talented [Teticio](https://github.com/teticio) as part of his master's thesis, employs musical spectral analysis to create feature vectors similar to the word2vec technique used in natural language processing. Instead of focusing on musical preferences, it identifies musical similarities between tracks. The model processes large amounts of tracks data and uses a Track2Vec embedding technique to find songs with similar characteristics. Read more on his GitHub account for more details, it's really cool stuff. In the future, we plan to host our own instance of the Deej-AI API using Docker, making the app more flexible and deployable anywhere.

However, as per Spotify's terms of use and general restrictions, we will not train the model to expand the capabilities of the existing model, which will be used as-is. 


## CORS Handling & API Proxying

We use Netlify's redirect functionality to proxy API requests and avoid CORS issues. This setup allows the frontend to make same-origin requests while Netlify handles the external API calls behind the scenes.

### How It Works

1. **Frontend calls**: `/api/deejai/playlist` (same-origin request)
2. **Netlify proxies to**: `https://deej-ai.online/api/v1/playlist` (external API)
3. **Browser receives**: API response as if it came from same domain

### Configuration

**netlify.toml** (main configuration):

```toml
[dev]
  command = "pnpm run dev"
  port = 8888                    # Netlify Dev port
  targetPort = 5173              # Vite dev server port

[[redirects]]
  from = "/api/deejai/*"
  to = "https://deej-ai.online/api/v1/:splat"
  status = 200                   # Proxy (not redirect)
  force = true                   # Override catch-all routes
```

**public/_redirects** (fallback for SPA routing):

```plaintext
/*        /index.html                  200
```

### Development vs Production

- **Development**: Use `netlify dev` to enable proxy functionality locally
- **Production**: Netlify Edge automatically handles proxying globally
- **Benefits**: Same code works in both environments, no CORS issues, API keys hidden from frontend

## Acknowledgements

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [MUI (Material-UI)](https://mui.com/)
- [Deej-AI API](https://deej-ai.online/) and [Deej-AI GitHub Repository](https://github.com/teticio/Deej-AI)

## Contributing

Pull requests and new ideas are welcome! I am using this project as a pet project to refine my React and UX skills, so feedback is more than welcome.

## Contact

The app is available at [https://unboreify.netlify.app/](https://unboreify.netlify.app/). For now, it is still in beta phase and not publicly available, as per Spotify's restrictions.

For any questions, suggestions or issues, please open an issue on GitHub.
