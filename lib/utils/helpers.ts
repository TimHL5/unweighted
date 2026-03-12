import { formatDistanceToNow } from 'date-fns'

export function formatCalories(n: number): string {
  return n.toLocaleString('en-US')
}

export function formatWeight(kg: number, unit: 'imperial' | 'metric'): string {
  if (unit === 'imperial') {
    return `${Math.round(kgToLbs(kg) * 10) / 10} lbs`
  }
  return `${Math.round(kg * 10) / 10} kg`
}

export function formatHeight(cm: number, unit: 'imperial' | 'metric'): string {
  if (unit === 'imperial') {
    const { feet, inches } = cmToFtIn(cm)
    return `${feet}'${inches}"`
  }
  return `${Math.round(cm)} cm`
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches: inches === 12 ? 0 : inches }
}

export function ftInToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54)
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
