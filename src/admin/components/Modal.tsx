import React from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  maxWidthClass?: string;
};

const Modal: React.FC<ModalProps> = ({ open, title, children, onClose, footer, maxWidthClass }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative min-h-full flex items-start sm:items-center justify-center">
        <div className={`relative w-full ${maxWidthClass || 'max-w-2xl'} rounded-2xl bg-white shadow-2xl ring-1 ring-black/5`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100">✕</button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4 border-t border-gray-200 bg-gray-50/70 flex justify-end gap-2">{footer}</div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
