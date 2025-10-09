// Script to set Supabase Edge Function secret via REST API
const https = require('https');

async function setSecret() {
  const projectRef = 'qvfvylflnfxrhyzwlhpm';
  const secretName = 'OPENAI_API_KEY';
  const secretValue = 'sk-your-openai-api-key-here'; // Replace with your actual key
  
  // You'll need to get your Supabase access token from the dashboard
  const accessToken = 'your-supabase-access-token'; // Get this from Supabase dashboard
  
  const data = JSON.stringify({
    name: secretName,
    value: secretValue
  });
  
  const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${projectRef}/secrets`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    res.on('data', (d) => {
      console.log('Response:', d.toString());
    });
  });
  
  req.on('error', (e) => {
    console.error('Error:', e);
  });
  
  req.write(data);
  req.end();
}

setSecret().catch(console.error);
