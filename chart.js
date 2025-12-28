// ===== CHART MANAGEMENT =====

let statusChart = null;
let priorityChart = null;
let weeklyChart = null;

function initCharts() {
    createStatusChart();
    createPriorityChart();
    createWeeklyChart();
}

function updateCharts() {
    updateStatusChart();
    updatePriorityChart();
    updateWeeklyChart();
}

function createStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    const counts = Storage.getTaskCounts();
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['To Do', 'In Progress', 'In Review', 'Completed'],
            datasets: [{
                data: [counts.todo, counts.progress, counts.review, counts.completed],
                backgroundColor: ['#6366f1', '#f59e0b', '#8b5cf6', '#10b981'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function createPriorityChart() {
    const ctx = document.getElementById('priorityChart');
    if (!ctx) return;
    
    const priorities = Storage.getTasksByPriority();
    
    priorityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
                label: 'Tasks',
                data: [priorities.low, priorities.medium, priorities.high],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    },
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-color')
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    
    const weekData = getWeeklyData();
    
    weeklyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weekData.labels,
            datasets: [{
                label: 'Tasks Completed',
                data: weekData.completed,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8
            }, {
                label: 'Tasks Created',
                data: weekData.created,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    },
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-color')
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function getWeeklyData() {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    // Simulated data - in real app, calculate from actual task data
    return {
        labels,
        completed: [2, 1, 3, 2, 4, 1, 2],
        created: [3, 2, 1, 4, 2, 3, 1]
    };
}

function updateStatusChart() {
    if (!statusChart) return;
    const counts = Storage.getTaskCounts();
    statusChart.data.datasets[0].data = [counts.todo, counts.progress, counts.review, counts.completed];
    statusChart.update();
}

function updatePriorityChart() {
    if (!priorityChart) return;
    const priorities = Storage.getTasksByPriority();
    priorityChart.data.datasets[0].data = [priorities.low, priorities.medium, priorities.high];
    priorityChart.update();
}

function updateWeeklyChart() {
    if (!weeklyChart) return;
    weeklyChart.update();
}

// Export functions
window.Charts = {
    init: initCharts,
    update: updateCharts
};
