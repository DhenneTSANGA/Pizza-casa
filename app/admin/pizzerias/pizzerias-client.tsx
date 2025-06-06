"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, Search, MoreHorizontal, Star, MapPin, Phone, Clock, Edit, Trash, Filter } from "lucide-react"
import Image from "next/image"
import type { Pizzeria, PizzeriaStatus } from "@/types/pizzeria"
import { updatePizzeriaStatus, deletePizzeria, createPizzeria, updatePizzeria } from "@/app/api/pizzeria/actions"
import PizzeriaForm from "@/components/pizzeria/pizzeria-form"
import { useToast } from "@/hooks/use-toast"

interface PizzeriasClientProps {
  initialPizzerias: Pizzeria[]
}

export default function PizzeriasClient({ initialPizzerias }: PizzeriasClientProps) {
  const [pizzerias, setPizzerias] = useState<Pizzeria[]>(initialPizzerias)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<PizzeriaStatus | "all">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPizzeria, setSelectedPizzeria] = useState<Pizzeria | null>(null)
  const { toast } = useToast()

  // Filtrer les pizzerias
  const filteredPizzerias = pizzerias.filter((pizzeria) => {
    const matchesSearch = pizzeria.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pizzeria.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || pizzeria.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Gérer la mise à jour du statut
  const handleStatusChange = async (pizzeriaId: string, newStatus: PizzeriaStatus) => {
    try {
      await updatePizzeriaStatus(pizzeriaId, newStatus)
      setPizzerias((prev) =>
        prev.map((p) => (p.id === pizzeriaId ? { ...p, status: newStatus } : p))
      )
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la pizzeria a été mis à jour avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la pizzeria.",
        variant: "destructive",
      })
    }
  }

  // Gérer la suppression
  const handleDelete = async (pizzeriaId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette pizzeria ?")) return

    try {
      await deletePizzeria(pizzeriaId)
      setPizzerias((prev) => prev.filter((p) => p.id !== pizzeriaId))
      toast({
        title: "Pizzeria supprimée",
        description: "La pizzeria a été supprimée avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la pizzeria.",
        variant: "destructive",
      })
    }
  }

  // Gérer l'ajout/mise à jour
  const handlePizzeriaSubmit = useCallback(async (pizzeria: Partial<Pizzeria>) => {
    try {
      if (selectedPizzeria) {
        // Mise à jour
        const updatedPizzeria = await updatePizzeria(selectedPizzeria.id, pizzeria)
        if (updatedPizzeria) {
          setPizzerias((prev) =>
            prev.map((p) => (p.id === updatedPizzeria.id ? updatedPizzeria : p))
          )
          toast({
            title: "Pizzeria mise à jour",
            description: "La pizzeria a été mise à jour avec succès.",
          })
          setIsEditDialogOpen(false)
          setSelectedPizzeria(null)
        }
      } else {
        // Ajout
        const newPizzeria = await createPizzeria(pizzeria)
        if (newPizzeria) {
          setPizzerias((prev) => [...prev, newPizzeria])
          toast({
            title: "Pizzeria ajoutée",
            description: "La pizzeria a été ajoutée avec succès.",
          })
          setIsAddDialogOpen(false)
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
  }, [selectedPizzeria, toast])

  return (
    <div className="space-y-4">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une pizzeria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Statut
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                Tous
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                Actif
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                Inactif
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                En attente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une pizzeria</DialogTitle>
                <DialogDescription>
                  Remplissez les informations de la nouvelle pizzeria.
                </DialogDescription>
              </DialogHeader>
              <PizzeriaForm onSubmit={handlePizzeriaSubmit} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vue en grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPizzerias.map((pizzeria) => (
          <Card key={pizzeria.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={pizzeria.image || "/placeholder.svg"}
                alt={pizzeria.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge
                  variant={
                    pizzeria.status === "active"
                      ? "default"
                      : pizzeria.status === "inactive"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {pizzeria.status === "active"
                    ? "Actif"
                    : pizzeria.status === "inactive"
                    ? "Inactif"
                    : "En attente"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg font-montserrat">{pizzeria.name}</h3>
                <div className="flex items-center gap-1 text-[#FFB000]">
                  <Star className="fill-[#FFB000] h-4 w-4" />
                  <span className="text-sm font-medium">{pizzeria.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4" />
                <span>{pizzeria.address}</span>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                <Phone className="h-4 w-4" />
                <span>{pizzeria.phone}</span>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <Clock className="h-4 w-4" />
                <span>{pizzeria.opening_hours}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {pizzeria.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-[#FF914D]/10 text-[#9B1B1B] hover:bg-[#FF914D]/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">{pizzeria.orders_count}</span> commandes
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPizzeria(pizzeria)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(pizzeria.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la pizzeria</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la pizzeria.
            </DialogDescription>
          </DialogHeader>
          {selectedPizzeria && (
            <PizzeriaForm
              pizzeria={selectedPizzeria}
              onSubmit={handlePizzeriaSubmit}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedPizzeria(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
