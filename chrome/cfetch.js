function cfetch(input, init = {}) {
  return new Promise((resolve, reject) => {
    const url = input instanceof URL ? input.href : input;
    let body = init.body;

    if (body instanceof FormData) {
      const formDataObject = {};
      formDataObject.bodyType = "form";

      for (let [key, value] of body.entries()) {
        formDataObject[key] = value;
      }
      for (let [key, value] of body.entries()) {
        if (value instanceof File) {
          formDataObject[key] = {
            name: value.name,
            lastModified: value.lastModified,
            size: value.size,
            type: value.type,
          };
          const reader = new FileReader();
          reader.onload = function (event) {
            formDataObject[key].data = event.target.result.split(",")[1]; // base64 data
            sendMessage(url, { ...init, body: JSON.stringify(formDataObject) });
          };
          reader.readAsDataURL(value);
          return;
        } else {
          formDataObject[key] = value;
        }
      }
      sendMessage(url, { ...init, body: JSON.stringify(formDataObject) });
    } else {
      sendMessage(url, init);
    }

    function sendMessage(url, modifiedInit) {
      chrome.runtime.sendMessage(
        {
          action: "fetch",
          input: url,
          init: modifiedInit,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!response) {
            reject(new Error("No response from background script"));
            return;
          }
          if (response.error) {
            reject(new Error(response.error));
          } else {
            const responseInit = {
              status: response.status,
              statusText: response.statusText,
              headers: new Headers(response.headers),
            };
            const body = new Uint8Array(response.body).buffer;
            resolve(new Response(body, responseInit));
          }
        },
      );
    }
  });
}
