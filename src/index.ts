import {
  loadLeaderboard,
  saveLeaderboard,
  type LeaderboardEntry,
} from './leaderboard.js';
import { generateSecret } from './generateSecret.js';
import type { GameState } from './gameTypes.js';
import { countPossibleSecrets } from './countPossibleSecrets.js';
import { createDigitValidator } from './createDigitValidator.js';
import { isValidGuess } from './isValidGuess.js';
import { submitGuess } from './submitGuess.js';

const title = document.createElement('h1');
title.textContent = 'Bulls and Cows';

const description = document.createElement('p');
description.textContent = 'Guess the secret number with unique digits.';

// Settings container
const settings = document.createElement('section');

// Number system
const baseLabel = document.createElement('label');
baseLabel.textContent = 'Number system:';
baseLabel.htmlFor = 'base';

const baseSelect = document.createElement('select');
baseSelect.id = 'base';

const numberSystems = [
  { label: 'Binary (2)', value: '2' },
  { label: 'Octal (8)', value: '8' },
  { label: 'Decimal (10)', value: '10' },
  { label: 'Hexadecimal (16)', value: '16' },
];

numberSystems.forEach((system) => {
  const option = document.createElement('option');
  option.value = system.value;
  option.textContent = system.label;
  baseSelect.append(option);
});

// Secret length
const lengthLabel = document.createElement('label');
lengthLabel.textContent = 'Secret length:';
lengthLabel.htmlFor = 'length';

const lengthSelect = document.createElement('select');
lengthSelect.id = 'length';

for (let length = 2; length <= 6; length += 1) {
  const option = document.createElement('option');
  option.value = String(length);
  option.textContent = String(length);
  lengthSelect.append(option);
}

// Possible combinations
const combinationsInfo = document.createElement('p');

// Start button
const startButton = document.createElement('button');
startButton.type = 'button';
startButton.textContent = 'Start Game';

// Update settings
function updateSettings(): void {
  const base = Number(baseSelect.value);

  Array.from(lengthSelect.options).forEach((option) => {
    option.disabled = Number(option.value) > base;
  });

  if (Number(lengthSelect.value) > base) {
    lengthSelect.value = String(base);
  }

  const length = Number(lengthSelect.value);
  const combinations = countPossibleSecrets(length, base);

  combinationsInfo.textContent = `Possible secret numbers: ${combinations}`;
}

baseSelect.addEventListener('change', updateSettings);
lengthSelect.addEventListener('change', updateSettings);

// Add settings to the page
settings.append(
  baseLabel,
  baseSelect,
  lengthLabel,
  lengthSelect,
  combinationsInfo,
  startButton,
);

document.body.append(title, description, settings);

// Initialize settings
updateSettings();

// Game screen
const gameScreen = document.createElement('section');
gameScreen.hidden = true;

const gameTitle = document.createElement('h2');
gameTitle.textContent = 'Game in progress';

const gameInfo = document.createElement('p');

// Guess form
const guessForm = document.createElement('form');

const guessLabel = document.createElement('label');
guessLabel.textContent = 'Your guess:';
guessLabel.htmlFor = 'guess';

const guessInput = document.createElement('input');
guessInput.id = 'guess';
guessInput.type = 'text';
guessInput.autocomplete = 'off';
guessInput.spellcheck = false;

const guessButton = document.createElement('button');
guessButton.type = 'submit';
guessButton.textContent = 'Submit Guess';

guessForm.append(guessLabel, guessInput, guessButton);

// Feedback
const feedback = document.createElement('p');
feedback.setAttribute('role', 'status');

// Guess history
const historyTitle = document.createElement('h3');
historyTitle.textContent = 'Guess history';

const historyList = document.createElement('ol');
// New game button
const newGameButton = document.createElement('button');
newGameButton.type = 'button';
newGameButton.textContent = 'New Game';

// Leaderboard
const leaderboardSection = document.createElement('section');

const leaderboardTitle = document.createElement('h2');
leaderboardTitle.textContent = 'Top 10 Leaderboard';

const leaderboardList = document.createElement('ol');

leaderboardSection.append(leaderboardTitle, leaderboardList);

function renderLeaderboard(entries: LeaderboardEntry[]): void {
  leaderboardList.replaceChildren();

  if (entries.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = 'No records yet.';
    leaderboardList.append(emptyMessage);
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement('li');

    item.textContent =
      `${entry.attempts} attempts, ` +
      `${entry.elapsedSeconds}s — ` +
      `${entry.length} digits, base ${entry.base}`;

    leaderboardList.append(item);
  });
}

renderLeaderboard(loadLeaderboard());

// Add game elements
gameScreen.append(
  gameTitle,
  gameInfo,
  guessForm,
  feedback,
  historyTitle,
  historyList,
  newGameButton,
  leaderboardSection,
);

document.body.append(gameScreen);

// Current game state
let gameState: GameState | null = null;

// Start game
startButton.addEventListener('click', () => {
  const length = Number(lengthSelect.value);
  const base = Number(baseSelect.value);

  const secret = generateSecret(length, base);

  gameState = {
    secret,
    length,
    base,
    status: 'playing',
    history: [],
    startedAt: Date.now(),
  };

  settings.hidden = true;
  gameScreen.hidden = false;

  gameInfo.textContent = `Guess a ${gameState.length}-digit number in base ${gameState.base}.`;

  guessInput.maxLength = gameState.length;
  guessInput.value = '';
  guessInput.disabled = false;
  guessButton.disabled = false;

  feedback.textContent = '';
  historyList.replaceChildren();

  guessInput.focus();
});

// Filter input characters
guessInput.addEventListener('input', () => {
  const state = gameState;

  if (state === null || state.status !== 'playing') {
    return;
  }

  const isDigitValid = createDigitValidator(state.base);
  const uniqueDigits = new Set<string>();

  for (const char of guessInput.value) {
    const digit = char.toLowerCase();

    if (isDigitValid(digit) && uniqueDigits.size < state.length) {
      uniqueDigits.add(digit);
    }
  }

  guessInput.value = Array.from(uniqueDigits).join('');
});

// Submit guess
guessForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (gameState === null || gameState.status !== 'playing') {
    return;
  }

  const guess = guessInput.value.toLowerCase();

  if (!isValidGuess(guess, gameState.length, gameState.base)) {
    feedback.textContent = 'Enter a valid number with unique digits.';
    return;
  }

  const previousState = gameState;
  const nextState = submitGuess(previousState, guess);

  if (nextState === previousState) {
    feedback.textContent = 'You have already tried this number.';
    return;
  }

  gameState = nextState;

  const lastEntry = gameState.history.at(-1);

  if (lastEntry === undefined) {
    return;
  }

  const historyItem = document.createElement('li');

  historyItem.textContent =
    `${lastEntry.guess.toUpperCase()} — ` +
    `${lastEntry.bulls} Bulls, ${lastEntry.cows} Cows`;

  historyList.append(historyItem);

  guessInput.value = '';

  if (gameState.status === 'won') {
    const attempts = gameState.history.length;

    const elapsedSeconds = Math.floor(
      (Date.now() - gameState.startedAt) / 1000,
    );

    feedback.textContent =
      `You won! Attempts: ${attempts}. ` + `Time: ${elapsedSeconds} seconds.`;

    guessInput.disabled = true;
    guessButton.disabled = true;

    const updatedLeaderboard = saveLeaderboard({
      attempts,
      elapsedSeconds,
      length: gameState.length,
      base: gameState.base,
    });

    renderLeaderboard(updatedLeaderboard);
  } else {
    feedback.textContent = 'Try again!';
    guessInput.focus();
  }
});

// Return to settings without reloading the page
newGameButton.addEventListener('click', () => {
  gameState = null;

  guessInput.value = '';
  guessInput.disabled = false;
  guessButton.disabled = false;

  feedback.textContent = '';
  historyList.replaceChildren();

  gameScreen.hidden = true;
  settings.hidden = false;

  updateSettings();
});
