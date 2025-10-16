# AI Integration Setup

## Current Status: Hardcoded Mock Data

The workflow analyzer is currently using hardcoded responses instead of real AI analysis.

## Setup Real AI Integration

### Option 1: OpenAI Integration

1. **Get OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key

2. **Add to Environment Variables**
   ```bash
   # Add to .env.local
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **Update the AI Analyzer**
   - Replace the mock `callAIAnalysis` function
   - Use the real OpenAI API integration

### Option 2: Claude Integration

1. **Get Anthropic API Key**
   - Go to https://console.anthropic.com/
   - Create a new API key

2. **Add to Environment Variables**
   ```bash
   # Add to .env.local
   ANTHROPIC_API_KEY=sk-ant-your-claude-api-key-here
   ```

### Option 3: Local AI Model

1. **Use Ollama or similar**
   - Install Ollama locally
   - Run a local model
   - Point the API to localhost

## Implementation Steps

1. **Choose your AI provider** (OpenAI, Claude, or local)
2. **Add API key to environment variables**
3. **Update the `callAIAnalysis` function** to use real API calls
4. **Test with your HubSpot workflow**

## Cost Considerations

- **OpenAI GPT-4**: ~$0.03 per analysis
- **Claude**: ~$0.015 per analysis  
- **Local Model**: Free but requires setup

## Current Mock Data

The current implementation returns hardcoded variables:
- `scheduleInterval` (Daily)
- `scheduleTime` (09:00)
- `hubspotListId` (12345)
- `excelFilePath` (/path/to/export.xlsx)
- `excelSheetName` (Contacts)
- `excelColumns` (Email, First Name, Last Name)
- `notificationEmail` (your-email@company.com)

## Next Steps

1. **Set up your preferred AI provider**
2. **Update the environment variables**
3. **Test with real AI analysis**
4. **Verify it extracts the correct variables for your workflow**
