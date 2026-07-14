import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getDefaultSettings } from '@/lib/utils';

interface PINContextType {
  isVerified: boolean;
  verifyPIN: (pin: string) => Promise<boolean>;
  changePIN: (oldPIN: string, newPIN: string) => Promise<boolean>;
  lock: () => void;
  requirePIN: (action: () => void) => void;
}

const PINContext = createContext<PINContextType | null>(null);

function getStoredPIN(): string {
  try {
    return localStorage.getItem('attendance_pin') || getDefaultSettings().pin;
  } catch {
    return getDefaultSettings().pin;
  }
}

function setStoredPIN(pin: string): void {
  try {
    localStorage.setItem('attendance_pin', pin);
  } catch (e) {
    console.error('Failed to save PIN to localStorage:', e);
  }
}

export function PINProvider({ children }: { children: ReactNode }) {
  const [storedPIN, setStoredPINState] = useState<string>(getStoredPIN);
  const [isVerified, setIsVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const pin = getStoredPIN();
    setStoredPINState(pin);
  }, []);

  const verifyPIN = useCallback(async (pin: string): Promise<boolean> => {
    const isValid = pin === storedPIN;
    if (isValid) {
      setIsVerified(true);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    }
    return isValid;
  }, [storedPIN, pendingAction]);

  const changePIN = useCallback(async (oldPIN: string, newPIN: string): Promise<boolean> => {
    if (oldPIN !== storedPIN) return false;
    setStoredPIN(newPIN);
    setStoredPINState(newPIN);
    return true;
  }, [storedPIN]);

  const lock = useCallback(() => {
    setIsVerified(false);
  }, []);

  const requirePIN = useCallback((action: () => void) => {
    if (isVerified) {
      action();
    } else {
      setPendingAction(() => action);
    }
  }, [isVerified]);

  return (
    <PINContext.Provider value={{ isVerified, verifyPIN, changePIN, lock, requirePIN }}>
      {children}
    </PINContext.Provider>
  );
}

export function usePIN() {
  const context = useContext(PINContext);
  if (!context) throw new Error('usePIN must be used within PINProvider');
  return context;
}
