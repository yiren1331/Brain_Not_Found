import { Suspense } from "react"
import { SearchResults } from "@/components/search-results"

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  )
}
