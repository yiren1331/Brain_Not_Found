import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    console.log("[v0] Starting JamAI sync...")

    const body = await request.json().catch(() => ({}))
    const { tables } = body

    const jamaiApiKey = process.env.JAMAI_API_KEY
    const jamaiProjectId = process.env.JAMAI_PROJECT_ID
    const jamaiBaseUrl = process.env.JAMAI_BASE_URL || "https://api.jamaibase.com"

    const jamaiTableIds = process.env.JAMAI_TABLE_IDS
      ? process.env.JAMAI_TABLE_IDS.split(",").map((id) => id.trim())
      : process.env.JAMAI_TABLE_ID
        ? [process.env.JAMAI_TABLE_ID]
        : []

    if (!jamaiApiKey || !jamaiProjectId) {
      return NextResponse.json(
        {
          error: "Missing JamAI credentials",
          details: "Please set JAMAI_API_KEY and JAMAI_PROJECT_ID environment variables",
        },
        { status: 400 },
      )
    }

    if (jamaiTableIds.length === 0) {
      return NextResponse.json(
        {
          error: "No JamAI tables configured",
          details: "Please set JAMAI_TABLE_IDS (comma-separated) or JAMAI_TABLE_ID environment variable",
        },
        { status: 400 },
      )
    }

    const tablesToSync = tables && tables.length > 0 ? tables : jamaiTableIds

    console.log(`[v0] Syncing to tables: ${tablesToSync.join(", ")}`)
    console.log("[v0] Fetching properties from Neon database...")

    const properties = await sql`
      SELECT 
        id, title, title_ms, location, bedrooms, bathrooms, 
        price, contact_number, furnished, image_url
      FROM properties
      ORDER BY id
    `

    console.log(`[v0] Found ${properties.length} properties`)

    if (properties.length === 0) {
      return NextResponse.json({
        message: "No properties found in database",
        synced: 0,
      })
    }

    const tableResults: Record<string, any> = {}
    let hasInsufficientCredits = false
    let creditErrorMessage = ""

    for (const tableId of tablesToSync) {
      if (hasInsufficientCredits) {
        tableResults[tableId] = {
          total: 0,
          succeeded: 0,
          failed: 0,
          error: "Skipped due to insufficient credits",
        }
        continue
      }

      console.log(`[v0] Syncing to table: ${tableId}`)

      const results = []
      let successCount = 0
      let failCount = 0

      for (const property of properties) {
        if (hasInsufficientCredits) {
          break
        }

        try {
          let propertyData: any

          if (tableId === "hackathon malay") {
            propertyData = {
              ID: property.id.toString(),
              Lokasi: property.location || "",
              "Harga Minimum": Number.parseInt(property.price || "0") - 200,
              "Harga Maksimum": Number.parseInt(property.price || "0") + 200,
              "Tarikh Masuk": new Date().toISOString().split("T")[0],
              "Bilik Tidur": property.bedrooms || 0,
              Perabot:
                property.furnished === "fully" ? "Lengkap" : property.furnished === "partially" ? "Separa" : "Tiada",
            }
          } else {
            propertyData = {
              property_id: property.id.toString(),
              title_en: property.title || "",
              title_ms: property.title_ms || "",
              location: property.location || "",
              bedrooms: property.bedrooms?.toString() || "0",
              bathrooms: property.bathrooms?.toString() || "0",
              price: property.price?.toString() || "0",
              contact: property.contact_number || "",
              furnished: property.furnished || "",
              image_url: property.image_url || "",
              description: `${property.title} - ${property.bedrooms} bed, ${property.bathrooms} bath property in ${property.location}. Price: RM${property.price}/month. Contact: ${property.contact_number}`,
            }
          }

          const response = await fetch(`${jamaiBaseUrl}/api/v1/gen_tables/action/rows/add`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jamaiApiKey}`,
              "Content-Type": "application/json",
              "X-PROJECT-ID": jamaiProjectId,
            },
            body: JSON.stringify({
              table_id: tableId,
              data: [propertyData],
              stream: false,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()

            if (errorText.includes("insufficient_credits") || errorText.includes("InsufficientCreditsError")) {
              hasInsufficientCredits = true

              try {
                const errorJson = JSON.parse(errorText)
                creditErrorMessage = errorJson.message || "Insufficient credits in JamAI Base account"
              } catch {
                creditErrorMessage = "Insufficient credits in JamAI Base account"
              }

              console.error(`[v0] JamAI credit error detected. Stopping sync.`)
              break
            }

            console.error(`[v0] Failed to sync property ${property.id} to ${tableId}:`, errorText)
            failCount++
          } else {
            successCount++
          }
        } catch (error: any) {
          console.error(`[v0] Error syncing property ${property.id} to ${tableId}:`, error)
          failCount++
        }
      }

      tableResults[tableId] = {
        total: properties.length,
        succeeded: successCount,
        failed: failCount,
      }

      console.log(`[v0] Sync to ${tableId} complete: ${successCount} succeeded, ${failCount} failed`)
    }

    if (hasInsufficientCredits) {
      return NextResponse.json(
        {
          error: "insufficient_credits",
          message: "JamAI Base Account Out of Credits",
          details: creditErrorMessage,
          solution:
            "Your JamAI Base account has run out of credits. Please add credits at https://cloud.jamaibase.com/ or change to a free AI model in your action table settings.",
          note: "Your website chat assistant works without JamAI sync. You can continue using the site for your hackathon demo.",
          tables: tableResults,
        },
        { status: 402 },
      )
    }

    return NextResponse.json({
      message: "Sync completed",
      tables: tableResults,
    })
  } catch (error: any) {
    console.error("[v0] JamAI sync error:", error)
    return NextResponse.json(
      {
        error: "Failed to sync properties to JamAI",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
