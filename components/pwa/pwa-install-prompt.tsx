'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type BannerType = 'ios' | 'install' | null

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [bannerType, setBannerType] = useState<BannerType>(null)
  const pathname = usePathname()

  const isAppRoute = useMemo(() => pathname.startsWith('/dashboard'), [pathname])

  useEffect(() => {
    if (!isAppRoute) return
    if (localStorage.getItem('pwa-install-dismissed')) return

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setBannerType('install')
    }

    if (ios) {
      // For iOS, show manual instructions after a microtask to satisfy lint
      const timeout = setTimeout(() => setBannerType('ios'), 0)
      return () => clearTimeout(timeout)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [isAppRoute])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    setDeferredPrompt(null)
    setBannerType(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setBannerType(null)
    localStorage.setItem('pwa-install-dismissed', '1')
  }, [])

  if (!bannerType) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg border bg-card p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:w-80">
      <div className="flex items-start gap-3">
        <Download className="mt-0.5 h-5 w-5 shrink-0 text-coral" />
        <div className="flex-1">
          <p className="text-sm font-medium">Add Unweighted to your home screen</p>
          {bannerType === 'ios' ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Tap the Share button, then &quot;Add to Home Screen&quot;
            </p>
          ) : (
            <Button
              size="sm"
              className="mt-2 bg-coral text-coral-foreground hover:bg-coral/90"
              onClick={handleInstall}
            >
              Install
            </Button>
          )}
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
