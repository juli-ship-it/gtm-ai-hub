// Test script to compare scraping results for different GPT agent URLs
// Run with: node test-scraper-comparison.js

const testUrls = [
  {
    name: "Luke The Paid Marketer Master (Working)",
    url: "https://chatgpt.com/g/g-681b69671a748191ab093f497e233c8c-luke-the-paid-marketer-master"
  },
  {
    name: "Ava Dalton Elite SaaS Paid Strategist (Not Working)",
    url: "https://chatgpt.com/g/g-6839b5ab08848191bc976d60a1def249-ava-dalton-elite-saas-paid-strategist"
  }
]

async function testScraping(url, name) {
  console.log(`\n🔍 Testing: ${name}`)
  console.log(`URL: ${url}`)
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/slack-intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        "event_type": "view_submission",
        "submitter_id": "U09F5QBUEF5",
        "submitter_username": "juliana.reyes",
        "team_id": "T03TLTNDW",
        "team": "workleap",
        "title": "", // Empty title to trigger scraping
        "jtbd": "Testing scraper functionality",
        "category": "campaign_execution",
        "current_process": "Test process",
        "pain_points": "Test pain points",
        "frequency": "daily",
        "time_friendly": "30 minutes",
        "systems": ["test"],
        "sensitivity": "low",
        "urgency": "p0",
        "links": "",
        "gpt_agent_url": url,
        "view_id": "V09HZHB0PTR",
        "callback_id": "gtm_intake_modal"
      })
    })

    const result = await response.json()
    console.log(`Response status: ${response.status}`)
    
    if (response.ok) {
      console.log(`✅ Success! GPT Agent ID: ${result.gpt_agent_id}`)
      console.log(`📊 Check the Supabase logs for detailed scraping information`)
    } else {
      console.log(`❌ Failed: ${result.error}`)
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
  }
}

async function runComparison() {
  console.log('🧪 GPT Agent Scraper Comparison Test')
  console.log('=====================================')
  
  for (const testCase of testUrls) {
    await testScraping(testCase.url, testCase.name)
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n📋 Summary:')
  console.log('- Check the Supabase Edge Function logs for detailed scraping results')
  console.log('- Look for differences in HTML structure or scraping patterns')
  console.log('- Compare the scraped data between the two URLs')
}

// Only run if this file is executed directly
if (require.main === module) {
  runComparison()
}

module.exports = { testScraping, runComparison }
