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
