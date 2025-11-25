# JamAI Base Integration Setup

This project integrates JamAI Base for AI-powered property recommendations and chat assistance.

## Setup Instructions

### 1. Get JamAI Base Credentials

1. Go to [cloud.jamaibase.com](https://cloud.jamaibase.com)
2. Create an account or sign in
3. Navigate to **Organization → Secrets** to get your API Key
4. Go to **Project** page and copy your Project ID

### 2. Add Environment Variables

Add these to your Vercel project environment variables or `.env.local`:

\`\`\`
JAMAI_BASE_URL=https://api.jamaibase.com
JAMAI_API_KEY=your_jamai_sk_api_key
JAMAI_PROJECT_ID=your_proj_id
\`\`\`

### 3. Create Tables in JamAI Base

You need to create the following tables in your JamAI Base project:

#### Action Table: `rental_assistant`
- Input columns: `user_message` (str), `language` (str)
- Output columns: AI-generated response based on property data

#### Action Table: `property_recommendations`
- Input columns: `location` (str), `minPrice` (number), `maxPrice` (number), `bedrooms` (number), `furnished` (str)
- Output columns: AI-generated property recommendations

#### Knowledge Table: `property_knowledge`
- Upload property-related documents and FAQs
- This will be used for RAG (Retrieval-Augmented Generation)

### 4. API Endpoints

- **POST /api/jamai/chat** - Chat with AI assistant about properties (streaming)
- **POST /api/jamai/recommendations** - Get AI property recommendations

### 5. Features

- **AI-Powered Chat**: Natural language conversations about properties
- **Smart Recommendations**: AI suggests properties based on user preferences
- **Multilingual Support**: Works with English and Bahasa Melayu
- **RAG Integration**: Uses your property knowledge base for accurate responses
- **Streaming Responses**: Real-time AI responses for better UX

## Usage Example

### Chat with Assistant
\`\`\`typescript
const response = await fetch('/api/jamai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Show me affordable apartments in KLCC',
    language: 'en'
  })
})
\`\`\`

### Get Recommendations
\`\`\`typescript
const response = await fetch('/api/jamai/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'KLCC',
    minPrice: 1000,
    maxPrice: 3000,
    bedrooms: 2,
    furnished: 'Fully Furnished'
  })
})
\`\`\`

## Learn More

- [JamAI Base Documentation](https://docs.jamaibase.com/)
- [TypeScript SDK Reference](https://embeddedllm.github.io/jamaibase-ts-docs/)
