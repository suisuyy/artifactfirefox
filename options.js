document.addEventListener('DOMContentLoaded', () => {
  const aiInputCheckbox = document.getElementById('aiInputToggle');
  const aiArtifactCheckbox = document.getElementById('aiArtifactToggle');
  const aiArtifactbetaCheckbox = document.getElementById('aiArtifactbetaToggle');
  const modifyCspCheckbox = document.getElementById('modifyCspToggle');

  chrome.storage.sync.get(['aiInputEnabled', 'aiArtifactEnabled', 'aiArtifactbetaEnabled', 'modifyCspEnabled'], (result) => {
    aiInputCheckbox.checked = result?.aiInputEnabled ?? false;
    aiArtifactCheckbox.checked = result?.aiArtifactEnabled ?? false;
    aiArtifactbetaCheckbox.checked = result?.aiArtifactbetaEnabled ?? false;
    modifyCspCheckbox.checked = result?.modifyCspEnabled ?? false;
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
  modifyCspCheckbox.addEventListener('change', (event) => {
    chrome.storage.sync.set({ modifyCspEnabled: event.target.checked });
  });
});
