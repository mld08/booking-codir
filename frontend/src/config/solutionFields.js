// Configuration des champs VM
export const VM_FIELDS = [
  { name: 'name', label: 'Nom de la VM', type: 'text' },
  { name: 'quantity', label: 'Nombre de VM', type: 'number' },
  { name: 'vcpu', label: 'vCPU', type: 'number' },
  { name: 'vgpu', label: 'vGPU', type: 'number' },
  { name: 'ram_gb', label: 'RAM (Go)', type: 'number' },
  { name: 'storage_gb_ssd', label: 'Stockage SSD (Go)', type: 'number' },
  { name: 'storage_gb_hdd', label: 'Stockage HDD (Go)', type: 'number' },
  { name: 'os_win_server_8', label: 'OS Windows serveur (8 Cœurs)', type: 'number' },
  { name: 'os_win_server_12', label: 'OS Windows serveur (12 Cœurs)', type: 'number' },
  { name: 'ip_address', label: 'Adresse IP Publique V4', type: 'number' },
  { name: 'vpn_site', label: 'Tunnel VPN Site to Site', type: 'number' },
  { name: 'vpn_user', label: 'Tunnel VPN Utilisateur', type: 'number' }
];

const VM_FIELDS_HUAWEI = [
  ...VM_FIELDS,
  { name: 'backup_vm_csbs_gb', label: 'Sauvegarde de VM (CSBS) en (Go)', type: 'number' }
];

// Configuration des licences VEEAM
export const VEEAM_LICENSES = [
  { value: 'baas_license_availability_suite_enterprise_plus', label: 'Veeam Availability Suite Enterprise Plus (VBR + Veeam One) - VMs' },
  { value: 'baas_license_availability_suite_enterprise', label: 'Veeam Availability Suite Enterprise (VBR + Veeam One) - VMs' },
  { value: 'baas_license_backup_replication_enterprise_plus', label: 'Veeam Backup & Replication Enterprise Plus - VMs' },
  { value: 'baas_license_backup_replication_enterprise', label: 'Veeam Backup & Replication Enterprise - VMs' },
  { value: 'baas_license_backup_replication_standard', label: 'Veeam Backup & Replication Standard - VMs' },
  { value: 'baas_license_veeam_one', label: 'Veeam ONE - VMs' },
  { value: 'baas_license_cloud_connect_backup_workstation', label: 'Veeam Cloud Connect Backup - Workstations' },
  { value: 'baas_license_cloud_connect_backup_vm', label: 'Veeam Cloud Connect Backup - VMs' },
  { value: 'baas_license_cloud_connect_backup_server', label: 'Veeam Cloud Connect Backup - Servers' },
  { value: 'baas_license_cloud_connect_replication', label: 'Veeam Cloud Connect Replication - VMs' },
  { value: 'baas_license_agent_server', label: 'Veeam Agent Server - Instances' },
  { value: 'baas_license_agent_workstation', label: 'Veeam Agent Workstation - Postes' },
  { value: 'baas_license_nas_backup', label: 'NAS Backup - Unités de 500 GB' },
  { value: 'baas_license_backup_office365', label: 'Veeam Backup for Microsoft Office 365 - Utilisateurs' },
  { value: 'baas_license_backup_entra_id', label: 'Veeam Backup for Entra ID - Packs de 10 utilisateurs' },
  { value: 'baas_license_backup_salesforce', label: 'Veeam Backup for Salesforce - Utilisateurs' },
  { value: 'baas_license_cloud_azure_aws_gcp', label: 'Veeam Backup for Azure, AWS, GCP Cloud - Cloud VMs' },
  { value: 'baas_license_data_cloud_azure_foundation', label: 'Veeam Data Cloud Azure Foundation - TB' },
  { value: 'baas_license_kasten_k10', label: 'Veeam KASTEN K10 - Nodes' },
  { value: 'baas_license_data_cloud_flex', label: 'Veeam Data Cloud Flex - Utilisateurs' },
  { value: 'baas_license_data_cloud_express', label: 'Veeam Data Cloud Express (M365 Backup Storage) - Utilisateurs' },
  { value: 'baas_license_data_cloud_premium', label: 'Veeam Data Cloud Premium (Flex + M365BS) - Utilisateurs' },
  { value: 'baas_license_data_cloud_entra_id', label: 'Veeam Data Cloud for Entra ID - Utilisateurs' },
  { value: 'baas_license_data_cloud_salesforce_advanced', label: 'Veeam Data Cloud for Salesforce Advanced - Utilisateurs' },
  { value: 'baas_license_data_cloud_vault_foundation', label: 'Veeam Data Cloud Vault Foundation - TB' },
  { value: 'baas_license_data_cloud_vault_advanced', label: 'Veeam Data Cloud Vault Advanced - TB' },
  { value: 'baas_license_disaster_recovery_orchestrator', label: 'Veeam Disaster Recovery Orchestrator - VMs' },
  { value: 'baas_license_data_platform_foundation', label: 'Veeam Data Platform Foundation - VMs' },
  { value: 'baas_license_data_platform_advanced', label: 'Veeam Data Platform Advanced - VMs' },
  { value: 'baas_license_data_platform_premium', label: 'Veeam Data Platform Premium - VMs' },
  { value: 'baas_license_availability_nutanix_ahv', label: 'Veeam Availability for Nutanix AHV - VMs' },
  { value: 'baas_license_availability_orchestrator', label: 'Veeam Availability Orchestrator - VMs' },
  { value: 'baas_license_agent_ibm_aix', label: 'Veeam Agent for IBM AIX - Instances' },
  { value: 'baas_license_agent_oracle_solaris', label: 'Veeam Agent for Oracle Solaris - Instances' },
  { value: 'baas_license_management_pack_enterprise_plus', label: 'Veeam Management Pack Enterprise Plus - VMs' }
];

export const OFFICE_LICENSES = [
  { value: 'CFQ7TTC0LH16', label: 'Exchange Online (Plan 1)' },
  { value: 'CFQ7TTC0LH1P', label: 'Exchange Online (Plan 2)' },
  { value: 'CFQ7TTC0LGZT', label: 'Microsoft 365 Apps for enterprise' },
  { value: 'CFQ7TTC0LH18', label: 'Microsoft 365 Business Basic' },
  { value: 'CFQ7TTC0LCHC', label: 'Microsoft 365 Business Premium' },
  { value: 'CFQ7TTC0LDPB', label: 'Microsoft 365 Business Standard' },
  { value: 'CFQ7TTC0LFLX', label: 'Microsoft 365 E3' },
  { value: 'CFQ7TTC0LH1G', label: 'Microsoft 365 Apps for business' },
  { value: 'CFQ7TTC0LFLZ', label: 'Microsoft 365 E5' },
  { value: 'CFQ7TTC0LHS9', label: 'Office 365 Extra File Storage' },
  { value: 'CFQ7TTC0MM8R', label: 'Microsoft Copilot for Microsoft 365' },
  { value: 'CFQ7TTC0MZJF', label: 'Microsoft Teams Enterprise' },
  { value: 'CFQ7TTC0JN4R', label: 'Microsoft Teams Essentials' }
];

// Configuration des options de débit
const BANDWIDTH_OPTIONS = [
  2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
  150, 200
];

export const SOLUTION_OPTIONS = {
  common: [
    {
      name: 'access_description',
      label: 'Spécifications des frais d\'accès',
      type: 'textarea'
    }
    
  ],

  colocation: [
    { name: 'plateau_quantity', label: 'Plateau', type: 'number' },
    { name: 'ats_quantity', label: 'ATS', type: 'number' }
  ],
  office365: [
    {
      name: 'majoration',
      label: 'Majoration (%)',
      type: 'number',
      step: '0.01',
      defaultValue: 2
    },
    {
      name: 'usd_rate_fcfa',
      label: 'Taux de change USD / CFA',
      type: 'number',
      step: '0.01',
      defaultValue: 600
    }
  ],
  baas: [
    {
      name: 'eur_rate_fcfa',
      label: 'Taux de change EUR / CFA',
      type: 'number',
      step: '0.01',
      defaultValue: 650
    }
  ],
  draas: [
    {
      name: 'eur_rate_fcfa',
      label: 'Taux de change EUR / CFA',
      type: 'number',
      step: '0.01',
      defaultValue: 650
    }
  ]
};

// Configuration des champs par solution
export const SOLUTION_FIELDS = {
  common: [
    // Champs communs à toutes les solutions
    { name: 'service_days', label: 'Service Days', type: 'number' },
    { name: 'margin_percentage', label: 'Marge (%)', type: 'number', step: '0.01', defaultValue: 35, min: 35 }
  ],

  vmware: [
    {
      name: 'vms_config',
      label: 'Machines Virtuelles VMware',
      type: 'vms',
      vmFields: VM_FIELDS
    }
  ],

  huawei: [
    {
      name: 'vms_config',
      label: 'Machines Virtuelles Huawei',
      type: 'vms',
      vmFields: VM_FIELDS_HUAWEI
    },
    {
      name: 'storage_s3_gb',
      label: 'Stockage S3 (en Go)',
      type: 'number'
    }
  ],

  staas: [
    { name: 'staas_storage_object_gb', label: 'Stockage object s3 (en Go)', type: 'number' },
    // { name: 'staas_storage_block_gb', label: 'Stockage vidéo (en Go)', type: 'number' },
    // { name: 'staas_storage_file_gb', label: 'Stockage fichiers (en Go)', type: 'number' },
    // { name: 'staas_storage_cold_archive_gb', label: 'Archivage de données à froid (en Go)', type: 'number' },
  ],

  baas: [
    {
      name: 'baas_storage_total_gb',
      label: 'Stockage pour les sauvegardes avec VEEAM (Go)',
      type: 'number'
    },
    {
      name: 'baas_licenses',
      label: 'Licences VEEAM',
      type: 'licenses',
      licenses: VEEAM_LICENSES
    }
  ],

  draas: [
    {
      name: 'draas_storage_total_gb',
      label: 'Stockage pour les sauvegardes avec VEEAM (Go)',
      type: 'number'
    },
    {
      name: 'draas_licenses',
      label: 'Licences VEEAM',
      type: 'licenses',
      licenses: VEEAM_LICENSES
    }
  ],

  office365: [
    {
      name: 'duration_months',
      label: 'Durée (mois)',
      type: 'number'
    },
    {
      name: 'office365_licenses',
      label: 'Licences Microsoft 365',
      type: 'licenses_office',
      licenses: OFFICE_LICENSES
    }
  ],

  colocation: [
    {
      name: 'racks',
      label: 'Configuration des Racks',
      type: 'racks',  // Nouveau type personnalisé
      fields: [
        { name: 'quantity', label: 'Nombre de racks', type: 'number', min: 1 },
        { name: 'space_u', label: 'Espace (U)', type: 'number', min: 1 },
        { name: 'power_kwh', label: 'Puissance (kW)', type: 'number', step: '0.1', min: 0.1 }
      ]
    },
    {
      name: 'internet_links',
      label: 'Liaisons Internet',
      type: 'connections',
      maxConnections: 4,
      bandwidthOptions: BANDWIDTH_OPTIONS,
      unit: 'Mbps'
    },
    {
      name: 'ip_links',
      label: 'Liaisons IP',
      type: 'connections',
      maxConnections: 4,
      bandwidthOptions: BANDWIDTH_OPTIONS,
      unit: 'Mbps'
    }
  ]
};

// Helper pour obtenir tous les champs d'une solution
export const getSolutionFields = (solution) => {
  if (!solution) return [];
  // Cas spécial pour VMware : exclure le champ 'margin_percentage'
  if (solution === 'huawei') {
    return [
      ...SOLUTION_FIELDS.common.filter(field => field.name !== 'margin_percentage'),
      ...(SOLUTION_FIELDS[solution] || [])
    ];
  }
  return [
    ...SOLUTION_FIELDS.common,
    ...(SOLUTION_FIELDS[solution] || [])
  ];
};

// Helper pour obtenir les options d'une solution
export const getSolutionOptions = (solution) => {
  if (!solution) return [];
  return [
    ...SOLUTION_OPTIONS.common,
    ...(SOLUTION_OPTIONS[solution] || [])
  ];
};

// Helper pour initialiser le formData avec les champs appropriés
export const initializeFormData = (solution, existingData = {}) => {
  const fields = getSolutionFields(solution);
  const options = getSolutionOptions(solution);

  const formData = {
    subject: existingData.subject || '',
    client: existingData.client || '',
    engineer: existingData.engineer || '',
    solution: solution || ''
  };

  fields.forEach(field => {
    if (field.type === 'licenses' || field.type === 'licenses_office') {
      // Initialiser les licences comme un tableau
      formData[field.name] = existingData[field.name]?.length
        ? existingData[field.name]
        : [{ license_type: '', quantity: 1 }];
    } else if (field.type === 'vms') {
      // Initialiser les VMs comme un tableau
      formData[field.name] = existingData[field.name]?.length
        ? existingData[field.name]
        : [{}];
    } else if (field.type === 'connections') {
      // Initialiser les connexions comme un tableau
      formData[field.name] = existingData[field.name] || [];
    } else if (field.type === 'racks') {
      // Initialiser les racks comme un tableau
      formData[field.name] = existingData[field.name] || [];
    } else {
      formData[field.name] = existingData[field.name] || field.defaultValue || '';
    }
  });

  // Initialiser les options
  options.forEach(option => {
    formData[option.name] = existingData[option.name] || option.defaultValue || '';
  });

  return formData;
};
