async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['aiInputEnabled', 'aiArtifactEnabled', 'aiArtifactbetaEnabled'], (result) => {
      resolve({
        aiInputEnabled: result?.aiInputEnabled ?? false,
        aiArtifactEnabled: result?.aiArtifactEnabled ?? false,
        aiArtifactbetaEnabled: result?.aiArtifactbetaEnabled ?? false,
      });
    });
  });
}

async function init() {
  const settings = await getSettings();

  console.log('settings', settings);
  if (settings.aiInputEnabled ) {
    runAiInput();
  }

  if (settings.aiArtifactEnabled ) {
    runAiArtifact();
  }
  if (settings.aiArtifactbetaEnabled) {
    runAiArtifactbeta();
  }
}

init();
