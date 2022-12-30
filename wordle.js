const letters = document.querySelectorAll('.gameboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;



async function init() {

  let currentGuess = '';
  let currentRow = 0;
  let isLoading = true;
  setLoading(true);

// grabbing the word of the day
  const response = await fetch("https://words.dev-apis.com/word-of-the-day");
  const resObject = await response.json();
  const word = resObject.word.toUpperCase();
  const wordParts = word.split("");
  let done = false;
  setLoading(false);
  isLoading = false;

  console.log(word);

//user adds letters to current guess
  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH){
      //add letter to the end
      currentGuess += letter;
    }
    else {
      //replace the last letter
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    //writing the keystroke to the DOM
    //keeping track of which row you are on based on the ANSWER_LENGTH
    letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText = letter;
  }


  async function commit() {
    if (currentGuess.length != ANSWER_LENGTH) {
      // DO nothing
      return;
    }
    else {

      // TODO validate the word

      isLoading = true;
      setLoading(true);
      const response = await fetch("https://words.dev-apis.com/validate-word", {
        method : "POST",
        body: JSON.stringify({ word: currentGuess })
      });

      const resObject = await response.json();
      const validWord = resObject.validWord;

      isLoading = false;
      setLoading(false);

      if(!validWord) {
        markInvalidWord();
        return;
      }

      // splitting guess into individual pieces for checking
      const guessParts = currentGuess.split("");
      const map = makeMap(wordParts);

      for (let i = 0; i < ANSWER_LENGTH; i++) {
        // mark guessed letters as correct
        if (guessParts[i] === wordParts[i]) {
          letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
          map[guessParts[i]]--;
        }
      }

//second pass to check for close and wrong letters

      for (let i = 0; i < ANSWER_LENGTH; i++) {
        // mark guessed letters as correct
        if (guessParts[i] === wordParts[i]) {
          // do nothing, we already marked as correct
        } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
          //TODO make this more accurate
          //mark as close
          letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
          map[guessParts[i]]--;
        } else {
          //mark wrong
          letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
        }
      }

// win or lose conditions

if (currentGuess === word) {
  //Win
  alert('you win!');
  document.querySelector('.brand').classList.add("winner");
  done = true;
  return;
      }
    }

    //return user to the next row
    currentRow++;
    currentGuess = '';

    if (currentRow === ROUNDS ) {
      alert(`you lose. The word was ${word}`);
      done = true;
    }
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = "";
  }

  function markInvalidWord() {
    //alert('not a valid word');
    //TODO make invalid word css

    for (let i = 0; i < ANSWER_LENGTH; i++ ) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

      setTimeout(function() {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
      }, 100);
    }
  }


  document.addEventListener('keydown', function handleKeyPress(event) {

    if (done || isLoading ) {
      //do nothing
      return;
    }

    const action = event.key;
    console.log(action);
    console.log(currentRow);

    if (action === 'Enter') {
      commit();
    }
    else if (action === 'Backspace'){
      backspace();
    }
    else if (isLetter(action)) {
      addLetter(action.toUpperCase())
    }
    else {
      // do nothing
    }
  })
};

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle('show', isLoading);
}

//making map to keep track of how many of each letter
function makeMap (array) {
  const obj = {};

  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}

init();
