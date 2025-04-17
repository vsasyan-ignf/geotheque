// config.js
const env = process.env.NODE_ENV || 'development'

const params = new URLSearchParams(window.location.search)
console.log(params.get('apikey'))

const config = {
  // environnement de dev
  development: {
    GEOSERVER_URL: 'https://data.geopf.fr/private/wfs/?service=WFS&version=2.0.0',
    MTD_FRANCE_URL: 'http://localhost:8081/Misphot/',
    MTD_MONDE_URL: 'http://localhost:8081/Misphot_ETRANGER/',
    IMG_FRANCE_URL: 'http://localhost:8082/Misphot_Image/',
    IMG_MONDE_URL: 'http://localhost:8082/Misphot_Image_Etranger/',
    IMG_CARTE_URL: 'http://localhost:8082/Cartes/',
    IIPSRV_URL: 'http://localhost:8080',
    IIPSRV_PREFIX_CARTE: '/Cartes/',
    IIPSRV_PREFIX_FRANCE: '/Misphot_Image/',
    IIPSRV_PREFIX_MONDE: '/Misphot_Image_Etranger/',
    APIKEY: params.get('apikey'),
  },

  // environnement de prod
  production: {
    GEOSERVER_URL: 'https://data.geopf.fr/private/wfs/?service=WFS&version=2.0.0',
    MTD_FRANCE_URL: 'http://misphot-srv.ign.fr:8080/',
    MTD_MONDE_URL: 'http://misphot-srv.ign.fr:8081/',
    IMG_FRANCE_URL: '', // non existant pour le moment
    IMG_MONDE_URL: '', // non existant pour le moment
    IMG_CARTES_URL: 'http://dgs1109n013.ign.fr:8081/',
    IIPSRV_URL: 'http://10.128.35.66:8080/',
    IIPSRV_PREFIX_CARTE: '/Carto/Patrimoine/Cartes/',
    IIPSRV_PREFIX_FRANCE: '/Misphot_Image/',
    IIPSRV_PREFIX_MONDE: '/Misphot_Image_Etranger/',
    APIKEY: params.get('apikey'),
  },
}

export default config[env]
