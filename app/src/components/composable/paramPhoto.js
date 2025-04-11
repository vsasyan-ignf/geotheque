/**
 * Retourne un suffixe basé sur les propriétés d'une entité de type photo.
 * Sert à construire une chaîne indiquant certaines caractéristiques comme :
 * [O] = oblique argentique, [T] = téléchargeable, [S] = seulement sur site, [*] = enveloppe dispo, [ap] = sans identifiant.
 *
 * @param {Object} feature - L'entité contenant les métadonnées de la photo.
 * @param {Object} feature.properties - Objet contenant les propriétés de la photo.
 * @param {number} [feature.properties.resolutio] - Résolution de la photo (par ex. 0.1 pour oblique).
 * @param {string} [feature.properties.style] - Type de la photo, ex: "Argentique" ou "Numérique".
 * @param {string|number} [feature.properties.dispo_inte] - Disponibilité (1 = téléchargement, 2 = sur site).
 * @param {number} [feature.properties.enveloppe_] - Indique la présence d'une enveloppe.
 * @param {number} [feature.properties.identifian] - Identifiant (0 si absent).
 * @returns {string} Une chaîne de suffixes à afficher avec la photo.
 */

export function getSuffixPhoto(feature) {
  //Sert a retoruner le,les suffixes corespondant a la photo
  let suffix = ' '
  if (
    feature.properties.resolutio == 'undefined' ||
    (feature.resolutio === 0.1 && feature.style == 'Argentique')
  ) {
    suffix += '[O]'
  }
  if (feature.properties.dispo_inte === '1') {
    suffix += '[T]'
  }
  if (feature.properties.dispo_inte === '2') {
    suffix += '[S]'
  }
  if (feature.properties.enveloppe_ === 1) {
    suffix += '[*]'
  }
  if (feature.properties.identifian === 0) {
    suffix += '[ap]'
  }
  return suffix
}

/**
 * Calcule et retourne une chaîne indiquant l'échelle ou la résolution de la photo.
 *
 * - Si style commence par "A" (argentique) et résolution = 0.1 → indique "Échelle : Oblique"
 * - Si style commence par "A" mais autre résolution → convertit en échelle (x1000)
 * - Si style commence par "N" (numérique) → affiche la résolution en mètres
 * - Sinon, log une erreur console.
 *
 * @param {Object} feature - L'entité contenant les métadonnées de la photo.
 * @param {Object} feature.properties - Objet contenant les propriétés de la photo.
 * @param {string} feature.properties.style - Le style de la photo (premier caractère utilisé).
 * @param {number} feature.properties.resolutio - Résolution en kilomètres ou mètres selon le style.
 * @returns {string} Une chaîne lisible représentant l'échelle ou la résolution.
 */

export function getEchellePhoto(feature) {
  //Sert a retourner la résolution de la photo
  let echelle = ''

  if (feature.properties.style[0] === 'A') {
    if (feature.properties.resolutio === 0.1) {
      echelle = 'Échelle : Oblique'
    } else {
      echelle = feature.properties.resolutio * 1000
    }
  } else if (feature.properties.style[0] === 'N') {
    echelle = feature.properties.resolutio + ' m'
  } else {
    console.log('probleme getEchellePhoto')
  }
  return echelle
}
