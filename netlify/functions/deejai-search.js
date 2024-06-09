import https from 'https';
import { URLSearchParams } from 'url';

export const handler = async (event) => {
  return new Promise((resolve) => {
    try {
      const { string, max_items } = event.queryStringParameters;
      const params = new URLSearchParams({ string, max_items });

      const options = {
        hostname: 'deej-ai.online',
        path: `/api/v1/search?${params.toString()}`,
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({
              statusCode: 200,
              body: data,
            });
          } else {
            resolve({
              statusCode: res.statusCode,
              body: JSON.stringify({ error: `Request failed with status code ${res.statusCode}` }),
            });
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error fetching search results:', error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        });
      });

      req.end();
    } catch (error) {
      console.error('Unexpected error:', error);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      });
    }
  });
};
