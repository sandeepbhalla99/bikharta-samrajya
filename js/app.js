document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const searchInput = document.getElementById('search-input');
  const sidebarList = document.getElementById('sidebar-list');
  const readerContainer = document.getElementById('reader-container');
  const scrollProgress = document.getElementById('scroll-progress');
  const mainContent = document.getElementById('main-content');
  const navBrand = document.getElementById('nav-brand');

  // Themes
  const themeButtons = document.querySelectorAll('.theme-btn');
  // Font controls
  const fontDecrease = document.getElementById('font-decrease');
  const fontIncrease = document.getElementById('font-increase');
  const fontToggle = document.getElementById('font-toggle');

  // --- Chapter Title Mapping ---
  // Mapping the raw chapter filename to its clean Hindi/Devanagari title
  const chapterTitles = {
    "Chapter 1": "प्राक्कथन",
    "Chapter 2": "व्याख्यात्मक टिप्पणी",
    "Chapter 3": "सूत्रपात",
    "Chapter 4": "भूमिका",
    "Chapter 5": "अमेरिका की नींव और विकास",
    "Chapter 6": "अमेरिका के प्रथम राष्ट्रपति",
    "Chapter 7": "प्रकट नियति के युद्ध",
    "Chapter 8": "शुल्क का पाखंड",
    "Chapter 9": "युद्ध के अप्रत्याशित लाभ",
    "Chapter 10": "वाइमर गणराज्य की कीमत",
    "Chapter 11": "साम्राज्य की घोषणा",
    "Chapter 12": "स्वर्ण मानक का अंत",
    "Chapter 13": "ऋण और ऋण सीमा",
    "Chapter 14": "ब्रिटिश साम्राज्य",
    "Chapter 15": "मुद्रा प्रबंधन",
    "Chapter 16": "संकटों में डॉलर की रजत रेखा",
    "Chapter 17": "अल्पाधिकार मुद्रा प्रणाली",
    "Chapter 18": "तेल युद्ध",
    "Chapter 19": "शासन परिवर्तन अभियान",
    "Chapter 20": "अंतरिक्ष युद्ध",
    "Chapter 21": "सोवियत संघ का पतन",
    "Chapter 22": "समृद्ध साम्राज्य में निर्धनता",
    "Chapter 23": "लोकप्रिय नाजी अर्थशास्त्र",
    "Chapter 24": "शिक्षा जाल",
    "Chapter 25": "विषाक्त विशेषज्ञता",
    "Chapter 26": "मृदु शक्ति का पतन",
    "Chapter 27": "अविश्वसनीय कला नीलामियाँ",
    "Chapter 28": "रणनीतिक विच्छेदन",
    "Chapter 29": "सैन्य महाशक्ति",
    "Chapter 30": "अमेरिका ब्रिटेन की नकल कर रहा है",
    "Chapter 31": "साम्राज्यों का पतन",
    "Chapter 32": "प्राचीन युद्ध विज्ञान",
    "Chapter 33": "नई विषकन्या: AI",
    "Chapter 34": "प्रोजेक्ट 2025",
    "Chapter 35": "मुस्कुराते विश्वासघात*",
    "Chapter 36": "नई विश्व व्यवस्था",
    "Chapter 37": "अप्रभावी शासन",
    "Chapter 38": "भ्रम का चक्रव्यूह",
    "Chapter 39": "नई शीत युद्ध",
    "Chapter 40*": "धन के पीछे कीमत",
    "Chapter 41": "परिपूर्ण बुलबुला",
    "Chapter 42": "काले बादल",
    "Chapter 43": "राष्ट्र पुनर्निर्माण",
    "Chapter 44": "उपसंहार",
    "Bibliography": "संदर्भ सूची"
  };

  function getChapterLabel(index) {
    if (index === 0) return "Preface";
    if (index === 1) return "Explanatory Note";
    if (index === 2) return "Prologue";
    if (index >= 3 && index <= 42) return "Chapter " + (index - 2);
    if (index === 43) return "Epilogue";
    if (index === 44) return "Bibliography";
    return "";
  }

  // --- App State ---
  let chapters = [];
  let currentChapterIndex = -1;
  let currentTheme = localStorage.getItem('theme') || 'light';
  let fontScale = parseFloat(localStorage.getItem('fontScale')) || 1.0;
  let isSerif = localStorage.getItem('fontFamily') !== 'sans';

  // --- Initialization ---
  initTheme();
  initFontSettings();
  setupEventListeners();
  loadBookData();

  // --- Theme Management ---
  function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeButtons.forEach(btn => {
      if (btn.getAttribute('data-val') === currentTheme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-val') === theme);
    });
  }

  // --- Font Management ---
  function initFontSettings() {
    updateFontScale();
    updateFontFamily();
  }

  function updateFontScale() {
    document.documentElement.style.setProperty('--font-scale', `${fontScale}rem`);
    localStorage.setItem('fontScale', fontScale);
  }

  function updateFontFamily() {
    if (isSerif) {
      document.body.style.setProperty('--font-serif', "'Noto Serif Devanagari', 'Lora', Georgia, serif");
      fontToggle.innerText = 'Serif';
      localStorage.setItem('fontFamily', 'serif');
    } else {
      document.body.style.setProperty('--font-serif', "'Mukta', sans-serif");
      fontToggle.innerText = 'Sans-Serif';
      localStorage.setItem('fontFamily', 'sans');
    }
  }

  // --- Load and Parse Index.md ---
  async function loadBookData() {
    try {
      showLoading();
      const response = await fetch('chapters/Index.md');
      if (!response.ok) throw new Error('Could not load Index.md');
      
      const text = await response.text();
      chapters = parseIndexScenes(text);
      
      renderSidebarList(chapters);
      
      // Handle Routing
      handleRoute();
    } catch (err) {
      showError(`Failed to load book index: ${err.message}`);
    }
  }

  function parseIndexScenes(yamlText) {
    const scenes = [];
    const lines = yamlText.split('\n');
    let inScenes = false;
    
    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('scenes:')) {
        inScenes = true;
        continue;
      }
      if (inScenes) {
        if (trimmed.startsWith('-')) {
          const chapterName = trimmed.substring(1).trim();
          scenes.push(chapterName);
        } else if (trimmed.startsWith('ignoredFiles:') || trimmed === '---' || (trimmed && !trimmed.startsWith('-'))) {
          inScenes = false;
        }
      }
    }
    return scenes;
  }

  // --- Render Lists ---
  function renderSidebarList(list) {
    sidebarList.innerHTML = '';
    list.forEach((chapter) => {
      const originalIndex = chapters.indexOf(chapter);
      const titleText = chapterTitles[chapter] || chapter;
      
      const item = document.createElement('a');
      item.href = `#${encodeURIComponent(chapter)}`;
      item.className = 'chapter-item';
      item.innerHTML = `
        <span style="display: flex; flex-direction: column; gap: 0.15rem;">
          <span style="font-size: 0.72rem; color: var(--accent-gold); text-transform: uppercase; font-family: var(--font-sans); letter-spacing: 0.5px;">
            ${getChapterLabel(originalIndex)}
          </span>
          <span style="font-weight: 500; line-height: 1.3;">${titleText}</span>
        </span>
      `;
      
      item.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          sidebar.classList.remove('open');
        }
      });
      sidebarList.appendChild(item);
    });
  }

  // --- Dynamic Search ---
  function filterChapters(query) {
    const filtered = chapters.filter(ch => {
      const title = chapterTitles[ch] || '';
      return ch.toLowerCase().includes(query.toLowerCase()) || 
             title.toLowerCase().includes(query.toLowerCase());
    });
    renderSidebarList(filtered);
    
    // Maintain active highlight
    if (currentChapterIndex !== -1) {
      const activeName = chapters[currentChapterIndex];
      const items = sidebarList.querySelectorAll('.chapter-item');
      items.forEach(item => {
        const name = decodeURIComponent(item.getAttribute('href').substring(1));
        if (name === activeName) {
          item.classList.add('active');
        }
      });
    }
  }

  // --- Router / View Switcher ---
  function handleRoute() {
    const hash = decodeURIComponent(window.location.hash.substring(1));
    
    if (!hash || hash === 'home' || hash === 'landing') {
      renderLandingPage();
    } else {
      const index = chapters.indexOf(hash);
      if (index !== -1) {
        loadChapter(index);
      } else {
        renderLandingPage();
      }
    }
  }

  // --- Render Views ---
  function showLoading() {
    mainContent.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; gap: 1rem;">
        <div style="border: 4px solid var(--border-color); border-top: 4px solid var(--accent-burgundy); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
        <p style="font-family: var(--font-sans); color: var(--text-muted);">Loading Chapter...</p>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
  }

  function showError(msg) {
    mainContent.innerHTML = `
      <div style="text-align: center; padding: 4rem 2rem; color: var(--accent-burgundy);">
        <h2 style="margin-bottom: 1rem; font-family: var(--font-serif);">Something went wrong</h2>
        <p style="font-family: var(--font-sans); color: var(--text-muted);">${msg}</p>
        <button class="btn-primary" style="margin: 2rem auto 0 auto;" onclick="window.location.reload()">Retry</button>
      </div>
    `;
  }

  function renderLandingPage() {
    currentChapterIndex = -1;
    scrollProgress.style.width = '0%';
    
    // Highlight none in sidebar
    sidebarList.querySelectorAll('.chapter-item').forEach(item => item.classList.remove('active'));

    // Construct landing content
    let tocCardsHTML = chapters.map((ch, i) => {
      const titleText = chapterTitles[ch] || ch;
      return `
        <div class="toc-card" data-chapter="${encodeURIComponent(ch)}">
          <span class="toc-card-number">${getChapterLabel(i)}</span>
          <span class="toc-card-title">${titleText}</span>
        </div>
      `;
    }).join('');

    mainContent.innerHTML = `
      <div class="landing-view">
        <div class="book-hero">
          <div class="book-cover-container">
            <img class="book-cover" src="book_cover.png" alt="अमरीका का बिखरता साम्राज्य">
          </div>
          <div class="book-details">
            <span class="book-tagline">Rise and Fall of the Financial Hegemon</span>
            <h1 class="book-title-main">अमरीका का बिखरता साम्राज्य</h1>
            <p class="book-author">By a Lawyer, Economist & Financial Practitioner</p>
            <p class="book-description">
              एक गहन विश्लेषण कि कैसे अमरीका एक आर्थिक और वैश्विक महाशक्ति बना और कैसे वह अब पतन की ढलान पर निकल चुका है। आइए पढ़ें....
            </p>
            <div class="book-actions">
              <button class="btn-primary" id="btn-start-reading">
                Start Reading <span style="font-size: 1.25rem;">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        <div class="landing-toc">
          <h2 class="section-title">Table of Contents</h2>
          <div class="toc-grid">
            ${tocCardsHTML}
          </div>
        </div>

        <footer class="site-footer">
          <p class="copyright">&copy; 2026 <strong>Sandeep Bhalla</strong>, the Author.</p>
          <p class="license">
            Licensed under the <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution‑NonCommercial 4.0 International License (CC BY‑NC 4.0)</a> to all users/readers.
          </p>
        </footer>
      </div>
    `;

    // Bind event listeners on landing elements
    document.getElementById('btn-start-reading').addEventListener('click', () => {
      if (chapters.length > 0) {
        window.location.hash = encodeURIComponent(chapters[0]);
      }
    });

    mainContent.querySelectorAll('.toc-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.hash = card.getAttribute('data-chapter');
      });
    });

    readerContainer.scrollTop = 0;
  }

  async function loadChapter(index) {
    currentChapterIndex = index;
    const chapterName = chapters[index];
    
    // Highlight sidebar
    sidebarList.querySelectorAll('.chapter-item').forEach(item => {
      const activeName = decodeURIComponent(item.getAttribute('href').substring(1));
      item.classList.toggle('active', activeName === chapterName);
    });

    showLoading();

    try {
      const response = await fetch(`chapters/${encodeURIComponent(chapterName)}.md`);
      if (!response.ok) throw new Error(`Could not load chapter file: ${chapterName}.md`);
      
      let markdown = await response.text();
      
      // Remove possible Obsidian frontmatter if present
      if (markdown.startsWith('---')) {
        const nextSeparator = markdown.indexOf('---', 3);
        if (nextSeparator !== -1) {
          markdown = markdown.substring(nextSeparator + 3).trim();
        }
      }

      // Convert Markdown to HTML
      const htmlContent = marked.parse(markdown);
      
      // Calculate Nav links
      const prevChapter = index > 0 ? chapters[index - 1] : null;
      const nextChapter = index < chapters.length - 1 ? chapters[index + 1] : null;

      let navHTML = '';
      if (prevChapter || nextChapter) {
        navHTML = `
          <div class="reader-nav">
            ${prevChapter ? `
              <a href="#${encodeURIComponent(prevChapter)}" class="btn-nav btn-nav-prev">
                <span class="btn-nav-label">&larr; ${getChapterLabel(index - 1)}</span>
                <span class="btn-nav-title">${chapterTitles[prevChapter] || prevChapter}</span>
              </a>
            ` : '<div></div>'}
            ${nextChapter ? `
              <a href="#${encodeURIComponent(nextChapter)}" class="btn-nav btn-nav-next">
                <span class="btn-nav-label">${getChapterLabel(index + 1)} &rarr;</span>
                <span class="btn-nav-title">${chapterTitles[nextChapter] || nextChapter}</span>
              </a>
            ` : '<div></div>'}
          </div>
        `;
      }

      mainContent.innerHTML = `
        <div class="reader-content">
          <article class="article-body" id="article-body">
            ${htmlContent}
          </article>
          ${navHTML}
          <footer class="reader-footer">
            <p class="copyright">&copy; 2026 <strong>Sandeep Bhalla</strong>, the Author.</p>
            <p class="license">
              Licensed under <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC 4.0</a>.
            </p>
          </footer>
        </div>
      `;

      // Post-process HTML to identify one-liner teaser quotes vs actual start of text
      const articleBody = document.getElementById('article-body');
      if (articleBody) {
        const paragraphs = articleBody.querySelectorAll('p');
        if (paragraphs.length > 0) {
          const firstParagraph = paragraphs[0];
          const text = firstParagraph.textContent.trim();
          
          // If the first paragraph is a short quote/hook or metadata floter,
          // we treat the second paragraph as the actual starting text
          if (text.length < 120 && paragraphs.length > 1) {
            firstParagraph.classList.add('quote-floater');
            paragraphs[1].classList.add('drop-cap');
          } else {
            firstParagraph.classList.add('drop-cap');
          }
        }
      }

      readerContainer.scrollTop = 0;
      updateScrollProgress();

    } catch (err) {
      showError(`Failed to load chapter content: ${err.message}`);
    }
  }

  // --- Scroll Progress Tracking ---
  function updateScrollProgress() {
    if (currentChapterIndex === -1) {
      scrollProgress.style.width = '0%';
      return;
    }
    const scrollTop = readerContainer.scrollTop;
    const scrollHeight = readerContainer.scrollHeight;
    const clientHeight = readerContainer.clientHeight;
    
    const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
    scrollProgress.style.width = `${Math.min(100, Math.max(0, scrolled))}%`;
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Router
    window.addEventListener('hashchange', handleRoute);

    // Sidebar Slide Toggle for Mobile
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar if clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      }
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
      filterChapters(e.target.value);
    });

    // Theme switching buttons
    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(btn.getAttribute('data-val'));
      });
    });

    // Logo / Brand back to Home
    navBrand.addEventListener('click', () => {
      window.location.hash = 'home';
    });

    // Font actions
    fontDecrease.addEventListener('click', () => {
      if (fontScale > 0.8) {
        fontScale -= 0.1;
        updateFontScale();
      }
    });

    fontIncrease.addEventListener('click', () => {
      if (fontScale < 1.6) {
        fontScale += 0.1;
        updateFontScale();
      }
    });

    fontToggle.addEventListener('click', () => {
      isSerif = !isSerif;
      updateFontFamily();
    });

    // Scroll progress throttling
    readerContainer.addEventListener('scroll', updateScrollProgress);
  }
});
