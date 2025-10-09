# Supabase Edge Function Setup for AI Analysis

## 1. Deploy the Edge Function

```bash
# Deploy the Edge Function to Supabase
npx supabase functions deploy analyze-workflow
```

## 2. Set Environment Variables

```bash
# Set OpenAI API key in Supabase
npx supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 3. Verify Deployment

```bash
# Check if function is deployed
npx supabase functions list

# Test the function
npx supabase functions invoke analyze-workflow --data '{"prompt": "test", "workflow": {"name": "test"}}'
```

## 4. View Edge Function Logs

### Real-time Logs:
```bash
# Watch logs in real-time
npx supabase functions logs analyze-workflow --follow
```

### Log Format:
```
[abc123] 🚀 Edge Function: AI Workflow Analysis Started
[abc123] 📝 Workflow Info: {name: 'Hubspot list to Excel', nodeCount: 12}
[abc123] ✅ OpenAI API key found in Edge Function
[abc123] 🤖 Calling OpenAI API from Edge Function...
[abc123] ⏱️ OpenAI API call took 2500ms
[abc123] 📊 OpenAI Response: {usage: {...}, responseLength: 1200}
[abc123] ✅ AI Analysis Complete: {variablesFound: 7, systems: ['hubspot', 'excel']}
[abc123] 🎉 Total Edge Function time: 3000ms
```

## 5. Benefits of Edge Function

### Better Logging:
- ✅ **Centralized logs** in Supabase dashboard
- ✅ **Real-time monitoring** with `--follow` flag
- ✅ **Persistent logs** in Supabase logs
- ✅ **Better error tracking**

### Performance:
- ✅ **Faster execution** (closer to OpenAI API)
- ✅ **Better caching** capabilities
- ✅ **No Next.js overhead**

### Security:
- ✅ **API keys stored securely** in Supabase secrets
- ✅ **No client-side exposure** of OpenAI key
- ✅ **Better rate limiting** control

## 6. Current Status Check

### To verify if using real AI or mock data:

1. **Check console logs** for:
   ```
   🤖 Using real AI analysis via Supabase Edge Function
   ✅ AI analysis successful via Edge Function: {variablesFound: 7}
   ```

2. **Check Edge Function logs**:
   ```bash
   npx supabase functions logs analyze-workflow --follow
   ```

3. **Look for these indicators**:
   - ✅ Real AI: "Edge Function: AI Workflow Analysis Started"
   - ❌ Mock data: "Using mock AI analysis - add OPENAI_API_KEY"

## 7. Troubleshooting

### If still using mock data:
1. Check if Edge Function is deployed: `npx supabase functions list`
2. Check if OpenAI key is set: `npx supabase secrets list`
3. Check environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### If Edge Function fails:
1. Check logs: `npx supabase functions logs analyze-workflow`
2. Verify OpenAI API key is valid
3. Check network connectivity

## 8. Expected Log Output

When working correctly, you should see:
```
[abc123] 🚀 Edge Function: AI Workflow Analysis Started
[abc123] 📝 Workflow Info: {name: 'Hubspot list to Excel', nodeCount: 12, promptLength: 2500}
[abc123] ✅ OpenAI API key found in Edge Function
[abc123] 🤖 Calling OpenAI API from Edge Function...
[abc123] ⏱️ OpenAI API call took 2500ms
[abc123] 📊 OpenAI Response: {usage: {prompt_tokens: 800, completion_tokens: 400}, responseLength: 1200, finishReason: 'stop'}
[abc123] 🔍 Parsing AI response...
[abc123] ✅ AI Analysis Complete: {variablesFound: 7, systems: ['hubspot', 'excel'], complexity: 'intermediate', duration: 17}
[abc123] 🎉 Total Edge Function time: 3000ms
```

This confirms the Edge Function is calling OpenAI and returning real AI analysis!
