// options.js

// Apply styles
function applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #scriptList, #activeHostnames {
            list-style: none;
            padding: 0;
        }

        #scriptList > div, #activeHostnames > li {
            display: block; /* Changed to block to stack elements vertically */
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: #f9f9f9;
        }

        textarea {
            width: 100%;
            height: 100px; /* Increased height */
            margin-bottom: 10px; /* Space below textarea */
            resize: none;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 10px;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            font-size: 14px;
            background-color: #fff;
            color: #333;
        }

        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 10px; /* Space above button group */
        }

        button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            background-color: #007bff;
            color: white;
            cursor: pointer;
        }

        button:hover {
            background-color: #0056b3;
        }

        #addScript, #scriptUrl {
            margin: 10px 0;
        }

        #addScript {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            background-color: #28a745;
            color: white;
            cursor: pointer;
        }

        #addScript:hover {
            background-color: #218838;
        }

        #scriptUrl {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
    `;
    document.head.appendChild(style);
}

// Load and display scripts and active hostnames
function loadSettings() {
    browser.storage.sync.get(['scripts', 'activeHostnames']).then((data) => {
        let scripts = data?.scripts;
        if (!scripts || scripts.length<=0) {
            return;
        }
        browser.storage.sync.set({ scripts }).then (() => {
            console.log("Initialized default scripts.");
          });
        const activeHostnames = data?.activeHostnames || {};
        displayScripts(scripts);
        displayActiveHostnames(activeHostnames);
    });
}

// Display scripts in the options page
function displayScripts(scripts) {
    const scriptList = document.getElementById('scriptList');
    scriptList.innerHTML = '';

    scripts.forEach((script, index) => {
        const li = document.createElement('div');
        const scriptText = document.createElement('textarea');
        scriptText.textContent = script.url;
        li.appendChild(scriptText);

        // Button group container
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');

        // Toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = script.enabled ? 'Disable' : 'Enable';
        toggleButton.addEventListener('click', () => {
            script.enabled = !script.enabled;
            saveScripts(scripts);
            displayScripts(scripts);
        });

        // Remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            scripts.splice(index, 1);
            saveScripts(scripts);
            displayScripts(scripts);
        });

        buttonGroup.appendChild(toggleButton);
        buttonGroup.appendChild(removeButton);

        li.appendChild(buttonGroup);
        scriptList.appendChild(li);
    });
}

// Display active hostnames in the options page
function displayActiveHostnames(activeHostnames) {
    const hostnameList = document.getElementById('activeHostnames');
    hostnameList.innerHTML = '';

    Object.keys(activeHostnames).forEach((hostname) => {
        const li = document.createElement('li');
        const hostnameText = document.createElement('span');
        hostnameText.textContent = hostname;
        li.appendChild(hostnameText);

        // Toggle button for hostname activation
        const toggleButton = document.createElement('button');
        toggleButton.textContent = activeHostnames[hostname] ? 'Deactivate' : 'Activate';
        toggleButton.addEventListener('click', () => {
            activeHostnames[hostname] = !activeHostnames[hostname];
            saveActiveHostnames(activeHostnames);
            displayActiveHostnames(activeHostnames);
        });

        li.appendChild(toggleButton);
        hostnameList.appendChild(li);
    });
}

// Save scripts to storage
function saveScripts(scripts) {
    browser.storage.sync.get(['scripts']).then((data) => {
        let oldscripts = data?.scripts;
        browser.storage.sync.set({ scripts });

    });
}

// Save active hostnames to storage
function saveActiveHostnames(activeHostnames) {
    chrome.storage.sync.set({ activeHostnames });
}

// Add script button click event
document.getElementById('addScript').addEventListener('click', () => {
    const scriptUrl = document.getElementById('scriptUrl').value;
    if (scriptUrl) {
        chrome.storage.sync.get(['scripts'], (result) => {
            const scripts = result.scripts || [];
            scripts.push({ url: scriptUrl, enabled: true });
            saveScripts(scripts);
            setTimeout(() => {
                
            displayScripts(scripts);
            document.getElementById('scriptUrl').value = ''; // Clear input
            }, 500);
        });
    }
});

// Initial load and style application
applyStyles();
loadSettings();
