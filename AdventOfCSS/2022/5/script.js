const filePath = 'https://feeds.simplecast.com/hq7M2S7s';
const episodeListEl = document.querySelector('ul');

const fetchFeed = () => {
  console.log('fetching')
  fetch(filePath)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
    .then( data => {
      processFeed(data);
    });
}

const processFeed = (feeddata) => {
  
  const image = feeddata.querySelector('image url');
  const description = feeddata.querySelector('description');

  const img = document.querySelector('img');
  img.src = image.textContent;
  img.alt = description.textContent;

  const episodes = Array.from(feeddata.querySelectorAll('item'));
  

  episodes.reverse().map( episode => {
    const guid = episode.querySelector('guid').textContent;
    const clone = document.querySelector('template#episode').content.cloneNode(true);
    clone.querySelector('span').textContent = episode.querySelector('title').textContent;
    clone.querySelector('label').setAttribute('for', guid);
    clone.querySelector('input').setAttribute('id', guid);
    episodeListEl.appendChild(clone);
    
  })
}

fetchFeed();