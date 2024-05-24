const quizContainer = document.getElementById('quiz-container');
const quizTitle = document.getElementById('quiz-title');
const videoContainer = document.getElementById('video-container');
const optionsContainer = document.getElementById('options-container');
const submitBtn = document.getElementById('submit-btn');
const scoreDisplay = document.createElement('div'); // スコア表示用の要素を作成

let currentQuiz;
let selectedOptions = [];
let player;
let quizzes;
let totalQuizzes = 0; // 合計クイズ数
let correctCount = 0; // 正解数

// YouTubeプレーヤーAPIの読み込み
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// YouTubeプレーヤーAPIが読み込まれた時のコールバック
window.onYouTubeIframeAPIReady = function() {
  // CSVデータの読み込み
  fetch('WebICTクイズテスト.csv')
    .then(response => response.text())
    .then(data => {
      quizzes = parseCSV(data);
      totalQuizzes = quizzes.length; // 合計クイズ数を取得
      currentQuiz = quizzes[0];
      displayQuiz(currentQuiz);
    })
    .catch(error => console.error('Error loading CSV:', error));
};

function parseCSV(data) {
  const rows = data.trim().split('\n');
  const header = rows.shift().split(',');
  const quizzes = rows.map(row => {
    const values = row.split(',');
    const quiz = {};
    header.forEach((key, i) => {
      quiz[key] = values[i];
    });
    return quiz;
  });
  return quizzes;
}


function displayQuiz(quiz) {
 quizTitle.textContent = quiz.Question;
 const videoURL = `https://www.youtube.com/embed/${quiz.MediaName}`;
 videoContainer.innerHTML = `<div id="player"></div>`;
 
  if (player) {
    player.destroy(); // 既存のプレーヤーを破棄
  }
 
  player = new YT.Player('player', {
    height: '315',
    width: '560',
    videoId: quiz.MediaName,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  },
  updateScoreDisplay()
);

const options = quiz.Options.split('/');
optionsContainer.innerHTML = '';
if (options.length === 2) {
  const radioGroup = document.createElement('div');
  radioGroup.classList.add('radio-group');
  options.forEach((option, index) => {
    if (option.trim()) {
      const radioBtn = document.createElement('input');
      radioBtn.type = 'radio';
      radioBtn.name = 'option';
      radioBtn.value = index;
      radioBtn.id = `option-${index}`;
      radioBtn.addEventListener('change', handleOptionChange);
      const label = document.createElement('label');
      label.htmlFor = `option-${index}`;
      label.textContent = option.trim();
      radioGroup.appendChild(radioBtn);
      radioGroup.appendChild(label);
    }
  });
  optionsContainer.appendChild(radioGroup);
} else {
  options.forEach(option => {
    if (option.trim()) {
      const btn = document.createElement('button');
      btn.textContent = option.trim();
      btn.classList.add('option-btn');
      btn.addEventListener('click', toggleOption);
      optionsContainer.appendChild(btn);
    }
  });
}
  submitBtn.disabled = true;
  selectedOptions = [];
}

function onPlayerReady(event) {
  event.target.setVolume(0);
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    console.log('Video has finished playing');
    optionsContainer.style.display = 'flex';
    submitBtn.disabled = false; // 動画が終了したらSubmitボタンを有効化
  }
}

function toggleOption(event) {
  if (event.target.type === 'radio') {
    return;
  }
  event.currentTarget.classList.toggle('active');
  const index = [...optionsContainer.children].indexOf(event.currentTarget);
  if (event.currentTarget.classList.contains('active')) {
    selectedOptions = [index];
  } else {
    selectedOptions = [];
  }
}

submitBtn.addEventListener('click', checkAnswer);

function checkAnswer() {
  const correctAnswers = currentQuiz.CorrectAnswers.split(',').map(Number);
  console.log("正解は" + correctAnswers);

  // 選択肢の番号を0始まりから1始まりに変更
  const selectedOptionsOneIndexed = selectedOptions.map(option => option + 1);
  console.log("選択されたものは" + selectedOptionsOneIndexed)
  const isCorrect = selectedOptionsOneIndexed.length === correctAnswers.length &&
    selectedOptionsOneIndexed.every(option => correctAnswers.includes(option));

  localStorage.setItem(`quiz-${currentQuiz.QuizID}`, isCorrect);

  if (isCorrect) {
    correctCount++;
  }

  const nextQuizIndex = isCorrect ? currentQuiz.NextQuizIDCorrect : currentQuiz.NextQuizIDIncorrect;
  const nextQuiz = quizzes.find(quiz => quiz.QuizID === nextQuizIndex);

  if (nextQuiz) {
    currentQuiz = nextQuiz;
    displayQuiz(currentQuiz);
  } else {
    console.log('All quizzes completed!');
    updateScoreDisplay();
    showFinalResult();
  }
  updateProgressIndicator();
}

function updateScoreDisplay() {
  scoreDisplay.textContent = `スコア: ${correctCount} / ${totalQuizzes}`;
  quizContainer.appendChild(scoreDisplay);
}

function handleOptionChange(event) {
  const selectedOption = Number(event.target.value);
  selectedOptions = [selectedOption];
}

function updateProgressIndicator() {
  const currentIndex = quizzes.findIndex(quiz => quiz.QuizID === currentQuiz.QuizID);
  const progress = ((currentIndex) / totalQuizzes) * 100;
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${Math.round(progress)}%`;
}

function showFinalResult() {
  const totalQuizzes = quizzes.length;
  let correctCount = 0;

  for (let i = 0; i < totalQuizzes; i++) {
    const quizResult = localStorage.getItem(`quiz-${quizzes[i].QuizID}`);
    if (quizResult === 'true') {
      correctCount++;
    }
  }

  const percentage = (correctCount / totalQuizzes) * 100;
  let resultText = '';

  if (percentage >= 81) {
    resultText = '優';
  } else if (percentage >= 61) {
    resultText = '良';
  } else if (percentage >= 60) {
    resultText = '可';
  } else {
    resultText = '不可';
  }

  const message = `お疲れさまでした！正答率は${percentage.toFixed(2)}%です！<br>判定: ${resultText}`;

  const resultContainer = document.getElementById('result-container');
  resultContainer.innerHTML = message;

  const reviewBtn = document.createElement('button');
  reviewBtn.textContent = '間違えた問題の復習';
  reviewBtn.addEventListener('click', startReview);

  resultContainer.appendChild(reviewBtn);
  resultContainer.style.display = 'block';
  quizContainer.style.display = 'none';
}

function startReview() {
  const incorrectQuizzes = quizzes.filter(quiz => localStorage.getItem(`quiz-${quiz.QuizID}`) === 'false');
  
  if (incorrectQuizzes.length > 0) {
    quizzes = incorrectQuizzes;
    totalQuizzes = quizzes.length;
    currentQuiz = quizzes[0];
    correctCount = 0;
    displayQuiz(currentQuiz);
    
    const resultContainer = document.getElementById('result-container');
    resultContainer.style.display = 'none';
    quizContainer.style.display = 'block';
  } else {
    alert('全ての問題に正解しています！');
  }
}