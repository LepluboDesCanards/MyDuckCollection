document.addEventListener('DOMContentLoaded', function() {
    const duckGrid = document.getElementById('duck-grid');
    const tagFilter = document.getElementById('tag-filter');
    const totalDucksSpan = document.getElementById('total-ducks');
    const resetFilterBtn = document.getElementById('reset-filter');

    let ducks = [];
    let allTags = new Set();
    let filteredDucks = [];
    let isTagClicked = false;

    // Fonction pour formater la date
    function formatDate(dateString) {
        if (!dateString || dateString === "Aucun") return "Aucun";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Charger les canards depuis le fichier JSON
    fetch('ducks.json')
        .then(response => response.json())
        .then(data => {
            ducks = data.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            ducks.forEach(duck => {
                duck.tags.forEach(tag => allTags.add(tag));
            });
            updateTagFilter();
            displayDucks(ducks);
            totalDucksSpan.textContent = ducks.reduce((sum, duck) => sum + duck.quantity, 0);
        });

    // Mettre à jour les options de filtre
    function updateTagFilter() {
        tagFilter.innerHTML = '';
        const optionTous = document.createElement('option');
        optionTous.value = 'all';
        optionTous.textContent = 'Tous';
        tagFilter.appendChild(optionTous);
        allTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
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

        // Ajouter les écouteurs d'événements aux tags
        document.querySelectorAll('.tag').forEach(tagElement => {
            tagElement.addEventListener('click', function() {
                const selectedTag = this.getAttribute('data-tag');
                filterByTag(selectedTag, true);
            });
        });
    }

    // Filtrer par tag (via clic ou menu déroulant)
    function filterByTag(selectedTag, fromClick = false) {
        isTagClicked = fromClick;
        if (selectedTag === 'all') {
            filteredDucks = [...ducks];
            resetFilterBtn.classList.remove('show');
        } else {
            filteredDucks = ducks.filter(duck => duck.tags.includes(selectedTag));
            if (fromClick) {
                resetFilterBtn.classList.add('show');
            } else {
                resetFilterBtn.classList.remove('show');
            }
        }
        displayDucks(filteredDucks);
    }

    // Filtrer via menu déroulant
    tagFilter.addEventListener('change', function() {
        filterByTag(this.value, false);
    });

    // Réinitialiser le filtre
    resetFilterBtn.addEventListener('click', function() {
        tagFilter.value = 'all';
        filterByTag('all', false);
        this.classList.remove('show');
    });
});
