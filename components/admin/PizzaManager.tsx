'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function PizzaManager() {
  const { toast } = useToast()
  const [pizzas, setPizzas] = useState([])
  const [pizzerias, setPizzerias] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    pizzeria_id: '',
    ingredients: '',
    is_vegetarian: false,
    is_spicy: false
  })

  useEffect(() => {
    fetchPizzas()
    fetchPizzerias()
  }, [])

  const fetchPizzas = async () => {
    try {
      const { data, error } = await supabase
        .from('pizzas')
        .select(`
          *,
          pizzerias (
            name
          )
        `)
        .order('name')

      if (error) throw error
      setPizzas(data || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des pizzas:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des pizzas.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPizzerias = async () => {
    try {
      const { data, error } = await supabase
        .from('pizzerias')
        .select('id, name')
        .order('name')

      if (error) throw error
      setPizzerias(data || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des pizzerias:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des pizzerias.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('pizzas')
        .insert([{
          ...formData,
          price: parseFloat(formData.price),
          created_at: new Date().toISOString()
        }])

      if (error) throw error

      toast({
        title: "Succès",
        description: "La pizza a été ajoutée avec succès.",
      })

      setIsDialogOpen(false)
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        pizzeria_id: '',
        ingredients: '',
        is_vegetarian: false,
        is_spicy: false
      })
      fetchPizzas()
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pizza:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la pizza.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pizza ?')) return

    try {
      const { error } = await supabase
        .from('pizzas')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Succès",
        description: "La pizza a été supprimée avec succès.",
      })

      fetchPizzas()
    } catch (error) {
      console.error('Erreur lors de la suppression de la pizza:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la pizza.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des Pizzas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-[#ac1f1f] hover:bg-[#8a1a1a]">
              Ajouter une Pizza
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle Pizza</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pizzeria</label>
                <Select
                  value={formData.pizzeria_id}
                  onValueChange={(value) => setFormData({...formData, pizzeria_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une pizzeria" />
                  </SelectTrigger>
                  <SelectContent>
                    {pizzerias.map((pizzeria) => (
                      <SelectItem key={pizzeria.id} value={pizzeria.id}>
                        {pizzeria.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ingrédients</label>
                <Textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                  placeholder="Liste des ingrédients séparés par des virgules"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prix (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL de l'image</label>
                <Input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_vegetarian"
                    checked={formData.is_vegetarian}
                    onChange={(e) => setFormData({...formData, is_vegetarian: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_vegetarian" className="text-sm font-medium">
                    Végétarienne
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_spicy"
                    checked={formData.is_spicy}
                    onChange={(e) => setFormData({...formData, is_spicy: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_spicy" className="text-sm font-medium">
                    Épicée
                  </label>
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#ac1f1f] hover:bg-[#8a1a1a]">
                Ajouter
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Pizzeria</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Végétarienne</TableHead>
            <TableHead>Épicée</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pizzas.map((pizza) => (
            <TableRow key={pizza.id}>
              <TableCell>{pizza.name}</TableCell>
              <TableCell>{pizza.pizzerias?.name}</TableCell>
              <TableCell>{pizza.price}€</TableCell>
              <TableCell>{pizza.is_vegetarian ? 'Oui' : 'Non'}</TableCell>
              <TableCell>{pizza.is_spicy ? 'Oui' : 'Non'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* TODO: Implémenter l'édition */}}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(pizza.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 