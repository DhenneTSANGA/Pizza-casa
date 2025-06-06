"use server"

import { createClient, createAdminClient } from "@/utils/supabase/server"
import type { DashboardStats } from "@/types/dashboard"
import type { OrderStatus } from "@/types/order"
import type { TicketStatus } from "@/types/support"
import { cookies } from "next/headers"

// Récupérer les statistiques pour le tableau de bord
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    console.log("1. Début de la récupération des statistiques")
    const supabase = await createAdminClient()
    console.log("2. Client Supabase Admin créé")

    // Nombre total d'utilisateurs
    console.log("3. Récupération du nombre d'utilisateurs")
    const { count: totalUsers, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    if (usersError) {
      console.error("Erreur lors du comptage des utilisateurs:", usersError)
      throw usersError
    }

    // Nombre total de pizzerias
    console.log("4. Récupération du nombre de pizzerias")
    const { count: totalPizzerias, error: pizzeriasError } = await supabase
      .from("pizzerias")
      .select("*", { count: "exact", head: true })

    if (pizzeriasError) {
      console.error("Erreur lors du comptage des pizzerias:", pizzeriasError)
      throw pizzeriasError
    }

    // Nombre total de commandes et chiffre d'affaires
    console.log("5. Récupération des commandes")
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("id, total, status")

    if (ordersError) {
      console.error("Erreur lors de la récupération des commandes:", ordersError)
      throw ordersError
    }

    const totalOrders = ordersData.length
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0)

    // Compter les commandes par statut
    const ordersByStatus = {
      confirmed: 0,
      preparing: 0,
      delivering: 0,
      delivered: 0,
      cancelled: 0,
    }

    ordersData.forEach((order) => {
      if (order.status in ordersByStatus) {
        ordersByStatus[order.status as OrderStatus]++
      }
    })

    // Nombre de tickets par statut
    console.log("6. Récupération des tickets")
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("support_tickets")
      .select("status")

    if (ticketsError) {
      console.error("Erreur lors de la récupération des tickets:", ticketsError)
      throw ticketsError
    }

    const ticketsByStatus = {
      open: 0,
      pending: 0,
      closed: 0,
    }

    ticketsData.forEach((ticket) => {
      if (ticket.status in ticketsByStatus) {
        ticketsByStatus[ticket.status as TicketStatus]++
      }
    })

    // Commandes récentes avec informations détaillées
    console.log("7. Récupération des commandes récentes")
    const { data: recentOrdersData, error: recentOrdersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentOrdersError) {
      console.error("Erreur lors de la récupération des commandes récentes:", recentOrdersError)
      throw recentOrdersError
    }

    // Récupérer les pizzerias associées
    console.log("8. Récupération des pizzerias")
    const pizzeriaIds = recentOrdersData.map(order => order.pizzeria_id).filter(Boolean)
    const { data: pizzeriasData, error: pizzeriasDetailsError } = await supabase
      .from("pizzerias")
      .select("id, name")
      .in("id", pizzeriaIds)

    if (pizzeriasDetailsError) {
      console.error("Erreur lors de la récupération des pizzerias:", pizzeriasDetailsError)
      throw pizzeriasDetailsError
    }

    // Map pour accès rapide aux données des pizzerias
    const pizzeriasMap = new Map(
      pizzeriasData?.map(pizzeria => [pizzeria.id, pizzeria]) || []
    )

    // Récupérer les informations des clients pour les commandes récentes
    console.log("9. Récupération des informations clients")
    const customerIds = recentOrdersData.map(order => order.customer_id).filter(Boolean)
    console.log("Customer IDs à récupérer:", customerIds)
    const { data: customersData, error: customersError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", customerIds)

    if (customersError) {
      console.error("Erreur détaillée lors de la récupération des clients:", JSON.stringify(customersError, null, 2))
      throw customersError
    }

    console.log("Structure des données clients:", JSON.stringify(customersData?.[0], null, 2))

    // Map pour accès rapide aux données clients
    const customersMap = new Map(
      customersData?.map(customer => [customer.id, {
        id: customer.id,
        email: customer.email,
        full_name: customer.full_name
      }]) || []
    )

    // Formater les commandes récentes
    const formattedRecentOrders = recentOrdersData.map(order => ({
      id: order.id,
      total: order.total,
      status: order.status,
      created_at: order.created_at,
      customer_name: customersMap.get(order.customer_id)?.full_name || "Utilisateur inconnu",
      customer_email: customersMap.get(order.customer_id)?.email || "Email inconnu",
      pizzeria_name: pizzeriasMap.get(order.pizzeria_id)?.name || "Pizzeria inconnue"
    }))

    // Tickets récents avec informations détaillées
    console.log("10. Récupération des tickets récents")
    const { data: recentTicketsData, error: recentTicketsError } = await supabase
      .from("support_tickets")
      .select(`
        id,
        subject,
        status,
        created_at,
        customer_id
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentTicketsError) {
      console.error("Erreur lors de la récupération des tickets récents:", recentTicketsError)
      throw recentTicketsError
    }

    // Récupérer les informations des clients pour les tickets
    console.log("11. Récupération des informations clients pour les tickets")
    const ticketCustomerIds = recentTicketsData.map(ticket => ticket.customer_id).filter(Boolean)
    console.log("Ticket customer IDs à récupérer:", ticketCustomerIds)
    const { data: ticketCustomersData, error: ticketCustomersError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", ticketCustomerIds)

    if (ticketCustomersError) {
      console.error("Erreur détaillée lors de la récupération des clients des tickets:", JSON.stringify(ticketCustomersError, null, 2))
      throw ticketCustomersError
    }

    console.log("Structure des données clients des tickets:", JSON.stringify(ticketCustomersData?.[0], null, 2))

    // Map pour accès rapide aux données clients des tickets
    const ticketCustomersMap = new Map(
      ticketCustomersData?.map(customer => [customer.id, {
        id: customer.id,
        email: customer.email,
        full_name: customer.full_name
      }]) || []
    )

    // Formater les tickets récents
    const formattedRecentTickets = recentTicketsData.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      created_at: ticket.created_at,
      user_name: ticketCustomersMap.get(ticket.customer_id)?.full_name || "Utilisateur inconnu",
      user_email: ticketCustomersMap.get(ticket.customer_id)?.email || "Email inconnu"
    }))

    // Top pizzerias (les plus actives basées sur le nombre de commandes)
    console.log("12. Récupération des top pizzerias")
    const { data: topPizzeriasData, error: topPizzeriasError } = await supabase
      .from("pizzerias")
      .select(`
        id,
        name,
        address,
        status,
        image
      `)
      .eq("status", "active")
      .limit(5)

    if (topPizzeriasError) {
      console.error("Erreur lors de la récupération des top pizzerias:", topPizzeriasError)
      throw topPizzeriasError
    }

    // Formater les top pizzerias
    const formattedTopPizzerias = topPizzeriasData.map(pizzeria => ({
      id: pizzeria.id,
      name: pizzeria.name,
      address: pizzeria.address,
      status: pizzeria.status,
      image: pizzeria.image
    }))

    console.log("13. Retour des statistiques complètes")
    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      total_pizzerias: totalPizzerias || 0,
      total_users: totalUsers || 0,
      orders_by_status: ordersByStatus,
      tickets_by_status: ticketsByStatus,
      recent_orders: formattedRecentOrders,
      recent_tickets: formattedRecentTickets,
      top_pizzerias: formattedTopPizzerias,
    }

  } catch (error) {
    console.error("Erreur dans getDashboardStats:", error)
    throw error
  }
}

// Fonction RPC pour obtenir les top pizzerias
// À exécuter dans l'éditeur SQL de Supabase
/*
CREATE OR REPLACE FUNCTION get_top_pizzerias(limit_num integer)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  status text,
  orders_count bigint,
  total_revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.address,
    p.status,
    COUNT(o.id) as orders_count,
    SUM(o.total) as total_revenue
  FROM 
    pizzerias p
  LEFT JOIN 
    orders o ON p.id = o.pizzeria_id
  GROUP BY 
    p.id, p.name, p.address, p.status
  ORDER BY 
    orders_count DESC, total_revenue DESC
  LIMIT limit_num;
END;
$$ LANGUAGE plpgsql;
*/
