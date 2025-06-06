"use server"

import { createClient, createAdminClient } from "@/utils/supabase/server"
import type { Pizzeria, PizzeriaFilter, PizzeriaStatus } from "@/types/pizzeria"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Tableau d'images par défaut pour les pizzerias
const DEFAULT_PIZZERIA_IMAGES = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop",  // Pizza appétissante
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop",     // Intérieur de pizzeria
  "https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=1000&auto=format&fit=crop",  // Four à pizza
  "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=1000&auto=format&fit=crop",  // Pizza margherita
  "https://images.unsplash.com/photo-1579751626657-72bc17010498?q=80&w=1000&auto=format&fit=crop"   // Pizzaiolo au travail
];

// Récupérer toutes les pizzerias avec filtrage
export async function getPizzerias(filter?: PizzeriaFilter): Promise<Pizzeria[]> {
  try {
    console.log("1. Début de la récupération des pizzerias")
    
    const supabase = await createAdminClient()
    console.log("2. Client Supabase créé avec succès")

    // Faire une requête simple pour voir la structure des données
    const { data, error } = await supabase
      .from("pizzerias")
      .select("*")

    if (error) {
      console.error("Erreur détaillée lors de la requête:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Erreur lors de la requête: ${error.message}`)
    }

    // Loguer les données pour inspection
    console.log("Données brutes des pizzerias:", data)

    if (!data) {
      console.log("Aucune donnée retournée")
      return []
    }

    // Transformation simple des données sans les relations pour l'instant
    return data.map((pizzeria: any) => ({
      id: pizzeria.id,
      name: pizzeria.name,
      // Utiliser l'image de la base de données
      image: pizzeria.image || "/placeholder.svg?height=200&width=300",
      rating: pizzeria.rating || 0,
      address: pizzeria.address,
      phone: pizzeria.phone,
      opening_hours: pizzeria.opening_hours || {},
      tags: pizzeria.tags || [],
      status: pizzeria.status || "inactive",
      orders_count: 0, // Temporairement mis à 0
      revenue: 0, // Temporairement mis à 0
      description: pizzeria.description || "",
      created_at: pizzeria.created_at,
      updated_at: pizzeria.updated_at,
    }))
  } catch (error) {
    console.error("Erreur complète dans getPizzerias:", error)
    if (error instanceof Error) {
      throw new Error(`Erreur lors de la récupération des pizzerias: ${error.message}`)
    }
    throw new Error("Une erreur inattendue s'est produite")
  }
}

// Récupérer une pizzeria par ID
export async function getPizzeriaById(id: string): Promise<Pizzeria | null> {
  try {
    const supabase = await createAdminClient()

    // Récupérer la pizzeria avec ses commandes
    const { data, error } = await supabase
      .from("pizzerias")
      .select(`
        *,
        orders (
          id,
          total
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erreur lors de la récupération de la pizzeria:", error)
      throw error
    }

    if (!data) return null

    // Calculer le nombre de commandes et le revenu total
    const orders = data.orders || []
    const ordersCount = orders.length
    const revenue = orders.reduce((total, order) => total + (order.total || 0), 0)

    return {
      id: data.id,
      name: data.name,
      image: data.image_url || "/placeholder.svg?height=200&width=300",
      rating: data.rating || 0,
      address: data.address,
      phone: data.phone,
      opening_hours: data.opening_hours || {},
      tags: data.tags || [],
      status: data.status || "inactive",
      orders_count: ordersCount,
      revenue: revenue,
      description: data.description || "",
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  } catch (error) {
    console.error("Erreur dans getPizzeriaById:", error)
    return null
  }
}

// Créer une nouvelle pizzeria
export async function createPizzeria(pizzeriaData: Partial<Pizzeria>): Promise<Pizzeria | null> {
  try {
    const supabase = await createAdminClient()

    // Préparer les tags si c'est une chaîne de caractères
    let tags = pizzeriaData.tags
    if (typeof pizzeriaData.tags === "string") {
      tags = (pizzeriaData.tags as string).split(",").map((tag) => tag.trim())
    }

    // Préparer les données pour l'insertion
    const newPizzeriaData = {
      name: pizzeriaData.name,
      image: pizzeriaData.image || "/placeholder.svg?height=200&width=300",
      rating: pizzeriaData.rating || 0,
      address: pizzeriaData.address,
      phone: pizzeriaData.phone,
      opening_hours: pizzeriaData.opening_hours,
      tags: tags,
      status: pizzeriaData.status || "active",
      description: pizzeriaData.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Données de la pizzeria à créer:", newPizzeriaData)

    // Insérer la pizzeria
    const { data: newPizzeria, error } = await supabase
      .from("pizzerias")
      .insert([newPizzeriaData])
      .select()
      .single()

    if (error) {
      console.error("Erreur lors de la création de la pizzeria:", error)
      throw new Error(`Impossible de créer la pizzeria: ${error.message}`)
    }

    console.log("Pizzeria créée avec succès:", newPizzeria)

    // Revalider le chemin pour mettre à jour l'interface
    revalidatePath("/admin/pizzerias")

    // Récupérer la pizzeria créée pour s'assurer que tout est correct
    const createdPizzeria = await getPizzeriaById(newPizzeria.id)
    if (!createdPizzeria) {
      throw new Error("La pizzeria a été créée mais n'a pas pu être récupérée")
    }

    return createdPizzeria
  } catch (error) {
    console.error("Erreur complète lors de la création de la pizzeria:", error)
    throw error
  }
}

// Mettre à jour une pizzeria existante
export async function updatePizzeria(id: string, pizzeriaData: Partial<Pizzeria>): Promise<Pizzeria | null> {
  try {
    const supabase = await createAdminClient()

    // Préparer les tags si c'est une chaîne de caractères
    let tags = pizzeriaData.tags
    if (typeof pizzeriaData.tags === "string") {
      tags = (pizzeriaData.tags as string).split(",").map((tag) => tag.trim())
    }

    // Mettre à jour la pizzeria
    const { error } = await supabase
      .from("pizzerias")
      .update({
        name: pizzeriaData.name,
        image: pizzeriaData.image,
        rating: pizzeriaData.rating,
        address: pizzeriaData.address,
        phone: pizzeriaData.phone,
        opening_hours: pizzeriaData.opening_hours,
        tags: tags,
        status: pizzeriaData.status,
        description: pizzeriaData.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Erreur lors de la mise à jour de la pizzeria:", error)
      throw new Error(`Impossible de mettre à jour la pizzeria: ${error.message}`)
    }

    revalidatePath("/admin/pizzerias")

    // Récupérer la pizzeria mise à jour
    return await getPizzeriaById(id)
  } catch (error) {
    console.error("Erreur complète lors de la mise à jour de la pizzeria:", error)
    throw error
  }
}

// Changer le statut d'une pizzeria (activer/désactiver)
export async function updatePizzeriaStatus(id: string, status: PizzeriaStatus): Promise<void> {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const { error } = await supabase
    .from("pizzerias")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Erreur lors de la mise à jour du statut:", error)
    throw new Error("Impossible de mettre à jour le statut de la pizzeria")
  }

  revalidatePath("/pizzerias")
}

// Supprimer une pizzeria
export async function deletePizzeria(id: string): Promise<void> {
  try {
    const supabase = await createAdminClient()

    const { error } = await supabase.from("pizzerias").delete().eq("id", id)

    if (error) {
      console.error("Erreur lors de la suppression de la pizzeria:", error)
      throw new Error(`Impossible de supprimer la pizzeria: ${error.message}`)
    }

    revalidatePath("/admin/pizzerias")
  } catch (error) {
    console.error("Erreur complète lors de la suppression de la pizzeria:", error)
    throw error
  }
}
