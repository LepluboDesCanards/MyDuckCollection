document.addEventListener('DOMContentLoaded', function() {
    const duckGrid = document.getElementById('duck-grid');
    const colorFilter = document.getElementById('color-filter');
    const typeFilter = document.getElementById('type-filter');
    const brandFilter = document.getElementById('brand-filter');
    const totalDucksSpan = document.getElementById('total-ducks');
    const filteredResultsSpan = document.getElementById('filtered-results');
    const filteredCountSpan = document.getElementById('filtered-count');
    const homeButton = document.getElementById('home-button');

    let ducks = [];
    let tagsByCategory = {
        colors: [],
        types: [],
        brands: []
    };
    let selectedDuckIndex = null;

    // Fonction pour formater la date
    function formatDate(dateString) {
        if (!dateString || dateString === "Aucun") return "Aucun";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Obtenir la date du jour au format YYYY-MM-DD
    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Créer la carte "Aucun Canards Trouvé"
    function createNoResultsCard() {
        return {
            "name": "Aucun",
            "model": "Aucun Canards Trouvé",
            "description": "essayez d'ajuster vos filtres de recherche",
            "image": "./images/404.png",
            "quantity": 0,
            "lore": "Aucun",
            "tags": [],
            "dateAdded": getTodayDate()
        };
    }

    function sortDucksByDateAdded(duckList) {
        return [...duckList].sort((a, b) => {
            const dateA = a.dateAdded && a.dateAdded !== 'Aucun' ? new Date(a.dateAdded).getTime() : 0;
            const dateB = b.dateAdded && b.dateAdded !== 'Aucun' ? new Date(b.dateAdded).getTime() : 0;
            return dateB - dateA;
        });
    }

    // Charger les données depuis le fichier JSON
    fetch('ducks.json')
        .then(response => response.json())
        .then(data => {
            tagsByCategory = data.tags;
            ducks = data.ducks;

            updateFilters();
            const { index: entryIndex } = getDuckIndexFromUrl();
            if (entryIndex !== null) {
                selectedDuckIndex = entryIndex;
                setSingleView(true);
                displaySingleDuck(entryIndex);
                showHomeButton(true);
            } else {
                setSingleView(false);
                showHomeButton(false);
                applyFilters();
            }
            updateTotalDucks();
        })
        .catch(err => {
            console.error('Erreur lors du chargement de ducks.json', err);
        });

    // Mettre à jour les options des menus déroulants
    function updateFilters() {
        colorFilter.innerHTML = '<option value="-">-</option>';
        tagsByCategory.colors.forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color;
            colorFilter.appendChild(option);
        });

        typeFilter.innerHTML = '<option value="-">-</option>';
        tagsByCategory.types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeFilter.appendChild(option);
        });

        brandFilter.innerHTML = '<option value="-">-</option>';
        tagsByCategory.brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    // Appliquer les filtres et mettre à jour l'affichage des résultats filtrés
    function applyFilters() {
        const selectedColor = colorFilter.value;
        const selectedType = typeFilter.value;
        const selectedBrand = brandFilter.value;

        const matched = ducks.filter(duck => {
            const hasColor = selectedColor === '-' || duck.tags.includes(selectedColor);
            const hasType = selectedType === '-' || duck.tags.includes(selectedType);
            const hasBrand = selectedBrand === '-' || duck.tags.includes(selectedBrand);
            return hasColor && hasType && hasBrand;
        });

        const matchedCount = matched.length;
        const sortedMatched = sortDucksByDateAdded(matched);

        let ducksToDisplay = matchedCount === 0 ? [createNoResultsCard()] : sortedMatched;
        displayDucks(ducksToDisplay);

        const hasActiveFilter = selectedColor !== '-' || selectedType !== '-' || selectedBrand !== '-';
        if (hasActiveFilter) {
            filteredCountSpan.textContent = matchedCount;
            filteredResultsSpan.style.display = 'block';
        } else {
            filteredResultsSpan.style.display = 'none';
        }
    }

    // Afficher les canards
    function displayDucks(ducksToDisplay) {
        duckGrid.innerHTML = '';
        ducksToDisplay.forEach((duck, index) => {
            const duckCard = document.createElement('div');
            duckCard.className = 'duck-card';
            duckCard.style.animationDelay = `${0.1 + (index * 0.05)}s`;

            duckCard.innerHTML = `
                <img src="${duck.image}" alt="${duck.name}" onerror="this.onerror=null; this.src='images/404.png';">
                <div class="duck-info">
                    <h2>${duck.model}</h2>
                    <div class="duck-info__details">
                        <p><strong>Nom :</strong> ${duck.name}</p>
                        <p><strong>Description :</strong> ${duck.description}</p>
                        <p><strong>Quantité :</strong> ${duck.quantity}</p>
                        <p><strong>Lore :</strong> ${duck.lore}</p>
                        <p><strong>Date d'ajout :</strong> ${formatDate(duck.dateAdded)}</p>
                    </div>
                    <div class="tags">
                        ${duck.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            duckGrid.appendChild(duckCard);
        });
    }

    function displaySingleDuck(index) {
        const duckIndex = Number(index) - 1;
        if (!Number.isInteger(duckIndex) || duckIndex < 0 || duckIndex >= ducks.length) {
            displayDucks([createNoResultsCard()]);
            return;
        }

        displayDucks([ducks[duckIndex]]);
    }

    function getDuckIndexFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const duckParam = params.get('duck');
        const index = Number(duckParam);

        if (!duckParam || !Number.isInteger(index) || index < 1 || index > ducks.length) {
            return { index: null };
        }

        return { index };
    }

    function setSingleView(enabled) {
        if (enabled) {
            document.body.classList.add('single-view');
        } else {
            document.body.classList.remove('single-view');
        }
    }

    function showHomeButton(show) {
    if (show) {
        homeButton.classList.remove('hidden');
    } else {
        homeButton.classList.add('hidden');
    }
}

    // Mettre à jour le total complet de la collection
    function updateTotalDucks() {
        const grandTotal = ducks.reduce((sum, duck) => sum + (duck.quantity || 0), 0);
        totalDucksSpan.textContent = grandTotal;
    }

    // Écouteurs sur les menus
    colorFilter.addEventListener('change', function() {
        selectedDuckIndex = null;
        applyFilters();
        showHomeButton(false);
        updateTotalDucks();
    });

    typeFilter.addEventListener('change', function() {
        selectedDuckIndex = null;
        applyFilters();
        showHomeButton(false);
        updateTotalDucks();
    });

    brandFilter.addEventListener('change', function() {
        selectedDuckIndex = null;
        applyFilters();
        showHomeButton(false);
        updateTotalDucks();
    });

    homeButton.addEventListener('click', function() {
        window.location.href = window.location.pathname;
    });
});
