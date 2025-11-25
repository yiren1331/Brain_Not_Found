"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PropertyCard } from "@/components/property-card"
import { useLanguage } from "@/contexts/language-context"
import { useFavourites } from "@/contexts/favourites-context"
import { Heart } from "lucide-react"

interface Property {
  id: number
  title: string
  title_ms?: string
  location?: string
  address?: string
  price: string
  bedrooms: number
  bathrooms: number
  size_sqft?: number
  image_url: string
  contact_number: string
  furnished: "fully" | "partial" | "unfurnished"
  description?: string
  description_ms?: string
}

export default function FavouritesPage() {
  const { t } = useLanguage()
  const { favourites } = useFavourites()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavouriteProperties = async () => {
      console.log("[v0] Favourites page - favourite IDs:", favourites)

      if (favourites.length === 0) {
        setProperties([])
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/properties?all=true")
        const data = await response.json()

        console.log("[v0] Favourites page - fetched properties count:", data.length)

        if (data && Array.isArray(data)) {
          const favouriteProperties = data.filter((prop: Property) => favourites.includes(prop.id))
          console.log("[v0] Favourites page - filtered favourite properties:", favouriteProperties.length)
          setProperties(favouriteProperties)
        }
      } catch (error) {
        console.error("[v0] Favourites page - error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavouriteProperties()
  }, [favourites])

  return (
    <main className="min-h-screen">
      <Header />

      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              <h1 className="text-4xl font-bold">{t("favourites")}</h1>
            </div>
            <p className="text-muted-foreground text-lg">{t("favouritesDescription")}</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("loading")}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">{t("noFavourites")}</h2>
              <p className="text-muted-foreground">{t("noFavouritesDescription")}</p>
            </div>
          ) : (
            <>
              <p className="text-center text-muted-foreground mb-8">
                {properties.length} {properties.length === 1 ? t("property") : t("properties")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    title={property.title}
                    title_ms={property.title_ms}
                    location={property.location}
                    address={property.address}
                    price={property.price}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    size_sqft={property.size_sqft}
                    image_url={property.image_url}
                    contact_number={property.contact_number}
                    furnished={property.furnished}
                    description={property.description}
                    description_ms={property.description_ms}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
