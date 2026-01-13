import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Building2, User, Shield, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import InputText from '../../components/forms/InputText';
import SelectField from '../../components/forms/SelectField';
import InputNumber from '../../components/forms/InputNumber';
import { SOC_FIELDS, initializeSOCFormData } from '../../config/socFields';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

export default function OfferFormSOC() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [clients, setClients] = useState([]);
    const [engineers, setEngineers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState(initializeSOCFormData());

    useEffect(() => {
        fetchClients();
        fetchEngineers();

        if (id) {
            setEditMode(true);
            fetchOfferData(id);
        }
    }, [id]);

    // Automatically select client from URL query parameter
    useEffect(() => {
        const clientIdFromUrl = searchParams.get('client_id');
        if (clientIdFromUrl && !id && clients.length > 0) {
            const clientExists = clients.some(c => String(c.id) === clientIdFromUrl);
            if (clientExists) {
                setFormData(prev => ({
                    ...prev,
                    client: clientIdFromUrl
                }));
            }
        }
    }, [searchParams, clients, id]);

    const fetchOfferData = async (offerId) => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`soc/${offerId}/`);
            const data = await response.json();

            const initialData = initializeSOCFormData({
                ...data,
                client: String(data.client?.id || data.client || ''),
                engineer: String(data.engineer?.id || data.engineer || '')
            });

            setFormData(initialData);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetchWithAuth('clients/');
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const fetchEngineers = async () => {
        try {
            const response = await fetchWithAuth('engineers/');
            const data = await response.json();
            setEngineers(data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clientOptions = [
        { value: "", label: "Sélectionner le client" },
        ...clients.map(c => ({ value: String(c.id), label: c.company }))
    ];

    const engineerOptions = [
        { value: "", label: "Sélectionner l'ingénieur" },
        ...engineers.map(e => ({ value: String(e.id), label: `${e.first_name} ${e.last_name}` }))
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const method = editMode ? 'PUT' : 'POST';
        const payload = {
            subject: formData.subject,
            client_id: Number(formData.client?.id || formData.client),
            engineer: Number(formData.engineer?.id || formData.engineer),
            status: formData.status
        };

        // Ajouter tous les champs SOC
        const allSOCFields = [
            ...SOC_FIELDS.packs_recurrent,
            ...SOC_FIELDS.packs_oneshot,
            ...SOC_FIELDS.services_additionnels,
            ...SOC_FIELDS.financial
        ];

        allSOCFields.forEach(field => {
            if (field.type === 'checkbox') {
                payload[field.name] = Boolean(formData[field.name]);
            } else if (field.type === 'number') {
                const value = formData[field.name];
                payload[field.name] = value !== '' && value !== null && value !== undefined 
                    ? Number(value) 
                    : 0;
            } else {
                payload[field.name] = formData[field.name] || '';
            }
        });

        try {
            const endpoint = editMode ? `soc/${id}/` : 'soc/';
            const response = await fetchWithAuth(endpoint, {
                method,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                    navigate('/soc/offers');
                }, 500);
            } else {
                const errorData = await response.json();
                alert('Erreur lors de la soumission du formulaire.');
                console.log(`Erreur: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            alert('Erreur de connexion au serveur');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fonction pour rendre un champ en fonction de son type
    const renderField = (field) => {
        // Vérifier les dépendances
        if (field.dependsOn && !formData[field.dependsOn]) {
            return null;
        }

        if (field.type === 'checkbox') {
            return (
                <div key={field.name} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <input
                        type="checkbox"
                        id={field.name}
                        checked={formData[field.name] || false}
                        onChange={(e) => handleInputChange(field.name, e.target.checked)}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500 mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                        <label htmlFor={field.name} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                            {field.label}
                        </label>
                        {field.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {field.description}
                            </p>
                        )}
                    </div>
                </div>
            );
        } else if (field.type === 'number') {
            return (
                <InputNumber
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={(val) => handleInputChange(field.name, val)}
                    step={field.step || "1"}
                    min={field.min || "0"}
                    max={field.max}
                />
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 dark:from-gray-900 dark:via-red-900/10 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 dark:from-gray-900 dark:via-red-900/10 dark:to-gray-900 p-4 sm:p-8">
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                        <Check className="w-6 h-6" />
                        <span className="font-medium">
                            {editMode ? 'Offre SOC mise à jour !' : 'Offre SOC créée !'}
                        </span>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/soc/offers')}
                        className="group text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 
                                 mb-6 flex items-center transition-all duration-200 font-medium"
                    >
                        <div className="p-2 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/20 transition-colors mr-2">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Retour aux offres
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                {editMode ? 'Modifier l\'offre SOC' : 'Créer une nouvelle offre SOC'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {editMode ? 'Modifiez les détails' : 'Configurez les services de cybersécurité'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Informations générales */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-white" />
                            <h2 className="text-xl font-semibold text-white">Informations générales</h2>
                        </div>
                        <div className="p-6 sm:p-8">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <SelectField
                                    label="Client"
                                    name="client"
                                    value={formData.client}
                                    onChange={(val) => handleInputChange('client', val)}
                                    options={clientOptions}
                                    required
                                    icon={Building2}
                                />
                                <SelectField
                                    label="Ingénieur Avant-Vente"
                                    name="engineer"
                                    value={formData.engineer}
                                    onChange={(val) => handleInputChange('engineer', val)}
                                    options={engineerOptions}
                                    icon={User}
                                />
                                <InputText
                                    label="Objet de l'offre"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={(val) => handleInputChange('subject', val)}
                                    placeholder="Ex: Offre Cybersécurité - Audit & SOC"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Packs Récurrents (Mensuel) */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center gap-3">
                            <Shield className="w-6 h-6 text-white" />
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-white">Packs</h2>
                                {/* <p className="text-blue-100 text-sm">Facturation mensuelle</p> */}
                            </div>
                        </div>
                        <div className="p-6 sm:p-8">
                            <div className="space-y-4">
                                {SOC_FIELDS.packs_recurrent.map(field => renderField(field))}
                            </div>
                            <div className="space-y-4">
                                {SOC_FIELDS.packs_oneshot.map(field => renderField(field))}
                            </div>
                        </div>
                    </div>

                    {/* Packs One-Shot */}
                    {/* <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-white" />
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-white">Pack One-Shot</h2>
                                <p className="text-purple-100 text-sm">Paiement unique</p>
                            </div>
                        </div>
                        <div className="p-6 sm:p-8">
                            <div className="space-y-4">
                                {SOC_FIELDS.packs_oneshot.map(field => renderField(field))}
                            </div>
                        </div>
                    </div> */}

                    {/* Services Additionnels */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center gap-3">
                            <Shield className="w-6 h-6 text-white" />
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-white">Services Additionnels</h2>
                                <p className="text-green-100 text-sm">Paiement unique</p>
                            </div>
                        </div>
                        <div className="p-6 sm:p-8">
                            <div className="space-y-4">
                                {SOC_FIELDS.services_additionnels.map(field => renderField(field))}
                            </div>
                        </div>
                    </div>

                    {/* Remise */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-white" />
                            <h2 className="text-xl font-semibold text-white">Remise</h2>
                        </div>
                        <div className="p-6 sm:p-8">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                        La remise s'applique uniquement sur les packs récurrents (Essential et Monitor). 
                                        Elle ne s'applique pas au Pack 360 ni à la Supervision H24.
                                    </p>
                                </div>
                            </div>
                            <div className="max-w-md">
                                {SOC_FIELDS.financial.map(field => renderField(field))}
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Les champs marqués d'un * sont obligatoires</span>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate('/soc/offers')}
                                className="flex-1 sm:flex-none px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                                         font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600
                                         transition-all duration-200"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 
                                         text-white font-semibold rounded-xl shadow-lg
                                         hover:from-red-600 hover:to-red-700 hover:shadow-xl
                                         active:scale-95
                                         disabled:opacity-50 disabled:cursor-not-allowed
                                         transition-all duration-200 flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>{editMode ? 'Mise à jour...' : 'Création...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        <span>{editMode ? 'Mettre à jour' : 'Créer l\'offre'}</span>
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