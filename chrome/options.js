document.addEventListener('DOMContentLoaded', () => {
  const aiInputCheckbox = document.getElementById('aiInputToggle');
  const aiArtifactCheckbox = document.getElementById('aiArtifactToggle');

  chrome.storage.sync.get(['aiInputEnabled', 'aiArtifactEnabled']).then((result) => {
    aiInputCheckbox.checked = result?.aiInputEnabled ?? false;
    aiArtifactCheckbox.checked = result?.aiArtifactEnabled ?? true;
  }).catch((error) => {
    console.error('Error retrieving settings:', error);
  });

  aiInputCheckbox.addEventListener('change', (event) => {
    chrome.storage.sync.set({ aiInputEnabled: event.target.checked });
  });

  aiArtifactCheckbox.addEventListener('change', (event) => {
    chrome.storage.sync.set({ aiArtifactEnabled: event.target.checked });
  });
});