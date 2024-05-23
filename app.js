const quizContainer = document.getElementById('quiz-container');
const quizTitle = document.getElementById('quiz-title');
const videoContainer = document.getElementById('video-container');
const optionsContainer = document.getElementById('options-container');
const submitBtn = document.getElementById('submit-btn');

let currentQuiz;
let selectedOptions = [];
let player; // YouTubeプレーヤーインスタンスを保持する変数

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
      const quizzes = parseCSV(data);
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
  videoContainer.innerHTML = `<iframe width="560" height="315" src="${videoURL}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  const player = new YT.Player(videoContainer.firstChild, {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });

  const options = quiz.Options.split('/');
  optionsContainer.innerHTML = '';
  options.forEach(option => {
    if (option.trim()) {
      const btn = document.createElement('button');
      btn.textContent = option.trim();
      btn.classList.add('option-btn');
      btn.addEventListener('click', toggleOption);
      optionsContainer.appendChild(btn);
    }
  });

  submitBtn.disabled = true;
  selectedOptions = [];
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    optionsContainer.style.display = 'flex';
    submitBtn.disabled = false;
  }
}

function toggleOption(event) {
  event.currentTarget.classList.toggle('active');
  const index = [...optionsContainer.children].indexOf(event.currentTarget);
  if (event.currentTarget.classList.contains('active')) {
    selectedOptions.push(index);
  } else {
    selectedOptions = selectedOptions.filter(i => i !== index);
  }
}

submitBtn.addEventListener('click', checkAnswer);

function checkAnswer() {
  const correctAnswers = currentQuiz.CorrectAnswers.split(',').map(Number);
  const isCorrect = selectedOptions.length === correctAnswers.length &&
    selectedOptions.every((option, index) => option === correctAnswers[index]);

  localStorage.setItem(`quiz-${currentQuiz.QuizID}`, isCorrect);

  const nextQuizID = isCorrect ? currentQuiz.NextQuizIDCorrect : currentQuiz.NextQuizIDIncorrect;
  // ここで次のクイズを読み込む処理を追加する
}