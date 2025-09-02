document.addEventListener('DOMContentLoaded', () => {
    // Define Interfaces
    interface Character {
        id: string;
        name: string;
        src: string;
    }

    interface ClothingItem {
        id: string;
        name: string;
        src: string;
        category: string;
    }

    const characterImage = document.getElementById('character-image') as HTMLImageElement;
    const wardrobeArea = document.getElementById('wardrobe-area') as HTMLDivElement;
    const resetButton = document.getElementById('reset-button') as HTMLButtonElement;
    const snapZones = document.querySelectorAll('.snap-zone') as NodeListOf<HTMLDivElement>;
    const characterSelect = document.getElementById('character-select') as HTMLSelectElement;

    const characters: Character[] = [
        { id: 'bear', name: 'Bear', src: 'images_dress_up_game/bear_char.svg' },
        { id: 'char1', name: 'Cat', src: 'images_dress_up_game/char_1.svg' },
        { id: 'char2', name: 'Rabbit', src: 'images_dress_up_game/char_2.svg' },
        { id: 'char3', name: 'Robot', src: 'images_dress_up_game/char_3.svg' },
        { id: 'char4', name: 'Ghost', src: 'images_dress_up_game/char_4.svg' },
        { id: 'char5', name: 'Alien', src: 'images_dress_up_game/char_5.svg' },
        { id: 'char6', name: 'Simple Person', src: 'images_dress_up_game/char_6.svg' },
        { id: 'char7', name: 'Dog', src: 'images_dress_up_game/char_7.svg' },
        { id: 'char8', name: 'Bird', src: 'images_dress_up_game/char_8.svg' },
        { id: 'char9', name: 'Monster', src: 'images_dress_up_game/char_9.svg' },
        { id: 'char10', name: 'Knight', src: 'images_dress_up_game/char_10.svg' }
    ];

    const clothingItems: ClothingItem[] = [
        { id: 'hat1', name: 'Red Cap', src: 'images_dress_up_game/hat_red.svg', category: 'hat' },
        { id: 'shirt1', name: 'Blue T-Shirt', src: 'images_dress_up_game/shirt_blue.svg', category: 'shirt' },
        { id: 'pants1', name: 'Green Shorts', src: 'images_dress_up_game/pants_green.svg', category: 'pants' },
        { id: 'glasses1', name: 'Black Glasses', src: 'images_dress_up_game/glasses_black.svg', category: 'glasses' }
    ];

    let draggedItem: ClothingItem | null = null; // To store the data of the item being dragged

    // 1. Populate Wardrobe
    function populateWardrobe(): void {
        // Clear existing items except the title
        const title = wardrobeArea.querySelector('h2');
        wardrobeArea.innerHTML = '';
        if (title) wardrobeArea.appendChild(title);

        clothingItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('wardrobe-item');
            itemDiv.setAttribute('draggable', 'true');
            itemDiv.dataset.itemId = item.id; // Store item id

            const itemImg = document.createElement('img');
            itemImg.src = item.src;
            itemImg.alt = item.name;
            itemDiv.appendChild(itemImg);

            itemDiv.addEventListener('dragstart', handleDragStart as EventListener);
            wardrobeArea.appendChild(itemDiv);
        });
    }

    // 2. Drag and Drop Handlers
    function handleDragStart(event: DragEvent): void {
        const target = event.target as HTMLDivElement;
        const itemId = target.dataset.itemId;
        draggedItem = clothingItems.find(item => item.id === itemId) || null;
        if (event.dataTransfer && itemId) {
            event.dataTransfer.setData('text/plain', itemId);
            event.dataTransfer.effectAllowed = 'move';
        }
    }

    snapZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver as EventListener);
        zone.addEventListener('dragleave', handleDragLeave as EventListener);
        zone.addEventListener('drop', handleDrop as EventListener);
    });

    function handleDragOver(event: DragEvent): void {
        event.preventDefault();
        const targetZone = (event.target as Element).closest<HTMLDivElement>('.snap-zone');
        if (targetZone && draggedItem && targetZone.dataset.category === draggedItem.category) {
            targetZone.classList.add('drag-over-zone');
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move';
            }
        } else {
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'none';
            }
        }
    }

    function handleDragLeave(event: DragEvent): void {
        const targetZone = (event.target as Element).closest<HTMLDivElement>('.snap-zone');
        if (targetZone) {
            targetZone.classList.remove('drag-over-zone');
        }
    }

    function handleDrop(event: DragEvent): void {
        event.preventDefault();
        const targetZone = (event.target as Element).closest<HTMLDivElement>('.snap-zone');
        if (!targetZone) return;

        targetZone.classList.remove('drag-over-zone');

        if (!draggedItem || targetZone.dataset.category !== draggedItem.category) {
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
        itemImg.addEventListener('click', handleRemoveItemFromCharacter as EventListener);

        // Optional: Hide item from wardrobe or mark as used (not implemented for simplicity of re-use)
        draggedItem = null; // Clear dragged item
    }

    // 3. Remove Item from Character (by clicking on it)
    function handleRemoveItemFromCharacter(event: MouseEvent): void {
        const itemToRemoveImg = event.target as HTMLImageElement;
        const parentZone = itemToRemoveImg.closest<HTMLDivElement>('.snap-zone');

        if (parentZone) {
            parentZone.innerHTML = ''; // Remove item from the character display
            // Optional: Add item back to wardrobe if it was removed/hidden
            // For this version, items are always available in the wardrobe.
        }
    }

    // 4. Reset Outfit Function (used by button and character change)
    function resetOutfit(): void {
        snapZones.forEach(zone => {
            zone.innerHTML = ''; // Clear all items from character
        });
    }

    resetButton.addEventListener('click', resetOutfit);

    // 5. Populate Character Selection Dropdown
    function populateCharacterSelect(): void {
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
    characterSelect.addEventListener('change', (event: Event) => {
        const selectedSrc = (event.target as HTMLSelectElement).value;
        characterImage.src = selectedSrc;
        characterImage.alt = characterSelect.options[characterSelect.selectedIndex].text; // Update alt text
        resetOutfit(); // Clear clothes when character changes
    });

    // Initialize Game
    populateWardrobe();
    populateCharacterSelect();
    // Ensure initial character alt text is set correctly (though it's set in HTML initially)
    const initialCharacter = characters.find(c => c.src === characterImage.src);
    if (initialCharacter && characterImage) {
        characterImage.alt = initialCharacter.name;
    }
});
