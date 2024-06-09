import https from 'https';
import { Buffer } from 'buffer';

export const handler = async (event) => {
  console.log('event:', event);
  const { track_ids, size, creativity, noise } = JSON.parse(event.body);

  const postData = JSON.stringify({
    track_ids,
    size,
    creativity,
    noise,
  });

  const options = {
    hostname: 'deej-ai.online',
    path: '/api/v1/playlist',
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
    timeout: 30000, // 30 seconds timeout
  };

  return new Promise((resolve) => {
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
            body: JSON.stringify({
              message: `Request failed with status code ${res.statusCode}`,
              details: data,
            }),
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ message: error.message }),
      });
    });

    req.on('timeout', () => {
      req.abort();
      resolve({
        statusCode: 504,
        body: JSON.stringify({ message: 'Request timed out' }),
      });
    });

    req.write(postData);
    req.end();
  });
};
