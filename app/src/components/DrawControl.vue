<template>
    <div class="draw-control">
      <button @click="toggleDrawMenu" class="draw-button" :class="{ active: showDrawMenu }">
        <SvgIcon type="mdi" :path="mdiPencil" class="button-icon" />
      </button>
      <div v-if="showDrawMenu" class="draw-menu">
        <button @click="activateDrawMode('Rectangle')" :class="{ active: activeDrawMode === 'Rectangle' }">
          <div class="button-content">
            <SvgIcon type="mdi" :path="mdiRectangleOutline" class="menu-icon" /> 
            <span>Rectangle</span>
          </div>
        </button>
        <button @click="activateDrawMode('Circle')" :class="{ active: activeDrawMode === 'Circle' }">
          <div class="button-content">
            <SvgIcon type="mdi" :path="mdiCircleOutline" class="menu-icon" /> 
            <span>Cercle</span>
          </div>
        </button>
        <button @click="activateDrawMode('Polygon')" :class="{ active: activeDrawMode === 'Polygon' }">
          <div class="button-content">
            <SvgIcon type="mdi" :path="mdiTriangleOutline" class="menu-icon" /> 
            <span>Polygone</span>
          </div>
        </button>
      </div>
    </div>
</template>
    
<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import Draw from 'ol/interaction/Draw';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Polygon } from 'ol/geom';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import SvgIcon from '@jamescoyle/vue-icon';
import { 
  mdiPencil, 
  mdiRectangleOutline, 
  mdiCircleOutline, 
  mdiTriangleOutline, 
  mdiEraser 
} from '@mdi/js';

const props = defineProps({
  map: Object,
  isDrawModeActive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'draw-complete', 
  'draw-mode-activated', 
  'deactivate-draw-mode'
]);

const showDrawMenu = ref(false);
const activeDrawMode = ref(null);
const drawSource = ref(null);
const drawLayer = ref(null);
const drawInteraction = ref(null);

const greenFillColor = 'rgba(115, 150, 20, 0.2)';
const greenStrokeColor = 'rgba(115, 150, 20, 0.8)';
const greenFillColorSolid = 'rgba(115, 150, 20, 0.8)';

const drawStyle = new Style({
  fill: new Fill({
    color: greenFillColor
  }),
  stroke: new Stroke({
    color: greenStrokeColor,
    width: 2
  }),
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({
      color: greenFillColorSolid
    })
  })
});

const interactionStyle = {
  Point: new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: greenFillColorSolid
      })
    })
  }),
  LineString: new Style({
    stroke: new Stroke({
      color: greenStrokeColor,
      width: 2
    })
  }),
  Polygon: new Style({
    fill: new Fill({
      color: greenFillColor
    }),
    stroke: new Stroke({
      color: greenStrokeColor,
      width: 2
    })
  }),
  Circle: new Style({
    fill: new Fill({
      color: greenFillColor
    }),
    stroke: new Stroke({
      color: greenStrokeColor,
      width: 2
    })
  })
};

onMounted(() => {
  drawSource.value = new VectorSource();
  drawLayer.value = new VectorLayer({
    source: drawSource.value,
    style: drawStyle
  });

  if (props.map) {
    props.map.addLayer(drawLayer.value);
  }
});

onUnmounted(() => {
  if (props.map && drawInteraction.value) {
    props.map.removeInteraction(drawInteraction.value);
  }
  if (props.map && drawLayer.value) {
    props.map.removeLayer(drawLayer.value);
  }
});

// Observe changes to the isDrawModeActive prop
watch(() => props.isDrawModeActive, (isActive) => {
  if (!isActive) {
    deactivateDrawMode();
  }
});

function toggleDrawMenu() {
  showDrawMenu.value = !showDrawMenu.value;
  if (!showDrawMenu.value) {
    deactivateDrawMode();
  }
}

function activateDrawMode(mode) {
  if (drawInteraction.value && props.map) {
    props.map.removeInteraction(drawInteraction.value);
    drawInteraction.value = null;
  }

  if (activeDrawMode.value === mode) {
    activeDrawMode.value = null;
    return;
  }

  activeDrawMode.value = mode;
  let drawType;
  let geometryFunction;

  switch (mode) {
    case 'Rectangle':
      drawType = 'Circle';
      geometryFunction = createBox();
      break;
    case 'Circle':
      drawType = 'Circle';
      geometryFunction = undefined;
      break;
    case 'Polygon':
      drawType = 'Polygon';
      geometryFunction = undefined;
      break;
    default:
      return;
  }

  drawInteraction.value = new Draw({
    source: drawSource.value,
    type: drawType,
    geometryFunction: geometryFunction,
    style: function(feature) {
      const geometryType = feature.getGeometry().getType();
      return interactionStyle[geometryType] || drawStyle;
    }
  });

  if (props.map) {
    props.map.addInteraction(drawInteraction.value);
  }

  drawInteraction.value.on('drawend', (event) => {
    const geometry = event.feature.getGeometry();
    const coordinates = mode === 'Circle' 
      ? circleToPolygon(geometry) 
      : geometry.getCoordinates();
    
    event.feature.setStyle(drawStyle);
    
    emit('draw-complete', {
      type: mode,
      coordinates: coordinates
    });
  });

  emit('draw-mode-activated', mode);
}

function deactivateDrawMode() {
  if (drawInteraction.value && props.map) {
    props.map.removeInteraction(drawInteraction.value);
    drawInteraction.value = null;
  }
  activeDrawMode.value = null;
  emit('deactivate-draw-mode');
}

function createBox() {
  return function(coordinates, geometry) {
    if (!coordinates[1]) {
      return null;
    }
    
    const start = coordinates[0];
    const end = coordinates[1];
    
    const boxCoordinates = [[
      start,
      [start[0], end[1]],
      end,
      [end[0], start[1]],
      start
    ]];
    
    if (!geometry) {
      geometry = new Polygon(boxCoordinates);
    } else {
      geometry.setCoordinates(boxCoordinates);
    }
    
    return geometry;
  };
}

function circleToPolygon(circle) {
  const center = circle.getCenter();
  const radius = circle.getRadius();
  const numPoints = 64;
  const polygon = [];
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    const x = center[0] + radius * Math.cos(angle);
    const y = center[1] + radius * Math.sin(angle);
    polygon.push([x, y]);
  }
  
  polygon.push(polygon[0]);
  
  return [polygon];
}
</script>
  
<style scoped>
.draw-control {
  position: absolute;
  top: 170px;
  right: 20px;
  z-index: 1000;
}

.draw-button {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: white;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.button-icon {
  font-size: 18px;
  color: #555;
}

.draw-button.active {
  background-color: #f0f0f0;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.draw-menu {
  position: absolute;
  top: 45px;
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 10px;
  display: flex;
  flex-direction: column;
  width: 140px;
}

.draw-menu button {
  margin: 5px 0;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
  text-align: left;
  color: #333;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #333;
}

.draw-menu button:hover {
  background-color: #e0e0e0;
}

.draw-menu button.active {
  background-color: #739614;
  color: white;
}

.draw-menu button.active .menu-icon {
  color: white;
}

.clear-button {
  margin-top: 10px !important;
  border-top: 1px solid #eee !important;
  padding-top: 10px !important;
  background-color: #f8f8f8 !important;
}
</style>