const SESSION_KEYS = {
  USERNAME: "USERNAME",
  DIFFICULTY: "DIFFICULTY",
  CURRENT_EDITING_COLOR: "CURRENT_EDITING_COLOR",
  CURRENT_SELECTION: "CURRENT_SELECTION",
  CURRENT_TRIES: "CURRENT_TRIES",
  SECRET_COMBINATION: "SECRET_COMBINATION",
};

const COLORS = ["green", "red", "blue", "yellow", "purple", "orange"];

const DIFFICULTY = {
  ["beginner"]: {
    maxTries: 10,
    maxLength: 4,
  },
  ["medium"]: {
    maxTries: 8,
    maxLength: 5,
  },
  ["advanced"]: {
    maxTries: 6,
    maxLength: 6,
  },
};

window.addEventListener("DOMContentLoaded", () => {
  const getCurrentSelection = () =>
    JSON.parse(sessionStorage.getItem(SESSION_KEYS.CURRENT_SELECTION)) || {};
  const getCurrentDifficulty = () =>
    sessionStorage.getItem(SESSION_KEYS.DIFFICULTY);
  const getCurrentTries = () =>
    JSON.parse(sessionStorage.getItem(SESSION_KEYS.CURRENT_TRIES)) || [];
  const getCurrentEditingColor = () =>
    sessionStorage.getItem(SESSION_KEYS.CURRENT_EDITING_COLOR);
  const getSecretCombination = () =>
    JSON.parse(sessionStorage.getItem(SESSION_KEYS.SECRET_COMBINATION));

  const getMaxLength = () => DIFFICULTY[getCurrentDifficulty()]?.maxLength;
  const getMaxTries = () => DIFFICULTY[getCurrentDifficulty()]?.maxTries;

  // username input
  const usernameInput = document.querySelector("#usernameInput");
  if (usernameInput) {
    usernameInput.addEventListener("input", (e) => {
      sessionStorage.setItem(SESSION_KEYS.USERNAME, e.target.value);
    });
  }

  const clearSelection = () => {
    sessionStorage.setItem(SESSION_KEYS.CURRENT_SELECTION, JSON.stringify({}));
    const currentColorContainer = document.querySelector(
      "#currentColorContainer"
    );
    if (currentColorContainer) {
      const colorPickers =
        currentColorContainer.querySelectorAll(".colorPicker");
      for (const picker of colorPickers) {
        picker.style.backgroundColor = "transparent";
      }
    }
  };

  const setupTries = () => {
    const currentTries = getCurrentTries();
    const rowsContainer = document.querySelector("#triesContainer");
    const maxTries = getMaxTries();
    const maxLength = getMaxLength();

    if (rowsContainer) {
      rowsContainer.innerHTML = "";
      for (const row of Array.from(Array(maxTries).keys())) {
        const currentRow = document.createElement("div");
        currentRow.classList.add("rowContainer");
        const elementValue = currentTries[row];

        const valuesContainer = document.createElement("div");
        valuesContainer.classList.add("valuesContainer");

        for (const index in Array.from(Array(maxLength).keys())) {
          const squareElem = document.createElement("div");
          squareElem.classList.add("colorPicker");
          if (elementValue) {
            squareElem.style.backgroundColor = elementValue[index];
          }
          valuesContainer.append(squareElem);
        }

        currentRow.append(valuesContainer);

        if (elementValue) {
          const hintContainer = document.createElement("div");
          hintContainer.classList.add("hintContainer");

          for (const hint of getHints(elementValue)) {
            const hintElem = document.createElement("div");
            hintElem.classList.add("hint");

            if (hint == "match") hintElem.classList.add("match");
            if (hint == "exists") hintElem.classList.add("exists");

            hintContainer.append(hintElem);
          }

          currentRow.append(hintContainer);
        }

        rowsContainer.append(currentRow);
      }
    }
  };

  const getHints = (combination) => {
    const combinationSimilarity = [];
    const secretCombination = getSecretCombination();

    for (let i = 0; i < secretCombination.length; i++) {
      if (secretCombination[i] === combination[i]) {
        combinationSimilarity[i] = "match";
        secretCombination[i] = null;
      }
    }

    for (const key in combination) {
      const value = combination[key];
      if (secretCombination[key]) {
        if (secretCombination.includes(value)) {
          combinationSimilarity[key] = "exists";
        } else {
          combinationSimilarity[key] = "fail";
        }
      }
    }

    return combinationSimilarity;
  };

  const resetGame = () => {
    for (const key in SESSION_KEYS) {
      sessionStorage.removeItem(key);
    }
  };

  const checkCombination = () => {
    const currentTries = getCurrentTries();
    const secretCombination = getSecretCombination();
    const lastCombination = Object.values(
      currentTries[currentTries.length - 1]
    );

    return lastCombination.toString() === secretCombination.toString();
  };

  const hasMoreTries = () => {
    const maxTries = getMaxTries() - 1;
    const currentTries = getCurrentTries().length;
    return !(maxTries < currentTries);
  };

  const setupSubmit = () => {
    // Submit behaviour
    const submitButton = document.querySelector("#submitSelection");
    const maxLength = getMaxLength();
    const currentTries = getCurrentTries();

    if (submitButton) {
      submitButton.addEventListener("click", () => {
        const currentSelection = getCurrentSelection();
        if (Object.keys(currentSelection).length < maxLength)
          return alert("You are missing colors.");

        currentTries.push(currentSelection);
        sessionStorage.setItem(
          SESSION_KEYS.CURRENT_TRIES,
          JSON.stringify(currentTries)
        );
        clearSelection();
        setupTries();

        if (checkCombination()) {
          resetGame();
          window.location.href = "./win.html";
        }
        if (!hasMoreTries()) {
          resetGame();
          window.location.href = "./lose.html";
        }
      });
    }
  };

  const setupLevelIndicator = () => {
    // show current level in game screen
    const currentLevelContainer = document.querySelector("#currentLevel");
    if (currentLevelContainer)
      currentLevelContainer.innerHTML = getCurrentDifficulty();
  };

  const setupCurrentColors = () => {
    // Retrieving maxLength per difficulty, based in sessionStorage value
    const currentDifficulty = getCurrentDifficulty();
    const maxLength = getMaxLength();
    const currentSelection = getCurrentSelection();
    const currentTries = getCurrentTries();

    // Retrieving currentColor container
    const currentColorContainer = document.querySelector(
      "#currentColorContainer"
    );
    if (currentColorContainer) {
      // Per each color we can add in this difficulty
      for (let i = 0; i < maxLength; i++) {
        // Creating element per each color that we can choose
        const colorPickerElem = document.createElement("div");
        colorPickerElem.classList.add("colorPicker");

        // if this button has a value from currentSelection use it to set color
        if (currentSelection[i])
          colorPickerElem.style.backgroundColor = currentSelection[i];

        // set click behaviour, set editing color and navigate
        colorPickerElem.addEventListener("click", () => {
          sessionStorage.setItem(SESSION_KEYS.CURRENT_EDITING_COLOR, i);
          window.location.href = "./colorselection.html";
        });

        // Adding element we created inside the container
        currentColorContainer.append(colorPickerElem);
      }
    }
  };

  const generateRandomCombination = () => {
    const maxLength = getMaxLength();
    let randomCombination = [];

    for (const index of Array(maxLength)) {
      const randomNumber = Math.floor(Math.random() * maxLength);
      const randomColor = COLORS[randomNumber];
      randomCombination.push(randomColor);
    }
    return randomCombination;
  };

  const setupDifficultiesScreen = () => {
    const difficultiesContainer = document.querySelector(
      "#difficultiesContainer"
    );
    if (difficultiesContainer) {
      for (const difficulty in DIFFICULTY) {
        const difficultyElem = document.createElement("button");
        difficultyElem.innerHTML =
          difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        difficultyElem.classList.add("difficulty_button");
        difficultyElem.addEventListener("click", () => {
          let userName = sessionStorage.getItem(SESSION_KEYS.USERNAME);
          if (userName === "") return alert("Enter a username.");

          sessionStorage.setItem(SESSION_KEYS.DIFFICULTY, difficulty);
          sessionStorage.setItem(
            SESSION_KEYS.SECRET_COMBINATION,
            JSON.stringify(generateRandomCombination())
          );

          window.location.href = "./game.html";
        });
        difficultiesContainer.append(difficultyElem);
      }
    }
  };
  setupDifficultiesScreen();

  const setupGameBoard = () => {
    setupCurrentColors();
    setupLevelIndicator();
    setupSubmit();
    setupTries();
  };
  setupGameBoard();

  const setupColorPicker = () => {
    const currentDifficulty = getCurrentDifficulty();
    const maxLength = getMaxLength();
    const currentEditingColor = getCurrentEditingColor();

    // Retrieving currentColor container
    const colorPickerContainer = document.querySelector(
      "#colorPickerContainer"
    );

    if (colorPickerContainer) {
      // Per each color we can add in this difficulty
      for (let i = 0; i < maxLength; i++) {
        // Creating element per each color that we can choose
        const colorPickerElem = document.createElement("div");
        colorPickerElem.classList.add("colorPicker");
        const thisColor = COLORS[i];

        colorPickerElem.style.backgroundColor = thisColor;

        colorPickerElem.addEventListener("click", () => {
          // Recover selection from session and parse if it exists
          let CURRENT_SELECTION = getCurrentSelection();
          // In the object retrieved place the clicked color in the index we are editing
          CURRENT_SELECTION[currentEditingColor] = thisColor;
          // Set the value in the session storage
          sessionStorage.setItem(
            SESSION_KEYS.CURRENT_SELECTION,
            JSON.stringify(CURRENT_SELECTION)
          );
          window.location.href = "./game.html";
        });
        // Adding element we created inside the container
        colorPickerContainer.append(colorPickerElem);
      }
    }
  };
  setupColorPicker();
});
