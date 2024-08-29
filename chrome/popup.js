// popup.js
document.addEventListener("DOMContentLoaded", () => {
  // Add some info dynamically
  const infoDiv = document.createElement("div");
  infoDiv.style.marginTop = "20px";
  infoDiv.style.textAlign = "center";
  infoDiv.innerHTML =
    "<p>This popup will close in 3 seconds if you don't interact with it.</p>";

  document.body.prepend(infoDiv);

  let closeTimeout = setTimeout(() => {
    window.close();
  }, 3000); // Close after 3 seconds

  document.addEventListener("click", () => {
    clearTimeout(closeTimeout); // Cancel close if user interacts with the popup
  });

  // Create and style reset button
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset Scripts";
  resetButton.style.display = "block";
  resetButton.style.margin = "20px auto";
  resetButton.style.padding = "10px 20px";
  resetButton.style.borderRadius = "5px";
  resetButton.style.border = "none";
  resetButton.style.backgroundColor = "#4CAF50";
  resetButton.style.color = "white";
  resetButton.style.cursor = "pointer";
  resetButton.style.fontSize = "16px";
  resetButton.style.fontWeight = "bold";
  document.body.appendChild(resetButton);

  resetButton.addEventListener("mouseover", () => {
    resetButton.style.backgroundColor = "#45a049";
  });

  resetButton.addEventListener("mouseout", () => {
    resetButton.style.backgroundColor = "#4CAF50";
  });

  resetButton.addEventListener("click", async () => {
    const confirmReset = confirm(
      "Are you sure you want to reset the scripts? This action cannot be undone.",
    );
    if (confirmReset) {
      const defaultScripts = [
        {
          url: "https://appstore.suisuy.workers.dev/httpsim1111groqnotedevhfspacenoteidaiartifact/aiartifact.bundle.js",
          enabled: true,
        },
        {
          url: "https://appstore.suisuy.workers.dev/httpschatgptcomc72f37e56f2af4375b0575421141a5bd8beta/index.js",
          enabled: false,
        },
        { url: "https://webaiinput.pages.dev/index.js", enabled: true },
        {
          url: "https://appstore.suisuy.workers.dev/httpschatgptcomc09b01d0f5f204b9b84f95c6e7286c14b/index.js",
          enabled: false,
        },
      ];

      await browser.storage.sync.set({ scripts: defaultScripts });
      alert("Scripts have been reset to the default values.");
      console.log("Scripts have been reset to:", defaultScripts);
    }
  });
});

browser.storage.sync.get("scripts").then((data) => {
  console.log(data);
  let scripts = data?.scripts;
  if (!scripts || scripts.length <= 0) {
    scripts = [];
  }

  // Set the default scripts if not already set
  browser.storage.sync.set({ scripts }).then((data) => {
    console.log("Initialized default scripts.");
    console.log(data);

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      let activeTab = tabs[0];

      let tab = activeTab;
      if (tab && tab.id) {
        let tabId = tab.id;
        let tabUrl = tab.url;

        // Retrieve the current idList from chrome.storage
        let { idList } = await chrome.storage.local.get({ idList: [] });
        console.log(
          "got idList: ",
          idList,
          "current tab is:",
          tab.id + tab.url,
        );
        if (idList.includes(tabId) === false) {
          // Add tabId to idList
          idList.push(tabId);
          // Update storage and badge
          await chrome.storage.local.set({ idList: idList }).then(
            () => console.log("save idlist"),
            (error) => console.log("save erro: ", error),
          );
          updateBadge(tabId, true);
          document.getElementById("tab-id").innerText =
            activeTab.id + "status: enabled";
          // Enable ruleset
          console.log("**** enabled ruleset and executeContentScript");

          try {
            await chrome.declarativeNetRequest.updateDynamicRules({
              addRules: [
                {
                  id: 1,
                  priority: 1,
                  action: {
                    type: "modifyHeaders",
                   