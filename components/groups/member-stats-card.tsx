'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { getInitials } from '@/lib/utils/helpers'
import { UtensilsCrossed, Flame, Trophy } from 'lucide-react'

interface MemberStatsCardProps {
  member: {
    user_id: string
    display_name: string
    avatar_url: string | null
    food_logs_this_week: number
    current_streak: number
    xp_total: number
  }
}

export function MemberStatsCard({ member }: MemberStatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.avatar_url || undefined} />
          <AvatarFallback>{getInitials(member.display_name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{member.display_name}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1" title="Food logs this week">
              <UtensilsCrossed className="h-3 w-3" />
              {member.food_logs_this_week}
            </span>
            <span className="flex items-center gap-1" title="Current streak">
              <Flame className="h-3 w-3 text-orange-500" />
              {member.current_streak}
            </span>
            <span className="flex items-center gap-1" title="Total XP">
              <Trophy className="h-3 w-3 text-amber-500" />
              {member.xp_total.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
