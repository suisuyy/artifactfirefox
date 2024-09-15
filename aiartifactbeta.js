
function runAiArtifactbeta() {
  console.log('runAiArtifactbeta');

  let zindex = '2147483646';
  let fetch = cfetch;




  (() => {
    let ifOpenNewTab = false;

    // model.js
    function getCodeBlocks() {
      const codeElements = document.querySelectorAll("code");
      const codeFiles = {};
      codeElements.forEach((element) => {
        const content = element.textContent.trim();
        const filename = getFilename(content);
        if (filename) {
          codeFiles[filename] = content;
        }
      });
      return codeFiles;
    }
    function getFilename(content) {
      const firstLine = content.split("\n")[0].trim();
      if (firstLine) {
        const match = firstLine.match(/<!--\s*(.*?)\s*-->/) || firstLine.match(/\/\/\s*(.*?)\s*$/) || firstLine.match(/\/\*\s*(.*?)\s*\*\//);
        console.log("First line:", firstLine);
        console.log("Match result:", match);
        return match ? match[1] : null;
      } else {
        console.log("First line is empty or whitespace.");
        return null;
      }
    }
    function getIdFromUrl(url = window.location.href) {
      const id = url.replace(/[^a-zA-Z0-9]/g, "");
      return id;
    }
    function extractCodeData() {
      const codeFiles = getCodeBlocks();
      const id = getIdFromUrl();
      const htmlFile = Object.keys(codeFiles).find((filename) => filename.endsWith(".html"));
      if (htmlFile) {
        const debugScript = `

      <script  src="https://appstore.suisuy.eu.org/httpschatgptcomcb40f8c3c304c4aa287938b0e5ec242a2showerror/showerror.js">
      <\/script>
      <script>
        const urlParams = new URLSearchParams(window.location.search);
        const debugMode = urlParams.get('debug') === 'true';

        if (debugMode) {
          const script = document.createElement('script');
          script.src = '//cdn.jsdelivr.net/npm/eruda';
          document.head.appendChild(script);
          script.onload = () => {
          eruda.init();
          //eruda.show()
          let erudaconsole = eruda.get('console');
          erudaconsole.config.set('catchGlobalErr', true);
          erudaconsole.config.set('displayIfErr', true);
          erudaconsole.config.set('lazyEvaluation', true);


          };

          }
      <\/script>
      `;
        codeFiles[htmlFile] = codeFiles[htmlFile].replace("<head>", `<head>${debugScript}`);
      }
      return { id, ...codeFiles };
    }

    // view.js
    function makeContainerDraggable(container, handle) {
      let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;
      let isDragging = false;
      let overlayTimeout;
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
      overlay.style.zIndex = zindex + 1;
      overlay.style.display = "none";
      document.body.appendChild(overlay);
      handle.addEventListener("mousedown", dragMouseDown);
      handle.addEventListener("touchstart", dragTouchStart);
      function dragMouseDown(e) {
        e.preventDefault();
        initialX = e.clientX;
        initialY = e.clientY;
        document.addEventListener("mouseup", closeDragElement);
        document.addEventListener("mousemove", elementDrag);
        overlayTimeout = setTimeout(() => {
          overlay.style.display = "block";
        }, 500);
      }
      function dragTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        initialX = touch.clientX;
        initialY = touch.clientY;
        document.addEventListener("touchend", closeDragElement);
        document.addEventListener("touchmove", elementDragTouch);
        overlayTimeout = setTimeout(() => {
          overlay.style.display = "block";
        }, 500);
      }
      function elementDrag(e) {
        e.preventDefault();
        isDragging = true;
        offsetX = initialX - e.clientX;
        offsetY = initialY - e.clientY;
        initialX = e.clientX;
        initialY = e.clientY;
        container.style.top = `${container.offsetTop - offsetY}px`;
        container.style.left = `${container.offsetLeft - offsetX}px`;
      }
      function elementDragTouch(e) {
        e.preventDefault();
        isDragging = true;
        const touch = e.touches[0];
        offsetX = initialX - touch.clientX;
        offsetY = initialY - touch.clientY;
        initialX = touch.clientX;
        initialY = touch.clientY;
        container.style.top = `${container.offsetTop - offsetY}px`;
        container.style.left = `${container.offsetLeft - offsetX}px`;
      }
      function closeDragElement() {
        document.removeEventListener("mouseup", closeDragElement);
        document.removeEventListener("mousemove", elementDrag);
        document.removeEventListener("touchend", closeDragElement);
        document.removeEventListener("touchmove", elementDragTouch);
        clearTimeout(overlayTimeout);
        if (!isDragging) {
          overlay.style.display = "none";
        } else {
          isDragging = false;
          setTimeout(() => {
            overlay.style.display = "none";
          }, 0);
        }
      }
    }

    // style/setButtonStyles.js
    function setButtonStyles(button, isCopyButton = false) {
      button.style.backgroundColor = isCopyButton ? "#ADD8E6" : "transparent";
      button.style.color = isCopyButton ? "#000" : "white";
      button.style.border = isCopyButton ? "1px solid #ADD8E6" : "none";
      button.style.cursor = "pointer";
      button.style.marginLeft = "5px";
      button.style.padding = "5px 10px";
      button.style.borderRadius = "5px";
      button.style.fontSize = "14px";
    }

    // style/setTabStyles.js
    function setTabStyles(tab) {
      tab.style.cursor = "pointer";
      tab.style.padding = "10px";
      tab.style.border = "none";
      tab.style.backgroundColor = "#f1f1f1";
      tab.style.marginRight = "5px";
      tab.style.display = "inline-block";
      tab.style.borderBottom = "2px solid transparent";
    }

    // sourceHandler.js
    function fetchAndDisplaySourceList(id) {
      fetch(`https://appstore.suisuy.eu.org/${id}`).then((response) => response.json()).then((fileList) => {
        const tabsContainer = document.querySelector("#tabs-container");
        const sourceContainer = document.querySelector("#source-container");
        tabsContainer.innerHTML = "";
        sourceContainer.innerHTML = "";
        let totalLines = 0;
        const copyAllButton = document.createElement("button");
        copyAllButton.textContent = "Copy All Code";
        setButtonStyles(copyAllButton, true);
        copyAllButton.addEventListener("click", copyAllCodeToClipboard);
        sourceContainer.appendChild(copyAllButton);
        fileList.forEach((filename, index) => {
          const tab = document.createElement("button");
          fetch(`https://appstore.suisuy.eu.org/${id}/${filename}`).then((response) => response.text()).then((fileContent) => {
            const lineCount = fileContent.split("\n").length;
            totalLines += lineCount;
            tab.textContent = `${filename} (${lineCount})`;
            copyAllButton.textContent = `Copy All Code (${totalLines} lines)`;
            setTabStyles(tab);
            const fileContentSection = document.createElement("div");
            fileContentSection.id = `file-content-${index}`;
            fileContentSection.style.marginBottom = "20px";
            const fileTitle = document.createElement("h3");
            fileTitle.textContent = filename;
            fileContentSection.appendChild(fileTitle);
            const pre = document.createElement("pre");
            pre.dataset.filename = filename;
            fileContentSection.appendChild(pre);
            fetchAndDisplaySource(id, filename, pre);
            tab.addEventListener("click", () => {
              document.getElementById(`file-content-${index}`).scrollIntoView({ behavior: "smooth" });
              tabsContainer.childNodes.forEach((child) => {
                child.style.borderBottom = "2px solid transparent";
              });
              tab.style.borderBottom = "2px solid #007BFF";
            });
            tabsContainer.appendChild(tab);
            sourceContainer.appendChild(fileContentSection);
          }).catch((error) => {
            console.error(`Error fetching file content for ${filename}:`, error);
          });
        });
        if (tabsContainer.firstChild) {
          tabsContainer.firstChild.click();
        }
      }).catch((error) => {
        console.error("Error fetching file list:", error);
      });
    }
    function fetchAndDisplaySource(id, filename, preElement) {
      fetch(`https://appstore.suisuy.eu.org/${id}/${filename}`).then((response) => response.text()).then((fileContent) => {
        if (filename.endsWith(".html")) {
          preElement.textContent = fileContent;
        } else {
          const lines = fileContent.split("\n");
          const numberedLines = lines.map((line, index) => `<span class="line-number" contenteditable="false" style="display: inline-block; width: 30px; text-align: right; margin-right: 10px; color: #888; user-select: none;">${index + 1}</span> ${line}`).join("\n");
          preElement.innerHTML = numberedLines;
        }
      }).catch((error) => {
        console.error(`Error fetching file content for ${filename}:`, error);
      });
    }
    function copyAllCodeToClipboard() {
      const sourceContainer = document.querySelector("#source-container");
      const preElements = sourceContainer.querySelectorAll("pre");
      let allCode = "";
      preElements.forEach((pre) => {
        const filename = pre.dataset.filename;
        allCode += `// ${filename}
`;
        if (filename.endsWith(".html")) {
          allCode += `${pre.textContent}

`;
        } else {
          pre.querySelectorAll(".line-number").forEach((lineNumber) => lineNumber.style.display = "none");
          allCode += `${pre.textContent}

`;
          pre.querySelectorAll(".line-number").forEach((lineNumber) => lineNumber.style.display = "inline-block");
        }
      });
      const textarea = document.createElement("textarea");
      textarea.value = allCode;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        console.log("All code copied to clipboard.");
      } catch (err) {
        console.error("Error copying code to clipboard:", err);
      }
      document.body.removeChild(textarea);
    }

    // buttonHandlers.js
    function addButtonEventListener(button, handler) {
      button.addEventListener("click", handler);
      button.addEventListener("touchstart", (event) => {
        event.preventDefault();
        handler(event);
      });
    }
    function setupButtonHandlers({ container, topBar, urlInput, iframe, sourceContainer, tabsContainer }) {
      const hideButton = document.createElement("button");
      hideButton.textContent = "\u2716\uFE0F";
      setButtonStyles(hideButton);
      addButtonEventListener(hideButton, () => {
        container.style.display = "none";
        const toggleButton = document.querySelector("#toggle-button");
        toggleButton.textContent = "\u2728";
      });
      const resizeButton = document.createElement("button");
      resizeButton.textContent = "\u{1F50D}";
      setButtonStyles(resizeButton);
      let isLarge = false;
      addButtonEventListener(resizeButton, () => {
        if (isLarge) {
          container.style.width = "400px";
          iframe.style.height = "300px";
          resizeButton.textContent = "\u{1F50D}";
        } else {
          container.style.width = "800px";
          iframe.style.height = "600px";
          resizeButton.textContent = "\u{1F50E}";
        }
        isLarge = !isLarge;
      });
      const toggleUrlButton = document.createElement("button");
      toggleUrlButton.textContent = "\u{1F517}";
      setButtonStyles(toggleUrlButton);
      addButtonEventListener(toggleUrlButton, () => {
        if (urlInput.style.display === "none") {
          urlInput.style.display = "block";
          toggleUrlButton.textContent = "\u{1F517}";
        } else {
          urlInput.style.display = "none";
          toggleUrlButton.textContent = "\u{1F517}";
        }
      });
      const sourceButton = document.createElement("button");
      sourceButton.textContent = "\u{1F4DC}";
      setButtonStyles(sourceButton);
      addButtonEventListener(sourceButton, () => {
        if (tabsContainer.style.display === "none") {
          tabsContainer.style.display = "block";
          sourceContainer.style.display = "block";
          iframe.style.display = "none";
          sourceButton.textContent = "\u{1F4DC}";
          const id = getIdFromUrl();
          fetchAndDisplaySourceList(id);
        } else {
          tabsContainer.style.display = "none";
          sourceContainer.style.display = "none";
          iframe.style.display = "block";
          sourceButton.textContent = "\u{1F4DC}";
        }
      });
      const refreshButton = document.createElement("button");
      refreshButton.textContent = "\u{1F504}";
      setButtonStyles(refreshButton);
      refreshButton.id = "refresh-button";
      addButtonEventListener(refreshButton, () => {
        refreshButton.textContent = "\u{1F504} Refreshing...";
        const codeData = extractCodeData();
        fetch("https://appstore.suisuy.eu.org/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(codeData)
        }).then(() => {
          createIframeAndUrl(codeData.id);
          if (ifOpenNewTab) {
            setTimeout(() => {
              window.open(iframe.src, '_blank');
              iframe.style.height = '100px';
              iframe.style.minHeight = '100px';
            }, 1000);


          }
          refreshButton.textContent = "\u{1F504}";
        }).catch((error) => {
          console.error("Error sending code data to server:", error);
          refreshButton.textContent = "\u{1F504}";
        });
      });
      const helpButton = document.createElement("button");
      helpButton.textContent = "\u2753";
      setButtonStyles(helpButton);
      addButtonEventListener(helpButton, () => {
        let src = 'https://appstore.suisuy.eu.org/httpschatgptcomca5968c9855df47dc949ae009b42c73f6/index.html';

        iframe.src = "https://appstore.suisuy.eu.org/httpschatgptcomca5968c9855df47dc949ae009b42c73f6/index.html";
        if (ifOpenNewTab) {
          window.open(iframe.src, '_blank');

        }
        document.getElementById("url-input").value = iframe.src;



      });
      topBar.appendChild(hideButton);
      topBar.appendChild(resizeButton);
      topBar.appendChild(toggleUrlButton);
      topBar.appendChild(sourceButton);
      topBar.appendChild(refreshButton);
      topBar.appendChild(helpButton);
      container.appendChild(topBar);
    }

    // style/setContainerStyles.js
    function setContainerStyle(container) {
      container.style.position = "fixed";
      container.style.top = "10px";
      container.style.right = "10px";
      container.style.width = "400px";
      container.style.border = "1px solid #ccc";
      container.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";
      container.style.zIndex = "2147483647";
      container.style.backgroundColor = "white";
      container.style.borderRadius = "5px";
      container.style.overflow = "hidden";
      container.style.color = "black";
      container.style.margin = "0";
      container.style.padding = "0";
    }
    function setTopBarStyle(topBar) {
      topBar.style.backgroundColor = "#ADD8E6";
      topBar.style.padding = "0";
      topBar.style.margin = "0";
      topBar.style.cursor = "move";
      topBar.style.textAlign = "left";
      topBar.style.position = "relative";
      topBar.style.color = "white";
      topBar.style.display = "flex";
      topBar.style.alignItems = "center";
    }
    function setIframeStyle(iframe) {
      iframe.width = "100%";
      iframe.height = "60vh";
      iframe.style.minHeight = "500px";
      iframe.style.border = "none";
      iframe.style.margin = "0";
      iframe.style.padding = "0";
    }
    function setUrlInputStyle(urlInput) {
      urlInput.style.padding = "5px";
      urlInput.style.margin = "0";
      urlInput.style.backgroundColor = "#f9f9f9";
      urlInput.style.borderTop = "1px solid #ccc";
      // urlInput.style.width = "85%";
      urlInput.style.color = "black";
      urlInput.style.border = "1px solid #ccc";
      urlInput.style.borderRadius = "3px";
    }
    function setTabsContainerStyle(tabsContainer) {
      tabsContainer.style.display = "none";
      tabsContainer.style.padding = "5px";
      tabsContainer.style.backgroundColor = "#f1f1f1";
      tabsContainer.style.borderTop = "1px solid #ccc";
      tabsContainer.style.overflowX = "auto";
      tabsContainer.style.whiteSpace = "nowrap";
      tabsContainer.style.position = "sticky";
      tabsContainer.style.top = "0";
    }
    function setSourceContainerStyle(sourceContainer) {
      sourceContainer.style.display = "none";
      sourceContainer.style.padding = "10px";
      sourceContainer.style.backgroundColor = "#f9f9f9";
      sourceContainer.style.overflowY = "auto";
      sourceContainer.style.maxHeight = "600px";
    }
    function setCopyButtonStyle(copyButton) {
      copyButton.style.marginBottom = "10px";
      copyButton.style.padding = "10px";
      copyButton.style.cursor = "pointer";
      copyButton.style.backgroundColor = "#007BFF";
      copyButton.style.color = "white";
      copyButton.style.border = "none";
      copyButton.style.borderRadius = "5px";
    }

    // iframeController.js
    function injectErudaIntoIframe(iframe) {
      const urlParams = new URLSearchParams(window.location.search);
      const debugMode = urlParams.get("debug") === "true";
      if (debugMode) {
        iframe.addEventListener("load", () => {
          const script = iframe.ownerDocument.createElement("script");
          script.src = "//cdn.jsdelivr.net/npm/eruda";
          script.onload = () => {
            iframe.contentWindow.eruda.init();
          };
          iframe.ownerDocument.head.appendChild(script);
        });
      }
    }

    function initializeIframe() {
      const id = getIdFromUrl();
      createIframeAndUrl(id);
      const container = document.querySelector("#iframe-container");
      if (container) {
        container.style.display = "block";
      }
    }
    function createIframeAndUrl(id) {
      id = getIdFromUrl();
      let container = document.querySelector("#iframe-container");
      let iframe = document.querySelector("#code-displayer");
      let urlContainer = document.querySelector("#url-container");
      let urlInput = document.querySelector("#url-input");
      let topBar = document.querySelector("#top-bar");
      let sourceContainer = document.querySelector("#source-container");
      let tabsContainer = document.querySelector("#tabs-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "iframe-container";
        setContainerStyle(container);
        topBar = document.createElement("div");
        topBar.id = "top-bar";
        setTopBarStyle(topBar);
        if (!iframe) {
          iframe = document.createElement("iframe");
          iframe.id = "code-displayer";
          setIframeStyle(iframe);
          document.addEventListener('securitypolicyviolation', (e) => {
            // Check if the violated directive is related to iframe sources
            if (e.violatedDirective === 'frame-src' || e.violatedDirective === 'child-src') {
              console.log('CSP blocked iframe load:', e.blockedURI);
              // Additional handling logic for the blocked iframe can go here
              // iframe.style.height = '100px';
              // iframe.style.minHeight = '100px';
              // iframe.srcdoc = '<h2>Failed to load content. The website may restrict embedding. try open in new tab</h2>';

              setTimeout(() => {
                // const originalSrc = iframe.src;  // Get original URL
                // iframe.src = '';                 // Clear the iframe source to trigger reload
                // iframe.src = originalSrc;
                // iframe.onload=()=>{
                //   iframe.style.height = '400px';
                //   iframe.style.minHeight = '400px';
                // }      
                // if(prompt("The website may restrict embedding, if the webapp is showing, you can open it in new tab,open in new tab now? (y/n)",'y')=='y'){
                //   window.open(iframe.src, '_blank');
                //   ifOpenNewTab=true;

                // }

                console.log('refreshIframe: iframe failed to load,try open in new tab');
                //show a message at bottom of container buttom and remove it after 10 seconds
                let message = document.createElement('div');

                message.style.width = '100%';
                message.style.backgroundColor = 'red';
                message.style.color = 'white';
                message.textContent = 'Because of CSP policy, the webpage failed to load, try refresh \u{1F504} or open in new tab';
                //append to container
                container.prepend(message);

                setTimeout(() => {
                  container.removeChild(message);
                }, 10000)
              }, 1000);

            } else {
              console.log('CSP Violation:', e);
              console.log('Violated Directive:', e.violatedDirective);
              console.log('Blocked URI:', e.blockedURI);
            }
          })

        }

        if (!tabsContainer) {
          tabsContainer = document.createElement("div");
          tabsContainer.id = "tabs-container";
          setTabsContainerStyle(tabsContainer);
        }
        if (!sourceContainer) {
          sourceContainer = document.createElement("div");
          sourceContainer.id = "source-container";
          setSourceContainerStyle(sourceContainer);
          const copyButton = document.createElement("button");
          copyButton.textContent = "Copy All Code";
          setCopyButtonStyle(copyButton);
          copyButton.addEventListener("click", copyAllCodeToClipboard2);
          sourceContainer.appendChild(copyButton);
        }
        setupButtonHandlers({
          container,
          topBar,
          urlInput,
          iframe,
          sourceContainer,
          tabsContainer
        });
        container.appendChild(topBar);
        container.appendChild(iframe);
        container.appendChild(tabsContainer);
        container.appendChild(sourceContainer);
        document.body.appendChild(container);
        makeContainerDraggable(container, topBar);


        if (!urlContainer) {


          urlContainer = document.createElement("div");
          urlContainer.style.width = "100%";
          urlContainer.id = "url-container";
          urlContainer.style.display = "flex";

          urlInput = document.createElement("input");
          urlInput.id = "url-input";
          urlInput.type = "text";
          setUrlInputStyle(urlInput);
          urlInput.style.flex = "10";
          urlInput.addEventListener("change", () => {
            iframe.src = 'about:blank';
            setTimeout(() => {
              iframe.src = urlInput.value;

            }, 1000);
          });

          const openInNewTabButton = document.createElement("button");
          openInNewTabButton.textContent = "↗️";
          setButtonStyles(openInNewTabButton);
          openInNewTabButton.style.margin = "0";
          openInNewTabButton.style.padding = "0";
          openInNewTabButton.style.flex = "1";
          openInNewTabButton.addEventListener("click", () => {
            window.open(iframe.src, '_blank');
          });

          urlContainer.appendChild(urlInput);
          urlContainer.appendChild(openInNewTabButton);
          container.appendChild(urlContainer);
        }


      }
      fetch(`https://appstore.suisuy.eu.org/${id}`).then((response) => response.json()).then((fileList) => {
        if (!Array.isArray(fileList) || fileList.length === 0) {
          console.error("No files found or error fetching files.");
          return;
        }
        let iframeSrc = "";
        if (fileList.includes("index.html")) {
          iframeSrc = `https://appstore.suisuy.eu.org/${id}/index.html`;
        } else {
          const htmlFiles = fileList.filter((filename) => filename.endsWith(".html"));
          if (htmlFiles.length > 0) {
            iframeSrc = `https://appstore.suisuy.eu.org/${id}/${htmlFiles[0]}`;
          } else {
            console.error("No HTML files found for display.");
            return;
          }
        }
        //      iframe.src = iframeSrc;
        refreshIframe(iframe, iframeSrc);
        urlInput.value = iframeSrc;
        container.style.display = "block";
      }).catch((error) => {
        console.error("Error fetching files:", error);
      });
    }

    function refreshIframe(iframe, iframeSrc) {
      let originalSrc = iframe.src;
      iframe.src = '';
      iframe.src = iframeSrc || originalSrc;

      console.log('refreshIframe: iframe src set to', iframe.src);

      let ifLoaded = false;
      //use onload to check if iframe is loaded is not working, it still load even iframe not load page
      iframe.onload = () => {
        ifLoaded = true;
        console.log('refreshIframe: iframe loaded');
      }
      setTimeout(() => {
        if (!ifLoaded) {

        }
      }, 6000)
    }
    function copyAllCodeToClipboard2() {
      const sourceContainer = document.querySelector("#source-container");
      const preElements = sourceContainer.querySelectorAll("pre");
      let allCode = "";
      preElements.forEach((pre) => {
        allCode += pre.textContent + "\n";
      });
      navigator.clipboard.writeText(allCode).then(() => {
        console.log("All code copied to clipboard.");
      }).catch((err) => {
        console.error("Error copying code to clipboard:", err);
      });
    }

    // toggleController.js
    var previousCodeData = null;
    function handleToggleButtonClick() {
      const container = document.querySelector("#iframe-container");
      const toggleButton = document.querySelector("#toggle-button");

      if (container) {
        if (container.style.display === "none") {
          container.style.display = "block";
          toggleButton.textContent = "\u{1FA84}";
        } else {
          container.style.display = "none";
          toggleButton.textContent = "\u2728";
        }
      } else {
        initializeIframe();
        toggleButton.textContent = "\u{1FA84}";
      }
    }
    function initializeToggleButton() {
      const toggleButton = document.createElement("button");
      toggleButton.id = "toggle-button";
      toggleButton.textContent = "\u2728";
      setButtonStyles(toggleButton);
      toggleButton.style.position = "fixed";
      toggleButton.style.top = "50%";
      toggleButton.style.right = "10px";
      toggleButton.style.transform = "translateY(-50%)";
      toggleButton.style.zIndex = zindex;
      toggleButton.style.padding = "10px";
      toggleButton.style.backgroundColor = "#ffffff";
      toggleButton.style.color = "#007BFF";
      toggleButton.style.border = "none";
      toggleButton.style.borderRadius = "50%";
      toggleButton.style.cursor = "pointer";
      toggleButton.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.1)";
      toggleButton.style.fontSize = "24px";
      toggleButton.addEventListener("click", handleToggleButtonClick);
      document.body.appendChild(toggleButton);
    }

    // errorLogController.js
    function initializeErrorLog() {
      const urlParams = new URLSearchParams(window.location.search);
      const debugMode = urlParams.get("debug") === "true";
      if (debugMode) {
        const script = document.createElement("script");
        script.src = "//cdn.jsdelivr.net/npm/eruda";
        script.onload = () => eruda.init();
        document.head.appendChild(script);
      }
    }

    // refreshHandler.js
    var previousCodeData2 = null;
    var isRefreshing = false;
    function handleRefresh() {
      if (isRefreshing) return;
      const codeData = extractCodeData();
      if (JSON.stringify(previousCodeData2) === JSON.stringify(codeData)) {
        console.log("No changes detected in code data. Skipping refresh.");
        return;
      }
      isRefreshing = true;
      previousCodeData2 = codeData;
      const refreshButton = document.querySelector("#refresh-button");
      if (refreshButton) {
        refreshButton.style.backgroundColor = "black";
        refreshButton.style.color = "white";
      }
      fetch("https://appstore.suisuy.eu.org/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(codeData)
      }).then(() => {
        createIframeAndUrl(codeData.id);
        if (refreshButton) {
          refreshButton.style.backgroundColor = "transparent";
          refreshButton.style.color = "white";
        }
        isRefreshing = false;
      }).catch((error) => {
        console.error("Error refreshing iframe:", error);
        if (refreshButton) {
          refreshButton.style.backgroundColor = "transparent";
          refreshButton.style.color = "white";
        }
        isRefreshing = false;
      });
    }

    // mutationObserver.js
    var refreshTimeout;
    function setupMutationObserver() {
      const targetNode = document.documentElement;
      const config = { childList: true, subtree: true };
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList") {
            console.log("DOM mutation detected: child node added or removed.");
            handleMutation();
          }
        }
      });
      observer.observe(targetNode, config);
    }
    function handleMutation() {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        handleRefresh();
      }, 3e3);
    }

    // consoleLogging.js
    function setupConsoleLogging() {
      const urlParams = new URLSearchParams(window.location.search);
      const debugMode = urlParams.get("debug") === "true";
      if (!debugMode) {
        console.log = function () {
        };
      }
    }

    // index.js
    function initialize() {
      initializeToggleButton();
      setupMutationObserver();
      setupConsoleLogging();
      initializeIframe();
    }
    initialize();
  })();









  //end
  console.log('aiartifactbeta.js loaded');

}