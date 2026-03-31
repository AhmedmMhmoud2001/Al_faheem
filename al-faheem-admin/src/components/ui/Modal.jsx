import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

export default function Modal({ open, onClose, title, children, className = '' }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[100]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 transition duration-150 ease-out data-closed:opacity-0 dark:bg-black/70"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className={`w-full max-w-lg rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 text-[var(--app-card-fg)] shadow-xl transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0 ${className}`}
        >
          {title && (
            <DialogTitle className="text-lg font-black text-[var(--app-card-fg)]">{title}</DialogTitle>
          )}
          <div className={title ? 'mt-4' : ''}>{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
