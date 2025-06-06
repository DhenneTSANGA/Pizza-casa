"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder: string
  className?: string
}

export default function ImageUpload({ value, onChange, folder, className }: ImageUploadProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // Vérifier la configuration au chargement du composant
    const checkConfiguration = async () => {
      try {
        // Vérifier les variables d'environnement
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('Variables d\'environnement manquantes:', {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'présente' : 'manquante'
          })
          throw new Error('Configuration Supabase manquante')
        }

        // Vérifier l'authentification
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError) {
          console.error('Erreur d\'authentification:', authError)
          throw new Error('Erreur d\'authentification')
        }

        if (!session) {
          console.error('Non authentifié')
          throw new Error('Vous devez être connecté pour uploader des images')
        }

        // Vérifier si le bucket existe
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
        if (bucketsError) {
          console.error('Erreur lors de la récupération des buckets:', bucketsError)
          throw bucketsError
        }

        const imagesBucket = buckets.find(b => b.name === 'images')
        if (!imagesBucket) {
          console.error('Bucket "images" non trouvé. Buckets disponibles:', buckets)
          throw new Error('Le bucket "images" n\'existe pas. Veuillez le créer dans le dashboard Supabase.')
        }

        console.log('Configuration Supabase OK:', { session, bucket: imagesBucket })
        setIsConfigured(true)
      } catch (error) {
        console.error('Erreur de configuration:', error)
        toast({
          title: "Erreur de configuration",
          description: error instanceof Error ? error.message : "Impossible de se connecter à Supabase",
          variant: "destructive",
        })
      }
    }

    checkConfiguration()
  }, [toast])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isConfigured) {
      toast({
        title: "Erreur",
        description: "La configuration n'est pas terminée. Veuillez réessayer.",
        variant: "destructive",
      })
      return
    }

    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 2MB",
        variant: "destructive",
      })
      return
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Le fichier doit être une image",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      console.log('Tentative d\'upload vers:', filePath)

      // Upload vers Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Erreur détaillée:', uploadError)
        throw new Error(`Erreur upload: ${uploadError.message}`)
      }

      console.log('Upload réussi, données:', data)

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      console.log('URL publique générée:', publicUrl)

      setPreview(publicUrl)
      onChange(publicUrl)
      
      toast({
        title: "Succès",
        description: "Image téléchargée avec succès",
      })
    } catch (error) {
      console.error('Erreur complète:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du téléchargement de l'image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!value) return

    try {
      // Extraire le chemin du fichier de l'URL
      const filePath = value.split('/').pop()
      if (!filePath) return

      console.log('Tentative de suppression du fichier:', `${folder}/${filePath}`)

      // Supprimer le fichier de Supabase Storage
      const { error } = await supabase.storage
        .from('images')
        .remove([`${folder}/${filePath}`])

      if (error) {
        console.error('Erreur de suppression:', error)
        throw error
      }

      setPreview(null)
      onChange('')
      
      toast({
        title: "Succès",
        description: "Image supprimée avec succès",
      })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression de l'image",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {preview ? (
        <div className="relative">
          <Image
            src={preview}
            alt="Preview"
            width={200}
            height={200}
            className="rounded-lg object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <Label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500">PNG, JPG ou WEBP (MAX. 2MB)</p>
            </div>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading || !isConfigured}
            />
          </Label>
        </div>
      )}
    </div>
  )
} 