<template>
    <div class="cart-sidebar-container">
      <div class="cart-banner" @click="openCartModal">
        <div class="cart-info">
          <SvgIcon type="mdi" :path="mdiCartOutline" class="cart-icon" />
          <div class="cart-details">
            <span class="cart-count">{{ cartItemsCount }} mission(s)</span>
            <span class="cart-label">Panier de sélection</span>
          </div>
        </div>
        <div class="cart-action">
          <SvgIcon type="mdi" :path="mdiChevronUp" class="chevron-icon" :class="{ 'rotate': isCartModalOpen }" />
        </div>
      </div>
  
      <div v-if="isCartModalOpen" class="modal-overlay" @click.self="closeCartModal">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Panier de sélection</h2>
            <button class="close-button" @click="closeCartModal">&times;</button>
          </div>
  
          <div class="modal-content">
            <div v-if="cartItemsCount === 0" class="empty-cart">
              <SvgIcon type="mdi" :path="mdiCartOff" class="empty-cart-icon" />
              <p>Votre panier est vide</p>
              <p class="help-text">Ajoutez des missions avec le bouton + pour les retrouver ici</p>
            </div>
  
            <div v-else class="cart-items">
              <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
                <div class="item-content">
                  <div class="item-image">
                    <img :src="getImageUrl(item)" alt="Aperçu de la mission" class="mission-image" />
                  </div>
                  <div class="item-info">
                    <div class="item-header">
                      <div class="item-name">{{ item.nom }}</div>
                      <div class="item-actions">
                        <button class="view-button" @click="viewMission(item)" title="Visualiser">
                          <SvgIcon type="mdi" :path="mdiEyeOutline" class="view-icon" />
                        </button>
                        <button class="remove-button" @click="removeFromCart(index)" title="Supprimer">
                          <SvgIcon type="mdi" :path="mdiTrashCanOutline" class="trash-icon" />
                        </button>
                      </div>
                    </div>
                    
                    <div class="item-details">
                      <div class="item-row">
                        <div class="property-label">Date de vol:</div>
                        <div class="property-value">{{ item.date_vol }}</div>
                      </div>
                      <div class="item-row">
                        <div class="property-label">Format:</div>
                        <div class="property-value">{{ item.format }}</div>
                      </div>
                      <div class="item-row">
                        <div class="property-label">Chantier:</div>
                        <div class="property-value long-text">{{ item.chantier || 'Non spécifié' }}</div>
                      </div>
                      <div class="item-row">
                        <div class="property-label">Nom:</div>
                        <div class="property-value long-text">{{ item.nom || 'Non spécifié' }}</div>
                      </div>
                      <div class="item-row">
                        <div class="property-label">Disponibilité:</div>
                        <div class="property-value long-text">
                          {{ item.dispo || 'Non spécifiée' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div class="modal-footer">
            <button 
              class="clear-button" 
              @click="clearCart"
              :disabled="cartItemsCount === 0"
            >
              Vider le panier
            </button>
            <button 
              class="download-button" 
              @click="downloadCartItems"
              :disabled="cartItemsCount === 0"
            >
              <SvgIcon type="mdi" :path="mdiDownloadCircle" class="download-icon" />
              Télécharger CSV
            </button>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { 
  mdiCartOutline, 
  mdiCartOff, 
  mdiChevronUp, 
  mdiTrashCanOutline, 
  mdiDownloadCircle,
  mdiEyeOutline
} from '@mdi/js'
import { downloadCSV } from '../composable/download'
import { useScanStore } from '@/components/store/scan'
import { storeToRefs } from 'pinia'

const scanStore = useScanStore()
const { SelectedPhotos } = storeToRefs(scanStore)

const cartItems = ref([])
const isCartModalOpen = ref(false)

const baseImageUrl = "http://localhost:8080/fcgi-bin/iipsrv.fcgi?FIF=Misphot_Image/Lambert93/2021/2021_FD%2001_C_20/21FD0120x00001_03343.jp2&RGN=0.45,0.45,0.1,0.1&CVT=jpeg"


// doit retourner les éléments du panier
const cartItemsCount = computed(() => cartItems.value.length)

const getImageUrl = (item) => {
  return baseImageUrl
}

const openCartModal = () => {
  isCartModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeCartModal = () => {
  isCartModalOpen.value = false
  document.body.style.overflow = ''
}

const addToCart = (item) => {
  // verif pannier si exist
  const exists = cartItems.value.some(cartItem => 
    cartItem.properties.IDENTIFIAN === item.properties.IDENTIFIAN
  )
  
  if (!exists) {
    cartItems.value.push(item)
    localStorage.setItem('phototheque-cart', JSON.stringify(cartItems.value))
  }
}

const removeFromCart = (index) => {
  cartItems.value.splice(index, 1)
  localStorage.setItem('phototheque-cart', JSON.stringify(cartItems.value))
}

const clearCart = () => {
  cartItems.value = []
  localStorage.setItem('phototheque-cart', JSON.stringify([]))
}

const downloadCartItems = () => {
  if (cartItems.value.length > 0) {
    downloadCSV(cartItems.value)
  }
}

const viewMission = (item) => {
    // ajouter le lien ippsrv
  console.log('visu ippsrv:', item)
 
}

const initCart = () => {
  const savedCart = localStorage.getItem('phototheque-cart')
  if (savedCart) {
    cartItems.value = JSON.parse(savedCart)
  }
}

watch(SelectedPhotos, (newVal) => {
  console.log('SelectedPhotos changed:', newVal)
  if (newVal && newVal.length > 0) {
    cartItems.value = newVal.map(item => {
      return {
        nom: item.properties?.nom || item.nom || 'Sans nom',
        date_vol: item.properties?.date_vol || item.date_vol || 'Non spécifiée',
        format: item.properties?.format || item.format || 'Non spécifié',
        chantier: item.properties?.chantier || item.chantier || 'Non spécifié',
        dispo: item.properties?.dispo || item.dispo || 'Non spécifiée',
        properties: item.properties || item
      }
    })
    localStorage.setItem('phototheque-cart', JSON.stringify(cartItems.value))
  }
}, { deep: true })
</script>

<style scoped>
.cart-sidebar-container {
  position: relative;
}

.cart-banner {
  background-color: white;
  border-top: 1px solid #eaeaea;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.cart-banner:hover {
  background-color: #f8f9fa;
}

.cart-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-icon {
  color: #739614;
  width: 24px;
  height: 24px;
}

.cart-details {
  display: flex;
  flex-direction: column;
}

.cart-count {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.cart-label {
  color: #666;
  font-size: 12px;
}

.cart-action {
  display: flex;
  align-items: center;
}

.chevron-icon {
  color: #666;
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: slideInUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #777;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
  max-height: 60vh;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #666;
}

.empty-cart-icon {
  width: 48px;
  height: 48px;
  color: #ddd;
  margin-bottom: 16px;
}

.help-text {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.cart-item:hover {
  background-color: #edf2f7;
}

.item-content {
  display: flex;
  gap: 16px;
}

.item-image {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mission-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.item-name {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px;
  align-items: flex-start;
}

.property-label {
  font-weight: 600;
  color: #555;
  font-size: 13px;
}

.property-value {
  font-size: 13px;
  color: #444;
}

.long-text {
  word-break: break-word;
  line-height: 1.4;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.view-button, .remove-button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.view-button:hover {
  background-color: #f4ffe6;
  color: #739614;
}

.remove-button:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.view-icon, .trash-icon {
  width: 18px;
  height: 18px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #eaeaea;
}

.clear-button {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-button:hover:not(:disabled) {
  background-color: #fee2e2;
  border-color: #fecaca;
  color: #ef4444;
}

.download-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #739614;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(115, 150, 20, 0.2);
}

.download-button:hover:not(:disabled) {
  background-color: #658612;
}

.download-icon {
  width: 18px;
  height: 18px;
}

.sample-button {
  background-color: #e9ecef;
  color: #495057;
  border: 1px solid #ced4da;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.sample-button:hover:not(:disabled) {
  background-color: #dee2e6;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .item-content {
    flex-direction: column;
  }
  
  .item-image {
    width: 100%;
    height: 180px;
    margin-bottom: 12px;
  }
}
</style>