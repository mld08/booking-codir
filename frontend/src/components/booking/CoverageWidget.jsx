import React from 'react';
import Card from '../common/Card';

const CoverageWidget = ({ coverage, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-24">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Chargement...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (!coverage) {
    return (
      <Card>
        <div className="flex items-center justify-center h-24 text-gray-400">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-xs">Aucune donnée</p>
          </div>
        </div>
      </Card>
    );
  }

  const percentage = coverage.coverage_rate || 0;
  const distinctRegions = coverage.distinct_regions_count || 0;
  const totalRegions = coverage.total_regions || 14;

  // Déterminer la couleur selon le pourcentage
  const getColorClasses = () => {
    if (percentage >= 80) return {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      text: 'text-green-700',
      bar: 'bg-green-500'
    };
    if (percentage >= 50) return {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      bar: 'bg-blue-500'
    };
    if (percentage >= 30) return {
      gradient: 'from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      bar: 'bg-yellow-500'
    };
    return {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      text: 'text-red-700',
      bar: 'bg-red-500'
    };
  };

  const colors = getColorClasses();

  return (
    <Card>
      <div className="space-y-4">
        {/* Header compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center shadow-md`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Couverture</h3>
              <p className="text-xs text-gray-500">{distinctRegions}/{totalRegions} régions</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${colors.text}`}>
              {percentage.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`${colors.bar} h-2.5 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
          
          {/* Légende compacte */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {distinctRegions} couvertes
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {totalRegions - distinctRegions} restantes
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CoverageWidget;