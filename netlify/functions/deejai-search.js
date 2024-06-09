import axios from 'axios';

export const handler = async (event) => {
  try {
    const { string, max_items } = event.queryStringParameters;
    
    const response = await axios.get(`https://deej-ai.online/api/v1/search`, {
      params: {
        string,
        max_items
      },
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
