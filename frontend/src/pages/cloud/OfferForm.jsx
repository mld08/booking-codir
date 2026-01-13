import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Building2, User, Cloud, TrendingUp, Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import InputText from '../../components/forms/InputText';
import SelectField from '../../components/forms/SelectField';
import DynamicField from '../../components/forms/DynamicField';
import { getSolutionFields, getSolutionOptions, initializeFormData } from '../../config/solutionFields';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

export default function OfferForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [clients, setClients] = useState([]);
    const [engineers, setEngineers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedSolution, setSelectedSolution] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        client: '',
        engineer: '',
        solution: ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Quand la solution change, réinitialiser les champs spécifiques
    const handleSolutionChange = (solution) => {
        setSelectedSolution(solution);
        // Réinitialiser le formData avec les nouveaux champs
        const newFormData = initializeFormData(solution, {
            subject: formData.subject,
            client: formData.client,
            engineer: formData.engineer,
            solution: solution
        });
        setFormData(newFormData);
    };

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
            // Only set client if not in edit mode and clients are loaded
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
            const response = await fetchWithAuth(`offers/${offerId}/`);
            const data = await response.json();

            setSelectedSolution(data.solution);

            // Extraire les IDs correctement
            const initialData = initializeFormData(data.solution, {
                ...data,
                client: String(data.client?.id || data.client_id || ''),
                engineer: String(data.engineer?.id || data.engineer_id || '')
            });
            // ✅ Correction ici : remapper les licences si elles existent
            if (data.baas_licenses && Array.isArray(data.baas_licenses)) {
                const licensesField = getSolutionFields(data.solution).find(f => f.name === 'baas_licenses');

                if (licensesField && licensesField.licenses) {
                    const mappedLicenses = data.baas_licenses.map(item => {
                        // Trouver la valeur correspondante dans licensesField.licenses
                        const match = licensesField.licenses.find(
                            l =>
                                l.value.replace(/^baas_license_/, '') === item.license_type ||
                                l.label === item.license_type
                        );
                        return {
                            license_type: match ? match.value : '',
                            quantity: item.quantity || 1
                        };
                    });

                    initialData.baas_licenses = mappedLicenses;
                }
            }

            // ✅ Correction ici : remapper les licences si elles existent
            if (data.draas_licenses && Array.isArray(data.draas_licenses)) {
                const licensesField = getSolutionFields(data.solution).find(f => f.name === 'draas_licenses');

                if (licensesField && licensesField.licenses) {
                    const mappedLicenses = data.draas_licenses.map(item => {
                        // Trouver la valeur correspondante dans licensesField.licenses
                        const match = licensesField.licenses.find(
                            l =>
                                l.value.replace(/^baas_license_/, '') === item.license_type ||
                                l.label === item.license_type
                        );
                        return {
                            license_type: match ? match.value : '',
                            quantity: item.quantity || 1
                        };
                    });

                    initialData.baas_licenses = mappedLicenses;
                }
            }

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

    const clientOptions = [
        { value: "", label: "Sélectionner le client" },
        ...clients.map(c => ({ value: String(c.id), label: c.company }))
    ];

    const engineerOptions = [
        { value: "", label: "Sélectionner l'ingénieur cloud" },
        ...engineers.map(e => ({ value: String(e.id), label: `${e.first_name} ${e.last_name}` }))
    ];

    const solutionOptions = [
        { value: "", label: "Sélectionner la solution d'hébergement" },
        { value: "vmware", label: "VMWARE" },
        { value: "huawei", label: "Huawei" },
        { value: "staas", label: "STaaS" },
        { value: "baas", label: "BaaS" },
        { value: "draas", label: "DRaaS" },
        { value: "office365", label: "Office 365" },
        { value: "colocation", label: "Colocation" }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const method = editMode ? 'PUT' : 'POST';

        const payload = {
            subject: formData.subject,
            solution: formData.solution,
            client_id: Number(formData.client?.id || formData.client),
            engineer_id: Number(formData.engineer?.id || formData.engineer)
        };

        const solutionFields = getSolutionFields(selectedSolution);
        const solutionOptions = getSolutionOptions(selectedSolution);
        solutionFields.forEach(field => {
            if (formData[field.name] !== undefined && formData[field.name] !== '') {
                if (field.type === 'number') {
                    payload[field.name] = Number(formData[field.name]);
                } else if (field.type === 'checkbox') {
                    payload[field.name] = Boolean(formData[field.name]);
                } else if (field.type === 'vms') {
                    // Traiter les VMs
                    payload[field.name] = formData[field.name]
                        .filter(vm => {
                            // Vérifier qu'au moins un champ de la VM est renseigné
                            return Object.values(vm).some(val => val && val !== '' && val !== '0');
                        })
                        .map(vm => {
                            const processedVm = {};
                            field.vmFields.forEach(f => {
                                if (vm[f.name] !== undefined && vm[f.name] !== '') {
                                    processedVm[f.name] = f.type === 'number' ? Number(vm[f.name]) : vm[f.name];
                                }
                            });
                            return processedVm;
                        });
                } else if (field.type === 'licenses') {
                    // Traiter les licences VEEAM
                    payload[field.name] = formData[field.name]
                        .filter(item => item.license_type && item.quantity)
                        .map(item => ({
                            license_type: item.license_type.replace(/^baas_license_/, ''),
                            quantity: Number(item.quantity)
                        }));
                } else if (field.type === 'licenses_office') {
                    // Traiter les licences Microsoft 365
                    payload[field.name] = formData[field.name]
                        .filter(item => item.product_id && item.quantity)
                        .map(item => ({
                            product_id: item.product_id,
                            quantity: Number(item.quantity)
                        }));
                } else if (field.type === 'connections') {
                    // Traiter les connexions
                    console.log(`Traitement ${field.name}:`, formData[field.name]);

                    const connections = (formData[field.name] || [])
                        .filter(item => {
                            const bandwidth = Number(item.bandwidth);
                            const isValid = !Number.isNaN(bandwidth) && bandwidth > 0;
                            console.log(`  - Item:`, item, `Bandwidth: ${bandwidth}, Valid: ${isValid}`);
                            return isValid;
                        })
                        .map(item => ({
                            bandwidth: Number(item.bandwidth)
                        }));

                    console.log(`${field.name} final:`, connections);
                    payload[field.name] = connections;

                } else if (field.type === 'racks') {
                    // Traiter les racks
                    console.log(`Traitement ${field.name}:`, formData[field.name]);

                    const racks = (formData[field.name] || [])
                        .filter(rack => {
                            // Vérifier que le rack a au moins un champ valide
                            const hasValidData = Object.keys(rack).some(key => {
                                const val = Number(rack[key]);
                                return !isNaN(val) && val > 0;
                            });
                            console.log(`  - Rack:`, rack, `Valid: ${hasValidData}`);
                            return hasValidData;
                        })
                        .map(rack => {
                            const processed = {};
                            field.fields.forEach(f => {
                                if (rack[f.name]) {
                                    processed[f.name] = Number(rack[f.name]);
                                }
                            });
                            return processed;
                        });

                    console.log(`${field.name} final:`, racks);
                    payload[field.name] = racks;

                } else {
                    payload[field.name] = formData[field.name];
                }
            } else if (field.type === 'number') {
                payload[field.name] = 0;
            } else if (field.type === 'licenses' || field.type === 'connections' || field.type === 'racks') {
                payload[field.name] = [];
            }
        });

        // Ajouter les options
        solutionOptions.forEach(option => {
            if (formData[option.name] !== undefined && formData[option.name] !== '') {
                if (option.type === 'number') {
                    payload[option.name] = Number(formData[option.name]);
                } else {
                    payload[option.name] = formData[option.name];
                }
            } else if (option.type === 'number') {
                payload[option.name] = 0;
            } 
        });
        // console.log("Licenses avant envoi:", formData.baas_licenses);

        console.log('Payload envoyé:', payload);
        // console.log('Payload envoyé (JSON stringifié):', JSON.stringify(payload, null, 2));

        try {
            const endpoint = editMode ? `offers/${id}/` : 'offers/';
            const response = await fetchWithAuth(endpoint, {
                method,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                    navigate('/cloud/offer');
                }, 500);
            } else {
                const errorData = await response.json();
                alert('Erreur lors de la soumission du formulaire, il manque peut-être des champs obligatoires.');
                console.log(`Erreur: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            alert('Erreur de connexion au serveur');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Obtenir les champs à afficher
    const displayFields = getSolutionFields(selectedSolution);
    const displayOptions = getSolutionOptions(selectedSolution);
    const commonFields = displayFields.filter(f =>
        ['service_days', 'margin_percentage'].includes(f.name)
    );
    const specificFields = displayFields.filter(f =>
        !['service_days', 'margin_percentage'].includes(f.name)
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 p-4 sm:p-8">
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                        <Check className="w-6 h-6" />
                        <span className="font-medium">
                            {editMode ? 'Offre mise à jour !' : 'Offre créée !'}
                        </span>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/cloud/offer')}
                        className="group text-gray-600 hover:text-orange-600 
                                 mb-6 flex items-center transition-all duration-200 font-medium"
                    >
                        <div className="p-2 rounded-lg group-hover:bg-orange-100 transition-colors mr-2">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Retour aux offres
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                {editMode ? 'Modifier l\'offre' : 'Créer une nouvelle offre'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {editMode ? 'Modifiez les détails' : 'Configurez les détails'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Informations générales */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-3">
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
                                    label="Ingénieur Cloud"
                                    name="engineer"
                                    value={formData.engineer}
                                    onChange={(val) => handleInputChange('engineer', val)}
                                    options={engineerOptions}
                                    required
                                    icon={User}
                                />
                                <SelectField
                                    label="Solution d'Hébergement"
                                    name="solution"
                                    value={formData.solution}
                                    onChange={(val) => {
                                        handleInputChange('solution', val);
                                        handleSolutionChange(val);
                                    }}
                                    options={solutionOptions}
                                    required
                                    icon={Cloud}
                                />
                                <InputText
                                    label="Objet de l'offre"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={(val) => handleInputChange('subject', val)}
                                    placeholder="Ex: Appel d'offres"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Caractéristiques spécifiques (affichées seulement si une solution est sélectionnée) */}
                    {selectedSolution && specificFields.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center gap-3">
                                <Cloud className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">
                                    Caractéristiques {selectedSolution.toUpperCase()}
                                </h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {specificFields.map(field => (
                                        <DynamicField
                                            key={field.name}
                                            field={field}
                                            value={formData[field.name]}
                                            onChange={(val) => handleInputChange(field.name, val)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Options supplémentaires (Dropdown) */}
                    {selectedSolution && displayOptions.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowOptions(!showOptions)}
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between gap-3 hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                            >
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-6 h-6 text-white" />
                                    <h2 className="text-xl font-semibold text-white">Options supplémentaires</h2>
                                </div>
                                {showOptions ? (
                                    <ChevronUp className="w-6 h-6 text-white" />
                                ) : (
                                    <ChevronDown className="w-6 h-6 text-white" />
                                )}
                            </button>

                            {showOptions && (
                                <div className="p-6 sm:p-8 border-t border-purple-200">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {displayOptions.map(option => (
                                            <DynamicField
                                                key={option.name}
                                                field={option}
                                                value={formData[option.name]}
                                                onChange={(val) => handleInputChange(option.name, val)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}-

                    {/* Champs communs (Marges) */}
                    {selectedSolution && commonFields.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Marges et Services</h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {commonFields.map(field => (
                                        <DynamicField
                                            key={field.name}
                                            field={field}
                                            value={formData[field.name]}
                                            onChange={(val) => handleInputChange(field.name, val)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Message si aucune solution sélectionnée */}
                    {!selectedSolution && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                            <p className="text-blue-800 font-medium">
                                Veuillez sélectionner une solution d'hébergement pour afficher les champs correspondants
                            </p>
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>Les champs marqués d'un * sont obligatoires</span>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate('/cloud/offer')}
                                className="flex-1 sm:flex-none px-6 py-4 bg-gray-100 text-gray-700 
                                         font-semibold rounded-xl hover:bg-gray-200
                                         transition-all duration-200"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !selectedSolution}
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