# JamAI Base Manual Setup Guide

This guide will walk you through setting up JamAI Base tables manually for your house rental application.

## Prerequisites

1. JamAI Base account at https://cloud.jamaibase.com/
2. Your Project ID and API Key set in environment variables
3. Properties already in your Neon database

---

## Step 1: Login to JamAI Base

1. Go to https://cloud.jamaibase.com/
2. Sign in with your account
3. Navigate to your project

---

## Step 2: Create the Properties Knowledge Table

This table will store all your property information for AI-powered search and recommendations.

### Create Action Table

1. Click **"Project"** in the sidebar
2. Click **"Action Table"**
3. Click **"+ New Action Table"**
4. Enter table name: **`properties_knowledge`**

### Configure Columns

Add the following columns:

#### Input Columns (Data you provide):
- **property_id** (Text) - Unique property identifier
- **title** (Text) - Property title in English
- **title_ms** (Text) - Property title in Malay
- **location** (Text) - Property location
- **bedrooms** (Number) - Number of bedrooms
- **bathrooms** (Number) - Number of bathrooms
- **price** (Number) - Monthly rental price
- **furnished** (Text) - Furnished status (Fully/Partially/Unfurnished)
- **contact** (Text) - Contact phone number

#### Output Columns (AI Generated):
- **description** (AI Column - Text Generation)
  - Prompt: "Generate a compelling property description based on: {{title}}, {{location}}, {{bedrooms}} bedrooms, {{bathrooms}} bathrooms, RM{{price}}/month, {{furnished}}"
  - Model: Use default or select GPT-4o-mini

- **search_keywords** (AI Column - Text Generation)
  - Prompt: "Generate search keywords for this property: {{title}}, {{location}}, {{furnished}}"
  - Model: Use default or select GPT-4o-mini

5. Click **"Create"** to save the table

---

## Step 3: Create the Property Chat Table

This table will handle AI conversations about properties.

### Create Action Table

1. Click **"+ New Action Table"**
2. Enter table name: **`property_chat`**

### Configure Columns

#### Input Columns:
- **user_query** (Text) - User's question or search request
- **language** (Text) - Language preference (en or ms)
- **user_preferences** (Text) - User preferences (bedrooms, price range, etc.)

#### Output Columns (AI Generated):
- **ai_response** (AI Column - Chat)
  - System Prompt: "You are a helpful property rental assistant for Klang Valley. Help users find properties based on their needs. Respond in {{language}} language. Consider user preferences: {{user_preferences}}"
  - User Prompt: "{{user_query}}"
  - Model: Use GPT-4o or Claude-3.5-sonnet for best results
  - Enable **RAG (Retrieval)** and connect to **properties_knowledge** table

- **recommended_properties** (AI Column - Text Generation)
  - Prompt: "Based on the query '{{user_query}}', list the top 3 property IDs that match. Format: property_id_1, property_id_2, property_id_3"
  - Model: Use default

5. Click **"Create"** to save the table

---

## Step 4: Sync Your Properties

After creating both tables:

1. Go back to your admin panel at `/admin`
2. Click **"Sync Properties to JamAI"** button
3. Wait for the sync to complete
4. You should see a success message with the number of properties synced

---

## Step 5: Test the Integration

### Test in JamAI Dashboard:
1. Go to **properties_knowledge** table
2. Verify your properties are listed
3. Check if AI descriptions are generated

### Test in Your App:
1. Go to your website homepage
2. Open the AI chatbox in the bottom right
3. Ask questions like:
   - "Show me 3 bedroom apartments in KLCC"
   - "I need a furnished house under RM2000"
   - "What properties do you have in Petaling Jaya?"

---

## Common Issues

### Issue: Tables not syncing
**Solution:** Check environment variables are set correctly:
- `JAMAI_API_KEY`
- `JAMAI_PROJECT_ID`
- `JAMAI_BASE_URL` (should be `https://api.jamaibase.com`)

### Issue: AI not responding correctly
**Solution:** Ensure RAG is enabled in the property_chat table's ai_response column and connected to properties_knowledge table.

### Issue: No properties showing
**Solution:** Run the sync again or check the Neon database has properties.

---

## Next Steps

Once setup is complete:
- The AI chatbox will use real property data
- Users can search in English or Bahasa Melayu
- The AI will provide intelligent recommendations based on property features

For support, visit: https://docs.jamaibase.com/
