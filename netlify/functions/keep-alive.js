const { schedule } = require('@netlify/functions');

// Cron syntax for every 2 minutes: "*/2 * * * *"
exports.handler = schedule("*/2 * * * *", async (event) => {
  const timestamp = new Date().toISOString();
  const keepAliveUrl = process.env.KEEP_ALIVE_URL;
  
  if (!keepAliveUrl) {
    console.error(`[${timestamp}] ERROR: KEEP_ALIVE_URL environment variable is not set`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'KEEP_ALIVE_URL environment variable is not set',
        timestamp
      })
    };
  }

  try {
    console.log(`[${timestamp}] Pinging backend at: ${keepAliveUrl}`);
    
    const response = await fetch(keepAliveUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Netlify-Keep-Alive/1.0'
      }
    });

    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`[${timestamp}] Ping successful - Status: ${status} ${statusText}`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        status: status,
        statusText: statusText,
        timestamp: timestamp,
        url: keepAliveUrl
      })
    };
    
  } catch (error) {
    console.error(`[${timestamp}] Ping failed - Error: ${error.message}`);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: timestamp,
        url: keepAliveUrl
      })
    };
  }
}); 