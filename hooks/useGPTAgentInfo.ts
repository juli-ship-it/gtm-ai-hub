import { useState, useEffect } from 'react'

interface GPTAgentInfo {
  name: string
  creator: string
  uploader?: string // Who uploaded it via Slack
  description: string
  capabilities: string[]
  category: string
  tags: string[]
}

// Known GPT agents mapping
const knownAgents: Record<string, GPTAgentInfo> = {
  'g-3TfXg9het-workleap-content-assistant': {
    name: 'Workleap Content Assistant',
    creator: 'Sofia Acosta',
    description: 'Creates and translates engaging copy for social posts, emails, and more, aligning with Workleap\'s latest messaging, voice, style, and inclusive French guidelines.',
    capabilities: [
      'Write LinkedIn posts about Workleap\'s impact',
      'Create blog posts on boosting employee engagement',
      'Generate ad copy promoting Workleap\'s products',
      'Adapt content into Quebec-friendly French'
    ],
    category: 'content',
    tags: ['content-creation', 'translation', 'social-media', 'marketing']
  },
  'g-681b69671a748191ab093f497e233c8c-luke-the-paid-marketer-master': {
    name: 'Luke The Paid Marketer Master',
    creator: 'Kieran Flanagan',
    description: 'An Elite Level Paid Marketer to Solve Hard Problems',
    capabilities: [
      'Paid marketing strategy',
      'Campaign optimization',
      'Performance analysis',
      'Marketing automation'
    ],
    category: 'support',
    tags: ['marketing', 'paid-media', 'automation', 'strategy']
  }
}

export function useGPTAgentInfo(gptAgentUrl: string | null, databaseAgent?: any) {
  const [agentInfo, setAgentInfo] = useState<GPTAgentInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!gptAgentUrl) {
      setAgentInfo(null)
      return
    }

    const extractAgentInfo = async () => {
      setLoading(true)
      setError(null)

      try {
        // Extract the agent ID from the URL
        const agentIdMatch = gptAgentUrl.match(/\/g\/(g-[a-zA-Z0-9-]+)/)
        if (!agentIdMatch) {
          throw new Error('Invalid GPT agent URL format')
        }

        const agentId = agentIdMatch[1]
        
        // Check if we have known info for this agent
        const knownInfo = knownAgents[agentId]
        
        if (databaseAgent) {
          // Always prioritize database/scraped data over known agents
          // Use scraped data from database if available
          const scrapedData = databaseAgent.configuration?.scraped_data
          if (scrapedData) {
            setAgentInfo({
              name: scrapedData.name || databaseAgent.name || 'Custom GPT Agent',
              creator: scrapedData.creator || databaseAgent.configuration?.actual_creator || 'Unknown',
              uploader: databaseAgent.configuration?.created_by_user || 'Unknown',
              description: scrapedData.description || databaseAgent.description || 'A custom GPT agent created for specific tasks.',
              capabilities: scrapedData.capabilities || ['Custom AI assistance'],
              category: databaseAgent.category || 'support',
              tags: ['custom', 'ai-assistant']
            })
          } else {
            // Use database data without scraped info
            setAgentInfo({
              name: databaseAgent.name || 'Custom GPT Agent',
              creator: databaseAgent.configuration?.actual_creator || databaseAgent.configuration?.created_by_user || 'Unknown',
              uploader: databaseAgent.configuration?.created_by_user || 'Unknown',
              description: databaseAgent.description || 'A custom GPT agent created for specific tasks.',
              capabilities: ['Custom AI assistance'],
              category: databaseAgent.category || 'support',
              tags: ['custom', 'ai-assistant']
            })
          }
        } else if (knownInfo) {
          // Use known info if no database agent available
          setAgentInfo(knownInfo)
        } else {
          // For unknown agents, create basic info
          setAgentInfo({
            name: 'Custom GPT Agent',
            creator: 'Unknown',
            description: 'A custom GPT agent created for specific tasks.',
            capabilities: ['Custom AI assistance'],
            category: 'support',
            tags: ['custom', 'ai-assistant']
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setAgentInfo({
          name: 'Unknown GPT Agent',
          creator: 'Unknown',
          description: 'Unable to extract agent information.',
          capabilities: ['AI assistance'],
          category: 'support',
          tags: ['unknown']
        })
      } finally {
        setLoading(false)
      }
    }

    extractAgentInfo()
  }, [gptAgentUrl, databaseAgent])

  return { agentInfo, loading, error }
}
