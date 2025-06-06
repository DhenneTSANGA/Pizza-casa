"use server"

import { createClient, createAdminClient } from "@/utils/supabase/server"
import type { Order, OrderItem, OrderStatus, OrderFilter } from "@/types/order"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Récupérer toutes les commandes avec filtrage
export async function getOrders(filters?: {
  status?: OrderStatus
  startDate?: string
  endDate?: string
  pizzeriaId?: string
}): Promise<Order[]> {
  try {
    console.log("1. Début de la récupération des commandes")
    const supabase = await createAdminClient()
    console.log("2. Client Supabase créé avec succès")

    // Commençons par une requête simple pour vérifier la structure
    console.log("3. Tentative de requête simple sur la table orders")
    const { data: simpleData, error: simpleError } = await supabase
      .from("orders")
      .select()

    if (simpleError) {
      console.error("4. Erreur lors de la requête simple:", {
        message: simpleError.message,
        details: simpleError.details,
        hint: simpleError.hint,
        code: simpleError.code
      })
      throw simpleError
    }

    console.log("4. Données brutes de la requête simple:", simpleData)

    // Si nous n'avons pas d'erreur mais pas de données, la table est peut-être vide
    if (!simpleData || simpleData.length === 0) {
      console.log("5. La table orders est vide")
      return []
    }

    // Construction de la requête complète avec les relations
    console.log("6. Construction de la requête avec relations")
    let query = supabase
      .from("orders")
      .select(`
        *,
        pizzeria:pizzerias (
          id,
          name
        ),
        order_items (
          id,
          name,
          quantity,
          price
        )
      `)

    // Application des filtres
    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    if (filters?.startDate) {
      query = query.gte("order_date", filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte("order_date", filters.endDate)
    }

    if (filters?.pizzeriaId) {
      query = query.eq("pizzeria_id", filters.pizzeriaId)
    }

    console.log("7. Exécution de la requête complète")
    const { data: ordersData, error: ordersError } = await query

    if (ordersError) {
      console.error("8. Erreur lors de la requête complète:", {
        message: ordersError.message,
        details: ordersError.details,
        hint: ordersError.hint,
        code: ordersError.code
      })
      throw ordersError
    }

    if (!ordersData) {
      console.log("9. Aucune donnée retournée par la requête complète")
      return []
    }

    console.log("9. Données complètes récupérées:", ordersData)

    // Récupérer les informations des clients
    const customerIds = ordersData.map(order => order.customer_id).filter(Boolean)
    console.log("10. IDs des clients à récupérer:", customerIds)

    if (customerIds.length === 0) {
      console.log("11. Aucun ID client à récupérer")
      return ordersData.map(orderData => formatOrder(orderData))
    }

    const { data: customersData, error: customersError } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .in("id", customerIds)

    if (customersError) {
      console.error("12. Erreur lors de la récupération des clients:", {
        message: customersError.message,
        details: customersError.details,
        hint: customersError.hint,
        code: customersError.code
      })
      // On continue même si on n'a pas les données clients
      console.log("13. Continuation sans données clients")
      return ordersData.map(orderData => formatOrder(orderData))
    }

    console.log("12. Données des clients récupérées:", customersData)

    // Créer un map des clients pour un accès rapide
    const customersMap = new Map(
      customersData?.map(customer => [customer.id, customer]) || []
    )

    // Formater les commandes avec toutes les informations
    console.log("13. Formatage des commandes")
    const formattedOrders = ordersData.map(orderData => {
      const customer = customersMap.get(orderData.customer_id)
      return formatOrder(orderData, customer)
    })

    console.log("14. Commandes formatées avec succès")
    return formattedOrders
  } catch (error) {
    console.error("Erreur complète dans getOrders:", error)
    throw error
  }
}

// Fonction utilitaire pour formater une commande
function formatOrder(orderData: any, customer?: any): Order {
  const orderDate = orderData.order_date && orderData.order_time
    ? new Date(`${orderData.order_date}T${orderData.order_time}`)
    : new Date(orderData.created_at)

  return {
    id: orderData.id,
    customer_id: orderData.customer_id,
    customer_name: customer?.full_name || "Utilisateur inconnu",
    customer_email: customer?.email || "Email inconnu",
    customer_avatar: customer?.avatar_url || null,
    pizzeria_id: orderData.pizzeria_id,
    pizzeria_name: orderData.pizzeria?.name || "Pizzeria inconnue",
    total: orderData.total,
    status: orderData.status,
    date: format(orderDate, "dd/MM/yyyy", { locale: fr }),
    time: format(orderDate, "HH:mm", { locale: fr }),
    delivery_fee: orderData.delivery_fee,
    payment_method: orderData.payment_method,
    items: orderData.order_items || [],
    created_at: orderData.created_at,
    updated_at: orderData.updated_at
  }
}

// Récupérer une commande par ID
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const supabase = await createAdminClient()

    // Récupérer la commande avec ses relations
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        pizzerias (
          id,
          name
        ),
        order_items (
          id,
          name,
          quantity,
          price
        )
      `)
      .eq("id", id)
      .single()

    if (orderError) {
      console.error("Erreur lors de la récupération de la commande:", orderError)
      throw orderError
    }

    // Récupérer les informations du client
    const { data: customerData, error: customerError } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .eq("id", orderData.customer_id)
      .single()

    if (customerError) {
      console.error("Erreur lors de la récupération du client:", customerError)
      throw customerError
    }

    // Formater la date et l'heure
    const orderDate = new Date(orderData.created_at)

    // Retourner la commande formatée
    return {
      id: orderData.id,
      customer_id: orderData.customer_id,
      customer_name: customerData?.full_name || "Utilisateur inconnu",
      customer_email: customerData?.email || "Email inconnu",
      customer_avatar: customerData?.avatar_url || null,
      pizzeria_id: orderData.pizzeria_id,
      pizzeria_name: orderData.pizzerias?.name || "Pizzeria inconnue",
      total: orderData.total,
      status: orderData.status,
      date: format(orderDate, "dd/MM/yyyy", { locale: fr }),
      time: format(orderDate, "HH:mm", { locale: fr }),
      items: orderData.order_items || [],
      delivery_fee: orderData.delivery_fee,
      payment_method: orderData.payment_method,
      created_at: orderData.created_at,
      updated_at: orderData.updated_at
    }
  } catch (error) {
    console.error("Erreur dans getOrderById:", error)
    return null
  }
}

// Les autres fonctions restent inchangées
// ... [createOrder, updateOrderStatus, deleteOrder, getOrderStats] ...

// Créer une nouvelle commande
export async function createOrder(orderData: {
  customer_id: string
  pizzeria_id: string
  items: { name: string; quantity: number; price: number }[]
  delivery_fee?: number
  payment_method?: string
}): Promise<Order | null> {
  const supabase = await createClient()

  // Calculer le total de la commande
  const itemsTotal = orderData.items.reduce((total, item) => total + item.price * item.quantity, 0)
  const deliveryFee = orderData.delivery_fee || 2.99
  const total = itemsTotal + deliveryFee

  // Insérer la commande
  const { data: newOrder, error } = await supabase
    .from("orders")
    .insert([
      {
        customer_id: orderData.customer_id,
        pizzeria_id: orderData.pizzeria_id,
        total,
        delivery_fee: deliveryFee,
        payment_method: orderData.payment_method || "card",
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Erreur lors de la création de la commande:", error)
    throw new Error("Impossible de créer la commande")
  }

  // Insérer les articles de la commande
  const orderItems = orderData.items.map((item) => ({
    order_id: newOrder.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

  if (itemsError) {
    console.error("Erreur lors de l'ajout des articles de commande:", itemsError)
    // Supprimer la commande si l'ajout des articles échoue
    await supabase.from("orders").delete().eq("id", newOrder.id)
    throw new Error("Impossible d'ajouter les articles à la commande")
  }

  revalidatePath("/commandes")

  // Récupérer la commande complète
  return await getOrderById(newOrder.id)
}

// Mettre à jour le statut d'une commande
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Erreur lors de la mise à jour du statut de la commande:", error)
    throw new Error("Impossible de mettre à jour le statut de la commande")
  }

  revalidatePath("/commandes")

  // Récupérer la commande mise à jour
  return await getOrderById(id)
}

// Supprimer une commande
export async function deleteOrder(id: string): Promise<void> {
  const supabase = await createClient()

  // Supprimer d'abord les articles de la commande (contrainte de clé étrangère)
  const { error: itemsError } = await supabase.from("order_items").delete().eq("order_id", id)

  if (itemsError) {
    console.error("Erreur lors de la suppression des articles de commande:", itemsError)
  }

  // Supprimer la commande
  const { error } = await supabase.from("orders").delete().eq("id", id)

  if (error) {
    console.error("Erreur lors de la suppression de la commande:", error)
    throw new Error("Impossible de supprimer la commande")
  }

  revalidatePath("/commandes")
}

// Obtenir des statistiques sur les commandes
export async function getOrderStats() {
  const supabase = await createClient()

  // Nombre total de commandes
  const { count: totalOrders, error: countError } = await supabase.from("orders").select("*", { count: "exact" })

  if (countError) {
    console.error("Erreur lors du comptage des commandes:", countError)
    throw new Error("Impossible de compter les commandes")
  }

  // Chiffre d'affaires total
  const { data: revenueData, error: revenueError } = await supabase.from("orders").select("total")

  if (revenueError) {
    console.error("Erreur lors du calcul du chiffre d'affaires:", revenueError)
    throw new Error("Impossible de calculer le chiffre d'affaires")
  }

  const totalRevenue = revenueData.reduce((sum, order) => sum + order.total, 0)

  // Nombre de commandes par statut
  const { data: statusData, error: statusError } = await supabase.from("orders").select("status")

  if (statusError) {
    console.error("Erreur lors du comptage des statuts:", statusError)
    throw new Error("Impossible de compter les statuts")
  }

  const statusCounts = {
    confirmed: 0,
    preparing: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
  }

  statusData.forEach((order) => {
    statusCounts[order.status as OrderStatus]++
  })

  return {
    totalOrders,
    totalRevenue,
    statusCounts,
  }
}