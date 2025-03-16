<style scoped>
.container {
  border: solid 1px #ddd;
  padding: 20px;
  margin-top: 20px;
  border-radius: 20px;
  background-color: #fff;
}

.container .heading {
  font-size: 1.3rem;
  margin-bottom: 15px;
  font-weight: bolder;
  color: #333;
}

.form {
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form .btn-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
}

.form .btn {
  padding: 10px 20px;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  border-radius: 10px;
  border: solid 1px #739614;
  border-bottom: solid 1px #90c2ff;
  background: linear-gradient(135deg, #739614, #739614);
  color: #fff;
  font-weight: bolder;
  transition: all 0.2s ease;
  box-shadow:
    0px 2px 3px #000d3848,
    inset 0px 4px 5px #739614,
    inset 0px -4px 5px #739614;
}

.form .btn:active {
  box-shadow:
    inset 0px 4px 5px #739614,
    inset 0px -4px 5px #739614;
  transform: scale(0.995);
}

.input-field {
  position: relative;
}

.input-field label {
  position: absolute;
  color: #8d8d8d;
  pointer-events: none;
  background-color: transparent;
  left: 15px;
  transform: translateY(0.6rem);
  transition: all 0.3s ease;
}

.input-field input {
  padding: 10px 15px;
  font-size: 1rem;
  border-radius: 8px;
  border: solid 1px #8d8d8d;
  letter-spacing: 1px;
  width: 100%;
}

.input-field input:focus,
.input-field input:valid {
  outline: none;
  border: solid 1px #0ea11c;
}

.input-field input:focus ~ label,
.input-field input:valid ~ label {
  transform: translateY(-51%) translateX(-10px) scale(0.8);
  background-color: #fff;
  padding: 0px 5px;
  color: #0ea11c;
  font-weight: bold;
  letter-spacing: 1px;
  border: none;
  border-radius: 100px;
}

.input-pair {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.input-pair .input-field {
  flex: 1;
}

.form .passicon {
  cursor: pointer;
  font-size: 1.3rem;
  position: absolute;
  top: 6px;
  right: 8px;
}

.form .close {
  display: none;
}
</style>

<template>
  <div class="container">
    <div class="heading">Critères de sélection</div>
    <form class="form" action="">
      <div class="input-pair">
        <div class="input-field">
          <input required autocomplete="off" type="text" name="text" id="yearMin" />
          <label for="yearMin">Année min.</label>
        </div>
        <div class="input-field">
          <input required autocomplete="off" type="text" name="text" id="yearMax" />
          <label for="yearMax">Année max.</label>
        </div>
      </div>

      <div class="input-pair">
        <div class="input-field">
          <input required autocomplete="off" type="text" name="text" id="scaleMin" />
          <label for="scaleMin">Echelle min.</label>
        </div>
        <div class="input-field">
          <input required autocomplete="off" type="text" name="text" id="scaleMax" />
          <label for="scaleMax">Echelle max.</label>
        </div>
      </div>

      <div class="input-field">
        <input required autocomplete="off" type="text" name="text" id="collection" />
        <label for="collection">Collection</label>
      </div>

      <div class="btn-container">
        <button class="btn">Rechercher</button>
      </div>
    </form>
  </div>
</template>
