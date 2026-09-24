const menu =
  document.getElementById("menu");

const game =
  document.getElementById("game");

const gameOver =
  document.getElementById("gameOver");


const playBtn =
  document.getElementById("playBtn");

const againBtn =
  document.getElementById("againBtn");

const menuBtn =
  document.getElementById("menuBtn");

const target =
  document.getElementById("target");

const arena =
  document.getElementById("arena");


const scoreEl =
  document.getElementById("score");

const comboEl =
  document.getElementById("combo");

const bestEl =
  document.getElementById("best");

const menuBestEl =
  document.getElementById("menuBest");

const finalScoreEl =
  document.getElementById("finalScore");

const newRecordEl =
  document.getElementById("newRecord");

const progressEl =
  document.getElementById("progress");

const messageEl =
  document.getElementById("message");


let score = 0;

let combo = 1;

let best =
  Number(
    localStorage.getItem("encore1_best") || 0
  );

let targetSize = 72;

let targetTime = 1500;

let animation = null;

let startTime = 0;

let gameRunning = false;

let audioCtx = null;


bestEl.textContent = best;

menuBestEl.textContent = best;


/* AUDIO */

function startAudio() {

  if (!audioCtx) {

    audioCtx =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

  }

  if (audioCtx.state === "suspended") {

    audioCtx.resume();

  }

}


function beep(
  frequency,
  duration = 0.06,
  type = "sine",
  volume = 0.045
) {

  if (!audioCtx) return;

  const osc =
    audioCtx.createOscillator();

  const gain =
    audioCtx.createGain();


  osc.type = type;

  osc.frequency.value =
    frequency;


  gain.gain.setValueAtTime(
    volume,
    audioCtx.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration
  );


  osc.connect(gain);

  gain.connect(audioCtx.destination);


  osc.start();

  osc.stop(
    audioCtx.currentTime + duration
  );

}


function vibrate(pattern = 12) {

  if (navigator.vibrate) {

    navigator.vibrate(pattern);

  }

}


/* SCREENS */

function showScreen(screen) {

  [
    menu,
    game,
    gameOver
  ].forEach(s => {

    s.classList.remove("active");

  });

  screen.classList.add("active");

}


/* POSITION */

function randomPosition() {

  const padding =
    targetSize / 2 + 8;

  const w =
    arena.clientWidth;

  const h =
    arena.clientHeight;


  return {

    x:
      padding +
      Math.random() *
      Math.max(
        1,
        w - padding * 2
      ),

    y:
      padding +
      Math.random() *
      Math.max(
        1,
        h - padding * 2
      )

  };

}


/* NEW TARGET */

function placeTarget() {

  cancelAnimationFrame(animation);


  targetSize =
    Math.max(
      42,
      72 -
      Math.floor(score / 8) * 2.5
    );


  target.style.width =
    `${targetSize}px`;

  target.style.height =
    `${targetSize}px`;


  const pos =
    randomPosition();


  target.style.left =
    `${pos.x}px`;

  target.style.top =
    `${pos.y}px`;


  const difficulty =
    Math.min(
      850,
      Math.floor(score / 5) * 45
    );


  targetTime =
    Math.max(
      520,
      1500 - difficulty
    );


  startTime =
    performance.now();


  progressEl.style.transform =
    "scaleX(1)";


  function animate(now) {

    if (!gameRunning) return;


    const elapsed =
      now - startTime;


    const remaining =
      Math.max(
        0,
        1 - elapsed / targetTime
      );


    progressEl.style.transform =
      `scaleX(${remaining})`;


    if (remaining <= 0) {

      miss();

      return;

    }


    animation =
      requestAnimationFrame(
        animate
      );

  }


  animation =
    requestAnimationFrame(
      animate
    );

}


/* MESSAGE */

function showMessage(text) {

  messageEl.textContent =
    text;


  messageEl.classList.remove(
    "show"
  );


  void messageEl.offsetWidth;


  messageEl.classList.add(
    "show"
  );

}


/* HIT */

function hit() {

  if (!gameRunning) return;


  score += combo;


  combo =
    Math.min(
      12,
      combo + 1
    );


  scoreEl.textContent =
    score;


  comboEl.textContent =
    `x${combo}`;


  beep(
    300 + combo * 35,
    0.07,
    "sine",
    0.04
  );


  vibrate(8);


  if (combo >= 3) {

    showMessage(
      `+${combo - 1}`
    );

  }


  placeTarget();

}


/* MISS */

function miss() {

  if (!gameRunning) return;


  gameRunning = false;


  cancelAnimationFrame(
    animation
  );


  beep(
    90,
    0.16,
    "sawtooth",
    0.035
  );


  vibrate([
    20,
    30,
    20
  ]);


  const isRecord =
    score > best;


  if (isRecord) {

    best = score;


    localStorage.setItem(
      "encore1_best",
      String(best)
    );


    menuBestEl.textContent =
      best;

    bestEl.textContent =
      best;

  }


  finalScoreEl.textContent =
    score;


  newRecordEl.textContent =
    isRecord && score > 0
      ? "NOUVEAU RECORD !"
      : `RECORD : ${best}`;


  showScreen(gameOver);

}


/* START */

function startGame() {

  startAudio();


  score = 0;

  combo = 1;


  scoreEl.textContent =
    "0";

  comboEl.textContent =
    "x1";


  bestEl.textContent =
    best;


  gameRunning = true;


  showScreen(game);


  requestAnimationFrame(
    () => placeTarget()
  );

}


/* BUTTONS */

playBtn.addEventListener(
  "click",
  startGame
);


againBtn.addEventListener(
  "click",
  startGame
);


menuBtn.addEventListener(
  "click",
  () => {

    gameRunning = false;

    cancelAnimationFrame(
      animation
    );

    showScreen(menu);

  }
);


/* TOUCH */

target.addEventListener(
  "pointerdown",
  event => {

    event.preventDefault();

    hit();

  }
);


/* SAFETY */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden &&
      gameRunning
    ) {

      miss();

    }

  }
);
