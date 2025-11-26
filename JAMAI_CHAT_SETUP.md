# JamAI Base Chat Integration

Your website now uses **JamAI Base Action Tables** for AI-powered chat responses!

## How It Works

1. **User sends a message** in the chat assistant
2. **Language detection**: System detects English or Bahasa Melayu
3. **Table selection**:
   - English queries → "hackathon" table
   - Bahasa Melayu queries → "hackathon malay" table
4. **JamAI Base processes** the query using your configured AI model
5. **AI-generated response** is returned to the user

## Required Environment Variables

\`\`\`
JAMAI_API_KEY=your_api_key
JAMAI_PROJECT_ID=your_project_id
JAMAI_BASE_URL=https://api.jamaibase.com
JAMAI_TABLE_IDS=chat assistant,hackathon,hackathon malay
\`\`\`

## JamAI Action Table Setup

Your action tables should have the following structure:

### Input Columns:
- **user_query** (type: `str`) - The user's question or message

### Output Columns (AI-generated):
- **ai_response** or **suggestion** or **response** (type: `str`)
  - Configure with AI model (e.g., OpenAI GPT, Anthropic Claude)
  - Add a system prompt that instructs the AI to help with property rentals

### Example System Prompt:

**For English table ("hackathon"):**
\`\`\`
You are a helpful property rental assistant for Klang Valley, Malaysia. 
Help users find suitable rental properties by understanding their requirements 
(location, bedrooms, price budget, furnishing) and provide personalized 
recommendations with links to view properties.

When users ask about properties, generate search URLs in this format:
[View Properties](/search?location=KLCC&bedrooms=3&maxPrice=3000)

Be friendly, conversational, and helpful. Respond in English.
\`\`\`

**For Malay table ("hackathon malay"):**
\`\`\`
Anda adalah pembantu carian hartanah sewa yang mesra untuk Lembah Klang, Malaysia.
Bantu pengguna mencari hartanah sewa yang sesuai dengan memahami keperluan mereka
(lokasi, bilik tidur, bajet harga, perabot) dan berikan cadangan yang diperibadikan
dengan pautan untuk melihat hartanah.

Apabila pengguna bertanya tentang hartanah, jana URL carian dalam format ini:
[Lihat Hartanah](/search?location=KLCC&bedrooms=3&maxPrice=3000)

Bersikap mesra, berbual, dan membantu. Balas dalam Bahasa Melayu.
\`\`\`

## Testing

Try these queries:

**English:**
- "Show me 3 bedroom apartments in KLCC under RM3000"
- "I need a fully furnished place in Mont Kiara"
- "Find budget rentals in Setapak"

**Bahasa Melayu:**
- "Saya nak cari rumah 3 bilik di KLCC bawah RM3000"
- "Cari apartment berperabot penuh di Mont Kiara"
- "Tunjukkan hartanah murah di Setapak"

## Troubleshooting

### "Insufficient credits" error
- Your JamAI account is out of credits
- Add credits at https://cloud.jamaibase.com/
- Or switch to a free-tier model in your action table settings

### No response generated
- Check that your action table has an output column configured
- Verify the AI model in the output column has a valid API key
- Check the column name matches: `ai_response`, `suggestion`, or `response`

### Wrong language responses
- Verify your table IDs in environment variables
- Ensure "hackathon malay" contains "malay" in the name
- Check system prompts specify the correct language

## Benefits of JamAI Integration

✓ **AI-powered responses** - Natural conversation with context understanding
✓ **Bilingual support** - Automatic language detection and routing  
✓ **Personalized recommendations** - AI understands user preferences
✓ **Scalable** - No need to hardcode response logic
✓ **Flexible** - Update AI behavior by changing system prompts in JamAI dashboard
