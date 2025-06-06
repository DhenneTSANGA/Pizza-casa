'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

export default function AuthProcessing() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        router.push('/paiement')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Traitement de l'authentification en cours...</p>
    </div>
  )
} 