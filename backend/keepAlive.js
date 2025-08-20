const https = require('https');

// Function to ping the health endpoint
function pingHealthEndpoint() {
  const url = process.env.RENDER_URL || 'https://akr-sons-pvt-ltd-d59y.onrender.com';
  
  https.get(`${url}/api/health`, (res) => {
    console.log(`Health check: ${res.statusCode} - ${new Date().toISOString()}`);
  }).on('error', (err) => {
    console.error('Health check failed:', err.message);
  });
}

// Ping every 14 minutes (840000 ms) to keep the server warm
// Render free tier has a 15-minute timeout, so we ping before that
setInterval(pingHealthEndpoint, 14 * 60 * 1000);

// Initial ping
pingHealthEndpoint();

console.log('Keep-alive script started. Pinging every 14 minutes...'); 