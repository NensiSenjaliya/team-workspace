import { X } from 'lucide-react';

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
};

export function Modal({ children, onClose, title }: ModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-label={title}
        className="modal-panel"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button className="icon-btn" type="button" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
