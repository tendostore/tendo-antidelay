// Minimal wrapper around the root WebUI JS bridge (window.ksu).
// KernelSU Manager exposes this natively. On Magisk, the same window.ksu API
// is provided by third-party WebUI host apps such as "WebUI X" or
// "KsuWebUIStandalone" - no code change needed here, this file works as-is
// on both as long as the module is opened through a compatible WebUI host.
// API: ksu.exec(command, optionsJsonString, callbackFunctionName)
// The callback is invoked as: window[callbackFunctionName](errno, stdout, stderr)
let __execCounter = 0;

function ksuExec(cmd) {
  return new Promise((resolve) => {
    __execCounter += 1;
    const cbName = "__ksu_cb_" + __execCounter + "_" + Date.now();
    window[cbName] = function (errno, stdout, stderr) {
      resolve({ errno: errno, stdout: stdout || "", stderr: stderr || "" });
      delete window[cbName];
    };
    try {
      if (window.ksu && typeof window.ksu.exec === "function") {
        window.ksu.exec(cmd, "{}", cbName);
      } else {
        // Not running inside KernelSU Manager WebView
        resolve({ errno: -1, stdout: "", stderr: "ksu bridge tidak tersedia. Buka ini lewat KernelSU Manager." });
      }
    } catch (e) {
      resolve({ errno: -1, stdout: "", stderr: String(e) });
    }
  });
}
