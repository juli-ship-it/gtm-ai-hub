// Function to extract GPT agent information from ChatGPT URL
// This would be used in the UI to get more context about each GPT agent

async function extractGPTAgentInfo(gptAgentUrl) {
  try {
    // Extract the agent ID from the URL
    const agentIdMatch = gptAgentUrl.match(/\/g\/(g-[a-zA-Z0-9-]+)/);
    if (!agentIdMatch) {
      throw new Error('Invalid GPT agent URL format');
    }
    
    const agentId = agentIdMatch[1];
    
    // For now, we'll create a mapping of known agents
    // In the future, we could potentially scrape ChatGPT or use an API
    const knownAgents = {
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
      }
    };
    
    // Return known agent info or default info
    return knownAgents[agentId] || {
      name: 'Custom GPT Agent',
      creator: 'Unknown',
      description: 'A custom GPT agent created for specific tasks.',
      capabilities: ['Custom AI assistance'],
      category: 'support',
      tags: ['custom', 'ai-assistant']
    };
    
  } catch (error) {
    console.error('Error extracting GPT agent info:', error);
    return {
      name: 'Unknown GPT Agent',
      creator: 'Unknown',
      description: 'Unable to extract agent information.',
      capabilities: ['AI assistance'],
      category: 'support',
      tags: ['unknown']
    };
  }
}

// Example usage:
// const agentInfo = await extractGPTAgentInfo('https://chatgpt.com/g/g-3TfXg9het-workleap-content-assistant');
// console.log(agentInfo);

export { extractGPTAgentInfo };
