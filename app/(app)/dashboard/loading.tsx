export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-xl bg-muted shimmer" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded-full bg-purple/10 shimmer" />
            <div className="h-4 w-20 rounded bg-muted shimmer" />
          </div>
        </div>
        <div className="h-9 w-36 rounded-xl bg-muted shimmer" />
      </div>

      {/* Calorie ring + Macros */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ring card */}
        <div className="glass card-elevated rounded-2xl p-8 flex items-center justify-center">
          <div className="relative">
            <div className="h-[260px] w-[260px] rounded-full border-[16px] border-muted shimmer" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="h-10 w-24 rounded-lg bg-muted shimmer" />
              <div className="mt-2 h-3 w-20 rounded bg-muted shimmer" />
              <div className="mt-2 h-4 w-16 rounded bg-muted shimmer" />
            </div>
          </div>
        </div>

        {/* Macros card */}
        <div className="glass card-elevated rounded-2xl p-6 flex flex-col justify-center space-y-5">
          <div className="h-5 w-32 rounded bg-muted shimmer" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3.5 w-14 rounded bg-muted shimmer" />
                <div className="h-3.5 w-20 rounded bg-muted shimmer" />
              </div>
              <div className="h-3 w-full rounded-full bg-muted shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* Meals card */}
      <div className="glass card-elevated rounded-2xl p-6 space-y-0 divide-y divide-border/20">
        <div className="pb-4">
          <div className="h-5 w-28 rounded bg-muted shimmer" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="h-6 w-6 rounded bg-muted shimmer" />
            <div className="h-4 w-20 rounded bg-muted shimmer" />
            <div className="flex-1 h-px bg-muted/30" />
            <div className="h-4 w-16 rounded bg-muted shimmer" />
            <div className="h-4 w-4 rounded bg-muted shimmer" />
          </div>
        ))}
      </div>

      {/* Widget row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { color: 'bg-water/10', w: 'w-16' },
          { color: 'bg-amber/10', w: 'w-12' },
          { color: 'bg-coral/10', w: 'w-10' },
        ].map((config, i) => (
          <div key={i} className="glass card-elevated rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg ${config.color} shimmer`} />
              <div className="h-4 w-14 rounded bg-muted shimmer" />
            </div>
            <div className={`h-7 ${config.w} rounded bg-muted shimmer`} />
            <div className="h-2.5 w-full rounded-full bg-muted shimmer" />
          </div>
        ))}
      </div>

      {/* Challenges */}
      <div className="glass card-elevated rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-amber/20 shimmer" />
          <div className="h-5 w-36 rounded bg-muted shimmer" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3.5 w-40 rounded bg-muted shimmer" />
              <div className="h-3.5 w-10 rounded bg-muted shimmer" />
            </div>
            <div className="h-2 w-full rounded-full bg-muted shimmer" />
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="glass card-elevated rounded-2xl p-6 space-y-3">
        <div className="h-5 w-28 rounded bg-muted shimmer" />
        <div className="h-48 rounded-xl bg-muted/50 shimmer" />
      </div>
    </div>
  )
}
