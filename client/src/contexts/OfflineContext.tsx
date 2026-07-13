import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { openDB, type IDBPDatabase } from 'idb';
import { supabase } from '@/lib/supabase';
import type { AttendanceStatus, OfflineRecord } from '@/types';

interface OfflineContextType {
  isOnline: boolean;
  pendingSync: number;
  syncNow: () => Promise<void>;
  saveOffline: (record: {
    session_id: string;
    student_id: string;
    subject_id: string;
    date: string;
    status: AttendanceStatus;
    marked_by: string;
  }) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

const DB_NAME = 'classattend-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-sync';

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    },
  });
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    countPending();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncNow();
    }
  }, [isOnline]);

  const countPending = async () => {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const count = await tx.store.count();
      setPendingSync(count);
    } catch {
      // IndexedDB not available
    }
  };

  const saveOffline = useCallback(async (record: {
    session_id: string;
    student_id: string;
    subject_id: string;
    date: string;
    status: AttendanceStatus;
    marked_by: string;
  }) => {
    try {
      const db = await getDB();
      await db.add(STORE_NAME, {
        ...record,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        synced: false,
      });
      await countPending();
    } catch (error) {
      console.error('Failed to save offline:', error);
    }
  }, []);

  const syncNow = useCallback(async () => {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const records = await tx.store.getAll();

      for (const record of records) {
        try {
          // Try to upsert the attendance record directly to Supabase
          const { error } = await supabase
            .from('attendance_records')
            .upsert(
              {
                session_id: record.session_id,
                student_id: record.student_id,
                subject_id: record.subject_id,
                date: record.date,
                status: record.status,
                marked_by: record.marked_by,
                marked_at: record.timestamp,
              },
              { onConflict: 'session_id,student_id' }
            );

          if (!error) {
            await tx.store.delete(record.id);
          }
        } catch {
          // Will retry on next sync
        }
      }

      await countPending();
    } catch {
      // Sync failed, will retry later
    }
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, pendingSync, syncNow, saveOffline }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within OfflineProvider');
  return context;
}
