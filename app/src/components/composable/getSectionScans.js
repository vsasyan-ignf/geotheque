/**
 * Dictionnaire regroupant les différentes collections de scans
 * par grandes zones géographiques ou thématiques.
 *
 * @constant
 * @type {Object<string, string[]>}
 */
const SECTION_SCANS = {
  METROPOLE: [
    'CADASTRE',
    'CASSINI',
    'DEPARTEMENTS',
    'EM_CARTES',
    'EM_MINUTES',
    'FR_100K_A_200K',
    'FR_10K_A_50K',
    'FR_250K_A_600K',
    'FR_2K_A_5K',
    'FR_THEMATIQUE_GEN',
    'FR_THEMATIQUE_LOC',
    'PLANS_DE_VILLE',
    'REGION_PARISIENNE',
    'TOPO_DIVERS',
    'URBANISME',
  ],
  AFRIQUE: [
    'AEF_AOF_TOPOGRAPHIQUE',
    'AFRIQUE_PAYS',
    'ALGERIE_THEMATIQUE',
    'ALGERIE_TOPOGRAPHIQUE',
    'BENIN',
    'CAMEROUN',
    'COMORES_MAURICE',
    'DJIBOUTI',
    'HISTORIQUE',
    'LEVANT',
    'MADAGASCAR',
    'MALI',
    'MANUSCRITS',
    'MAROC_TOPOGRAPHIQUE',
    'REPUBLIQUE_CENTRAFRICAINE',
    'SENEGAL',
    'TCHAD',
    'TOGO',
  ],
  EUROPE: ['BENELUX', 'GRECE', 'ITALIE'],
  AUTRES: [
    'AMERIQUE_CENTRALE',
    'AMERIQUE_SUD',
    'ANTARCTIQUE',
    'DOM_COM',
    'HISTORIQUE',
    'INDOCHINE',
    'INDOCHINE_TOPOGRAPHIQUE',
    'LEVANT',
    'MANUSCRITS',
  ],
}

/**
 * Détermine à quelle section appartient une collection de scans donnée.
 *
 * @param {string} collection - Nom de la collection à rechercher.
 * @returns {string} Nom de la section dans laquelle la collection est classée (ex : 'METROPOLE', 'AFRIQUE', etc.).
 *                   Retourne 'AUTRES' si la collection n'est pas trouvée dans les sections listées.
 */
export const findSectionScan = (collection) => {
  for (const [key, values] of Object.entries(SECTION_SCANS)) {
    if (values.includes(collection)) {
      return key
    }
  }
  return 'AUTRES'
}
