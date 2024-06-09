// netlify/functions/deejaiProxy.mjs
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'https://deej-ai.online/api/v1',
  timeout: 30000,
});

export const handler = async (event) => {
  console.log('event:', event);
  const { track_ids, size, creativity, noise } = JSON.parse(event.body);

  try {
    const response = await axiosInstance.post('/playlist', {
      track_ids,
      size,
      creativity,
      noise,
    }, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ message: error.message, details: error.response?.data }),
    };
  }
};
