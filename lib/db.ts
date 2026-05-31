import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface PracticeRecord {
  id: string;
  theme: string;
  question: string;
  category: string;
  language: string;
  level: string;
  audioBlob?: Blob;
  durationSeconds: number;
  createdAt: string;
  selfScore: {
    clarity: number;
    structure: number;
    voice: number;
  };
  note: string;
}

interface VoiceDB extends DBSchema {
  records: {
    key: string;
    value: PracticeRecord;
    indexes: { 'by-date': string };
  };
}

let dbPromise: Promise<IDBPDatabase<VoiceDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<VoiceDB>('voice-practice-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('records', { keyPath: 'id' });
        store.createIndex('by-date', 'createdAt');
      },
    });
  }
  return dbPromise;
}

export async function saveRecord(record: PracticeRecord): Promise<void> {
  const db = await getDB();
  await db.put('records', record);
}

export async function getAllRecords(): Promise<PracticeRecord[]> {
  const db = await getDB();
  const all = await db.getAll('records');
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('records', id);
}

export async function clearAllRecords(): Promise<void> {
  const db = await getDB();
  await db.clear('records');
}

export async function getRecordById(id: string): Promise<PracticeRecord | undefined> {
  const db = await getDB();
  return db.get('records', id);
}

export function generateId(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const rand = Math.random().toString(36).slice(2, 7);
  return `${date}_${rand}`;
}
