import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET single property
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await sql`SELECT * FROM properties WHERE id = ${id}`

    if (result.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 })
  }
}

// PUT update property
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
      UPDATE properties SET
        title = ${title},
        title_ms = ${title_ms || null},
        location = ${location},
        address = ${address || null},
        price = ${price},
        bedrooms = ${bedrooms},
        bathrooms = ${bathrooms},
        size_sqft = ${size_sqft || null},
        furnished = ${furnished || "unfurnished"},
        contact_number = ${contact_number || null},
        description = ${description || null},
        description_ms = ${description_ms || null},
        image_url = ${image_url || null},
        is_available = ${is_available !== false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating property:", error)
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
  }
}

// DELETE property
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await sql`DELETE FROM properties WHERE id = ${id} RETURNING *`

    if (result.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Property deleted successfully" })
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 })
  }
}
