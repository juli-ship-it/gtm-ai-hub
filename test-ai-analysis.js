// Test script to debug AI analysis
const { createClient } = require('@supabase/supabase-js')

async function testAIAnalysis() {

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {

    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Test with a simple workflow
  const testWorkflow = {
    name: "Test Workflow",
    nodes: [
      {
        type: "n8n-nodes-base.scheduleTrigger",
        parameters: {
          rule: {
            interval: "Days",
            intervalValue: 1
          }
        }
      }
    ]
  }

  const analysisPrompt = `Analyze this n8n workflow and extract business-relevant variables:

Workflow Name: ${testWorkflow.name}
Number of Nodes: ${testWorkflow.nodes.length}

Workflow JSON:
${JSON.stringify(testWorkflow, null, 2)}

Return a JSON response with detectedVariables array.`

  try {

    const { data, error } = await supabase.functions.invoke('analyze-workflow', {
      body: {
        prompt: analysisPrompt,
        workflow: testWorkflow
      }
    })

    if (error) {

    } else {)
    }

  } catch (err) {

  }
}

testAIAnalysis()
