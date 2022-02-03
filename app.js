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
    console.log(filterButtons);
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
    
    console.log(`LENGTH OF TYPE COLORS IS ${Object.keys(gens).length}`);
}

function toggleSelectedGeneration(itemElement, itemName) {
    toggleSelected(itemElement, itemName, selectedGenFilters, gens, "filter-btn-gen", "Generation: ");
}

function toggleSelectedType(itemElement, itemName) {
    toggleSelected(itemElement, itemName, selectedTypeFilters, Object.keys(typeColors), "filter-btn-type", "Type: ");
}

function searchPokemon() {

}

async function loadHomePage() {
    let genResponse = await fetch("https://pokeapi.co/api/v2/generation");
    let genData = await genResponse.json();
    gens = genData.results.map(gen => gen.name);
    console.log(gens);

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