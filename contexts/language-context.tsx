"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "ms"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Header
    brandName: "Klang Valley HomeRent",
    properties: "Properties",
    about: "About",
    contact: "Contact",
    signIn: "Sign In",
    listProperty: "List Property",

    // Hero
    heroTitle1: "Find Your Perfect",
    heroTitle2: "Rental Home in Klang Valley",
    heroSubtitle:
      "Discover rental properties across Klang Valley from apartments to houses. Your dream home is just a search away.",

    // Search
    location: "Location",
    locationPlaceholder: "Select area in Klang Valley",
    moveInDate: "Move-in Date",
    bedrooms: "Bedrooms",
    bedroomsPlaceholder: "Any",
    priceRange: "Price Range (RM)",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    furnished: "Furnishing",
    furnishedPlaceholder: "Any",
    fullyFurnished: "Fully Furnished",
    partiallyFurnished: "Partially Furnished",
    unfurnished: "Unfurnished",
    search: "Search",

    // Featured Properties
    featuredTitle: "Featured Properties in Klang Valley",
    featuredSubtitle: "Explore our handpicked selection of the best rental properties available right now.",
    perMonth: "per month",
    bed: "bed",
    beds: "beds",
    bath: "baths",
    contact: "Contact",
    viewDetails: "View Details",
    description: "Description",
    furnishing: "Furnishing Status",
    viewOnMap: "View on Map",
    property: "property",
    properties: "properties",
    found: "found",

    favourites: "Favourites",
    favouritesDescription: "Your saved properties for quick access",
    noFavourites: "No Favourites Yet",
    noFavouritesDescription: "Click the heart icon on any property to add it to your favourites",
    loading: "Loading...",

    // Features
    whyChooseUs: "Why Choose Us",
    whyChooseSubtitle: "We make finding your perfect rental home in Klang Valley easy and hassle-free.",
    verifiedListings: "Verified Listings",
    verifiedDesc: "All properties are verified and inspected for quality and safety.",
    easyBooking: "Easy Booking",
    easyBookingDesc: "Simple and secure booking process with instant confirmation.",
    support: "24/7 Support",
    supportDesc: "Our dedicated team is here to help you anytime, anywhere.",
    flexibleTerms: "Flexible Terms",
    flexibleTermsDesc: "Choose rental periods that work best for your lifestyle.",

    // AI Chatbox
    aiAssistant: "AI Assistant",
    onlineNow: "Online now",
    aiWelcomeMessage: "Hello! How can I help you find your perfect rental home in Klang Valley today?",
    aiResponsePlaceholder:
      "Thank you for your message. Our AI assistant is being integrated. For now, please contact us directly at +60 12-345 6789.",
    typeMessage: "Type your message...",

    // Footer
    footerTagline: "Finding a house has never been this easy.",
    allRights: "All rights reserved.",

    // Search Results
    searchResults: "Search Results",
    noPropertiesFound: "No properties found matching your criteria. Try adjusting your filters.",

    // Admin - JamAI Setup
    jamaiSetup: "JamAI Base Setup",
    jamaiSetupDesc: "Configure AI-powered property recommendations and chat",
    setupTables: "Setup JamAI Tables",
    syncProperties: "Sync Properties to JamAI",
    settingUp: "Setting up...",
    syncing: "Syncing...",
    setupSuccess: "JamAI tables created successfully!",
    syncSuccess: "Properties synced to JamAI successfully!",
    setupError: "Error setting up JamAI tables",
    syncError: "Error syncing properties",
  },
  ms: {
    // Header
    brandName: "Klang Valley HomeRent",
    properties: "Hartanah",
    about: "Tentang",
    contact: "Hubungi",
    signIn: "Log Masuk",
    listProperty: "Senarai Hartanah",

    // Hero
    heroTitle1: "Cari Rumah Sewa",
    heroTitle2: "Sempurna Anda di Lembah Klang",
    heroSubtitle:
      "Temui hartanah sewa di seluruh Lembah Klang dari apartmen hingga rumah. Rumah impian anda hanya sejauh carian.",

    // Search
    location: "Lokasi",
    locationPlaceholder: "Pilih kawasan di Lembah Klang",
    moveInDate: "Tarikh Masuk",
    bedrooms: "Bilik Tidur",
    bedroomsPlaceholder: "Apa-apa",
    priceRange: "Julat Harga (RM)",
    minPrice: "Harga Minimum",
    maxPrice: "Harga Maksimum",
    furnished: "Perabot",
    furnishedPlaceholder: "Apa-apa",
    fullyFurnished: "Berperabot Lengkap",
    partiallyFurnished: "Berperabot Separa",
    unfurnished: "Tanpa Perabot",
    search: "Cari",

    // Featured Properties
    featuredTitle: "Hartanah Pilihan di Lembah Klang",
    featuredSubtitle: "Terokai pilihan hartanah sewa terbaik kami yang tersedia sekarang.",
    perMonth: "sebulan",
    bed: "bilik",
    beds: "bilik",
    bath: "bilik air",
    contact: "Hubungi",
    viewDetails: "Lihat Butiran",
    description: "Penerangan",
    furnishing: "Status Perabot",
    viewOnMap: "Lihat di Peta",
    property: "hartanah",
    properties: "hartanah",
    found: "ditemui",

    favourites: "Kegemaran",
    favouritesDescription: "Hartanah tersimpan anda untuk akses pantas",
    noFavourites: "Tiada Kegemaran Lagi",
    noFavouritesDescription: "Klik ikon hati pada mana-mana hartanah untuk menambahkannya ke kegemaran anda",
    loading: "Memuatkan...",

    // Features
    whyChooseUs: "Mengapa Pilih Kami",
    whyChooseSubtitle: "Kami memudahkan pencarian rumah sewa sempurna anda di Lembah Klang.",
    verifiedListings: "Senarai Disahkan",
    verifiedDesc: "Semua hartanah disahkan dan diperiksa untuk kualiti dan keselamatan.",
    easyBooking: "Tempahan Mudah",
    easyBookingDesc: "Proses tempahan yang mudah dan selamat dengan pengesahan segera.",
    support: "Sokongan 24/7",
    supportDesc: "Pasukan kami sedia membantu anda bila-bila masa, di mana sahaja.",
    flexibleTerms: "Syarat Fleksibel",
    flexibleTermsDesc: "Pilih tempoh sewa yang sesuai dengan gaya hidup anda.",

    // AI Chatbox
    aiAssistant: "Pembantu AI",
    onlineNow: "Dalam talian sekarang",
    aiWelcomeMessage: "Hello! Bagaimana saya boleh membantu anda mencari rumah sewa sempurna di Lembah Klang hari ini?",
    aiResponsePlaceholder:
      "Terima kasih atas mesej anda. Pembantu AI kami sedang diintegrasikan. Buat masa ini, sila hubungi kami terus di +60 12-345 6789.",
    typeMessage: "Taip mesej anda...",

    // Footer
    footerTagline: "Mencari rumah tidak pernah semudah ini.",
    allRights: "Hak cipta terpelihara.",

    // Search Results
    searchResults: "Hasil Carian",
    noPropertiesFound: "Tiada hartanah yang sepadan dengan kriteria anda. Cuba laraskan penapis anda.",

    // Admin - JamAI Setup
    jamaiSetup: "Persediaan JamAI Base",
    jamaiSetupDesc: "Konfigurasikan cadangan hartanah dan sembang berkuasa AI",
    setupTables: "Sediakan Jadual JamAI",
    syncProperties: "Segerakkan Hartanah ke JamAI",
    settingUp: "Menyediakan...",
    syncing: "Menyegerakkan...",
    setupSuccess: "Jadual JamAI berjaya dibuat!",
    syncSuccess: "Hartanah berjaya disegerakkan ke JamAI!",
    setupError: "Ralat menyediakan jadual JamAI",
    syncError: "Ralat menyegerakkan hartanah",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
