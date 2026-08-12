(function () {
  "use strict";

  const browserApi = globalThis.browser;
  const storage = browserApi?.storage ?? globalThis.chrome?.storage;
  const checkbox = document.querySelector("#allow-paid-partnerships");
  const status = document.querySelector("#save-status");

  function showStatus(message) {
    status.textContent = message;
    window.setTimeout(() => {
      if (status.textContent === message) {
        status.textContent = "";
      }
    }, 1600);
  }

  function getSettings() {
    if (browserApi) {
      return browserApi.storage.sync.get({ allowPaidPartnerships: false });
    }

    return new Promise((resolve) => {
      storage.sync.get({ allowPaidPartnerships: false }, resolve);
    });
  }

  function saveSettings(settings) {
    if (browserApi) {
      return browserApi.storage.sync.set(settings);
    }

    return new Promise((resolve) => {
      storage.sync.set(settings, resolve);
    });
  }

  getSettings().then((settings) => {
    checkbox.checked = Boolean(settings.allowPaidPartnerships);
  });

  checkbox.addEventListener("change", () => {
    saveSettings({ allowPaidPartnerships: checkbox.checked }).then(() => {
      showStatus("Saved");
    });
  });
})();
