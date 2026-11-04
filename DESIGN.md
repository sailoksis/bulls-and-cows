# Bulls and Cows — Design Document

## 1. Project Architecture

Bulls and Cows is a browser-based guessing game developed with TypeScript using functional programming principles.

The application separates game logic from the user interface.

**Game logic** is implemented as independent functions that do not access the DOM or browser storage.

**User interface** is responsible for displaying the game, handling user interactions, and updating the page.

**Persistence** is responsible for saving and loading leaderboard results using localStorage.

This separation makes the game logic easier to test, understand, and maintain.

### 1.1 TypeScript Compilation and Browser Modules

The application uses TypeScript for both game logic and user interface code.

TypeScript source files are stored in the `src/` directory and compiled into JavaScript files in the `dist/` directory using `tsc`.

The project uses native ES modules without requiring a bundler.

Relative imports use the `.js` extension so that the compiled JavaScript modules can be resolved by the browser.

The application entry point is `src/index.ts`, which compiles to `dist/index.js` and is loaded from `index.html` using `<script type="module">`.

Unit tests are written in TypeScript and executed using Vitest.

## 2. Data Structures

### 2.1 Game Settings

The game settings contain two values:

- `length` — the number of digits in the secret, from 2 to 6.
- `base` — the numeral system: 2, 8, 10, or 16.

The selected length cannot exceed the base. For binary games, only length 2 is available.

Settings cannot be changed after a round starts.

### 2.2 Game State

The game state will be represented by a TypeScript object containing:

- `secret` — the generated secret as a string.
- `length` — the selected secret length.
- `base` — the selected numeral system.
- `status` — whether the game is in progress or won.
- `history` — an array of previous guesses.
- `startedAt` — the round start timestamp.

A string is used for the secret to preserve leading zeros.

### 2.3 Guess History

Each guess will be represented by an object containing:

- `guess` — the player's input.
- `bulls` — the number of digits in the correct positions.
- `cows` — the number of correct digits in incorrect positions.

The history will be stored in an array to preserve the chronological order of attempts.

The history will be updated immutably by creating a new array:

```ts
const nextHistory = [...history, newEntry];
```

Existing history entries will not be modified.

### 2.4 Leaderboard

Each leaderboard entry will contain:

- The number of attempts.
- The completion time.
- The secret length.
- The numeral system.

Results will be stored in localStorage.

Leaderboard entries will be sorted by the number of attempts, then by completion time when attempts are equal.

The leaderboard will display the settings associated with each result so that scores from different game configurations remain identifiable.

## 3. Core Algorithms

### 3.1 generateSecret

**File:** `src/generateSecret.ts`

The function generates a secret consisting of unique digits in the selected numeral system.

Algorithm:

1. Create an array of available digits from `0` to `base - 1`.
2. Validate the requested secret length.
3. Select a random index from the available digits.
4. Remove the selected digit from the array using `splice`.
5. Append the digit to the secret string.
6. Repeat until the secret reaches the requested length.

Removing selected digits prevents duplicates.

The random number generator is passed as a parameter, making the function testable with a deterministic random source.

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

This demonstrates a curried-style function factory and allows the same validation logic to be reused in guess validation and UI input filtering.

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

### 3.5 countPossibleSecrets

**File:** `src/countPossibleSecrets.ts`

The function calculates the number of possible secrets without repeated digits.

A secret may start with zero.

The number of possible secrets is the number of permutations:

P(base, length) = base! / (base - length)!

The function uses recursion:

countPossibleSecrets(length, base) = base × countPossibleSecrets(length - 1, base - 1)

Base cases:

- If `length` is greater than `base`, return `0`.
- If `length` is zero, return `1`.
- Invalid negative values return `0`.

The implementation uses a `Map` for memoization.

Each computed result is stored using a key containing `length` and `base`.

Before calculating a result, the function checks whether it is already cached.

This avoids repeating the same calculation for previously requested arguments.

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

In `src/evaluateGuess.ts`, the variables `secretDigits`, `guessDigits`, `bulls`, and `cows` describe their roles without requiring additional comments.

### 5.2 Single Responsibility Principle

Each function has one clearly defined responsibility.

Examples:

- `src/generateSecret.ts` — secret generation.
- `src/evaluateGuess.ts` — comparison of a secret and a guess.
- `src/isValidGuess.ts` — guess validation.
- `src/countPossibleSecrets.ts` — counting possible secrets.

Separating responsibilities makes the functions easier to understand, test, and maintain.

### 5.3 Don't Repeat Yourself (DRY)

The digit validation logic is centralized in `src/createDigitValidator.ts`.

The `isValidGuess` function reuses `createDigitValidator` instead of implementing the same character validation logic again.

The UI will also reuse this validator when filtering player input.

This prevents duplicated validation rules.

### 5.4 Pure Functions and Separation of Concerns

The core game functions are independent of the DOM, localStorage, and user interface elements.

For example, `evaluateGuess` receives a secret and a guess as arguments and returns a result without changing external state.

`generateSecret` accepts a random number generator as an argument, allowing deterministic testing.

The memoization cache in `countPossibleSecrets` is an internal implementation detail. The function returns the same result for the same valid inputs, although the cache itself is mutable.

Browser interactions and localStorage operations will remain outside the core game logic.

### 5.5 Small Functions

Core functions are focused on specific tasks rather than combining validation, calculation, rendering, and persistence.

For example, `isValidGuess` checks the input and returns a boolean. It does not display error messages or modify the page.

This reduces complexity and makes individual functions easier to test.

### 5.6 Immutability

The game state and guess history will be updated by creating new objects and arrays rather than modifying existing ones.

For example:

```ts
const nextState = {
  ...state,
  history: [...state.history, newEntry],
};
```

This approach preserves previous history entries and makes state changes predictable.

The immutable state update logic will be implemented separately from DOM rendering.
