"use server"

import { createClient } from "@/utils/supabase/server"
import type { Pizza } from "@/types/pizza"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Récupérer toutes les pizzas
export async function getPizzas(): Promise<Pizza[]> {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const { data, error } = await supabase
    .from("pizzas")
    .select("*")
    .order("name")

  if (error) {
    console.error("Erreur lors de la récupération des pizzas:", error)
    throw new Error("Impossible de récupérer les pizzas")
  }

  return data.map((pizza) => ({
    id: pizza.id,
    name: pizza.name,
    description: pizza.description,
    price: pizza.price,
    image: pizza.image,
    category: pizza.category,
    ingredients: pizza.ingredients,
    sizes: pizza.sizes,
    isPopular: pizza.is_popular,
    isVegetarian: pizza.is_vegetarian,
    pizzeriaId: pizza.pizzeria_id,
  }))
}

// Récupérer une pizza par ID
export async function getPizzaById(id: string): Promise<Pizza | null> {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const { data, error } = await supabase
    .from("pizzas")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erreur lors de la récupération de la pizza:", error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    image: data.image,
    category: data.category,
    ingredients: data.ingredients,
    sizes: data.sizes,
    isPopular: data.is_popular,
    isVegetarian: data.is_vegetarian,
    pizzeriaId: data.pizzeria_id,
  }
}

// Créer une nouvelle pizza
export async function createPizza(pizzaData: Partial<Pizza>): Promise<Pizza | null> {
  // Validation des champs requis
  if (!pizzaData.name || !pizzaData.pizzeriaId) {
    throw new Error("Le nom et l'ID de la pizzeria sont requis")
  }

  const supabase = await createClient()

  const { data: newPizza, error } = await supabase
    .from("pizzas")
    .insert([
      {
        name: pizzaData.name,
        description: pizzaData.description || "",
        price: pizzaData.price || 0,
        image: pizzaData.image || "",
        category: pizzaData.category || "standard",
        ingredients: pizzaData.ingredients || [],
        sizes: pizzaData.sizes || {
          small: 0,
          medium: 0,
          large: 0
        },
        is_popular: pizzaData.isPopular || false,
        is_vegetarian: pizzaData.isVegetarian || false,
        pizzeria_id: pizzaData.pizzeriaId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Erreur lors de la création de la pizza:", error)
    throw new Error(`Impossible de créer la pizza: ${error.message}`)
  }

  revalidatePath("/admin/pizzas")

  return await getPizzaById(newPizza.id)
}

// Mettre à jour une pizza
export async function updatePizza(
  id: string,
  pizzaData: Partial<Pizza>
): Promise<Pizza | null> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("pizzas")
    .update({
      name: pizzaData.name,
      description: pizzaData.description,
      price: pizzaData.price,
      image: pizzaData.image,
      category: pizzaData.category,
      ingredients: pizzaData.ingredients,
      sizes: pizzaData.sizes,
      is_popular: pizzaData.isPopular,
      is_vegetarian: pizzaData.isVegetarian,
      pizzeria_id: pizzaData.pizzeriaId,
    })
    .eq("id", id)

  if (error) {
    console.error("Erreur lors de la mise à jour de la pizza:", error)
    throw new Error("Impossible de mettre à jour la pizza")
  }

  revalidatePath("/admin/pizzas")

  return await getPizzaById(id)
}

// Supprimer une pizza
export async function deletePizza(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("pizzas").delete().eq("id", id)

  if (error) {
    console.error("Erreur lors de la suppression de la pizza:", error)
    throw new Error("Impossible de supprimer la pizza")
  }

  revalidatePath("/admin/pizzas")
} 