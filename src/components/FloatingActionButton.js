import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";

export default function AddTransactionButton() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemClick = (type) => {
        setIsOpen(false);
        navigate(`/add-transaction?type=${type}`);
    };

    return (
        <div className="relative" ref={menuRef}>
            {isOpen && (
                <div className="absolute top-12 right-0 flex flex-col gap-2 animate-fade-in z-50">
                    <button
                        onClick={() => handleItemClick("income")}
                        className="flex items-center gap-3 px-4 py-3 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 btn-press whitespace-nowrap"
                        data-testid="add-income-button"
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">Income</span>
                    </button>
                    <button
                        onClick={() => handleItemClick("expense")}
                        className="flex items-center gap-3 px-4 py-3 rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-all hover:scale-105 btn-press whitespace-nowrap"
                        data-testid="add-expense-button"
                    >
                        <TrendingDown className="w-5 h-5" />
                        <span className="font-medium">Expense</span>
                    </button>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:shadow-lg btn-press transition-all ${isOpen ? 'rotate-45' : ''}`}
                data-testid="add-transaction-button"
            >
                <Plus className="w-5 h-5" />
            </button>
        </div>
    );
}
