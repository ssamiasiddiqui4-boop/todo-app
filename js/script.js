(() => {
  'use strict';

  const STORAGE_KEY = 'taskflow-tasks-v1';

  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const formError = document.getElementById('form-error');
  const list = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  const statsEl = document.getElementById('stats');
  const subtitleEl = document.getElementById('subtitle');
  const remainingEl = document.getElementById('remaining');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const template = document.getElementById('task-item-template');

  let tasks = [];
  let currentFilter = 'all';

  /* ------------------------------------------------------------
     Local Storage persistence
     ------------------------------------------------------------ */
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (e) { /* storage unavailable */ }
  };

  const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* ------------------------------------------------------------
     Rendering
     ------------------------------------------------------------ */
  const visibleTasks = () => {
    if (currentFilter === 'active') return tasks.filter((t) => !t.done);
    if (currentFilter === 'completed') return tasks.filter((t) => t.done);
    return tasks;
  };

  const render = () => {
    list.innerHTML = '';
    const items = visibleTasks();

    emptyState.hidden = tasks.length > 0;
    emptyState.textContent = tasks.length === 0
      ? "Nothing here yet. Add your first task above."
      : "No tasks match this filter.";
    emptyState.hidden = items.length > 0;

    items.forEach((task) => {
      const node = template.content.firstElementChild.cloneNode(true);
      node.dataset.id = task.id;
      node.classList.toggle('completed', task.done);

      const checkbox = node.querySelector('.task-checkbox');
      checkbox.checked = task.done;

      const textEl = node.querySelector('.task-text');
      textEl.textContent = task.text;

      list.appendChild(node);
    });

    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const left = total - done;

    statsEl.textContent = total === 1 ? '1 task' : total + ' tasks';
    remainingEl.textContent = left === 1 ? '1 task left' : left + ' tasks left';
    subtitleEl.textContent = total === 0
      ? 'Add something you need to get done.'
      : left === 0
        ? 'All done. Nice work.'
        : 'Stay focused on what matters today.';
    clearCompletedBtn.hidden = done === 0;
  };

  /* ------------------------------------------------------------
     Mutations
     ------------------------------------------------------------ */
  const addTask = (text) => {
    tasks.unshift({ id: makeId(), text, done: false, createdAt: Date.now() });
    save();
    render();
  };

  const removeTask = (id) => {
    tasks = tasks.filter((t) => t.id !== id);
    save();
    render();
  };

  const toggleTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) task.done = !task.done;
    save();
    render();
  };

  const renameTask = (id, text) => {
    const task = tasks.find((t) => t.id === id);
    if (task && text.trim()) task.text = text.trim();
    save();
    render();
  };

  const clearCompleted = () => {
    tasks = tasks.filter((t) => !t.done);
    save();
    render();
  };

  /* ------------------------------------------------------------
     Form: add a task
     ------------------------------------------------------------ */
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();

    if (!value) {
      formError.textContent = 'Type a task before adding it.';
      input.focus();
      return;
    }
    if (value.length > 120) {
      formError.textContent = 'Keep tasks under 120 characters.';
      return;
    }

    formError.textContent = '';
    addTask(value);
    input.value = '';
    input.focus();
  });

  input.addEventListener('input', () => { if (formError.textContent) formError.textContent = ''; });

  /* ------------------------------------------------------------
     List: delegated events for checkbox, delete, edit
     ------------------------------------------------------------ */
  list.addEventListener('click', (event) => {
    const item = event.target.closest('.task');
    if (!item) return;
    const id = item.dataset.id;

    if (event.target.closest('.delete-btn')) {
      item.classList.add('removing');
      item.addEventListener('transitionend', () => removeTask(id), { once: true });
      // Fallback in case the transition event doesn't fire (e.g. reduced motion).
      setTimeout(() => { if (document.body.contains(item)) removeTask(id); }, 300);
      return;
    }

    if (event.target.closest('.edit-btn')) {
      startEdit(item, id);
    }
  });

  list.addEventListener('change', (event) => {
    if (event.target.classList.contains('task-checkbox')) {
      const item = event.target.closest('.task');
      toggleTask(item.dataset.id);
    }
  });

  list.addEventListener('dblclick', (event) => {
    const textEl = event.target.closest('.task-text');
    if (!textEl) return;
    const item = textEl.closest('.task');
    startEdit(item, item.dataset.id);
  });

  const startEdit = (item, id) => {
    const textEl = item.querySelector('.task-text');
    const editInput = item.querySelector('.task-edit-input');

    editInput.value = textEl.textContent;
    textEl.hidden = true;
    editInput.hidden = false;
    editInput.focus();
    editInput.select();

    const finish = (commit) => {
      editInput.removeEventListener('blur', onBlur);
      editInput.removeEventListener('keydown', onKey);
      if (commit) renameTask(id, editInput.value);
      else { textEl.hidden = false; editInput.hidden = true; }
    };
    const onBlur = () => finish(true);
    const onKey = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    };

    editInput.addEventListener('blur', onBlur);
    editInput.addEventListener('keydown', onKey);
  };

  /* ------------------------------------------------------------
     Filters and clear-completed
     ------------------------------------------------------------ */
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.toggle('active', b === btn));
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  /* ------------------------------------------------------------
     Init
     ------------------------------------------------------------ */
  tasks = load();
  render();

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
