'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function TestAuth() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      console.log('Vérification de la session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Erreur de session:', sessionError)
        throw sessionError
      }
      
      if (!session) {
        console.log('Pas de session trouvée, redirection vers login')
        router.push('/login')
        return
      }

      console.log('Session trouvée:', session.user)
      setUser(session.user)

      // Récupérer le profil de l'utilisateur
      console.log('Récupération du profil...')
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.log('Profil non trouvé, création du profil...')
        // Extraire le nom de l'email (partie avant @)
        const name = session.user.email.split('@')[0]
        
        // Créer le profil utilisateur s'il n'existe pas
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: session.user.id,
              email: session.user.email,
              name: name,
              role: 'user',
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (createError) {
          console.error('Erreur lors de la création du profil:', createError)
          throw createError
        }

        console.log('Nouveau profil créé:', newProfile)
        setProfile(newProfile)
      } else {
        console.log('Profil trouvé:', profileData)
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Erreur détaillée:', error)
      setError(error.message || 'Une erreur est survenue')
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la vérification de votre compte.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ac1f1f]"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-medium">Erreur :</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div>
              <h3 className="font-medium">ID Utilisateur :</h3>
              <p className="text-sm text-gray-500 break-all">{user?.id}</p>
            </div>
            <div>
              <h3 className="font-medium">Email :</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <div>
              <h3 className="font-medium">Rôle actuel :</h3>
              <p className="text-sm text-gray-500">{profile?.role || 'user'}</p>
            </div>
            <div className="pt-4">
              <Button 
                onClick={handleLogout}
                variant="destructive"
              >
                Se déconnecter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 