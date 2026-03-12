import Link from 'next/link'
import { ArrowRight, BarChart3, Users, Trophy, Target, Utensils, LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-navy dark:text-foreground">
            Unweighted
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-coral text-coral-foreground hover:bg-coral/90">
                Get Started Free
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-coral text-coral-foreground hover:bg-coral/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-coral/10 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-ocean/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-navy sm:text-5xl md:text-6xl lg:text-7xl dark:text-foreground">
            Weight loss isn&apos;t a{' '}
            <span className="text-coral">solo journey</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            The only calorie tracker that keeps you accountable. Track food, join a group,
            transform together.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-coral px-8 text-lg text-coral-foreground hover:bg-coral/90"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="px-8 text-lg">
                See Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Stats */}
      <section className="border-y bg-muted/50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-coral sm:text-5xl">95%</div>
              <p className="text-muted-foreground">
                of dieters regain weight within 2 years
              </p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-coral sm:text-5xl">70%</div>
              <p className="text-muted-foreground">
                quit their calorie tracker in 2 weeks
              </p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-coral sm:text-5xl">160M</div>
              <p className="text-muted-foreground">
                Americans diet annually, spending $70B
              </p>
            </div>
          </div>
          <p className="text-center text-lg font-medium text-foreground">
            Because every other app leaves you tracking alone.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-muted-foreground">
            Three pillars that actually make weight loss stick.
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-coral/10">
                <Target className="h-6 w-6 text-coral" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Smart Tracking</h3>
              <p className="text-muted-foreground">
                Scan barcodes, search 1M+ foods, build recipes. See your macros in
                beautiful dashboards.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal/10">
                <Users className="h-6 w-6 text-teal" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Real Accountability</h3>
              <p className="text-muted-foreground">
                Get matched with 2-3 others on the same journey. Daily chat. Weekly
                check-ins. Real connection.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber/10">
                <Trophy className="h-6 w-6 text-amber" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Gamification That Works</h3>
              <p className="text-muted-foreground">
                Streaks, achievements, XP, challenges. Every healthy choice gets
                rewarded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
            How it works
          </h2>
          <div className="grid gap-12 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral text-xl font-bold text-white">
                1
              </div>
              <div className="mb-2 flex items-center justify-center gap-2">
                <BarChart3 className="h-5 w-5 text-coral" />
                <h3 className="text-lg font-semibold">Set your goals</h3>
              </div>
              <p className="text-muted-foreground">
                Personalized calorie + macro targets based on your body and goals.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral text-xl font-bold text-white">
                2
              </div>
              <div className="mb-2 flex items-center justify-center gap-2">
                <Utensils className="h-5 w-5 text-coral" />
                <h3 className="text-lg font-semibold">Track effortlessly</h3>
              </div>
              <p className="text-muted-foreground">
                Scan, search, or quick-add meals in seconds. Build recipes and reuse
                them.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral text-xl font-bold text-white">
                3
              </div>
              <div className="mb-2 flex items-center justify-center gap-2">
                <LineChart className="h-5 w-5 text-coral" />
                <h3 className="text-lg font-semibold">Stay accountable</h3>
              </div>
              <p className="text-muted-foreground">
                Your group keeps you on track with daily chat, shared progress, and
                weekly check-ins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to lose weight with people who get it?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join Unweighted today. Free to start, no credit card required.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-coral px-10 text-lg text-coral-foreground hover:bg-coral/90"
            >
              Start Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <span className="text-lg font-bold text-navy dark:text-foreground">Unweighted</span>
              <p className="mt-1 text-sm text-muted-foreground">Built by Tim Liu</p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/pricing" className="hover:text-foreground">
                Pricing
              </Link>
              <Link href="#" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Unweighted. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
