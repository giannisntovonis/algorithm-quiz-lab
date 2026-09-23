const data = window.APP_CONTENT;

function esc(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function keyFor(code){
  return encodeURIComponent(code);
}

function buildNode(node, level = 0){
  const wrapper = document.createElement("div");
  wrapper.className = `nav-node level-${level}`;
  wrapper.dataset.level = String(level);
  wrapper.dataset.search = `${node.code} ${node.title}`.toLowerCase();

  const row = document.createElement("div");
  row.className = "nav-node-row";

  const link = document.createElement("a");
  link.className = "nav-link";
  link.href = `lesson.html?topic=${encodeURIComponent(node.code)}`;
  link.dataset.topic = node.code;

  const code = document.createElement("span");
  code.className = "nav-code";
  code.textContent = node.code;

  const title = document.createElement("span");
  title.className = "nav-title";
  title.textContent = node.title;

  link.append(code, title);
  row.appendChild(link);

  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  if(hasChildren){
    const toggle = document.createElement("button");
    toggle.className = "nav-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Άνοιγμα υποενοτήτων");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "⌄";
    row.appendChild(toggle);

    const children = document.createElement("div");
    children.className = "nav-children";

    node.children.forEach(child => {
      children.appendChild(buildNode(child, level + 1));
    });

    toggle.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const willOpen = !children.classList.contains("open");

      // At top level only one chapter remains open at a time.
      if(level === 0 && willOpen){
        const host = document.querySelector("#syllabus-nav");
        host.querySelectorAll(":scope > .nav-node > .nav-children.open").forEach(other => {
          if(other !== children) other.classList.remove("open");
        });
        host.querySelectorAll(":scope > .nav-node > .nav-node-row > .nav-toggle.open").forEach(other => {
          if(other !== toggle){
            other.classList.remove("open");
            other.setAttribute("aria-expanded", "false");
          }
        });
      }

      children.classList.toggle("open", willOpen);
      toggle.classList.toggle("open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });

    wrapper.append(row, children);
  } else {
    wrapper.appendChild(row);
  }

  return wrapper;
}

function openAncestors(activeLink){
  let childBox = activeLink.closest(".nav-children");
  while(childBox){
    childBox.classList.add("open");
    const parentNode = childBox.parentElement;
    if(parentNode){
      const toggle = parentNode.querySelector(":scope > .nav-node-row > .nav-toggle");
      if(toggle){
        toggle.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
      }
      childBox = parentNode.parentElement.closest(".nav-children");
    }else{
      childBox = null;
    }
  }
}

function renderSidebar(){
  const host = document.querySelector("#syllabus-nav");
  if(!host) return;

  host.innerHTML = "";
  host.classList.add("vertical-syllabus");

  data.syllabus.forEach(chapter => {
    host.appendChild(buildNode(chapter, 0));
  });

  const activeTopic = new URLSearchParams(location.search).get("topic");
  if(activeTopic){
    const links = [...host.querySelectorAll(".nav-link")];
    const active = links.find(a => a.dataset.topic === activeTopic);
    if(active){
      active.classList.add("active");
      openAncestors(active);
    }
  }
}

function setupSearch(){
  const input = document.querySelector("#syllabus-search");
  const host = document.querySelector("#syllabus-nav");
  if(!input || !host) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();

    host.querySelectorAll(".nav-node").forEach(node => {
      node.classList.toggle("search-hidden", Boolean(q) && !node.dataset.search.includes(q));
    });

    if(q){
      host.querySelectorAll(".nav-children").forEach(box => box.classList.add("open"));
      host.querySelectorAll(".nav-toggle").forEach(btn => {
        btn.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      });

      [...host.querySelectorAll(".nav-node:not(.search-hidden)")].forEach(node => {
        let parent = node.parentElement.closest(".nav-node");
        while(parent){
          parent.classList.remove("search-hidden");
          parent = parent.parentElement.closest(".nav-node");
        }
      });
    }
  });
}

function setupMobile(){
  const button = document.querySelector("#sidebar-toggle");
  const sidebar = document.querySelector(".app-sidebar");
  if(button && sidebar){
    button.addEventListener("click", () => sidebar.classList.toggle("mobile-open"));
  }
}

renderSidebar();
setupSearch();
setupMobile();
