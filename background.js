// background.js

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['cfetch.js', 'aiinput.js', 'aiartifact.js', 'content.js','aiartifactbeta.js']
  });
});

function formDataToObject(formData) {
  const object = {};
  for (const [key, value] of formData.entries()) {
    object[key] = value;
  }
  return object;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetch') {
    let body = request.init.body;

    // Handle base64 encoded body
    try {
      let parsedBody = JSON.parse(body);
      if(!(parsedBody.bodyType==='form')){
        throw new Error("not form ");

      }
      const formData = new FormData();

      Object.entries(parsedBody).forEach(([key, value]) => {
        console.log(key + ': ' + JSON.stringify(value));
        if(value.data && value.size && value.lastModified && value.type){

          // Extract file information from the parsed JSON
          const fileInfo = value;

          // Convert the base64 string to a Blob
          const byteCharacters = atob(fileInfo.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: fileInfo.type });

          // Create a File object
          const file = new File([blob], fileInfo.name, {
            type: fileInfo.type,
            lastModified: fileInfo.lastModified
          });

          // Append the file to the FormData object
          formData.append(key, file);
        }
        else{
          if(key==='bodyType' && value==='form'){

          }
          else{
            formData.append(key, value);

          }
        }

        body=formData;

    });




      if (parsedBody.file?.data) {

      }
    } catch (error) {

    }

    fetch(request.input, { ...request.init, body: body })
      .then(response => response.arrayBuffer().then(buffer => ({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: Array.from(new Uint8Array(buffer))
      })))
      .then(responseData => {
        sendResponse(responseData);
      })
      .catch(error => {
        sendResponse({ error: error.message });
      });
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    aiInputEnabled: false,
    aiArtifactEnabled: false,
    aiArtifactbetaEnabled: true
  }, () => {
    console.log('Default settings initialized');
  });
});

//log enabled status
setInterval(() => {
  chrome.storage.sync.get(['aiInputEnabled', 'aiArtifactEnabled']).then((result) => {
    console.log('aiInputEnabled:', result.aiInputEnabled);
    console.log('aiArtifactEnabled:', result.aiArtifactEnabled);
  }).catch((error) => {
    console.error('Error retrieving settings:', error);
  });
}, 3000);
