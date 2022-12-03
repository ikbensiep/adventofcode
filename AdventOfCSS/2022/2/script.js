const mainnav = document.querySelector('nav');
const navbuttons = mainnav.querySelectorAll('a');
const pagetitle = document.querySelector('h1');
const dataurl = './menu.json';
const foodmenu = document.querySelector('#menu');
const menuItemTemplate = document.querySelector('#menuitem');
const cart = document.querySelector('#cart');
const orderItemTemplate = document.querySelector('#orderitem');

let plates = [];
const order = {};
const TAX = 0.0975;

const navigate = (e) => {
  let href = new URL(e.target.href);
  if(href.hash === '#cart') {
    pagetitle.textContent = 'Your cart'
  } else {
    pagetitle.textContent = 'To Go Menu';
    renderFoodMenu();
  }
  [...navbuttons].map( item => item.classList.remove('active'));
  e.target.classList.add('active');
}

const fetchMenu = async () => {
  await fetch(dataurl)
    .then( data => {
      return data.json();
    })
    .then( menudata => {
      plates = [...menudata.plates];
      renderFoodMenu();
    });
}

const renderFoodMenu = () => {
  foodmenu.innerHTML = '';
  
  for(const item of plates) {
    let clone = menuItemTemplate.content.cloneNode(true);
    clone.querySelector('img').src = item.image;
    clone.querySelector('img').alt = `Plate of ${item.name}`;
    clone.querySelector('h2').textContent = item.name;
    clone.querySelector('strong').textContent = item.price.toFixed(2);

    const button = clone.querySelector('button');
    if (order[item.name] ) {
      console.log(item.name, order, order[item.name]);
      console.log(order[item.name])
      button.classList.add('ordered');
    }

    button.addEventListener('click', () => {
      button.setAttribute('disabled','disabled')
      addOrderItem(item)
      
      setTimeout( () => { 
        button.removeAttribute('disabled');
        renderFoodMenu();
      }, 500);
    });
    foodmenu.appendChild(clone);
  }
}

const addOrderItem = (item) => {
  if(!order[item.name] ) {
    order[item.name] = 0;
  } 
  order[item.name]++;
  renderCart();
}

const removeOrderItem = (item) => {
  if(order[item.name]) {
    order[item.name]--;
  }
  renderCart();
}

const renderCart = () => {
  cart.innerHTML = '';
  let orderitems = Object.keys(order);
  let orders = Object.values(order);
  let subTotalPrice = 0; //this could probably be done with a reducer;
  
  orderitems.map ( (name, index) => {
    
    const menuitem = plates.filter( item => {
      return item.name === name
    });

    let amount = orders[index];
    let clone = orderItemTemplate.content.cloneNode(true);
    clone.querySelector('article').dataset.items = amount;
    clone.querySelector('h3').textContent = menuitem[0].name;
    clone.querySelector('img').src = menuitem[0].image;
    clone.querySelector('img').alt = `Plate of ${menuitem[0].name}`;
    clone.querySelector('strong').textContent = menuitem[0].price;
    clone.querySelector('button + span').textContent = amount;
    
    const combinedPrice = menuitem[0].price * amount;
    clone.querySelector('output').textContent = (combinedPrice).toFixed(2);

    const buttons = clone.querySelectorAll('button');
    buttons[0].addEventListener('click', () => removeOrderItem(menuitem[0]));
    buttons[1].addEventListener('click', () => addOrderItem(menuitem[0]));
    cart.appendChild(clone);
    
    subTotalPrice += combinedPrice;

  });

  const clone = document.querySelector('#ordertotal').content.cloneNode(true);

  const subtotal = clone.querySelector('.subtotal');
  const taxes = clone.querySelector('.taxes');
  const total = clone.querySelector('.total');

  subtotal.textContent = 'Subtotal:';
  subtotal.nextElementSibling.textContent = subTotalPrice.toFixed(2);  
  taxes.textContent = 'Tax:';
  taxes.nextElementSibling.textContent = (subTotalPrice * TAX).toFixed(2);
  total.textContent = 'Total:';
  total.nextElementSibling.textContent = (subTotalPrice + (subTotalPrice * TAX)).toFixed(2);
  cart.appendChild(clone);

  
  const cartItems = Object.values(order).reduce((partialSum, itemValue) => partialSum + itemValue, 0);
  mainnav.querySelector('[data-items]').dataset['items'] = cartItems;
}

const renderOrderItem = () => {

}

[...navbuttons].map( item => item.addEventListener('click', navigate));

fetchMenu();