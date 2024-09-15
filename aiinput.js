function runAiInput() {
  console.log('aiinput running');
  //redefine some standard functions
  let fetch = cfetch;

  //start of aiinput.js
  let apiURL = 'https://im1111-groqnote-can.hf.space'


  // model.js
  var appModel = {
    api_url: "",
    api_key: "",
    voice_button_id: "whisper_voice_button",
    transcribeProvider: "lepton_whisper",
    language: "",
    supportedInputTypeList: ["text", "number", "tel", "search", "url", "email"],
    buttonBackgroundColor: "lightblue",
    minimalRecordTime: 2e3,
    keepButtonAliveInterval: 0,
    isRecording: false,
    llm_model_info: {
      url: "/openai/v1/chat/completions",
      model: "llama3-70b-8192",
      max_tokens: 8e3
    },
    zIndex: {
      highest: 999999,
      higher: 99999,
      high: 9999,
      medium: 999
    },
    apiKey: {
      "flowgpt": ""
    }
  };

  // utils.js
  var utils = {
    Recorder: class Recorder {
      constructor() {
        this.isRecording = false;
        this.mediaRecorder;
        this.encodeType = "audio/mpeg";
        this.language = "en";
        this.recordingColor = "lightblue";
        this.autoStop = true;
      }
      async startRecording(targetElement, silenceHandler = () => {
        console.log("silence detect");
      }, autoStop = true) {
        targetElement = targetElement || document.querySelector(`#whisper_voice_button`);
        this.stopRecording();
        console.log("start recording");
        return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);
          let silenceStart = Date.now();
          let silenceDuration = 0;
          let mediaRecorder = this.mediaRecorder;
          let audioChunks = [];
          mediaRecorder.start();
          this.isRecording = true;
          targetElement.style.backgroundColor = "rgba(173, 216, 230, 0.3)";
          let volumeInterval;
          let audioContext;
          audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(
            mediaRecorder.stream
          );
          microphone.connect(analyser);
          analyser.fftSize = 512;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          const updateButtonFontSize = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            let averageVolume = sum / bufferLength;
            if (averageVolume < 10) {
              silenceDuration = Date.now() - silenceStart;
              if (silenceDuration > 1e3) {
                silenceHandler();
              }
            } else {
              silenceStart = Date.now();
            }
            let scale = 3 + averageVolume / 15;
            targetElement.style.transform = `scale(${scale})`;
          };
          volumeInterval = setInterval(updateButtonFontSize, 100);
          mediaRecorder.addEventListener("dataavailable", (event) => {
            console.log("dataavailable");
            audioChunks.push(event.data);
          });
          return new Promise((resolve, reject) => {
            mediaRecorder.addEventListener("stop", async () => {
              this.isRecording = false;
              console.log("stop");
              clearInterval(volumeInterval);
              const audioBlob = new Blob(audioChunks, {
                type: this.encodeType
              });
              targetElement.style.transform = `scale(1)`;
              targetElement.style.background = "transparent";
              audioContext?.close();
              mediaRecorder.stream.getTracks().forEach((track) => track.stop());
              console.log("resolved ");
              resolve(audioBlob);
            });
          });
        }).catch((error) => {
          if (error.name === "PermissionDeniedError" || error.name === "NotAllowedError") {
            console.error("User denied permission to access audio");
            console.log("Audio permission denied");
          } else {
            console.error(
              "An error occurred while accessing the audio device",
              error
            );
          }
        });
      }
      async startRecordingWithSilenceDetection(targetElement, silenceHandler = () => console.log("silence detect")) {
        let autoStop = this.autoStop || true;
        this.stopRecording();
        console.log("start recording");
        return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);
          let startTime = Date.now();
          let isSilent = false;
          let isLongSilent = true;
          let silenceStart = Date.now();
          let silenceDuration = 0;
          let mediaRecorder = this.mediaRecorder;
          let audioChunks = [];
          mediaRecorder.start();
          this.isRecording = true;
          targetElement.style.backgroundColor = "rgba(173, 216, 230, 0.3)";
          let volumeInterval;
          let audioContext;
          audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(
            mediaRecorder.stream
          );
          microphone.connect(analyser);
          analyser.fftSize = 512;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          const handleAudioData = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            let averageVolume = sum / bufferLength;
            if (averageVolume < 15) {
              if (isSilent) {
                silenceDuration = Date.now() - silenceStart;
                if (silenceDuration > 3e3) {
                  isLongSilent = true;
                  mediaRecorder.requestData();
                  silenceStart = Date.now();
                }
              } else {
                silenceDuration = Date.now() - silenceStart;
                if (silenceDuration > 1e3) {
                  isSilent = true;
                  console.log("change isSilent to true");
                  mediaRecorder.requestData();
                }
              }
            } else {
              isSilent = false;
              isLongSilent = false;
              silenceStart = Date.now();
            }
            let scale = 3 + averageVolume / 15;
            targetElement.style.transform = `scale(${scale})`;
          };
          volumeInterval = setInterval(handleAudioData, 100);
          let counter = 0;
          let firstdata;
          setTimeout(() => {
            mediaRecorder.requestData();
          }, 200);
          mediaRecorder.addEventListener("dataavailable", (event) => {
            if (autoStop === true) {
              if (Date.now() - startTime > 36e5) {
                mediaRecorder.stop();
              }
            }
            counter++;
            if (counter <= 1) {
              firstdata = event.data;
              if (event.data.size > 0) {
                audioChunks.push(event.data);
              }
              return;
            }
            console.log("dataavailable", event.data);
            if (isLongSilent) {
              console.log("dataavailable,Long silent will do noting", event.data);
              return;
            }
            silenceHandler(new Blob([firstdata, event.data], { type: mediaRecorder.mimeType }));
          });
          return new Promise((resolve, reject) => {
            mediaRecorder.addEventListener("stop", async () => {
              this.isRecording = false;
              console.log("stop");
              clearInterval(volumeInterval);
              const audioBlob = new Blob(audioChunks, {
                type: this.encodeType
              });
              targetElement.style.transform = `scale(1)`;
              targetElement.style.background = "transparent";
              audioContext?.close();
              mediaRecorder.stream.getTracks().forEach((track) => track.stop());
              console.log("resolved ");
              resolve(audioBlob);
            });
          });
        }).catch((error) => {
          if (error.name === "PermissionDeniedError" || error.name === "NotAllowedError") {
            console.error("User denied permission to access audio");
            showNotification("Audio permission denied");
          } else {
            console.error(
              "An error occurred while accessing the audio device",
              error
            );
            showNotification("Error accessing audio device");
          }
        });
      }
      stopRecording() {
        this.isRecording = false;
        this.mediaRecorder?.stop();
        this.mediaRecorder?.audioContext?.close();
        this.mediaRecorder?.stream?.getTracks().forEach((track) => track.stop());
      }
    },
    tts: function synthesizeSpeech(text = "test text", voice = "alloy") {
      let url = `https://im1111-free-get-tts.hf.space/tts/${encodeURIComponent(text)}`;
      let container = document.getElementById("devlent_tts_container");
      if (!container) {
        container = document.createElement("div");
        container.id = "devlent_tts_container";
        document.body.appendChild(container);
      }
      let audio = document.getElementById("tts_audio");
      if (!audio) {
        audio = document.createElement("audio");
        audio.id = "tts_audio";
        container.appendChild(audio);
        let button2 = document.createElement("button");
        button2.innerHTML = "x";
        button2.style.backgroundColor = "transparent";
        button2.style.marginLeft = "10px";
        button2.addEventListener("pointerdown", () => container.style.display = "none");
        let br = document.createElement("br");
        container.prepend(br);
        container.prepend(button2);
      }
      container.style.display = "block";
      container.style.position = "fixed";
      container.style.top = "20px";
      container.style.right = "0";
      container.style.height = "fit-content";
      if (!text) return;
      audio.src = url;
      audio.controls = true;
      audio.autoplay = true;
      utils.dragElement(container, container);
    },
    stt: async (audioBlob) => {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.mp3");
      formData.append("model", "whisper-large-v3");
      try {
        const response = await fetch(apiURL+"/openai/v1/audio/transcriptions", {
          method: "POST",
          body: formData
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("There was an error with the transcription request:", error);
      }
    },
    checkValidString(str) {
      if (str === void 0 || str === null || str.trim() === "") {
        return false;
      }
      if (str === "undefined" || str === "null") {
        return false;
      }
      return true;
    },
    getCurrentLineString(element) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const node = range.startContainer;
      const offset = range.startOffset;
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const lineStart = text.lastIndexOf("\n", offset) + 1;
        const lineEnd = text.indexOf("\n", offset);
        const line = lineEnd === -1 ? text.slice(lineStart) : text.slice(lineStart, lineEnd);
        return line;
      }
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let currentNode, currentLine = "";
      while (currentNode = walker.nextNode()) {
        const text = currentNode.textContent;
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (range.intersectsNode(currentNode)) {
            currentLine = lines[i];
            break;
          }
        }
        if (currentLine !== "") {
          break;
        }
      }
      return currentLine;
    },
    getCursorPosition(element) {
      let caretOffset = 0;
      const doc = element.ownerDocument || element.document;
      const win = doc.defaultView || doc.parentWindow;
      let sel;
      if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          caretOffset = preCaretRange.toString().length;
        }
      } else if ((sel = doc.selection) && sel.type != "Control") {
        const textRange = sel.createRange();
        const preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
      }
      console.log("caretOffset:", caretOffset);
      return caretOffset;
    },
    getCurrentBlock(elem) {
      elem = elem.parentElement;
      const cursorPosition = this.getCursorPosition(elem);
      const text = elem.innerText;
      let blockStart = text.indexOf("\n\n", cursorPosition) + 2;
      if (blockStart === 1) {
        blockStart = 0;
      }
      let blockEnd = text.lastIndexOf("\n\n", cursorPosition);
      if (blockEnd === -1) {
        blockEnd = text.length;
      }
      return text.substring(blockStart, blockEnd).trim();
    },
    isEditableElement: function isEditableElement(element) {
      while (element) {
        if (element.contentEditable === "true") {
          return true;
        }
        element = element.parentElement;
      }
      return false;
    },
    disableSelect: function disableSelect(element) {
      element.style.userSelect = "none";
      element.addEventListener("pointerdown", (e) => {
        e.preventDefault();
      });
    },
    getSelectionText: function getSelectionText() {
      let activeElement = document.activeElement;
      if (activeElement && activeElement.value) {
        return activeElement.value.substring(
          activeElement.selectionStart,
          activeElement.selectionEnd
        );
      } else {
        return window.getSelection().toString();
      }
    },
    makeButtonFeedback: function makeButtonFeedback(button2) {
      let originalColor = button2.style.backgroundColor || "white";
      button2.addEventListener("pointerdown", function () {
        button2.style.backgroundColor = "lightblue";
      });
      button2.addEventListener("pointerup", function () {
        setTimeout(() => {
          button2.style.backgroundColor = originalColor;
        }, 1e3);
      });
      button2.addEventListener("pointercancel", function () {
        setTimeout(() => {
          button2.style.backgroundColor = originalColor;
        }, 1e3);
      });
    },
    showToast: function showToast(text, x = 0, y = 0, w = 200, h = 0, duration = 1e3, zIndex = 9999) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.width = w + "px";
      textArea.style.height = h === 0 ? "auto" : h + "px";
      textArea.style.borderWidth = "0";
      textArea.style.outline = "none";
      textArea.style.position = "fixed";
      textArea.style.left = x + "px";
      textArea.style.top = y + "px";
      textArea.style.zIndex = zIndex;
      textArea.style.backgroundColor = "black";
      textArea.style.color = "white";
      textArea.disabled = true;
      document.body.appendChild(textArea);
      setTimeout(() => {
        document.body.removeChild(textArea);
      }, duration);
    },
    copyToClipboard: function copyToClipboard(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.width = "50%";
      textArea.style.height = "100px";
      textArea.style.borderWidth = "0";
      textArea.style.outline = "none";
      textArea.style.position = "fixed";
      textArea.style.left = "0";
      textArea.style.top = "0";
      textArea.style.zIndex = "9999999";
      textArea.style.backgroundColor = "black";
      textArea.style.color = "white";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.disabled = true;
      textArea.value = "copyed to clipboard \n" + textArea.value;
      textArea.scrollTo(1e4, 1e5);
      setTimeout(() => {
        document.body.removeChild(textArea);
      }, 1e3);
    },
    writeText: function writeText(targetElement, text, prefix = " ", endfix = " ") {
      console.log("writeText(): ", targetElement);
      document.execCommand("insertText", false, `${prefix}${text}${endfix}`) || utils.copyToClipboard(text);
    },
    dragElement: function dragElement(elmnt, movableElmnt = elmnt.parentElement, speed = 1) {
      elmnt.style.touchAction = "none";
      let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      let rmShadeTimeout;
      let shadeDiv;
      elmnt.addEventListener("pointerdown", (e) => {
        dragMouseDown(e);
      });
      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.body.addEventListener("pointermove", elementDrag);
        document.body.addEventListener("pointerup", closeDragElement);
        shadeDiv = document.querySelector("#shadeDivForDragElement") || document.createElement("div");
        shadeDiv.id = "shadeDivForDragElement";
        shadeDiv.style.width = "300vw";
        shadeDiv.style.height = "300vh";
        shadeDiv.style.position = "fixed";
        shadeDiv.style.top = "0";
        shadeDiv.style.left = "0";
        shadeDiv.style.backgroundColor = "rgb(230,230,230,0.2)";
        shadeDiv.style.zIndex = 1e5;
        document.body.appendChild(shadeDiv);
        rmShadeTimeout = setTimeout(() => {
          let shadeDiv2 = document.querySelector("#shadeDivForDragElement");
          shadeDiv2 && document.body.removeChild(shadeDiv2);
        }, 1e4);
      }
      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        movableElmnt.style.position = "fixed";
        movableElmnt.style.top = e.clientY - elmnt.clientHeight / 2 + "px";
        movableElmnt.style.left = e.clientX - elmnt.clientWidth / 2 + "px";
      }
      function closeDragElement() {
        console.log("closeDragElement(): pointerup");
        document.body.removeEventListener("pointermove", elementDrag);
        document.body.removeEventListener("pointerup", closeDragElement);
        document.body.removeChild(
          document.querySelector("#shadeDivForDragElement")
        );
      }
    },
    renderMarkdown(mdString, targetElement) {
      let headerPattern = /^(#{1,6})\s*(.*)$/gm;
      const boldPattern = /\*\*(.*?)\*\*/g;
      const linkPattern = /\[(.*?)\]\((.*?)\)/g;
      const newlinePattern = /(?:\n)/g;
      const inlineCodePattern = /```(.*?)```/g;
      const codeBlockPattern = /```(\w+)?\n(.*?)```/gs;
      let html = mdString;
      let parts = html.split("```");
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          parts[i] = parts[i].replace(headerPattern, (match, hash, content) => {
            const level = hash.length;
            return `<h${level}>${content}</h${level}>`;
          });
          parts[i] = parts[i].replace(newlinePattern, (match, hash, content) => {
            const level = hash.length;
            return `<br>`;
          });
        }
      }
      html = parts.join("```");
      html = html.replace(boldPattern, "<strong>$1</strong>");
      html = html.replace(linkPattern, '<a href="$2">$1</a>');
      html = html.replace(codeBlockPattern, (match, language, code) => {
        return `
          <div class="code-block">
              <button class="copy-code-btn">Copy</button>
              <button class="insert-code-btn">Insert</button>
              <pre id='devilentCodePre'><xmp>${code}</xmp></pre>
          </div>
      `;
      });
      html = html.replace(inlineCodePattern, "<code>$1</code>");
      targetElement.innerHTML = html;
      const buttons = targetElement.querySelectorAll(".code-block button");
      buttons.forEach((btn) => {
        btn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          const code = btn.parentElement.querySelector("pre").innerText;
          if (btn.classList.contains("copy-code-btn")) {
            utils.copyToClipboard(code);
          } else if (btn.classList.contains("insert-code-btn")) {
            console.log("insert button down");
            utils.writeText(document.activeElement, code, "", "");
          }
        });
      });
      const copyButton = document.createElement("button");
      copyButton.innerText = "Copy";
      copyButton.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        utils.copyToClipboard(mdString);
      });
      const insertButton = document.createElement("button");
      insertButton.innerText = "Insert";
      insertButton.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        utils.writeText(document.activeElement, mdString, "", "");
      });
      copyButton.classList.add("copy-btn");
      insertButton.classList.add("insert-btn");
      let editButton = document.createElement("button");
      editButton.innerText = "Edit";
      editButton.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (targetElement.isEditableElement) {
          targetElement.setAttribute("contenteditable", "false");
        } else {
          targetElement.setAttribute("contenteditable", "true");
        }
      });
      editButton.classList.add("copy-btn");
      const closeButton = document.createElement("button");
      closeButton.innerText = "Close";
      closeButton.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        targetElement.remove();
      });
      closeButton.classList.add("copy-btn");
      let buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");
      buttonContainer.appendChild(copyButton);
      buttonContainer.appendChild(insertButton);
      buttonContainer.appendChild(closeButton);
      buttonContainer.appendChild(editButton);
      const parentElement = targetElement;
      buttonContainer.style.width = "100%";
      buttonContainer.style.backgroundColor = parentElement.style.backgroundColor;
      buttonContainer.style.color = "lighten(" + buttonContainer.style.backgroundColor + ", 20%)";
      targetElement.prepend(buttonContainer);
      utils.dragElement(buttonContainer, targetElement);
      targetElement.classList.add("markdown-container");
      let markdownContainers = document.getElementsByClassName("markdown-container");
      for (let i = 0; i < markdownContainers.length; i++) {
        markdownContainers[i].style.fontFamily = "Arial, sans-serif";
        markdownContainers[i].style.lineHeight = "1.6";
        markdownContainers[i].style.maxWidth = "800px";
        markdownContainers[i].style.margin = "0 auto";
        markdownContainers[i].style.padding = "0px";
        markdownContainers[i].style.backgroundColor = "azure";
        markdownContainers[i].style.overflow = "auto";
        markdownContainers[i].style.boxShadow = "0px 0px 50px rgba(0, 0, 0, 0.4)";
      }
      let codeBlocks = document.getElementsByClassName("code-block");
      for (let i = 0; i < codeBlocks.length; i++) {
        codeBlocks[i].style.position = "relative";
      }
      let insertCodeBtns = document.getElementsByClassName("insert-code-btn");
      let codecopyBtns = document.getElementsByClassName("copy-code-btn");
      for (let i = 0; i < codecopyBtns.length; i++) {
        codecopyBtns[i].style.top = "0";
        codecopyBtns[i].style.position = "absolute";
        codecopyBtns[i].style.right = "0";
        codecopyBtns[i].style.margin = "5px";
        codecopyBtns[i].style.padding = "2px 5px";
        codecopyBtns[i].style.fontSize = "12px";
        codecopyBtns[i].style.border = "none";
        codecopyBtns[i].style.borderRadius = "3px";
        codecopyBtns[i].style.backgroundColor = "#007bff";
        codecopyBtns[i].style.color = "white";
        codecopyBtns[i].style.cursor = "pointer";
      }
      for (let i = 0; i < insertCodeBtns.length; i++) {
        insertCodeBtns[i].style.position = "absolute";
        insertCodeBtns[i].style.top = "0";
        insertCodeBtns[i].style.right = "50px";
        insertCodeBtns[i].style.margin = "5px";
        insertCodeBtns[i].style.padding = "2px 5px";
        insertCodeBtns[i].style.fontSize = "12px";
        insertCodeBtns[i].style.border = "none";
        insertCodeBtns[i].style.borderRadius = "3px";
        insertCodeBtns[i].style.backgroundColor = "#007bff";
        insertCodeBtns[i].style.color = "white";
        insertCodeBtns[i].style.cursor = "pointer";
      }
      let copyBtns = document.getElementsByClassName("copy-btn");
      let insertBtns = document.getElementsByClassName("insert-btn");
      for (let i = 0; i < copyBtns.length; i++) {
        copyBtns[i].style.margin = "5px";
        copyBtns[i].style.padding = "2px 5px";
        copyBtns[i].style.fontSize = "12px";
        copyBtns[i].style.border = "none";
        copyBtns[i].style.borderRadius = "3px";
        copyBtns[i].style.backgroundColor = "#007bff";
        copyBtns[i].style.color = "white";
        copyBtns[i].style.cursor = "pointer";
      }
      for (let i = 0; i < insertBtns.length; i++) {
        insertBtns[i].style.margin = "5px";
        insertBtns[i].style.padding = "2px 5px";
        insertBtns[i].style.fontSize = "12px";
        insertBtns[i].style.border = "none";
        insertBtns[i].style.borderRadius = "3px";
        insertBtns[i].style.backgroundColor = "#007bff";
        insertBtns[i].style.color = "white";
        insertBtns[i].style.cursor = "pointer";
      }
      let pres = targetElement.getElementsByTagName("pre");
      for (let i = 0; i < pres.length; i++) {
        pres[i].style.backgroundColor = "#f7f7f7";
        pres[i].style.borderRadius = "5px";
        pres[i].style.padding = "10px";
        pres[i].style.whiteSpace = "pre-wrap";
        pres[i].style.wordBreak = "break-all";
      }
      let codes = targetElement.getElementsByTagName("code");
      for (let i = 0; i < codes.length; i++) {
        codes[i].style.backgroundColor = "#f1f1f1";
        codes[i].style.borderRadius = "3px";
        codes[i].style.padding = "2px 5px";
        codes[i].style.fontFamily = "'Courier New', Courier, monospace";
      }
    },
    displayMarkdown(mdString) {
      let containerID = "ai_input_md_dispalyer";
      let container = document.getElementById(containerID);
      if (container === null) {
        container = document.getElementById(containerID) || document.createElement("div");
        container.id = containerID;
        document.body.appendChild(container);
        container.style.zIndex = "100000";
        container.style.position = "fixed";
        container.style.top = "70vh";
        container.style.left = "0";
        container.style.height = "40vh";
        container.style.width = "80vw";
        container.style.backgroundColor = "rgba{20,20,50,1}";
      }
      utils.renderMarkdown(mdString, container);
      let div = document.createElement("div");
      div.style.height = "3000px";
      container.appendChild(div);
    },
    moveElementNearMouse: (mElem, targetElement, alwayInWindow = true, event) => {
      let x = event.clientX + 200;
      let y = event.clientY - 20;
      console.log("moveElementNearMouse: ", x, y);
      if (alwayInWindow) {
        x = Math.abs(x);
        y = Math.abs(y);
        x = Math.min(x, window.innerWidth - mElem.clientWidth);
        y = Math.min(y, window.innerHeight - 10 - mElem.clientHeight);
      }
      mElem.style.left = x + "px";
      mElem.style.top = y + "px";
    },
    addEventListenerForActualClick(element, handler) {
      let initialX, initialY;
      let startTime;
      element.addEventListener("pointerdown", (event) => {
        initialX = event.clientX;
        initialY = event.clientY;
        startTime = Date.now();
      });
      element.addEventListener("pointerup", (event) => {
        const deltaX = Math.abs(event.clientX - initialX);
        const deltaY = Math.abs(event.clientY - initialY);
        if (deltaX <= 10 && deltaY <= 10 && Date.now() - startTime < 1e3) {
          console.log(
            "Minimal mouse movement (< 10px in either direction) and short duration click detected."
          );
          handler(event);
        }
      });
    },
    sendKeyEvent(element, key, modifiers) {
      const eventDown = new KeyboardEvent("keydown", {
        key,
        code: key.toUpperCase(),
        bubbles: true,
        cancelable: true,
        ...modifiers
      });
      const eventUp = new KeyboardEvent("keyup", {
        key,
        code: key.toUpperCase(),
        bubbles: true,
        cancelable: true,
        ...modifiers
      });
      element.dispatchEvent(eventDown);
      element.dispatchEvent(eventUp);
    },
    blobToBase64: function blobToBase64(blob) {
      if (!(blob instanceof Blob)) {
        throw new TypeError("Parameter must be a Blob object.");
      }
      if (!blob.size) {
        throw new Error("Empty Blob provided.");
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },
    playAudioBlob: function playAudioBlob(blob, autoPlay = true) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(blob);
      audio.controls = true;
      document.body.prepend(audio);
      if (autoPlay === true) {
        audio.play().then(() => {
          console.log("Audio played successfully!");
        }).catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
    },
    async AIComplete(userText, option = {
      url: apiURL+"/openai/v1/chat/completions",
      model: "llama3-70b-8192",
      max_tokens: 8e3
    }) {
      console.log("AIcomplete(): ", userText);
      if (utils.checkValidString(userText) === false) {
        return;
      }
      let response = await fetch(
        option.url,
        {
          headers: {
            accept: "*/*",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            messages: [
              {
                "role": "system",
                "content": "be concise and clear."
              },
              { role: "user", content: userText }
            ],
            model: option.model,
            tools: [],
            temperature: 0.7,
            top_p: 0.8,
            max_tokens: option.max_tokens || 1e6
          }),
          method: "POST"
        }
      );
      response = await response.json();
      let responseMessage = response?.choices[0]?.message?.content;
      console.log("[leptonComplete(text)]", responseMessage);
      let mdContainer = document.createElement("div");
      document.body.appendChild(mdContainer);
      utils.displayMarkdown(userText + "\n\n" + option.model + "\n" + responseMessage);
      return response;
    }
  };

  // controller.js
  var controller = {
    async handleRecording(event) {
      let startTime = Date.now();
      let audioblob = await view.recorder.startRecording(view.elem.voiceButton);
      if (Date.now() - startTime < appModel.minimalRecordTime) {
        utils.showToast("time too short, this will not transcribe");
        return;
      }
      let transcribe = await utils.stt(audioblob);
      if (!transcribe.text) {
        console.log("transcribe failed, try alternative way");
        transcribe = await whisperjaxws(audioblob);
      }
      utils.writeText(document.activeElement, transcribe.text);
    },
    async startRecordingWithSilenceDetection(event) {
      let startTime = Date.now();
      let finalAudioblob = await view.recorder.startRecordingWithSilenceDetection(
        view.elem.voiceButton,
        (audioBlob) => {
          utils.stt(audioBlob).then((transcribe2) => {
            if (!transcribe2?.text) {
              console.log("transcribe failed, try alternative way");
              whisperjaxws(audioBlob).then((transcribe3) => {
                utils.writeText(document.activeElement, transcribe3);
              });
            } else {
              utils.writeText(document.activeElement, transcribe2.text);
            }
          });
        }
      );
      if (Date.now() - startTime < appModel.minimalRecordTime) {
        utils.showToast("time too short, this will not transcribe");
        return;
      }
      let transcribe = await utils.stt(finalAudioblob);
      if (!transcribe) {
        console.log("transcribe failed, try alternative way");
        transcribe = await whisperjaxws(finalAudioblob);
      }
      utils.writeText(document.activeElement, transcribe.text);
    },
    stopRecording(safeStop = true) {
      appModel.isRecording = false;
      if (safeStop) {
        setTimeout(() => {
          console.log("safeStop");
          view.recorder.stopRecording();
        }, 500);
      } else {
        view.recorder.stopRecording();
      }
    },
    async chat(message) {
      let selectText = window.getSelection().toString();
      let currentLineString = utils.getCurrentLineString(document.activeElement);
      prompt = `${message} ${selectText.length >= 1 ? selectText : currentLineString} `;
      let userText = prompt;
      if (!utils.checkValidString(userText)) {
        console.log("chat(): invalid userText:", userText);
        return;
      }
      utils.displayMarkdown(userText + " \n please wait");
      utils.AIComplete(userText, appModel.llm_model_info);
    },
    async ask() {
      if (appModel.isRecording) {
        utils.AIComplete(utils.getSelectionText(), appModel.llm_model_info);
        return;
      }
      let startTime = Date.now();
      let audioblob = await view.recorder.startRecording(view.elem.voiceButton);
      if (Date.now() - startTime < appModel.minimalRecordTime) {
        utils.showToast("time too short, this will not transcribe");
        console.log("ask():", utils.getSelectionText());
        utils.AIComplete(utils.getSelectionText(), appModel.llm_model_info);
        return;
      }
      let transcribe = await utils.stt(audioblob);
      if (!transcribe) {
        console.log("transcribe failed, try alternative way");
        transcribe = await whisperjaxws(audioblob);
      }
      let selectionString = window.getSelection().toString();
      let userText = utils.checkValidString(selectionString) ? `"${selectionString}" ${transcribe.text}` : transcribe.text;
      if (!utils.checkValidString(userText)) {
        console.log("ask(): invalid userText:", userText);
        return;
      }
      utils.displayMarkdown(userText + " please wait");
      utils.AIComplete(userText);
    }
  };

  // view.js
  var view = {
    elem: {
      currentInputElem: null,
      voiceButton: null
    },
    recorder: null,
    async init() {
      this.recorder = new utils.Recorder();
      this.elem.voiceButton = this.createButton();
      appModel.keepButtonAliveInterval = setInterval(() => {
        const whisperButton = document.getElementById("whisper_voice_button");
        if (!whisperButton) {
          this.createButton();
        }
      }, 2e3);
    },
    createButton() {
      if (document.getElementById("whisper_voice_button")) {
        return;
      }
      let button2 = document.createElement("button");
      this.elem.voiceButton = button2;
      button2.id = appModel.voice_button_id;
      button2.innerText = "\u25EF";
      button2.type = "button";
      button2.classList.add("speech-to-text-button");
      button2.style.top = window.innerHeight - 100 + "px";
      button2.style.left = "0";
      button2.style.width = "40px";
      button2.style.height = button2.style.width;
      button2.style.fontSize = "30px";
      button2.style.padding = "0";
      button2.style.border = "0px";
      button2.style.color = "blue";
      button2.style.background = "transparent";
      button2.style.zIndex = 1e6;
      button2.style.position = "fixed";
      button2.style.borderRadius = "50%";
      button2.style.userSelect = "none";
      button2.style.touchAction = "none";
      document.body.appendChild(button2);
      utils.dragElement(button2, button2);
      button2.addEventListener("click", () => {
        console.log("createButton():clicked");
      });
      button2.addEventListener("pointerdown", async (event) => {
        event.preventDefault();
        controller.handleRecording(event);
      });
      button2.addEventListener("pointerup", () => {
        console.log("createButton pointerup");
        controller.stopRecording();
      });
      utils.addEventListenerForActualClick(button2, (event) => {
        let clientX = event?.clientX;
        let clientY = event?.clientY;
        this.createMenu(clientX + 50, clientY + 50);
      });
      utils.addEventListenerForActualClick(document.body, (event) => {
        if (view.recorder.isRecording) return;
        if (event.target.tagName === "INPUT" && appModel.supportedInputTypeList.includes(event.target.type)) {
          utils.moveElementNearMouse(button2, event.target, true, event);
        } else if (event.target.tagName === "TEXTAREA" || utils.isEditableElement(event.target)) {
          utils.moveElementNearMouse(button2, event.target, true, event);
        }
      });
      window.addEventListener("resize", () => {
        let buttonPos = button2.getBoundingClientRect();
        if (buttonPos.top > window.innerHeight - buttonPos.height) {
          button2.style.top = window.innerHeight - buttonPos.height + "px";
        }
      });
      return button2;
    },
    createMenu(x, y, id = "webai_input_menu") {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      let menuContainer = document.getElementById(id);
      if (menuContainer) {
        menuContainer.style.left = Math.min(x, windowWidth - menuContainer.offsetWidth * 0.5) + "px";
        menuContainer.style.top = Math.min(y, windowHeight - menuContainer.offsetHeight) - 100 + "px";
        menuContainer.style.zIndex = "99999";
        return;
      }
      menuContainer = document.createElement("div");
      document.body.appendChild(menuContainer);
      menuContainer.id = id;
      menuContainer.style.zIndex = "99999";
      menuContainer.style.position = "fixed";
      menuContainer.style.backgroundColor = "white";
      menuContainer.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
      menuContainer.style.borderRadius = "4px";
      menuContainer.style.display = "flex";
      menuContainer.style.flexDirection = "column";
      menuContainer.style.alignItems = "flex-start";
      menuContainer.style.padding = "10px";
      menuContainer.style.left = Math.min(x, windowWidth - menuContainer.offsetWidth) + "px";
      menuContainer.style.top = Math.min(y, windowHeight - menuContainer.offsetHeight) - 100 + "px";
      menuContainer.style.opacity = "0.7";
      utils.disableSelect(menuContainer);
      menuContainer.style.maxHeight = "60vh";
      menuContainer.style.overflowY = "auto";
      menuContainer.style.cssText += `
      scrollbar-width: thin; 
      scrollbar-color: rgba(0, 0, 0, 0.3) transparent; 
    `;
      menuContainer.style.msOverflowStyle = "none";
      function createMenuItem(textContent, handler) {
        const menuItem = document.createElement("button");
        utils.makeButtonFeedback(menuItem);
        menuContainer.appendChild(menuItem);
        menuItem.style.cssText = `
        background-color: white;
        border: none;
        font-size: 14px;
        width: 80px;
        text-align: left;
        cursor: pointer;
        margin-bottom: 0;
        margin-top: 0;
        padding: 5px 10px;
        color: #333;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        border-radius: 4px;
      `;
        menuItem.textContent = textContent;
        menuItem.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          if (handler) {
            handler();
          }
        });
        return menuItem;
      }
      const removeMenuItem = createMenuItem("Remove Menu");
      removeMenuItem.addEventListener(
        "pointerdown",
        () => menuContainer.remove()
      );
      menuContainer.appendChild(removeMenuItem);
      const closeButton = createMenuItem("Close");
      closeButton.addEventListener("pointerdown", () => {
        if (confirm("remove the AI tool now?")) {
          clearInterval(appModel.keepButtonAliveInterval);
          view.elem.voiceButton.remove();
          menuContainer.remove();
        }
      });
      menuContainer.appendChild(closeButton);
      createMenuItem("TTS", () => {
        let currentLineString = utils.getCurrentLineString(document.activeElement);
        let selectText = window.getSelection().toString();
        let ttstext = selectText.length >= 1 ? selectText : currentLineString;
        utils.tts(
          ttstext,
          "de-DE-SeraphinaMultilingualNeural"
        );
      });
      const startMenuItem = createMenuItem("Start");
      menuContainer.appendChild(startMenuItem);
      startMenuItem.addEventListener("pointerdown", () => {
        view.elem.voiceButton.style.top = "0px";
        view.elem.voiceButton.style.left = window.innerWidth * 0.8 + "px";
        appModel.isRecording = true;
        controller.startRecordingWithSilenceDetection();
      });
      let copyButton = createMenuItem("Copy");
      menuContainer.appendChild(copyButton);
      copyButton.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (window.getSelection().toString().length > 0) {
          document.execCommand("copy");
        } else {
          utils.copyToClipboard(utils.getCurrentLineString(document.activeElement));
        }
        utils.showToast("Copied to clipboard");
      });
      createMenuItem("Cut", () => {
        document.execCommand("copy");
        document.execCommand("delete");
        utils.showToast("Cut to clipboard");
      });
      let pasteButton = createMenuItem("Paste");
      menuContainer.appendChild(pasteButton);
      pasteButton.addEventListener("pointerdown", async (e) => {
        e.preventDefault();
        try {
          const text = await navigator.clipboard.readText();
          utils.writeText(document.activeElement, text);
          console.log("Clipboard text:", text);
        } catch (err) {
          console.error("Clipboard access denied:", err);
        }
      });
      let enterButton = createMenuItem("Enter");
      menuContainer.appendChild(enterButton);
      enterButton.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        document.execCommand("insertText", false, "\n");
      });
      createMenuItem("Correct", () => {
        let correctPrompt = "correct mistakes of the text, put the corrected text in the codeblock:\n ";
        controller.chat(correctPrompt);
      });
      let askButton = createMenuItem("Ask");
      askButton.style.touchAction = "none";
      menuContainer.appendChild(askButton);
      askButton.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        controller.ask();
        document.body.addEventListener("pointerup", () => {
          controller.stopRecording();
        }, { once: true });
      });
      menuContainer.style.left = Math.min(x, windowWidth - menuContainer.offsetWidth * 0.5) + "px";
      menuContainer.style.top = Math.min(y, windowHeight - menuContainer.offsetHeight) - 100 + "px";
      document.body.appendChild(menuContainer);
    }
  };

  // index.js
  view.init();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").then((registration) => {
        console.log("Service Worker registered with scope: ", registration.scope);
      }).catch((err) => {
        console.log("Service Worker registration failed: ", err);
      });
    });
  }
  var button = document.createElement("button");
  button.id = "clearCacheButton";
  button.textContent = "v0.2";
  Object.assign(button.style, {
    position: "fixed",
    bottom: "0px",
    right: "0px",
    padding: "10px 20px",
    backgroundColor: "#f44336",
    // Red background
    color: "white",
    // White text
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
  });
  button.addEventListener("click", () => {
    if (window.confirm("updated?")) {
      caches.keys().then((names) => {
        for (let name of names)
          caches.delete(name);
      });
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
          if (registration.scope === "/service-worker.js") {
            registration.unregister().then(function () {
              console.log("Service worker unregistered.");
            }).catch(function (error) {
              console.error("Error unregistering service worker:", error);
            });
            break;
          }
        }
      });
      alert("updated!");
    }
  });
  document.body.appendChild(button);





  //end of aiinput.js
}