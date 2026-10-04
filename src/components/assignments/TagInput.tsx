import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  id: string
  tags: string[]
  onChange: (tags: string[]) => void
}

/** Type a tag and press Enter or comma to add it. Backspace on an empty field removes the last tag. */
export function TagInput({ id, tags, onChange }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/^#/, '')
    if (tag && !tags.includes(tag) && tags.length < 8) onChange([...tags, tag])
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(draft)
    } else if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-1.5 transition-colors focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-400/15">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 py-1 pr-1 pl-2 text-xs font-semibold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300"
        >
          #{tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            aria-label={`Remove tag ${tag}`}
            className="rounded p-0.5 hover:bg-brand-100 dark:hover:bg-brand-400/20"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft && addTag(draft)}
        placeholder={tags.length === 0 ? 'e.g. report, group — press Enter to add' : 'Add tag…'}
        className="h-8 min-w-32 flex-1 bg-transparent px-1 text-sm placeholder:text-subtle focus:outline-none"
      />
    </div>
  )
}
