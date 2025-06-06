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

export default function PizzeriaManager() {
  const { toast } = useToast()
  const [pizzerias, setPizzerias] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    description: '',
    opening_hours: '',
    image_url: ''
  })

  useEffect(() => {
    fetchPizzerias()
  }, [])

  const fetchPizzerias = async () => {
    try {
      const { data, error } = await supabase
        .from('pizzerias')
        .select('*')
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
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('pizzerias')
        .insert([{
          ...formData,
          created_at: new Date().toISOString()
        }])

      if (error) throw error

      toast({
        title: "Succès",
        description: "La pizzeria a été ajoutée avec succès.",
      })

      setIsDialogOpen(false)
      setFormData({
        name: '',
        address: '',
        city: '',
        postal_code: '',
        phone: '',
        email: '',
        description: '',
        opening_hours: '',
        image_url: ''
      })
      fetchPizzerias()
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pizzeria:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la pizzeria.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pizzeria ?')) return

    try {
      const { error } = await supabase
        .from('pizzerias')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Succès",
        description: "La pizzeria a été supprimée avec succès.",
      })

      fetchPizzerias()
    } catch (error) {
      console.error('Erreur lors de la suppression de la pizzeria:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la pizzeria.",
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
        <h2 className="text-xl font-semibold">Liste des Pizzerias</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-[#ac1f1f] hover:bg-[#8a1a1a]">
              Ajouter une Pizzeria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle Pizzeria</DialogTitle>
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
                <label className="block text-sm font-medium mb-1">Adresse</label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ville</label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Code Postal</label>
                  <Input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
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
                <label className="block text-sm font-medium mb-1">Horaires d'ouverture</label>
                <Input
                  type="text"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
                  placeholder="ex: Lun-Ven: 11h-22h, Sam-Dim: 11h-23h"
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
            <TableHead>Ville</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pizzerias.map((pizzeria) => (
            <TableRow key={pizzeria.id}>
              <TableCell>{pizzeria.name}</TableCell>
              <TableCell>{pizzeria.city}</TableCell>
              <TableCell>{pizzeria.phone}</TableCell>
              <TableCell>{pizzeria.email}</TableCell>
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
                    onClick={() => handleDelete(pizzeria.id)}
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