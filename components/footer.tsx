"use client"

import Link from "next/link"
import { Home } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary mb-4">
            <Home className="h-6 w-6" />
            <span>{t("brandName")}</span>
          </Link>
          <p className="text-sm text-muted-foreground text-pretty max-w-md">{t("footerTagline")}</p>
        </div>

        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {t("brandName")}. {t("allRights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
