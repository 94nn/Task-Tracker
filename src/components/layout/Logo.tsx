import { Check } from 'lucide-react'

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-sky-300 shadow-sm shadow-brand-500/30">
        <Check className="size-5 text-white" strokeWidth={3} aria-hidden />
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold tracking-tight">Taskly</p>
        <p className="text-[11px] font-medium text-subtle">Assignment tracker</p>
      </div>
    </div>
  )
}
