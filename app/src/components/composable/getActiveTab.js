import {
  layers_carto,
  layers_carto_monde,
  layers_photo,
  layers_photo_monde,
  otherLayersCartoFrance,
  otherLayersCartoMonde,
  otherLayersPhotoFrance,
} from './baseMap'

/**
 * Retourne les couches de fond (layers) principales à afficher en fonction de l'onglet actif.
 *
 * @param {string} activeTab - Identifiant de l'onglet actif. Valeurs possibles :
 *   - 'cartotheque'
 *   - 'cartotheque_etranger'
 *   - 'phototheque'
 *   - 'phototheque_etranger'
 * @returns {Array<Object>} Liste des couches correspondantes à l'onglet actif.
 */
export function getLayersForActiveTab(activeTab) {
  switch (activeTab) {
    case 'cartotheque':
      return layers_carto
    case 'cartotheque_etranger':
      return layers_carto_monde
    case 'phototheque':
      return layers_photo
    case 'phototheque_etranger':
      return layers_photo_monde
    default:
      return []
  }
}

/**
 * Retourne les couches additionnelles (autres layers) à afficher en fonction de l'onglet actif.
 *
 * @param {string} activeTab - Identifiant de l'onglet actif. Valeurs possibles :
 *   - 'cartotheque'
 *   - 'cartotheque_etranger'
 *   - 'phototheque'
 * @returns {Array<Object>} Liste des couches supplémentaires associées à l'onglet actif.
 */
export function getOtherLayersForActiveTab(activeTab) {
  switch (activeTab) {
    case 'cartotheque':
      return otherLayersCartoFrance
    case 'cartotheque_etranger':
      return otherLayersCartoMonde
    case 'phototheque':
      return otherLayersPhotoFrance
    default:
      return otherLayersCartoFrance
  }
}
