// content.js

console.log("Content script executed.");


// Example: Dynamically load additional scripts if needed
// chrome.storage.sync.get(['scripts']).then( (result) => {
//   console.log(result);

//   const scripts = result.scripts || [];
//   scripts.forEach(script => {
//     console.log(`add script if enabled ${script.url} ${script.enabled}`);
//     if (script.enabled) {
//       fetch(script.url)
//   .then(response => response.text())
//   .then(code => {
//     function removeComment(text) {
//       // Split the text into lines
//       let lines = text.split('\n');

//       // Filter out lines that do not start with '//'
//       let filteredLines = lines.filter(line => !line.trim().startsWith('//'));

//       // Join the remaining lines back into a single string
//       let result = filteredLines.join('\n');

//       return result;
//   }

//     code=removeComment(code);
//     console.log(code);

//     const script = document.createElement('script');
//     script.type = 'module';
//     script.textContent = code;
//     document.body.appendChild(script);
//   })
//   .catch(error => console.error('Error loading script:', error));

//     }
//   });
// });

chrome.storage.sync.get(['scripts']).then((result) => {
  console.log(result);

  const scripts = result.scripts || [];
  scripts.forEach(script => {
    console.log(`add script if enabled ${script.url} ${script.enabled}`);
    if (script.enabled) {
      setTimeout(() => {
        const scriptTag = document.createElement('script');
      scriptTag.type = 'module';
      scriptTag.textContent = `import   "${script.url}"`;
      document.body.appendChild(scriptTag);  
      }, 100);
      
    }
  });
});
