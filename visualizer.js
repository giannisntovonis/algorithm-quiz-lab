const alg=document.querySelector("#algorithm");
const nums=document.querySelector("#numbers");
const target=document.querySelector("#target");
const tw=document.querySelector("#target-wrap");
const box=document.querySelector("#array-container");
const status=document.querySelector("#status");
const title=document.querySelector("#algo-title");
const desc=document.querySelector("#algo-description");
const pseudo=document.querySelector("#pseudocode");
const varsBox=document.querySelector("#variables");
const auto=document.querySelector("#auto-btn");
const predictMode=document.querySelector("#predict-mode");

const predictionCard=document.querySelector("#prediction-card");
const predictionQuestion=document.querySelector("#prediction-question");
const predictionOptions=document.querySelector("#prediction-options");
const predictionFeedback=document.querySelector("#prediction-feedback");

const traceHead=document.querySelector("#trace-head");
const traceBody=document.querySelector("#trace-body");

let original=[],steps=[],si=0,timer=null;
let waitingForPrediction=false;
let traceRows=[];

const meta={
  bubble:{
    title:"Bubble Sort",
    description:"Συγκρίνει γειτονικά στοιχεία και τα ανταλλάσσει όταν είναι σε λάθος σειρά.",
    code:[
      "ΓΙΑ i ΑΠΟ 2 ΜΕΧΡΙ N",
      "   ΓΙΑ j ΑΠΟ N ΜΕΧΡΙ i ΜΕ_ΒΗΜΑ -1",
      "      ΑΝ A[j-1] > A[j] ΤΟΤΕ",
      "         temp <- A[j-1]",
      "         A[j-1] <- A[j]",
      "         A[j] <- temp",
      "      ΤΕΛΟΣ_ΑΝ",
      "   ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ",
      "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
    ],
    trace:["Βήμα","i","j","A[j-1]","A[j]","Ενέργεια"]
  },
  selection:{
    title:"Selection Sort",
    description:"Βρίσκει το μικρότερο στοιχείο του μη ταξινομημένου τμήματος και το τοποθετεί στην επόμενη σωστή θέση.",
    code:[
      "ΓΙΑ i ΑΠΟ 1 ΜΕΧΡΙ N-1",
      "   min <- i",
      "   ΓΙΑ j ΑΠΟ i+1 ΜΕΧΡΙ N",
      "      ΑΝ A[j] < A[min] ΤΟΤΕ",
      "         min <- j",
      "      ΤΕΛΟΣ_ΑΝ",
      "   ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ",
      "   ΑΝ min <> i ΤΟΤΕ",
      "      temp <- A[i]",
      "      A[i] <- A[min]",
      "      A[min] <- temp",
      "   ΤΕΛΟΣ_ΑΝ",
      "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
    ],
    trace:["Βήμα","i","j","min","A[min]","Ενέργεια"]
  },
  binary:{
    title:"Binary Search",
    description:"Σε ταξινομημένο πίνακα εξετάζει το μεσαίο στοιχείο και απορρίπτει κάθε φορά το μισό διάστημα.",
    code:[
      "left <- 1",
      "right <- N",
      "ΟΣΟ left <= right ΕΠΑΝΑΛΑΒΕ",
      "   mid <- (left + right) DIV 2",
      "   ΑΝ A[mid] = target ΤΟΤΕ",
      "      θέση <- mid",
      "      ΕΞΟΔΟΣ",
      "   ΑΛΛΙΩΣ_ΑΝ target < A[mid] ΤΟΤΕ",
      "      right <- mid - 1",
      "   ΑΛΛΙΩΣ",
      "      left <- mid + 1",
      "   ΤΕΛΟΣ_ΑΝ",
      "ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ"
    ],
    trace:["Βήμα","left","right","mid","A[mid]","Ενέργεια"]
  }
};

function parseNumbers(){
  const v=nums.value.split(",").map(x=>Number(x.trim())).filter(Number.isFinite);
  if(v.length<2||v.length>12){
    alert("Βάλε από 2 έως 12 αριθμούς.");
    return null;
  }
  return v;
}

function addStep(h,values,message,line,vars={},extra={}){
  h.push({values:[...values],message,line,vars,...extra});
}

function bubble(v){
  let a=[...v],h=[],n=a.length;

  addStep(h,a,"Αρχική κατάσταση.",0,
    {i:"-",j:"-",N:n},{sortedUntil:-1});

  // Σχολικό βιβλίο:
  // ΓΙΑ i ΑΠΟ 2 ΜΕΧΡΙ N
  //   ΓΙΑ j ΑΠΟ N ΜΕΧΡΙ i ΜΕ_ΒΗΜΑ -1
  //      ΑΝ A[j-1] > A[j] ΤΟΤΕ ...
  for(let i=2;i<=n;i++){
    for(let j=n;j>=i;j--){
      const left=a[j-2];   // A[j-1] σε αρίθμηση 1..N
      const right=a[j-1];  // A[j]

      addStep(h,a,`Συγκρίνουμε A[${j-1}] = ${left} και A[${j}] = ${right}.`,2,
        {i:i,j:j,N:n,Ajm1:left,Aj:right},
        {
          comparing:[j-2,j-1],
          sortedUntil:i-2,
          prediction:{
            question:`Τι θα συμβεί με τα ${left} και ${right};`,
            options:[
              {text:"Θα γίνει ανταλλαγή",correct:left>right},
              {text:"Δεν θα γίνει ανταλλαγή",correct:left<=right}
            ]
          },
          trace:{
            i:i,
            j:j,
            a:left,
            b:right,
            action:left>right?"Ανταλλαγή":"Καμία ανταλλαγή"
          }
        });

      if(left>right){
        let temp=a[j-2];
        a[j-2]=a[j-1];
        a[j-1]=temp;

        addStep(h,a,`Ανταλλάξαμε τα A[${j-1}] και A[${j}].`,5,
          {i:i,j:j,temp:temp,N:n,Ajm1:a[j-2],Aj:a[j-1]},
          {
            swapping:[j-2,j-1],
            sortedUntil:i-2
          });
      }
    }
  }

  addStep(h,a,"Η ταξινόμηση ολοκληρώθηκε.",8,
    {i:n,j:"-",N:n},{sortedUntil:n-1});

  return h;
}

function selection(v){
  let a=[...v],h=[],n=a.length;
  addStep(h,a,"Αρχική κατάσταση.",0,{i:"-",j:"-",min:"-",N:n},{sortedUntil:-1});

  for(let i=0;i<n-1;i++){
    let min=i;

    for(let j=i+1;j<n;j++){
      const beforeMin=min;
      const currentMin=a[min];
      const candidate=a[j];

      addStep(h,a,`Συγκρίνουμε ${candidate} με το τρέχον ελάχιστο ${currentMin}.`,3,
        {i:i+1,j:j+1,min:min+1,N:n},
        {
          comparing:[min,j],sortedUntil:i-1,
          prediction:{
            question:`Το ${candidate} θα γίνει νέο ελάχιστο αντί του ${currentMin};`,
            options:[
              {text:"Ναι",correct:candidate<currentMin},
              {text:"Όχι",correct:candidate>=currentMin}
            ]
          },
          trace:{i:i+1,j:j+1,min:beforeMin+1,minValue:currentMin,action:candidate<currentMin?"Νέο ελάχιστο":"Παραμένει το ίδιο ελάχιστο"}
        });

      if(candidate<currentMin){
        min=j;
        addStep(h,a,`Νέο ελάχιστο: ${a[min]} στη θέση ${min+1}.`,4,
          {i:i+1,j:j+1,min:min+1,N:n},{comparing:[min,j],sortedUntil:i-1});
      }
    }

    if(min!==i){
      const old=a[i],small=a[min];
      [a[i],a[min]]=[a[min],a[i]];
      addStep(h,a,`Μεταφέρουμε το ${small} στη θέση ${i+1}.`,10,
        {i:i+1,j:"-",min:min+1,temp:old,N:n},
        {
          swapping:[i,min],sortedUntil:i,
          prediction:{
            question:`Ποιο στοιχείο θα τοποθετηθεί στη θέση ${i+1};`,
            options:[
              {text:String(small),correct:true},
              {text:String(old),correct:false}
            ]
          }
        });
    }else{
      addStep(h,a,`Το ${a[i]} είναι ήδη στη σωστή θέση.`,7,
        {i:i+1,j:"-",min:min+1,N:n},{sortedUntil:i});
    }
  }

  addStep(h,a,"Η ταξινόμηση ολοκληρώθηκε.",12,{i:n-1,j:"-",min:"-",N:n},{sortedUntil:n-1});
  return h;
}

function binary(v,t){
  let a=[...v].sort((x,y)=>x-y),h=[],left=0,right=a.length-1,n=a.length;
  addStep(h,a,`Ταξινομούμε πρώτα τον πίνακα και αναζητούμε το ${t}.`,0,
    {left:1,right:n,mid:"-",target:t,N:n},{left,right,current:-1,found:-1});

  while(left<=right){
    const mid=Math.floor((left+right)/2);
    const midValue=a[mid];

    let correctAction, options;
    if(midValue===t){
      correctAction="Βρέθηκε";
      options=[
        {text:"Το στοιχείο βρέθηκε",correct:true},
        {text:"Συνεχίζουμε αριστερά",correct:false},
        {text:"Συνεχίζουμε δεξιά",correct:false}
      ];
    }else if(t<midValue){
      correctAction="Αριστερό μισό";
      options=[
        {text:"Το στοιχείο βρέθηκε",correct:false},
        {text:"Συνεχίζουμε αριστερά",correct:true},
        {text:"Συνεχίζουμε δεξιά",correct:false}
      ];
    }else{
      correctAction="Δεξί μισό";
      options=[
        {text:"Το στοιχείο βρέθηκε",correct:false},
        {text:"Συνεχίζουμε αριστερά",correct:false},
        {text:"Συνεχίζουμε δεξιά",correct:true}
      ];
    }

    addStep(h,a,`Εξετάζουμε το μεσαίο στοιχείο ${midValue}.`,3,
      {left:left+1,right:right+1,mid:mid+1,target:t,N:n,Amid:midValue},
      {
        left,right,current:mid,found:-1,
        prediction:{question:`target = ${t}, A[mid] = ${midValue}. Τι ακολουθεί;`,options},
        trace:{left:left+1,right:right+1,mid:mid+1,midValue,action:correctAction}
      });

    if(midValue===t){
      addStep(h,a,`Βρέθηκε το ${t} στη θέση ${mid+1}.`,5,
        {left:left+1,right:right+1,mid:mid+1,target:t,θέση:mid+1,N:n},
        {left,right,current:mid,found:mid});
      return h;
    }

    if(t<midValue){
      right=mid-1;
      addStep(h,a,`Κρατάμε το αριστερό μισό.`,8,
        {left:left+1,right:right+1,mid:mid+1,target:t,N:n},
        {left,right,current:-1,found:-1});
    }else{
      left=mid+1;
      addStep(h,a,`Κρατάμε το δεξί μισό.`,10,
        {left:left+1,right:right+1,mid:mid+1,target:t,N:n},
        {left,right,current:-1,found:-1});
    }
  }

  addStep(h,a,`Το ${t} δεν βρέθηκε στον πίνακα.`,12,
    {left:left+1,right:right+1,mid:"-",target:t,N:n},
    {left:1,right:0,current:-1,found:-1});
  return h;
}

function build(v){
  if(alg.value==="bubble") return bubble(v);
  if(alg.value==="selection") return selection(v);
  return binary(v,Number(target.value));
}

function escapeHtml(s){
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

function renderPseudocode(activeLine){
  pseudo.innerHTML=meta[alg.value].code.map((line,i)=>
    `<span class="code-line ${i===activeLine?"active":""}">${escapeHtml(line)}</span>`
  ).join("");
}

function renderVariables(vars){
  varsBox.innerHTML="";
  Object.entries(vars||{}).forEach(([k,v])=>{
    const chip=document.createElement("div");
    chip.className="var-chip";
    chip.textContent=`${k} = ${v}`;
    varsBox.appendChild(chip);
  });
}

function renderTraceHeader(){
  traceHead.innerHTML="<tr>"+meta[alg.value].trace.map(h=>`<th>${escapeHtml(h)}</th>`).join("")+"</tr>";
}

function traceCells(trace,index){
  if(alg.value==="bubble"){
    return [index+1,trace.i,trace.j,trace.a,trace.b,trace.action];
  }
  if(alg.value==="selection"){
    return [index+1,trace.i,trace.j,trace.min,trace.minValue,trace.action];
  }
  return [index+1,trace.left,trace.right,trace.mid,trace.midValue,trace.action];
}

function renderTrace(){
  renderTraceHeader();
  traceBody.innerHTML="";
  traceRows.forEach((tr,i)=>{
    const row=document.createElement("tr");
    if(i===traceRows.length-1) row.className="current-trace";
    const cells=traceCells(tr,i);
    cells.forEach((value,idx)=>{
      const td=document.createElement("td");
      td.textContent=value;
      if(idx===cells.length-1) td.className="action-cell";
      row.appendChild(td);
    });
    traceBody.appendChild(row);
  });
}

function maybeAddTrace(step){
  if(step.trace && !step.traceAdded){
    traceRows.push(step.trace);
    step.traceAdded=true;
    renderTrace();
  }
}

function render(step){
  box.innerHTML="";
  const max=Math.max(...step.values.map(x=>Math.abs(x)),1);

  step.values.forEach((v,i)=>{
    const w=document.createElement("div");
    w.className="bar-wrap";

    const b=document.createElement("div");
    b.className="bar";
    b.style.height=`${70+Math.abs(v)/max*150}px`;

    if(step.comparing?.includes(i)) b.classList.add("comparing");
    if(step.swapping?.includes(i)) b.classList.add("swapping");
    if(typeof step.sortedFrom==="number"&&i>=step.sortedFrom) b.classList.add("sorted");
    if(typeof step.sortedUntil==="number"&&i<=step.sortedUntil) b.classList.add("sorted");

    if(alg.value==="binary"){
      if(i<step.left||i>step.right) b.classList.add("discarded");
      if(i===step.current) b.classList.add("current");
      if(i===step.found) b.classList.add("found");
    }

    const lab=document.createElement("div");
    lab.className="bar-value";
    lab.textContent=v;

    w.append(b,lab);
    box.appendChild(w);
  });

  status.textContent=step.message;
  renderPseudocode(step.line);
  renderVariables(step.vars);
}

function hidePrediction(){
  predictionCard.classList.add("hidden");
  predictionOptions.innerHTML="";
  predictionFeedback.classList.add("hidden");
  predictionFeedback.textContent="";
  waitingForPrediction=false;
}

function showPrediction(step){
  waitingForPrediction=true;
  predictionCard.classList.remove("hidden");
  predictionQuestion.textContent=step.prediction.question;
  predictionOptions.innerHTML="";
  predictionFeedback.classList.add("hidden");

  step.prediction.options.forEach(opt=>{
    const btn=document.createElement("button");
    btn.className="prediction-option";
    btn.textContent=opt.text;
    btn.onclick=()=>{
      [...predictionOptions.children].forEach(b=>b.disabled=true);
      if(opt.correct){
        btn.classList.add("correct-choice");
        predictionFeedback.textContent="Σωστά! Τώρα εκτελούμε το βήμα.";
      }else{
        btn.classList.add("wrong-choice");
        const correct=step.prediction.options.find(o=>o.correct);
        predictionFeedback.textContent=`Όχι. Σωστή πρόβλεψη: ${correct.text}`;
      }
      predictionFeedback.classList.remove("hidden");

      setTimeout(()=>{
        hidePrediction();
        maybeAddTrace(step);
        advanceActually();
      },500);
    };
    predictionOptions.appendChild(btn);
  });
}

function stopAuto(){
  if(timer){
    clearInterval(timer);
    timer=null;
  }
  auto.textContent="Αυτόματη εκτέλεση";
}

function load(v=null){
  stopAuto();
  hidePrediction();

  const values=v||parseNumbers();
  if(!values) return;

  original=[...values];
  steps=build(values);
  steps.forEach(s=>s.traceAdded=false);
  si=0;
  traceRows=[];

  title.textContent=meta[alg.value].title;
  desc.textContent=meta[alg.value].description;
  renderTrace();
  render(steps[0]);
}

function advanceActually(){
  if(si<steps.length-1){
    si++;
    render(steps[si]);
  }
  if(si===steps.length-1) stopAuto();
}

function next(){
  if(waitingForPrediction) return;
  const current=steps[si];

  if(predictMode.checked && current.prediction && !current.traceAdded){
    stopAuto();
    showPrediction(current);
    return;
  }

  maybeAddTrace(current);
  advanceActually();
}

function toggleAuto(){
  if(timer){
    stopAuto();
    return;
  }
  if(si===steps.length-1){
    si=0;
    traceRows=[];
    steps.forEach(s=>s.traceAdded=false);
    renderTrace();
    render(steps[0]);
  }
  auto.textContent="Παύση";
  timer=setInterval(()=>{
    const current=steps[si];
    if(predictMode.checked && current.prediction && !current.traceAdded){
      stopAuto();
      showPrediction(current);
      return;
    }
    maybeAddTrace(current);
    advanceActually();
  },900);
}

alg.addEventListener("change",()=>{
  tw.classList.toggle("hidden",alg.value!=="binary");
  load(original.length?original:null);
});

document.querySelector("#load-btn").onclick=()=>load();

document.querySelector("#random-btn").onclick=()=>{
  let a=[];
  while(a.length<7){
    const n=Math.floor(Math.random()*90)+10;
    if(!a.includes(n)) a.push(n);
  }
  nums.value=a.join(", ");
  load(a);
};

document.querySelector("#step-btn").onclick=next;
auto.onclick=toggleAuto;
document.querySelector("#reset-btn").onclick=()=>original.length&&load(original);

document.querySelector("#clear-trace-btn").onclick=()=>{
  traceRows=[];
  steps.forEach(s=>s.traceAdded=false);
  renderTrace();
};

target.onchange=()=>alg.value==="binary"&&original.length&&load(original);


const requestedAlgorithm = new URLSearchParams(location.search).get("algorithm");
if (requestedAlgorithm && ["bubble","selection","binary"].includes(requestedAlgorithm)) { alg.value=requestedAlgorithm; tw.classList.toggle("hidden",alg.value!=="binary"); }

load([8,3,6,2,5,9,4]);
