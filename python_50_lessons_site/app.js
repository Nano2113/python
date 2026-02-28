(() => {
  const lessons = window.PY_LESSONS || [];
  const grid = document.getElementById("grid");
  const q = document.getElementById("q");
  const clearBtn = document.getElementById("clear");
  const chips = Array.from(document.querySelectorAll(".chip"));
  const tagSelect = document.getElementById("tagSelect");
  const count = document.getElementById("count");

  const modal = document.getElementById("modal");
  const mTitle = document.getElementById("mTitle");
  const mLevel = document.getElementById("mLevel");
  const mTags = document.getElementById("mTags");
  const mExplanation = document.getElementById("mExplanation");
  const mCode = document.getElementById("mCode");
  const mTasks = document.getElementById("mTasks");
  const copyBtn = document.getElementById("copyBtn");

  let state = { level: "all", tag: "all", query: "" };

  const levelBadgeClass = (lvl) => {
    if (lvl === "Beginner") return "badge badge--b";
    if (lvl === "Intermediate") return "badge badge--i";
    return "badge badge--a";
  };

  const buildTagIndex = () => {
    const set = new Set();
    lessons.forEach(l => l.tags.forEach(t => set.add(t)));
    const tags = Array.from(set).sort((a,b) => a.localeCompare(b, "ru"));
    for (const t of tags){
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      tagSelect.appendChild(opt);
    }
  };

  const normalize = (s) => (s || "").toString().trim().toLowerCase();

  const matches = (l) => {
    if (state.level !== "all" && l.level !== state.level) return false;
    if (state.tag !== "all" && !l.tags.includes(state.tag)) return false;

    const query = normalize(state.query);
    if (!query) return true;

    const hay = normalize([l.title, l.level, l.explanation, l.tags.join(" ")].join(" "));
    return hay.includes(query);
  };

  const render = () => {
    const filtered = lessons.filter(matches);
    grid.innerHTML = "";
    for (const l of filtered){
      const el = document.createElement("article");
      el.className = "card topic";
      el.tabIndex = 0;
      el.setAttribute("role","button");
      el.setAttribute("aria-label", "Открыть тему: " + l.title);

      const kicker = document.createElement("div");
      kicker.className = "topic__kicker";
      const badge = document.createElement("span");
      badge.className = levelBadgeClass(l.level);
      badge.textContent = l.level;
      const id = document.createElement("span");
      id.className = "badge";
      id.textContent = "#" + l.id;
      kicker.appendChild(badge);
      kicker.appendChild(id);

      const title = document.createElement("h3");
      title.className = "topic__title";
      title.textContent = l.title;

      const tags = document.createElement("div");
      tags.className = "topic__tags";
      l.tags.slice(0,5).forEach(t => {
        const pill = document.createElement("span");
        pill.className = "pill";
        pill.textContent = t;
        tags.appendChild(pill);
      });

      el.appendChild(kicker);
      el.appendChild(title);
      el.appendChild(tags);

      const open = () => openModal(l);
      el.addEventListener("click", open);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });

      grid.appendChild(el);
    }

    count.textContent = `Показано: ${filtered.length} из ${lessons.length}`;
  };

  const openModal = (l) => {
    mTitle.textContent = l.title;
    mLevel.textContent = `${l.level} • Тема #${l.id}`;
    mTags.innerHTML = "";
    l.tags.forEach(t => {
      const s = document.createElement("span");
      s.className = "pill";
      s.textContent = t;
      mTags.appendChild(s);
    });

    mExplanation.textContent = l.explanation;

    // code
    mCode.textContent = l.code;

    // tasks
    mTasks.innerHTML = "";
    l.tasks.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      mTasks.appendChild(li);
    });

    copyBtn.onclick = async () => {
      try{
        await navigator.clipboard.writeText(l.code);
        copyBtn.textContent = "Скопировано ✓";
        setTimeout(() => copyBtn.textContent = "Копировать", 1200);
      }catch{
        copyBtn.textContent = "Не удалось";
        setTimeout(() => copyBtn.textContent = "Копировать", 1200);
      }
    };

    modal.showModal();
  };

  // events
  q.addEventListener("input", () => {
    state.query = q.value;
    render();
  });
  clearBtn.addEventListener("click", () => {
    q.value = "";
    state.query = "";
    render();
  });

  chips.forEach(ch => ch.addEventListener("click", () => {
    chips.forEach(x => x.classList.remove("chip--active"));
    ch.classList.add("chip--active");
    state.level = ch.dataset.level;
    render();
  }));

  tagSelect.addEventListener("change", () => {
    state.tag = tagSelect.value;
    render();
  });

  // init
  buildTagIndex();
  render();
})();
