export type Priority = 'low' | 'medium' | 'high'

export type Status = 'not-started' | 'in-progress' | 'completed'

export type Theme = 'light' | 'dark' | 'system'

export interface Subtask {
  id: string
  title: string
  completed: boolean
  /** Optional due date in YYYY-MM-DD format. */
  dueDate: string | null
}

export interface Attachment {
  /** Also the id of the stored file contents. */
  id: string
  name: string
  /** Size in bytes. */
  size: number
  /** ISO timestamp. */
  addedAt: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  lecturer: string
  /** Due date in YYYY-MM-DD format (a calendar day, no time zone). */
  dueDate: string
  priority: Priority
  status: Status
  /** 0–100. Calculated from subtasks when there are any, otherwise set manually. */
  progress: number
  tags: string[]
  subtasks: Subtask[]
  /** Attached PDFs (details only — the file contents are stored separately, see services/files.ts). */
  attachments: Attachment[]
  /** ISO timestamp. */
  createdAt: string
  /** ISO timestamp, set when the assignment is marked completed. */
  completedAt: string | null
}

/** The fields a user fills in on the add / edit form. */
export type AssignmentInput = Pick<
  Assignment,
  'title' | 'description' | 'subject' | 'lecturer' | 'dueDate' | 'priority' | 'status' | 'tags'
>

export interface Settings {
  name: string
  theme: Theme
  defaultPriority: Priority
  notifications: boolean
}
