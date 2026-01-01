'use strict';

// * Selectors
const root = document.querySelector('html');
const inputBox = document.getElementById('taskInput');
const btnAdd = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const btnAll = document.querySelector('.btn--all');
const btnActive = document.querySelector('.btn--active');
const btnCompleted = document.querySelector('.btn--completed');
const btnClearComplete = document.querySelector('.btn--clear-complete');
const taskCount = document.querySelector('.task-list__total-count');
const btnToggle = document.querySelector('.btn--toggle');
const toggleIcon = document.querySelector('.toggle-icon');
const header = document.querySelector('.header');
const headerImage = document.querySelector('.header__image');
const filterEl = document.querySelector('.filters');
const btnFilters = document.querySelectorAll(
  '.btn--all, .btn--active, .btn--completed'
);

// * current filter
let currentFilter = 'all';

// * tasks array
let tasks = [];

function changeImage() {
  const theme = loadTheme();
  const device = window.innerWidth >= 376 ? 'desktop' : 'mobile';
  headerImage.src = `./src/assets/images/bg-${device}-${theme}.jpg`;
}

window.addEventListener('resize', changeImage);

// * save theme
function saveTheme(theme, icon) {
  localStorage.setItem('theme', JSON.stringify(theme));
  localStorage.setItem('icon', JSON.stringify(icon));
}

// * toggle theme
function toggleTheme() {
  toggleIcon.classList.toggle('theme-dark');

  const toggleIconImage = toggleIcon.classList.contains('theme-dark')
    ? 'sun'
    : 'moon';
  toggleIcon.src = `./src/assets/images/icon-${toggleIconImage}.svg`;

  const theme = toggleIcon.classList.contains('theme-dark') ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  saveTheme(theme, toggleIconImage);
  changeImage();
}

btnToggle.addEventListener('click', toggleTheme);

// * load theme
function loadTheme() {
  const theme = JSON.parse(localStorage.getItem('theme')) || 'dark';
  const icon = JSON.parse(localStorage.getItem('icon')) || 'sun';
  toggleIcon.src = `./src/assets/images/icon-${icon}.svg`;
  theme === 'dark'
    ? toggleIcon.classList.add('theme-dark')
    : toggleIcon.classList.remove('theme-dark');
  root.setAttribute('data-theme', theme);
  return theme;
}

// * save tasks
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// * render tasks
function renderTasks(filter = 'all') {
  taskList.textContent = '';

  const filtered = tasks.filter(task => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  filtered.forEach(task => {
    const taskHTML = `
    <li class="${task.isCompleted ? 'task completed' : 'task'}" data-id="${
      task.id
    }" draggable="true">
        <button type="button" class="btn btn--complete-task">✔</button>
        <p class="task-description">${task.task}</p>
        <button type="button" class="btn btn--delete-task">
          <img src="./src/assets/images/icon-cross.svg"/>
        </button>
    </li>`;
    taskList.insertAdjacentHTML('afterbegin', taskHTML);
  });
  const itemCount = tasks.length;
  const text = itemCount > 0 ? 'Items' : 'Item';
  taskCount.textContent = `${itemCount} ${text} left`;
}

// * load tasks
function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(...savedTasks);
  taskList.textContent = '';
  renderTasks(tasks);
}

function addItems() {
  const task = inputBox.value;
  if (!task) alert('Please specify the task!');
  else {
    tasks.push({
      id: Date.now(),
      task,
      isCompleted: false,
    });
    saveTasks();
    renderTasks(currentFilter);
    inputBox.value = '';
  }
}

// * Add Items
btnAdd.addEventListener('click', addItems);
window.addEventListener('keydown', function (e) {
  if (document.activeElement === inputBox) {
    if (e.key === 'Enter') {
      addItems();
    }
  }
});

// * Complete task
function toggleComplete(e) {
  e.preventDefault();
  const completeBtn = e.target.closest('.btn--complete-task');
  if (!completeBtn) return;
  const item = completeBtn.parentElement;
  const taskDescription = item.querySelector('.task-description');
  const itemID = Number(item.dataset.id);
  const findTask = tasks.find(task => task.id === itemID);
  findTask.isCompleted = !findTask.isCompleted;
  findTask.isCompleted
    ? taskDescription.classList.add('completed')
    : taskDescription.classList.remove('completed');
  saveTasks();
  renderTasks(currentFilter);
}

// * Delete Task
function deleteTask(e) {
  const btnDelete = e.target.closest('.btn--delete-task');
  if (!btnDelete) return;
  console.log(btnDelete);
  const item = btnDelete.parentElement;
  const itemID = Number(item.dataset.id);
  tasks = tasks.filter(task => task.id !== itemID);
  saveTasks();
  renderTasks(currentFilter);
}

taskList.addEventListener('click', e => toggleComplete(e));
taskList.addEventListener('click', e => deleteTask(e));

// * Filtering system
filterEl.addEventListener('click', function (e) {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  currentFilter = btn.textContent.trim().toLowerCase();
  btnFilters.forEach(b => b.classList.remove('filter-active'));
  btn.classList.add('filter-active');
  renderTasks(currentFilter);
});

// * Clear Completed tasks
btnClearComplete.addEventListener('click', function () {
  tasks = tasks.filter(task => !task.isCompleted);
  saveTasks();
  renderTasks(currentFilter);
});

// * Drag and Drop Functionality
let dragged = null;
taskList.addEventListener('dragstart', e => {
  dragged = e.target; // store the dragged element
});

taskList.addEventListener('dragover', e => {
  e.preventDefault(); // allow drop
  const task = e.target.closest('.task');
  if (!task || task === dragged) return;
  task.classList.add('drag-over');
});

taskList.addEventListener('dragleave', e => {
  const task = e.target.closest('.task');
  if (task) task.classList.remove('drag-over');
});

taskList.addEventListener('drop', e => {
  e.preventDefault();
  const task = e.target.closest('.task');
  if (!task || task === dragged) return;
  const rect = task.getBoundingClientRect();
  const after = e.clientY > rect.top + rect.height / 2;
  const draggedId = Number(dragged.dataset.id);
  let draggedIndex = tasks.findIndex(task => task.id === draggedId);
  const draggedTask = tasks.splice(draggedIndex, 1)[0]; // remove and get the object
  const targetId = Number(task.dataset.id);
  let targetIndex = tasks.findIndex(t => t.id === targetId);
  if (after) draggedIndex += 1;
  tasks.splice(targetIndex, 0, draggedTask); // insert object at new position
  task.classList.remove('drag-over');

  if (after) {
    taskList.insertBefore(dragged, task.nextSibling);
  } else {
    taskList.insertBefore(dragged, task);
  }
  saveTasks();
});

loadTasks();
loadTheme();
changeImage();
