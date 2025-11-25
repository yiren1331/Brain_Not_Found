"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PropertyCard } from "@/components/property-card"
import { useLanguage } from "@/contexts/language-context"
import { Loader2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Property {
  id: number
  title: string
  title_ms: string
  location: string
  bedrooms: number
  bathrooms: number
  price: string
  image_url: string
  furnished: string
  contact_number: string
  description: string
  description_ms: string
  address: string
  size_sqft: number
}

export function SearchResults() {
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const location = searchParams.get("location") || ""
  const bedrooms = searchParams.get("bedrooms")
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const furnished = searchParams.get("furnished")
  const title = searchParams.get("title") || ""

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch("/api/properties")
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()

        let filtered = Array.isArray(data.properties) ? data.properties : Array.isArray(data) ? data : []

        if (title) {
          filtered = filtered.filter(
            (p) => p.title?.toLowerCase() === title.toLowerCase() || p.title_ms?.toLowerCase() === title.toLowerCase(),
          )
        }

        if (location) {
          filtered = filtered.filter((p) => {
            const searchText = location.toLowerCase()
            const locationMatch = p.location?.toLowerCase().includes(searchText)
            return locationMatch
          })
        }

        if (bedrooms) {
          filtered = filtered.filter((p) => p.bedrooms === Number.parseInt(bedrooms))
        }

        if (minPrice) {
          filtered = filtered.filter((p) => Number.parseFloat(p.price) >= Number.parseInt(minPrice))
        }

        if (maxPrice) {
          filtered = filtered.filter((p) => Number.parseFloat(p.price) <= Number.parseInt(maxPrice))
        }

        if (furnished && furnished !== "any") {
          filtered = filtered.filter((p) => p.furnished?.toLowerCase() === furnished.toLowerCase())
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
  }, [location, bedrooms, minPrice, maxPrice, furnished, title])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            {t("home")}
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("searchResults")}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {title && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">{title}</span>}
          {location && <span className="px-3 py-1 bg-muted rounded-full capitalize">{location}</span>}
          {bedrooms && (
            <span className="px-3 py-1 bg-muted rounded-full">
              {bedrooms} {t("bedrooms")}
            </span>
          )}
          {minPrice && <span className="px-3 py-1 bg-muted rounded-full">Min: RM{minPrice}</span>}
          {maxPrice && <span className="px-3 py-1 bg-muted rounded-full">Max: RM{maxPrice}</span>}
          {furnished && furnished !== "any" && (
            <span className="px-3 py-1 bg-muted rounded-full capitalize">{furnished}</span>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          {properties.length} {properties.length === 1 ? t("property") : t("properties")} {t("found")}
        </p>
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
