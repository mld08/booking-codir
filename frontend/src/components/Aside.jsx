import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Gift, ArrowLeftRight, ChevronLeft, ChevronRight, Settings, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Aside({ isCollapsed, setIsCollapsed }) {
    const location = useLocation();
    const pathname = location.pathname;
    const navigate = useNavigate();
    const { user } = useAuth();

    // Déterminer l'univers actuel et le sauvegarder
    const getCurrentUniverse = () => {
        // Si on est clairement dans un univers, le sauvegarder
        if (pathname.includes("/cloud")) {
            localStorage.setItem('currentUniverse', 'cloud');
            return "cloud";
        }
        if (pathname.includes("/soc")) {
            localStorage.setItem('currentUniverse', 'soc');
            return "soc";
        }
        
        // Si on est sur /clients ou autre, récupérer l'univers sauvegardé
        const savedUniverse = localStorage.getItem('currentUniverse');
        return savedUniverse || "cloud"; // Par défaut cloud
    };

    const currentUniverse = getCurrentUniverse();

    const universeFromRoute = () => {
        if (currentUniverse === "cloud") {
            return "Cloud";
        } else if (currentUniverse === "soc") {
            return "Cybersécurité";
        }
        return "";
    };

    // Navigation items pour Cloud
    const cloudNavItems = [
        { path: "/cloud", icon: Home, label: "Accueil", exact: true, universe: "cloud" },
        { path: "/clients", icon: Users, label: "Clients", includes: true, universe: "cloud" },
        { path: "/cloud/offer", icon: Gift, label: "Offres", includes: true, universe: "cloud" },
        { path: "/cloud/gestion-prix", icon: Settings, label: "Gestion Prix", includes: true, universe: "cloud" },
    ];

    // Navigation items pour SOC
    const socNavItems = [
        { path: "/soc", icon: Home, label: "Accueil", exact: true, universe: "soc" },
        { path: "/clients", icon: Users, label: "Clients", includes: true, universe: "soc" },
        { path: "/soc/offers", icon: Shield, label: "Offres", includes: true, universe: "soc" },
        { path: "/soc/gestion-prix", icon: Settings, label: "Gestion Prix", includes: true, universe: "soc" },
    ];

    // Sélectionner les items selon l'univers
    const navItems = currentUniverse === "soc" ? socNavItems : cloudNavItems;

    const isActive = (item) => {
        // Pour /clients, actif si on est sur /clients et dans le bon univers
        if (item.path === "/clients") {
            return pathname.includes("/clients") && item.universe === currentUniverse;
        }
        
        if (item.exact) {
            return pathname === item.path;
        }
        if (item.includes) {
            return pathname.includes(item.path);
        }
        return false;
    };

    const handleNavClick = (item) => {
        // Gestion spéciale pour "Accueil" si admin
        if (user.is_admin === true && item.label === "Accueil") {
            navigate("/admin");
            return;
        }

        // Navigation selon l'univers
        if (item.label === "Offres") {
            if (currentUniverse === "soc") {
                navigate("/soc/offers");
            } else {
                navigate("/cloud/offer");
            }
        } else {
            navigate(item.path);
        }
    };

    return (
        <aside 
            className={`fixed left-0 top-0 h-full bg-gray-900 text-white z-50 transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Logo */}
            <div className="p-6 border-b border-gray-800 relative">
                {!isCollapsed ? (
                    <>
                        <h2 className="text-2xl font-bold text-orange-50">Orange Business</h2>
                        <p className="text-sm text-gray-400 mt-1">{universeFromRoute()}</p>
                    </>
                ) : (
                    <div className="flex justify-center">
                        <img src="/Orange.png" alt="Logo" className="w-8 h-8"/>
                    </div>
                )}
                
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-8 bg-orange-50 hover:bg-orange-600 text-white rounded-full p-1.5 
                             shadow-lg transition-all duration-200 hover:scale-110"
                    title={isCollapsed ? "Agrandir" : "Réduire"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    
                    return (
                        <button
                            key={item.path + item.universe}
                            type="button"
                            onClick={() => handleNavClick(item)}
                            className={`flex items-center px-4 py-3 mb-2 rounded-lg w-full transition-all duration-200
                                     ${active 
                                         ? 'bg-orange-50 text-white shadow-lg' 
                                         : 'hover:bg-gray-800 text-gray-300'
                                     } ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <Icon className={`w-5 h-5 ${!isCollapsed && 'mr-3'}`} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* Changer d'univers */}
            <div className="absolute bottom-4 left-4 right-4">
                <button
                    onClick={() => navigate("/")}
                    className={`w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg 
                             transition-all duration-200 flex items-center ${
                                 isCollapsed ? 'justify-center' : ''
                             }`}
                    title={isCollapsed ? "Changer d'univers" : ''}
                >
                    <ArrowLeftRight className={`w-5 h-5 ${!isCollapsed && 'mr-2'}`} />
                    {!isCollapsed && <span>Changer d'univers</span>}
                </button>
            </div>
        </aside>
    );
}