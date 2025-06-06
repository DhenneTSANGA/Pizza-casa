"use client"

import { useState } from "react"
import ImageUpload from "@/components/ui/image-upload"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ImageUploadTest() {
  const { toast } = useToast()
  const [imageUrl, setImageUrl] = useState<string>("")

  const handleImageChange = (url: string) => {
    setImageUrl(url)
    toast({
      title: "URL de l'image",
      description: url,
    })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Test d'upload d'image</h2>
      <div className="max-w-sm">
        <ImageUpload
          value={imageUrl}
          onChange={handleImageChange}
          folder="test"
        />
      </div>
      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">URL de l'image :</p>
          <p className="text-sm break-all">{imageUrl}</p>
        </div>
      )}
    </div>
  )
} 