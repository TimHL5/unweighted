'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Search, Plus, Loader2, ScanBarcode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { NutritionLabel } from '@/components/food/nutrition-label'
import { useBarcodeLookup } from '@/lib/hooks/use-food-search'
import { useFoodLogStore } from '@/lib/stores/food-log-store'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/motion'

function BarcodePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date') || useFoodLogStore.getState().selectedDate

  const [code, setCode] = useState('')
  const [searchCode, setSearchCode] = useState('')

  const { data, isLoading, error } = useBarcodeLookup(searchCode, searchCode.length >= 8)

  const handleLookup = () => {
    if (code.length >= 8) {
      setSearchCode(code)
    }
  }

  const handleLog = () => {
    if (data?.food) {
      const food = data.food
      if (food.id) {
        router.push(`/dashboard/food/detail?id=${food.id}&meal=snack&date=${dateParam}`)
      }
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5 pb-20"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-xl font-bold">Barcode Lookup</h1>
      </motion.div>

      {/* Barcode Input */}
      <motion.div variants={fadeInUp} className="flex gap-2">
        <div className="relative flex-1">
          <ScanBarcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Enter barcode number..."
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            maxLength={14}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            className="h-12 rounded-xl pl-10 font-mono text-lg"
          />
        </div>
        <Button
          onClick={handleLookup}
          disabled={code.length < 8 || isLoading}
          className="h-12 gap-1.5 rounded-xl bg-coral px-5 font-display font-semibold text-white hover:bg-coral/90"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Look Up
        </Button>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </motion.div>
      )}

      {/* Result */}
      {data?.food && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <motion.div variants={fadeInUp}>
            <Card className="card-elevated">
              <CardContent className="py-4">
                <h2 className="font-display text-lg font-bold">{data.food.name}</h2>
                {data.food.brand && (
                  <p className="text-sm text-muted-foreground">{data.food.brand}</p>
                )}
                <div className="mt-2 flex gap-3 text-xs font-mono">
                  <span className="font-semibold text-coral">{data.food.calories_per_serving} cal</span>
                  {data.food.protein_g != null && <span className="text-teal">P {data.food.protein_g}g</span>}
                  {data.food.carbs_g != null && <span className="text-blue-500">C {data.food.carbs_g}g</span>}
                  {data.food.fat_g != null && <span className="text-amber">F {data.food.fat_g}g</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <NutritionLabel food={data.food} />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Button
              className="w-full gap-2 bg-coral font-display font-semibold text-white shadow-lg shadow-coral/20 hover:bg-coral/90"
              onClick={handleLog}
            >
              <Plus className="h-4 w-4" />
              Log This Food
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Error / Not Found */}
      {error && searchCode && (
        <motion.div variants={scaleIn} initial="hidden" animate="visible">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <ScanBarcode className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 font-display font-semibold">Product not found</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Barcode: {searchCode}
              </p>
              <Button
                variant="ghost"
                className="mt-4 text-coral"
                onClick={() => router.push(`/dashboard/food/search?meal=snack&date=${dateParam}`)}
              >
                Create custom food instead
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!data && !isLoading && !error && (
        <motion.div variants={scaleIn} className="flex flex-col items-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-coral/20 to-purple/20">
            <ScanBarcode className="h-10 w-10 text-coral" />
          </div>
          <p className="mt-5 font-display font-semibold">Scan or enter a barcode</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Type the barcode number from any food package to quickly find nutrition info
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function BarcodePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BarcodePageContent />
    </Suspense>
  )
}
