// popup.js
document.addEventListener("DOMContentLoaded", () => {
  // Add some info dynamically
  const infoDiv = document.createElement("div");
  infoDiv.style.marginTop = "20px";
  infoDiv.style.textAlign = "center";
  infoDiv.innerHTML = "<p>This popup will close in 3 seconds if you don't interact with it.</p>";

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
    const confirmReset = confirm("Are you sure you want to reset the scripts? This action cannot be undone.");
    if (confirmReset) {
      const defaultScripts = [
        { url: 'https://appstore.suisuy.workers.dev/httpsim1111groqnotedevhfspacenoteidaiartifact/aiartifact.bundle.js', enabled: true },
        { url: 'https://appstore.suisuy.workers.dev/httpschatgptcomc72f37e56f2af4375b0575421141a5bd8beta/index.js', enabled: false },
        { url: 'https://webaiinput.pages.dev/index.js', enabled: true },
        { url: 'https://appstore.suisuy.workers.dev/httpschatgptcomc09b01d0f5f204b9b84f95c6e7286c14b/index.js', enabled: false },
      ];

      await browser.storage.sync.set({ scripts: defaultScripts });
      alert("Scripts have been reset to the default values.");
      console.log("Scripts have been reset to:", defaultScripts);
    }
  });
});

browser.storage.sync.get('scripts').then((data) => {
  console.log(data);
  let scripts = data?.scripts;
  if (!scripts || scripts.length <= 0) {
    scripts = [
     
    ];
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
        console.log('got idList: ', idList, 'current tab is:', tab.id + tab.url);
        if (idList.includes(tabId) === false) {
          // Add tabId to idList
          idList.push(tabId);
          // Update storage and badge
          await chrome.storage.local.set({ idList: idList }).then(() => console.log('save idlist'), error => console.log('save erro: ', error));
          updateBadge(tabId, true);
          document.getElementById('tab-id').innerText = activeTab.id + 'status: enabled';
          // Enable ruleset
          console.log('**** enabled ruleset and executeContentScript');

          try {
            await chrome.declarativeNetRequest.updateDynamicRules({
              addRules: [
                {
                  "id": 1,
                  "priority": 1,
                  "action": {
                    "type": "modifyHeaders",
                    "responseHeaders": [
                      {
                        "header": "X-Frame-Options",
                        "operation": "remove"
                      },
                      {
                        "header": "Content-Security-Policy",
                        "operation": "remove"
                      },
                      {
                        "header": "Access-Control-Allow-Origin",
                        "operation": "set",
                        "value": "*"
                      },
                      {
                        "header": "Access-Control-Allow-Methods",
                        "operation": "set",
                        "value": "GET, POST, PUT, DELETE, OPTIONS"
                      },
                      {
                        "header": "Access-Control-Allow-Headers",
                        "operation": "set",
                        "value": "*"
                      }
                    ]
                  },
                  "condition": {
                    "urlFilter": "*",
                    "resourceTypes": ["xmlhttprequest", "main_frame", "sub_frame"]
                  }
                }
              ],
              removeRuleIds: []  // This can be used to remove rules if needed
            });
            setTimeout(() => {
              // Execute content script on the tab
              chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
              }, () => {
                console.log(`Executed content script on tab with URL: ${tabUrl}`);
              });
            }, 500);
          } catch (error) {
            console.log(error);
          }
        } else {

          // Update storage and badge
          // Remove tabId from idList
          idList = idList.filter(id => id !== tabId);
          chrome.storage.local.set({ idList }).then(() => console.log('save idlist'), error => console.log('save erro: ', error));

          updateBadge(tabId, false);
          console.log(`Removed tab with ID: ${tabId}, URL: ${tabUrl} from idList.`);
          document.getElementById('tab-id').innerText = activeTab.id + 'status: disabled';
          // Disable ruleset
          console.log('**** disabled ruleset and not executeContentScript');
          chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1], // The ID of the rule you want to remove
            addRules: [] // Keep this empty if you don't want to add any new rules
          });

        }

      } else {
        console.log("No valid tab found.");
      }

    });
  });

});

// Function to update the badge
function updateBadge(tabId, isActive) {
  console.log(`Updating badge for tabId ${tabId}: ${isActive ? 'ON' : ''}`);
  chrome.action.setBadgeText({ tabId, text: isActive ? 'ON' : '' });
}

// Function to confirm script removal
async function removeScript(scriptIndex) {
  const confirmRemove = confirm("Are you sure you want to remove this script? This action cannot be undone.");
  if (confirmRemove) {
    let { scripts } = await browser.storage.sync.get('scripts');
    if (scripts && scripts.length > scriptIndex) {
      scripts.splice(scriptIndex, 1);
      await browser.storage.sync.set({ scripts });
      alert("Script has been removed.");
      console.log("Updated scripts:", scripts);
    }
  }
}

function logActivate() {
  console.log('activate');
}
