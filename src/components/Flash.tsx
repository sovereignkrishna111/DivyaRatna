import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type FlashKind = 'success' | 'error' | 'info';

type FlashItem = {
  id: string;
  kind: FlashKind;
  text: string;
};

type FlashContextType = {
  push: (kind: FlashKind, text: string, opts?: { timeoutMs?: number }) => void;
  success: (text: string, opts?: { timeoutMs?: number }) => void;
  error: (text: string, opts?: { timeoutMs?: number }) => void;
  info: (text: string, opts?: { timeoutMs?: number }) => void;
};

const FlashContext = createContext<FlashContextType | null>(null);

export const FlashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<FlashItem[]>([]);
  const timers = useRef<Record<string, any>>({});

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback((kind: FlashKind, text: string, opts?: { timeoutMs?: number }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: FlashItem = { id, kind, text };
    setItems((prev) => [item, ...prev].slice(0, 4));
    const ms = opts?.timeoutMs ?? 2500;
    timers.current[id] = setTimeout(() => remove(id), ms);
  }, [remove]);

  const ctx = useMemo<FlashContextType>(() => ({
    push,
    success: (t, o) => push('success', t, o),
    error: (t, o) => push('error', t, o),
    info: (t, o) => push('info', t, o),
  }), [push]);

  return (
    <FlashContext.Provider value={ctx}>
      {children}
      <FlashViewport items={items} onClose={remove} />
    </FlashContext.Provider>
  );
};

export const useFlash = () => {
  const ctx = useContext(FlashContext);
  if (!ctx) throw new Error('useFlash must be used within FlashProvider');
  return ctx;
};

export const FlashViewport: React.FC<{ items: FlashItem[]; onClose: (id: string) => void }> = ({ items, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-2 w-[92vw] max-w-sm">
      {items.map((m) => (
        <div
          key={m.id}
          className={
            'flex items-start gap-2 rounded-md border px-4 py-3 text-sm shadow-sm animate-[fade-in_150ms_ease-out] ' +
            (m.kind === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
             m.kind === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
             'bg-blue-50 text-blue-800 border-blue-200')
          }
        >
          <div className="flex-1">{m.text}</div>
          <button
            aria-label="Close"
            className="text-current/70 hover:text-current"
            onClick={() => onClose(m.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
