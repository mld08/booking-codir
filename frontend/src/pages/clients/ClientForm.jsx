import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Building2, MapPin, Mail, Phone, Sparkles, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../utils/utils';
import InputText from '../../components/forms/InputText';
import SelectField from '../../components/forms/SelectField';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: '',
    country: '',
    email: '',
    phone: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchClientData(id);
    }
  }, [id]);

  const fetchClientData = async (clientId) => {
    try {
      setLoading(true);
      //const response = await fetch(`${API_BASE_URL}clients/${clientId}`);
      const response = await fetchWithAuth(`clients/${clientId}`);
      const data = await response.json();
      setFormData({
        company: data.company || '',
        country: data.country || '',
        email: data.email || '',
        phone: data.phone || ''
      });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de charger les données client');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `clients/${id}/` : `clients/`;

    try {
      // const response = await fetch(url, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/clients');
        }, 500);
      } else {
        const errorData = await response.json();
        console.error('Erreur backend:', errorData);
        alert(`Erreur: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Erreur de connexion au serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 p-4 sm:p-8">
      {/* Notification de succès */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <Check className="w-6 h-6" />
            <span className="font-medium">
              {isEditMode ? 'Client mis à jour avec succès !' : 'Client créé avec succès !'}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/clients')}
            className="group text-gray-600 hover:text-orange-600 
                     mb-6 flex items-center transition-all duration-200 font-medium"
          >
            <div className="p-2 rounded-lg group-hover:bg-orange-100 transition-colors mr-2">
              <ArrowLeft className="w-5 h-5" />
            </div>
            Retour à la liste
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {isEditMode ? 'Modifier le client' : 'Ajouter un client'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditMode ? 'Modifiez les informations du client' : 'Remplissez les informations du client'}
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Informations du client</h2>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <InputText
                label="Nom de l'entreprise"
                name="company"
                value={formData.company}
                onChange={(val) => handleInputChange('company', val)}
                placeholder="Ex: Orange Business Services"
                required
                icon={Building2}
              />
              
              <SelectField
                label="Pays"
                name="country"
                value={formData.country}
                onChange={(val) => handleInputChange('country', val)}
                required
                icon={MapPin}
                options={[
                  { value: '', label: 'Sélectionner un pays' },
                  { value: 'Sénégal', label: 'Sénégal' },
                  { value: 'Mali', label: 'Mali' },
                  { value: 'Côte d\'Ivoire', label: 'Côte d\'Ivoire' },
                  { value: 'Burkina Faso', label: 'Burkina Faso' },
                  { value: 'Guinée', label: 'Guinée' },
                  { value: 'Cameroun', label: 'Cameroun' },
                  { value: 'Gabon', label: 'Gabon' },
                  { value: 'RD Congo', label: 'RD Congo' },
                ]}
              />
              
              <InputText
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(val) => handleInputChange('email', val)}
                placeholder="Ex: contact@orange.sn"
                required
                icon={Mail}
              />
              
              <InputText
                label="Téléphone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(val) => handleInputChange('phone', val)}
                placeholder="Ex: +221 33 869 00 00"
                required
                icon={Phone}
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="bg-gray-50 px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 ">
              <AlertCircle className="w-4 h-4" />
              <span>Les champs marqués d'un * sont obligatoires</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="flex-1 sm:flex-none px-6 py-4 bg-gray-100 text-gray-700 
                         font-semibold rounded-xl hover:bg-gray-200 
                         transition-all duration-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 
                         text-white font-semibold rounded-xl shadow-lg
                         hover:from-orange-600 hover:to-orange-700 hover:shadow-xl
                         active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isEditMode ? 'Mise à jour...' : 'Création...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>{isEditMode ? 'Mettre à jour' : 'Créer le client'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}