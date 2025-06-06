import { Suspense } from "react"
import { getPizzas } from "@/app/api/pizza/actions"
import PizzasClient from "./pizzas-client"

export const dynamic = "force-dynamic"

export default async function PizzasPage() {
  const pizzas = await getPizzas()

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Pizzas</h1>
      </div>

      <Suspense fallback={<div>Chargement...</div>}>
        <PizzasClient initialPizzas={pizzas} />
      </Suspense>
    </div>
  )
} 