import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

export type Property = {
  id: number
  title: string
  title_ms: string | null
  location: string
  address: string | null
  price: number
  bedrooms: number
  bathrooms: number
  size_sqft: number | null
  furnished: "fully" | "partial" | "unfurnished"
  contact_number: string | null
  description: string | null
  description_ms: string | null
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}
