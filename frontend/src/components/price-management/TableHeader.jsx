export default function TableHeader({ activeTab }) {
    const headers = {
        'prices': ['Nom', 'Clé', 'Solution', 'Catégorie', 'Valeur', 'Unité', 'Statut', 'Actions'],
        'categories': ['Nom', 'Code', 'Description', 'Ordre', 'Prix associés', 'Statut', 'Actions'],
        'exchange-rates': ['Source', 'Cible', 'Taux', 'Date effective', 'Statut', 'Actions'],
        'veeam-licenses': ['Type', 'Label', 'Unité', 'Points', 'Ordre', 'Statut', 'Actions'],
        'office365-products': ['ID Produit', 'Nom', 'Prix USD/an', 'Unité', 'Ordre', 'Statut', 'Actions'],
        'bandwidth-prices': ['Type', 'Débit (Mbps)', 'Prix (FCFA)', 'Statut', 'Actions']
    };

    return (
        <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
                {headers[activeTab]?.map((header, index) => (
                    <th
                        key={index}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                        {header}
                    </th>
                ))}
            </tr>
        </thead>
    );
}