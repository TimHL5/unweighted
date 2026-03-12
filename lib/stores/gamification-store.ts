import { create } from 'zustand'

export interface GamificationEvent {
  id: string
  type: 'achievement' | 'challenge_complete'
  data: {
    name: string
    icon?: string
    xp?: number
    rarity?: string
    slug?: string
  }
}

interface GamificationState {
  queue: GamificationEvent[]
  enqueue: (event: GamificationEvent) => void
  dequeue: () => void
  processGamificationResponse: (response: unknown) => void
}

export const useGamificationStore = create<GamificationState>((set) => ({
  queue: [],

  enqueue: (event) =>
    set((state) => ({ queue: [...state.queue, event] })),

  dequeue: () =>
    set((state) => ({ queue: state.queue.slice(1) })),

  processGamificationResponse: (response) => {
    if (!response || typeof response !== 'object') return

    const res = response as {
      achievements_unlocked?: { slug: string; name: string; icon: string; xp_reward: number; rarity: string }[]
      challenges_completed?: { name: string; xp_reward: number }[]
    }

    const events: GamificationEvent[] = []

    if (res.achievements_unlocked) {
      for (const a of res.achievements_unlocked) {
        events.push({
          id: `achievement-${a.slug}-${Date.now()}`,
          type: 'achievement',
          data: {
            name: a.name,
            icon: a.icon,
            xp: a.xp_reward,
            rarity: a.rarity,
            slug: a.slug,
          },
        })
      }
    }

    if (res.challenges_completed) {
      for (const c of res.challenges_completed) {
        events.push({
          id: `challenge-${c.name}-${Date.now()}`,
          type: 'challenge_complete',
          data: {
            name: c.name,
            xp: c.xp_reward,
          },
        })
      }
    }

    if (events.length > 0) {
      set((state) => ({ queue: [...state.queue, ...events] }))
    }
  },
}))
