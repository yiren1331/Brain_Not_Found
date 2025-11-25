"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Home, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import type { Property } from "@/lib/db"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"

const LOCATIONS = [
  "KLCC",
  "Bukit Bintang",
  "Mont Kiara",
  "Bangsar",
  "Damansara",
  "Petaling Jaya",
  "Shah Alam",
  "Subang Jaya",
  "Puchong",
  "Cyberjaya",
  "Putrajaya",
  "Klang",
  "Kajang",
  "Cheras",
  "Ampang",
  "Setapak",
  "Kepong",
  "Wangsa Maju",
  "Sentul",
  "Titiwangsa",
]

const emptyProperty = {
  title: "",
  title_ms: "",
  location: "",
  address: "",
  price: 0,
  bedrooms: 1,
  bathrooms: 1,
  size_sqft: 0,
  furnished: "unfurnished" as const,
  contact_number: "",
  description: "",
  description_ms: "",
  image_url: "",
  is_available: true,
}

export default function AdminPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null)
  const [formData, setFormData] = useState(emptyProperty)
  const [saving, setSaving] = useState(false)
  const [syncingJamAI, setSyncingJamAI] = useState(false)
  const [jamaiTables, setJamaiTables] = useState<string[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])

  useEffect(() => {
    fetchProperties()
    loadJamaiTables()
  }, [])

  const fetchProperties = async () => {
    try {
      console.log("[v0] Admin: Starting to fetch properties")
      const response = await fetch("/api/properties?all=true")
      console.log("[v0] Admin: Response status:", response.status)

      const data = await response.json()
      console.log("[v0] Admin: Received data type:", typeof data)
      console.log("[v0] Admin: Is array?", Array.isArray(data))
      console.log("[v0] Admin: Data length:", Array.isArray(data) ? data.length : "not an array")
      console.log("[v0] Admin: First item:", data[0])

      setProperties(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[v0] Admin: Error fetching properties:", error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const loadJamaiTables = () => {
    const tables = ["chat assistant", "hackathon", "hackathon malay"]
    setJamaiTables(tables)
    setSelectedTables(tables)
  }

  const handleCreate = () => {
    setEditingProperty(null)
    setFormData(emptyProperty)
    setIsDialogOpen(true)
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setFormData({
      title: property.title,
      title_ms: property.title_ms || "",
      location: property.location,
      address: property.address || "",
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      size_sqft: property.size_sqft || 0,
      furnished: property.furnished,
      contact_number: property.contact_number || "",
      description: property.description || "",
      description_ms: property.description_ms || "",
      image_url: property.image_url || "",
      is_available: property.is_available,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (property: Property) => {
    setDeletingProperty(property)
    setIsDeleteDialogOpen(true)
  }

  const handleSyncToJamAI = async () => {
    if (selectedTables.length === 0) {
      toast({
        title: t("syncError"),
        description: "Please select at least one table to sync",
        variant: "destructive",
      })
      return
    }

    setSyncingJamAI(true)
    try {
      const response = await fetch("/api/jamai/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tables: selectedTables,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] JamAI sync failed:", errorText)
        toast({
          title: t("syncError"),
          description: errorText,
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      console.log("[v0] JamAI sync result:", data)

      const totalSuccess = Object.values(data.tables as Record<string, any>).reduce(
        (sum: number, table: any) => sum + table.succeeded,
        0,
      )

      toast({
        title: t("syncSuccess"),
        description: `${totalSuccess} properties synced to ${selectedTables.length} table(s)`,
      })
    } catch (error: any) {
      console.error("[v0] JamAI sync error:", error)
      toast({
        title: t("syncError"),
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSyncingJamAI(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingProperty ? `/api/properties/${editingProperty.id}` : "/api/properties"
      const method = editingProperty ? "PUT" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      await fetchProperties()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving property:", error)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingProperty) return

    try {
      await fetch(`/api/properties/${deletingProperty.id}`, {
        method: "DELETE",
      })
      await fetchProperties()
    } catch (error) {
      console.error("Error deleting property:", error)
    } finally {
      setIsDeleteDialogOpen(false)
      setDeletingProperty(null)
    }
  }

  const toggleTableSelection = (tableId: string) => {
    setSelectedTables((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))
  }

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Site
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Property Admin</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("jamaiSetup")}</CardTitle>
            <CardDescription>{t("jamaiSetupDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {jamaiTables.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-sm font-medium">Select tables to sync:</p>
                {jamaiTables.map((tableId) => (
                  <div key={tableId} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`table-${tableId}`}
                      checked={selectedTables.includes(tableId)}
                      onChange={() => toggleTableSelection(tableId)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`table-${tableId}`} className="text-sm">
                      {tableId}
                    </label>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleSyncToJamAI}
              disabled={syncingJamAI || properties.length === 0 || selectedTables.length === 0}
              className="gap-2"
            >
              {syncingJamAI ? t("syncing") : t("syncProperties")}
            </Button>
            {properties.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">No properties to sync. Add some properties first.</p>
            )}
            {selectedTables.length === 0 && properties.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">Please select at least one table.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl">Manage Properties</CardTitle>
                <CardDescription>Create, edit, and remove rental property listings</CardDescription>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Property
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price (RM)</TableHead>
                      <TableHead>Rooms</TableHead>
                      <TableHead>Furnished</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No properties found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProperties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{property.title}</TableCell>
                          <TableCell>{property.location}</TableCell>
                          <TableCell>{Number(property.price).toLocaleString()}</TableCell>
                          <TableCell>
                            {property.bedrooms} bed / {property.bathrooms} bath
                          </TableCell>
                          <TableCell className="capitalize">{property.furnished}</TableCell>
                          <TableCell>
                            <Badge variant={property.is_available ? "default" : "secondary"}>
                              {property.is_available ? "Available" : "Unavailable"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(property)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive hover:text-destructive bg-transparent"
                                onClick={() => handleDelete(property)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProperty ? "Edit Property" : "Add New Property"}</DialogTitle>
            <DialogDescription>
              {editingProperty
                ? "Update the property information below"
                : "Fill in the details to create a new property listing"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Title EN */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title (English) *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Title MS */}
              <div className="grid gap-2">
                <Label htmlFor="title_ms">Title (Bahasa Melayu)</Label>
                <Input
                  id="title_ms"
                  value={formData.title_ms}
                  onChange={(e) => setFormData({ ...formData, title_ms: e.target.value })}
                />
              </div>

              {/* Location & Address */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Price & Size */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (RM/month) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="size_sqft">Size (sq ft)</Label>
                  <Input
                    id="size_sqft"
                    type="number"
                    min="0"
                    value={formData.size_sqft}
                    onChange={(e) => setFormData({ ...formData, size_sqft: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Furnished & Contact */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="furnished">Furnished Status</Label>
                  <Select
                    value={formData.furnished}
                    onValueChange={(value: "fully" | "partial" | "unfurnished") =>
                      setFormData({ ...formData, furnished: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fully">Fully Furnished</SelectItem>
                      <SelectItem value="partial">Partially Furnished</SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    placeholder="+60 12-345 6789"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="grid gap-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/image.jpg or https://..."
                />
              </div>

              {/* Description EN */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description (English)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Description MS */}
              <div className="grid gap-2">
                <Label htmlFor="description_ms">Description (Bahasa Melayu)</Label>
                <Textarea
                  id="description_ms"
                  value={formData.description_ms}
                  onChange={(e) => setFormData({ ...formData, description_ms: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_available" className="text-sm font-normal">
                  Property is available for rent
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingProperty ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingProperty?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
