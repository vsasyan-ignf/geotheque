// config.js
const env = process.env.NODE_ENV || 'development'

const config = {
  // environnement de dev
  development: {
    COMMUNE_URL: 'https://geo.api.gouv.fr/communes',
    DEPARTEMENT_URL: 'https://geo.api.gouv.fr/departements',
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org',
    GEOSERVER_URL: 'http://localhost:8088/geoserver',
    MTD_FRANCE_URL: 'http://localhost:8081/Misphot/',
    MTD_MONDE_URL: 'http://localhost:8081/Misphot_ETRANGER/',
    IMG_FRANCE_URL: 'http://localhost:8082/Misphot_Image',
    IMG_MONDE_URL: 'http://localhost:8082/Misphot_Image_Etranger',
    IMG_CARTE_URL: 'http://localhost:8082/Cartes/',
    IIPSRV_URL: 'http://localhost:8080',
    IIPSRV_PREFIX_CARTE: '/Cartes/',
    IIPSRV_PREFIX_FRANCE: '/Misphot_Image/',
    IIPSRV_PREFIX_MONDE: '/Misphot_Image_Etranger/',
  },

  // environnement de prod
  production: {
    COMMUNE_URL: 'https://geo.api.gouv.fr/communes',
    DEPARTEMENT_URL: 'https://geo.api.gouv.fr/departements',
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org',
    GEOSERVER_URL: 'http://geotheque-new.ign.fr:8080/geoserver',
    MTD_FRANCE_URL: 'http://misphot-srv.ign.fr:8080',
    MTD_MONDE_URL: 'http://misphot-srv.ign.fr:8081',
    IMG_FRANCE_URL: '', // non existant pour le moment
    IMG_MONDE_URL: '', // non existant pour le moment
    IMG_CARTES_URL: 'http://dgs1109n013.ign.fr:8081',
    IIPSRV_URL: 'http://10.128.35.66:8080',
    IIPSRV_PREFIX_CARTE: '/Carto/Patrimoine/Cartes/',
    IIPSRV_PREFIX_FRANCE: '/Misphot_Image/',
    IIPSRV_PREFIX_MONDE: '/Misphot_Image_Etranger/',
  },
}

export default config[env]
