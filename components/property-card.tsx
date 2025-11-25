"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, MapPin, Heart, Phone, Sofa } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

interface PropertyCardProps {
  id: number
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  image: string
  contact: string
  furnished: "fully" | "partial" | "unfurnished"
}

export function PropertyCard({
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  image,
  contact,
  furnished,
}: PropertyCardProps) {
  const { t } = useLanguage()

  const getFurnishedLabel = () => {
    if (furnished === "fully") return t("fullyFurnished")
    if (furnished === "partial") return t("partiallyFurnished")
    return t("unfurnished")
  }

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card"
        >
          <Heart className="h-4 w-4" />
        </Button>
        <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">Featured</Badge>
      </div>

      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2 text-balance">{title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
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
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{area} sqft</span>
          </div>
          <div className="flex items-center gap-1">
            <Sofa className="h-4 w-4" />
            <span>{getFurnishedLabel()}</span>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Phone className="h-4 w-4" />
          <span className="font-medium">{contact}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-2xl font-bold text-primary">RM{price.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">/{t("perMonth")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
