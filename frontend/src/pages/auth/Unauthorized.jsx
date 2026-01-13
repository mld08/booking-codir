import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 dark:from-gray-900 dark:via-red-900/10 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-red-200 dark:border-red-700 overflow-hidden">
          {/* Header avec gradient rouge */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <ShieldAlert className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Accès Refusé
            </h1>
            <p className="text-red-100">
              Vous n'avez pas les permissions nécessaires
            </p>
          </div>

          {/* Contenu */}
          <div className="p-8 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6 border-2 border-red-200 dark:border-red-800">
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-2">
                <strong>Vous n'avez pas accès à cette ressource</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Cette page est réservée aux administrateurs. Si vous pensez qu'il s'agit d'une erreur, 
                veuillez contacter votre administrateur système.
              </p>
            </div>

            {/* Informations supplémentaires */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 <strong>Besoin d'aide ?</strong> Contactez l'équipe support pour obtenir les accès nécessaires.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 
                         text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 
                         transition-all duration-200 font-medium shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 
                         text-white rounded-xl hover:from-orange-600 hover:to-orange-700 
                         transition-all duration-200 font-medium shadow-lg"
              >
                <Home className="w-5 h-5" />
                Retour à l'accueil
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/30 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              🔒 Cette page est protégée par le système d'authentification Orange Business
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}