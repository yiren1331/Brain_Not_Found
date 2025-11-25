"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface FavouritesContextType {
  favourites: number[]
  toggleFavourite: (propertyId: number) => void
  isFavourite: (propertyId: number) => boolean
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined)

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favourites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("property-favourites")
    if (saved) {
      try {
        setFavourites(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading favourites:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save favourites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("property-favourites", JSON.stringify(favourites))
    }
  }, [favourites, isLoaded])

  const toggleFavourite = (propertyId: number) => {
    console.log("[v0] FavouritesContext - toggling favourite:", propertyId)
    console.log("[v0] FavouritesContext - current favourites:", favourites)

    setFavourites((prev) => {
      const newFavourites = prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]

      console.log("[v0] FavouritesContext - new favourites:", newFavourites)
      return newFavourites
    })
  }

  const isFavourite = (propertyId: number) => {
    return favourites.includes(propertyId)
  }

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  )
}

export function useFavourites() {
  const context = useContext(FavouritesContext)
  if (context === undefined) {
    throw new Error("useFavourites must be used within a FavouritesProvider")
  }
  return context
}
