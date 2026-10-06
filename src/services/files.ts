/**
 * Stores the contents of attached PDFs.
 * - Signed in: in Firestore, so they sync to every device (see cloud.ts).
 * - No accounts set up: in this browser's IndexedDB.
 * The assignment itself only keeps the file's name and size (its `attachments` list).
 */
import { loadCloud } from './firebase'

/** Firestore's free tier is shared by everything, so keep each PDF reasonably small. */
export const MAX_PDF_BYTES = 5 * 1024 * 1024

export function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Returns a friendly problem description, or null if the file can be attached. */
export function checkPdf(file: File): string | null {
  if (!isPdf(file)) return `“${file.name}” isn’t a PDF.`
  if (file.size > MAX_PDF_BYTES) return `“${file.name}” is ${formatFileSize(file.size)} — the limit is 5 MB.`
  return null
}

export async function saveFile(uid: string | undefined, fileId: string, file: File): Promise<void> {
  const data = new Uint8Array(await file.arrayBuffer())
  if (uid) return (await loadCloud()).saveFileData(uid, fileId, data)
  return localPut(fileId, data)
}

export async function readFile(uid: string | undefined, fileId: string): Promise<Blob> {
  const data = uid ? await (await loadCloud()).loadFileData(uid, fileId) : await localGet(fileId)
  return new Blob([data as BlobPart], { type: 'application/pdf' })
}

export async function deleteFile(uid: string | undefined, fileId: string): Promise<void> {
  if (uid) return (await loadCloud()).deleteFileData(uid, fileId)
  return localDelete(fileId)
}

/* ---------- IndexedDB (used only when accounts aren't set up) ---------- */

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('att-files', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('files')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = action(db.transaction('files', mode).objectStore('files'))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const localPut = async (id: string, data: Uint8Array) => {
  await run('readwrite', (store) => store.put(data, id))
}

const localGet = async (id: string) => {
  const data = await run<Uint8Array | undefined>('readonly', (store) => store.get(id))
  if (!data) throw new Error('File not found.')
  return data
}

const localDelete = async (id: string) => {
  await run('readwrite', (store) => store.delete(id))
}
