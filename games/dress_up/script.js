document.addEventListener('DOMContentLoaded', () => {
    const characterImage = document.getElementById('character-image');
    const wardrobeArea = document.getElementById('wardrobe-area');
    const homeButton = document.getElementById('homeButton');
    const resetButton = document.getElementById('reset-button');
    const snapZones = document.querySelectorAll('.snap-zone');
    const characterSelect = document.getElementById('character-select');

    const characters = [
        { id: 'bear', name: 'Bear', src: '../../assets/images/dress_up_game/bear_char.svg' },
        { id: 'char1', name: 'Cat', src: '../../assets/images/dress_up_game/char_1.svg' },
        { id: 'char2', name: 'Rabbit', src: '../../assets/images/dress_up_game/char_2.svg' },
        { id: 'char3', name: 'Robot', src: '../../assets/images/dress_up_game/char_3.svg' },
        { id: 'char4', name: 'Ghost', src: '../../assets/images/dress_up_game/char_4.svg' },
        { id: 'char5', name: 'Alien', src: '../../assets/images/dress_up_game/char_5.svg' },
        { id: 'char6', name: 'Simple Person', src: '../../assets/images/dress_up_game/char_6.svg' },
        { id: 'char7', name: 'Dog', src: '../../assets/images/dress_up_game/char_7.svg' },
        { id: 'char8', name: 'Bird', src: '../../assets/images/dress_up_game/char_8.svg' },
        { id: 'char9', name: 'Monster', src: '../../assets/images/dress_up_game/char_9.svg' },
        { id: 'char10', name: 'Knight', src: '../../assets/images/dress_up_game/char_10.svg' }
    ];

    const clothingItems = [
        { id: 'hat1', name: 'Red Cap', src: '../../assets/images/dress_up_game/hat_red.svg', category: 'hat' },
        { id: 'shirt1', name: 'Blue T-Shirt', src: '../../assets/images/dress_up_game/shirt_blue.svg', category: 'shirt' },
        { id: 'pants1', name: 'Green Shorts', src: '../../assets/images/dress_up_game/pants_green.svg', category: 'pants' },
        { id: 'glasses1', name: 'Black Glasses', src: '../../assets/images/dress_up_game/glasses_black.svg', category: 'glasses' }
    ];

    let draggedItem = null; // To store the data of the item being dragged

    // 1. Populate Wardrobe
    function populateWardrobe() {
        // Clear existing items except the title
        const title = wardrobeArea.querySelector('h2');
        wardrobeArea.innerHTML = '';
        if (title) wardrobeArea.appendChild(title);

        clothingItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('wardrobe-item');
            itemDiv.setAttribute('draggable', true);
            itemDiv.dataset.itemId = item.id; // Store item id

            const itemImg = document.createElement('img');
            itemImg.src = item.src;
            itemImg.alt = item.name;
            itemDiv.appendChild(itemImg);

            itemDiv.addEventListener('dragstart', handleDragStart);
            wardrobeArea.appendChild(itemDiv);
        });
    }

    // 2. Drag and Drop Handlers
    function handleDragStart(event) {
        const itemId = event.target.dataset.itemId;
        draggedItem = clothingItems.find(item => item.id === itemId);
        event.dataTransfer.setData('text/plain', itemId); // For some browsers
        event.dataTransfer.effectAllowed = 'move';
    }

    snapZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    function handleDragOver(event) {
        event.preventDefault();
        const targetZone = event.target.closest('.snap-zone');
        if (targetZone && draggedItem && targetZone.dataset.category === draggedItem.category) {
            targetZone.classList.add('drag-over-zone');
            event.dataTransfer.dropEffect = 'move';
        } else {
            event.dataTransfer.dropEffect = 'none';
        }
    }

    function handleDragLeave(event) {
        const targetZone = event.target.closest('.snap-zone');
        if (targetZone) {
            targetZone.classList.remove('drag-over-zone');
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        const targetZone = event.target.closest('.snap-zone');
        targetZone.classList.remove('drag-over-zone');

        if (!draggedItem || !targetZone || targetZone.dataset.category !== draggedItem.category) {
            draggedItem = null;
            return; // Invalid drop
        }

        // Clear any existing item in this zone
        targetZone.innerHTML = ''; // Remove previous item image

        // Add new item image to the zone
        const itemImg = document.createElement('img');
        itemImg.src = draggedItem.src;
        itemImg.alt = draggedItem.name;
        itemImg.classList.add('placed-item');
        itemImg.dataset.itemId = draggedItem.id; // Store ID for potential removal

        targetZone.appendChild(itemImg);

        // Add click listener to remove item from character
        itemImg.addEventListener('click', handleRemoveItemFromCharacter);

        // Optional: Hide item from wardrobe or mark as used (not implemented for simplicity of re-use)
        draggedItem = null; // Clear dragged item
    }

    // 3. Remove Item from Character (by clicking on it)
    function handleRemoveItemFromCharacter(event) {
        const itemToRemoveImg = event.target;
        const parentZone = itemToRemoveImg.closest('.snap-zone');

        if (parentZone) {
            parentZone.innerHTML = ''; // Remove item from the character display
            // Optional: Add item back to wardrobe if it was removed/hidden
            // For this version, items are always available in the wardrobe.
        }
    }

    // 4. Reset Outfit Function (used by button and character change)
    function resetOutfit() {
        snapZones.forEach(zone => {
            zone.innerHTML = ''; // Clear all items from character
        });
    }

    resetButton.addEventListener('click', resetOutfit);

    // 5. Populate Character Selection Dropdown
    function populateCharacterSelect() {
        characters.forEach(character => {
            const option = document.createElement('option');
            option.value = character.src;
            option.textContent = character.name;
            if (character.id === 'bear') { // Default selection
                option.selected = true;
            }
            characterSelect.appendChild(option);
        });
    }

    // 6. Handle Character Change
    characterSelect.addEventListener('change', (event) => {
        const selectedSrc = event.target.value;
        characterImage.src = selectedSrc;
        characterImage.alt = characterSelect.options[characterSelect.selectedIndex].text; // Update alt text
        resetOutfit(); // Clear clothes when character changes
    });

    // Initialize Game
    populateWardrobe();
    // Home button event listener
    homeButton.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    populateCharacterSelect();
    // Ensure initial character alt text is set correctly (though it's set in HTML initially)
    const initialCharacter = characters.find(c => c.src === characterImage.src);
    if (initialCharacter) {
        characterImage.alt = initialCharacter.name;
    }
});
