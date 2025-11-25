import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET all properties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get("all") === "true"

    let properties
    if (showAll) {
      properties = await sql`SELECT * FROM properties ORDER BY created_at DESC`
    } else {
      properties = await sql`SELECT * FROM properties WHERE is_available = true ORDER BY created_at DESC`
    }

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}

// POST create new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      title_ms,
      location,
      address,
      price,
      bedrooms,
      bathrooms,
      size_sqft,
      furnished,
      contact_number,
      description,
      description_ms,
      image_url,
      is_available,
    } = body

    const result = await sql`
      INSERT INTO properties (
        title, title_ms, location, address, price, bedrooms, bathrooms,
        size_sqft, furnished, contact_number, description, description_ms,
        image_url, is_available
      ) VALUES (
        ${title}, ${title_ms || null}, ${location}, ${address || null},
        ${price}, ${bedrooms}, ${bathrooms}, ${size_sqft || null},
        ${furnished || "unfurnished"}, ${contact_number || null},
        ${description || null}, ${description_ms || null},
        ${image_url || null}, ${is_available !== false}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
