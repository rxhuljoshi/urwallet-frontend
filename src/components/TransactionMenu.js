import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

export default function TransactionMenu({ onEdit, onDelete, isDeleting }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAction = (action) => {
        setIsOpen(false);
        action();
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                data-testid="transaction-menu-button"
                disabled={isDeleting}
            >
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-32 rounded-lg border bg-card shadow-lg animate-scale-in origin-top-right z-50">
                    <button
                        onClick={() => handleAction(onEdit)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors rounded-t-lg"
                        data-testid="edit-menu-item"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => handleAction(onDelete)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-b-lg"
                        data-testid="delete-menu-item"
                        disabled={isDeleting}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
