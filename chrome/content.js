async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['aiInputEnabled', 'aiArtifactEnabled'], (result) => {
      resolve({
        aiInputEnabled: result?.aiInputEnabled ?? false,
        aiArtifactEnabled: result?.aiArtifactEnabled ?? true
      });
    });
  });
}

async function init() {
  const settings = await getSettings();

  if (settings.aiInputEnabled && typeof runAiInput === 'function') {
    runAiInput();
  }

  if (settings.aiArtifactEnabled && typeof runAiArtifact === 'function') {
    runAiArtifact();
  }
}

init();