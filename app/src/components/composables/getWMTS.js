export function getWmtsUrl(layerId) {
    if (layerId === 'cartesign' || layerId === 'scan25') {
        return `https://data.geopf.fr/private/wmts?apikey=ign_scan_ws&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&style=normal`;
    }
    return `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&style=normal`;
}

export function getWmtsLayerName(layerId) {
    switch (layerId) {
        case 'plan':
            return 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2';
        case 'ortho':
            return 'ORTHOIMAGERY.ORTHOPHOTOS';
        case 'bdparcellaire':
            return 'CADASTRALPARCELS.PARCELS';
        case 'cartesign':
            return 'GEOGRAPHICALGRIDSYSTEMS.MAPS';
        case 'scan25':
            return 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN25TOUR';
        default:
            return 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2';
    }
}

export function getMaxZoom(layerId) {
    switch (layerId) {
        case 'plan':
            return 19;
        case 'ortho':
            return 21;
        case 'bdparcellaire':
            return 20;
        case 'cartesign':
            return 19;
        case 'scan25':
            return 16;
        default:
            return 19;
    }
}

export function getFormatWmtsLayer(layerId) {
    switch (layerId) {
        case 'cartesign':
        case 'ortho':
        case 'scan25':
            return 'image/jpeg';
        case 'plan':
        case 'bdparcellaire':
            return 'image/png';
        default:
            return 'image/jpeg';
    }
}
