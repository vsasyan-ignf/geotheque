<template>
  <div class="critere-selection">
    <h4 class="section-title">Critères de sélection</h4>
    <form class="criteria-form" action="">
      <div class="form-row">
        <div class="form-group half">
          <label for="yearMin">Année min.</label>
          <input id="yearMin" type="text" autocomplete="off" required />
        </div>
        <div class="form-group half">
          <label for="yearMax">Année max.</label>
          <input id="yearMax" type="text" autocomplete="off" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="scaleMin">Echelle min.</label>
          <input id="scaleMin" type="text" autocomplete="off" required />
        </div>
        <div class="form-group half">
          <label for="scaleMax">Echelle max.</label>
          <input id="scaleMax" type="text" autocomplete="off" required />
        </div>
      </div>

      <div class="form-group">
        <label for="collection">Collection</label>
        <input id="collection" type="text" autocomplete="off" required />
      </div>

      <div class="button-group">
        <button type="submit" class="search-button">
          <i class="mdi mdi-magnify"></i>
          <span>Rechercher</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.critere-selection {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  width: 100%;
  box-sizing: border-box;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.criteria-form {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 10px;
  width: 100%;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  box-sizing: border-box;
}

.form-group.half {
  flex: 1;
  min-width: calc(50% - 5px);
  max-width: calc(50% - 5px);
}

.form-group label {
  font-size: 14px;
  color: #555;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #739614;
  outline: none;
  box-shadow: 0 0 0 2px rgba(115, 150, 20, 0.2);
}

.button-group {
  margin-top: 10px;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: #739614;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.search-button:hover {
  background-color: #5e7a10;
}

.search-button:active {
  transform: translateY(1px);
}

@media (max-width: 500px) {
  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .form-group.half {
    min-width: 100%;
    max-width: 100%;
  }
}
</style>
