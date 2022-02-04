const typeColors = {
    "normal": "#A8A77A",
    "fire": "#EE8130",
    "water": "#6390F0",
    "grass": "#7AC74C",
    "electric": "#F7D02C",
    "ice": "#96D9D6",
    "fighting": "#C22E28",
    "poison": "#A33EA1",
    "ground": "#E2BF65",
    "flying": "#A98FF3",
    "psychic": "#F95587",
    "bug": "#A6B91A",
    "rock": "#B6A136",
    "ghost": "#735797",
    "dark": "#705746",
    "dragon": "#6F35FC",
    "steel": "#B7B7CE",
    "fairy": "#D685AD" 
};

let gens = [];
let selectedGenFilters = [];
let selectedTypeFilters = [];

let pokemons = [];
let filteredPokemonIds = [];

function displayFilters(buttonId, optionsId) {
    let filterOptionGroups = document.getElementById("filter-menu").children;
    for (let i = 0; i < filterOptionGroups.length; i++) {
        if (filterOptionGroups[i].id === optionsId) {
            filterOptionGroups[i].classList.toggle("expanded");
        } else {
            filterOptionGroups[i].classList.remove("expanded");
        }
    }

    let filterButtons = document.getElementById("filter-list").children;
    for (let i = 0; i < filterButtons.length; i++) {
        if (filterButtons[i].id === buttonId) {
            filterButtons[i].classList.toggle("selected");
        } else {
            filterButtons[i].classList.remove("selected");
        }
    }
}

function displayGenerationFilters() {
    displayFilters("filter-btn-gen", "filter-options-gen");
}

function displayTypeFilters() {
    displayFilters("filter-btn-type", "filter-options-type");
}

function toggleSelected(itemElement, itemName, selectedArr, completeArr, buttonId, startingText) {
    itemElement.classList.toggle("selected");
    if (selectedArr.includes(itemName)) {
        selectedArr.splice(selectedArr.indexOf(itemName), 1);
    } else {
        selectedArr.push(itemName);
    }

    let button = document.getElementById(buttonId);
    if (selectedArr.length === 0) {
        button.innerText = startingText + "None";
    } else if (selectedArr.length === completeArr.length) {
        button.innerText = startingText + "All";
    } else {
        button.innerText = startingText + selectedArr.length + " selected";
    }
}

function toggleSelectedGeneration(itemElement, itemName) {
    toggleSelected(itemElement, itemName, selectedGenFilters, gens, "filter-btn-gen", "Generation: ");
}

function toggleSelectedType(itemElement, itemName) {
    toggleSelected(itemElement, itemName, selectedTypeFilters, Object.keys(typeColors), "filter-btn-type", "Type: ");
}

function shadeColor(color, percent) {
    let r = parseInt(color.substring(1,3),16);
    let g = parseInt(color.substring(3,5),16);
    let b = parseInt(color.substring(5,7),16);

    r = parseInt(r * (100 + percent) / 100);
    g = parseInt(g * (100 + percent) / 100);
    b = parseInt(b * (100 + percent) / 100);

    r = (r<255)?r:255;  
    g = (g<255)?g:255;  
    b = (b<255)?b:255;  

    let rr = ((r.toString(16).length==1)?"0"+r.toString(16):r.toString(16));
    let gg = ((g.toString(16).length==1)?"0"+g.toString(16):g.toString(16));
    let bb = ((b.toString(16).length==1)?"0"+b.toString(16):b.toString(16));

    return "#"+rr+gg+bb;
}

function searchPokemon() {
    let inputText = document.getElementById("search-bar").value;
    filteredPokemonIds = pokemons.filter((pokemon) => 
        selectedGenFilters.includes(pokemon.generation) &&
        pokemon.types.every(type => selectedTypeFilters.includes(type)) &&
        pokemon.name.toLowerCase().includes(inputText.trim().toLowerCase())).map(pokemon => pokemon.id);
    console.log(filteredPokemonIds);

    let pokemonListContentDiv = document.getElementById("pokemon-list-content");
    let pokemonDivs = pokemonListContentDiv.querySelectorAll("[id^='pokemon-item-']");
    pokemonDivs.forEach(pokemonDiv => {
        let pokemonDivNum = parseInt(pokemonDiv.id.replace("pokemon-item-", ""));
        if (filteredPokemonIds.includes(pokemonDivNum)) {
            pokemonDiv.classList.remove("hidden");
        } else {
            pokemonDiv.classList.add("hidden");
        }
    });
}

async function loadHomePage() {
    // Searchbar

    let searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchPokemon();
        }
    });

    
    // Filters

    let genResponse = await fetch("https://pokeapi.co/api/v2/generation");
    let genData = await genResponse.json();
    gens = genData.results.map(gen => gen.name);

    let genDiv = document.getElementById("filter-options-gen");
    gens.forEach((gen, index) => {
        let genElement = document.createElement("p");
        genElement.innerText = parseInt(index) + 1;
        toggleSelectedGeneration(genElement, gen);
        genElement.onclick = () => toggleSelectedGeneration(genElement, gen);
        genDiv.appendChild(genElement);
    });

    let typeDiv = document.getElementById("filter-options-type");
    for (let type in typeColors) {
        let typeElement = document.createElement("p");
        typeElement.innerText = type.charAt(0).toUpperCase() + type.slice(1);
        toggleSelectedType(typeElement, type);
        typeElement.onclick = () => toggleSelectedType(typeElement, type);
        typeDiv.appendChild(typeElement);
    }


    console.log("start");

    // Pokemon list
    let pokemonSpeciesListResponse = await fetch("https://pokeapi.co/api/v2/pokemon-species?limit=9999/");
    let pokemonSpeciesListData = await pokemonSpeciesListResponse.json();
    pokemons = await Promise.all(pokemonSpeciesListData.results.map(async (species) => {
        let speciesResponse = await fetch(species.url);
        let speciesData = await speciesResponse.json();

        let pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesData.id}`);
        let pokemonData = await pokemonResponse.json();

        return {
            "id": speciesData.id,
            "name": speciesData.name,
            "imageUrl": `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${speciesData.id}.png`,
            "description": speciesData.flavor_text_entries.find(entry => entry.language.name === "en").flavor_text.replace("\f", " "),
            "generation": speciesData.generation.name,
            "types": pokemonData.types.map(type => type.type.name)
        };
    }));
    filteredPokemonIds = pokemons.map(pokemon => pokemon.id);

    let pokemonListContentDiv = document.getElementById("pokemon-list-content");
    pokemons.forEach(pokemon => {
        let pokemonImage = document.createElement("img");
        pokemonImage.src = pokemon.imageUrl;

        let pokemonName = document.createElement("h2");
        pokemonName.innerText = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

        let pokemonTypeDiv = document.createElement("div");
        pokemonTypeDiv.classList.add("pokemon-type-group", "row");
        pokemon.types.forEach(type => {
            let pokemonType = document.createElement("p");
            pokemonType.innerText = type.charAt(0).toUpperCase() + type.slice(1);
            pokemonType.style.backgroundColor = typeColors[type];
            pokemonTypeDiv.appendChild(pokemonType);
        });

        let pokemonGeneration = document.createElement("h3");
        pokemonGeneration.innerText = `Generation ${gens.indexOf(pokemon.generation) + 1}`;

        let pokemonDescription = document.createElement("p");
        pokemonDescription.innerText = pokemon.description;

        let pokemonDiv = document.createElement("div");

        let typeColor1, typeColor2;
        if (pokemon.types.length === 2) {
            typeColor1 = shadeColor(typeColors[pokemon.types[0]], 40);
            typeColor2 = shadeColor(typeColors[pokemon.types[1]], 40);
        } else {
            typeColor1 = typeColors[pokemon.types[0]];
            typeColor2 = shadeColor(typeColors[pokemon.types[0]], 80);
        }

        pokemonDiv.style.backgroundImage = "linear-gradient(to bottom right, " 
        + typeColor1 
        + ", " 
        + typeColor2
        + ")";
    
        pokemonDiv.id = "pokemon-item-" + pokemon.id;
        pokemonDiv.classList.add("pokemon-item", "column");
        pokemonDiv.append(pokemonImage, pokemonName, pokemonTypeDiv, pokemonGeneration, pokemonDescription);
        pokemonListContentDiv.appendChild(pokemonDiv);
    });
}

function loadPage() {
    let pathDirectories = window.location.pathname.split("/");
    let currentPage = pathDirectories[pathDirectories.length - 1];
    switch(currentPage) {
        case "index.html":
            loadHomePage();
        default:
            break;
    }
}

loadPage();