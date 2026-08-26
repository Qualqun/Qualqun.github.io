(function () {
  const isFrenchPage = document.documentElement.lang.toLowerCase().startsWith("fr");

  const filters = [
    { id: "unity", label: "Unity", match: /\bunity\b/i },
    { id: "unreal", label: "Unreal", match: /unreal/i },
    { id: "sfml", label: "SFML", match: /sfml/i },
    { id: "love2d", label: "Love2D", match: /love\s*2d|love2d/i },
  ];

  const projectDates = {
    extractionz: { label: "ExtractionZ", date: "2025-05", display: "2025" },
    musclebird: { label: "Muscle Bird", date: "2024-09", display: "2024" },
    thefallenone: { label: "The Fallen One", date: "2024-05", display: "2024" },
    quaterback: { label: "Quaterback", date: "2023-11", display: "2023" },
    vorace: { label: "Vorace", date: "2023-05", display: "2023" },
    grandtheftmoto: { label: "Grand Theft Moto", date: "2022-01", display: "2022" },
    sunbreeze: { label: "Sunbreeze", date: "2025-11", display: "2025" },
    flow: { label: "Flow", date: "2025-11", display: "2025" },
    samplenav3d: { label: "SampleNav3D", date: "2026-08", display: isFrenchPage ? "En cours" : "In progress" },
    catrunning: { label: "Cat Running", date: "2025-04", display: "2025" },
  };

  const projectFrameworks = {
    extractionz: ["unity"],
    musclebird: ["unity"],
    thefallenone: ["sfml"],
    quaterback: ["sfml"],
    vorace: ["sfml"],
    grandtheftmoto: ["love2d"],
    sunbreeze: ["unreal"],
    flow: ["unity"],
    samplenav3d: ["unity"],
    catrunning: ["unity"],
  };

  const projectTypes = {
    extractionz: "school",
    musclebird: "school",
    thefallenone: "school",
    quaterback: "school",
    vorace: "school",
    grandtheftmoto: "school",
    sunbreeze: "personal",
    flow: "personal",
    samplenav3d: "personal",
    catrunning: "personal",
  };

  const getProjectSlug = (card) => {
    if (card.dataset.project) {
      return card.dataset.project.toLowerCase();
    }

    const href = card.getAttribute("href") || "";
    const match = href.match(/\/([^/]+)\.html(?:$|[?#])/);
    return match ? match[1].toLowerCase() : "";
  };

  const projectsSection = document.querySelector(".projets");
  const tabs = projectsSection && projectsSection.querySelector(".tabs");
  const primaryPane = projectsSection && projectsSection.querySelector(".w-tab-pane");
  const cards = Array.from(
    projectsSection ? projectsSection.querySelectorAll(".w-tab-pane > a") : []
  );

  if (!projectsSection || !tabs || !primaryPane || cards.length === 0) {
    return;
  }

  const activeFilters = new Set(filters.map((filter) => filter.id));
  const typeFilters = [
    { id: "school", label: isFrenchPage ? "Projet scolaire" : "School project" },
    { id: "personal", label: isFrenchPage ? "Projet personnel" : "Personal project" },
  ];
  const activeTypeFilters = new Set(typeFilters.map((filter) => filter.id));

  cards.forEach((card) => {
    const text = card.textContent || "";
    const slug = getProjectSlug(card);
    const cardFilters = projectFrameworks[slug] || filters
      .filter((filter) => filter.match.test(text))
      .map((filter) => filter.id);
    const projectDate = projectDates[slug];
    const title = card.querySelector(".video-title");
    const overlay = card.querySelector(".video-overlay");
    const trophy = card.querySelector(".video-icon-bottom-left");

    card.dataset.frameworks = cardFilters.join(" ");
    card.dataset.projectType = projectTypes[slug] || "";
    card.dataset.projectDate = projectDate ? projectDate.date : "9999-99";

    if (overlay && trophy && trophy.parentElement !== overlay) {
      overlay.appendChild(trophy);
    }

    if (title && projectDate) {
      title.textContent = projectDate.label;

      if (!title.nextElementSibling || !title.nextElementSibling.classList.contains("project-card-date")) {
        const dateLabel = document.createElement("div");
        dateLabel.className = "project-card-date";
        title.insertAdjacentElement("afterend", dateLabel);
      }

      title.nextElementSibling.textContent = projectDate.display;
    }
  });

  cards
    .slice()
    .sort((firstCard, secondCard) => {
      const firstDate = firstCard.dataset.projectDate || "";
      const secondDate = secondCard.dataset.projectDate || "";

      return secondDate.localeCompare(firstDate) || cards.indexOf(firstCard) - cards.indexOf(secondCard);
    })
    .forEach((card) => primaryPane.appendChild(card));

  const filterBar = document.createElement("div");
  filterBar.className = "project-filter-bar";
  filterBar.setAttribute("aria-label", isFrenchPage ? "Filtres des projets" : "Project filters");

  const filterIcon = document.createElement("span");
  filterIcon.className = "project-filter-icon";
  filterIcon.setAttribute("aria-hidden", "true");
  filterIcon.innerHTML = '<svg viewBox="0 0 24 24" role="img"><path d="M3 5h18l-7 8v5l-4 2v-7L3 5z"/></svg>';
  filterBar.appendChild(filterIcon);

  const updateCards = () => {
    cards.forEach((card) => {
      const cardFilters = (card.dataset.frameworks || "").split(" ").filter(Boolean);
      const isFrameworkVisible =
        activeFilters.size === 0 || cardFilters.some((filter) => activeFilters.has(filter));
      const isTypeVisible =
        activeTypeFilters.size === 0 || activeTypeFilters.has(card.dataset.projectType);
      const isVisible = isFrameworkVisible && isTypeVisible;
      card.classList.toggle("project-card-hidden", !isVisible);
    });
  };

  const canDisableFilter = (filterGroup) => {
    return activeFilters.size + activeTypeFilters.size > 1 && filterGroup.size > 0;
  };

  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "project-filter-chip is-active";
    button.dataset.filter = filter.id;
    button.textContent = filter.label;
    button.setAttribute("aria-pressed", "true");

    button.addEventListener("click", () => {
      const isActive = activeFilters.has(filter.id);

      if (isActive) {
        if (!canDisableFilter(activeFilters)) {
          return;
        }

        activeFilters.delete(filter.id);
      } else {
        activeFilters.add(filter.id);
      }

      button.classList.toggle("is-active", !isActive);
      button.setAttribute("aria-pressed", String(!isActive));
      updateCards();
    });

    filterBar.appendChild(button);
  });

  typeFilters.forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "project-filter-chip is-active";
    button.dataset.filter = filter.id;
    button.textContent = filter.label;
    button.setAttribute("aria-pressed", "true");

    button.addEventListener("click", () => {
      const isActive = activeTypeFilters.has(filter.id);

      if (isActive) {
        if (!canDisableFilter(activeTypeFilters)) {
          return;
        }

        activeTypeFilters.delete(filter.id);
      } else {
        activeTypeFilters.add(filter.id);
      }

      button.classList.toggle("is-active", !isActive);
      button.setAttribute("aria-pressed", String(!isActive));
      updateCards();
    });

    filterBar.appendChild(button);
  });

  tabs.parentNode.insertBefore(filterBar, tabs);
  updateCards();
})();
