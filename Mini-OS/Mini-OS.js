window.onload = () => {
    const bootScreen = document.getElementById('boot-screen');
    const desktop = document.getElementById('desktop');

    // Boot sequence
    setTimeout(() => {
        if (bootScreen) {
            bootScreen.style.display = 'none';
        }
        
        if (desktop) {
            desktop.style.display = 'block';
            desktop.style.visibility = 'visible';
            
            // Initialize desktop components
            initializeDesktop();
        }
    }, 2000);

    // Start clock
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    window.clockInterval = clockInterval; // Store for shutdown
};

// Initialize desktop after boot
function initializeDesktop() {
    // Initialize shutdown button
    const shutdownBtn = document.getElementById('shutdown-btn');
    if (shutdownBtn) {
        shutdownBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to shut down Mini OS?")) {
                shutdownSystem();
            }
        });
    }

    // Try to set wallpaper (but don't fail if it doesn't exist)
    try {
        // Only set wallpaper if file exists, otherwise use default gradient
        const wallpaperImg = new Image();
        wallpaperImg.onerror = () => {
            // Wallpaper doesn't exist, use default gradient - do nothing
            console.log('Wallpaper not found, using default gradient');
        };
        wallpaperImg.onload = () => {
            setWallpaper('OS_BG.png');
        };
        wallpaperImg.src = 'OS_BG.png';
    } catch (e) {
        console.log('Wallpaper setup skipped:', e);
    }

    // Load files if file manager elements exist
    try {
        loadFiles();
    } catch (e) {
        console.log('File loading skipped:', e);
    }

    // Ensure desktop is visible
    const desktop = document.getElementById('desktop');
    if (desktop) {
        desktop.style.display = 'block';
        desktop.style.visibility = 'visible';
        desktop.style.opacity = '1';
    }

    // Ensure all UI elements are visible
    const taskbar = document.querySelector('.taskbar');
    const topBar = document.querySelector('.top-bar');
    const desktopLogo = document.querySelector('.desktop-logo-container');
    
    if (taskbar) {
        taskbar.style.display = 'flex';
        taskbar.style.visibility = 'visible';
        taskbar.style.opacity = '1';
    }
    
    if (topBar) {
        topBar.style.display = 'flex';
        topBar.style.visibility = 'visible';
        topBar.style.opacity = '1';
    }
    
    if (desktopLogo) {
        desktopLogo.style.display = 'flex';
        desktopLogo.style.visibility = 'visible';
        desktopLogo.style.opacity = '1';
    }
    
    // Ensure all buttons are visible
    const appButtons = document.querySelectorAll('.app-btn');
    appButtons.forEach(btn => {
        btn.style.display = 'flex';
        btn.style.visibility = 'visible';
        btn.style.opacity = '1';
    });
    
    // Force a reflow to ensure rendering
    if (desktop) {
        desktop.offsetHeight;
    }
}

// --- Clock + Date ✅ ---
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString();
    const taskbarClock = document.getElementById('clock');

    if (taskbarClock) {
        taskbarClock.textContent = `${date} ${time}`;
    }
}

// --- Window Control ---
function openWindow(id) {
    if (isShuttingDown) return;
    const win = document.getElementById(id);
    if (!win) return;
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
    
    // Initialize manager data when opened
    if (id === 'memory-manager') {
        updateMemoryStats();
        if (!window.memoryInterval) {
            window.memoryInterval = setInterval(updateMemoryStats, 2000);
        }
    } else if (id === 'processor-manager') {
        updateCPUStats();
        if (!window.cpuInterval) {
            window.cpuInterval = setInterval(updateCPUStats, 1500);
        }
    } else if (id === 'device-manager') {
        refreshDevices();
    } else if (id === 'network-manager') {
        updateNetworkStats();
        if (!window.networkInterval) {
            window.networkInterval = setInterval(updateNetworkStats, 3000);
        }
    } else if (id === 'security-manager') {
        updateSecurityLogs();
        if (!window.securityInterval) {
            window.securityInterval = setInterval(updateSecurityLogs, 5000);
        }
    } else if (id === 'file-manager') {
        loadFiles();
        // Initialize Finder
        setTimeout(() => {
            finderInitialize();
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

// --- File Manager (macOS Finder-like) ---
// File system structure: { path: string, items: [{name, type, content, created, modified}] }
let fileSystem = JSON.parse(localStorage.getItem('fileSystem')) || {
    '/': { items: [], created: new Date().toISOString() },
    '/Documents': { items: [], created: new Date().toISOString() },
    '/Downloads': { items: [], created: new Date().toISOString() },
    '/Desktop': { items: [], created: new Date().toISOString() },
    '/Applications': { items: [], created: new Date().toISOString() }
};

let finderCurrentPath = '/';
let finderHistory = ['/'];
let finderHistoryIndex = 0;
let finderSelectedItems = [];
let finderViewMode = 'grid';
let finderSearchQuery = '';

// Legacy file system for backward compatibility
let files = JSON.parse(localStorage.getItem('files')) || [];
let selectedFile = null;

function createFile() {
    const input = document.getElementById('new-file-name');
    const enteredName = input.value.trim();
    if (!enteredName) return alert('Enter file name!');

    const existingNames = files.map(f => f.name);
    let name = enteredName;
    let counter = 1;

    // Keep looping while the name already exists
    while (existingNames.includes(name)) {
        const dotIndex = enteredName.lastIndexOf('.');
        if (dotIndex !== -1) {
            const base = enteredName.substring(0, dotIndex);
            const ext = enteredName.substring(dotIndex);
            name = `${base}(${counter})${ext}`;
        } else {
            name = `${enteredName}(${counter})`;
        }
        counter++;
    }

    // Add the new file
    files.push({ name, content: '' });
    input.value = '';
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
    try {
        renderFileList();
    } catch (e) {
        console.log('File list rendering skipped:', e);
    }
}

// --- Finder Functions (macOS Finder-like) ---
function finderInitialize() {
    finderCurrentPath = '/';
    finderHistory = ['/'];
    finderHistoryIndex = 0;
    finderSelectedItems = [];
    finderNavigateTo('/');
    finderUpdateNavigationButtons();
}

function finderNavigateTo(path) {
    if (!fileSystem[path]) {
        fileSystem[path] = { items: [], created: new Date().toISOString() };
        finderSaveFileSystem();
    }
    
    finderCurrentPath = path;
    finderUpdateBreadcrumb();
    finderUpdateSidebar();
    finderRenderFiles();
    finderUpdateStatusBar();
    
    // Add to history
    if (finderHistory[finderHistoryIndex] !== path) {
        finderHistory = finderHistory.slice(0, finderHistoryIndex + 1);
        finderHistory.push(path);
        finderHistoryIndex = finderHistory.length - 1;
    }
    
    finderUpdateNavigationButtons();
}

function finderNavigateBack() {
    if (finderHistoryIndex > 0) {
        finderHistoryIndex--;
        finderNavigateTo(finderHistory[finderHistoryIndex]);
    }
}

function finderNavigateForward() {
    if (finderHistoryIndex < finderHistory.length - 1) {
        finderHistoryIndex++;
        finderNavigateTo(finderHistory[finderHistoryIndex]);
    }
}

function finderUpdateNavigationButtons() {
    const backBtn = document.getElementById('finder-back-btn');
    const forwardBtn = document.getElementById('finder-forward-btn');
    
    if (backBtn) {
        backBtn.disabled = finderHistoryIndex === 0;
        backBtn.style.opacity = finderHistoryIndex === 0 ? '0.5' : '1';
    }
    
    if (forwardBtn) {
        forwardBtn.disabled = finderHistoryIndex === finderHistory.length - 1;
        forwardBtn.style.opacity = finderHistoryIndex === finderHistory.length - 1 ? '0.5' : '1';
    }
}

function finderUpdateBreadcrumb() {
    const pathBar = document.getElementById('finder-path-bar');
    if (!pathBar) return;
    
    const pathParts = finderCurrentPath.split('/').filter(p => p);
    pathBar.innerHTML = '';
    
    // Home button
    const homeItem = document.createElement('span');
    homeItem.className = 'fm-path-item';
    homeItem.innerHTML = '🏠 Home';
    homeItem.onclick = () => finderNavigateTo('/');
    pathBar.appendChild(homeItem);
    
    // Path parts
    let currentPath = '';
    pathParts.forEach((part) => {
        currentPath += '/' + part;
        const item = document.createElement('span');
        item.className = 'fm-path-item';
        item.textContent = part;
        item.onclick = () => finderNavigateTo(currentPath);
        pathBar.appendChild(item);
    });
}

function finderUpdateSidebar() {
    // Sidebar removed in simplified design - this function kept for compatibility
}

function finderRenderFiles() {
    const currentFolder = fileSystem[finderCurrentPath];
    if (!currentFolder) return;
    
    let items = currentFolder.items || [];
    
    // Apply search filter
    if (finderSearchQuery) {
        items = items.filter(item => 
            item.name.toLowerCase().includes(finderSearchQuery.toLowerCase())
        );
    }
    
    // Sort: folders first, then files
    items.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
    });
    
    // Always use grid view in simplified design
    finderRenderGridView(items);
}

function finderRenderGridView(items) {
    const gridView = document.getElementById('file-grid-view');
    if (!gridView) return;
    
    gridView.innerHTML = '';
    
    items.forEach((item, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item' + (finderSelectedItems.includes(index) ? ' selected' : '');
        fileItem.onclick = (e) => {
            if (e.ctrlKey || e.metaKey) {
                finderToggleSelection(index);
            } else {
                finderSelectItem(index);
            }
        };
        fileItem.ondblclick = () => finderOpenItem(item);
        fileItem.oncontextmenu = (e) => {
            e.preventDefault();
            finderShowContextMenu(e, item, index);
        };
        
        const icon = document.createElement('div');
        icon.className = 'file-icon';
        icon.textContent = item.type === 'folder' ? '📁' : '📄';
        
        const name = document.createElement('div');
        name.className = 'file-name';
        name.textContent = item.name;
        
        fileItem.appendChild(icon);
        fileItem.appendChild(name);
        gridView.appendChild(fileItem);
    });
}

function finderRenderListView(items) {
    const gridView = document.getElementById('file-grid-view');
    const listView = document.getElementById('file-list-view');
    
    if (gridView) gridView.style.display = 'none';
    if (listView) listView.style.display = 'table';
    
    if (!listView) return;
    
    listView.innerHTML = '';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'list-header';
    header.innerHTML = `
        <div class="list-col-name">Name</div>
        <div class="list-col-date">Date Modified</div>
        <div class="list-col-size">Size</div>
        <div class="list-col-kind">Kind</div>
    `;
    listView.appendChild(header);
    
    items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'list-row' + (finderSelectedItems.includes(index) ? ' selected' : '');
        row.onclick = (e) => {
            if (e.ctrlKey || e.metaKey) {
                finderToggleSelection(index);
            } else {
                finderSelectItem(index);
            }
        };
        row.ondblclick = () => finderOpenItem(item);
        row.oncontextmenu = (e) => {
            e.preventDefault();
            finderShowContextMenu(e, item, index);
        };
        
        const modified = item.modified ? new Date(item.modified).toLocaleDateString() : '—';
        const size = item.type === 'folder' ? '—' : (item.size || '0 KB');
        const kind = item.type === 'folder' ? 'Folder' : 'Document';
        
        row.innerHTML = `
            <div class="list-col-name">
                <span class="list-icon">${item.type === 'folder' ? '📁' : '📄'}</span>
                <span>${item.name}</span>
            </div>
            <div class="list-col-date">${modified}</div>
            <div class="list-col-size">${size}</div>
            <div class="list-col-kind">${kind}</div>
        `;
        listView.appendChild(row);
    });
}

function finderSelectItem(index) {
    finderSelectedItems = [index];
    finderRenderFiles();
    finderUpdateStatusBar();
}

function finderToggleSelection(index) {
    const pos = finderSelectedItems.indexOf(index);
    if (pos > -1) {
        finderSelectedItems.splice(pos, 1);
    } else {
        finderSelectedItems.push(index);
    }
    finderRenderFiles();
    finderUpdateStatusBar();
}

function finderOpenItem(item) {
    if (item.type === 'folder') {
        const newPath = finderCurrentPath === '/' ? '/' + item.name : finderCurrentPath + '/' + item.name;
        finderNavigateTo(newPath);
    } else {
        // Open file in text editor
        const editor = document.getElementById('text-editor');
        if (editor) {
            editor.classList.remove('hidden');
            const editorContent = document.getElementById('editor-content');
            if (editorContent) {
                editorContent.value = item.content || '';
            }
            addResizeHandles(editor);
        }
    }
}

function finderCreateNewFolder() {
    const name = prompt('New Folder Name:', 'Untitled Folder');
    if (!name || !name.trim()) return;
    
    const currentFolder = fileSystem[finderCurrentPath];
    if (!currentFolder.items) currentFolder.items = [];
    
    // Check for duplicates
    let folderName = name.trim();
    let counter = 1;
    while (currentFolder.items.some(item => item.name === folderName)) {
        folderName = `${name.trim()} ${counter}`;
        counter++;
    }
    
    const newFolder = {
        name: folderName,
        type: 'folder',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
    };
    
    currentFolder.items.push(newFolder);
    const folderPath = finderCurrentPath === '/' ? '/' + folderName : finderCurrentPath + '/' + folderName;
    fileSystem[folderPath] = { items: [], created: new Date().toISOString() };
    finderSaveFileSystem();
    finderRenderFiles();
    finderUpdateStatusBar();
}

function finderCreateNewFile() {
    const name = prompt('New File Name:', 'Untitled.txt');
    if (!name || !name.trim()) return;
    
    const currentFolder = fileSystem[finderCurrentPath];
    if (!currentFolder.items) currentFolder.items = [];
    
    // Check for duplicates
    let fileName = name.trim();
    let counter = 1;
    while (currentFolder.items.some(item => item.name === fileName)) {
        const dotIndex = name.trim().lastIndexOf('.');
        if (dotIndex !== -1) {
            const base = name.trim().substring(0, dotIndex);
            const ext = name.trim().substring(dotIndex);
            fileName = `${base} ${counter}${ext}`;
        } else {
            fileName = `${name.trim()} ${counter}`;
        }
        counter++;
    }
    
    const newFile = {
        name: fileName,
        type: 'file',
        content: '',
        size: '0 KB',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
    };
    
    currentFolder.items.push(newFile);
    finderSaveFileSystem();
    finderRenderFiles();
    finderUpdateStatusBar();
}

function finderDeleteSelected() {
    if (finderSelectedItems.length === 0) return;
    
    if (!confirm(`Move ${finderSelectedItems.length} item(s) to Trash?`)) return;
    
    const currentFolder = fileSystem[finderCurrentPath];
    if (!currentFolder.items) return;
    
    // Delete in reverse order to maintain indices
    const sortedIndices = [...finderSelectedItems].sort((a, b) => b - a);
    sortedIndices.forEach(index => {
        const item = currentFolder.items[index];
        if (item) {
            // If it's a folder, delete the folder path too
            if (item.type === 'folder') {
                const folderPath = finderCurrentPath === '/' ? '/' + item.name : finderCurrentPath + '/' + item.name;
                delete fileSystem[folderPath];
            }
            currentFolder.items.splice(index, 1);
        }
    });
    
    finderSelectedItems = [];
    finderSaveFileSystem();
    finderRenderFiles();
    finderUpdateStatusBar();
}

function finderSetView(mode) {
    // View mode switching removed in simplified design - always use grid
    finderViewMode = 'grid';
    finderRenderFiles();
}

function finderSearch(query) {
    finderSearchQuery = query;
    finderRenderFiles();
}

function finderUpdateStatusBar() {
    const currentFolder = fileSystem[finderCurrentPath];
    const totalItems = currentFolder ? (currentFolder.items || []).length : 0;
    const selectedCount = finderSelectedItems.length;
    
    const itemCount = document.getElementById('finder-item-count');
    const selectedCountEl = document.getElementById('finder-selected-count');
    
    if (itemCount) {
        itemCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    }
    
    if (selectedCountEl) {
        if (selectedCount > 0) {
            selectedCountEl.style.display = 'inline';
            selectedCountEl.textContent = `${selectedCount} selected`;
        } else {
            selectedCountEl.style.display = 'none';
        }
    }
}

function finderShowContextMenu(e, item, index) {
    const contextMenu = document.getElementById('finder-context-menu');
    if (!contextMenu) return;
    
    finderSelectItem(index);
    
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';
    contextMenu.classList.remove('hidden');
    contextMenu.setAttribute('data-item-index', index);
    
    // Close menu when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            contextMenu.classList.add('hidden');
            document.removeEventListener('click', closeMenu);
        }, { once: true });
    }, 0);
}

function finderContextNewFolder() {
    finderCreateNewFolder();
}

function finderContextNewFile() {
    finderCreateNewFile();
}

function finderContextRename() {
    const contextMenu = document.getElementById('finder-context-menu');
    const index = parseInt(contextMenu.getAttribute('data-item-index'));
    if (isNaN(index)) return;
    
    const currentFolder = fileSystem[finderCurrentPath];
    const item = currentFolder.items[index];
    if (!item) return;
    
    const newName = prompt('Rename:', item.name);
    if (!newName || !newName.trim() || newName === item.name) return;
    
    // Check for duplicates
    let finalName = newName.trim();
    if (currentFolder.items.some((it, i) => i !== index && it.name === finalName)) {
        alert('A file or folder with that name already exists.');
        return;
    }
    
    const oldName = item.name;
    item.name = finalName;
    item.modified = new Date().toISOString();
    
    // If it's a folder, update the path
    if (item.type === 'folder') {
        const oldPath = finderCurrentPath === '/' ? '/' + oldName : finderCurrentPath + '/' + oldName;
        const newPath = finderCurrentPath === '/' ? '/' + finalName : finderCurrentPath + '/' + finalName;
        if (fileSystem[oldPath]) {
            fileSystem[newPath] = fileSystem[oldPath];
            delete fileSystem[oldPath];
        }
    }
    
    finderSaveFileSystem();
    finderRenderFiles();
}

function finderContextDuplicate() {
    const contextMenu = document.getElementById('finder-context-menu');
    const index = parseInt(contextMenu.getAttribute('data-item-index'));
    if (isNaN(index)) return;
    
    const currentFolder = fileSystem[finderCurrentPath];
    const item = currentFolder.items[index];
    if (!item) return;
    
    let newName = item.name;
    const dotIndex = newName.lastIndexOf('.');
    let base = dotIndex > -1 ? newName.substring(0, dotIndex) : newName;
    let ext = dotIndex > -1 ? newName.substring(dotIndex) : '';
    
    let counter = 1;
    while (currentFolder.items.some(it => it.name === newName)) {
        newName = `${base} copy ${counter}${ext}`;
        counter++;
    }
    
    const duplicate = {
        ...item,
        name: newName,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
    };
    
    if (duplicate.type === 'folder') {
        const folderPath = finderCurrentPath === '/' ? '/' + newName : finderCurrentPath + '/' + newName;
        fileSystem[folderPath] = { items: [], created: new Date().toISOString() };
    }
    
    currentFolder.items.push(duplicate);
    finderSaveFileSystem();
    finderRenderFiles();
}

function finderContextMoveToTrash() {
    finderDeleteSelected();
}

function finderContextGetInfo() {
    const contextMenu = document.getElementById('finder-context-menu');
    const index = parseInt(contextMenu.getAttribute('data-item-index'));
    if (isNaN(index)) return;
    
    const currentFolder = fileSystem[finderCurrentPath];
    const item = currentFolder.items[index];
    if (!item) return;
    
    const info = `
Name: ${item.name}
Type: ${item.type === 'folder' ? 'Folder' : 'Document'}
Created: ${new Date(item.created).toLocaleString()}
Modified: ${new Date(item.modified).toLocaleString()}
${item.size ? `Size: ${item.size}` : ''}
    `.trim();
    
    alert(info);
}

function finderSaveFileSystem() {
    localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
}

// --- Settings ---
function changeTheme() {
    document.body.className = document.getElementById('theme-select').value;
}

function saveUsername() {
    const name = document.getElementById('username-input').value.trim();
    if (!name) return alert('Please enter a username.');

    localStorage.setItem('username', name);
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
    if (!desktop) return;
    
    // Add class to desktop for wallpaper styling
    desktop.classList.add('has-wallpaper');
    
    // Set the background image with high-quality rendering
    desktop.style.backgroundImage = `url('${src}')`;
    desktop.style.backgroundSize = 'cover';
    desktop.style.backgroundPosition = 'center';
    desktop.style.backgroundRepeat = 'no-repeat';
    
    // Disable animation for better performance and image clarity
    desktop.style.animation = 'none';
    
    // Hide the gradient overlay (::before pseudo-element) and improve rendering
    let style = document.getElementById('wallpaper-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'wallpaper-style';
        document.head.appendChild(style);
    }
    style.textContent = `
        #desktop.has-wallpaper::before {
            display: none !important;
        }
        #desktop.has-wallpaper {
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
        }
        /* Use an img element for better image rendering quality */
        #desktop-wallpaper-img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            z-index: 0;
            pointer-events: none;
            /* Use high-quality interpolation for photos - auto is best for smooth scaling */
            image-rendering: auto;
            -ms-interpolation-mode: bicubic;
            /* Force hardware acceleration for better performance */
            transform: translateZ(0);
            will-change: transform;
            backface-visibility: hidden;
        }
        /* Ensure desktop content is above wallpaper */
        #desktop > *:not(#desktop-wallpaper-img) {
            position: relative;
            z-index: 1;
        }
    `;
    
    // Create img element for better rendering control (better than CSS background for quality)
    let wallpaperImg = document.getElementById('desktop-wallpaper-img');
    if (!wallpaperImg) {
        wallpaperImg = document.createElement('img');
        wallpaperImg.id = 'desktop-wallpaper-img';
        // Insert at the beginning of desktop so it's behind everything
        desktop.insertBefore(wallpaperImg, desktop.firstChild);
    }
    
    // Preload image for better quality rendering
    const img = new Image();
    img.onload = function() {
        if (wallpaperImg) {
            wallpaperImg.src = src;
            // Remove background image once img element is loaded for cleaner rendering
            desktop.style.backgroundImage = 'none';
        }
    };
    img.onerror = function() {
        // If image fails to load, remove wallpaper styling
        desktop.style.backgroundImage = 'none';
        desktop.classList.remove('has-wallpaper');
    };
    img.src = src;
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
    addTerminalOutput('Mini OS Terminal v1.0');
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
                addTerminalOutput('user@minios:~$');
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
    const savedUser = localStorage.getItem('username') || 'user';
    addTerminalOutput(`${savedUser}@minios:~$ ${command}`);

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
            const savedUser = localStorage.getItem('username') || 'user';
            addTerminalOutput(savedUser);
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
            addTerminalOutput('/home/user');
            break;

        case 'exit':
            closeWindow('terminal');
            break;

        default:
            addTerminalOutput(`Command not found: ${cmd}. Type "help" for available commands.`, 'error');
    }

    addTerminalOutput('');
}

let music = new Audio();
let currentTrack = localStorage.getItem('currentTrack') || 'lofi.mp3';
music.src = currentTrack;
music.volume = parseFloat(localStorage.getItem('musicVolume')) || 0.5;
music.loop = true;

function playMusic() {
    const track = document.getElementById('track-list').value;
    if (track !== currentTrack) {
        currentTrack = track;
        music.src = track;
        localStorage.setItem('currentTrack', track);
    }
    music.play();
}

function pauseMusic() {
    music.pause();
}

document.getElementById('volume-slider').addEventListener('input', e => {
    music.volume = e.target.value;
    localStorage.setItem('musicVolume', e.target.value);
});

// --- Memory Manager ---
function updateMemoryStats() {
    // Simulated memory data
    const totalRAM = 8.0;
    const usedRAM = 3.2 + (Math.random() * 0.5);
    const availableRAM = totalRAM - usedRAM;
    const usagePercent = ((usedRAM / totalRAM) * 100).toFixed(1);

    const totalEl = document.getElementById('total-ram');
    const usedEl = document.getElementById('used-ram');
    const availableEl = document.getElementById('available-ram');
    const usageEl = document.getElementById('ram-usage');
    const progressEl = document.getElementById('ram-progress');

    if (totalEl) totalEl.textContent = `${totalRAM.toFixed(1)} GB`;
    if (usedEl) usedEl.textContent = `${usedRAM.toFixed(1)} GB`;
    if (availableEl) availableEl.textContent = `${availableRAM.toFixed(1)} GB`;
    if (usageEl) usageEl.textContent = `${usagePercent}%`;
    if (progressEl) progressEl.style.width = `${usagePercent}%`;

    // Update process list
    const processList = document.getElementById('memory-process-list');
    if (processList) {
        const processes = [
            { name: 'Mini OS System', memory: '1.2 GB' },
            { name: 'Browser Process', memory: '850 MB' },
            { name: 'File Manager', memory: '320 MB' },
            { name: 'Memory Manager', memory: '180 MB' },
            { name: 'Network Manager', memory: '150 MB' }
        ];
        processList.innerHTML = '';
        processes.forEach(proc => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${proc.name}</span><span>${proc.memory}</span>`;
            processList.appendChild(li);
        });
    }
}

// --- Processor Manager ---
function updateCPUStats() {
    // Simulated CPU data
    const cpuUsage = 20 + (Math.random() * 15);
    const cores = 4;
    const frequency = 2.4;
    const processes = 42 + Math.floor(Math.random() * 10);

    const usageEl = document.getElementById('cpu-usage');
    const coresEl = document.getElementById('cpu-cores');
    const freqEl = document.getElementById('cpu-frequency');
    const procEl = document.getElementById('cpu-processes');
    const progressEl = document.getElementById('cpu-progress');

    if (usageEl) usageEl.textContent = `${cpuUsage.toFixed(1)}%`;
    if (coresEl) coresEl.textContent = cores;
    if (freqEl) freqEl.textContent = `${frequency} GHz`;
    if (procEl) procEl.textContent = processes;
    if (progressEl) progressEl.style.width = `${cpuUsage}%`;

    // Update process list
    const processList = document.getElementById('cpu-process-list');
    if (processList) {
        const cpuProcesses = [
            { name: 'System Idle', usage: '45%' },
            { name: 'Mini OS Kernel', usage: '12%' },
            { name: 'Memory Manager', usage: '8%' },
            { name: 'Network Manager', usage: '5%' },
            { name: 'File Manager', usage: '3%' }
        ];
        processList.innerHTML = '';
        cpuProcesses.forEach(proc => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${proc.name}</span><span>${proc.usage}</span>`;
            processList.appendChild(li);
        });
    }
}

// --- Device Manager ---
function refreshDevices() {
    const deviceList = document.getElementById('device-list');
    if (!deviceList) return;

    const devices = [
        { name: 'Keyboard', status: 'connected', type: 'Input' },
        { name: 'Mouse', status: 'connected', type: 'Input' },
        { name: 'Display', status: 'connected', type: 'Output' },
        { name: 'Audio Output', status: 'connected', type: 'Output' },
        { name: 'USB Drive', status: 'disconnected', type: 'Storage' },
        { name: 'Printer', status: 'disconnected', type: 'Output' }
    ];

    deviceList.innerHTML = '';
    devices.forEach(device => {
        const div = document.createElement('div');
        div.className = 'device-item';
        div.innerHTML = `
            <div class="device-info">
                <div class="device-name">${device.name}</div>
                <div class="device-status ${device.status}">${device.status === 'connected' ? '● Connected' : '○ Disconnected'} - ${device.type}</div>
            </div>
        `;
        deviceList.appendChild(div);
    });
}

// --- Network Manager ---
function updateNetworkStats() {
    // Simulated network data
    const downloadSpeed = (30 + Math.random() * 30).toFixed(1);
    const uploadSpeed = (10 + Math.random() * 10).toFixed(1);
    const dataSent = (2.0 + Math.random() * 1.0).toFixed(1);
    const dataReceived = (8.0 + Math.random() * 2.0).toFixed(1);

    const statusEl = document.getElementById('network-status');
    const dlEl = document.getElementById('download-speed');
    const ulEl = document.getElementById('upload-speed');
    const sentEl = document.getElementById('data-sent');
    const recvEl = document.getElementById('data-received');

    if (statusEl) statusEl.textContent = 'Connected';
    if (dlEl) dlEl.textContent = `${downloadSpeed} Mbps`;
    if (ulEl) ulEl.textContent = `${uploadSpeed} Mbps`;
    if (sentEl) sentEl.textContent = `${dataSent} GB`;
    if (recvEl) recvEl.textContent = `${dataReceived} GB`;

    // Update connections list
    const connectionsList = document.getElementById('network-connections-list');
    if (connectionsList) {
        const connections = [
            '192.168.1.1 - Router (Active)',
            '192.168.1.100 - Local Server (Active)',
            '8.8.8.8 - DNS Server (Active)'
        ];
        connectionsList.innerHTML = '';
        connections.forEach(conn => {
            const li = document.createElement('li');
            li.textContent = conn;
            connectionsList.appendChild(li);
        });
    }
}

// --- Security Manager ---
function runSecurityScan() {
    const scanResults = document.getElementById('scan-results');
    if (!scanResults) return;

    scanResults.textContent = 'Scanning system...';
    scanResults.style.color = 'rgba(255, 255, 255, 0.8)';

    setTimeout(() => {
        scanResults.innerHTML = '✓ Scan complete: No threats detected<br>Scanned: 12,847 files<br>Time: 2.3 seconds';
        scanResults.style.color = 'rgba(34, 197, 94, 0.9)';
    }, 2000);
}

function updateSecurityLogs() {
    const logsList = document.getElementById('security-logs-list');
    if (!logsList) return;

    const logs = [
        '[2025-11-09 15:30:22] Firewall: Allowed connection to 192.168.1.1',
        '[2025-11-09 15:28:15] Security: System scan completed - No threats',
        '[2025-11-09 15:25:10] Firewall: Blocked suspicious connection attempt',
        '[2025-11-09 15:20:05] Security: User authentication successful'
    ];

    logsList.innerHTML = '';
    logs.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        logsList.appendChild(li);
    });
}


