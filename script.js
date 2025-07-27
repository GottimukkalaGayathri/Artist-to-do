class ArtistTodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksContainer = document.getElementById('tasksContainer');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        this.taskInput.addEventListener('input', () => {
            if (this.taskInput.value.trim()) {
                this.addTaskBtn.style.transform = 'scale(1.05)';
            } else {
                this.addTaskBtn.style.transform = 'scale(1)';
            }
        });
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            this.shakeInput();
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.taskInput.value = '';
        this.addTaskBtn.style.transform = 'scale(1)';
        this.saveTasks();
        this.render();
        this.showAddAnimation();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            this.showCompleteAnimation(task.completed);
        }
    }

    deleteTask(id) {
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        if (taskElement) {
            taskElement.style.animation = 'taskSlideOut 0.3s ease-out forwards';
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.render();
            }, 300);
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const taskElement = document.querySelector(`[data-id="${id}"] .task-text`);
        const currentText = task.text;
        
        taskElement.innerHTML = `<input type="text" class="edit-input" value="${currentText}" style="
            background: var(--light-green);
            border: 2px solid var(--primary-green);
            border-radius: 10px;
            padding: 8px 12px;
            font-size: 1.1rem;
            font-family: 'Quicksand', sans-serif;
            color: var(--dark-gray);
            width: 100%;
            outline: none;
        ">`;

        const editInput = taskElement.querySelector('.edit-input');
        editInput.focus();
        editInput.select();

        const saveEdit = () => {
            const newText = editInput.value.trim();
            if (newText && newText !== currentText) {
                task.text = newText;
                this.saveTasks();
            }
            this.render();
        };

        editInput.addEventListener('blur', saveEdit);
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
            if (e.key === 'Escape') {
                this.render();
            }
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        this.updateStats();
        this.renderTasks();
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        this.animateNumber(this.totalTasksEl, parseInt(this.totalTasksEl.textContent), total);
        this.animateNumber(this.completedTasksEl, parseInt(this.completedTasksEl.textContent), completed);
        this.animateNumber(this.pendingTasksEl, parseInt(this.pendingTasksEl.textContent), pending);
    }

    animateNumber(element, from, to) {
        const duration = 500;
        const steps = 20;
        const stepValue = (to - from) / steps;
        let current = from;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current += stepValue;
            
            if (step >= steps) {
                element.textContent = to;
                clearInterval(timer);
            } else {
                element.textContent = Math.round(current);
            }
        }, duration / steps);
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🌱</div>
                    <p>${this.getEmptyMessage()}</p>
                    <span>Keep creating amazing things!</span>
                </div>
            `;
            return;
        }

        this.tasksContainer.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox" onclick="app.toggleTask(${task.id})"></div>
                <div class="task-text">${task.text}</div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="app.editTask(${task.id})" title="Edit task">
                        ✏️
                    </button>
                    <button class="task-btn delete-btn" onclick="app.deleteTask(${task.id})" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'completed':
                return 'No completed masterpieces yet!';
            case 'pending':
                return 'All caught up! Time to create more!';
            default:
                return 'Your creative canvas is empty!';
        }
    }

    shakeInput() {
        this.taskInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.taskInput.style.animation = '';
        }, 500);
    }

    showAddAnimation() {
        const sparkles = document.createElement('div');
        sparkles.innerHTML = '✨';
        sparkles.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 2rem;
            pointer-events: none;
            z-index: 1000;
            animation: sparkleUp 1s ease-out forwards;
        `;
        document.body.appendChild(sparkles);
        
        setTimeout(() => {
            sparkles.remove();
        }, 1000);
    }

    showCompleteAnimation(completed) {
        if (completed) {
            const celebration = document.createElement('div');
            celebration.innerHTML = '🎉';
            celebration.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 3rem;
                pointer-events: none;
                z-index: 1000;
                animation: celebrate 0.8s ease-out forwards;
            `;
            document.body.appendChild(celebration);
            
            setTimeout(() => {
                celebration.remove();
            }, 800);
        }
    }

    saveTasks() {
        localStorage.setItem('artistTodoTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('artistTodoTasks');
        return saved ? JSON.parse(saved) : [];
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes sparkleUp {
        0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translateX(-50%) translateY(-50px) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-100px) scale(0.8);
        }
    }
    
    @keyframes celebrate {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.3) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1) rotate(360deg);
        }
    }
    
    @keyframes taskSlideOut {
        0% {
            opacity: 1;
            transform: translateX(0);
            height: auto;
            margin-bottom: 15px;
        }
        50% {
            opacity: 0;
            transform: translateX(100px);
        }
        100% {
            opacity: 0;
            transform: translateX(100px);
            height: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
        }
    }
`;
document.head.appendChild(style);

const app = new ArtistTodoApp();