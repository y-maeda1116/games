document.addEventListener('DOMContentLoaded', () => {
    const characterArea = document.getElementById('character-area');
    const wardrobeArea = document.getElementById('wardrobe-area');
    const resetButton = document.getElementById('reset-button');
    const snapZones = document.querySelectorAll('.snap-zone');

    const clothingItems = [
        { id: 'hat1', name: 'Red Cap', src: 'images_dress_up_game/hat_red.svg', category: 'hat' },
        { id: 'shirt1', name: 'Blue T-Shirt', src: 'images_dress_up_game/shirt_blue.svg', category: 'shirt' },
        { id: 'pants1', name: 'Green Shorts', src: 'images_dress_up_game/pants_green.svg', category: 'pants' },
        { id: 'glasses1', name: 'Black Glasses', src: 'images_dress_up_game/glasses_black.svg', category: 'glasses' }
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

    // 4. Reset Outfit Button
    resetButton.addEventListener('click', () => {
        snapZones.forEach(zone => {
            zone.innerHTML = ''; // Clear all items from character
        });
        // Wardrobe remains populated as items are not removed from it.
    });

    // Initialize Game
    populateWardrobe();
});
