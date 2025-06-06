import { createAdminClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Récupérer l'utilisateur par email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Mettre à jour le rôle de l'utilisateur
    const { error: updateError } = await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour du rôle" }, { status: 500 })
    }

    return NextResponse.json({ message: "Utilisateur promu administrateur avec succès" })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
} 

// Promouvoir adminnistrateur 

// Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/set-admin' -Method Post -Body '{"email":"patricktopman2018@gmail.com"}' -ContentType 'application/json'