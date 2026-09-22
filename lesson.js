const lessons = window.APP_CONTENT.lessons;
const lessonContent = window.APP_CONTENT.lessonContent || {};

const id = Number(new URLSearchParams(location.search).get("id"));
const lesson = lessons.find(x => x.id === id);
const content = lessonContent[id];

const titleEl = document.querySelector("#lesson-title");
const numberEl = document.querySelector("#lesson-number");
const groupEl = document.querySelector("#lesson-group");
const introEl = document.querySelector("#lesson-intro");
const actionsEl = document.querySelector("#lesson-actions");

const objectivesBox = document.querySelector("#lesson-objectives");
const objectivesList = document.querySelector("#objectives-list");
const theoryPanel = document.querySelector("#theory-panel");
const examplePanel = document.querySelector("#example-panel");
const checkPanel = document.querySelector("#check-panel");

function esc(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function renderTabs(){
  const tabs = [...document.querySelectorAll("[data-lesson-tab]")];
  const panels = {
    theory: theoryPanel,
    example: examplePanel,
    check: checkPanel
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      Object.values(panels).forEach(x => x.classList.remove("active"));
      tab.classList.add("active");
      panels[tab.dataset.lessonTab].classList.add("active");
    });
  });
}

function renderTheory(items){
  theoryPanel.innerHTML = items.map((item, index) => `
    <article class="theory-block">
      <span class="theory-index">${index + 1}</span>
      <div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.text)}</p>
      </div>
    </article>
  `).join("");
}

function renderExample(example){
  examplePanel.innerHTML = `
    <div class="example-card">
      <span class="example-icon">💡</span>
      <div>
        <h3>${esc(example.title)}</h3>
        <p>${esc(example.text)}</p>
      </div>
    </div>
  `;
}

function renderCheck(items){
  checkPanel.innerHTML = `
    <div class="quick-check-intro">
      Απάντησε και πάρε αμέσως ανατροφοδότηση. Οι ερωτήσεις αυτές δεν αποθηκεύονται.
    </div>
    <div id="quick-check-list"></div>
  `;

  const list = document.querySelector("#quick-check-list");

  items.forEach((item, qIndex) => {
    const card = document.createElement("div");
    card.className = "quick-check-card";

    const q = document.createElement("h3");
    q.textContent = `${qIndex + 1}. ${item.q}`;
    card.appendChild(q);

    const options = document.createElement("div");
    options.className = "quick-options";

    const feedback = document.createElement("div");
    feedback.className = "quick-feedback hidden";

    item.options.forEach((option, oIndex) => {
      const btn = document.createElement("button");
      btn.className = "quick-option";
      btn.textContent = option;

      btn.addEventListener("click", () => {
        [...options.children].forEach(b => b.disabled = true);

        if(oIndex === item.correct){
          btn.classList.add("correct-choice");
          feedback.innerHTML = `<strong>Σωστά.</strong> ${esc(item.explanation)}`;
          feedback.classList.add("ok");
        }else{
          btn.classList.add("wrong-choice");
          [...options.children][item.correct].classList.add("correct-choice");
          feedback.innerHTML = `<strong>Όχι.</strong> ${esc(item.explanation)}`;
          feedback.classList.add("bad");
        }

        feedback.classList.remove("hidden");
      });

      options.appendChild(btn);
    });

    card.appendChild(options);
    card.appendChild(feedback);
    list.appendChild(card);
  });
}

if(!lesson){
  titleEl.textContent = "Η ενότητα δεν βρέθηκε";
  numberEl.textContent = "?";
  groupEl.textContent = "Μάθημα";
  introEl.textContent = "Επίστρεψε στην αρχική σελίδα και επίλεξε ξανά ενότητα.";
}else{
  document.title = `${lesson.title} | Algorithm & Quiz Lab`;
  titleEl.textContent = lesson.title;
  numberEl.textContent = lesson.id;
  groupEl.textContent = lesson.group;

  if(content){
    introEl.textContent = content.intro;

    objectivesList.innerHTML = content.objectives
      .map(item => `<li>${esc(item)}</li>`)
      .join("");
    objectivesBox.classList.remove("hidden");

    renderTheory(content.theory);
    renderExample(content.example);
    renderCheck(content.check);
  }else{
    introEl.textContent = "Η ενότητα έχει ενταχθεί στη δομή της πλατφόρμας και το περιεχόμενό της θα προστεθεί σταδιακά.";

    theoryPanel.innerHTML = `
      <div class="empty-content">
        <strong>Το περιεχόμενο αυτής της ενότητας ετοιμάζεται.</strong>
        <p>Η θέση της στην πλατφόρμα είναι ήδη έτοιμη.</p>
      </div>
    `;
    examplePanel.innerHTML = theoryPanel.innerHTML;
    checkPanel.innerHTML = theoryPanel.innerHTML;
  }

  const buttons = [];

  if(lesson.id === 18){
    buttons.push('<a class="button primary" href="visualizer.html?algorithm=bubble">Bubble Sort Visualizer</a>');
  }
  if(lesson.id === 19){
    buttons.push('<a class="button primary" href="visualizer.html?algorithm=selection">Selection Sort Visualizer</a>');
  }
  if(lesson.id === 20){
    buttons.push('<a class="button primary" href="visualizer.html?algorithm=binary">Binary Search Visualizer</a>');
  }

  if(lesson.tags.includes("Quiz")){
    buttons.push('<a class="button ghost" href="quiz.html">Μετάβαση στο γενικό Quiz</a>');
  }

  actionsEl.innerHTML = buttons.join("");
}

renderTabs();
