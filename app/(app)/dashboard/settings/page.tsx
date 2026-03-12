'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/providers/auth-provider'
import { useUpdateProfile } from '@/lib/hooks/use-social'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageUpload } from '@/components/shared/image-upload'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard, Loader2, Save, User, Utensils, Ruler, Bell,
  Palette, Crown, Shield, AlertTriangle, Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { fadeIn, fadeInUp, staggerContainer } from '@/lib/motion'
import { getInitials } from '@/lib/utils/helpers'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function SettingsPage() {
  const { profile, loading, signOut } = useAuth()
  const updateProfile = useUpdateProfile()

  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>(profile?.unit_system || 'imperial')
  const [calorieTarget, setCalorieTarget] = useState(profile?.daily_calorie_target?.toString() || '')
  const [proteinTarget, setProteinTarget] = useState(profile?.protein_target_g?.toString() || '')
  const [carbTarget, setCarbTarget] = useState(profile?.carb_target_g?.toString() || '')
  const [fatTarget, setFatTarget] = useState(profile?.fat_target_g?.toString() || '')
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // Notification toggles (local state, would connect to API)
  const [notifMeals, setNotifMeals] = useState(true)
  const [notifWeight, setNotifWeight] = useState(true)
  const [notifGroups, setNotifGroups] = useState(true)
  const [notifAchievements, setNotifAchievements] = useState(true)
  const [notifSocial, setNotifSocial] = useState(true)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      })
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const handleSaveTargets = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          unit_system: unitSystem,
          daily_calorie_target: calorieTarget ? Number(calorieTarget) : null,
          protein_target_g: proteinTarget ? Number(proteinTarget) : null,
          carb_target_g: carbTarget ? Number(carbTarget) : null,
          fat_target_g: fatTarget ? Number(fatTarget) : null,
        })
        .eq('id', profile?.id)

      if (error) throw error
      toast.success('Targets updated! Reload to see changes.')
    } catch {
      toast.error('Failed to update targets')
    } finally {
      setSaving(false)
    }
  }

  const subscriptionLabel =
    profile?.subscription_tier === 'premium'
      ? 'Premium'
      : profile?.subscription_tier === 'pro'
        ? 'Pro'
        : 'Free'

  const subscriptionColor =
    profile?.subscription_tier === 'premium'
      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
      : profile?.subscription_tier === 'pro'
        ? 'bg-coral text-white'
        : 'bg-muted text-muted-foreground'

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6 pb-20"
    >
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
        {/* ─── Profile ─── */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <User className="h-4.5 w-4.5 text-coral" />
              <CardTitle className="font-display text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-border/30">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-coral/10 font-display text-xl font-bold text-coral">
                    {getInitials(displayName || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <ImageUpload
                    bucket="avatars"
                    folder="avatars"
                    onUploadComplete={(url) => setAvatarUrl(url)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 500))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="resize-none"
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  <span className="font-mono">{bio.length}</span>/500
                </p>
              </div>

              <div>
                <Label>Email</Label>
                <Input value={profile?.email || ''} disabled className="bg-muted" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Email cannot be changed here
                </p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={!displayName.trim() || updateProfile.isPending}
                className="bg-coral hover:bg-coral/90 text-white"
              >
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Nutrition Targets ─── */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Utensils className="h-4.5 w-4.5 text-teal" />
              <CardTitle className="font-display text-base">Nutrition Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories" className="text-xs">
                    Calories
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(e.target.value)}
                    placeholder="2000"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="protein" className="text-xs">
                    Protein (g)
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    value={proteinTarget}
                    onChange={(e) => setProteinTarget(e.target.value)}
                    placeholder="150"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="carbs" className="text-xs">
                    Carbs (g)
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={carbTarget}
                    onChange={(e) => setCarbTarget(e.target.value)}
                    placeholder="200"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="fat" className="text-xs">
                    Fat (g)
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    value={fatTarget}
                    onChange={(e) => setFatTarget(e.target.value)}
                    placeholder="65"
                    className="font-mono"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveTargets}
                disabled={saving}
                className="bg-coral hover:bg-coral/90 text-white"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Targets
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Units ─── */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Ruler className="h-4.5 w-4.5 text-blue-500" />
              <CardTitle className="font-display text-base">Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Unit System</p>
                  <p className="text-xs text-muted-foreground">
                    {unitSystem === 'imperial' ? 'Pounds, feet, inches' : 'Kilograms, centimeters'}
                  </p>
                </div>
                <Select value={unitSystem} onValueChange={(v) => setUnitSystem(v as 'imperial' | 'metric')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imperial">Imperial</SelectItem>
                    <SelectItem value="metric">Metric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Notifications ─── */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Bell className="h-4.5 w-4.5 text-amber" />
              <CardTitle className="font-display text-base">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Meal reminders', desc: 'Daily meal logging reminders', value: notifMeals, onChange: setNotifMeals },
                { label: 'Weigh-in reminders', desc: 'Weekly weigh-in reminders', value: notifWeight, onChange: setNotifWeight },
                { label: 'Group messages', desc: 'New messages in your groups', value: notifGroups, onChange: setNotifGroups },
                { label: 'Achievements', desc: 'When you unlock achievements', value: notifAchievements, onChange: setNotifAchievements },
                { label: 'Social', desc: 'Likes, comments, and follows', value: notifSocial, onChange: setNotifSocial },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={item.onChange} />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Appearance ─── */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Palette className="h-4.5 w-4.5 text-purple" />
              <CardTitle className="font-display text-base">Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Theme is controlled by your system settings
              </p>
              <div className="flex gap-2">
                {['light', 'dark', 'system'].map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={cn(
                      'flex-1 rounded-xl border py-3 text-center text-xs font-medium capitalize transition-all',
                      theme === 'system'
                        ? 'border-coral bg-coral/5 text-coral'
                        : 'border-border hover:bg-muted/50'
                    )}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Subscription ─── */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Crown className="h-4.5 w-4.5 text-amber" />
              <CardTitle className="font-display text-base">Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  <Badge className={cn('mt-1', subscriptionColor)}>
                    {subscriptionLabel}
                  </Badge>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/settings/billing">
                    <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                    Manage
                  </Link>
                </Button>
              </div>

              {profile?.subscription_tier === 'free' && (
                <div className="rounded-xl bg-gradient-to-r from-coral/10 to-purple/10 p-4">
                  <p className="text-sm font-bold">Upgrade to Pro</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Get unlimited groups, challenges, and advanced analytics.
                  </p>
                  <Button asChild size="sm" className="mt-3 bg-coral hover:bg-coral/90 text-white">
                    <Link href="/dashboard/settings/billing">Upgrade Now</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Account / Danger Zone ─── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-destructive/30">
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Shield className="h-4.5 w-4.5 text-destructive" />
              <CardTitle className="font-display text-base text-destructive">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sign Out</p>
                  <p className="text-xs text-muted-foreground">Sign out of your account</p>
                </div>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data, including food logs,
              progress photos, achievements, and group memberships will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-sm">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </Label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== 'DELETE'}
              onClick={() => {
                toast.error('Account deletion is not yet implemented')
                setDeleteOpen(false)
              }}
            >
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
