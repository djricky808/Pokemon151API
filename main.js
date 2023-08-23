const url = 'https://pokeapi.co/api/v2/pokemon/';
const pokedex = document.getElementById('mainPokemon');
const selectCollection = document.querySelectorAll('[data-toggle]');
const mainContainer = document.querySelector('.mainBox');
const faveContainer = document.querySelector('.favoriteBox');
const typeCount = document.getElementById('typeCount');
let pokebox;
let favePokedex;
let mainPokedex;
let allTypes = [];

let pokemonNumber;
let pokemonNameLC;
let pokemonName;
let pokemonImg;
let pokeSprite;
let primaryType;
let primaryTypeClass;

let sortArrs;
let sortDirection = 1;

function fetchAllPokemon() {
  let promises = []
  for (let n = 1; n < 152; n++) {
    let promise = fetch(`${url}${n}`);
    promises.push(promise);
  }
  return Promise.all(promises);
}

fetchAllPokemon().then((response) => {
    return Promise.all(response.map((res) => res.json()))
  }).then((data) =>
    buildUI(data))
  .catch((err) => {
    console.log('Pokemon not found', err);
  })

function buildUI(data) {
  createCards(data);
  sortPokemon();
  setCollectionListeners();
  setFavListeners();
  faveStorage();
  calculateType();
  setSortListener();
}

function createCards(data) {
  for (let n = 0; n < 151; n++) {
    const pD = data[n];
    pokemonNumber = String(pD.id).padStart(3, '0');
    pokemonNameLC = pD.name;
    pokemonName = pokemonNameLC.charAt(0).toUpperCase() + pokemonNameLC.slice(1);
    pokemonImg = pD.sprites.other['official-artwork'].front_default;
    pokeSprite = pD.sprites.versions['generation-iii']['firered-leafgreen'].front_default;
    primaryTypeClass = pD.types[0].type.name;
    allTypes.push(primaryType);
    primaryType = primaryTypeClass.toUpperCase();
    if (pD.types.length > 1) {
      secondaryType = pD.types[1].type.name.toUpperCase();
      allTypes.push(secondaryType);
    }
    pokedex.innerHTML += `
    <div id="${pokemonNumber}" class="pokebox ${primaryTypeClass} main">
      <div class="pokemonPic">
        <img class="pokeArtwork" src="${pokemonImg}" alt="${pokemonName}">
        <i class="fa-regular fa-star"></i>
        <img class="pokeSprite" src="${pokeSprite}" alt="${pokemonName}">
      </div> 
      <h2>${pokemonNumber}</h2>
      <h4>${pokemonName}</h4>
      <div class="typing">
        <h5>${primaryType}</h5>
      </div>
    </div>`;
    const currentPokemon = document.getElementById(`${pokemonNumber}`);
    if (pD.types.length > 1) {
      const currentPokemonType = currentPokemon.querySelector('.typing')
      currentPokemonType.innerHTML += `<h5>${secondaryType}</h5>`;
    };
  };
};

function setCollectionListeners() {
  for (const elm of selectCollection) {
    elm.addEventListener('click', function () {
      setActive(elm)
      sortPokemon();
    })
  }
}

function setFavListeners() {
  const starIcon = document.querySelectorAll('.fa-star');
  for (const elm of starIcon) {
    elm.addEventListener('click', function () {
      const value = elm.parentElement.parentElement.parentElement.id === 'mainPokemon' ?
        'toFaves' : 'toMain';
      updateFavStatus(elm.parentElement.parentElement.id, value);
    })
  }
}

function faveStorage(elm) {
  const pokemon = document.querySelectorAll('.pokebox')
  for (elm of pokemon) {
    if (localStorage.getItem('favoritePokemon') &&
      localStorage.getItem('favoritePokemon').split(',').includes(elm.id)) {
      updateFavStatus(elm.id, 'toFaves');
    }
  }
}

const setActive = (elm) => {
  const containers = [faveContainer, mainContainer]
  const params = elm.innerHTML === "Main Collection" ? containers : containers.reverse();
  params[0].classList.remove('active');
  params[1].classList.add('active');
}


const declareArrs = () => {
  const mainPokemon = document.getElementById('mainPokemon');
  const favePokemon = document.getElementById('favePokemon');
  const mainItems = document.querySelectorAll('.main');
  const faveItems = document.querySelectorAll('.faves');
  const mainArr = Array.from(mainItems);
  const faveArr = Array.from(faveItems);
  const containerArr = [mainPokemon, favePokemon];
  const itemArr = [mainArr, faveArr];
  return sortArrs = [itemArr, containerArr];
}

const sortByPokedexNumber = (direction) => {
  declareArrs();
  for (i = 0; i < sortArrs[0].length; i++) {
    sortArrs[0][i].sort((a, b) => {
      const numA = parseInt(a.querySelector('h2').innerHTML);
      const numB = parseInt(b.querySelector('h2').innerHTML);
      return direction === 'asc' ? numA - numB : numB - numA;
    })
    sortArrs[0][i].forEach((item) => {
      sortArrs[1][i].append(item);
    });
  }
}

const sortByPokemonName = (direction) => {
  declareArrs();
  for (i = 0; i < sortArrs[0].length; i++) {
    sortArrs[0][i].sort((a, b) => {
      const nameA = a.querySelector('h4').innerHTML;
      const nameB = b.querySelector('h4').innerHTML;
      if (nameA < nameB) {
        return direction === 'asc' ? -1 : 1;
      } else if (nameA > nameB) {
        return direction === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    })
    sortArrs[0][i].forEach((item) => {
      sortArrs[1][i].append(item);
    });
  }
}

function setSortListener () {
const sortPokemonValue = document.getElementById('sortPokemonBy');

sortPokemonValue.addEventListener('change', function () {
  if (this.value === 'Number (Ascending)') {
    sortDirection = 1;
  } else if (this.value === 'Number (Descending)') {
    sortDirection = 2;
  } else if (this.value === 'Name (Ascending)') {
    sortDirection = 3;
  } else if (this.value === 'Name (Descending)') {
    sortDirection = 4;
  }
  sortPokemon();
})
}

function sortPokemon () {
  if (sortDirection === 1) {
    sortByPokedexNumber('asc');
  } else if (sortDirection === 2) {
    sortByPokedexNumber('desc');
  } else if (sortDirection === 3) {
    sortByPokemonName ('asc');
  } else if (sortDirection === 4) {
    sortByPokemonName ('desc');
  }
}

const updateFavStatus = (id, direction) => {
  const selectedID = document.getElementById(id);
  const star = selectedID.children[0].children[1];
  const starArr = ['fa-regular', 'fa-solid'];
  const containerArr = [favePokemon, mainPokemon];
  const classArr = ['faves', 'main'];
  const params = direction === 'toFaves' ? [containerArr, starArr, classArr, addId(id)] : [containerArr.reverse(), starArr.reverse(), classArr.reverse(), deleteId(id)];
  params[0][1].removeChild(selectedID);
  params[0][0].appendChild(selectedID);
  selectedID.classList.remove(params[2][1]);
  selectedID.classList.add(params[2][0]);
  star.classList.remove(params[1][0]);
  star.classList.add(params[1][1]);
  params[3];
}

const addId = (id) => {
  let curStorage = localStorage.getItem('favoritePokemon');
  let favorites = curStorage ? curStorage += `,${id}` : `${id}`;
  localStorage.setItem('favoritePokemon', favorites)
}

const deleteId = (id) => {
  const idToDelete = id;
  const favoritesArr = localStorage.getItem('favoritePokemon').split(',');
  favoritesArr.splice(favoritesArr.indexOf(idToDelete), 1).join(',');
  localStorage.setItem('favoritePokemon', favoritesArr);
}

function calculateType() {
  let types = [
    'normal', 'fire', 'water', 'grass',
    'electric', 'flying', 'ice', 'poison',
    'fighting', 'psychic', 'rock', 'ground',
    'steel', 'bug', 'dark', 'fairy', 'dragon',
    'ghost'
  ];
  for (let specType of types) {
    let a = specType.toUpperCase();
    let b = 0;
    for (types of allTypes) {
      if (types === a) {
        b++;
      }
    }
    typeCount.innerHTML += `
    <div class="${specType}">
      <h5>${a}</h5>
      <h4>${b}</h4>
    </div>`
  }
}