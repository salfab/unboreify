import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import webpack from '@cypress/webpack-preprocessor';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8888',
    async setupNodeEvents(on, config) {
      // Add cucumber preprocessor plugin
      await addCucumberPreprocessorPlugin(on, config);
      
      // Add webpack preprocessor for TypeScript and feature files
      const webpackOptions = {
        resolve: {
          extensions: ['.ts', '.js', '.feature']
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: 'ts-loader',
                  options: {
                    transpileOnly: true
                  }
                }
              ]
            },
            {
              test: /\.feature$/,
              use: [
                {
                  loader: '@badeball/cypress-cucumber-preprocessor/webpack',
                  options: config
                }
              ]
            }
          ]
        }
      };
      
      on('file:preprocessor', webpack({ webpackOptions }));
      
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
      
      return config;
    },
    supportFile: 'cypress/support/e2e.ts',
    specPattern: ['cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', 'cypress/e2e/**/*.feature'],
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      // These will be loaded from .env.local or environment variables
      SPOTIFY_TEST_USERNAME: process.env.CYPRESS_SPOTIFY_TEST_USERNAME,
      SPOTIFY_TEST_PASSWORD: process.env.CYPRESS_SPOTIFY_TEST_PASSWORD,
      SPOTIFY_CLIENT_ID: process.env.VITE_SPOTIFY_CLIENT_ID,
      SPOTIFY_REDIRECT_URI: process.env.VITE_SPOTIFY_REDIRECT_URI,
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
});
