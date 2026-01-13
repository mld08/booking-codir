import { useNavigate } from "react-router-dom";
import { Cloud, Wifi, Smartphone, Briefcase, Network, Shield } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    function handleClick(universe) {
        if (universe === "cloud") {
            navigate("/cloud");
        } else if (universe === "soc") {
            navigate("/soc");
        } else if (universe === "mobile") {
            navigate("/mobile");
        } else if (universe === "services") {
            navigate("/services");
        } else if (universe === "integration") {
            navigate("/integration");
        }
    }

    const universes = [
        {
            id: 'cloud',
            title: 'Cloud',
            description: 'Infrastructure cloud, hébergement, SaaS',
            icon: Cloud,
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            id: 'soc',
            title: 'Cybersécurité',
            description: 'Solutions de sécurité, SOC',
            icon: Shield,
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            gradient: 'from-red-500 to-red-600'
        },
        // {
        //     id: 'connectivity',
        //     title: 'Connectivité',
        //     description: 'Solutions réseau, fibre optique, MPLS, SD-WAN',
        //     icon: Wifi,
        //     bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        //     iconColor: 'text-orange-600 dark:text-orange-400',
        //     gradient: 'from-orange-500 to-orange-600'
        // },
        // {
        //     id: 'mobile',
        //     title: 'Forfait Mobile',
        //     description: 'Forfaits entreprise, solutions mobiles professionnelles',
        //     icon: Smartphone,
        //     bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        //     iconColor: 'text-purple-600 dark:text-purple-400',
        //     gradient: 'from-purple-500 to-purple-600'
        // },
        // {
        //     id: 'services',
        //     title: 'Services Pro',
        //     description: 'Support technique, maintenance, consulting IT',
        //     icon: Briefcase,
        //     bgColor: 'bg-green-100 dark:bg-green-900/30',
        //     iconColor: 'text-green-600 dark:text-green-400',
        //     gradient: 'from-green-500 to-green-600'
        // },
        {
            id: 'integration',
            title: 'Intégration',
            description: 'Intégration système, migration, déploiement',
            icon: Network,
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            gradient: 'from-indigo-500 to-indigo-600'
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="max-w-7xl w-full">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
                        Plateforme de Simulation d'Offres IT
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Choisissez un univers pour commencer
                    </p>
                </div>

                {/* Grille des univers */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {universes.map((universe) => {
                        const IconComponent = universe.icon;
                        return (
                            <div
                                key={universe.id}
                                onClick={() => handleClick(universe.id)}
                                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl 
                                         border-2 border-gray-100 dark:border-gray-700 hover:border-orange-500 
                                         dark:hover:border-orange-500 transition-all duration-300 cursor-pointer 
                                         overflow-hidden transform hover:-translate-y-1"
                            >
                                <div className="p-8">
                                    <div className="text-center">
                                        {/* Icône */}
                                        <div className={`w-20 h-20 ${universe.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 
                                                      group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent className={`w-10 h-10 ${universe.iconColor}`} />
                                        </div>

                                        {/* Titre */}
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 
                                                     group-hover:text-orange-600 dark:group-hover:text-orange-400 
                                                     transition-colors duration-200">
                                            {universe.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-gray-600 dark:text-gray-400 mb-6 min-h-[3rem]">
                                            {universe.description}
                                        </p>

                                        {/* Bouton */}
                                        <button 
                                            className={`w-full bg-gradient-to-r ${universe.gradient} text-white px-6 py-3 
                                                     rounded-xl font-semibold shadow-md
                                                     hover:shadow-xl transform group-hover:scale-105 
                                                     transition-all duration-200 
                                                     flex items-center justify-center gap-2`}
                                        >
                                            <span>Accéder</span>
                                            <svg 
                                                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Effet de brillance au survol */}
                                <div className="h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent 
                                              opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                </div>
                            </div>
                        );
                    })}
                </div>

                
            </div>
        </div>
    );
}