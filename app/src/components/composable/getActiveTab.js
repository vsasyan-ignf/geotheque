import {
  layers_carto,
  layers_carto_monde,
  layers_photo,
  layers_photo_monde,
  otherLayersCartoFrance,
  otherLayersCartoMonde,
  otherLayersPhotoFrance,
} from './baseMap'

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
