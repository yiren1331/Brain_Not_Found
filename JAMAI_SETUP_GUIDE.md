# JamAI Base Setup Guide

## Step-by-Step Instructions

### Step 1: Verify Environment Variables ✅
Make sure these are set in your Vercel project (Vars section):
- `JAMAI_API_KEY`
- `JAMAI_PROJECT_ID`
- `JAMAI_BASE_URL`

### Step 2: Create JamAI Tables 

Run this API endpoint to automatically create the required tables:

\`\`\`bash
POST /api/jamai/setup
\`\`\`

This will create:
1. **properties_knowledge** - Action table for storing property data with AI summaries
2. **property_chat** - Chat table for AI conversations with RAG capabilities

### Step 3: Sync Your Properties

After tables are created, sync your Neon database properties to JamAI Base:

\`\`\`bash
POST /api/jamai/sync-properties
\`\`\`

This will:
- Fetch all properties from your Neon database
- Add them to the JamAI Base knowledge table
- Generate AI summaries for each property

### Step 4: Test the Integration

Test the chat API:

\`\`\`bash
POST /api/jamai/chat
Content-Type: application/json

{
  "message": "Show me 3 bedroom apartments in KLCC",
  "language": "en"
}
\`\`\`

## Using the Web Interface

You can also visit these pages to set up JamAI:

1. Visit `/admin` page
2. Look for "JamAI Setup" section (to be added)
3. Click "Initialize JamAI Tables"
4. Click "Sync Properties"

## Troubleshooting

**Error: "Table already exists"**
- Tables are already created, skip to Step 3

**Error: "Invalid API key"**
- Check your `JAMAI_API_KEY` in environment variables

**Error: "Project not found"**
- Verify your `JAMAI_PROJECT_ID` is correct

## Next Steps

Once setup is complete, update your AI chatbox to use the new JamAI endpoints for smarter, context-aware responses about your properties.
