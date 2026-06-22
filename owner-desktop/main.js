const { app, BrowserWindow, Tray, Menu, Notification } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    title: "SB Suite - Owner Desktop Console",
    icon: path.join(__dirname, 'assets/icon.png'),
    backgroundColor: '#060608',
    show: false, // Avoid white flash on load
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Hide default browser menus
  mainWindow.setMenu(null);

  // Load the Owner portal
  mainWindow.loadURL('https://www.sbsuite.in/owner');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Inject CSS/JS to lock landing page to Owner role
  mainWindow.webContents.on('dom-ready', () => {
    const currentUrl = mainWindow.webContents.getURL();
    try {
      const urlObj = new URL(currentUrl);
      if (urlObj.pathname === '/' || urlObj.pathname === '') {
        mainWindow.webContents.executeJavaScript(`
          (function() {
            const selectOwner = () => {
              const buttons = Array.from(document.querySelectorAll('button'));
              const ownerBtn = buttons.find(b => b.textContent.includes('Owner') || b.textContent.includes('मालिक'));
              if (ownerBtn) {
                ownerBtn.click();
                
                // Hide role selection container
                const roleContainer = ownerBtn.closest('.grid') || ownerBtn.parentElement;
                if (roleContainer) {
                  roleContainer.style.display = 'none';
                }
                
                // Hide Staff Portal controls
                const staffBtn = buttons.find(b => b.textContent.includes('Staff') || b.textContent.includes('स्टाफ'));
                if (staffBtn) {
                  staffBtn.style.display = 'none';
                }
                
                const allDivs = Array.from(document.querySelectorAll('div, span, p'));
                const staffLabel = allDivs.find(el => el.textContent === 'स्टाफ लॉगिन' || el.textContent === 'Staff Portal' || el.textContent === 'स्टाफ पोर्टल');
                if (staffLabel) {
                  const staffWrapper = staffLabel.closest('div');
                  if (staffWrapper) staffWrapper.style.display = 'none';
                }
                return true;
              }
              return false;
            };

            const timer = setInterval(() => {
              if (selectOwner()) clearInterval(timer);
            }, 50);
            setTimeout(() => clearInterval(timer), 4000);
          })();
        `);
      }
    } catch (e) {
      console.error('URL parse error:', e);
    }
  });

  // Intercept window close to minimize to system tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      
      // Notify user that application is still running
      if (Notification.isSupported()) {
        const notification = new Notification({
          title: 'SB Suite Owner Portal',
          body: 'App is running in the background. Access it from the system tray.',
          icon: path.join(__dirname, 'assets/icon.png')
        });
        notification.show();
      }
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets/icon.png');
  tray = new Tray(iconPath);
  
  const updateTrayMenu = () => {
    const isAutoStart = app.getLoginItemSettings().openAtLogin;
    
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Open Dashboard', 
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        } 
      },
      {
        label: 'Run at Startup',
        type: 'checkbox',
        checked: isAutoStart,
        click: () => {
          const autoStartNewVal = !isAutoStart;
          app.setLoginItemSettings({
            openAtLogin: autoStartNewVal,
            path: app.getPath('exe')
          });
          updateTrayMenu();
        }
      },
      { type: 'separator' },
      { 
        label: 'Exit', 
        click: () => {
          isQuitting = true;
          app.quit();
        } 
      }
    ]);
    
    tray.setContextMenu(contextMenu);
  };

  tray.setToolTip('SB Suite - Owner Portal');
  
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  updateTrayMenu();
}

app.whenReady().then(() => {
  createMainWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
