<template>
  <span class="custom-dropdown big">
    <select>
      <option>Sherlock Holmes</option>
      <option>The Great Gatsby</option>
      <option>V for Vendetta</option>
      <option>The Wolf of Wallstreet</option>
      <option>Quantum of Solace</option>
    </select>
  </span>
</template>

<style scoped>
.big {
  font-size: 1.2em;
}

.small {
  font-size: 0.7em;
}

.custom-dropdown {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin: 10px;
}

.custom-dropdown select {
  background-color: #739614;
  color: #fff;
  font-size: inherit;
  padding: 0.5em;
  padding-right: 2.5em;
  border: 0;
  margin: 0;
  border-radius: 3px;
  text-indent: 0.01px;
  text-overflow: '';
}

.custom-dropdown::before,
.custom-dropdown::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.custom-dropdown::after {
  /*  Custom dropdown arrow */
  content: '\25BC';
  height: 1em;
  font-size: 0.625em;
  line-height: 1;
  right: 1.2em;
  top: 50%;
  margin-top: -0.5em;
}

.custom-dropdown::before {
  /*  Custom dropdown arrow cover */
  width: 2em;
  right: 0;
  top: 0;
  bottom: 0;
  border-radius: 0 3px 3px 0;
}

.custom-dropdown select[disabled] {
  color: rgba(0, 0, 0, 0.3);
}

.custom-dropdown select[disabled]::after {
  color: rgba(0, 0, 0, 0.1);
}

.custom-dropdown::before {
  background-color: rgba(0, 0, 0, 0.15);
}

.custom-dropdown::after {
  color: rgba(0, 0, 0, 0.4);
}
</style>
