const slider = document.querySelector('input[type=range]');
const output = document.querySelector('output');
const form = document.querySelector('form');

const renderUI = () => {
  updateOuputValue();
  updateSliderBackground();
}

const updateOuputValue = () => {
  output.value = slider.valueAsNumber.toFixed(2);
}

const updateSliderBackground = () => {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const value = ((slider.value - min) * 100) / (max - min);

  slider.style.setProperty('--progress', value.toFixed(2)+'%');
}


slider.addEventListener('input', renderUI);

renderUI();