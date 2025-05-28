// Declare global setDifficulty function on Window object
declare global {
    interface Window {
        setDifficulty: (level: string) => void;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board') as HTMLDivElement;
    const messageArea = document.getElementById('message-area') as HTMLDivElement;
    const resetButton = document.getElementById('reset-button') as HTMLButtonElement;

    // Define Interfaces
    interface Difficulty {
        items: string[];
        cols: number;
    }

    interface Difficulties {
        [key: string]: Difficulty;
    }

    // Difficulty levels and item sets
    const difficulties: Difficulties = {
        easy: {
            items: ['🐱', '🐶', '🐠', '🐦', '🦁', '🐘'], // 6 pairs, 4x3 grid
            cols: 4,
        },
        medium: {
            items: ['🐱', '🐶', '🐠', '🐦', '🦁', '🐘', '🐼', '🐨', '🦊', '🐻'], // 10 pairs, 5x4 grid
            cols: 5,
        },
        hard: {
            items: ['🐱', '🐶', '🐠', '🐦', '🦁', '🐘', '🐼', '🐨', '🦊', '🐻', '🐵', '🐸', '🦉', '🦋', '🐞'], // 15 pairs, 6x5 grid
            cols: 6,
        }
    };
    let currentDifficulty: string = 'easy'; // Default difficulty
    let items: string[] = difficulties[currentDifficulty].items;
    let gameItems: string[] = [...items, ...items]; // Duplicate items to make pairs

    let flippedCards: HTMLDivElement[] = [];
    let matchedPairs: number = 0;
    let totalPairs: number = items.length;

    // Function to shuffle an array (Fisher-Yates shuffle)
    function shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to create the game board
    function createBoard(): void {
        items = difficulties[currentDifficulty].items;
        totalPairs = items.length;
        const cols: number = difficulties[currentDifficulty].cols;
        // Adjust card size used in JS to match CSS (70px)
        if (gameBoard) {
            gameBoard.style.gridTemplateColumns = `repeat(${cols}, 70px)`;
            gameBoard.innerHTML = ''; // Clear previous board
        }
        if (messageArea) {
            messageArea.textContent = '';
        }
        matchedPairs = 0;
        flippedCards = [];
        gameItems = shuffle([...items, ...items]);

        gameItems.forEach((item, index) => {
            const card = document.createElement('div') as HTMLDivElement;
            card.classList.add('card');
            card.dataset.id = String(index); // Unique ID for each card
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

            card.addEventListener('click', handleCardClick as EventListener);
            if (gameBoard) {
                gameBoard.appendChild(card);
            }
        });
    }

    // Function to handle card click
    function handleCardClick(event: MouseEvent): void {
        const clickedCard = event.currentTarget as HTMLDivElement;

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
    function checkForMatch(): void {
        const [card1, card2] = flippedCards;

        if (card1.dataset.item === card2.dataset.item) {
            // Match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            flippedCards = [];

            if (matchedPairs === totalPairs && messageArea) {
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
    if (resetButton) {
        resetButton.addEventListener('click', createBoard);
    }

    // Difficulty setting function
    window.setDifficulty = function(level: string): void {
        currentDifficulty = level;
        createBoard();
    };

    // Initialize the game
    createBoard();
});
