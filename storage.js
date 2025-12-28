// ===== LOCAL STORAGE MANAGEMENT =====

const STORAGE_KEY = 'taskflow_tasks';

// Get all tasks from storage
function getTasks() {
    const tasks = localStorage.getItem(STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
}

// Save tasks to storage
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Add a new task
function addTask(task) {
    const tasks = getTasks();
    task.id = generateId();
    task.createdAt = new Date().toISOString();
    tasks.push(task);
    saveTasks(tasks);
    return task;
}

// Update a task
function updateTask(id, updatedData) {
    const tasks = getTasks();
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updatedData };
        saveTasks(tasks);
        return tasks[index];
    }
    return null;
}

// Delete a task
function deleteTask(id) {
    const tasks = getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    saveTasks(filteredTasks);
}

// Get task by ID
function getTaskById(id) {
    const tasks = getTasks();
    return tasks.find(task => task.id === id);
}

// Get tasks by status
function getTasksByStatus(status) {
    const tasks = getTasks();
    return tasks.filter(task => task.status === status);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get task counts by status
function getTaskCounts() {
    const tasks = getTasks();
    return {
        todo: tasks.filter(t => t.status === 'todo').length,
        progress: tasks.filter(t => t.status === 'progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        total: tasks.length
    };
}

// Get tasks by priority
function getTasksByPriority() {
    const tasks = getTasks();
    return {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length
    };
}

// Search tasks
function searchTasks(query) {
    const tasks = getTasks();
    const lowerQuery = query.toLowerCase();
    return tasks.filter(task => 
        task.title.toLowerCase().includes(lowerQuery) ||
        (task.description && task.description.toLowerCase().includes(lowerQuery)) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
}

// Initialize with sample data if empty
function initializeSampleData() {
    const tasks = getTasks();
    if (tasks.length === 0) {
        const sampleTasks = [
            {
                id: generateId(),
                title: 'Design Homepage UI',
                description: 'Create wireframes and mockups for the new homepage design',
                priority: 'high',
                status: 'todo',
                dueDate: getFutureDate(3),
                tags: ['design', 'ui'],
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                title: 'Setup Project Repository',
                description: 'Initialize Git repo and setup project structure',
                priority: 'medium',
                status: 'completed',
                dueDate: getFutureDate(-1),
                tags: ['setup'],
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                title: 'Implement Authentication',
                description: 'Add user login and registration functionality',
                priority: 'high',
                status: 'progress',
                dueDate: getFutureDate(5),
                tags: ['backend', 'security'],
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                title: 'Write Documentation',
                description: 'Create README and API documentation',
                priority: 'low',
                status: 'review',
                dueDate: getFutureDate(7),
                tags: ['docs'],
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                title: 'Fix Navigation Bug',
                description: 'Mobile navigation not closing on click',
                priority: 'medium',
                status: 'todo',
                dueDate: getFutureDate(2),
                tags: ['bug', 'mobile'],
                createdAt: new Date().toISOString()
            }
        ];
        saveTasks(sampleTasks);
    }
}

function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// Export functions for use in other files
window.Storage = {
    getTasks,
    saveTasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksByStatus,
    getTaskCounts,
    getTasksByPriority,
    searchTasks,
    initializeSampleData
};
