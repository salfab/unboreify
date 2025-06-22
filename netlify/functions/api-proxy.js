exports.handler = async (event, context) => {
  const { path, queryStringParameters } = event;
  
  // Extract the API path and endpoint
  const apiPath = path.replace('/api/deejai/', '');
  const queryString = new URLSearchParams(queryStringParameters || {}).toString();
  const targetUrl = `https://deej-ai.online/api/v1/${apiPath}${queryString ? '?' + queryString : ''}`;
  
  console.log('Proxying to:', targetUrl);
  
  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Unboreify/1.0'
      }
    });
    
    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: data
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy error', details: error.message })
    };
  }
};
