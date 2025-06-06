"use server"

import { createClient } from "@/utils/supabase/server"
import type { User, UserFilter, UserStatus } from "@/types/user"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from 'uuid'

// Récupérer tous les utilisateurs avec filtrage
export async function getUsers(filter?: UserFilter): Promise<User[]> {
  try {
    const supabase = await createClient()
    console.log("Début de la récupération des utilisateurs")

    // Récupérer les utilisateurs depuis la table profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")

    if (profilesError) {
      console.error("Erreur lors de la récupération des profils:", JSON.stringify(profilesError, null, 2))
      throw profilesError
    }

    if (!profiles) {
      return []
    }

    console.log("Premier profil récupéré:", JSON.stringify(profiles[0], null, 2))

    // Filtrer les utilisateurs si nécessaire
    let filteredProfiles = profiles
    if (filter) {
      filteredProfiles = profiles.filter(profile => {
        let matches = true

        if (filter.status) {
          matches = matches && profile.status === filter.status
        }

        if (filter.role) {
          matches = matches && profile.role === filter.role
        }

        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          const fullName = (profile.full_name || "").toLowerCase()
          const email = (profile.email || "").toLowerCase()
          matches = matches && (fullName.includes(searchLower) || email.includes(searchLower))
        }

        return matches
      })
    }

    // Récupérer les commandes pour tous les utilisateurs
    const userIds = filteredProfiles.map(profile => profile.id)
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("id, total, customer_id")
      .in("customer_id", userIds)

    if (ordersError) {
      console.error("Erreur lors de la récupération des commandes:", JSON.stringify(ordersError, null, 2))
      throw ordersError
    }

    // Créer un map des commandes par utilisateur
    const ordersByUser = new Map<string, Array<{ id: string; total: number }>>()
    ordersData?.forEach(order => {
      if (!ordersByUser.has(order.customer_id)) {
        ordersByUser.set(order.customer_id, [])
      }
      ordersByUser.get(order.customer_id)?.push({
        id: order.id,
        total: order.total
      })
    })

    // Formater les données pour correspondre à notre type User
    return filteredProfiles.map((profile) => {
      const userOrders = ordersByUser.get(profile.id) || []
      const ordersCount = userOrders.length
      const totalSpent = userOrders.reduce((total, order) => total + (order.total || 0), 0)

      return {
        id: profile.id,
        name: profile.full_name || "Utilisateur sans nom",
        email: profile.email || "Email inconnu",
        avatar_url: profile.avatar_url || null,
        status: profile.status || "active",
        role: profile.role || "user",
        registered_date: new Date(profile.created_at).toLocaleDateString("fr-FR"),
        orders_count: ordersCount,
        total_spent: totalSpent,
        last_login: profile.last_sign_in_at ? formatLastLogin(new Date(profile.last_sign_in_at)) : "Jamais",
        addresses: profile.addresses || [],
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }
    })
  } catch (error) {
    console.error("Erreur dans getUsers:", error)
    throw error
  }
}

// Récupérer un utilisateur par ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const supabase = await createClient()

    // Récupérer l'utilisateur avec ses commandes
    const { data, error } = await supabase
      .from("profiles")
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
      console.error("Erreur lors de la récupération de l'utilisateur:", error)
      throw error
    }

    if (!data) return null

    // Calculer le nombre de commandes et le total dépensé
    const orders = data.orders || []
    const ordersCount = orders.length
    const totalSpent = orders.reduce((total, order) => total + (order.total || 0), 0)

    return {
      id: data.id,
      name: data.full_name || "Utilisateur sans nom",
      email: data.email || "Email inconnu",
      avatar_url: data.avatar_url || null,
      status: data.status || "active",
      role: data.role || "user",
      registered_date: new Date(data.created_at).toLocaleDateString("fr-FR"),
      orders_count: ordersCount,
      total_spent: totalSpent,
      last_login: data.last_sign_in_at ? formatLastLogin(new Date(data.last_sign_in_at)) : "Jamais",
      addresses: data.addresses || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  } catch (error) {
    console.error("Erreur dans getUserById:", error)
    return null
  }
}

// Créer un nouvel utilisateur
export async function createUser(userData: Partial<User>): Promise<User | null> {
  try {
    console.log("Début de la création d'un utilisateur avec les données:", userData)
    const supabase = await createClient()
    console.log("Client Supabase créé")

    // Extraire les adresses pour les insérer séparément
    const { addresses, ...userDataWithoutAddresses } = userData
    console.log("Données utilisateur préparées:", userDataWithoutAddresses)

    // Vérifier les données requises
    if (!userDataWithoutAddresses.name || !userDataWithoutAddresses.email) {
      throw new Error("Le nom et l'email sont requis")
    }

    // Générer un ID unique
    const userId = uuidv4()

    // Insérer l'utilisateur
    console.log("Tentative d'insertion de l'utilisateur...")
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          name: userDataWithoutAddresses.name,
          email: userDataWithoutAddresses.email,
          avatar_url: userDataWithoutAddresses.avatar_url || null,
          status: userDataWithoutAddresses.status || "active",
          role: userDataWithoutAddresses.role || "user",
          last_login: userDataWithoutAddresses.last_login || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Erreur détaillée lors de la création de l'utilisateur:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`)
    }

    console.log("Utilisateur créé avec succès:", newUser)

    // Si des adresses ont été fournies, les insérer
    if (addresses && addresses.length > 0 && newUser) {
      console.log("Tentative d'insertion des adresses...")
      const addressesWithUserId = addresses.map((address) => ({
        id: uuidv4(),
        ...address,
        user_id: newUser.id,
      }))

      const { error: addressError } = await supabase.from("addresses").insert(addressesWithUserId)

      if (addressError) {
        console.error("Erreur lors de l'ajout des adresses:", addressError)
      } else {
        console.log("Adresses ajoutées avec succès")
      }
    }

    revalidatePath("/utilisateurs")

    // Récupérer l'utilisateur complet avec ses adresses
    console.log("Récupération de l'utilisateur complet...")
    return await getUserById(newUser.id)
  } catch (error) {
    console.error("Erreur complète lors de la création de l'utilisateur:", error)
    if (error instanceof Error) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`)
    }
    throw new Error("Une erreur inattendue s'est produite lors de la création de l'utilisateur")
  }
}

// Mettre à jour un utilisateur existant
export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  try {
    console.log("Début de la mise à jour de l'utilisateur:", { id, userData })
    const supabase = await createClient()
    console.log("Client Supabase créé")

    // Extraire les adresses pour les traiter séparément
    const { addresses, ...userDataWithoutAddresses } = userData
    console.log("Données utilisateur préparées:", userDataWithoutAddresses)

    // Préparer les données de mise à jour
    const updateData = {
      name: userDataWithoutAddresses.name,
      email: userDataWithoutAddresses.email,
      avatar_url: userDataWithoutAddresses.avatar_url,
      status: userDataWithoutAddresses.status,
      role: userDataWithoutAddresses.role,
      // Ne pas mettre à jour last_login s'il est "Jamais"
      ...(userDataWithoutAddresses.last_login !== "Jamais" && {
        last_login: userDataWithoutAddresses.last_login
      }),
      updated_at: new Date().toISOString(),
    }

    console.log("Données de mise à jour préparées:", updateData)

    // Mettre à jour l'utilisateur
    console.log("Tentative de mise à jour de l'utilisateur...")
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erreur détaillée lors de la mise à jour de l'utilisateur:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`)
    }

    console.log("Utilisateur mis à jour avec succès:", updatedUser)

    // Si des adresses ont été fournies, les mettre à jour
    if (addresses && addresses.length > 0) {
      console.log("Tentative de mise à jour des adresses...")
      // Supprimer les anciennes adresses
      const { error: deleteError } = await supabase.from("addresses").delete().eq("user_id", id)
      
      if (deleteError) {
        console.error("Erreur lors de la suppression des anciennes adresses:", deleteError)
      }

      // Ajouter les nouvelles adresses
      const addressesWithUserId = addresses.map((address) => ({
        id: address.id || uuidv4(),
        ...address,
        user_id: id,
      }))

      const { error: addressError } = await supabase.from("addresses").insert(addressesWithUserId)

      if (addressError) {
        console.error("Erreur lors de l'ajout des nouvelles adresses:", addressError)
      } else {
        console.log("Adresses mises à jour avec succès")
      }
    }

    revalidatePath("/utilisateurs")

    // Récupérer l'utilisateur mis à jour
    console.log("Récupération de l'utilisateur mis à jour...")
    return await getUserById(id)
  } catch (error) {
    console.error("Erreur complète lors de la mise à jour de l'utilisateur:", error)
    if (error instanceof Error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`)
    }
    throw new Error("Une erreur inattendue s'est produite lors de la mise à jour de l'utilisateur")
  }
}

// Changer le statut d'un utilisateur (bloquer/débloquer)
export async function updateUserStatus(id: string, status: UserStatus): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("users")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Erreur lors de la mise à jour du statut:", error)
    throw new Error("Impossible de mettre à jour le statut de l'utilisateur")
  }

  revalidatePath("/utilisateurs")
}

// Supprimer un utilisateur
export async function deleteUser(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("users").delete().eq("id", id)

  if (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    throw new Error("Impossible de supprimer l'utilisateur")
  }

  revalidatePath("/utilisateurs")
}

// Fonction utilitaire pour formater la date de dernière connexion
function formatLastLogin(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return "Aujourd'hui"
  } else if (days === 1) {
    return "Hier"
  } else if (days < 7) {
    return `Il y a ${days} jours`
  } else {
    return date.toLocaleDateString("fr-FR")
  }
}
