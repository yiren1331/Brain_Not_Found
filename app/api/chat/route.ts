import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(req: Request) {
  console.log("[v0] Chat API: Request received")

  try {
    const { messages } = await req.json()
    console.log("[v0] Chat API: Processing", messages.length, "messages")

    const lastMessage = messages[messages.length - 1]
    const userQuery = lastMessage.content

    console.log("[v0] Chat API: User query:", userQuery)

    const isMalay = /\b(saya|nak|cari|rumah|bilik|harga|murah|dengan|di|hartanah|dekat)\b/i.test(
      userQuery.toLowerCase(),
    )
    console.log("[v0] Chat API: Detected language:", isMalay ? "Malay" : "English")

    const sql = neon(process.env.DATABASE_URL!)

    let locationFilter = ""
    let bedroomsFilter = 0
    let maxPriceFilter = 0
    const minPriceFilter = 0
    let furnishedFilter = ""

    const locations = [
      "KLCC",
      "Bukit Bintang",
      "Mont Kiara",
      "Petaling Jaya",
      "Subang Jaya",
      "Shah Alam",
      "Cheras",
      "Ampang",
      "Setapak",
      "Kepong",
      "Wangsa Maju",
      "Titiwangsa",
      "Sentul",
      "Puchong",
      "Cyberjaya",
      "Putrajaya",
      "Klang",
      "Damansara",
      "Kajang",
      "Bangi",
      "Serdang",
    ]

    for (const loc of locations) {
      if (userQuery.toLowerCase().includes(loc.toLowerCase())) {
        locationFilter = loc
        console.log("[v0] Chat API: Detected location:", locationFilter)
        break
      }
    }

    const bedroomMatch = userQuery.match(/(\d+)\s*(bilik|bedroom|room|bed)/i)
    if (bedroomMatch) {
      bedroomsFilter = Number.parseInt(bedroomMatch[1])
      console.log("[v0] Chat API: Detected bedrooms:", bedroomsFilter)
    }

    const maxPriceMatch = userQuery.match(/(?:bawah|under|below|maksimum|max)\s*(?:RM|rm)?\s*(\d+)/i)
    if (maxPriceMatch) {
      maxPriceFilter = Number.parseInt(maxPriceMatch[1])
      console.log("[v0] Chat API: Detected max price:", maxPriceFilter)
    }

    if (userQuery.match(/fully furnished|lengkap|berperabot lengkap/i)) {
      furnishedFilter = "fully"
    } else if (userQuery.match(/partial|separuh|semi/i)) {
      furnishedFilter = "partial"
    }

    let properties
    if (locationFilter) {
      properties = await sql`
        SELECT id, title, title_ms, location, address, price, bedrooms, bathrooms, 
               size_sqft, furnished, contact_number, description, description_ms, image_url
        FROM properties
        WHERE is_available = true
          AND LOWER(location) LIKE ${`%${locationFilter.toLowerCase()}%`}
        ORDER BY created_at DESC
        LIMIT 100
      `
      console.log("[v0] Chat API: Fetched", properties.length, "properties from database for location:", locationFilter)
    } else {
      properties = await sql`
        SELECT id, title, title_ms, location, address, price, bedrooms, bathrooms, 
               size_sqft, furnished, contact_number, description, description_ms, image_url
        FROM properties
        WHERE is_available = true
        ORDER BY created_at DESC
        LIMIT 100
      `
      console.log("[v0] Chat API: Fetched", properties.length, "properties from database")
    }

    let filteredProperties = properties

    if (bedroomsFilter > 0) {
      filteredProperties = filteredProperties.filter((p: any) => p.bedrooms === bedroomsFilter)
    }

    if (maxPriceFilter > 0) {
      filteredProperties = filteredProperties.filter((p: any) => Number.parseFloat(p.price) <= maxPriceFilter)
    }

    if (furnishedFilter) {
      filteredProperties = filteredProperties.filter((p: any) => p.furnished === furnishedFilter)
    }

    console.log("[v0] Chat API: Filtered to", filteredProperties.length, "matching properties")

    if (filteredProperties.length === 0) {
      const noResultsMessage = isMalay
        ? `Maaf, tiada hartanah di ${locationFilter || "lokasi yang anda cari"} yang sepadan dengan carian anda. Sila cuba dengan kriteria yang berbeza atau lokasi lain.`
        : `Sorry, no properties in ${locationFilter || "your search location"} match your criteria. Please try different filters or another location.`
      return NextResponse.json({ message: noResultsMessage })
    }

    const topProperties = filteredProperties.slice(0, 5)

    const propertyContext = topProperties
      .map((p: any, index: number) => {
        const desc = isMalay ? p.description_ms || p.description : p.description
        return `Property ${index + 1}:
- Title: ${isMalay ? p.title_ms || p.title : p.title}
- Location: ${p.location}
- Price: RM${p.price}
- Bedrooms: ${p.bedrooms}
- Size: ${p.size_sqft} sqft
- Furnished: ${p.furnished}
- Contact: ${p.contact_number}
- Description: ${desc?.substring(0, 200)}...
- Image: ${p.image_url}
- Map: ${p.address}`
      })
      .join("\n\n")

    const enhancedQuery = `${userQuery}\n\nAvailable Properties:\n${propertyContext}`

    console.log(
      "[v0] Chat API: Enhanced query with property context (first 300 chars):",
      enhancedQuery.substring(0, 300),
    )

    const jamaiApiKey = process.env.JAMAI_API_KEY
    const jamaiProjectId = process.env.JAMAI_PROJECT_ID
    const jamaiBaseUrl = process.env.JAMAI_BASE_URL || "https://api.jamaibase.com"
    const jamaiTableIds = process.env.JAMAI_TABLE_IDS || ""

    if (!jamaiApiKey || !jamaiProjectId) {
      throw new Error("JamAI credentials not configured")
    }

    const tableIds = jamaiTableIds.split(",").map((id) => id.trim())
    console.log("[v0] Chat API: Available tables:", tableIds)

    const selectedTable = isMalay
      ? tableIds.find((id) => id.toLowerCase().includes("malay")) || tableIds[0]
      : tableIds.find((id) => !id.toLowerCase().includes("malay") && id.toLowerCase().includes("hackathon")) ||
        tableIds[0]

    console.log("[v0] Chat API: Selected JamAI table:", selectedTable)

    const jamaiResponse = await fetch(`${jamaiBaseUrl}/api/v1/gen_tables/action/rows/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jamaiApiKey}`,
        "x-project-id": jamaiProjectId,
      },
      body: JSON.stringify({
        table_id: selectedTable,
        data: [
          {
            user_query: enhancedQuery,
          },
        ],
        stream: false,
      }),
    })

    console.log("[v0] Chat API: JamAI response status:", jamaiResponse.status)

    if (!jamaiResponse.ok) {
      const errorText = await jamaiResponse.text()
      console.error("[v0] Chat API: JamAI error:", errorText)

      if (jamaiResponse.status === 403) {
        return buildDatabaseResponse(topProperties, isMalay, locationFilter)
      }

      throw new Error(`JamAI API error: ${jamaiResponse.status} - ${errorText}`)
    }

    const jamaiData = await jamaiResponse.json()
    console.log("[v0] Chat API: JamAI data received:", JSON.stringify(jamaiData).substring(0, 200))

    let aiResponse = ""

    if (jamaiData.rows && jamaiData.rows.length > 0) {
      const row = jamaiData.rows[0]
      const columns = row.columns || {}

      console.log("[v0] Chat API: Available columns:", Object.keys(columns))

      const possibleOutputColumns = [
        "ai_response",
        "suggestion",
        "response",
        "output",
        "answer",
        "Cadangan Bilik",
        "Cadangan",
        "Respons",
      ]

      for (const colName of possibleOutputColumns) {
        if (columns[colName]) {
          if (columns[colName].value) {
            aiResponse = columns[colName].value
            break
          }

          if (columns[colName].text) {
            aiResponse = columns[colName].text
            break
          }

          if (
            columns[colName].choices &&
            Array.isArray(columns[colName].choices) &&
            columns[colName].choices.length > 0
          ) {
            const choice = columns[colName].choices[0]
            if (choice.message && choice.message.content) {
              aiResponse = choice.message.content
              break
            }
          }
        }
      }
    }

    if (!aiResponse) {
      console.log("[v0] Chat API: No JamAI response, using database fallback")
      return buildDatabaseResponse(topProperties, isMalay, locationFilter)
    }

    console.log("[v0] Chat API: Raw AI response:", aiResponse.substring(0, 200))

    const finalResponse = buildDatabaseResponse(topProperties, isMalay, locationFilter)
    return finalResponse
  } catch (error: any) {
    console.error("[v0] Chat API: Error:", error)

    return NextResponse.json(
      {
        message: "Maaf, terdapat masalah teknikal. / Sorry, I encountered a technical error. Please try again later.",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

function buildDatabaseResponse(properties: any[], isMalay: boolean, locationFilter: string) {
  if (properties.length === 0) {
    const noResultsMessage = isMalay
      ? `Maaf, tiada hartanah di ${locationFilter || "lokasi yang anda cari"} yang sepadan dengan carian anda. Sila cuba dengan kriteria yang berbeza.`
      : `Sorry, no properties in ${locationFilter || "your search location"} match your search criteria. Please try different filters.`
    return NextResponse.json({ message: noResultsMessage })
  }

  const greeting = isMalay
    ? `Saya jumpa ${properties.length} hartanah di ${locationFilter} yang sesuai untuk anda:\n\n`
    : `I found ${properties.length} properties in ${locationFilter} that match your search:\n\n`

  const propertyList = properties
    .map((p: any, index: number) => {
      const title = isMalay ? p.title_ms || p.title : p.title
      const desc = isMalay ? p.description_ms || p.description : p.description

      return `**${index + 1}. ${title}**
📍 Lokasi: ${p.location}
💰 Harga: RM${p.price}/bulan
🛏️ Bilik Tidur: ${p.bedrooms}
📐 Saiz: ${p.size_sqft} kps
🪑 Perabot: ${p.furnished === "fully" ? "Lengkap" : p.furnished === "partial" ? "Separuh" : "Tanpa"}
📞 Hubungi: ${p.contact_number}

${desc?.substring(0, 150)}...

🖼️ [Lihat Gambar](${p.image_url})
🗺️ [Lihat Peta](${p.address})

[Lihat Hartanah](/search?title=${encodeURIComponent(p.title)})`
    })
    .join("\n\n---\n\n")

  return NextResponse.json({ message: greeting + propertyList })
}
