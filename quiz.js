const questions = window.QUIZ_QUESTIONS;

const startScreen = document.querySelector("#start-screen");
const quizScreen = document.querySelector("#quiz-screen");
const resultScreen = document.querySelector("#result-screen");

const startBtn = document.querySelector("#start-btn");
const nextBtn = document.querySelector("#next-btn");
const restartBtn = document.querySelector("#restart-btn");

const progressEl = document.querySelector("#progress");
const scoreEl = document.querySelector("#score");
const questionEl = document.querySelector("#question");
const answersEl = document.querySelector("#answers");
const feedbackEl = document.querySelector("#feedback");
const finalScoreEl = document.querySelector("#final-score");
const finalMessageEl = document.querySelector("#final-message");

const studentCodeEl = document.querySelector("#student-code");
const studentCodeErrorEl = document.querySelector("#student-code-error");
const saveStatusEl = document.querySelector("#save-status");
const resultsForm = document.querySelector("#quiz-results-form");

let currentQuestion = 0;
let score = 0;
let answered = false;
let studentCode = "";
let attemptAnswers = [];
let resultSubmitted = false;

function normalizeStudentCode(value) {
  return value.trim().replace(/\s+/g, "-").toUpperCase();
}

function validateStudentCode() {
  const code = normalizeStudentCode(studentCodeEl.value);

  // Simple pseudonymous classroom code, 2-20 chars.
  if (!/^[A-ZΑ-Ω0-9_-]{2,20}$/u.test(code)) {
    studentCodeErrorEl.textContent =
      "Γράψε έναν σύντομο κωδικό 2–20 χαρακτήρων, π.χ. Β1-07.";
    studentCodeErrorEl.classList.remove("hidden");
    return null;
  }

  studentCodeErrorEl.classList.add("hidden");
  studentCodeErrorEl.textContent = "";
  return code;
}

function startQuiz() {
  const validCode = validateStudentCode();
  if (!validCode) return;

  studentCode = validCode;
  currentQuestion = 0;
  score = 0;
  answered = false;
  attemptAnswers = [];
  resultSubmitted = false;

  saveStatusEl.classList.add("hidden");
  saveStatusEl.textContent = "";

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  showQuestion();
}

function showQuestion() {
  answered = false;
  feedbackEl.classList.add("hidden");
  nextBtn.classList.add("hidden");
  answersEl.innerHTML = "";

  const item = questions[currentQuestion];

  progressEl.textContent = `Ερώτηση ${currentQuestion + 1} / ${questions.length}`;
  scoreEl.textContent = `Σκορ: ${score}`;
  questionEl.textContent = item.question;

  item.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = answer;
    button.addEventListener("click", () => selectAnswer(index, button));
    answersEl.appendChild(button);
  });
}

function selectAnswer(selectedIndex, selectedButton) {
  if (answered) return;
  answered = true;

  const item = questions[currentQuestion];
  const buttons = [...answersEl.querySelectorAll(".answer-btn")];
  const isCorrect = selectedIndex === item.correct;

  attemptAnswers[currentQuestion] = {
    selectedIndex,
    selectedText: item.answers[selectedIndex],
    correctIndex: item.correct,
    correctText: item.answers[item.correct],
    correct: isCorrect
  };

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.correct) button.classList.add("correct");
  });

  if (isCorrect) {
    score++;
    feedbackEl.innerHTML = `<strong>Σωστά!</strong><br>${item.explanation}`;
  } else {
    selectedButton.classList.add("wrong");
    feedbackEl.innerHTML = `<strong>Όχι ακριβώς.</strong><br>${item.explanation}`;
  }

  scoreEl.textContent = `Σκορ: ${score}`;
  feedbackEl.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestion++;

  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function setFormValue(name, value) {
  const field = resultsForm.elements.namedItem(name);
  if (field) field.value = value;
}

async function submitResults(percentage) {
  if (resultSubmitted) return;
  resultSubmitted = true;

  setFormValue("student_code", studentCode);
  setFormValue("quiz_name", "Quiz βασικών εννοιών");
  setFormValue("score", score);
  setFormValue("total", questions.length);
  setFormValue("percentage", percentage);
  setFormValue("submitted_at", new Date().toISOString());

  attemptAnswers.forEach((answer, index) => {
    const number = index + 1;
    setFormValue(`answer_${number}`, answer?.selectedText ?? "");
    setFormValue(`correct_${number}`, answer?.correct ? "ΝΑΙ" : "ΟΧΙ");
  });

  saveStatusEl.className = "save-status saving";
  saveStatusEl.textContent = "Αποθήκευση αποτελέσματος…";

  // Local file testing cannot submit to Netlify.
  if (window.location.protocol === "file:") {
    saveStatusEl.className = "save-status local";
    saveStatusEl.textContent =
      "Το quiz λειτουργεί τοπικά, αλλά η αποθήκευση γίνεται μόνο στην online έκδοση του Netlify.";
    return;
  }

  try {
    const formData = new FormData(resultsForm);

    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    saveStatusEl.className = "save-status success";
    saveStatusEl.textContent =
      `✓ Το αποτέλεσμα του ${studentCode} αποθηκεύτηκε.`;
  } catch (error) {
    console.error("Netlify Forms submission failed:", error);
    saveStatusEl.className = "save-status error";
    saveStatusEl.textContent =
      "Δεν ήταν δυνατή η αποθήκευση. Ο βαθμός εμφανίζεται κανονικά· ενημέρωσε τον εκπαιδευτικό.";
    resultSubmitted = false;
  }
}

function showResults() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  const percentage = Math.round((score / questions.length) * 100);

  finalScoreEl.textContent = `${score} / ${questions.length} (${percentage}%)`;

  if (percentage === 100) {
    finalMessageEl.textContent = "Άριστα! Όλες οι απαντήσεις σωστές.";
  } else if (percentage >= 70) {
    finalMessageEl.textContent = "Πολύ καλή επίδοση.";
  } else if (percentage >= 50) {
    finalMessageEl.textContent = "Καλή αρχή — αξίζει μία ακόμη προσπάθεια.";
  } else {
    finalMessageEl.textContent = "Δοκίμασε ξανά αφού διαβάσεις τις επεξηγήσεις.";
  }

  submitResults(percentage);
}

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  studentCodeEl.focus();
});

studentCodeEl.addEventListener("keydown", event => {
  if (event.key === "Enter") startQuiz();
});
