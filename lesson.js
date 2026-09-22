const syllabus=window.APP_CONTENT.syllabus;
const contentMap=window.APP_CONTENT.lessonContent||{};
const requested=new URLSearchParams(location.search).get("topic")||"1";

function esc(v){
  return String(v)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function findTopic(nodes,code,parent=null){
  for(const node of nodes){
    if(node.code===code) return {node,parent};
    if(node.children){
      const found=findTopic(node.children,code,node);
      if(found) return found;
    }
  }
  return null;
}

function renderQuickCheck(items, host){
  host.innerHTML=`
    <div class="study-heading">
      <span class="section-kicker">Αυτοέλεγχος</span>
      <h2>Quick Check</h2>
      <p>Απάντησε και πάρε άμεση ανατροφοδότηση. Οι απαντήσεις εδώ δεν αποθηκεύονται.</p>
    </div>
    <div id="quick-list"></div>
  `;

  const list=host.querySelector("#quick-list");

  items.forEach((item,index)=>{
    const card=document.createElement("article");
    card.className="study-question";
    card.innerHTML=`<h3>${index+1}. ${esc(item.q)}</h3>`;

    const opts=document.createElement("div");
    opts.className="study-options";
    const feedback=document.createElement("div");
    feedback.className="study-feedback hidden";

    item.options.forEach((option,optIndex)=>{
      const btn=document.createElement("button");
      btn.className="study-option";
      btn.textContent=option;
      btn.onclick=()=>{
        [...opts.children].forEach(b=>b.disabled=true);
        if(optIndex===item.correct){
          btn.classList.add("correct");
          feedback.className="study-feedback correct";
          feedback.innerHTML=`<strong>Σωστά.</strong> ${esc(item.explanation)}`;
        }else{
          btn.classList.add("wrong");
          [...opts.children][item.correct].classList.add("correct");
          feedback.className="study-feedback wrong";
          feedback.innerHTML=`<strong>Όχι.</strong> ${esc(item.explanation)}`;
        }
      };
      opts.appendChild(btn);
    });

    card.appendChild(opts);
    card.appendChild(feedback);
    list.appendChild(card);
  });
}

function renderDiagram(diagram){
  if(!diagram) return "";
  return `
    <div class="problem-tree">
      <div class="tree-root">${esc(diagram.root)}</div>
      <div class="tree-branches">
        ${diagram.children.map(branch=>`
          <div class="tree-branch">
            <strong>${esc(branch.title)}</strong>
            <div>${branch.children.map(x=>`<span>${esc(x)}</span>`).join("")}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function setupTabs(){
  const tabs=[...document.querySelectorAll("[data-study-tab]")];
  const panels={
    theory:document.querySelector("#theory-study-panel"),
    example:document.querySelector("#example-study-panel"),
    check:document.querySelector("#check-study-panel"),
    exercises:document.querySelector("#exercises-study-panel")
  };

  tabs.forEach(tab=>{
    tab.onclick=()=>{
      tabs.forEach(x=>x.classList.remove("active"));
      Object.values(panels).forEach(x=>x.classList.remove("active"));
      tab.classList.add("active");
      panels[tab.dataset.studyTab].classList.add("active");
    };
  });
}

const found=findTopic(syllabus,requested);
const topic=found?.node;
const parent=found?.parent;

const title=document.querySelector("#topic-title");
const codeEl=document.querySelector("#topic-code");
const parentEl=document.querySelector("#topic-parent");
const intro=document.querySelector("#topic-intro");
const breadcrumb=document.querySelector("#breadcrumb-current");

if(!topic){
  document.title="Η ενότητα δεν βρέθηκε";
  title.textContent="Η ενότητα δεν βρέθηκε";
  codeEl.textContent="?";
  parentEl.textContent="Πληροφορική";
  intro.textContent="Επίλεξε μια ενότητα από το μενού.";
  breadcrumb.textContent="Άγνωστη ενότητα";
}else{
  document.title=`${topic.title} | Algorithm & Quiz Lab`;
  title.textContent=topic.title;
  codeEl.textContent=topic.code;
  parentEl.textContent=parent?parent.title:"Κεφάλαιο";
  breadcrumb.textContent=topic.title;

  const content=contentMap[topic.code];
  intro.textContent=content?.intro||"Η ενότητα έχει ενταχθεί στη δομή της εξεταστέας ύλης.";

  if(topic.children?.length){
    document.querySelector("#topic-children-section").classList.remove("hidden");
    document.querySelector("#topic-children").innerHTML=topic.children.map(child=>`
      <a class="subtopic-card" href="lesson.html?topic=${encodeURIComponent(child.code)}">
        <span class="subtopic-code">${esc(child.code)}</span>
        <strong>${esc(child.title)}</strong>
        <span class="subtopic-arrow">→</span>
      </a>
    `).join("");
  }

  if(content){
    document.querySelector("#lesson-tabs").classList.remove("hidden");

    const source=document.querySelector("#source-note");
    if(content.sourceNote){
      source.textContent=content.sourceNote;
      source.classList.remove("hidden");
    }

    const theory=document.querySelector("#theory-study-panel");
    theory.innerHTML=`
      <div class="study-grid">
        <article class="study-card objectives-card">
          <span class="section-kicker">Στόχοι</span>
          <h2>Τι πρέπει να γνωρίζεις</h2>
          <ul>${(content.objectives||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
        </article>

        <article class="study-card terms-card">
          <span class="section-kicker">Βασικοί όροι</span>
          <h2>Έννοιες-κλειδιά</h2>
          <div class="term-list">
            ${(content.keyTerms||[]).map(x=>`
              <div class="term-row">
                <strong>${esc(x.term)}</strong>
                <p>${esc(x.definition)}</p>
              </div>
            `).join("")}
          </div>
        </article>
      </div>

      <div class="study-card theory-card-wide">
        <span class="section-kicker">Θεωρία</span>
        <h2>Βασικά σημεία</h2>
        ${(content.theory||[]).map((x,i)=>`
          <article class="theory-row">
            <span>${i+1}</span>
            <div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>
          </article>
        `).join("")}
      </div>

      ${content.codeSamples?.length ? `
        <div class="study-card code-samples-card">
          <span class="section-kicker">Ψευδοκώδικας</span>
          <h2>Παραδείγματα κώδικα</h2>
          ${content.codeSamples.map(x=>`
            <div class="code-sample-block">
              <h3>${esc(x.title)}</h3>
              <pre>${esc(x.code)}</pre>
            </div>
          `).join("")}
        </div>
      ` : ""}

      ${content.process?`
        <div class="study-card process-card">
          <span class="section-kicker">Διαδικασία</span>
          <h2>Τα στάδια αντιμετώπισης</h2>
          <div class="process-flow">
            ${content.process.map((x,i)=>`
              <div class="process-step">
                <span>${i+1}</span><strong>${esc(x.title)}</strong><p>${esc(x.text)}</p>
              </div>
            `).join("")}
          </div>
        </div>
      `:""}
    `;

    const example=document.querySelector("#example-study-panel");
    example.innerHTML=`
      <article class="study-card example-study-card">
        <span class="section-kicker">Παράδειγμα</span>
        <h2>${esc(content.example?.title||"Παράδειγμα")}</h2>
        <p>${esc(content.example?.text||"")}</p>
        ${renderDiagram(content.diagram)}
      </article>
    `;

    renderQuickCheck(content.quickCheck||[],document.querySelector("#check-study-panel"));

    document.querySelector("#exercises-study-panel").innerHTML=`
      <div class="study-heading">
        <span class="section-kicker">Εφαρμογή</span>
        <h2>Ασκήσεις για εξάσκηση</h2>
      </div>
      <div class="exercise-list">
        ${(content.exercises||[]).map((x,i)=>`
          <article class="exercise-card">
            <span>${i+1}</span><p>${esc(x)}</p>
          </article>
        `).join("")}
      </div>
    `;

    setupTabs();
  }else{
    document.querySelector("#placeholder-section").classList.remove("hidden");
  }

  const tools=[];
  if(topic.code==="3.6") tools.push('<a class="tool-button" href="visualizer.html?algorithm=binary">Binary Search Visualizer</a>');
  if(topic.code==="3.7") tools.push('<a class="tool-button" href="visualizer.html?algorithm=bubble">Bubble Sort Visualizer</a>');
  if(topic.code==="2"||topic.code.startsWith("2.")) tools.push('<a class="tool-button secondary" href="quiz.html">Quiz αλγορίθμων</a>');
  document.querySelector("#topic-tools").innerHTML=tools.join("");
}
