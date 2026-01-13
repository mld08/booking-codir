import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Gift, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Aside({ isCollapsed, setIsCollapsed }) {
    const location = useLocation();
    const pathname = location.pathname;
    const navigate = useNavigate();

    const universeFromRoute = () => {
        if (pathname.includes("/cloud")) {
            return "Cloud";
        }
        return "";
    };

    const navItems = [
        { path: "/admin", icon: Home, label: "Accueil", exact: true },
        { path: "/admin/managers", icon: Users, label: "Managers", includes: true },
        { path: "/admin/commerciaux", icon: Users, label: "Commerciaux", includes: true },
        { path: "/admin/engineers", icon: Users, label: "Ingénieurs", includes: true },
        //{ path: "/admin/offers", icon: Gift, label: "Offres", includes: true }
        //{ path: "/cloud/offer", icon: Gift, label: "Offres", includes: true }
    ];

    const isActive = (item) => {
        if (item.exact) {
            return pathname === item.path;
        }
        if (item.includes) {
            return pathname.includes(item.path);
        }
        return false;
    };

    const handleOfferClick = () => {
        navigate("/cloud/offer");
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
                        <h2 className="text-2xl font-bold text-orange-500">Orange Business</h2>
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
                    className="absolute -right-3 top-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 
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
                    const handleClick = item.label === "Offres" ? handleOfferClick : () => navigate(item.path);

                    return (
                        <button
                            key={item.path}
                            type="button"
                            onClick={handleClick}
                            className={`flex items-center px-4 py-3 mb-2 rounded-lg w-full transition-all duration-200
                                     ${active 
                                         ? 'bg-orange-500 text-white shadow-lg' 
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
                    title={isCollapsed ? "Choisir un univers" : ''}
                >
                    <ArrowLeftRight className={`w-5 h-5 ${!isCollapsed && 'mr-2'}`} />
                    {!isCollapsed && <span>Choisir un univers</span>}
                </button>
            </div>
        </aside>
    );
}