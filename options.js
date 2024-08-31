document.addEventListener('DOMContentLoaded', () => {
  const aiInputCheckbox = document.getElementById('aiInputToggle');
  const aiArtifactCheckbox = document.getElementById('aiArtifactToggle');
  const aiArtifactbetaCheckbox = document.getElementById('aiArtifactbetaToggle');

  chrome.storage.sync.get(['aiInputEnabled', 'aiArtifactEnabled', 'aiArtifactbetaEnabled'], (result) => {
    aiInputCheckbox.checked = result?.aiInputEnabled ?? false;
    aiArtifactCheckbox.checked = result?.aiArtifactEnabled ?? false;
    aiArtifactbetaCheckbox.checked = result?.aiArtifactbetaEnabled ?? false;
  });

  aiInputCheckbox.addEventListener('change', (event) => {
    chrome.storage.sync.set({ aiInputEnabled: event.target.checked });
  });
  aiArtifactCheckbox.addEventListener('change', (event) => {
    chrome.storage.sync.set({ aiArtifactEnabled: event.target.checked });
  });

  aiArtifactbetaCheckbox.addEventListener('change', (event) => {
    chrome.storage.sync.set({ aiArtifactbetaEnabled: event.target.checked });
    console.log('aiArtifactbetaEnabled:', event.target.checked);
  });
});
