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

export function convertBbox(bbox, proj_in, proj_out) {
  //Convertion Bbox de proj_in vers proj_out
  const minX = bbox.minX
  const minY = bbox.minY
  const maxX = bbox.maxX
  const maxY = bbox.maxY

  const minCoord = proj4(proj_in, proj_out, [minX, minY])
  const maxCoord = proj4(proj_in, proj_out, [maxX, maxY])

  return [minCoord[0], minCoord[1], maxCoord[0], maxCoord[1]]
}

export function create_bbox(contour) {
  if (!contour || contour.length === 0) {
    throw new Error('Contour invalide')
  }
  const coordinates = contour[0].map((point) => [point[0], point[1]])

  if (coordinates.length < 3) {
    throw new Error('Un polygone doit avoir au moins 3 points')
  }
  let minX = coordinates[0][0]
  let minY = coordinates[0][1]
  let maxX = coordinates[0][0]
  let maxY = coordinates[0][1]

  coordinates.forEach((point) => {
    const [x, y] = point
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  })

  return { minX, minY, maxX, maxY }
}

export function create_multibbox(contours) {
  if (!contours || contours.length === 0) {
    throw new Error('Contours invalides')
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  const processPoints = (points) => {
    points.forEach((point) => {
      const [x, y] = point
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    })
  }

  if (Array.isArray(contours[0][0])) {
    if (typeof contours[0][0][0] === 'number') {
      contours.forEach((polygon) => {
        processPoints(polygon)
      })
    } else {
      contours.forEach((polygon) => {
        polygon.forEach((ring) => {
          processPoints(ring)
        })
      })
    }
  } else {
    processPoints(contours)
  }
  if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
    throw new Error('Aucun point valide trouvé dans les contours')
  }

  return { minX, minY, maxX, maxY }
}
