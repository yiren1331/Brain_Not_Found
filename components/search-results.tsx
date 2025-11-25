"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PropertyCard } from "@/components/property-card"
import { useLanguage } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"

interface Property {
  id: number
  title: string
  title_ms: string
  location: string
  bedrooms: number
  bathrooms: number
  price: number
  image_url: string
  furnished: string
  contact: string
}

export function SearchResults() {
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const location = searchParams.get("location") || "All"
  const bedrooms = searchParams.get("bedrooms")
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const furnished = searchParams.get("furnished")

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch("/api/properties")
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()

        // Filter properties based on search params
        let filtered = Array.isArray(data) ? data : []

        if (location && location !== "All") {
          filtered = filtered.filter((p) => p.location.toLowerCase().includes(location.toLowerCase()))
        }

        if (bedrooms) {
          filtered = filtered.filter((p) => p.bedrooms === Number.parseInt(bedrooms))
        }

        if (minPrice) {
          filtered = filtered.filter((p) => p.price >= Number.parseInt(minPrice))
        }

        if (maxPrice) {
          filtered = filtered.filter((p) => p.price <= Number.parseInt(maxPrice))
        }

        if (furnished) {
          filtered = filtered.filter((p) => p.furnished.toLowerCase() === furnished.toLowerCase())
        }

        setProperties(filtered)
      } catch (error) {
        console.error("[v0] Error fetching properties:", error)
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [location, bedrooms, minPrice, maxPrice, furnished])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("searchResults")}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {location !== "All" && <span className="px-3 py-1 bg-muted rounded-full">{location}</span>}
          {bedrooms && (
            <span className="px-3 py-1 bg-muted rounded-full">
              {bedrooms} {t("bedrooms")}
            </span>
          )}
          {minPrice && <span className="px-3 py-1 bg-muted rounded-full">Min: RM{minPrice}</span>}
          {maxPrice && <span className="px-3 py-1 bg-muted rounded-full">Max: RM{maxPrice}</span>}
          {furnished && <span className="px-3 py-1 bg-muted rounded-full">{furnished}</span>}
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">{t("noPropertiesFound")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      )}
    </div>
  )
}
