/**
 * DevOps Academy – App
 * Gestion des onglets et interactivité (copier, simulation pipeline).
 * 
 * Activation GitHub Pages :
 *   Settings > Pages > Source: "Deploy from a branch"
 *   Branch: main, folder: / (root) > Save
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. GESTION DES ONGLETS (Tabs)
  // ==========================================================================

  const tabButtons = document.querySelectorAll('[role="tab"]');
  const tabPanels  = document.querySelectorAll('[role="tabpanel"]');

  /**
   * Active un onglet et son panneau correspondant.
   * @param {string} tabId – data-tab de l'onglet à activer
   */
  function activateTab(tabId) {
    // Désactiver tous les onglets et panneaux
    tabButtons.forEach(function (btn) {
      btn.classList.remove('tabs-nav__btn--active');
      btn.setAttribute('aria-selected', 'false');
    });

    tabPanels.forEach(function (panel) {
      panel.classList.remove('tab-panel--active');
    });

    // Activer l'onglet cible
    const targetBtn = document.querySelector('[data-tab="' + tabId + '"]');
    const targetPanel = document.getElementById('panel-' + tabId);

    if (targetBtn && targetPanel) {
      targetBtn.classList.add('tabs-nav__btn--active');
      targetBtn.setAttribute('aria-selected', 'true');
      targetPanel.classList.add('tab-panel--active');
    }
  }

  // Écouter les clics sur chaque bouton d'onglet
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tabId = btn.getAttribute('data-tab');
      activateTab(tabId);

      // Mettre à jour l'URL dans l'historique sans rechargement
      if (history.pushState) {
        history.pushState({ tab: tabId }, '', '#' + tabId);
      }
    });
  });

  // Restaurer l'onglet au chargement si un hash est présent
  function restoreTabFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash !== '' && !isNaN(hash)) {
      activateTab(hash);
    }
  }

  restoreTabFromHash();

  // Gérer la navigation arrière/avant du navigateur
  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.tab !== undefined) {
      activateTab(e.state.tab);
    } else {
      restoreTabFromHash();
    }
  });

  // ==========================================================================
  // 2. BOUTON "COPIER" LE WORKFLOW YAML
  // ==========================================================================

  const copyBtn = document.getElementById('btn-copy');
  const copyFeedback = document.getElementById('copy-feedback');

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      // Récupérer le texte brut du workflow (sans les <span> de couleur)
      const codeEl = document.getElementById('workflow-code');
      const rawText = codeEl.textContent || codeEl.innerText;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(rawText).then(function () {
          showCopySuccess();
        }).catch(function () {
          fallbackCopy(rawText);
        });
      } else {
        fallbackCopy(rawText);
      }
    });
  }

  /** Affiche le retour visuel "copié" */
  function showCopySuccess() {
    copyBtn.textContent = '✅ Copié !';
    copyBtn.classList.add('btn-copy--success');
    if (copyFeedback) {
      copyFeedback.textContent = 'Le fichier YAML a été copié dans le presse-papier.';
    }
    setTimeout(function () {
      copyBtn.textContent = '📋 Copier';
      copyBtn.classList.remove('btn-copy--success');
      if (copyFeedback) {
        copyFeedback.textContent = '';
      }
    }, 2500);
  }

  /** Méthode de secours : copie via un élément textarea temporaire */
  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopySuccess();
    } catch (e) {
      alert('Impossible de copier. Sélectionnez le code manuellement (Ctrl+A, Ctrl+C).');
    }
    document.body.removeChild(textarea);
  }

  // ==========================================================================
  // 3. SIMULATION DE PIPELINE CI/CD
  // ==========================================================================

  const demoBtn = document.getElementById('btn-demo-push');
  const pipelineSteps = document.querySelectorAll('.pipeline-step');

  if (demoBtn) {
    demoBtn.addEventListener('click', function () {
      // Désactiver le bouton pendant l'animation
      demoBtn.disabled = true;
      demoBtn.textContent = '🔄 Exécution en cours…';

      // Réinitialiser toutes les étapes
      pipelineSteps.forEach(function (step) {
        step.setAttribute('data-status', 'pending');
        step.querySelector('.pipeline-step__icon').textContent = '⏳';
      });

      // Lancer chaque étape avec un délai progressif
      var delays = [500, 1400, 2400, 3600];
      pipelineSteps.forEach(function (step, index) {
        setTimeout(function () {
          step.setAttribute('data-status', 'running');
          step.querySelector('.pipeline-step__icon').textContent = '⏳';
        }, delays[index]);

        setTimeout(function () {
          step.setAttribute('data-status', 'success');
          step.querySelector('.pipeline-step__icon').textContent = '✅';

          // Si c'est la dernière étape, réactiver le bouton
          if (index === pipelineSteps.length - 1) {
            demoBtn.disabled = false;
            demoBtn.textContent = '🚀 Simuler un push';
          }
        }, delays[index] + 800);
      });
    });
  }

  // ==========================================================================
  // 4. KEYBOARD NAVIGATION : touches fléchées entre onglets
  // ==========================================================================

  const tabList = document.querySelector('.tabs-nav__list');

  if (tabList) {
    tabList.addEventListener('keydown', function (e) {
      const currentBtn = document.activeElement;
      if (!currentBtn || currentBtn.getAttribute('role') !== 'tab') return;

      const buttons = Array.from(tabButtons);
      const currentIndex = buttons.indexOf(currentBtn);
      if (currentIndex === -1) return;

      let nextIndex;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % buttons.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      } else {
        return;
      }

      buttons[nextIndex].focus();
      buttons[nextIndex].click();
    });
  }

})();
