(function () {
  "use strict";

  const rules = globalThis.XPromotionFilterRules;
  const browserApi = globalThis.browser;
  const storage = browserApi?.storage ?? globalThis.chrome?.storage;
  const CANDIDATE_SELECTOR = [
    'article[data-testid="tweet"]',
    '[data-testid="cellInnerDiv"]',
    '[data-testid="trend"]'
  ].join(",");
  const EXCLUDED_TEXT_SELECTOR = [
    '[data-testid="tweetText"]',
    '[data-testid="User-Name"]',
    '[data-testid="card.wrapper"]',
    'input',
    'textarea'
  ].join(",");

  let allowPaidPartnerships = false;
  let scanQueued = false;
  let blockedCount = 0;

  function readSettings() {
    if (browserApi) {
      return browserApi.storage.sync.get({ allowPaidPartnerships: false });
    }

    return new Promise((resolve) => {
      storage.sync.get({ allowPaidPartnerships: false }, (settings) => {
        resolve(settings);
      });
    });
  }

  function hasPlacementMarker(candidate) {
    return Boolean(
      candidate.matches('[data-testid="placementTracking"]') ||
        candidate.querySelector('[data-testid="placementTracking"]')
    );
  }

  function relevantLabels(candidate) {
    const labels = [];
    const nodes = candidate.querySelectorAll("span, [aria-label]");

    for (const node of nodes) {
      if (node.closest(EXCLUDED_TEXT_SELECTOR)) {
        continue;
      }

      const ariaLabel = node.getAttribute("aria-label");
      if (ariaLabel && ariaLabel.length <= 100) {
        labels.push(ariaLabel);
      }

      if (node.children.length === 0) {
        const text = node.textContent;
        if (text && text.length <= 100) {
          labels.push(text);
        }
      }
    }

    return labels;
  }

  function classify(candidate) {
    const labels = relevantLabels(candidate);
    return rules.classifySignals(hasPlacementMarker(candidate), labels);
  }

  function blockingTarget(candidate) {
    if (candidate.matches('article[data-testid="tweet"]')) {
      return candidate.closest('[data-testid="cellInnerDiv"]') || candidate;
    }

    return candidate;
  }

  function setBlocked(candidate, shouldBlock) {
    const target = blockingTarget(candidate);
    const wasBlocked = target.dataset.xPromotionFilterHidden === "true";

    if (shouldBlock && !wasBlocked) {
      target.dataset.xPromotionFilterHidden = "true";
      blockedCount += 1;
    } else if (!shouldBlock && wasBlocked) {
      delete target.dataset.xPromotionFilterHidden;
      blockedCount = Math.max(0, blockedCount - 1);
    }
  }

  function inspect(candidate) {
    const signals = classify(candidate);
    setBlocked(
      candidate,
      rules.shouldBlock(signals, allowPaidPartnerships)
    );
  }

  function scan() {
    scanQueued = false;
    document.querySelectorAll(CANDIDATE_SELECTOR).forEach(inspect);
  }

  function queueScan() {
    if (scanQueued) {
      return;
    }

    scanQueued = true;
    requestAnimationFrame(scan);
  }

  function startObserver() {
    const observer = new MutationObserver(queueScan);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function installMessageHandler() {
    const runtime = globalThis.browser?.runtime ?? globalThis.chrome?.runtime;
    runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === "xpromotionfilter:get-status") {
        sendResponse({ blockedCount });
      }
    });
  }

  function installSettingsHandler() {
    storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "sync" || !changes.allowPaidPartnerships) {
        return;
      }

      allowPaidPartnerships = Boolean(
        changes.allowPaidPartnerships.newValue
      );
      queueScan();
    });
  }

  async function init() {
    const settings = await readSettings();
    allowPaidPartnerships = Boolean(settings.allowPaidPartnerships);
    scan();
    startObserver();
    installSettingsHandler();
    installMessageHandler();
  }

  init();
})();
