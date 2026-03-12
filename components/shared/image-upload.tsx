'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, X, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleIn } from '@/lib/motion'

interface ImageUploadProps {
  bucket: string
  folder: string
  onUploadComplete: (url: string) => void
  maxSizeMB?: number
}

export function ImageUpload({
  bucket,
  folder,
  onUploadComplete,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMB}MB`)
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      onUploadComplete(publicUrl)
    } catch (err) {
      setError('Upload failed. Please try again.')
      setPreview(null)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative overflow-hidden rounded-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="h-48 w-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                  <span className="text-xs font-medium text-white">Uploading...</span>
                </div>
              </div>
            )}
            {!uploading && (
              <button
                type="button"
                onClick={clearPreview}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div key="upload" variants={scaleIn} initial="hidden" animate="visible" exit="hidden">
            <Button
              type="button"
              variant="outline"
              className="h-36 w-full rounded-xl border-dashed border-border/50 hover:border-coral/30 hover:bg-coral/5"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-foreground">Tap to upload photo</span>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to {maxSizeMB}MB</p>
                </div>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
