export interface DashboardStats {
  total_orders: number
  total_revenue: number
  total_pizzerias: number
  total_users: number
  orders_by_status: {
    confirmed: number
    preparing: number
    delivering: number
    delivered: number
    cancelled: number
  }
  tickets_by_status: {
    open: number
    pending: number
    closed: number
  }
  recent_orders: Array<{
    id: string
    total: number
    status: string
    created_at: string
    customer_name: string
    customer_email: string
    pizzeria_name: string
  }>
  recent_tickets: Array<{
    id: string
    subject: string
    status: string
    created_at: string
    user_name: string
    user_email: string
  }>
  top_pizzerias: Array<{
    id: string
    name: string
    address: string
    status: string
    image?: string
  }>
}
