window.onload = () => {
    const bootScreen = document.getElementById('boot-screen');
    const desktop = document.getElementById('desktop');
    const shutdownBtn = document.getElementById('shutdown-btn');

    // Boot sequence
    setTimeout(() => {
        bootScreen.style.display = 'none';
        desktop.style.display = 'block';
        loadFiles();
    }, 2000);

    // Start clock
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    window.clockInterval = clockInterval; // Store for shutdown

    // Shutdown
    shutdownBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to shut down NEBULA OS?")) {
            shutdownSystem();
        }
    });
};

// --- Clock + Date ✅ ---
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString();
    const topClock = document.getElementById('top-clock');
    const taskbarClock = document.getElementById('clock');
    
    if (topClock) {
        topClock.textContent = time;
    }
    if (taskbarClock) {
        taskbarClock.textContent = `${date} ${time}`;
    }
}

// --- Window Control ---
function openWindow(id) {
    if (isShuttingDown) return;
    const win = document.getElementById(id);
    win.classList.remove('hidden');
    addResizeHandles(win);
    
    // Initialize terminal if it's being opened
    if (id === 'terminal') {
        setTimeout(() => {
            initTerminal();
            const terminalInput = document.getElementById('terminal-input');
            if (terminalInput) terminalInput.focus();
        }, 100);
    }
}

function closeWindow(id) {
    document.getElementById(id).classList.add('hidden');
}

// ✅ Minimize
function minimizeWindow(id) {
    const win = document.getElementById(id);
    win.classList.add('hidden');

    const minimizedIcons = document.getElementById('minimized-icons');
    if (!document.getElementById(`icon-${id}`)) {
        const btn = document.createElement('button');
        btn.id = `icon-${id}`;
        btn.textContent = win.querySelector('.window-header span').textContent;
        btn.onclick = () => {
            win.classList.remove('hidden');
            addResizeHandles(win);
            btn.remove();
        };
        minimizedIcons.appendChild(btn);
    }
}

// ✅ Maximize / Restore
function maximizeWindow(id) {
    const win = document.getElementById(id);
    if (win.classList.contains('maximized')) {
        win.style.width = '300px';
        win.style.height = '200px';
        win.style.top = '60px';
        win.style.left = '100px';
        win.classList.remove('maximized');
        addResizeHandles(win);
    } else {
        win.style.top = '40px';
        win.style.left = '0';
        win.style.width = '100%';
        win.style.height = 'calc(100% - 90px)';
        win.classList.add('maximized');
        win.querySelectorAll('.window-resize-handle').forEach(h => h.remove());
    }
}

// --- File Explorer ---
let files = JSON.parse(localStorage.getItem('files')) || [];
let selectedFile = null; // ✅ track selection

function createFile() {
    const name = document.getElementById('new-file-name').value.trim();
    if (!name) return alert('Enter file name!');
    files.push({ name, content: '' }); // ✅ store as object
    document.getElementById('new-file-name').value = '';
    renderFileList();
    saveFiles();
}

function deleteFile() {
    if (!selectedFile) return alert('Select a file to delete.');
    files = files.filter(f => f.name !== selectedFile.name);
    selectedFile = null;
    renderFileList();
    saveFiles();
}

// ✅ Rename file (double-click)
function renameFile(oldName) {
    const newName = prompt('Enter new name:', oldName);
    if (!newName) return;
    const file = files.find(f => f.name === oldName);
    if (file) file.name = newName.trim();
    renderFileList();
    saveFiles();
}

// ✅ Open file in Text Editor
function openFile(name) {
    selectedFile = files.find(f => f.name === name);
    if (!selectedFile) return;
    const editor = document.getElementById('text-editor');
    editor.classList.remove('hidden');
    document.getElementById('editor-content').value = selectedFile.content;
    addResizeHandles(editor);
}

// ✅ Save edited content
function saveFileContent() {
    if (!selectedFile) return alert('No file selected.');
    selectedFile.content = document.getElementById('editor-content').value;
    saveFiles();
    alert('File saved!');
}

function renderFileList() {
    const list = document.getElementById('file-list');
    list.innerHTML = '';
    files.forEach(f => {
        const li = document.createElement('li');
        li.textContent = f.name;
        li.onclick = () => {
            document.querySelectorAll('#file-list li').forEach(el => el.classList.remove('selected'));
            li.classList.add('selected');
            selectedFile = f;
        };
        li.ondblclick = () => openFile(f.name); // ✅ open editor
        li.oncontextmenu = (e) => {
            e.preventDefault();
            renameFile(f.name); // ✅ right-click rename
        };
        list.appendChild(li);
    });
}

function saveFiles() {
    localStorage.setItem('files', JSON.stringify(files));
}

function loadFiles() {
    renderFileList();
}

// --- Settings ---
function changeTheme() {
    document.body.className = document.getElementById('theme-select').value;
}

function saveUsername() {
    const name = document.getElementById('username-input').value.trim();
    if (!name) return alert('Please enter a username.');
    alert(`Username saved as: ${name}`);
}

// --- Task Manager ---
function updateTaskList() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    document.querySelectorAll('.window:not(.hidden)').forEach(win => {
        const li = document.createElement('li');
        li.textContent = win.querySelector('.window-header span').textContent;
        const btn = document.createElement('button');
        btn.textContent = 'End Task';
        btn.onclick = () => closeWindow(win.id);
        li.appendChild(btn);
        list.appendChild(li);
    });
}

// --- Draggable Windows ---
let currentWindow = null, offsetX = 0, offsetY = 0;

function startDrag(e, element) {
    if (isShuttingDown) return;
    if (element.classList.contains('maximized')) return; // ✅ prevent dragging maximized
    if (e.target.classList.contains('window-resize-handle')) return; // Don't drag when resizing
    currentWindow = element;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
    if (!currentWindow) return;
    const rect = currentWindow.getBoundingClientRect();
    const desktop = document.getElementById('desktop').getBoundingClientRect();
    
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;
    
    // Constrain to desktop bounds
    newLeft = Math.max(0, Math.min(newLeft, desktop.width - rect.width));
    newTop = Math.max(40, Math.min(newTop, desktop.height - 100 - rect.height)); // 40px for top bar, 100px for taskbar
    
    currentWindow.style.left = newLeft + 'px';
    currentWindow.style.top = newTop + 'px';
}

function stopDrag() {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    currentWindow = null;
}

// --- Window Resizing ---
let resizingWindow = null;
let resizeDirection = null;
let startX = 0, startY = 0;
let startWidth = 0, startHeight = 0;
let startLeft = 0, startTop = 0;

function addResizeHandles(windowElement) {
    // Remove existing handles if any
    windowElement.querySelectorAll('.window-resize-handle').forEach(h => h.remove());
    
    if (windowElement.classList.contains('maximized')) return;
    
    const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    handles.forEach(dir => {
        const handle = document.createElement('div');
        handle.className = `window-resize-handle ${dir}`;
        handle.onmousedown = (e) => startResize(e, windowElement, dir);
        windowElement.appendChild(handle);
    });
}

function startResize(e, windowElement, direction) {
    if (isShuttingDown) return;
    e.stopPropagation();
    if (windowElement.classList.contains('maximized')) return;
    
    resizingWindow = windowElement;
    resizeDirection = direction;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = windowElement.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = rect.left;
    startTop = rect.top;
    
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
}

function doResize(e) {
    if (!resizingWindow) return;
    
    const desktop = document.getElementById('desktop').getBoundingClientRect();
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;
    
    // Handle different resize directions
    if (resizeDirection.includes('e')) {
        newWidth = Math.max(200, Math.min(startWidth + deltaX, desktop.width - startLeft));
    }
    if (resizeDirection.includes('w')) {
        newWidth = Math.max(200, Math.min(startWidth - deltaX, startLeft + startWidth));
        newLeft = startLeft + (startWidth - newWidth);
    }
    if (resizeDirection.includes('s')) {
        newHeight = Math.max(150, Math.min(startHeight + deltaY, desktop.height - 100 - startTop));
    }
    if (resizeDirection.includes('n')) {
        newHeight = Math.max(150, Math.min(startHeight - deltaY, startTop + startHeight - 40));
        newTop = startTop + (startHeight - newHeight);
    }
    
    // Constrain to desktop bounds
    newLeft = Math.max(0, Math.min(newLeft, desktop.width - newWidth));
    newTop = Math.max(40, Math.min(newTop, desktop.height - 100 - newHeight));
    
    resizingWindow.style.width = newWidth + 'px';
    resizingWindow.style.height = newHeight + 'px';
    resizingWindow.style.left = newLeft + 'px';
    resizingWindow.style.top = newTop + 'px';
}

function stopResize() {
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
    resizingWindow = null;
    resizeDirection = null;
}

// --- Calculator ---
let calcInput = '';

function appendCalc(val) {
    calcInput += val;
    document.getElementById('calc-display').value = calcInput;
}

function calculateResult() {
    try {
        calcInput = eval(calcInput).toString();
        document.getElementById('calc-display').value = calcInput;
    } catch {
        alert('Invalid input');
    }
}

function clearCalc() {
    calcInput = '';
    document.getElementById('calc-display').value = '';
}

// --- Wallpaper ---
function setWallpaper(src) {
    const desktop = document.getElementById('desktop');
    desktop.style.backgroundImage = `url('${src}')`;
    desktop.style.backgroundSize = 'cover';
    desktop.style.backgroundPosition = 'center';
}

// --- Shutdown System ---
let isShuttingDown = false;

function shutdownSystem() {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    const desktop = document.getElementById('desktop');
    const shutdownScreen = document.getElementById('shutdown-screen');
    const shutdownMessage = shutdownScreen.querySelector('.shutdown-message');
    
    // Hide desktop and show shutdown screen
    desktop.style.display = 'none';
    shutdownScreen.classList.remove('hidden');
    
    // Close all windows
    document.querySelectorAll('.window').forEach(win => {
        win.classList.add('hidden');
    });
    
    // Stop clock updates
    if (window.clockInterval) {
        clearInterval(window.clockInterval);
    }
    
    // Disable all interactions
    document.querySelectorAll('button').forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
    });
    
    // Shutdown animation sequence
    setTimeout(() => {
        shutdownMessage.textContent = 'Saving system state...';
    }, 1000);
    
    setTimeout(() => {
        shutdownMessage.textContent = 'Closing applications...';
    }, 2500);
    
    setTimeout(() => {
        shutdownMessage.textContent = 'Finalizing shutdown...';
    }, 4000);
    
    setTimeout(() => {
        shutdownMessage.textContent = 'System shutdown complete';
        shutdownScreen.querySelector('h1').textContent = 'Shutdown Complete';
        shutdownScreen.querySelector('.shutdown-loader').style.display = 'none';
    }, 5500);
}

// --- Terminal ---
let terminalHistory = [];
let terminalHistoryIndex = -1;

function initTerminal() {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    
    if (!terminalInput || !terminalOutput) return;
    
    // Welcome message
    addTerminalOutput('NEBULA OS Terminal v1.0');
    addTerminalOutput('Type "help" for available commands.');
    addTerminalOutput('');
    
    // Handle input
    terminalInput.addEventListener('keydown', (e) => {
        if (isShuttingDown) {
            e.preventDefault();
            return;
        }
        
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = terminalInput.value.trim();
            if (command) {
                terminalHistory.push(command);
                terminalHistoryIndex = terminalHistory.length;
                executeCommand(command);
                terminalInput.value = '';
            } else {
                addTerminalOutput('nebula@os:~$');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (terminalHistoryIndex > 0) {
                terminalHistoryIndex--;
                terminalInput.value = terminalHistory[terminalHistoryIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (terminalHistoryIndex < terminalHistory.length - 1) {
                terminalHistoryIndex++;
                terminalInput.value = terminalHistory[terminalHistoryIndex];
            } else {
                terminalHistoryIndex = terminalHistory.length;
                terminalInput.value = '';
            }
        }
    });
    
    // Focus input when terminal opens
    terminalInput.focus();
}

function addTerminalOutput(text, className = '') {
    const terminalOutput = document.getElementById('terminal-output');
    if (!terminalOutput) return;
    
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function executeCommand(command) {
    addTerminalOutput(`nebula@os:~$ ${command}`);
    
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (cmd) {
        case 'echo':
            const text = args.join(' ');
            addTerminalOutput(text);
            break;
            
        case 'clear':
            const terminalOutput = document.getElementById('terminal-output');
            if (terminalOutput) {
                terminalOutput.innerHTML = '';
            }
            break;
            
        case 'help':
            addTerminalOutput('Available commands:');
            addTerminalOutput('  echo <text>     - Display text');
            addTerminalOutput('  clear           - Clear terminal screen');
            addTerminalOutput('  help            - Show this help message');
            addTerminalOutput('  date            - Show current date and time');
            addTerminalOutput('  whoami          - Show current user');
            addTerminalOutput('  ls              - List files');
            addTerminalOutput('  pwd             - Show current directory');
            addTerminalOutput('  exit            - Close terminal');
            break;
            
        case 'date':
            const now = new Date();
            addTerminalOutput(now.toString());
            break;
            
        case 'whoami':
            addTerminalOutput('nebula');
            break;
            
        case 'ls':
            const files = JSON.parse(localStorage.getItem('files')) || [];
            if (files.length === 0) {
                addTerminalOutput('(no files)');
            } else {
                files.forEach(file => {
                    addTerminalOutput(`  ${file.name}`);
                });
            }
            break;
            
        case 'pwd':
            addTerminalOutput('/home/nebula');
            break;
            
        case 'exit':
            closeWindow('terminal');
            break;
            
        default:
            addTerminalOutput(`Command not found: ${cmd}. Type "help" for available commands.`, 'error');
    }
    
    addTerminalOutput('');
}
