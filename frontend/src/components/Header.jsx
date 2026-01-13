import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const [open, setOpen] = useState(false);
    //const [notificationOpen, setNotificationOpen] = useState(false);
    const dropdownRef = useRef(null);
    //const notificationRef = useRef(null);

    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fermer le menu si on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
            // if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            //     setNotificationOpen(false);
            // }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
            <div className="flex items-center justify-between px-4 sm:px-8 py-3">
                {/* Recherche */}
                <div className="flex-1 max-w-xl">
                    <div className="relative group">
                        
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4 ml-4">

                    {/* Profil utilisateur */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                        >
                            <div className="relative">
                                <img
                                    src="https://ui-avatars.com/api/?name=User+User&background=FF7900&color=fff"
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full ring-2 ring-orange-500/20 group-hover:ring-orange-500/40 transition-all"
                                />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="font-semibold text-gray-800 text-sm">{user.full_name}</p>
                                <p className="text-xs text-gray-500">{user.is_business_developer ? "Business Developer" : ""}</p>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform duration-300 hidden md:block ${open ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {open && (
                            <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* User Info */}
                                <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src="https://ui-avatars.com/api/?name=User+User&background=FF7900&color=fff"
                                            alt="Profile"
                                            className="w-12 h-12 rounded-full ring-2 ring-orange-500/50"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{user?.full_name || 'User'}</p>
                                            <p className="text-sm text-gray-600">{user?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}

                                {/* Déconnexion */}
                                <div className="border-t border-gray-200 py-2">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors group"
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                        <span className="ml-3 font-medium">Déconnexion</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}