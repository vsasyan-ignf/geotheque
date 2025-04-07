export function getSuffixPhoto(feature) {
    //Sert a retoruner le,les suffixes corespondant a la photo
    let suffix = ' '
    if (
      feature.properties.RÉSOLUTIO == 'undefined' ||
      (feature.RÉSOLUTIO === 0.1 && feature.STYLE == 'Argentique')
    ) {
      suffix += '[O]'
    }
    if (feature.properties.DISPO_INTE === '1') {
      suffix += '[T]'
    }
    if (feature.properties.DISPO_INTE === '2') {
      suffix += '[S]'
    }
    if (feature.properties.ENVELOPPE_ === 1) {
      suffix += '[*]'
    }
    if (feature.properties.IDENTIFIAN === 0) {
      suffix += '[ap]'
    }
    return suffix
  }

export function getEchellePhoto(feature) {
    //Sert a retourner la résolution de la photo
    let echelle = ''

    if (feature.properties.STYLE[0] === 'A') {
      if (feature.properties.RÉSOLUTIO === 0.1) {
        echelle = 'Échelle : Oblique'
      } else {
        echelle = feature.properties.RÉSOLUTIO * 1000
      }
    } else if (feature.properties.STYLE[0] === 'N') {
      echelle = feature.properties.RÉSOLUTIO + ' m'
    } else {
      console.log('probleme getEchellePhoto')
    }
    return echelle
  }