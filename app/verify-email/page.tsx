// app/verify-email/page.tsx
'use client'

import { CheckCircle, Mail, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/utils/supabase/client'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const email = searchParams.get('email')

  // Vérifier l'état de la confirmation
  const checkEmailVerification = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email_confirmed_at) {
        setIsVerified(true)
        // Rediriger après 3 secondes si l'email est confirmé
        setTimeout(() => {
          router.push(searchParams.get('redirect') || '/paiement')
        }, 3000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Vérifier immédiatement et toutes les 5 secondes
  useEffect(() => {
    checkEmailVerification()
    const interval = setInterval(checkEmailVerification, 5000)
    return () => clearInterval(interval)
  }, [])

  // Renvoyer l'email de confirmation
  const resendConfirmation = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email || '',
      })
      
      if (error) throw error
      alert('Email de confirmation renvoyé avec succès!')
    } catch (error) {
      if (error instanceof Error) {
        alert('Erreur lors de l\'envoi: ' + error.message)
      } else {
        alert('Erreur inconnue lors de l\'envoi.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg text-center">
        {isVerified ? (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Email confirmé avec succès!</h2>
            <p className="mt-2 text-gray-600">
              Redirection vers votre espace personnel...
            </p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ac1f1f] mx-auto"></div>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Vérifiez votre email</h2>
            <p className="mt-2 text-gray-600">
              Nous avons envoyé un lien de confirmation à votre adresse email.
              Veuillez cliquer sur ce lien pour activer votre compte.
            </p>
            <div className="mt-4">
              <Button
                onClick={resendConfirmation}
                disabled={isLoading}
                className="w-full bg-[#ac1f1f] hover:bg-[#FF914D] text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Renvoyer l'email de confirmation"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ac1f1f]"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}