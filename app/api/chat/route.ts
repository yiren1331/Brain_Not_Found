import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(req: Request) {
  console.log("[v0] Chat API: Request received")

  try {
    const { messages } = await req.json()
    console.log("[v0] Chat API: Processing", messages.length, "messages")

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userQuery = lastMessage.content.toLowerCase()

    console.log("[v0] Chat API: User query:", userQuery)

    // Initialize database connection
    const sql = neon(process.env.DATABASE_URL!)

    // Detect language
    const isMalay = /\b(saya|nak|cari|rumah|bilik|harga|murah|dengan)\b/i.test(userQuery)
    console.log("[v0] Chat API: Detected language:", isMalay ? "Malay" : "English")

    // Extract search parameters
    let location = ""
    let bedrooms = 0
    let maxPrice = 0
    const minPrice = 0
    let furnished = ""

    // Location detection
    const locations = [
      "klcc",
      "bukit bintang",
      "mont kiara",
      "bangsar",
      "petaling jaya",
      "shah alam",
      "subang jaya",
      "puchong",
      "cyberjaya",
      "putrajaya",
      "klang",
      "kajang",
      "bukit jalil",
      "cheras",
      "ampang",
    ]
    for (const loc of locations) {
      if (userQuery.includes(loc)) {
        location = loc
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
        break
      }
    }

    // Bedroom detection
    const bedroomMatch = userQuery.match(/(\d+)\s*(bedroom|bilik|room)/i)
    if (bedroomMatch) {
      bedrooms = Number.parseInt(bedroomMatch[1])
    }

    // Price detection
    const priceMatch = userQuery.match(/(?:rm|ringgit)?\s*(\d+)/i)
    if (priceMatch) {
      maxPrice = Number.parseInt(priceMatch[1])
    }

    // Budget keyword
    if (userQuery.includes("budget") || userQuery.includes("bawah") || userQuery.includes("under")) {
      if (priceMatch) maxPrice = Number.parseInt(priceMatch[1])
    }

    // Furnished detection
    if (userQuery.includes("furnished") || userQuery.includes("berperabot") || userQuery.includes("perabot")) {
      furnished = "full"
    }

    console.log("[v0] Chat API: Extracted params:", { location, bedrooms, maxPrice, furnished })

    // Build SQL query using tagged template literals
    let properties: any[] = []

    if (location && bedrooms > 0 && maxPrice > 0 && furnished) {
      properties = await sql`
        SELECT * FROM properties 
        WHERE is_available = true 
        AND location ILIKE ${`%${location}%`}
        AND bedrooms >= ${bedrooms}
        AND price <= ${maxPrice}
        AND furnished = ${furnished}
        ORDER BY price ASC 
        LIMIT 5
      `
    } else if (location && bedrooms > 0 && maxPrice > 0) {
      properties = await sql`
        SELECT * FROM properties 
        WHERE is_available = true 
        AND location ILIKE ${`%${location}%`}
        AND bedrooms >= ${bedrooms}
        AND price <= ${maxPrice}
        ORDER BY price ASC 
        LIMIT 5
      `
    } else if (location && bedrooms > 0) {
      properties = await sql`
        SELECT * FROM properties 
        WHERE is_available = true 
        AND location ILIKE ${`%${location}%`}
        AND bedrooms >= ${bedrooms}
        ORDER BY price ASC 
        LIMIT 5
      `
    } else if (location && maxPrice > 0) {
      properties = await sql`
        SELECT * FROM properties 
        WHERE is_available = true 
        AND location ILIKE ${`%${location}%`}
        AND price <= ${maxPrice}
        ORDER BY price ASC 
        LIMIT 5
      `
    } else if (location) {
      properties = await sql`
        SELECT * FROM properties 
        WHERE is_available = true 
        AND location ILIKE ${`%${location}%`}
        ORDER BY price ASC 
        LIMIT 5
      `
    } else if (bedrooms > 0 && maxPrice > 0) {
      properties = await sql`
        SELECT * FROM properties 
        WHERE is_available = true 
        AND bedrooms >= ${bedrooms}
        AND price <= ${maxPrice}
        ORDER BY price ASC 
        LIMIT 5
      `
    } else if (bedrooms > 0) {
      properties = await sql`
        SELECT * FROM properties 
        WHERE is_available = true 
        AND bedrooms >= ${bedrooms}
        ORDER BY price ASC 
        LIMIT 5
      `
    } else if (maxPrice > 0) {
      properties = await sql`
        SELECT * FROM properties 
        WHERE is_available = true 
        AND price <= ${maxPrice}
        ORDER BY price ASC 
        LIMIT 5
      `
    } else if (furnished) {
      properties = await sql`
        SELECT * FROM properties 
        WHERE is_available = true 
        AND furnished = ${furnished}
        ORDER BY price ASC 
        LIMIT 5
      `
    } else {
      // No specific filters, return general properties
      properties = await sql`
        SELECT * FROM properties 
        WHERE is_available = true 
        ORDER BY price ASC 
        LIMIT 5
      `
    }

    console.log("[v0] Chat API: Found properties:", properties.length)

    // Generate response
    let response = ""
    let searchUrl = "/search?"
    const searchParams: string[] = []

    if (isMalay) {
      if (properties.length === 0) {
        response = "Maaf, saya tidak jumpa hartanah yang sesuai dengan keperluan anda. Cuba ubah kriteria carian anda."
      } else {
        response = `Saya jumpa ${properties.length} hartanah yang sesuai untuk anda! `

        if (location) {
          response += `di ${location} `
          searchParams.push(`location=${encodeURIComponent(location)}`)
        }
        if (bedrooms > 0) {
          response += `dengan ${bedrooms} bilik tidur `
          searchParams.push(`bedrooms=${bedrooms}`)
        }
        if (maxPrice > 0) {
          response += `dalam bajet RM${maxPrice} `
          searchParams.push(`maxPrice=${maxPrice}`)
        }

        response += "\n\nBerikut adalah beberapa cadangan:\n\n"

        properties.slice(0, 3).forEach((prop: any, i: number) => {
          response += `${i + 1}. **${prop.title_ms || prop.title}**\n`
          response += `   - Lokasi: ${prop.location}\n`
          response += `   - Harga: RM${prop.price}/bulan\n`
          response += `   - Bilik: ${prop.bedrooms} bilik tidur, ${prop.bathrooms} bilik air\n\n`
        })

        searchUrl += searchParams.join("&")
        response += `\n[Lihat Semua Hartanah](${searchUrl})`
      }
    } else {
      if (properties.length === 0) {
        response =
          "Sorry, I couldn't find any properties matching your requirements. Try adjusting your search criteria."
      } else {
        response = `I found ${properties.length} properties that match your needs! `

        if (location) {
          response += `in ${location} `
          searchParams.push(`location=${encodeURIComponent(location)}`)
        }
        if (bedrooms > 0) {
          response += `with ${bedrooms} bedrooms `
          searchParams.push(`bedrooms=${bedrooms}`)
        }
        if (maxPrice > 0) {
          response += `under RM${maxPrice} `
          searchParams.push(`maxPrice=${maxPrice}`)
        }

        response += "\n\nHere are some recommendations:\n\n"

        properties.slice(0, 3).forEach((prop: any, i: number) => {
          response += `${i + 1}. **${prop.title}**\n`
          response += `   - Location: ${prop.location}\n`
          response += `   - Price: RM${prop.price}/month\n`
          response += `   - Rooms: ${prop.bedrooms} bedrooms, ${prop.bathrooms} bathrooms\n\n`
        })

        searchUrl += searchParams.join("&")
        response += `\n[View All Properties](${searchUrl})`
      }
    }

    console.log("[v0] Chat API: Generated response:", response)

    return NextResponse.json({ message: response })
  } catch (error: any) {
    console.error("[v0] Chat API: Error:", error)

    return NextResponse.json(
      {
        message: "Maaf, terdapat masalah teknikal. / Sorry, I encountered a technical error. Please try again.",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
