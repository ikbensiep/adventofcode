const form = document.querySelector('form');
const timer = document.querySelector('fieldset.timer');
const inputs = timer.querySelectorAll('input');
const button = document.querySelector('button');
const settingsToggle = document.querySelector('input[type=checkbox]');
const audio = document.querySelector('audio');

let minutes = 0;
let seconds = 0;
let remainingSeconds = 900;
let totalSeconds = 900;
let timeStarted = undefined;
let interval = undefined;

const handleSettingsToggle = (e) => {
  if (e.target.checked) {
    timer.removeAttribute('disabled')
    button.setAttribute('disabled', 'disabled');
    clearInterval(interval);
    button.addEventListener('transitionend', () => button.textContent = 'start');
  } else {
    timer.setAttribute('disabled','disabled');
    if(remainingSeconds > 0) {
      button.removeAttribute('disabled');
    }
  }
}

const startTimer = () => {
  minutes = parseInt(inputs[0].value);
  seconds = parseInt(inputs[1].value);
  remainingSeconds = (minutes * 60) + seconds;
  totalSeconds = (minutes * 60) + seconds;
  button.textContent = 'stop'
  form.style.setProperty('--progress-color', 'var(--red)');
  form.className = '';
  if (!interval) {
    interval = setInterval(updateTimer, 1000);
  } else {
    endTimer();
  }
}

const updateTimer = () => {
  if(remainingSeconds) {
    remainingSeconds--;
    const percentage = (1 - (remainingSeconds / totalSeconds)).toFixed(2) * 75;
    console.log({percentage, remainingSeconds}, padZero(remainingSeconds%60));
    inputs[0].value = padZero(Math.floor(remainingSeconds/60));
    inputs[1].value = padZero(remainingSeconds%60);
    form.style.setProperty('--progress', percentage + '%')
  } else {
    endTimer();
    button.setAttribute('disabled', 'disabled');
  }
}

const endTimer = () => {
  clearInterval(interval);
  interval = undefined;
  if(remainingSeconds) {
  } else {
    form.style.setProperty('--progress', 0 + '%');
    setTimeout(() => alert('done!'), 500);
    form.style.setProperty('--progress-color', 'var(--green)');
    form.className = 'complete';
    button.textContent = 'start';
    audio.play()
  }
}

const padZero = (number) => {
  let value = number;
  value < 10 
    ? value = '0' + number
    : value = number;
  return value;
}

const handleNumberInput = (e) => {
  
  // subtract 1 minute when seconds goes from 00 to 59
  if(inputs[1].value < 0 && inputs[0].value > 0) {
    inputs[0].value--;
    inputs[1].value = '59';
    return;
  }
  
  if(e.target.value < 10) e.target.value = padZero(e.target.value);
  if(e.target.value > Number(e.target.max)) e.target.value = e.target.max;
  if(e.target.value.toString().length > 2) e.target.value = e.target.value.slice(e.target.value.length - 2, e.target.value.length);

  if(inputs[0].value === '60') {
    console.log('can\'t go higher');
    inputs[1].value = '00';
  } else {
  }

  if(inputs[1].value === '60') {
    console.log('add 1 minute, reset seconds to 00')
    inputs[0].value++;
    inputs[1].value = '00';
  }

  minutes = inputs[0].value;
  seconds = inputs[1].value;
  remainingSeconds = parseInt((minutes * 60) + seconds);
  if( remainingSeconds ) button.textContent = 'start';
}

[...inputs].map( input => {  
  input.addEventListener('change', handleNumberInput);
})

button.addEventListener('click', startTimer);
settingsToggle.addEventListener('input', handleSettingsToggle);