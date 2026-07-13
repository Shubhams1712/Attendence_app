import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { openDB, type IDBPDatabase } from 'idb';
import type { OfflineRecord } from '@shared/types';

interface OfflineContextType {
  isOnline: boolean;
  pendingSync: number;
  syncNow: () => Promise<void>;
  saveOffline: (record: Omit<OfflineRecord, 'id' | 'timestamp' | 'synced'>) => Promise<void>;
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

    // Count pending records
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

  const saveOffline = useCallback(async (
    record: Omit<OfflineRecord, 'id' | 'timestamp' | 'synced'>
  ) => {
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
          // Attempt to sync each record to server
          const response = await fetch(`/api/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
          });

          if (response.ok) {
            await tx.store.delete(record.id);
          }
        } catch {
          // Will retry on next sync
        }
      }

      setPendingSync(0);
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
