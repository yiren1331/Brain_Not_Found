import JamAI from "jamaibase"

// Create JamAI client instance
export const jamaiClient = new JamAI({
  baseURL: process.env.JAMAI_BASE_URL || "https://api.jamaibase.com",
  apiKey: process.env.JAMAI_API_KEY,
  projectId: process.env.JAMAI_PROJECT_ID,
})

// Helper function to query property recommendations
export async function getPropertyRecommendations(userPreferences: {
  location?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  furnished?: string
}) {
  try {
    const response = await jamaiClient.table.addRow({
      table_type: "action",
      table_id: "property_recommendations",
      data: [userPreferences],
      reindex: null,
      concurrent: false,
    })
    return response
  } catch (error: any) {
    console.error("[v0] JamAI property recommendations error:", error.message)
    throw error
  }
}

// Helper function to chat about properties (streaming)
export async function chatAboutProperties(userQuery: string, context?: string) {
  try {
    const stream = await jamaiClient.table.addRowStream({
      table_type: "chat",
      table_id: "property_assistant",
      data: [
        {
          user_query: userQuery,
          context: context || "",
        },
      ],
      reindex: null,
      concurrent: false,
    })
    return stream
  } catch (error: any) {
    console.error("[v0] JamAI chat error:", error.message)
    throw error
  }
}

// Helper function to search knowledge base
export async function searchPropertyKnowledge(query: string) {
  try {
    const response = await jamaiClient.table.addRow({
      table_type: "knowledge",
      table_id: "property_knowledge",
      data: [{ search_query: query }],
      reindex: null,
      concurrent: false,
    })
    return response
  } catch (error: any) {
    console.error("[v0] JamAI knowledge search error:", error.message)
    throw error
  }
}
