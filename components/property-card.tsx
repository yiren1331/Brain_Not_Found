"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, MapPin, Heart, Phone, Sofa, ExternalLink, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { useFavourites } from "@/contexts/favourites-context"

interface PropertyCardProps {
  id: number
  title: string
  title_ms?: string
  location?: string
  address?: string
  price: string | number
  bedrooms: number
  bathrooms: number
  size_sqft?: number
  image_url: string
  contact_number: string
  furnished: "fully" | "partial" | "unfurnished"
  description?: string
  description_ms?: string
}

export function PropertyCard({
  id,
  title,
  title_ms,
  location,
  address,
  price,
  bedrooms,
  bathrooms,
  size_sqft,
  image_url,
  contact_number,
  furnished,
  description,
  description_ms,
}: PropertyCardProps) {
  const { t, language } = useLanguage()
  const { toggleFavourite, isFavourite } = useFavourites()
  const [showDetails, setShowDetails] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isFav = isFavourite(id)

  const getFurnishedLabel = () => {
    if (furnished === "fully") return t("fullyFurnished")
    if (furnished === "partial") return t("partiallyFurnished")
    return t("unfurnished")
  }

  const displayTitle = language === "ms" && title_ms ? title_ms : title
  const displayDescription = language === "ms" && description_ms ? description_ms : description

  const isGoogleSearchUrl = image_url?.includes("google.com/search")

  const extractedLocation =
    location || address?.split("/").pop()?.replace(/\+/g, " ").split(" ").slice(0, 2).join(" ") || ""

  const placeholderQuery = `${title} ${extractedLocation} ${bedrooms} bedroom apartment condominium Malaysia`.trim()

  const displayImage =
    !image_url || isGoogleSearchUrl || imageError
      ? `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(placeholderQuery)}`
      : image_url

  const displayLocation = location || address?.split("/").pop()?.replace(/\+/g, " ") || title

  const isGoogleMapsUrl = address?.includes("google.com/maps")
  const mapsLink = isGoogleMapsUrl
    ? address
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayLocation)}`

  const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price

  const handleToggleFavourite = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("[v0] Toggling favourite for property ID:", id, "Current status:", isFav)
    toggleFavourite(id)
    console.log("[v0] After toggle, new status:", !isFav)
  }

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={displayImage || "/placeholder.svg"}
            alt={displayTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            priority={false}
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card"
            onClick={handleToggleFavourite}
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        <CardContent className="p-6">
          <div className="mb-4">
            <Link href={`/search?title=${encodeURIComponent(title)}`}>
              <h3 className="text-xl font-semibold mb-2 text-balance hover:text-primary transition-colors cursor-pointer">
                {displayTitle}
              </h3>
            </Link>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{displayLocation}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>
                {bedrooms} {bedrooms === 1 ? t("bed") : t("beds")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>
                {bathrooms} {t("bath")}
              </span>
            </div>
            {size_sqft && size_sqft > 0 && (
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                <span>{size_sqft} sqft</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Sofa className="h-4 w-4" />
              <span>{getFurnishedLabel()}</span>
            </div>
          </div>

          {contact_number && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Phone className="h-4 w-4" />
              <span className="font-medium">{contact_number}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <span className="text-2xl font-bold text-primary">RM{numericPrice.toLocaleString()}</span>
              <span className="text-muted-foreground text-sm">/{t("perMonth")}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
              <Info className="h-4 w-4 mr-2" />
              {t("viewDetails")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{displayTitle}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              {displayLocation}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={displayImage || "/placeholder.svg"}
                alt={displayTitle}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                priority={false}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <span className="text-3xl font-bold text-primary">RM{numericPrice.toLocaleString()}</span>
                <span className="text-muted-foreground ml-2">/{t("perMonth")}</span>
              </div>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>
                    {bedrooms} {bedrooms === 1 ? t("bed") : t("beds")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>
                    {bathrooms} {t("bath")}
                  </span>
                </div>
                {size_sqft && size_sqft > 0 && (
                  <div className="flex items-center gap-1">
                    <Square className="h-4 w-4" />
                    <span>{size_sqft} sqft</span>
                  </div>
                )}
              </div>
            </div>

            {displayDescription && (
              <div>
                <h3 className="font-semibold text-lg mb-2">{t("description")}</h3>
                <p className="text-muted-foreground leading-relaxed">{displayDescription}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-2">{t("furnishing")}</h3>
              <Badge variant="secondary" className="text-base px-4 py-1">
                <Sofa className="h-4 w-4 mr-2" />
                {getFurnishedLabel()}
              </Badge>
            </div>

            <div className="space-y-3">
              {contact_number && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("contact")}</p>
                    <p className="font-semibold text-lg">{contact_number}</p>
                  </div>
                </div>
              )}

              <Button variant="outline" className="w-full bg-transparent" asChild>
                <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4 mr-2" />
                  {t("viewOnMap")}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
