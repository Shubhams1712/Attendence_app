import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { usePIN } from '@/contexts/PINContext';
import { Lock, AlertCircle } from 'lucide-react';

interface PINDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
}

export function PINDialog({ open, onClose, onSuccess, title = 'Enter PIN' }: PINDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyPIN } = usePIN();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isValid = await verifyPIN(pin);
      if (isValid) {
        onSuccess?.();
        onClose();
      } else {
        setError('Invalid PIN');
        setPin('');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-sm text-text-secondary text-center">
            This area is protected. Enter your admin PIN to continue.
          </p>
        </div>

        <div className="space-y-2">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            placeholder="Enter PIN"
            className="w-full text-center text-2xl tracking-widest px-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoComplete="off"
          />
          {error && (
            <p className="text-sm text-danger flex items-center gap-1 justify-center">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={pin.length < 4} className="flex-1">
            Verify
          </Button>
        </div>
      </form>
    </Modal>
  );
}
