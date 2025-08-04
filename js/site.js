/**
 * site.js
 * Site functionality for Golem Design System documentation
 */

(function() {
  'use strict';

  /**
   * Mobile Navigation Toggle
   */
  function initMobileNavigation() {
    const toggle = document.querySelector('[data-mobile-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function() {
      const isOpen = menu.classList.contains('is-open');
      
      if (isOpen) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        menu.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!toggle.contains(event.target) && !menu.contains(event.target)) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /**
   * Component Playground
   */
  function initComponentPlayground() {
    const playgrounds = document.querySelectorAll('.golem-playground');
    
    playgrounds.forEach(playground => {
      const controls = playground.querySelectorAll('input[type="radio"]');
      const target = playground.querySelector('[data-playground-target]');
      const codeDisplay = playground.querySelector('[data-playground-code]');
      
      if (!target || !codeDisplay) return;

      function updateComponent() {
        // Reset classes to base component class
        const baseClass = target.className.split(' ')[0];
        target.className = baseClass;
        
        // Apply selected variants
        const classes = [baseClass];
        controls.forEach(control => {
          if (control.checked && control.value !== 'default') {
            classes.push(`${baseClass}--${control.value}`);
          }
        });
        
        target.className = classes.join(' ');
        
        // Update code display
        const html = `<${target.tagName.toLowerCase()} class="${target.className}">
  ${target.textContent}
</${target.tagName.toLowerCase()}>`;
        
        codeDisplay.textContent = html;
      }

      // Initial update
      updateComponent();

      // Listen for changes
      controls.forEach(control => {
        control.addEventListener('change', updateComponent);
      });
    });
  }

  /**
   * Smooth Scrolling for Anchor Links
   */
  function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(event) {
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        
        if (target) {
          event.preventDefault();
          
          const headerOffset = 100; // Account for sticky header
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update focus for accessibility
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /**
   * Copy Code to Clipboard
   */
  function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(codeBlock => {
      const pre = codeBlock.parentElement;
      
      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'golem-btn golem-btn--tertiary golem-btn--sm golem-copy-button';
      copyButton.textContent = 'Copy';
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');
      
      // Position button
      pre.style.position = 'relative';
      copyButton.style.position = 'absolute';
      copyButton.style.top = 'var(--golem-space-2)';
      copyButton.style.right = 'var(--golem-space-2)';
      
      pre.appendChild(copyButton);
      
      // Copy functionality
      copyButton.addEventListener('click', async function() {
        try {
          await navigator.clipboard.writeText(codeBlock.textContent);
          
          // Visual feedback
          const originalText = copyButton.textContent;
          copyButton.textContent = 'Copied!';
          copyButton.classList.add('golem-btn--success');
          
          setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('golem-btn--success');
          }, 2000);
          
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = codeBlock.textContent;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            copyButton.textContent = 'Copy';
          }, 2000);
        }
      });
    });
  }

  /**
   * Table of Contents Generator
   */
  function initTableOfContents() {
    const tocContainer = document.querySelector('[data-toc]');
    if (!tocContainer) return;

    const headings = document.querySelectorAll('h2, h3, h4');
    if (headings.length === 0) return;

    const tocList = document.createElement('ul');
    tocList.className = 'golem-toc-list';

    headings.forEach((heading, index) => {
      // Generate ID if it doesn't exist
      if (!heading.id) {
        heading.id = heading.textContent
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      }

      const listItem = document.createElement('li');
      const link = document.createElement('a');
      
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.className = `golem-toc-link golem-toc-link--${heading.tagName.toLowerCase()}`;
      
      listItem.appendChild(link);
      tocList.appendChild(listItem);
    });

    tocContainer.appendChild(tocList);
  }

  /**
   * Syntax Highlighting (Simple)
   */
  function initSyntaxHighlighting() {
    const codeBlocks = document.querySelectorAll('code[class*="language-"]');
    
    codeBlocks.forEach(codeBlock => {
      const language = Array.from(codeBlock.classList)
        .find(cls => cls.startsWith('language-'))
        ?.replace('language-', '');
      
      if (language === 'html') {
        highlightHTML(codeBlock);
      } else if (language === 'css') {
        highlightCSS(codeBlock);
      } else if (language === 'javascript' || language === 'js') {
        highlightJavaScript(codeBlock);
      }
    });
  }

  function highlightHTML(codeBlock) {
    let html = codeBlock.innerHTML;
    
    // Highlight HTML tags
    html = html.replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)/g, 
      '$1<span class="token-tag">$2</span>');
    
    // Highlight attributes
    html = html.replace(/([a-zA-Z-]+)=(&quot;[^&]*&quot;)/g, 
      '<span class="token-attr-name">$1</span>=<span class="token-attr-value">$2</span>');
    
    // Highlight class names specifically
    html = html.replace(/class=(&quot;[^&]*&quot;)/g, 
      'class=<span class="token-class-value">$1</span>');
    
    codeBlock.innerHTML = html;
  }

  function highlightCSS(codeBlock) {
    let css = codeBlock.innerHTML;
    
    // Highlight selectors
    css = css.replace(/^(\s*)([.#]?[a-zA-Z][a-zA-Z0-9-_]*(?:::?[a-zA-Z-]+)?)\s*{/gm, 
      '$1<span class="token-selector">$2</span> {');
    
    // Highlight properties
    css = css.replace(/([a-zA-Z-]+)\s*:/g, 
      '<span class="token-property">$1</span>:');
    
    // Highlight CSS custom properties
    css = css.replace(/(--[a-zA-Z-]+)/g, 
      '<span class="token-custom-property">$1</span>');
    
    codeBlock.innerHTML = css;
  }

  function highlightJavaScript(codeBlock) {
    let js = codeBlock.innerHTML;
    
    // Highlight keywords
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class'];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      js = js.replace(regex, `<span class="token-keyword">${keyword}</span>`);
    });
    
    // Highlight strings
    js = js.replace(/(['"`])(.*?)\1/g, 
      '<span class="token-string">$1$2$1</span>');
    
    codeBlock.innerHTML = js;
  }

  /**
   * Theme Toggle (if needed)
   */
  function initThemeToggle() {
    const themeToggle = document.querySelector('[data-theme-toggle]');
    if (!themeToggle) return;

    const currentTheme = localStorage.getItem('golem-theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('golem-theme', newTheme);
      
      // Update button text/icon
      const icon = this.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      }
    });
  }

  /**
   * Search Functionality (Simple)
   */
  function initSearch() {
    const searchInput = document.querySelector('[data-search]');
    const searchResults = document.querySelector('[data-search-results]');
    
    if (!searchInput || !searchResults) return;

    let searchIndex = [];
    
    // Build search index
    function buildSearchIndex() {
      const pages = [
        { title: 'Getting Started', url: 'pages/getting-started.html', content: 'installation setup quick start' },
        { title: 'Colors', url: 'pages/design-tokens/colors.html', content: 'color tokens primary secondary' },
        { title: 'Typography', url: 'pages/design-tokens/typography.html', content: 'fonts text sizes headings' },
        { title: 'Buttons', url: 'pages/components/buttons.html', content: 'button primary secondary tertiary' },
        { title: 'Cards', url: 'pages/components/cards.html', content: 'card container layout' },
        { title: 'AI Integration', url: 'pages/ai-integration/overview.html', content: 'artificial intelligence compatibility' }
      ];
      
      searchIndex = pages;
    }

    // Search function
    function search(query) {
      if (!query || query.length < 2) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
      }

      const results = searchIndex.filter(page => 
        page.title.toLowerCase().includes(query.toLowerCase()) ||
        page.content.toLowerCase().includes(query.toLowerCase())
      );

      displayResults(results, query);
    }

    // Display results
    function displayResults(results, query) {
      if (results.length === 0) {
        searchResults.innerHTML = '<div class="golem-p-4">No results found</div>';
      } else {
        const html = results.map(result => `
          <div class="golem-search-result">
            <a href="${result.url}" class="golem-search-result__link">
              <div class="golem-search-result__title">${result.title}</div>
            </a>
          </div>
        `).join('');
        
        searchResults.innerHTML = html;
      }
      
      searchResults.style.display = 'block';
    }

    // Initialize
    buildSearchIndex();
    
    // Event listeners
    searchInput.addEventListener('input', function() {
      const query = this.value.trim();
      search(query);
    });

    // Hide results when clicking outside
    document.addEventListener('click', function(event) {
      if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
        searchResults.style.display = 'none';
      }
    });
  }

  /**
   * Analytics (Privacy-friendly)
   */
  function initAnalytics() {
    // Simple page view tracking without personal data
    if (window.location.hostname !== 'localhost') {
      // Track page views (you can replace this with your preferred analytics)
      console.log('Page view:', window.location.pathname);
    }
  }

  /**
   * Performance Monitoring
   */
  function initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with a web vitals library if needed
      return;
    }

    // Simple performance logging
    window.addEventListener('load', function() {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      if (loadTime > 3000) {
        console.warn('Slow page load detected:', loadTime + 'ms');
      }
    });
  }

  /**
   * Accessibility Enhancements
   */
  function initAccessibility() {
    // Add skip links dynamically if needed
    const skipLink = document.querySelector('.golem-sr-only--focusable');
    if (skipLink) {
      skipLink.addEventListener('click', function(event) {
        event.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Improve focus management for dynamic content
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        // Ensure clicked buttons maintain proper focus indication
        this.classList.add('was-clicked');
        setTimeout(() => {
          this.classList.remove('was-clicked');
        }, 100);
      });
    });
  }

  /**
   * Initialize all functionality
   */
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all features
    initMobileNavigation();
    initComponentPlayground();
    initSmoothScrolling();
    initCodeCopy();
    initTableOfContents();
    initSyntaxHighlighting();
    initThemeToggle();
    initSearch();
    initAnalytics();
    initPerformanceMonitoring();
    initAccessibility();

    // Log successful initialization
    console.log('Golem Design System initialized successfully');
  }

  // Start initialization
  init();

})();