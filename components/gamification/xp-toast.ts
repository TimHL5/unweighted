import { toast } from 'sonner'

export function showXPToast(amount: number) {
  toast(`⚡ +${amount} XP`, {
    duration: 2000,
  })
}

export function showLevelUpToast(level: number) {
  toast(`⭐ Level ${level} reached!`, {
    duration: 3000,
  })
}

export function showChallengeCompleteToast(name: string, xp: number) {
  toast(`🏆 Challenge Complete: ${name}`, {
    description: `+${xp} XP earned!`,
    duration: 3000,
  })
}
