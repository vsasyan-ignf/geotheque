<!-- contenue de l'aide utilisateur -->

<template>
  <div class="aide-content">
    <h4 class="aide-title">Comment utiliser Geothèque ?</h4>

    <div class="aide-section">
      <h5>Navigation dans la Geothèque</h5>
      <p>
        Utilisez les onglets latéraux pour naviguer entre les différentes sections de l'application
        :
      </p>
      <ul>
        <li><b>Cartothèque France</b> : Cartes du territoire français</li>
        <li><b>Cartothèque Étranger</b> : Cartes des territoires étrangers</li>
        <li><b>Photothèque France</b> : Photos aériennes de France</li>
        <li><b>Photothèque Étranger</b> : Photos aériennes de l'étranger</li>
      </ul>
    </div>

    <div class="aide-section">
      <h5>Besoin d'aide supplémentaire ?</h5>
      <p>Pour toute question ou assistance complémentaire, contactez notre support technique :</p>
      <div class="contact-info">
        <p><SvgIcon type="mdi" :path="mdiEmail" /> tsi24@ensg.eu</p>
        <p><SvgIcon type="mdi" :path="mdiPhone" /> 01 23 45 67 89</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import svgIconVue from '@jamescoyle/vue-icon'
import { mdiEmail, mdiPhone } from '@mdi/js'
</script>

<style scoped>
.aide-content {
  padding: 10px 0;
}

.aide-title {
  color: #739614;
  font-size: 18px;
  margin-bottom: 20px;
}

.aide-section {
  margin-bottom: 25px;
}

.aide-section h5 {
  color: #555;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.aide-section p {
  margin-bottom: 10px;
  line-height: 1.5;
}

.aide-section ul,
.aide-section ol {
  padding-left: 20px;
  margin-bottom: 10px;
}

.aide-section li {
  margin-bottom: 5px;
  line-height: 1.5;
}

.contact-info {
  background-color: #f5f5f5;
  padding: 10px 15px;
  border-radius: 5px;
  margin-top: 10px;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.contact-info i {
  color: #739614;
  font-size: 18px;
}
</style>
