<template>
    <h1>my accordion</h1>
    <ul>
        <li>
            <input type="checkbox" checked>
            <i></i>
            <h2>Accordion History</h2>
            <div class="content">
                <ShakingButton></ShakingButton>
            </div>
            
            <p>Accordions (from 19th-century German Akkordeon, from Akkord—"musical chord, concord of sounds") are a family of box-shaped musical instruments of the bellows-driven free-reed aerophone type,colloquially referred to as a squeezebox. A person who plays the accordion is called an accordionist. The concertina and bandoneón are related. The harmonium and American reed organ are in the same family, but are typically larger than an accordion and sit on a surface or the floor.</p>
        </li>
        <li>
            <input type="checkbox" checked>
            <i></i>
            <h2>Accordion Body</h2>
            <p>he accordion's body consists of two wooden boxes joined together by the bellows. These boxes house reed chambers for the right- and left-hand manuals. Each side has grilles in order to facilitate the transmission of air in and out of the instrument, and to allow the sound to project better. The grille for the right-hand manual is usually larger and is often shaped for decorative purposes. The right-hand manual is normally used for playing the melody and the left-hand manual for playing the accompaniment; however, skilled players can reverse these roles and play melodies with the left hand</p>
        </li>
        <li>
            <input type="checkbox" checked>
            <i></i>
            <h2>Accordion</h2>
          <p>Accordions are a family of box-shaped musical instruments of the bellows-driven free-reed aerophone type, colloquially referred to as a squeezebox. A person who plays the accordion is called an accordionist.</p>
        </li>
    </ul>
</template>

<script setup>
import Dropdown from './Dropdown.vue';
import ShakingButton from './ShakingButton.vue';
</script>

<style scoped>
h2,h1{
    text-transform: uppercase;
    letter-spacing: 2px;    
}
h2{
    font-size: 18px;
}
ul{
    list-style: none;
    padding: 0;
    margin: 0;

}
ul li{
    position: relative;
    padding-bottom: 4px;
    padding-top: 18px;
    border-top: 1px solid #dce7eb; 
    margin-top: 10px; 
}
ul li input[type="checkbox"]{
    position: absolute;
    cursor: pointer;
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: 0;
}
ul li i{
    position: absolute;
    transform: translate(-6px,0);
    margin-top: 16px;
    right: 0;
} 
ul li input[type=checkbox]:checked ~ .content {
  margin-top: 0;
  max-height: 0;
  opacity: 0;
  transform: translateX(-50%);
}

ul li input[type="checkbox"]:checked~i::before{
    transform: translate(2px,0) rotate(45deg);
}
ul li input[type="checkbox"]:checked~i::after{
    transform: translate(-2px,0) rotate(-45deg);
}
ul li i::before,ul li i::after{
    content: "";
    position: absolute;
    background: #333;
    width: 3px;
    height: 9px;
}
ul li i::before{
    transform: translate(-2px,0)rotate(45deg);
}
ul li i:after {
  transform: translate(2px, 0) rotate(-45deg);
}
p{
  font-size: 16px;
  color: rgba(48,69,92,0.8);
  line-height: 26px;
  letter-spacing: 1px;
  position: relative;
  padding: 0 11px;
  max-height: 800px;
  margin-top: 14px;
  opacity: 1;
  transform: translate(0,0);
  overflow: hidden;     
}
.transition, p, ul li i:before, ul li i:after {
  transition: all 0.25s ease-in-out;
  
}

.content {
position: relative;
  padding: 0 11px;
  max-height: 800px;
  margin-top: 14px;
  opacity: 1;
  transform: translate(0,0);
  overflow: hidden; 
  transition: all 0.25s ease-in-out;
}


.flipIn, h1, ul li {
  animation: flipdown 0.5s ease both;
}
ul li:nth-of-type(1) {
  animation-delay: 0.5s;
}
ul li:nth-of-type(2) {
  animation-delay: 0.75s;
}
ul li:nth-of-type(3) {
  animation-delay: 1s;
}
ul li:last-of-type {
  padding-bottom: 0;
}

@keyframes flipdown {
  0% {
    opacity: 0;
    transform-origin: top center;
    transform: rotateX(-90deg);
  }
  5% {
    opacity: 1;
  }
  80% {
    transform: rotateX(8deg);
  }
  83% {
    transform: rotateX(6deg);
  }
  92% {
    transform: rotateX(-3deg);
  }
  100% {
    transform-origin: top center;
    transform: rotateX(0deg);
  }
}

</style>