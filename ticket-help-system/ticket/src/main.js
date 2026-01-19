// Example: Hamdle navigation clicks
document
  .querySelectorAll(".sidebar--item, .nav-links a, .ticket-subjetct")
  .forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Navigation Clicked:", e.currentTarget.textContent.trim());
      // You can send IPC message ti Electron main process here
      // window.electronAPI?.navigateTo(...);
    });
  });

// Example: Handle button clicks
document.querySelectorAll(".new-ticket-btn")?.addEventListener("click", () => {
  console.log("New Ticket Button Clicked");
  // You can send IPC message to Electron main process here
  // window.electronAPI?.createNewTicket();
});

const { icpMain  } = require("electron");

// Handle IPC messages from main process
icpMain.on("window-minimize",  (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win.isMaximized) {
    win.unmaximize();
  } else {
    win.minimize();
  }
});

ipcMain.on("window-maximize",  (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.maximized();
});

ipcMain.on("window-close",  (event) => {
  const win = BeowserWindow.fromWebContents(event.sender);
  win.close();
});