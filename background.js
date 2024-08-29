// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed, initializing storage.");

  chrome.storage.local.set({ idList: [] }).then(() => console.log('save idlist'), error => console.log('******save erro: ', error));

  // Set default scripts (if needed)
  chrome.storage.local.set({
    scripts : [
      { url: 'https://appstore.suisuy.workers.dev/httpsim1111groqnotedevhfspacenoteidaiartifact/aiartifact.bundle.js', enabled: true },
      { url: 'https://appstore.suisuy.workers.dev/httpschatgptcomc72f37e56f2af4375b0575421141a5bd8beta/index.js', enabled: false },
      { url: 'https://webaiinput.pages.dev/index.js', enabled: true },
      { url: 'https://appstore.suisuy.workers.dev/httpschatgptcomc09b01d0f5f204b9b84f95c6e7286c14b/index.js', enabled: false },
    ]
  }, () => {
    console.log("Initialized default scripts.");
  });
});

chrome.action.onClicked.addListener((tab) => {


  if (tab && tab.id) {
    console.log(`Icon clicked on tab with ID: ${tab.id}, URL: ${tab.url}`);
    updateBadge(tab.id);
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["ruleset"]
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, () => {
      console.log(`Executed content script on tab with URL: ${url}`);
    });
  } else {
    console.log("No valid tab found.");
  }

});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log(`Tab activated with tabId: ${tab.id}, tab details:`, tab);
    let tabId = tab.id;
    updateBadge(tabId)

  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  updateBadge(tabId);
  executeContentScriptForActiveTab(tabId);
});

async function updateBadge(tabId) {
  let isActive = false;
  console.log(`Updating badge for tabId ${tabId}: ${isActive ? 'ON' : ''}`);
  const { idList } = await chrome.storage.local.get({ idList: [] });
  console.log('****got idList: ', idList, 'current tab is:', tabId);
  if (idList.includes(tabId)) {
    isActive = true;
    chrome.action.setBadgeText({ tabId, text: isActive ? 'ON' : '' });
    chrome.declarativeNetRequest.updateDynamicRules({
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
    
    // chrome.declarativeNetRequest.updateEnabledRulesets({
    //   enableRulesetIds: ["ruleset"]
    // });
  }
  else {
    isActive = false;
    chrome.action.setBadgeText({ tabId, text: isActive ? 'ON' : '' });
    // chrome.declarativeNetRequest.updateEnabledRulesets({
    //   disableRulesetIds: ["ruleset"]
    // });
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1], // The ID of the rule you want to remove
      addRules: [] // Keep this empty if you don't want to add any new rules
    });
  }
}


function executeContentScript(tabId) {
  console.log(`Executing content script on tab ID: ${tabId}`);
  // Execute the content script in the specified tab
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  }, () => {
    console.log(`Executed content script on tab ID: ${tabId}`);
  });
}

async function executeContentScriptForActiveTab(tabId) {
  let isActive = false;
  console.log(`Updating badge for tabId ${tabId}: ${isActive ? 'ON' : ''}`);
  const { idList } = await chrome.storage.local.get({ idList: [] });
  console.log('****got idList: ', idList, 'current tab is:', tabId);
  if (idList.includes(tabId)) {
    isActive = true;
    console.log(`Executing content script on tab ID: ${tabId}`);
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["ruleset"]
    });
    // Execute the content script in the specified tab
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }, () => {
        console.log(`Executed content script on tab ID: ${tabId}`);
      });    
    }, 300);
  

  }
  else {
    isActive = false;
    chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: ["ruleset"]
    });
    console.log(`inactive tab not Executed content script on tab ID: ${tabId}`);

  }
  
}