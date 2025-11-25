# JamAI Base Quick Start (TL;DR)

## 5-Minute Setup

### 1. Create Tables
Go to https://cloud.jamaibase.com/ → Project → Action Table

**Table 1: `properties_knowledge`**
- Input columns: property_id, title, title_ms, location, bedrooms, bathrooms, price, furnished, contact
- Output columns: description (AI generated), search_keywords (AI generated)

**Table 2: `property_chat`**
- Input columns: user_query, language, user_preferences
- Output columns: ai_response (Chat with RAG enabled), recommended_properties (AI generated)
- **Important:** Enable RAG in ai_response and connect to properties_knowledge table

### 2. Set Environment Variables
\`\`\`
JAMAI_API_KEY=your_api_key_here
JAMAI_PROJECT_ID=your_project_id_here
JAMAI_BASE_URL=https://api.jamaibase.com
\`\`\`

### 3. Sync Data
- Go to `/admin` in your app
- Click "Sync Properties to JamAI"
- Wait for success message

### 4. Test
- Open AI chatbox on homepage
- Ask: "Show me apartments in KLCC"
- Should get AI-powered responses with real property data

Done! 🎉
