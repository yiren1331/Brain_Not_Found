"use client"

import { PropertyCard } from "@/components/property-card"
import { useLanguage } from "@/contexts/language-context"
import { useEffect, useState } from "react"
import type { Property } from "@/lib/db"

export function FeaturedProperties() {
  const { t } = useLanguage()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch("/api/properties")
        const data = await response.json()
        setProperties(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching properties:", error)
        setProperties([])
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  return (
    <section className="py-16 md:py-24" id="properties">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{t("featuredTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">{t("featuredSubtitle")}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("noProperties") || "No properties available at the moment."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                titleMs={property.title_ms}
                location={property.location}
                price={Number(property.price)}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.size_sqft || 0}
                image={property.image_url || "/modern-apartment-living.png"}
                contact={property.contact_number || ""}
                furnished={property.furnished}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
