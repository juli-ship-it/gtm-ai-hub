#!/usr/bin/env node

/**
 * Crayon MCP Integration Test Script
 * 
 * This script tests the Crayon MCP integration functionality
 * including connection, competitive intelligence queries, and error handling.
 */

const { spawn } = require('child_process')
const path = require('path')

// Test configuration
const TEST_CONFIG = {
  // Use mock data for testing
  useMockData: process.env.NODE_ENV === 'development' || !process.env.CRAYON_API_KEY,
  timeout: 30000,
  retries: 3
}

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
}

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
  console.log(`${prefix} [${timestamp}] ${message}`)
}

function recordTest(name, passed, error = null) {
  testResults.total++
  if (passed) {
    testResults.passed++
    log(`PASS: ${name}`, 'success')
  } else {
    testResults.failed++
    testResults.errors.push({ name, error })
    log(`FAIL: ${name} - ${error}`, 'error')
  }
}

// Test functions
async function testClientCreation() {
  try {
    // Dynamic import for ES modules
    const { createCrayonMCPClient } = await import('./lib/integrations/crayon-mcp.ts')
    
    const client = createCrayonMCPClient({
      apiKey: 'test_key',
      accountId: 'test_account',
      workspaceId: 'test_workspace',
      readOnly: true,
      maxResults: 10,
      timeout: 30,
      auditLogging: false
    })

    recordTest('Client Creation', client !== null)
    return client
  } catch (error) {
    recordTest('Client Creation', false, error.message)
    return null
  }
}

async function testConnection(client) {
  if (!client) {
    recordTest('Connection Test', false, 'No client available')
    return false
  }

  try {
    await client.connect()
    recordTest('Connection Test', true)
    return true
  } catch (error) {
    recordTest('Connection Test', false, error.message)
    return false
  }
}

async function testBattlecardQuery(client) {
  if (!client) {
    recordTest('Battlecard Query', false, 'No client available')
    return false
  }

  try {
    const battlecard = await client.getBattlecard('Test Competitor', {
      product: 'test_product',
      useCase: 'enterprise_sales'
    })

    const isValid = battlecard && 
                   battlecard.competitor === 'Test Competitor' &&
                   Array.isArray(battlecard.strengths) &&
                   Array.isArray(battlecard.weaknesses)

    recordTest('Battlecard Query', isValid)
    return isValid
  } catch (error) {
    recordTest('Battlecard Query', false, error.message)
    return false
  }
}

async function testWinLossStories(client) {
  if (!client) {
    recordTest('Win/Loss Stories Query', false, 'No client available')
    return false
  }

  try {
    const stories = await client.getWinLossStories({
      competitor: 'Test Competitor',
      timeRange: 'last_quarter'
    })

    const isValid = Array.isArray(stories) && 
                   stories.length > 0 &&
                   stories[0].hasOwnProperty('outcome')

    recordTest('Win/Loss Stories Query', isValid)
    return isValid
  } catch (error) {
    recordTest('Win/Loss Stories Query', false, error.message)
    return false
  }
}

async function testCompetitorProfile(client) {
  if (!client) {
    recordTest('Competitor Profile Query', false, 'No client available')
    return false
  }

  try {
    const profile = await client.getCompetitorProfile('Test Competitor', {
      include: ['products', 'pricing', 'recent_news']
    })

    const isValid = profile && 
                   profile.name === 'Test Competitor' &&
                   Array.isArray(profile.products) &&
                   profile.hasOwnProperty('pricing')

    recordTest('Competitor Profile Query', isValid)
    return isValid
  } catch (error) {
    recordTest('Competitor Profile Query', false, error.message)
    return false
  }
}

async function testObjectionHandling(client) {
  if (!client) {
    recordTest('Objection Handling Query', false, 'No client available')
    return false
  }

  try {
    const objections = await client.getObjectionHandling({
      competitor: 'Test Competitor',
      objection: 'pricing_concern',
      context: 'enterprise_deal'
    })

    const isValid = Array.isArray(objections) && 
                   objections.length > 0 &&
                   objections[0].hasOwnProperty('response')

    recordTest('Objection Handling Query', isValid)
    return isValid
  } catch (error) {
    recordTest('Objection Handling Query', false, error.message)
    return false
  }
}

async function testDealIntelligence(client) {
  if (!client) {
    recordTest('Deal Intelligence Query', false, 'No client available')
    return false
  }

  try {
    const dealIntel = await client.getDealIntelligence({
      prospect: 'Test Company',
      competitors: ['Competitor A', 'Competitor B'],
      dealStage: 'proposal'
    })

    const isValid = dealIntel && 
                   dealIntel.prospect === 'Example Company' &&
                   Array.isArray(dealIntel.competitors) &&
                   Array.isArray(dealIntel.recommendations)

    recordTest('Deal Intelligence Query', isValid)
    return isValid
  } catch (error) {
    recordTest('Deal Intelligence Query', false, error.message)
    return false
  }
}

async function testMarketAlerts(client) {
  if (!client) {
    recordTest('Market Alerts Query', false, 'No client available')
    return false
  }

  try {
    const alerts = await client.getMarketAlerts({
      competitors: ['Competitor A', 'Competitor B'],
      alertTypes: ['product_launch', 'pricing_change'],
      timeRange: 'last_30_days'
    })

    const isValid = Array.isArray(alerts) && 
                   alerts.length > 0 &&
                   alerts[0].hasOwnProperty('type')

    recordTest('Market Alerts Query', isValid)
    return isValid
  } catch (error) {
    recordTest('Market Alerts Query', false, error.message)
    return false
  }
}

async function testCompetitorNews(client) {
  if (!client) {
    recordTest('Competitor News Query', false, 'No client available')
    return false
  }

  try {
    const news = await client.getCompetitorNews({
      competitor: 'Test Competitor',
      timeRange: 'last_week',
      categories: ['product', 'funding']
    })

    const isValid = Array.isArray(news) && 
                   news.length > 0 &&
                   news[0].hasOwnProperty('title')

    recordTest('Competitor News Query', isValid)
    return isValid
  } catch (error) {
    recordTest('Competitor News Query', false, error.message)
    return false
  }
}

async function testMarketTrends(client) {
  if (!client) {
    recordTest('Market Trends Query', false, 'No client available')
    return false
  }

  try {
    const trends = await client.getMarketTrends({
      market: 'enterprise_software',
      timeRange: 'last_quarter',
      include: ['competitor_analysis', 'pricing_trends']
    })

    const isValid = trends && 
                   trends.hasOwnProperty('trends') &&
                   Array.isArray(trends.trends)

    recordTest('Market Trends Query', isValid)
    return isValid
  } catch (error) {
    recordTest('Market Trends Query', false, error.message)
    return false
  }
}

async function testDisconnection(client) {
  if (!client) {
    recordTest('Disconnection Test', false, 'No client available')
    return false
  }

  try {
    await client.disconnect()
    recordTest('Disconnection Test', true)
    return true
  } catch (error) {
    recordTest('Disconnection Test', false, error.message)
    return false
  }
}

// Mock data validation tests
async function testMockDataValidation() {
  try {
    const { createCrayonMCPClient } = await import('./lib/integrations/crayon-mcp.ts')
    
    const client = createCrayonMCPClient({
      apiKey: 'mock_key',
      accountId: 'mock_account',
      workspaceId: 'mock_workspace'
    })

    // Test mock battlecard
    const battlecard = await client.getBattlecard('Mock Competitor')
    const battlecardValid = battlecard.competitor === 'Mock Competitor' &&
                           Array.isArray(battlecard.strengths) &&
                           Array.isArray(battlecard.weaknesses)

    // Test mock win/loss stories
    const stories = await client.getWinLossStories()
    const storiesValid = Array.isArray(stories) && stories.length > 0

    // Test mock competitor profile
    const profile = await client.getCompetitorProfile('Mock Competitor')
    const profileValid = profile.name === 'Mock Competitor' &&
                        Array.isArray(profile.products)

    const allValid = battlecardValid && storiesValid && profileValid
    recordTest('Mock Data Validation', allValid)
    return allValid
  } catch (error) {
    recordTest('Mock Data Validation', false, error.message)
    return false
  }
}

// Main test runner
async function runTests() {
  log('Starting Crayon MCP Integration Tests', 'info')
  log(`Test Mode: ${TEST_CONFIG.useMockData ? 'Mock Data' : 'Live API'}`, 'info')
  log('=' * 50, 'info')

  let client = null

  try {
    // Test 1: Client Creation
    client = await testClientCreation()

    // Test 2: Connection (only if not using mock data)
    if (!TEST_CONFIG.useMockData && client) {
      await testConnection(client)
    }

    // Test 3: Mock Data Validation (if using mock data)
    if (TEST_CONFIG.useMockData) {
      await testMockDataValidation()
    }

    // Test 4-11: Query Tests (only if client is available)
    if (client) {
      await testBattlecardQuery(client)
      await testWinLossStories(client)
      await testCompetitorProfile(client)
      await testObjectionHandling(client)
      await testDealIntelligence(client)
      await testMarketAlerts(client)
      await testCompetitorNews(client)
      await testMarketTrends(client)
    }

    // Test 12: Disconnection (only if connected)
    if (client && !TEST_CONFIG.useMockData) {
      await testDisconnection(client)
    }

  } catch (error) {
    log(`Test suite error: ${error.message}`, 'error')
    recordTest('Test Suite', false, error.message)
  }

  // Print results
  log('=' * 50, 'info')
  log('Test Results Summary:', 'info')
  log(`Total Tests: ${testResults.total}`, 'info')
  log(`Passed: ${testResults.passed}`, 'success')
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'info')

  if (testResults.errors.length > 0) {
    log('\nFailed Tests:', 'error')
    testResults.errors.forEach(error => {
      log(`  - ${error.name}: ${error.error}`, 'error')
    })
  }

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0)
}

// Handle process termination
process.on('SIGINT', () => {
  log('Test interrupted by user', 'info')
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'error')
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  log(`Unhandled rejection: ${reason}`, 'error')
  process.exit(1)
})

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    log(`Test runner error: ${error.message}`, 'error')
    process.exit(1)
  })
}

module.exports = {
  runTests,
  testResults
}
