import type { Assignment, Priority, Status } from '../types/assignment'
import { addDaysISO } from '../utils/dateUtils'
import { createId } from '../utils/id'
import { normalizeAssignment } from '../utils/assignmentUtils'

/**
 * Realistic example assignments shown on first launch.
 * Dates are relative to today so the sample always looks current.
 */

interface SampleSubtask {
  title: string
  done?: boolean
  /** Days from today. */
  due?: number
}

interface SampleAssignment {
  title: string
  description: string
  subject: string
  lecturer: string
  /** Days from today (negative = in the past). */
  due: number
  priority: Priority
  status: Status
  progress?: number
  tags: string[]
  subtasks?: SampleSubtask[]
  /** Days ago the assignment was created. */
  createdDaysAgo: number
  /** Days ago the assignment was completed. */
  completedDaysAgo?: number
}

const SAMPLES: SampleAssignment[] = [
  {
    title: 'Database Normalization Report',
    description:
      'Analyse the provided university enrolment schema and normalise it to 3NF. Explain each step with functional dependencies and justify design decisions.',
    subject: 'Database Systems',
    lecturer: 'Dr. Aisha Rahman',
    due: 3,
    priority: 'high',
    status: 'in-progress',
    tags: ['report', 'individual'],
    createdDaysAgo: 14,
    subtasks: [
      { title: 'Research existing database systems', done: true },
      { title: 'Collect references', done: true },
      { title: 'Identify functional dependencies', done: true },
      { title: 'Write normalisation steps (1NF → 3NF)', due: 0 },
      { title: 'Format references and submit', due: 3 },
    ],
  },
  {
    title: 'Final Year Project Documentation',
    description:
      'Complete chapters 1–4 of the FYP report: introduction, literature review, methodology and system design. Supervisor review meeting before submission.',
    subject: 'Software Engineering',
    lecturer: 'Prof. Daniel Lim',
    due: 12,
    priority: 'high',
    status: 'in-progress',
    tags: ['fyp', 'documentation'],
    createdDaysAgo: 30,
    subtasks: [
      { title: 'Write introduction chapter', done: true },
      { title: 'Literature review (15+ sources)', done: true },
      { title: 'Draft methodology', done: true },
      { title: 'System architecture diagrams', due: 5 },
      { title: 'Supervisor review meeting', due: 8 },
      { title: 'Final proofreading', due: 11 },
    ],
  },
  {
    title: 'Web Application Prototype',
    description:
      'Build a working prototype of a booking web app with React. Must include authentication screens, a dashboard and responsive layouts.',
    subject: 'Web Application Development',
    lecturer: 'Ms. Priya Nair',
    due: 6,
    priority: 'medium',
    status: 'in-progress',
    tags: ['react', 'group'],
    createdDaysAgo: 10,
    subtasks: [
      { title: 'Wireframes in Figma', done: true },
      { title: 'Set up project and routing', due: 0 },
      { title: 'Build dashboard page', due: 3 },
      { title: 'Responsive testing on mobile', due: 5 },
    ],
  },
  {
    title: 'Software Engineering Presentation',
    description:
      'Ten-minute group presentation comparing Agile and Waterfall using a real-world case study. Slides due the day before.',
    subject: 'Software Engineering',
    lecturer: 'Prof. Daniel Lim',
    due: 1,
    priority: 'medium',
    status: 'not-started',
    tags: ['presentation', 'group'],
    createdDaysAgo: 5,
    subtasks: [
      { title: 'Pick a case study', due: 0 },
      { title: 'Create slide deck', due: 1 },
      { title: 'Rehearse with team', due: 1 },
    ],
  },
  {
    title: 'Accounting Variance Analysis',
    description:
      'Calculate material, labour and overhead variances for the given case company and write a short management report with recommendations.',
    subject: 'Accounting',
    lecturer: 'Mr. Kevin Tan',
    due: -2,
    priority: 'high',
    status: 'in-progress',
    progress: 40,
    tags: ['calculation', 'report'],
    createdDaysAgo: 18,
  },
  {
    title: 'Usability Testing Plan',
    description:
      'Design a usability testing plan for an interactive kiosk prototype, including tasks, participant criteria and success metrics.',
    subject: 'Interactive Technology',
    lecturer: 'Dr. Mei Ling Chua',
    due: 20,
    priority: 'low',
    status: 'not-started',
    tags: ['ux', 'research'],
    createdDaysAgo: 3,
    subtasks: [
      { title: 'Define test objectives' },
      { title: 'Write participant tasks' },
      { title: 'Prepare consent form' },
    ],
  },
  {
    title: 'Reflection Journal — Week 6',
    description: 'Weekly reflective journal on prototyping techniques covered in the studio session.',
    subject: 'Interactive Technology',
    lecturer: 'Dr. Mei Ling Chua',
    due: 9,
    priority: 'low',
    status: 'in-progress',
    progress: 25,
    tags: ['journal'],
    createdDaysAgo: 4,
  },
  {
    title: 'ER Diagram Exercise',
    description: 'Draw an entity-relationship diagram for a library management system with cardinalities.',
    subject: 'Database Systems',
    lecturer: 'Dr. Aisha Rahman',
    due: -6,
    priority: 'medium',
    status: 'completed',
    tags: ['diagram'],
    createdDaysAgo: 21,
    completedDaysAgo: 7,
    subtasks: [
      { title: 'Identify entities', done: true },
      { title: 'Define relationships', done: true },
      { title: 'Draw final diagram', done: true },
    ],
  },
  {
    title: 'Responsive Portfolio Website',
    description: 'Personal portfolio built with semantic HTML and CSS Grid, deployed online.',
    subject: 'Web Application Development',
    lecturer: 'Ms. Priya Nair',
    due: -10,
    priority: 'medium',
    status: 'completed',
    tags: ['html', 'css'],
    createdDaysAgo: 35,
    completedDaysAgo: 11,
    subtasks: [
      { title: 'Design layout', done: true },
      { title: 'Build pages', done: true },
      { title: 'Deploy', done: true },
      { title: 'Submit link', done: true },
    ],
  },
  {
    title: 'Accounting Quiz Revision Notes',
    description: 'Summary notes for chapters 3–5 ahead of the online quiz.',
    subject: 'Accounting',
    lecturer: 'Mr. Kevin Tan',
    due: -3,
    priority: 'low',
    status: 'completed',
    tags: ['revision'],
    createdDaysAgo: 12,
    completedDaysAgo: 4,
  },
]

function daysAgoTimestamp(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export function createSampleAssignments(): Assignment[] {
  return SAMPLES.map((sample) =>
    normalizeAssignment({
      id: createId(),
      title: sample.title,
      description: sample.description,
      subject: sample.subject,
      lecturer: sample.lecturer,
      dueDate: addDaysISO(sample.due),
      priority: sample.priority,
      status: sample.status,
      progress: sample.progress ?? 0,
      tags: sample.tags,
      subtasks: (sample.subtasks ?? []).map((s) => ({
        id: createId(),
        title: s.title,
        completed: s.done ?? false,
        dueDate: s.due === undefined ? null : addDaysISO(s.due),
      })),
      createdAt: daysAgoTimestamp(sample.createdDaysAgo),
      completedAt: sample.completedDaysAgo === undefined ? null : daysAgoTimestamp(sample.completedDaysAgo),
    }),
  )
}
