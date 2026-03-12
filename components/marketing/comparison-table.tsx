import { Check, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const features = [
  { name: 'Calorie Tracking', us: true, mfp: true, loseit: true, noom: true },
  { name: 'Barcode Scanning', us: true, mfp: true, loseit: true, noom: false },
  { name: 'Accountability Groups', us: true, mfp: false, loseit: false, noom: false },
  { name: 'Real-Time Group Chat', us: true, mfp: false, loseit: false, noom: false },
  { name: 'Gamification & XP', us: true, mfp: false, loseit: false, noom: false },
  { name: 'Achievements System', us: true, mfp: false, loseit: true, noom: false },
  { name: 'Community Challenges', us: true, mfp: false, loseit: true, noom: false },
  { name: 'Free Tier', us: true, mfp: true, loseit: true, noom: false },
  { name: 'Recipe Builder', us: true, mfp: true, loseit: true, noom: false },
  { name: 'Starting Price', us: 'Free', mfp: '$19.99/mo', loseit: '$39.99/yr', noom: '$70/mo' },
]

function CellIcon({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-sm font-medium">{value}</span>
  }
  return value ? (
    <Check className="mx-auto h-5 w-5 text-teal" />
  ) : (
    <X className="mx-auto h-5 w-5 text-muted-foreground/40" />
  )
}

export function ComparisonTable() {
  return (
    <section className="bg-muted/50 py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
          How Unweighted Compares
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-muted-foreground">
          See why Unweighted is the best choice for accountability-driven weight loss.
        </p>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                <TableHead className="bg-coral/5 text-center font-semibold">Unweighted</TableHead>
                <TableHead className="text-center">MyFitnessPal</TableHead>
                <TableHead className="text-center">Lose It!</TableHead>
                <TableHead className="text-center">Noom</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((f) => (
                <TableRow key={f.name}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="bg-coral/5 text-center">
                    <CellIcon value={f.us} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellIcon value={f.mfp} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellIcon value={f.loseit} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellIcon value={f.noom} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
