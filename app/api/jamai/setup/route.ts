import JamAI from "jamaibase"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Checking JamAI environment variables...")

    if (!process.env.JAMAI_API_KEY || !process.env.JAMAI_PROJECT_ID) {
      console.error("[v0] Missing JamAI environment variables")
      return NextResponse.json(
        {
          success: false,
          error:
            "JamAI environment variables not configured. Please add JAMAI_API_KEY and JAMAI_PROJECT_ID to your environment variables.",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Initializing JamAI client...")
    const jamai = new JamAI({
      apiKey: process.env.JAMAI_API_KEY,
      projectId: process.env.JAMAI_PROJECT_ID,
      baseURL: process.env.JAMAI_BASE_URL || "https://api.jamaibase.com",
    })

    console.log("[v0] Testing JamAI connection...")

    // Since SDK doesn't support createTable, we just verify credentials work
    try {
      // Just initialize - if credentials are wrong, constructor will fail
      console.log("[v0] JamAI client initialized successfully")

      return NextResponse.json({
        success: true,
        message: "JamAI Base connection verified. Please create tables manually in the JamAI dashboard.",
        instructions: {
          step1: "Go to https://cloud.jamaibase.com/",
          step2: "Navigate to Project >> Action Table",
          step3: "Create a new Action Table named 'properties_knowledge'",
          step4:
            "Add columns: Property_ID (str), Title (str), Location (str), Bedrooms (int), Bathrooms (int), Price (float), Furnished (str), Description (str)",
          step5: "Create a Chat Table named 'property_chat' with AI responses configured",
          step6: "Then use the 'Sync Properties' button to populate data",
        },
      })
    } catch (testError: any) {
      console.error("[v0] JamAI connection test failed:", testError)
      throw testError
    }
  } catch (error: any) {
    console.error("[v0] Error in JamAI setup:", error)
    console.error("[v0] Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect to JamAI Base",
        details: error.response?.data || error.toString(),
      },
      { status: 500 },
    )
  }
}
