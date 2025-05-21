document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const messageArea = document.getElementById('message-area');
    const resetButton = document.getElementById('reset-button');

    // Theme: Simple animal names (can be replaced with image URLs or unicode characters)
    // For a 4x3 grid, we need 6 unique items.
    // Unicode characters for animals:
    // Cat: 🐱, Dog: 🐶, Fish: 🐠, Bird: 🐦, Lion: 🦁, Elephant: 🐘
    const items = ['🐱', '🐶', '🐠', '🐦', '🦁', '🐘'];
    let gameItems = [...items, ...items]; // Duplicate items to make pairs

    let flippedCards = [];
    let matchedPairs = 0;
    const totalPairs = items.length;

    // Function to shuffle an array (Fisher-Yates shuffle)
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to create the game board
    function createBoard() {
        gameBoard.innerHTML = ''; // Clear previous board
        messageArea.textContent = '';
        matchedPairs = 0;
        flippedCards = [];
        gameItems = shuffle([...items, ...items]);

        gameItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.id = index; // Unique ID for each card
            card.dataset.item = item; // The item this card represents

            // Create card front (visible when not flipped)
            const cardFront = document.createElement('div');
            cardFront.classList.add('card-face', 'card-front');
            cardFront.textContent = '?'; // Display a question mark on the front

            // Create card back (visible when flipped, shows the item)
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-face', 'card-back');
            cardBack.textContent = item; // Display item text (or image later)

            card.appendChild(cardFront);
            card.appendChild(cardBack);

            card.addEventListener('click', handleCardClick);
            gameBoard.appendChild(card);
        });
    }

    // Function to handle card click
    function handleCardClick(event) {
        const clickedCard = event.currentTarget;

        // Ignore click if card is already flipped or matched
        if (flippedCards.length === 2 || clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) {
            return;
        }

        clickedCard.classList.add('flipped');
        flippedCards.push(clickedCard);

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }

    // Function to check for a match
    function checkForMatch() {
        const [card1, card2] = flippedCards;

        if (card1.dataset.item === card2.dataset.item) {
            // Match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            flippedCards = [];

            if (matchedPairs === totalPairs) {
                messageArea.textContent = 'You Win!';
            }
        } else {
            // No match, flip back after a delay
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 1000); // 1 second delay
        }
    }

    // Reset game
    resetButton.addEventListener('click', createBoard);

    // Initialize the game
    createBoard();
});
