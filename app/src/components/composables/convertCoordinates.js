import proj4 from 'proj4'

// définit les systèmes de projection
proj4.defs([
    [
        'EPSG:3857',
        '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
    ],
    ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
    [
        'EPSG:2154',
        '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    ],
])

// converti les x et y en fonction du système de proj en entré et en sortie
export function useConvertCoordinates(x, y, fromProjection, toProjection) {
    return proj4(fromProjection, toProjection, [x, y])
}
