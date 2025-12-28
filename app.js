// ===== MAIN APPLICATION =====

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.querySelector('.menu-toggle');
const navItems = document.querySelectorAll('.nav-item');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');

// Modal Elements
const taskModal = document.getElementById('taskModal');
const deleteModal = document.getElementById('deleteModal');
const taskForm = document.getElementById('taskForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');

// State
let currentView = 'board';
let taskToDelete = null;
let currentMonth = new Date();

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    Storage.initializeSampleData();
    initTheme();
    renderBoard();
    updateStats();
    initEventListeners();
    Charts.init();
});

// ===== THEME MANAGEMENT =====
function initTheme() {
    const savedTheme = localStorage.getItem('taskflow_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
}

themeToggle.addEventListener('change', () => {
    const theme = themeToggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow_theme', theme);
});

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
        });
    });
    
    // Add task button
    addTaskBtn.addEventListener('click', () => openTaskModal());
    
    // Column add buttons
    document.querySelectorAll('.add-task-column').forEach(btn => {
        btn.addEventListener('click', () => {
            openTaskModal(null, btn.dataset.status);
        });
    });
    
    // Modal close
    closeModal.addEventListener('click', closeTaskModal);
    cancelBtn.addEventListener('click', closeTaskModal);
    
    // Delete modal
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDelete').addEventListener('click', confirmDeleteTask);
    
    // Form submit
    taskForm.addEventListener('submit', handleTaskSubmit);
    
    // Search
    searchInput.addEventListener('input', handleSearch);
    
    // Calendar navigation
    document.getElementById('prevMonth')?.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('nextMonth')?.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });
    
    // Close modal on outside click
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeTaskModal();
    });
    
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
    
    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.task-card-menu')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

// ===== VIEW SWITCHING =====
function switchView(view) {
    currentView = view;
    
    // Update nav
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === view);
    });
    
    // Hide all views
    document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
    
    // Show selected view
    const viewId = view + 'View';
    document.getElementById(viewId)?.classList.remove('hidden');
    
    // Render view content
    switch (view) {
        case 'board':
            renderBoard();
            break;
        case 'list':
            renderList();
            break;
        case 'analytics':
            Charts.update();
            break;
        case 'calendar':
            renderCalendar();
            break;
    }
    
    // Close mobile menu
    sidebar.classList.remove('open');
}

// ===== BOARD RENDERING =====
function renderBoard() {
    const statuses = ['todo', 'progress', 'review', 'completed'];
    
    statuses.forEach(status => {
        const container = document.getElementById(`${status}Tasks`);
        const tasks = Storage.getTasksByStatus(status);
        
        container.innerHTML = tasks.map(task => createTaskCard(task)).join('');
        
        // Update column count
        document.getElementById(`${status}ColumnCount`).textContent = tasks.length;
    });
    
    // Initialize drag and drop
    initDragAndDrop();
}

function createTaskCard(task) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
    
    return `
        <div class="task-card" draggable="true" data-id="${task.id}">
            <div class="task-card-header">
                <h4>${escapeHtml(task.title)}</h4>
                <div class="task-card-menu">
                    <button onclick="toggleDropdown(event, '${task.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="dropdown-menu" id="dropdown-${task.id}">
                        <button onclick="editTask('${task.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete" onclick="openDeleteModal('${task.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
            ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
            <div class="task-card-footer">
                <div class="task-tags">
                    <span class="tag ${task.priority}">${task.priority}</span>
                    ${task.tags ? task.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('') : ''}
                </div>
                ${task.dueDate ? `
                    <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(task.dueDate)}
                    </span>
                ` : ''}
            </div>
        </div>
    `;
}

// ===== LIST RENDERING =====
function renderList() {
    const tasks = Storage.getTasks();
    const listBody = document.getElementById('taskList');
    
    listBody.innerHTML = tasks.map(task => `
        <div class="list-item" data-id="${task.id}">
            <div class="list-item-title">${escapeHtml(task.title)}</div>
            <div><span class="priority-badge ${task.priority}">${task.priority}</span></div>
            <div><span class="status-badge ${task.status}">${formatStatus(task.status)}</span></div>
            <div>${task.dueDate ? formatDate(task.dueDate) : '-'}</div>
            <div class="list-actions">
                <button onclick="editTask('${task.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete" onclick="openDeleteModal('${task.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ===== CALENDAR RENDERING =====
function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Update header
    document.getElementById('currentMonth').textContent = 
        currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    const tasks = Storage.getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const isOtherMonth = date.getMonth() !== month;
        const isToday = date.getTime() === today.getTime();
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => t.dueDate === dateStr);
        
        calendarDays.innerHTML += `
            <div class="calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}">
                <span class="day-number">${date.getDate()}</span>
                <div class="task-dots">
                    ${dayTasks.slice(0, 3).map(() => '<span class="task-dot"></span>').join('')}
                </div>
            </div>
        `;
    }
}

// ===== DRAG AND DROP =====
function initDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const containers = document.querySelectorAll('.tasks-container');
    
    taskCards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    containers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.tasks-container').forEach(c => {
        c.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const newStatus = e.currentTarget.closest('.board-column').dataset.status;
    
    Storage.updateTask(taskId, { status: newStatus });
    renderBoard();
    updateStats();
    Charts.update();
    showToast('Task moved successfully!');
}

// ===== MODAL HANDLING =====
function openTaskModal(taskId = null, defaultStatus = 'todo') {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    document.getElementById('taskId').value = '';
    document.getElementById('taskStatus').value = defaultStatus;
    
    if (taskId) {
        const task = Storage.getTaskById(taskId);
        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskTags').value = task.tags ? task.tags.join(', ') : '';
        }
    } else {
        title.textContent = 'Add New Task';
    }
    
    modal.classList.add('show');
}

function closeTaskModal() {
    taskModal.classList.remove('show');
}

function openDeleteModal(taskId) {
    taskToDelete = taskId;
    deleteModal.classList.add('show');
}

function closeDeleteModal() {
    deleteModal.classList.remove('show');
    taskToDelete = null;
}

function confirmDeleteTask() {
    if (taskToDelete) {
        Storage.deleteTask(taskToDelete);
        closeDeleteModal();
        renderBoard();
        renderList();
        updateStats();
        Charts.update();
        showToast('Task deleted successfully!');
    }
}

// ===== FORM HANDLING =====
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskStatus').value,
        dueDate: document.getElementById('taskDueDate').value,
        tags: document.getElementById('taskTags').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t)
    };
    
    if (taskId) {
        Storage.updateTask(taskId, taskData);
        showToast('Task updated successfully!');
    } else {
        Storage.addTask(taskData);
        showToast('Task created successfully!');
    }
    
    closeTaskModal();
    renderBoard();
    renderList();
    updateStats();
    Charts.update();
}

// ===== SEARCH =====
function handleSearch(e) {
    const query = e.target.value.trim();
    
    if (!query) {
        renderBoard();
        return;
    }
    
    const results = Storage.searchTasks(query);
    
    // Clear all columns
    ['todo', 'progress', 'review', 'completed'].forEach(status => {
        const container = document.getElementById(`${status}Tasks`);
        const filteredTasks = results.filter(t => t.status === status);
        container.innerHTML = filteredTasks.map(task => createTaskCard(task)).join('');
    });
    
    initDragAndDrop();
}

// ===== STATS =====
function updateStats() {
    const counts = Storage.getTaskCounts();
    document.getElementById('todoCount').textContent = counts.todo;
    document.getElementById('progressCount').textContent = counts.progress;
    document.getElementById('reviewCount').textContent = counts.review;
    document.getElementById('completedCount').textContent = counts.completed;
}

// ===== UTILITIES =====
function toggleDropdown(e, taskId) {
    e.stopPropagation();
    const dropdown = document.getElementById(`dropdown-${taskId}`);
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== dropdown) menu.classList.remove('show');
    });
    dropdown.classList.toggle('show');
}

function editTask(taskId) {
    openTaskModal(taskId);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatStatus(status) {
    const statusMap = {
        todo: 'To Do',
        progress: 'In Progress',
        review: 'In Review',
        completed: 'Completed'
    };
    return statusMap[status] || status;
}
