"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Home, Search } from "lucide-react"

interface Property {
  id: number
  title: string
  title_ms: string
  location: string
  bedrooms: number
  price: string
}

export default function PropertiesListPage() {
  const { language, t } = useLanguage()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch("/api/properties?all=true")
        const data = await response.json()
        setProperties(data)
      } catch (error) {
        console.error("[v0] Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t("loading") || "Loading..."}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("allProperties")}</h1>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            {t("home")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t("clickToViewProperty")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/search?title=${encodeURIComponent(language === "ms" ? property.title_ms : property.title)}`}
                className="block"
              >
                <div className="p-4 rounded-lg border hover:bg-accent hover:border-primary transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {language === "ms" ? property.title_ms : property.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {property.location} • {property.bedrooms} {t("bedrooms")} • RM{property.price}/{t("month")}
                      </p>
                    </div>
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
