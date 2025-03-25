import { ref } from 'vue'
import PlanIGN from '@/assets/basecard/plan_ign.png'
import Ortho from '@/assets/basecard/ortho.jpeg'
import BDParcellaire from '@/assets/basecard/bdparcellaire.png'
import CartesIGN from '@/assets/basecard/cartesign.jpg'
import Scan25 from '@/assets/basecard/scan25.jpg'
import osm from '@/assets/basecard/scan25.jpg'
// export const tabs = [
//     { id: 'carthotheque', icon: 'layers', title: 'Cartothèque France' },
//     { id: 'carthotheque_etranger', icon: 'layers', title: 'Cartothèque Étranger' },
//     { id: 'phototheque', icon: 'camera', title: 'Photothèque France' },
//     { id: 'phototheque_etranger', icon: 'camera', title: 'Photothèque Étranger' },
//     { id: 'aide', icon: 'lightbulb-on', title: 'Aide' },
// ];

// export const subCategories = [
//     { id: 'commune', icon: 'city', title: 'Commune' },
//     { id: 'departement', icon: 'map', title: 'Département' },
//     { id: 'point', icon: 'crosshairs-gps', title: 'Point XY' },
// ];

export const layers_carto = ref([
    {
        id: 'plan',
        name: 'Plan IGN',
        thumbnail: PlanIGN,
    },
    {
        id: 'ortho',
        name: 'Ortho',
        thumbnail: Ortho,
    },
    {
        id: 'bdparcellaire',
        name: 'BDParcellaire',
        thumbnail: BDParcellaire,
    },
    {
        id: 'cartesign',
        name: 'Cartes IGN',
        thumbnail: CartesIGN,
    },
    {
        id: 'scan25',
        name: 'Scan25',
        thumbnail: Scan25,
    },
]);

export const layers_carto_monde = ref([
    {
        id: 'osm',
        name: 'osm',
        thumbnail: osm,
    },
    {
        id: 'ortho',
        name: 'Ortho',
        thumbnail: Ortho,
    },
    {
        id: 'cartesign',
        name: 'Cartes IGN',
        thumbnail: CartesIGN,
    },
    {
        id: 'scan25',
        name: 'Scan25',
        thumbnail: Scan25,
    },
]);

export const layers_photo = ref([
    {
        id: 'plan',
        name: 'Plan IGN',
        thumbnail: PlanIGN,
    },
    {
        id: 'ortho',
        name: 'Ortho',
        thumbnail: Ortho,
    },
    {
        id: 'bdparcellaire',
        name: 'BDParcellaire',
        thumbnail: BDParcellaire,
    },
    {
        id: 'cartesign',
        name: 'Cartes IGN',
        thumbnail: CartesIGN,
    },
    {
        id: 'scan25',
        name: 'Scan25',
        thumbnail: Scan25,
    },
]);

export const layers_photo_monde = ref([
    {
        id: 'osm',
        name: 'osm',
        thumbnail: osm,
    },
    {
        id: 'ortho',
        name: 'Ortho',
        thumbnail: Ortho,
    },
    {
        id: 'cartesign',
        name: 'Cartes IGN',
        thumbnail: CartesIGN,
    },
    {
        id: 'scan25',
        name: 'Scan25',
        thumbnail: Scan25,
    },
]);