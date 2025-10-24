document.addEventListener('DOMContentLoaded', () => {
    const questionTextElement = document.getElementById('question-text');
    const questionDisplayItemElement = document.getElementById('question-display-item');
    const homeButton = document.getElementById('homeButton');
    const optionsArea = document.getElementById('options-area');
    const feedbackTextElement = document.getElementById('feedback-text');
    const scoreElement = document.getElementById('score');
    const startQuizButton = document.getElementById('start-quiz-button');
    const nextQuestionButton = document.getElementById('next-question-button');

    let currentQuestionIndex = 0;
    let score = 0;
    let questions = []; // Will be populated by quizQuestions

    const quizQuestions = [
        {
            questionText: "What number is this?",
            displayItem: "１",
            options: ["1", "2", "3", "4"],
            correctAnswer: "1"
        },
        {
            questionText: "What number is this?",
            displayItem: "３",
            options: ["1", "2", "3", "5"],
            correctAnswer: "3"
        },
        {
            questionText: "What number is this?",
            displayItem: "５",
            options: ["2", "4", "5", "6"],
            correctAnswer: "5"
        },
        {
            questionText: "Which hiragana is this?",
            displayItem: "あ",
            options: ["い", "う", "あ", "え"],
            correctAnswer: "あ"
        },
        {
            questionText: "Which hiragana is this?",
            displayItem: "う",
            options: ["お", "う", "あ", "か"],
            correctAnswer: "う"
        },
        {
            questionText: "Which hiragana is this?",
            displayItem: "え",
            options: ["え", "い", "お", "き"],
            correctAnswer: "え"
        }
    ];

    function startQuiz() {
        questions = [...quizQuestions]; // Use a copy to allow for potential future modifications like shuffling
        currentQuestionIndex = 0;
        score = 0;
        updateScoreDisplay();
        feedbackTextElement.textContent = '';
        feedbackTextElement.className = '';
        nextQuestionButton.style.display = 'none';
        startQuizButton.textContent = 'Restart Quiz';
        startQuizButton.style.display = 'block';
        loadQuestion();
    }

    function loadQuestion() {
        if (currentQuestionIndex < questions.length) {
            const currentQuestion = questions[currentQuestionIndex];
            questionTextElement.textContent = currentQuestion.questionText;
            questionDisplayItemElement.textContent = currentQuestion.displayItem;
            optionsArea.innerHTML = ''; // Clear previous options

            currentQuestion.options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option;
                button.addEventListener('click', selectAnswer);
                optionsArea.appendChild(button);
            });
            feedbackTextElement.textContent = '';
            feedbackTextElement.className = '';
            nextQuestionButton.style.display = 'none';
            startQuizButton.style.display = 'none'; // Hide start/restart button during question
        } else {
            endQuiz();
        }
    }

    function selectAnswer(event) {
        const selectedButton = event.target;
        const correctAnswer = questions[currentQuestionIndex].correctAnswer;

        // Disable all option buttons
        Array.from(optionsArea.children).forEach(button => {
            button.disabled = true;
            button.classList.add('disabled');
             // Highlight correct and incorrect answers
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            } else if (button === selectedButton) {
                button.classList.add('incorrect');
            }
        });

        if (selectedButton.textContent === correctAnswer) {
            score++;
            feedbackTextElement.textContent = 'Correct!';
            feedbackTextElement.className = 'correct';
        } else {
            feedbackTextElement.textContent = `Incorrect. The correct answer was ${correctAnswer}.`;
            feedbackTextElement.className = 'incorrect';
        }
        updateScoreDisplay();
        nextQuestionButton.style.display = 'block';
    }

    function nextQuestion() {
        currentQuestionIndex++;
        loadQuestion();
    }

    function endQuiz() {
        questionTextElement.textContent = 'Quiz Finished!';
        questionDisplayItemElement.textContent = `🎉`; // Celebration emoji
        optionsArea.innerHTML = '';
        feedbackTextElement.textContent = `Your final score is ${score} out of ${questions.length}.`;
        feedbackTextElement.className = '';
        nextQuestionButton.style.display = 'none';
        startQuizButton.textContent = 'Restart Quiz';
        startQuizButton.style.display = 'block';
    }

    function updateScoreDisplay() {
        scoreElement.textContent = score;
    }

    startQuizButton.addEventListener('click', startQuiz);
    nextQuestionButton.addEventListener('click', nextQuestion);

    // Initial message before starting
    questionTextElement.textContent = 'Press "Start Quiz" to begin.';
    questionDisplayItemElement.textContent = '🧠';
    optionsArea.innerHTML = '';
    // Home button event listener
    homeButton.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    feedbackTextElement.textContent = '';
    scoreElement.textContent = '0';
});
