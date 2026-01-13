import React, { useState, useRef } from 'react';
import { getWeekText } from '../../utils/dateUtils';
import Card from '../common/Card';

const BookingGrid = ({ regions, year, onCellClick, weekAvailability = {}, selectedRegion = null, currentUserEmail = null, isAdmin = false, userWeeklyBookings = new Set() }) => {
    const [hoveredCell, setHoveredCell] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const gridRef = useRef(null);

    const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

    const displayRegions = selectedRegion
        ? regions.filter(r => r.id === selectedRegion)
        : regions;

    const handleCellClick = (region, week) => {
        const key = `${region.id}-${week}`;
        const isReserved = weekAvailability[key];

        // NOUVEAU : Vérifier si cette semaine est déjà réservée par l'utilisateur sur un autre axe
        const isWeekBookedByUser = !isAdmin && userWeeklyBookings.has(week);
        const isThisRegionBookedByMe = isReserved === currentUserEmail;

        // Bloquer si : déjà réservé OU (semaine réservée ailleurs ET ce n'est pas cette région)
        if (!isReserved && !isWeekBookedByUser && onCellClick) {
            onCellClick(region, week);
        }
    };


    const handleMouseEnter = (e, region, week) => {
        const rect = e.target.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
        setHoveredCell({ region: region.name, week });
    };

    const handleMouseLeave = () => {
        setHoveredCell(null);
    };

    // Déterminer si c'est ma réservation ou celle d'un autre
    const isMyBooking = (bookedBy) => {
        if (isAdmin) return true;
        if (!bookedBy || bookedBy === true) return false;
        return bookedBy === currentUserEmail;
    };

    return (
        <Card title="📅 Planification des Missions">
            {/* Légende améliorée avec 3 états */}
            <div className="mb-6 flex flex-wrap items-center gap-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-gray-600">S</span>
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-gray-800">Disponible</span>
                        <p className="text-xs text-gray-600">Cliquez pour réserver</p>
                    </div>
                </div>

                {!isAdmin && (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-gray-800">Ma réservation</span>
                                <p className="text-xs text-gray-600">Réservé par moi</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-gray-800">Autre directeur</span>
                                <p className="text-xs text-gray-600">Déjà réservé</p>
                            </div>
                        </div>

                        {/* NOUVEAU : Indicateur de semaine déjà réservée ailleurs */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center shadow-md">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-gray-800">Semaine occupée</span>
                                <p className="text-xs text-gray-600">Déjà réservée sur un autre axe</p>
                            </div>
                        </div>
                    </>
                )}

                {isAdmin && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-gray-800">Réservé</span>
                            <p className="text-xs text-gray-600">Toutes les réservations</p>
                        </div>
                    </div>
                )}

                <div className="ml-auto flex items-center gap-2 text-xs text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Survolez une semaine pour voir les détails
                </div>
            </div>

            {/* Grille améliorée */}
            <div className="overflow-x-auto" ref={gridRef}>
                <div className="inline-block min-w-full">
                    {/* En-tête des trimestres */}
                    <div className="flex border-b-2 border-gray-300 mb-3">
                        <div className="w-60 flex-shrink-0"></div>
                        <div className="flex-1 grid grid-cols-4 gap-2">
                            {[
                                { label: 'Trimestre 1', range: 'S1-S13', color: 'from-orange-400 to-orange-500' },
                                { label: 'Trimestre 2', range: 'S14-S26', color: 'from-green-500 to-green-600' },
                                { label: 'Trimestre 3', range: 'S27-S39', color: 'from-yellow-500 to-yellow-600' },
                                { label: 'Trimestre 4', range: 'S40-S52', color: 'from-red-500 to-red-600' }
                            ].map((quarter, idx) => (
                                <div
                                    key={idx}
                                    className={`text-center bg-gradient-to-r ${quarter.color} text-white font-bold text-sm py-3 rounded-t-lg shadow-md`}
                                >
                                    <div>{quarter.label}</div>
                                    <div className="text-xs opacity-90">{quarter.range}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lignes des régions */}
                    {displayRegions.map((region, regionIndex) => (
                        <div
                            key={region.id}
                            className={`flex items-center border-b border-gray-200 py-3 transition-all duration-200 ${regionIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                } hover:bg-blue-50`}
                        >
                            {/* Nom de la région */}
                            <div className="w-60 flex-shrink-0 pr-4 flex items-center gap-3 sticky left-0 z-20 bg-white">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center shadow-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-gray-800 text-sm">{region.name}</span>
                            </div>

                            {/* Cellules des semaines avec couleurs différentes */}
                            <div className="flex-1 flex gap-1">
                                {weeks.map((week) => {
                                    const key = `${region.id}-${week}`;
                                    const bookedBy = weekAvailability[key];
                                    const isReserved = !!bookedBy;
                                    const isMine = isReserved && isMyBooking(bookedBy);
                                    
                                    // NOUVEAU : Vérifier si cette semaine est réservée ailleurs par l'utilisateur
                                    const isWeekBookedByUserElsewhere = !isAdmin && 
                                                                         userWeeklyBookings.has(week) && 
                                                                         bookedBy !== currentUserEmail;

                                    return (
                                        <button
                                            key={week}
                                            className={`
                                                relative w-7 h-7 rounded-lg text-xs font-bold transition-all duration-200
                                                ${isWeekBookedByUserElsewhere
                                                    ? 'bg-gray-300 border-2 border-gray-400 text-gray-600 cursor-not-allowed opacity-70'
                                                    : isReserved
                                                        ? isMine
                                                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md cursor-not-allowed'
                                                            : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md cursor-not-allowed'
                                                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:scale-125 hover:shadow-lg hover:z-10 cursor-pointer'
                                                }
                                            `}
                                            onClick={() => handleCellClick(region, week)}
                                            onMouseEnter={(e) => handleMouseEnter(e, region, week)}
                                            onMouseLeave={handleMouseLeave}
                                            disabled={isWeekBookedByUserElsewhere || isReserved}
                                        >
                                            {isWeekBookedByUserElsewhere ? (
                                                <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                </svg>
                                            ) : isReserved ? (
                                                isMine ? (
                                                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                )
                                            ) : (
                                                <span>{week}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tooltip avec affichage du directeur */}
            {hoveredCell && (
                <div
                    className="fixed pointer-events-none z-50 animate-fadeIn"
                    style={{
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl border-2 border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-bold text-sm">{hoveredCell.region}</span>
                        </div>
                        <div className="text-xs text-gray-300">
                            {getWeekText(year, hoveredCell.week)}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700">
                            {(() => {
                                const regionId = regions.find(r => r.name === hoveredCell.region)?.id;
                                const bookedBy = weekAvailability[`${regionId}-${hoveredCell.week}`];
                                const isWeekBookedElsewhere = !isAdmin && 
                                                               userWeeklyBookings.has(hoveredCell.week) && 
                                                               bookedBy !== currentUserEmail;

                                // NOUVEAU : Afficher si la semaine est réservée ailleurs
                                if (isWeekBookedElsewhere) {
                                    return <span className="text-xs font-semibold text-gray-400">✗ Semaine déjà réservée sur un autre axe</span>;
                                }

                                if (bookedBy && bookedBy !== true) {
                                    // Pour l'admin, toujours afficher l'email du directeur
                                    if (isAdmin) {
                                        return (
                                            <div>
                                                <span className="text-xs font-semibold text-green-400">✗ Réservé par :</span>
                                                <div className="mt-1 text-xs text-yellow-300 font-semibold">{bookedBy}</div>
                                            </div>
                                        );
                                    }

                                    // Pour les directeurs, vérifier si c'est leur réservation
                                    const isMine = isMyBooking(bookedBy);
                                    return (
                                        <div>
                                            <span className={`text-xs font-semibold ${isMine ? 'text-green-400' : 'text-orange-400'}`}>
                                                {isMine ? '✓ Ma réservation' : '✗ Réservé par :'}
                                            </span>
                                            {!isMine && (
                                                <div className="mt-1 text-xs text-yellow-300 font-semibold">{bookedBy}</div>
                                            )}
                                        </div>
                                    );
                                } else if (bookedBy) {
                                    return <span className="text-xs font-semibold text-orange-400">✗ Déjà réservé</span>;
                                } else {
                                    return <span className="text-xs font-semibold text-green-400">✓ Disponible</span>;
                                }
                            })()}
                        </div>
                    </div>
                    <div className="w-3 h-3 bg-gray-900 border-r-2 border-b-2 border-gray-700 transform rotate-45 mx-auto -mt-1.5"></div>
                </div>
            )}

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-900">
                                {Object.keys(weekAvailability).length}
                            </p>
                            <p className="text-sm text-blue-700">Semaines réservées</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-900">
                                {(15*7) - Object.keys(weekAvailability).length}
                            </p>
                            <p className="text-sm text-green-700">Semaines disponibles</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-900">
                                {((Object.keys(weekAvailability).length / (displayRegions.length * 52)) * 100).toFixed(1)}%
                            </p>
                            <p className="text-sm text-orange-700">Taux d'occupation</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default BookingGrid;
