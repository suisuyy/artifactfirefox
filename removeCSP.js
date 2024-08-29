// removeCSP.js
const cspMeta = document.querySelector("meta[http-equiv='Content-Security-Policy']");
if (cspMeta) {
  cspMeta.parentNode.removeChild(cspMeta);
}