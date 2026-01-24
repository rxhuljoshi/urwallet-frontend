import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { User, Settings, LogOut } from "lucide-react";

export default function ProfileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemClick = (action) => {
        setIsOpen(false);
        action();
    };

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="btn-press w-10 h-10 rounded-full"
                data-testid="profile-menu-button"
            >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                </div>
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-card shadow-lg animate-scale-in origin-top-right z-50">
                    <div className="px-3 py-2 border-b">
                        <p className="text-sm font-medium truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                        <button
                            onClick={() => handleItemClick(() => navigate("/profile"))}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                            <User className="w-4 h-4" />
                            Profile
                        </button>
                        <button
                            onClick={() => handleItemClick(() => navigate("/settings"))}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>
                        <div className="border-t my-1" />
                        <button
                            onClick={() => handleItemClick(logout)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            data-testid="logout-menu-item"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
