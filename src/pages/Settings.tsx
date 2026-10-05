import { useState, type ReactNode } from 'react'
import { Cloud, Database, LogOut, Monitor, Moon, Sun, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import type { Priority, Theme } from '../types/assignment'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/FormField'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Switch } from '../components/ui/Switch'
import { Avatar } from '../components/ui/Avatar'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useSettings } from '../hooks/useSettings'
import { useAssignments } from '../hooks/useAssignments'
import { useToast } from '../hooks/useToast'
import { PRIORITY_LABELS } from '../utils/assignmentUtils'

export default function Settings() {
  const { settings, updateSettings } = useSettings()
  const { assignments, clearAll } = useAssignments()
  const { toast } = useToast()
  const { user, signOut } = useAuth()
  const [name, setName] = useState(settings.name)
  const [confirmClear, setConfirmClear] = useState(false)

  function saveName() {
    const trimmed = name.trim()
    if (!trimmed) {
      setName(settings.name)
      return
    }
    if (trimmed !== settings.name) {
      updateSettings({ name: trimmed })
      toast('Name updated', { description: `Nice to meet you, ${trimmed.split(' ')[0]}!` })
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {user && (
        <Card className="animate-fade-up p-5 sm:p-6">
          <SectionTitle
            title="Account"
            description="Your assignments and settings sync to this Google account on every device you sign in on."
            icon={<Cloud className="size-4 text-brand-500" aria-hidden />}
          />
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar name={user.name} photoURL={user.photoURL} className="size-12" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
              Synced
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={<LogOut className="size-4" />}
              onClick={async () => {
                await signOut()
                toast('Signed out', { description: 'See you soon!', variant: 'info' })
              }}
            >
              Sign out
            </Button>
          </div>
        </Card>
      )}

      <Card className="animate-fade-up p-5 sm:p-6">
        <SectionTitle title="Profile" description="Your name appears in the greeting and sidebar." />
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <Avatar name={name || settings.name} photoURL={user?.photoURL} className="size-14 text-lg" />
          <div className="flex-1">
            <label htmlFor="settings-name" className="text-sm font-semibold">
              Name
            </label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              placeholder="Your name"
              maxLength={40}
              className="mt-1.5"
              autoComplete="given-name"
            />
          </div>
        </div>
      </Card>

      <Card className="animate-fade-up p-5 sm:p-6" style={{ animationDelay: '40ms' }}>
        <SectionTitle title="Preferences" description="Changes are saved automatically." />
        <div className="mt-2 divide-y divide-line">
          <SettingRow label="Theme" description="Choose light, dark, or follow your device.">
            <SegmentedControl<Theme>
              label="Theme"
              value={settings.theme}
              onChange={(theme) => updateSettings({ theme })}
              options={[
                { value: 'light', label: 'Light', icon: <Sun className="size-4" aria-hidden /> },
                { value: 'dark', label: 'Dark', icon: <Moon className="size-4" aria-hidden /> },
                { value: 'system', label: 'System', icon: <Monitor className="size-4" aria-hidden /> },
              ]}
            />
          </SettingRow>

          <SettingRow label="Default priority" description="Pre-selected when you add a new assignment.">
            <SegmentedControl<Priority>
              label="Default priority"
              value={settings.defaultPriority}
              onChange={(defaultPriority) => updateSettings({ defaultPriority })}
              options={(['low', 'medium', 'high'] as Priority[]).map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
            />
          </SettingRow>

          <SettingRow
            label="Deadline notifications"
            description="Show alerts for overdue and due-soon assignments in the bell menu."
            htmlFor="settings-notifications"
          >
            <Switch
              id="settings-notifications"
              label="Deadline notifications"
              checked={settings.notifications}
              onChange={(notifications) => {
                updateSettings({ notifications })
                toast(notifications ? 'Notifications on' : 'Notifications off', { variant: 'info' })
              }}
            />
          </SettingRow>
        </div>
      </Card>

      <Card className="animate-fade-up p-5 sm:p-6" style={{ animationDelay: '80ms' }}>
        <SectionTitle
          title="Data"
          description={`${user ? `Synced to ${user.email}.` : 'Everything is stored privately in this browser.'} You have ${assignments.length} assignment${
            assignments.length === 1 ? '' : 's'
          } saved.`}
          icon={<Database className="size-4 text-brand-500" aria-hidden />}
        />
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            icon={<Trash2 className="size-4" />}
            onClick={() => setConfirmClear(true)}
            disabled={assignments.length === 0}
            className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-400/10"
          >
            Delete all assignments
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmClear}
        title="Delete all assignments?"
        message={`Every assignment and subtask will be permanently removed${
          user ? ' from your account on all your devices' : ' from this browser'
        }. This can’t be undone.`}
        confirmLabel="Delete everything"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll()
          setConfirmClear(false)
        }}
      />
    </div>
  )
}

function SectionTitle({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-base font-bold">
        {icon}
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-muted">{description}</p>
    </div>
  )
}

function SettingRow({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string
  description: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div>
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-semibold">
            {label}
          </label>
        ) : (
          <p className="text-sm font-semibold">{label}</p>
        )}
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      {children}
    </div>
  )
}
