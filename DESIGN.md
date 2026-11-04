# Bulls and Cows — Design Document

## 1. Project Architecture

Bulls and Cows is a browser-based guessing game developed with TypeScript using functional programming principles.

The application separates game logic, user interface, and persistence.

**Game logic** is implemented as independent functions that do not access the DOM or browser storage.

**User interface** is implemented in `src/index.ts`. It is responsible for creating HTML elements, handling user interactions, and updating the displayed game state.

**Persistence** is implemented in `src/leaderboard.ts`. It is responsible for saving and loading leaderboard results using `localStorage`.

This separation makes the application easier to test, understand, and maintain.

### 1.1 TypeScript Compilation and Browser Modules

The application uses TypeScript for both game logic and user interface code.

TypeScript source files are stored in the `src/` directory and compiled into JavaScript files in the `dist/` directory using `tsc`.

The project uses native ES modules without requiring a bundler.

Relative imports use the `.js` extension so that compiled JavaScript modules can be resolved by the browser.

The application entry point is `src/index.ts`, which compiles to `dist/index.js` and is loaded from `index.html` using `<script type="module">`.

The HTML body contains only the script element. All interface elements are created dynamically using DOM methods such as `document.createElement`, `append`, and `textContent`.

The application does not use `innerHTML` or `insertAdjacentHTML` to generate dynamic content.

Visual styling is defined in `style.css`.

Unit tests are written in TypeScript and executed using Vitest.

## 2. Data Structures

### 2.1 Game Settings

The game settings contain two values:

- `length` — the number of digits in the secret, from 2 to 6.
- `base` — the numeral system: 2, 8, 10, or 16.

The selected length cannot exceed the base. For binary games, only length 2 is available.

Settings are selected before starting a round and cannot be changed during an active game.

The interface updates the available lengths when the numeral system changes.

### 2.2 Game State

**File:** `src/gameTypes.ts`

The game state is represented by a TypeScript object containing:

- `secret` — the generated secret as a string.
- `length` — the selected secret length.
- `base` — the selected numeral system.
- `status` — either `playing` or `won`.
- `history` — an array of previous guesses.
- `startedAt` — the round start timestamp.

A string is used for the secret to preserve leading zeros.

For example, `0123` is a valid four-digit secret.

The current game state is managed by the interface, while game state transitions are calculated separately by `submitGuess`.

### 2.3 Guess History

**Files:** `src/gameTypes.ts`, `src/submitGuess.ts`

Each guess is represented by an object containing:

- `guess` — the player's input.
- `bulls` — the number of digits in the correct positions.
- `cows` — the number of correct digits in incorrect positions.

The history is stored in an array to preserve the chronological order of attempts.

The `submitGuess` function updates the history immutably by creating a new array:

```ts
history: [...state.history, newEntry];
```

Existing history entries are not modified.

The function also prevents duplicate guesses from creating additional history entries.

### 2.4 Leaderboard

**File:** `src/leaderboard.ts`

Each leaderboard entry contains:

- `attempts` — the number of attempts required to win.
- `elapsedSeconds` — the completion time in seconds.
- `length` — the secret length.
- `base` — the numeral system.

Results are stored in browser `localStorage`.

The leaderboard contains up to 10 best results.

Entries are sorted by:

1. Number of attempts, in ascending order.
2. Completion time, in ascending order when the number of attempts is equal.

The `sortLeaderboard` function creates a copy of the input array before sorting, so the original array is not modified.

The `loadLeaderboard` function reads saved results from `localStorage`.

The `saveLeaderboard` function adds a new result, sorts the leaderboard, limits it to 10 entries, and saves the updated results.

Browser storage operations are wrapped in error handling so that unavailable or invalid storage data does not prevent the game from running.

The interface displays the length and numeral system associated with each result, allowing scores from different configurations to remain identifiable.

## 3. Core Algorithms

### 3.1 generateSecret

**File:** `src/generateSecret.ts`

The function generates a secret consisting of unique digits in the selected numeral system.

Algorithm:

1. Create an array of available digits from `0` to `base - 1`.
2. Validate the requested secret length.
3. Select a random index from the available digits.
4. Remove the selected digit from the array using `splice`.
5. Append the selected digit to the secret string.
6. Repeat until the secret reaches the requested length.

Removing selected digits prevents duplicates.

The random number generator is passed as a parameter, making the function testable with a deterministic random source.

The generated secret may start with zero.

### 3.2 evaluateGuess

**File:** `src/evaluateGuess.ts`

The function compares a player's guess with the secret and returns the number of bulls and cows.

A **bull** is a correct digit in the correct position.

A **cow** is a correct digit in an incorrect position.

Algorithm:

1. Convert the secret and guess to lowercase.
2. Split both strings into arrays of characters.
3. Use `filter` to count digits that match at the same index (bulls).
4. Use another `filter` to count digits that exist in the secret but occupy different positions (cows).
5. Return an object containing `bulls` and `cows`.

Array methods are used instead of manual counter loops, demonstrating higher-order functions.

The game validates guesses before evaluating them, ensuring that the guess contains unique digits.

### 3.3 createDigitValidator

**File:** `src/createDigitValidator.ts`

This function accepts a numeral system base and returns a predicate function.

The returned predicate checks whether a character belongs to the selected numeral system.

For hexadecimal digits, uppercase and lowercase letters are treated equally.

This demonstrates a curried-style function factory.

The same validation logic is reused in:

- `src/isValidGuess.ts` — validating complete guesses.
- `src/index.ts` — filtering invalid characters during user input.

This prevents duplicated validation rules.

### 3.4 isValidGuess

**File:** `src/isValidGuess.ts`

The function validates a player's guess.

Algorithm:

1. Check whether the guess length matches the configured length.
2. Create a digit validator for the selected base.
3. Convert the guess to lowercase.
4. Use `every` to verify that all characters are allowed.
5. Use a `Set` to check that all digits are unique.
6. Return `true` only when all validation conditions are satisfied.

The function does not modify the input or access browser elements.

### 3.5 countPossibleSecrets

**File:** `src/countPossibleSecrets.ts`

The function calculates the number of possible secrets without repeated digits.

A secret may start with zero.

The number of possible secrets is the number of permutations:

\[
P(base, length) = \frac{base!}{(base - length)!}
\]

The function uses recursion:

```text
countPossibleSecrets(length, base)
  = base * countPossibleSecrets(length - 1, base - 1)
```

Base cases:

- If `length` is greater than `base`, return `0`.
- If `length` is zero, return `1`.
- Invalid negative values return `0`.

The implementation uses a `Map` for memoization.

Each computed result is stored using a key containing `length` and `base`.

Before calculating a result, the function checks whether it is already cached.

This avoids repeating the same calculation for previously requested arguments.

### 3.6 submitGuess

**File:** `src/submitGuess.ts`

The `submitGuess` function handles a single game state transition.

Algorithm:

1. Check whether the game is still in progress.
2. Normalize the guess to lowercase.
3. Validate the guess using `isValidGuess`.
4. Check whether the guess already exists in the history.
5. Evaluate the guess using `evaluateGuess`.
6. Create a new history entry.
7. Return a new game state with an updated history and status.

If the guess is invalid, already used, or submitted after the game has ended, the function returns the existing state without modifying it.

When the number of bulls equals the secret length, the returned state has the status `won`.

The function does not access the DOM or browser storage.

## 4. Time and Space Complexity

Let `n` be the secret length and `b` be the numeral system base.

### 4.1 generateSecret

**Time complexity: O(b + n × b)**

Creating the array of available digits takes O(b).

The function selects `n` digits. Each `splice` operation may shift elements in the array, taking O(b) time in the worst case.

Therefore, the overall time complexity is O(b + n × b).

**Space complexity: O(b + n)**

The function stores an array of `b` available digits and builds a secret string containing `n` characters.

### 4.2 evaluateGuess

**Time complexity: O(n²)**

The first `filter` checks matching positions in O(n).

The second `filter` checks each guess digit and uses `includes` to search the secret array. Each `includes` operation may take O(n).

Therefore, the worst-case time complexity is O(n²).

**Space complexity: O(n)**

The function creates arrays of secret and guess characters. Their sizes depend on the secret length.

### 4.3 isValidGuess

**Time complexity: O(n × b)**

Checking the length takes O(1).

The `every` method processes up to `n` characters. The validator uses `includes` on a string containing up to `b` allowed digits, so validation takes O(n × b) in the general case.

Creating a `Set` of guess digits takes O(n) on average.

Therefore, the overall time complexity is O(n × b).

Since the supported bases are limited to 2, 8, 10, and 16, the practical complexity with respect to `n` is O(n).

**Space complexity: O(n + b)**

The function creates an array of `n` characters and a `Set` containing up to `n` unique digits.

The validator also stores a string of up to `b` allowed characters.

### 4.4 countPossibleSecrets

**Time complexity: O(n) for an uncached calculation**

The recursive function decreases `length` by one at every step until it reaches zero.

Each recursive step performs a constant amount of work, assuming constant-time `Map` operations on the small keys used by the application.

Therefore, the first calculation takes O(n) time.

A previously cached result can be retrieved in O(1) expected time.

**Space complexity: O(n)**

The recursion requires up to `n` stack frames.

Memoization stores up to `n` computed results for one previously uncached calculation.

The cache persists between function calls, so its total memory usage grows with the number of distinct argument pairs cached.

## 5. Clean Code Principles

### 5.1 Meaningful Names

Functions and variables have descriptive names that explain their purpose.

Examples:

- `generateSecret` — generates a secret number.
- `evaluateGuess` — evaluates a player's guess.
- `isValidGuess` — checks whether a guess is valid.
- `createDigitValidator` — creates a digit validation function.
- `countPossibleSecrets` — calculates the number of possible secrets.
- `submitGuess` — processes a guess and returns the next game state.
- `sortLeaderboard` — sorts and limits leaderboard results.

In `src/evaluateGuess.ts`, the variables `secretDigits`, `guessDigits`, `bulls`, and `cows` describe their roles without requiring additional comments.

### 5.2 Single Responsibility Principle

Each function has one clearly defined responsibility.

Examples:

- `src/generateSecret.ts` — secret generation.
- `src/evaluateGuess.ts` — comparison of a secret and a guess.
- `src/isValidGuess.ts` — guess validation.
- `src/countPossibleSecrets.ts` — counting possible secrets.
- `src/submitGuess.ts` — game state transitions.
- `src/leaderboard.ts` — leaderboard sorting and persistence.

Separating responsibilities makes functions easier to understand, test, and maintain.

### 5.3 Don't Repeat Yourself (DRY)

The digit validation logic is centralized in `src/createDigitValidator.ts`.

The `isValidGuess` function reuses `createDigitValidator` instead of implementing the same character validation logic again.

The UI also reuses this validator when filtering player input.

This prevents duplicated validation rules.

### 5.4 Pure Functions and Separation of Concerns

The core game functions are independent of the DOM, `localStorage`, and user interface elements.

For example, `evaluateGuess` receives a secret and a guess as arguments and returns a result without changing external state.

`generateSecret` accepts a random number generator as an argument, allowing deterministic testing.

The memoization cache in `countPossibleSecrets` is an internal implementation detail. The function returns the same result for the same valid inputs, although the cache itself is mutable.

The `sortLeaderboard` function is also pure: it returns a sorted copy without modifying its input.

Browser interactions and `localStorage` operations remain outside the core game logic.

The persistence functions `loadLeaderboard` and `saveLeaderboard` are intentionally not pure because they interact with browser storage.

### 5.5 Small Functions

Core functions are focused on specific tasks rather than combining validation, calculation, rendering, and persistence.

For example, `isValidGuess` checks the input and returns a boolean. It does not display error messages or modify the page.

Similarly, `submitGuess` calculates the next game state without rendering HTML.

The `renderLeaderboard` function in `src/index.ts` is responsible only for displaying leaderboard entries.

This reduces complexity and makes individual functions easier to test.

### 5.6 Immutability

The game state and guess history are updated by creating new objects and arrays rather than modifying existing ones.

For example, `submitGuess` returns a new state:

```ts
return {
  ...state,
  history: [...state.history, newEntry],
  status: result.bulls === state.length ? 'won' : 'playing',
};
```

This approach preserves previous history entries and makes state changes predictable.

The leaderboard follows the same principle when sorting results:

```ts
return [...entries]
  .sort(
    (first, second) =>
      first.attempts - second.attempts ||
      first.elapsedSeconds - second.elapsedSeconds,
  )
  .slice(0, MAX_RESULTS);
```

The original leaderboard array remains unchanged.

The interface updates its current state reference after receiving a new state from the game logic.

Game state transitions remain separate from DOM rendering.

## 6. Testing and TDD

**Test runner:** Vitest

The project follows Test-Driven Development for the five mandatory core functions:

- `generateSecret`
- `evaluateGuess`
- `isValidGuess`
- `createDigitValidator`
- `countPossibleSecrets`

For each mandatory function, failing tests were committed before the corresponding implementation.

The implementation was then committed separately after the tests passed.

Tests follow the FIRST principles:

- **Fast** — tests execute quickly.
- **Independent** — tests do not depend on execution order.
- **Repeatable** — deterministic inputs produce predictable results.
- **Self-validating** — assertions automatically verify expected behavior.
- **Timely** — tests were written before the implementations.

The project also includes tests for `submitGuess`, covering game state transitions, duplicate guesses, and winning conditions.

The current test suite contains 41 tests across six test files.

## 7. Development Tools

The project uses:

- **TypeScript** for static typing.
- **ESLint** for code quality checks.
- **Prettier** for consistent formatting.
- **Vitest** for unit testing.
- **Husky** for Git hooks.
- **lint-staged** for checking staged files.

The `pre-commit` hook runs `lint-staged`, which applies ESLint and Prettier to relevant staged files.

The `pre-push` hook runs `npm test` to prevent pushing changes when tests fail.

The project provides the following npm scripts:

- `npm run lint`
- `npm run format`
- `npm test`

TypeScript compilation is performed using:

```bash
npx tsc
```

## 8. User Interface and Game Flow

**File:** `src/index.ts`

The interface is generated dynamically using TypeScript and DOM methods.

The game flow is:

1. The player selects a numeral system and secret length.
2. The interface displays the number of possible secrets.
3. The player starts a new round.
4. The application generates a secret number.
5. The player enters a guess.
6. Invalid characters and duplicate digits are filtered during input.
7. The guess is validated and evaluated.
8. The result is added to the guess history.
9. The player continues until the secret is guessed.
10. The game displays the number of attempts and elapsed time.
11. The result is saved to the leaderboard.
12. The player can start a new game without reloading the page.

The leaderboard is stored in `localStorage`, so saved results remain available after a page reload.

The interface supports binary, octal, decimal, and hexadecimal numeral systems.

Hexadecimal input is case-insensitive.

The application uses a responsive, minimalist interface defined in `style.css`.

The game logic remains independent of the interface and can be tested without a browser.
