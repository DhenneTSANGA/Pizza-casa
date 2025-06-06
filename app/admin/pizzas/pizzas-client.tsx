"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Star, Edit, Trash, Filter } from "lucide-react"
import Image from "next/image"
import type { Pizza } from "@/types/pizza"
import { updatePizzaStatus, deletePizza, createPizza, updatePizza } from "@/app/api/pizza/actions"
import PizzaForm from "@/components/pizza/pizza-form"
import { useToast } from "@/hooks/use-toast"

interface PizzasClientProps {
  initialPizzas: Pizza[]
}

export default function PizzasClient({ initialPizzas }: PizzasClientProps) {
  const { toast } = useToast()
  const [pizzas, setPizzas] = useState<Pizza[]>(initialPizzas)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPizza, setSelectedPizza] = useState<Pizza | undefined>()

  const filteredPizzas = pizzas.filter((pizza) =>
    pizza.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pizza.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (pizza: Pizza) => {
    setSelectedPizza(pizza)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette pizza ?")) return

    try {
      await deletePizza(id)
      setPizzas((prev) => prev.filter((p) => p.id !== id))
      toast({
        title: "Pizza supprimée",
        description: "La pizza a été supprimée avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la pizza.",
        variant: "destructive",
      })
    }
  }

  const handlePizzaSubmit = async (pizza: Partial<Pizza>) => {
    try {
      if (selectedPizza) {
        // Mise à jour
        const updatedPizza = await updatePizza(selectedPizza.id, pizza)
        if (updatedPizza) {
          setPizzas((prev) =>
            prev.map((p) => (p.id === updatedPizza.id ? updatedPizza : p))
          )
          toast({
            title: "Pizza mise à jour",
            description: "La pizza a été mise à jour avec succès.",
          })
          setIsDialogOpen(false)
          setSelectedPizza(undefined)
        }
      } else {
        // Ajout
        const newPizza = await createPizza(pizza)
        if (newPizza) {
          setPizzas((prev) => [...prev, newPizza])
          toast({
            title: "Pizza ajoutée",
            description: "La pizza a été ajoutée avec succès.",
          })
          setIsDialogOpen(false)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une pizza..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPizza ? "Modifier la pizza" : "Ajouter une pizza"}
              </DialogTitle>
              <DialogDescription>
                {selectedPizza
                  ? "Modifiez les informations de la pizza."
                  : "Remplissez les informations de la nouvelle pizza."}
              </DialogDescription>
            </DialogHeader>
            <PizzaForm
              pizza={selectedPizza}
              onSubmit={handlePizzaSubmit}
              onCancel={() => {
                setIsDialogOpen(false)
                setSelectedPizza(undefined)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPizzas.map((pizza) => (
          <Card key={pizza.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={pizza.image || "/placeholder.svg"}
                alt={pizza.name}
                fill
                className="object-cover"
              />
              {pizza.isPopular && (
                <Badge className="absolute top-2 right-2 bg-[#FFB000]">
                  Populaire
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg font-montserrat">{pizza.name}</h3>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{pizza.price} €</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {pizza.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {pizza.ingredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="bg-[#FF914D]/10 text-[#9B1B1B] hover:bg-[#FF914D]/20"
                  >
                    {ingredient}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">{pizza.category}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(pizza)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(pizza.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 