import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, collection, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4eLQx_-PuVSMl0F87Tt0aZBaA0nylfg4",
  authDomain: "test-35fdd.firebaseapp.com",
  projectId: "test-35fdd",
  storageBucket: "test-35fdd.firebasestorage.app",
  messagingSenderId: "829382324706",
  appId: "1:829382324706:web:d382b1bfe800a5e4b249bb",
  measurementId: "G-RVM1LT629P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser = null;
let points = 0;
let losses = 0;

// Map choices to images paths
const choiceImages = {
  rock:      'images/rock.png',
  paper:     'images/paper.png',
  scissors:  'images/scissors.png'
};

// Registration
document.getElementById('register-btn').onclick = async function() {
  const username = document.getElementById('username').value.trim();
  if (!username) return alert('Enter a username');
  currentUser = username;
  points = 0;
  losses = 0;
  await setDoc(doc(db, "leaderboard", username), { score: 0 });
  document.getElementById('user-name').innerText = username;
  document.getElementById('register-screen').style.display = "none";
  document.getElementById('game-screen').style.display = "flex";
  listenToLeaderboard();
  setupGame();
};

// Real-time leaderboard
function listenToLeaderboard() {
  const leaderboardRef = collection(db, "leaderboard");
  const q = query(leaderboardRef, orderBy("score", "desc"), limit(10));
  onSnapshot(q, (snapshot) => {
    const ul = document.getElementById('leaderboard');
    ul.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement('li');
      li.textContent = `${doc.id}: ${data.score}`;
      ul.appendChild(li);
    });
  });
}

// Game logic
function setupGame() {
  document.getElementById('score').innerText = `Points: ${points} | Losses: ${losses}`;
  document.querySelectorAll('.rps-btn').forEach(btn => {
    btn.onclick = function() {
      // Hide images before countdown
      document.getElementById('user-choice-img').style.display = 'none';
      document.getElementById('computer-choice-img').style.display = 'none';
      const userChoice = btn.getAttribute('data-choice');
      let countdown = 3;
      document.getElementById('countdown').innerText = countdown;
      document.getElementById('result').innerText = '';
      const interval = setInterval(() => {
        countdown--;
        document.getElementById('countdown').innerText = countdown > 0 ? countdown : '';
        if (countdown === 0) {
          clearInterval(interval);
          playRound(userChoice);
        }
      }, 1000);
    };
  });
}

function playRound(userChoice) {
  const choices = ['rock', 'paper', 'scissors'];
  const computerChoice = choices[Math.floor(Math.random() * 3)];
  let result = '';
  if (userChoice === computerChoice) {
    result = "Draw!";
  } else if (
    (userChoice === 'rock' && computerChoice === 'scissors') ||
    (userChoice === 'paper' && computerChoice === 'rock') ||
    (userChoice === 'scissors' && computerChoice === 'paper')
  ) {
    result = "You Win!";
    points++;
    updateDoc(doc(db, "leaderboard", currentUser), { score: points });
  } else {
    result = "You Lose!";
    losses++;
  }
  // Show images after countdown
  const userImg = document.getElementById('user-choice-img');
  const compImg = document.getElementById('computer-choice-img');
  userImg.src = choiceImages[userChoice];
  userImg.style.display = 'inline-block';
  compImg.src = choiceImages[computerChoice];
  compImg.style.display = 'inline-block';

  document.getElementById('result').innerText = `Computer chose: ${computerChoice}. ${result}`;
  document.getElementById('score').innerText = `Points: ${points} | Losses: ${losses}`;
  if (losses >= 5) {
    setTimeout(() => {
      alert("Game Over! You lost 5 times.");
      location.reload();
    }, 1000);
  }
}
