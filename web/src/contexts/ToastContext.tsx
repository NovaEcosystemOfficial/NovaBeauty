"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

type ToastType = "success" | "error";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(360px,calc(100vw-32px))] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = toast.type === "success" ? CheckCircle2 : XCircle;

          return (
            <div
              key={toast.id}
              className="flex items-start gap-3 rounded-beauty-lg border border-beauty-border/70 bg-beauty-elevated/95 p-4 text-beauty-text shadow-beauty-floating backdrop-blur"
              role="status"
            >
              <Icon
                className={toast.type === "success" ? "mt-0.5 size-5 text-beauty-success" : "mt-0.5 size-5 text-beauty-danger"}
                aria-hidden="true"
              />
              <p className="min-w-0 flex-1 text-[14px] leading-5">{toast.message}</p>
              <button
                type="button"
                className="grid size-7 shrink-0 place-items-center rounded-full text-beauty-muted transition hover:bg-beauty-card hover:text-beauty-text"
                onClick={() => removeToast(toast.id)}
                aria-label="Chiudi notifica"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast deve essere usato dentro ToastProvider.");
  }

  return context;
}
