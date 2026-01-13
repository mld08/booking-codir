import { useState } from "react";
import { Outlet } from "react-router-dom";
import Aside from "../components/Aside";
import Header from "../components/Header";

export default function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Barre latérale */}
            <Aside isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Contenu principal */}
            <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                {/* Barre supérieure */}
                <Header />

                {/* Page Dashboard */}
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}