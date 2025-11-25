# Chat Assistant Setup - Using JamAI Base (Free)

Your chat assistant now uses **JamAI Base** instead of the Vercel AI Gateway, which means no credit card is required!

## How It Works

The chat assistant queries your JamAI Base action table to generate intelligent responses about rental properties in Klang Valley.

## Requirements

Make sure you have these environment variables set:

\`\`\`env
JAMAI_API_KEY=your_jamai_api_key
JAMAI_PROJECT_ID=your_project_id
JAMAI_BASE_URL=https://api.jamaibase.com
JAMAI_TABLE_IDS=chat assistant,hackathon,hackathon malay
\`\`\`

## JamAI Table Setup

Your **"chat assistant"** table should have these columns:

### Input Columns:
- `User_Query` (Text) - The user's question

### Output Columns:
- `AI_Response` (Text, AI Generated) - The AI's response

**AI Prompt for Response Column:**
\`\`\`
You are a bilingual (English & Bahasa Melayu) AI assistant for a house rental platform in Klang Valley, Malaysia.

LANGUAGE DETECTION:
- Detect if the user is speaking English or Bahasa Melayu
- Respond in the same language they use

RESPONSE GUIDELINES:
1. Be friendly and helpful
2. Understand rental property queries (location, price, bedrooms, furnished status)
3. Generate search links in this format:
   - English: [View Properties](/search?location=KLCC&bedrooms=3&maxPrice=3000)
   - Malay: [Lihat Hartanah](/search?location=Petaling%20Jaya&bedrooms=2&furnished=fully)

4. Available locations: KLCC, Petaling Jaya, Shah Alam, Subang Jaya, Mont Kiara, Bangsar, Bukit Bintang, Damansara, Puchong, Cyberjaya, Putrajaya, Klang, Kajang

5. Provide intelligent recommendations based on the user's budget and preferences

EXAMPLES:

English Query: "Show me 3 bedroom apartments in KLCC under RM3000"
Response: "I'd be happy to help you find 3-bedroom apartments in KLCC! Here are options under RM3,000:

[View Properties](/search?location=KLCC&bedrooms=3&maxPrice=3000)

KLCC is a premium location with great connectivity. Would you like to explore other nearby areas?"

Malay Query: "Saya nak cari rumah 2 bilik di Shah Alam"
Response: "Saya boleh bantu! Ini adalah hartanah 2 bilik di Shah Alam:

[Lihat Hartanah](/search?location=Shah%20Alam&bedrooms=2)

Shah Alam mempunyai banyak pilihan rumah yang berpatutan. Nak saya tolong dengan apa-apa lagi?"

Always provide actionable search links and be conversational!
\`\`\`

## Testing

1. Open your website
2. Click the floating chat button (bottom right)
3. Try these test queries:

**English:**
- "Show me apartments in KLCC"
- "I need a 3 bedroom house under RM2500"
- "Find fully furnished properties in Petaling Jaya"

**Bahasa Melayu:**
- "Cari rumah sewa murah di Subang Jaya"
- "Saya nak apartment 2 bilik, fully furnished"
- "Ada tak rumah dekat LRT dalam budget RM2000?"

## Troubleshooting

**Chat not responding:**
- Check that `JAMAI_API_KEY` is valid
- Verify the table "chat assistant" exists in your JamAI project
- Make sure the table has `User_Query` input and `AI_Response` output columns

**Wrong language responses:**
- Update the AI prompt in the output column to emphasize language detection
- Test with clear language indicators

**No search links:**
- Verify the AI prompt includes search link generation instructions
- Check that markdown links are properly formatted: `[text](url)`

## Cost

JamAI Base offers free tier usage, so this chat assistant runs without requiring a credit card. Check your JamAI dashboard for usage limits.
