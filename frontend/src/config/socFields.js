// Configuration des champs SOC (Cybersécurité)

export const SOC_FIELDS = {
  // Packs Récurrents (Mensuel)
  packs_recurrent: [
    { 
      name: 'pack_essential', 
      label: 'Pack Secure Essential', 
      type: 'checkbox',
      category: 'recurring',
      description: 'Pack de base avec licences mensuelles'
    },
    { 
      name: 'licences_essential', 
      label: 'Nombre de licences Essential', 
      type: 'number',
      dependsOn: 'pack_essential',
      category: 'recurring',
      min: 1
    },
    { 
      name: 'pack_monitor', 
      label: 'Pack Secure Monitor', 
      type: 'checkbox',
      category: 'recurring',
      description: 'Pack de monitoring avancé'
    },
    { 
      name: 'licences_monitor', 
      label: 'Nombre de licences Monitor', 
      type: 'number',
      dependsOn: 'pack_monitor',
      category: 'recurring',
      min: 1
    }
  ],

  // Packs One-Shot (Paiement Unique)
  packs_oneshot: [
    { 
      name: 'pack_360', 
      label: 'Pack Secure 360', 
      type: 'checkbox',
      category: 'oneshot',
      description: 'Pack complet de sécurité (paiement unique)'
    }
  ],

  // Services Additionnels (One-Shot)
  services_additionnels: [
    { 
      name: 'supervision_h24', 
      label: 'Supervision H24', 
      type: 'checkbox',
      category: 'oneshot',
      description: 'Supervision 24h/24 et 7j/7'
    },
    { 
      name: 'scan_vulnerability', 
      label: 'Scan de vulnérabilité', 
      type: 'checkbox',
      category: 'oneshot',
      description: 'Analyse des vulnérabilités système'
    },
    { 
      name: 'assets_scan', 
      label: 'Nombre d\'assets à scanner', 
      type: 'number',
      dependsOn: 'scan_vulnerability',
      category: 'oneshot',
      min: 1
    },
    { 
      name: 'pentest', 
      label: 'Test d\'intrusion (Pentest)', 
      type: 'checkbox',
      category: 'oneshot',
      description: 'Test de pénétration système'
    },
    { 
      name: 'audit_security', 
      label: 'Audit de sécurité', 
      type: 'checkbox',
      category: 'oneshot',
      description: 'Audit complet de la sécurité'
    },
    { 
      name: 'formation', 
      label: 'Formation / Sensibilisation', 
      type: 'checkbox',
      category: 'oneshot',
      description: 'Formation du personnel à la cybersécurité'
    },
    { 
      name: 'days_formation', 
      label: 'Jours de formation supplémentaires', 
      type: 'number',
      dependsOn: 'formation',
      category: 'oneshot',
      min: 0,
      defaultValue: 0
    }
  ],

  // Champs financiers
  financial: [
    { 
      name: 'discount_percentage', 
      label: 'Remise (%)', 
      type: 'number',
      step: '0.01',
      max: 20,
      min: 0,
      defaultValue: 0,
      description: 'Remise appliquée uniquement sur les packs récurrents (max 20%)'
    }
  ]
};

// Helper pour obtenir tous les champs SOC
export const getSOCFields = () => {
  return [
    ...SOC_FIELDS.packs_recurrent,
    ...SOC_FIELDS.packs_oneshot,
    ...SOC_FIELDS.services_additionnels,
    ...SOC_FIELDS.financial
  ];
};

// Helper pour obtenir les champs par catégorie
export const getSOCFieldsByCategory = (category) => {
  const allFields = getSOCFields();
  return allFields.filter(field => field.category === category);
};

// Helper pour initialiser le formData SOC
export const initializeSOCFormData = (existingData = {}) => {
  const formData = {
    subject: existingData.subject || '',
    client: existingData.client || '',
    engineer: existingData.engineer || '',
    status: existingData.status || 'pending'
  };

  const allFields = getSOCFields();
  allFields.forEach(field => {
    if (field.type === 'checkbox') {
      formData[field.name] = existingData[field.name] !== undefined 
        ? existingData[field.name] 
        : false;
    } else if (field.type === 'number') {
      formData[field.name] = existingData[field.name] !== undefined 
        ? existingData[field.name] 
        : (field.defaultValue !== undefined ? field.defaultValue : '');
    } else {
      formData[field.name] = existingData[field.name] || field.defaultValue || '';
    }
  });

  return formData;
};