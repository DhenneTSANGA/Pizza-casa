"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { Pizzeria, PizzeriaStatus } from "@/types/pizzeria"

interface PizzeriaFormProps {
  pizzeria?: Pizzeria
  onSubmit: (pizzeria: Partial<Pizzeria>) => Promise<void>
  onCancel?: () => void
}

export default function PizzeriaForm({ pizzeria, onSubmit, onCancel }: PizzeriaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [formData, setFormData] = useState<Partial<Pizzeria>>(
    pizzeria || {
      name: "",
      image: "/placeholder.svg?height=200&width=300",
      rating: 0,
      address: "",
      phone: "",
      opening_hours: "",
      tags: [],
      status: "active" as PizzeriaStatus,
      orders_count: 0,
      revenue: 0,
      description: "",
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // Créer une URL temporaire pour l'aperçu
      const imageUrl = URL.createObjectURL(file)
      setFormData((prev) => ({ ...prev, image: imageUrl }))
    }
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as PizzeriaStatus }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value
    const tagsArray = tagsString.split(",").map((tag) => tag.trim())
    setFormData((prev) => ({ ...prev, tags: tagsArray }))
  }

  const handleActiveChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked ? "active" : "inactive" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Si une image a été sélectionnée, la convertir en base64
      if (selectedImage) {
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64Image = reader.result as string
          await onSubmit({ ...formData, image: base64Image })
        }
        reader.readAsDataURL(selectedImage)
      } else {
        await onSubmit(formData)
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const tagsString = Array.isArray(formData.tags) ? formData.tags.join(", ") : formData.tags

  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-w-sm mx-auto">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs">Nom</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Nom de la pizzeria"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone" className="text-xs">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="+33 1 23 45 67 89"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="address" className="text-xs">Adresse</Label>
        <Input
          id="address"
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          placeholder="Adresse complète"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="opening_hours" className="text-xs">Horaires</Label>
          <Input
            id="opening_hours"
            name="opening_hours"
            value={formData.opening_hours || ""}
            onChange={handleChange}
            placeholder="11:00 - 23:00"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tags" className="text-xs">Tags</Label>
          <Input
            id="tags"
            name="tags"
            value={tagsString || ""}
            onChange={handleTagsChange}
            placeholder="Italienne, Traditionnelle"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description" className="text-xs">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Description de la pizzeria"
          rows={2}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="image" className="text-xs">Image</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="cursor-pointer"
        />
        {formData.image && formData.image !== "/placeholder.svg?height=200&width=300" && (
          <div className="mt-2">
            <img
              src={formData.image}
              alt="Aperçu"
              className="w-32 h-32 object-cover rounded-md"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="active" checked={formData.status === "active"} onCheckedChange={handleActiveChange} />
        <Label htmlFor="active" className="text-xs">Activer immédiatement</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" className="bg-[#FFB000] hover:bg-[#FF914D]" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : pizzeria?.id ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  )
}
