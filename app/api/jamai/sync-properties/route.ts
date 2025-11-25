import { JamAI } from "jamaibase"
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Starting JamAI sync process...")

    if (!process.env.JAMAI_API_KEY || !process.env.JAMAI_PROJECT_ID) {
      console.error("[v0] Missing JamAI environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "JamAI environment variables not configured. Please add JAMAI_API_KEY and JAMAI_PROJECT_ID.",
        },
        { status: 400 },
      )
    }

    if (!process.env.DATABASE_URL) {
      console.error("[v0] Missing DATABASE_URL")
      return NextResponse.json(
        {
          success: false,
          error: "Database URL not configured",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Environment variables validated")
    console.log("[v0] JAMAI_BASE_URL:", process.env.JAMAI_BASE_URL || "https://api.jamaibase.com")

    let client: JamAI
    try {
      console.log("[v0] Initializing JamAI client...")
      client = new JamAI({
        apiKey: process.env.JAMAI_API_KEY,
        projectId: process.env.JAMAI_PROJECT_ID,
        baseURL: process.env.JAMAI_BASE_URL || "https://api.jamaibase.com",
      })
      console.log("[v0] JamAI client initialized successfully")
    } catch (initError: any) {
      console.error("[v0] Failed to initialize JamAI client:", initError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize JamAI client",
          details: initError.message,
        },
        { status: 500 },
      )
    }

    const sql = neon(process.env.DATABASE_URL)

    console.log("[v0] Fetching properties from Neon database...")

    const properties = await sql`SELECT * FROM properties WHERE is_available = true`

    console.log(`[v0] Found ${properties.length} properties to sync`)

    if (properties.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No properties to sync",
        count: 0,
      })
    }

    console.log("[v0] Attempting to sync first property as test...")
    const results = []
    let firstError = null

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      try {
        console.log(`[v0] Syncing property ${i + 1}/${properties.length}: ${property.id} - ${property.title}`)

        const description =
          property.description ||
          `${property.title} located in ${property.location}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms.`

        const rowData = {
          Property_ID: property.id.toString(),
          Title: property.title || "Untitled Property",
          Location: property.location || "Unknown",
          Property_Type: property.bedrooms >= 3 ? "House" : "Apartment",
          Bedrooms: property.bedrooms || 1,
          Bathrooms: property.bathrooms || 1,
          Price: Number.parseFloat(property.price) || 0,
          Furnished: property.furnished || "unfurnished",
          Description: description,
        }

        console.log("[v0] Row data:", JSON.stringify(rowData, null, 2))

        const row = await client.table.addRow({
          table_type: "action",
          table_id: "properties_knowledge",
          data: [rowData],
          stream: false,
        })

        results.push(row)
        console.log(`[v0] Successfully synced property ${property.id}`)
      } catch (rowError: any) {
        console.error(`[v0] Error syncing property ${property.id}:`, rowError)
        console.error(`[v0] Error message:`, rowError.message)
        console.error(`[v0] Error stack:`, rowError.stack)

        if (!firstError) {
          firstError = {
            propertyId: property.id,
            propertyTitle: property.title,
            error: rowError.message,
            details: rowError.response?.data || rowError.toString(),
          }
        }

        // Stop after first error to avoid rate limiting
        if (results.length === 0) {
          break
        }
      }
    }

    if (results.length === 0 && firstError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to sync any properties",
          firstError: firstError,
          hint: "Please ensure the 'properties_knowledge' Action Table exists in JamAI Base with the correct columns.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${results.length} out of ${properties.length} properties to JamAI Base`,
      count: results.length,
      total: properties.length,
      ...(firstError && { warnings: [firstError] }),
    })
  } catch (error: any) {
    console.error("[v0] Critical error in sync process:", error)
    console.error("[v0] Error stack:", error.stack)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to sync properties",
        details: error.response?.data || error.toString(),
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
