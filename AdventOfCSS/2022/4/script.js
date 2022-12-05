const buttons = document.querySelectorAll('button');
const jigglers = Array.from(buttons);

const score = [0, 0];

const keyUpHandler = (e) => {
  //do we have a virtual button for the physically pressed button's value?
  let htmlButton = jigglers.filter( button => {
    return button.textContent.trim().toLowerCase() == e.key.toLowerCase();
  });

  // maybe we have a modifier key?
  if(htmlButton.length == 0 || htmlButton.length > 1) {
    htmlButton = [document.querySelector(`[data-key-code="${e.code}"]`)];
  }

  if(!htmlButton[0] || !htmlButton[0].classList.contains('jiggle')) {
   showError();
   score[1]++;
  } else {
    htmlButton[0].click();
    score[0]++;
  }
  updateScore();
}

const buttonClickHandler = (event) => {
    event.target.setAttribute('disabled', 'disabled');
    if(event.target.classList.contains('jiggle')) {
      event.target.classList.remove('jiggle');
      score[0]++;
      setTimeout(()=> {
        jiggleButton();
      }, 1000);
    } else {
      showError();
      score[1]++;
    }
    updateScore();
}

const updateScore = () => {
  
  if(score[1]) {
    score[0] = 0;
    score[1] = 0;
  }
  document.querySelector('h1 span strong').textContent = score[0];
}

const showError = () => {
  jigglers.map( button => {
    button.className = 'error';
    setTimeout(()=> {
      button.classList.remove('error');
    }, 500);
  })
  setTimeout(jiggleButton, 1000)
}

const jiggleButton = () => {
  jigglers.map( button => {button.removeAttribute('disabled')});
  const idx = parseInt(Math.random() * (buttons.length - 1));
  const button = jigglers[idx];
  button.classList.add('jiggle');
}

document.addEventListener('keyup', keyUpHandler)
jigglers.map( button => {
  button.addEventListener('click', buttonClickHandler);
});

jiggleButton();