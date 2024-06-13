// CSVファイルを読み込む関数
function loadCSV(url, callback) {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        const rows = data.split('\n');
        const header = rows[0].split(',');
        const quizData = rows.slice(1).map(row => {
          const values = row.split(',');
          const quiz = {};
          header.forEach((key, i) => {
            quiz[key] = values[i];
          });
          return quiz;
        });
        callback(quizData);
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
      });
  }
  
  // クイズデータを表示する関数
  function displayQuizData(quizData) {
    const tableBody = document.querySelector('#quizDataTable tbody');
    quizData.forEach(quiz => {
      const row = document.createElement('tr');
      ['QuizID', 'Question', 'Options', 'CorrectAnswers', 'MediaName'].forEach(key => {
        const cell = document.createElement('td');
        cell.textContent = quiz[key];
        row.appendChild(cell);
      });
      const actionCell = document.createElement('td');
      const editButton = document.createElement('button');
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
        enableEditing(row);
      });
      actionCell.appendChild(editButton);
      row.appendChild(actionCell);
      tableBody.appendChild(row);
    });
  }
  
  // 行の編集を有効にする関数
  function enableEditing(row) {
    const cells = row.querySelectorAll('td:not(:last-child)');
    cells.forEach(cell => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = cell.textContent;
      cell.textContent = '';
      cell.appendChild(input);
    });
    const actionCell = row.querySelector('td:last-child');
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '決定';
    confirmButton.addEventListener('click', () => {
      confirmEditing(row);
    });
    actionCell.innerHTML = '';
    actionCell.appendChild(confirmButton);
  }
  
  // 編集を確定する関数
  function confirmEditing(row) {
    const cells = row.querySelectorAll('td:not(:last-child)');
    cells.forEach(cell => {
      const input = cell.querySelector('input');
      cell.textContent = input.value;
    });
    const actionCell = row.querySelector('td:last-child');
    const editButton = document.createElement('button');
    editButton.textContent = '編集';
    editButton.addEventListener('click', () => {
      enableEditing(row);
    });
    actionCell.innerHTML = '';
    actionCell.appendChild(editButton);
  }
  
  // CSVデータを読み込んで表示する
  loadCSV('WebICTクイズテストALL.csv', displayQuizData);