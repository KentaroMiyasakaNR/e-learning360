// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {

};

// Firebase の初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ユーザー登録フォームの送信イベント
document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('ユーザー登録成功', user);
      
      set(ref(db, 'users/' + user.uid), {
        email: email
      });

      // アカウント作成成功時にlearningSystem.htmlを表示
      window.location.href = 'learningSystem.html';
    })
    .catch((error) => {
      console.error('ユーザー登録失敗', error);
    });
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('ログイン成功', user);
      
      // ログイン成功時にlearningSystem.htmlを表示
      window.location.href = 'learningSystem.html';
    })
    .catch((error) => {
      console.error('ログイン失敗', error);
    });
});

