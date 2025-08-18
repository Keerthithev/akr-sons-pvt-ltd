# Netlify Keep-Alive Function

This function pings your Render backend every 2 minutes to prevent it from sleeping.

## Function Details

- **File**: `netlify/functions/keep-alive.js`
- **Schedule**: Every 2 minutes using cron syntax `*/2 * * * *`
- **Purpose**: Keeps Render backend alive by sending periodic GET requests

## Cron Syntax Explanation

```
*/2 * * * *
│ │ │ │ │ │
│ │ │ │ │ └── Day of week (0-7, Sunday = 0 or 7)
│ │ │ │ └──── Month (1-12)
│ │ │ └────── Day of month (1-31)
│ │ └──────── Hour (0-23)
│ └────────── Minute (0-59)
└──────────── Every 2 minutes
```

## Environment Variables

### Required
- `KEEP_ALIVE_URL`: The URL of your Render backend (e.g., `https://your-app.onrender.com`)

## Deployment Instructions

### 1. Deploy to Netlify

1. **Push your code** to your Git repository
2. **Connect your repository** to Netlify (if not already connected)
3. **Deploy automatically** - Netlify will detect the functions and deploy them

### 2. Set Environment Variables

#### Option A: Netlify Dashboard
1. Go to your **Netlify Dashboard**
2. Navigate to **Site settings** → **Environment variables**
3. Add a new variable:
   - **Key**: `KEEP_ALIVE_URL`
   - **Value**: `https://your-render-app.onrender.com`
4. Click **Save**

#### Option B: Netlify CLI
```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variable
netlify env:set KEEP_ALIVE_URL "https://your-render-app.onrender.com"
```

#### Option C: .env file (for local development)
Create a `.env` file in your project root:
```env
KEEP_ALIVE_URL=https://your-render-app.onrender.com
```

### 3. Verify Deployment

1. **Check Netlify Functions**:
   - Go to your Netlify Dashboard
   - Navigate to **Functions** tab
   - You should see `keep-alive` listed

2. **Check Logs**:
   - Go to **Functions** → **keep-alive**
   - Click on **View logs** to see the ping activity

3. **Test Manually**:
   - Visit: `https://your-site.netlify.app/.netlify/functions/keep-alive`
   - You should see a JSON response with ping status

## Monitoring

### Netlify Function Logs
- **Location**: Netlify Dashboard → Functions → keep-alive → View logs
- **Frequency**: Every 2 minutes
- **Expected Output**: Success/error messages with timestamps

### Example Log Output
```
[2024-01-15T10:00:00.000Z] Pinging backend at: https://your-app.onrender.com
[2024-01-15T10:00:01.234Z] Ping successful - Status: 200 OK
```

## Troubleshooting

### Common Issues

1. **Function not running**:
   - Check if environment variable is set correctly
   - Verify the function is deployed in Netlify Functions tab

2. **Ping failures**:
   - Verify your Render URL is correct
   - Check if your Render app is running
   - Ensure the URL is accessible

3. **Environment variable not found**:
   - Redeploy after setting environment variables
   - Check variable name spelling (case-sensitive)

### Testing Locally

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development
netlify dev

# Test the function
curl http://localhost:8888/.netlify/functions/keep-alive
```

## Cost Considerations

- **Netlify Functions**: Free tier includes 125,000 function invocations per month
- **Every 2 minutes**: ~720 invocations per day, ~21,600 per month
- **Cost**: Well within free tier limits

## Alternative Schedules

If you want to change the frequency, modify the cron syntax in `keep-alive.js`:

- **Every 5 minutes**: `*/5 * * * *`
- **Every 10 minutes**: `*/10 * * * *`
- **Every hour**: `0 * * * *`
- **Every 2 hours**: `0 */2 * * *` 