"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Pizza } from "@/types/pizza"
import { createPizza, updatePizza } from "@/app/api/pizza/actions"
import { useToast } from "@/hooks/use-toast"

interface PizzaFormProps {
  pizza?: Pizza
  onSubmit: (pizza: Partial<Pizza>) => Promise<void>
  onCancel?: () => void
}

export default function PizzaForm({ pizza, onSubmit, onCancel }: PizzaFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: pizza?.name || "",
    description: pizza?.description || "",
    price: pizza?.price?.toString() || "",
    image: pizza?.image || "",
    category: pizza?.category || "",
    ingredients: pizza?.ingredients?.join(", ") || "",
    sizes: {
      small: pizza?.sizes?.small?.toString() || "",
      medium: pizza?.sizes?.medium?.toString() || "",
      large: pizza?.sizes?.large?.toString() || "",
    },
    isPopular: pizza?.isPopular || false,
    isVegetarian: pizza?.isVegetarian || false,
    pizzeriaId: pizza?.pizzeriaId || "",
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // Créer une URL temporaire pour l'aperçu
      const imageUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, image: imageUrl }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Si une image a été sélectionnée, la convertir en base64
      if (selectedImage) {
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64Image = reader.result as string
          const pizzaData = {
            ...formData,
            price: parseFloat(formData.price),
            ingredients: formData.ingredients.split(",").map((i) => i.trim()),
            sizes: {
              small: formData.sizes.small ? parseFloat(formData.sizes.small) : undefined,
              medium: formData.sizes.medium ? parseFloat(formData.sizes.medium) : undefined,
              large: formData.sizes.large ? parseFloat(formData.sizes.large) : undefined,
            },
            image: base64Image
          }
          await onSubmit(pizzaData)
        }
        reader.readAsDataURL(selectedImage)
      } else {
        const pizzaData = {
          ...formData,
          price: parseFloat(formData.price),
          ingredients: formData.ingredients.split(",").map((i) => i.trim()),
          sizes: {
            small: formData.sizes.small ? parseFloat(formData.sizes.small) : undefined,
            medium: formData.sizes.medium ? parseFloat(formData.sizes.medium) : undefined,
            large: formData.sizes.large ? parseFloat(formData.sizes.large) : undefined,
          }
        }
        await onSubmit(pizzaData)
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-w-sm mx-auto">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs">Nom</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="category" className="text-xs">Catégorie</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Classiques">Classiques</SelectItem>
              <SelectItem value="Spécialités">Spécialités</SelectItem>
              <SelectItem value="Végétariennes">Végétariennes</SelectItem>
              <SelectItem value="Carnivores">Carnivores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description" className="text-xs">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={1}
          className="h-12"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="ingredients" className="text-xs">Ingrédients</Label>
          <Input
            id="ingredients"
            value={formData.ingredients}
            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            placeholder="Séparés par des virgules"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pizzeriaId" className="text-xs">ID Pizzeria</Label>
          <Input
            id="pizzeriaId"
            value={formData.pizzeriaId}
            onChange={(e) => setFormData({ ...formData, pizzeriaId: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="price" className="text-xs">Prix base (€)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="image" className="text-xs">Image</Label>
          <Input
            id="image"
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
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Tailles (€)</Label>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1">
              <Checkbox
                id="isPopular"
                checked={formData.isPopular}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPopular: checked as boolean })
                }
              />
              <Label htmlFor="isPopular" className="text-xs">Populaire</Label>
            </div>
            <div className="flex items-center space-x-1">
              <Checkbox
                id="isVegetarian"
                checked={formData.isVegetarian}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isVegetarian: checked as boolean })
                }
              />
              <Label htmlFor="isVegetarian" className="text-xs">Végétarienne</Label>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="small" className="text-xs">Petite</Label>
            <Input
              id="small"
              type="number"
              value={formData.sizes.small}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sizes: { ...formData.sizes, small: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="medium" className="text-xs">Moyenne</Label>
            <Input
              id="medium"
              type="number"
              value={formData.sizes.medium}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sizes: { ...formData.sizes, medium: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="large" className="text-xs">Grande</Label>
            <Input
              id="large"
              type="number"
              value={formData.sizes.large}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sizes: { ...formData.sizes, large: e.target.value },
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : pizza ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  )
} 