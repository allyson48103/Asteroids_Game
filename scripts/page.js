/* ------------------- EECS 493 Assignment 3 Starter Code ------------------ */

/* ------------------------ GLOBAL HELPER VARAIBLES ------------------------ */
// Difficulty Helpers
let astProjectileSpeed = 3;            // easy: 1, norm: 3, hard: 5

// Game Object Helpers
let currentAsteroid = 1;
const AST_OBJECT_REFRESH_RATE = 15;
const maxPersonPosX = 1218;
const maxPersonPosY = 658;
const PERSON_SPEED = 5;                // #pixels each time player moves by
const portalOccurrence = 15000;        // portal spawns every 15 seconds
const portalGone = 5000;               // portal disappears in 5 seconds
const shieldOccurrence = 10000;        // shield spawns every 10 seconds
const shieldGone = 5000;               // shield disappears in 5 seconds

// Movement Helpers
let LEFT = false;
let RIGHT = false;
let UP = false;
let DOWN = false;

// TODO: ADD YOUR GLOBAL HELPER VARIABLES (IF NEEDED)


/* --------------------------------- MAIN ---------------------------------- */
$(document).ready(function () {
  // JQUERY SELECTORS
  const $mainMenu = $('#main-menu');
  const $settingsPanel = $('#settings-panel');
  const $tutorialPage = $('#tutorial-page');
  const $playGameBtn = $('#play-game');
  const $settingsBtn = $('#open-settings');
  const $closeSettingsBtn = $('#close-settings');
  const $startGameBtn = $('#start-game');
  const $volumeSlider = $('#volume-slider');
  const $volumeValue = $('#volume-value');
  const $difficultyButtons = $('.difficulty-btn');
  const $getreadypage = $('#getready-page');
  const $scorePanel = $('.scorePanel');

  let scoreInterval; // Variable to hold the interval ID for score updates
  let difficulty = 'normal'; // Default difficulty
  let hasShield = false;
  let astProjectileSpeed = 3;
  let asteroidInterval;
  let collisionInterval;

  // Define audio objects for each sound effect
  let collectSound = new Audio('src/audio/collect.mp3');
  let dieSound = new Audio('src/audio/die.mp3');

  // Global variables for game state
  let score = 0;
  let danger = 20;  // Starting danger level for normal difficulty
  let level = 1;

  // ====== EVENT HANDLERS ======

  // Show main menu on startup
  $mainMenu.removeClass('hidden');
  $settingsPanel.addClass('hidden');
  $tutorialPage.addClass('hidden');
  $getreadypage.addClass('hidden');
  $scorePanel.addClass('hidden');

  // Transition from main menu to tutorial page when "Play game!" is clicked
  $playGameBtn.on('click', function () {
    $mainMenu.addClass('hidden');
    $settingsPanel.addClass('hidden');
    $tutorialPage.removeClass('hidden');
  });

  // Transition from main menu to settings panel when "Settings" is clicked
  $settingsBtn.on('click', function () {
    $mainMenu.addClass('hidden');
    $tutorialPage.addClass('hidden');
    $settingsPanel.removeClass('hidden');
  });

  // Close the settings panel and return to the main menu
  $closeSettingsBtn.on('click', function () {
    $settingsPanel.addClass('hidden');
    $mainMenu.removeClass('hidden');
    $tutorialPage.addClass('hidden');
  });

  // Volume slider functionality
  $volumeSlider.on('input', function () {
    $volumeValue.text($(this).val());  // Update the volume number as the slider is moved
  });

  // Difficulty selection buttons functionality
  $difficultyButtons.on('click', function () {
    $difficultyButtons.removeClass('selected');  // Remove 'selected' class from all buttons
    $(this).addClass('selected');  // Add 'selected' class to the clicked button
    difficulty = $(this).attr('id');  // IDs are 'easy', 'normal', 'hard'

    if (difficulty === 'easy') {
      danger = 10;
      astProjectileSpeed = 1;  // Easy asteroid speed
    } else if (difficulty === 'normal') {
      danger = 20;
      astProjectileSpeed = 3;  // Normal asteroid speed
    } else if (difficulty === 'hard') {
      danger = 30;
      astProjectileSpeed = 5;  // Hard asteroid speed
    }

    // Immediately update the scoreboard to reflect the selected danger level
    updateScorePanel();
  });

  $startGameBtn.on('click', function () {
   
    // Ensure difficulty is set to 'normal' if no difficulty has been chosen
    if (!difficulty) {
      difficulty = 'normal';  // Default to normal difficulty
      danger = 20;  // Set danger level to normal (20)
      astProjectileSpeed = 3;  // Set asteroid speed to normal (3x)
    }

    // Update the scoreboard before showing the "Get Ready" page
    updateScorePanel();

    $mainMenu.addClass('hidden');
    $settingsPanel.addClass('hidden');
    $tutorialPage.addClass('hidden');
    $getreadypage.removeClass('hidden');  // Show the getready-page
    $scorePanel.removeClass('hidden'); // Show score panel
  
    // Hide the "Get Ready" page and start the game after 3 seconds (3000 milliseconds)
    setTimeout(function () {
      $getreadypage.addClass('hidden');  // Hide the getready-page after 3 seconds
      startGame();  // Call a function to start the actual gameplay
    }, 3000);
  });
  
  // Function to start the actual gameplay
  function startGame() {
    console.log("Game Started");

    // Initialize score, danger, and level based on difficulty
    score = 0;
    level = 1;

    // Update the scoreboard immediately to reflect initial values
    updateScorePanel();

    // Start asteroid spawning, shields, and portals
    spawnAsteroids();
    startShieldsAndPortals();

    // Start updating the score only after the game starts
    scoreInterval = setInterval(function() {
      score += 40;  // Increase score by 40 every 500 milliseconds
      updateScorePanel();
    }, 500);

    // Continuously check for collisions
    collisionInterval = setInterval(checkCollisions, 50);  // Start checking for collisions
  }

  // Function to stop the score updates (useful when game ends)
  function stopScoreUpdates() {
    clearInterval(scoreInterval);
  }

  function stopCollisions() {
    clearInterval(collisionInterval);  // Stop checking collisions when the game ends
  }

  // Function to update the score, danger, and level on the UI
  function updateScorePanel() {
    $('#score-value').text(score);
    $('#danger-value').text(danger);
    $('#level-value').text(level);
  }

  // Example of updating level and danger when the player moves through a portal
  function increaseLevel() {
    level += 1;
    danger += 2;  // Increase danger level by 2
    astProjectileSpeed *= 1.5;  // Increase asteroid speed by 50%
    updateScorePanel();
  }


});





// Starter code below:

/* ---------------------------- GAME FUNCTIONS ----------------------------- */
// Starter Code for randomly generating and moving an asteroid on screen
class Asteroid {
  // constructs an Asteroid object
  constructor() {
    /*------------------------Public Member Variables------------------------*/
    // create a new Asteroid div and append it to DOM so it can be modified later
    const objectString = "<div id = 'a-" + currentAsteroid + "' class = 'curAsteroid' > <img src = 'src/asteroid.png'/></div>";
    asteroid_section.append(objectString);
    // select id of this Asteroid
    this.id = $('#a-' + currentAsteroid);
    currentAsteroid++; // ensure each Asteroid has its own id
    // current x, y position of this Asteroid
    this.cur_x = 0; // number of pixels from right
    this.cur_y = 0; // number of pixels from top

    /*------------------------Private Member Variables------------------------*/
    // member variables for how to move the Asteroid
    this.x_dest = 0;
    this.y_dest = 0;
    // member variables indicating when the Asteroid has reached the boarder
    this.hide_axis = 'x';
    this.hide_after = 0;
    this.sign_of_switch = 'neg';
    // spawn an Asteroid at a random location on a random side of the board
    this.#spawnAsteroid();
  }

  // Requires: called by the user
  // Modifies:
  // Effects: return true if current Asteroid has reached its destination, i.e., it should now disappear
  //          return false otherwise
  hasReachedEnd() {
    // get the current position of interest (either the x position or the y position):
    const cur_pos = this.hide_axis === "x" ? this.cur_x : this.cur_y;
    // determine if the asteroid has reached its destination:
    return this.sign_of_switch === "pos" ? (cur_pos > this.hide_after) : (cur_pos < this.hide_after);
  }

  // Requires: called by the user
  // Modifies: cur_y, cur_x
  // Effects: move this Asteroid 1 unit in its designated direction
  updatePosition() {
    // ensures all asteroids travel at current level's speed
    this.cur_y += this.y_dest * astProjectileSpeed;
    this.cur_x += this.x_dest * astProjectileSpeed;
    // update asteroid's css position
    this.id.css('top', this.cur_y);
    this.id.css('right', this.cur_x);
  }

  // Requires: this method should ONLY be called by the constructor
  // Modifies: cur_x, cur_y, x_dest, y_dest, num_ticks, hide_axis, hide_after, sign_of_switch
  // Effects: randomly determines an appropriate starting/ending location for this Asteroid
  //          all asteroids travel at the same speed
  #spawnAsteroid() {
    // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
    const x = getRandomNumber(0, 1280);
    const y = getRandomNumber(0, 720);
    const floor = 784;
    const ceiling = -64;
    const left = 1344;
    const right = -64;
    const major_axis = Math.floor(getRandomNumber(0, 2));
    const minor_aix = Math.floor(getRandomNumber(0, 2));
    let num_ticks;

    if (major_axis == 0 && minor_aix == 0) {
      this.cur_y = floor;
      this.cur_x = x;
      const bottomOfScreen = game_screen.height();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = (game_screen.width() - x);
      this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-.5, .5);
      this.y_dest = -astProjectileSpeed - getRandomNumber(0, .5);
      this.hide_axis = 'y';
      this.hide_after = -64;
      this.sign_of_switch = 'neg';
    }
    if (major_axis == 0 && minor_aix == 1) {
      this.cur_y = ceiling;
      this.cur_x = x;
      const bottomOfScreen = game_screen.height();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = (game_screen.width() - x);
      this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-.5, .5);
      this.y_dest = astProjectileSpeed + getRandomNumber(0, .5);
      this.hide_axis = 'y';
      this.hide_after = 784;
      this.sign_of_switch = 'pos';
    }
    if (major_axis == 1 && minor_aix == 0) {
      this.cur_y = y;
      this.cur_x = left;
      const bottomOfScreen = game_screen.width();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = -astProjectileSpeed - getRandomNumber(0, .5);
      this.y_dest = (game_screen.height() - y);
      this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-.5, .5);
      this.hide_axis = 'x';
      this.hide_after = -64;
      this.sign_of_switch = 'neg';
    }
    if (major_axis == 1 && minor_aix == 1) {
      this.cur_y = y;
      this.cur_x = right;
      const bottomOfScreen = game_screen.width();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = astProjectileSpeed + getRandomNumber(0, .5);
      this.y_dest = (game_screen.height() - y);
      this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-.5, .5);
      this.hide_axis = 'x';
      this.hide_after = 1344;
      this.sign_of_switch = 'pos';
    }
    // show this Asteroid's initial position on screen
    this.id.css("top", this.cur_y);
    this.id.css("right", this.cur_x);
    // normalize the speed s.t. all Asteroids travel at the same speed
    const speed = Math.sqrt((this.x_dest) * (this.x_dest) + (this.y_dest) * (this.y_dest));
    this.x_dest = this.x_dest / speed;
    this.y_dest = this.y_dest / speed;
  }
}

// Spawns an asteroid travelling from one border to another
function spawn() {
  console.log("spawning asteroid")
  const asteroid = new Asteroid();
  setTimeout(spawn_helper(asteroid), 0);
}

function spawn_helper(asteroid) {
  const astermovement = setInterval(function () {
    // update Asteroid position on screen
    asteroid.updatePosition();
    // determine whether Asteroid has reached its end position
    if (asteroid.hasReachedEnd()) { // i.e. outside the game boarder
      asteroid.id.remove();
      clearInterval(astermovement);
    }
  }, AST_OBJECT_REFRESH_RATE);
}

/* --------------------- Additional Utility Functions  --------------------- */
// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange) {
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange) {
  const o1D = {
    'left': o1.offset().left + o1_xChange,
    'right': o1.offset().left + o1.width() + o1_xChange,
    'top': o1.offset().top + o1_yChange,
    'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = {
    'left': o2.offset().left,
    'right': o2.offset().left + o2.width(),
    'top': o2.offset().top,
    'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
    // collision detected!
    return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
  return (Math.random() * (max - min)) + min;
}


// -------- my functions ---------


// --- keyboard player movement
let playerX = 500;  // Initial position of the player
let playerY = 300;

$(document).keydown(function (e) {
  switch (e.which) {
    case 37: LEFT = true; break;   // Left arrow key
    case 38: UP = true; break;     // Up arrow key
    case 39: RIGHT = true; break;  // Right arrow key
    case 40: DOWN = true; break;   // Down arrow key
  }
});

$(document).keyup(function (e) {
  switch (e.which) {
    case 37: LEFT = false; break;
    case 38: UP = false; break;
    case 39: RIGHT = false; break;
    case 40: DOWN = false; break;
  }
});

// Move player based on key inputs
function movePlayer() {
  if (LEFT && playerX > 0) playerX -= PERSON_SPEED;
  if (RIGHT && playerX < maxPersonPosX) playerX += PERSON_SPEED;
  if (UP && playerY > 0) playerY -= PERSON_SPEED;
  if (DOWN && playerY < maxPersonPosY) playerY += PERSON_SPEED;
  $('#player').css({ top: playerY + 'px', left: playerX + 'px' });
}

// Run this function continuously to keep the player moving
setInterval(movePlayer, 20);  // 50 times per second (20ms)


// --- Asteroid Spawning
function spawnAsteroids() {
  asteroidInterval = setInterval(function () {
    spawn();
  }, 1000);  // Spawn asteroid every 1 second
}


// ---  Shield and portal spawn
function spawnShield() {
  const shieldHTML = `<div class="shield"><img src="src/shield.gif" alt="Shield"></div>`;
  $('.shieldSection').append(shieldHTML);
  // Add logic to remove shield after some time
  setTimeout(function () {
    $('.shieldSection .shield').remove();
  }, shieldGone);
}

function spawnPortal() {
  const portalHTML = `<div class="portal"><img src="src/port.gif" alt="Portal"></div>`;
  $('.portalSection').append(portalHTML);
  // Add logic to remove portal after some time
  setTimeout(function () {
    $('.portalSection .portal').remove();
  }, portalGone);
}

// Start spawning shields and portals
function startShieldsAndPortals() {
  setInterval(spawnShield, shieldOccurrence);
  setInterval(spawnPortal, portalOccurrence);
}


// --- Collisions
function checkCollisions() {
  $('.curAsteroid').each(function () {
    if (isColliding($('#player'), $(this))) {
      if (hasShield) {
        hasShield = false;
        $('#player').attr('src', 'src/player.gif');  // Revert to non-shielded appearance
      } else {
        playDieSound();  // Play die sound when the player dies
        gameOver();  // Call the gameOver function when the player has no shield
      }
    }
  });
  

  $('.shield').each(function () {
    if (isColliding($('#player'), $(this))) {
      console.log('Player collected a shield!');
      $(this).remove();  // Remove the shield
      hasShield = true;   // Player now has a shield
      $('#player').attr('src', 'src/player_shielded.gif');  // Change player appearance 
      playCollectSound();  // Play collect sound
    } 
  });

  $('.portal').each(function () {
    if (isColliding($('#player'), $(this))) {
      console.log('Player entered a portal!');
      $(this).remove();  // Remove the portal
      increaseLevel();    // Go to the next level
      playCollectSound();  // Play collect sound
    }
  });
}

// Call this function continuously to check for collisions
setInterval(checkCollisions, 50);


// --- Score and game state updates
function gameOver() {
  // Stop the game (stop asteroids, stop score updates)
  stopScoreUpdates();
  stopAsteroidSpawning();
  stopCollisions();

  // Show the final score on the Game Over screen
  $('#final-score').text(score);

  // Hide the game elements and show the Game Over screen
  $('#actual-game').addClass('hidden');
  $('#gameover-page').removeClass('hidden');
}

$('#restart-game').on('click', function() {
  // Restart the game by going back to the main menu
  $('#gameover-page').addClass('hidden');
  $('#main-menu').removeClass('hidden');
  
  // Ensure settings (difficulty, volume) stay the same
  // You might want to call any function that reinitializes the game state
  resetGameState();  // Make sure this resets score/level, but keeps settings intact
});


// Stop asteroids from spawning when the game ends
function stopAsteroidSpawning() {
  clearInterval(asteroidInterval);
}


function gameOver() {
  // Stop the game (stop asteroids, stop score updates)
  stopScoreUpdates();
  stopAsteroidSpawning();

  // Show the final score on the Game Over screen
  $('#final-score').text(score);

  // Hide the game elements and show the Game Over screen
  $('#actual-game').addClass('hidden');
  $('#gameover-page').removeClass('hidden');
}

$('#restart-game').on('click', function() {
  // Restart the game
  $('#gameover-page').addClass('hidden');
  $('#actual-game').removeClass('hidden');
  startGame();  // Call your function to restart the game
});

function resetGameState() {
  score = 0;
  danger = 20;  // or the starting danger based on difficulty
  level = 1;
  hasShield = false;
  
  // Reset player position
  playerX = 500;
  playerY = 300;
  $('#player').css({ top: playerY + 'px', left: playerX + 'px' });
  
  // Clear any remaining asteroids, shields, or portals
  $('.curAsteroid').remove();
  $('.shield').remove();
  $('.portal').remove();
  
  // Reset scoreboard
  updateScorePanel();
}


// Function to set the volume based on the slider
function setVolume() {
  const volume = $('#volume-slider').val() / 100; // Volume slider value from 0 to 100
  collectSound.volume = volume;
  dieSound.volume = volume;
}

// Call setVolume() whenever the volume changes
$('#volume-slider').on('input', function() {
  setVolume();  // Update volume dynamically as the slider is moved
});


function playCollectSound() {
  collectSound.play();
}

function playDieSound() {
  dieSound.play();
}




/* TODO:
1.
 - fix background

2.
 - things aren't flying across screen (top left corner)
 - like learn how to implement flying meteors and avoid

3.
 - make sure to use correct gifs (images provided)     
 - rocket isn't obtaining shield  
 - why is the rocket constantly here                
 
 4. 
 - lastly add shields / portals (edit code eas)
*/ 