import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
            <div className="space-y-6 max-w-md">
                <h1 className="font-display text-8xl font-black text-coral/20 relative">
                    404
                    <span className="absolute inset-0 flex items-center justify-center text-4xl text-foreground">
                        Oops!
                    </span>
                </h1>

                <div className="space-y-2">
                    <h2 className="font-display text-xl font-bold">Page not found</h2>
                    <p className="text-muted-foreground font-body">
                        Looks like you&apos;ve wandered off the path. The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                    <Button asChild variant="default" className="bg-coral hover:bg-coral/90 text-white rounded-xl">
                        <Link href="/dashboard">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go to Homepage
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
