import { type NextRequest, NextResponse } from "next/server"
import { getPropertyRecommendations } from "@/lib/jamaibase"

export async function POST(request: NextRequest) {
  try {
    const preferences = await request.json()

    console.log("[v0] JamAI recommendations request:", preferences)

    const recommendations = await getPropertyRecommendations(preferences)

    console.log("[v0] JamAI recommendations response:", recommendations)

    return NextResponse.json(recommendations)
  } catch (error: any) {
    console.error("[v0] JamAI recommendations API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
