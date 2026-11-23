// Todo lo que se dibuja en pantalla. No modifica datos ni registra eventos.
import { formatDueDate } from './dateUtils.js';

const taskList = document.getElementById('taskList');
const emptyTasksMessage = document.getElementById('emptyTasksMessage');
const countTotal = document.getElementById('countTotal');
const countPending = document.getElementById('countPending');
const countDone = document.getElementById('countDone');

// Un objeto de mapeo es más fácil de leer y ampliar que una cadena de if/else.
const STATUS_BADGE_CLASSES = {
  'POR HACER': 'text-bg-secondary',
  'EN PROCESO': 'text-bg-primary',
  'REVISIÓN': 'text-bg-warning',
  'HECHO': 'text-bg-success',
};

// borderColor pinta el borde izquierdo; textClass usa las variantes "emphasis"
// porque text-warning sobre blanco no cumple el contraste AA.
const PRIORITY_STYLES = {
  Urgente: { borderColor: 'var(--bs-danger)', textClass: 'text-danger-emphasis' },
  Importante: { borderColor: 'var(--bs-warning)', textClass: 'text-warning-emphasis' },
  Media: { borderColor: 'var(--bs-info)', textClass: 'text-info-emphasis' },
  Baja: { borderColor: 'var(--bs-secondary)', textClass: 'text-secondary-emphasis' },
};

// Valores de respaldo por si llega un dato inesperado, para no romper el render.
const DEFAULT_BADGE_CLASS = 'text-bg-secondary';
const DEFAULT_PRIORITY_STYLE = PRIORITY_STYLES.Baja;

function isDone(task) {
  return task.estado === 'HECHO';
}

function getPriorityStyle(task) {
  return PRIORITY_STYLES[task.prioridad] || DEFAULT_PRIORITY_STYLE;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function createStatusBadge(task) {
  const badgeClass = STATUS_BADGE_CLASSES[task.estado] || DEFAULT_BADGE_CLASS;
  return createElement('span', 'badge ' + badgeClass, task.estado);
}

function createCardHeader(task) {
  const header = createElement('div', 'd-flex justify-content-between align-items-start gap-2 mb-1');
  const title = createElement('h3', 'card-title h5 mb-0 text-break', task.nombre);
  if (isDone(task)) {
    title.classList.add('text-decoration-line-through');
  }
  header.appendChild(title);
  header.appendChild(createStatusBadge(task));
  return header;
}

// La prioridad se muestra también como texto: el color solo no basta para todas las personas.
function createPriorityText(task) {
  const priorityStyle = getPriorityStyle(task);
  return createElement('p', 'small fw-semibold mb-2 ' + priorityStyle.textClass, 'Prioridad: ' + task.prioridad);
}

function createMetadataItem(label, value) {
  const item = createElement('li');
  item.appendChild(createElement('span', 'fw-semibold', label + ': '));
  item.appendChild(document.createTextNode(value));
  return item;
}

// Color de texto normal (no text-body-secondary) para mantener buen contraste también en tareas hechas.
function createMetadata(task) {
  const list = createElement('ul', 'list-unstyled small mb-3');
  list.appendChild(createMetadataItem('Asignado a', task.asignadoA));
  list.appendChild(createMetadataItem('Fecha de entrega', formatDueDate(task.fechaDeEntrega)));
  return list;
}

// data-action permite que index.js distinga los botones con un solo listener.
// El aria-label empieza con el texto visible y agrega el nombre para que cada botón sea único.
function createActionButton(text, ariaLabelPrefix, className, action, task) {
  const button = createElement('button', className, text);
  button.type = 'button';
  button.dataset.action = action;
  button.setAttribute('aria-label', ariaLabelPrefix + ': ' + task.nombre);
  return button;
}

function createDoneButton(task) {
  if (isDone(task)) {
    return createActionButton('Desmarcar', 'Desmarcar tarea', 'btn btn-outline-secondary btn-sm', 'toggle-done', task);
  }
  return createActionButton('Marcar como hecha', 'Marcar como hecha', 'btn btn-outline-success btn-sm', 'toggle-done', task);
}

function createCardActions(task) {
  const actions = createElement('div', 'd-flex flex-wrap justify-content-end gap-2');
  actions.appendChild(createDoneButton(task));
  actions.appendChild(createActionButton('Eliminar', 'Eliminar tarea', 'btn btn-outline-danger btn-sm', 'delete', task));
  return actions;
}

export function createTaskCard(task) {
  const card = createElement('article', 'card shadow-sm task-card');
  // El id en la tarjeta permite saber a qué tarea pertenece un clic.
  card.dataset.id = task.id;
  // La variable CSS la usa styles.css para pintar el borde izquierdo.
  card.style.setProperty('--task-priority-color', getPriorityStyle(task).borderColor);
  if (isDone(task)) {
    card.classList.add('bg-body-tertiary');
  }

  const body = createElement('div', 'card-body');
  body.appendChild(createCardHeader(task));
  body.appendChild(createPriorityText(task));
  body.appendChild(createElement('p', 'mb-2 text-break', task.descripcion));
  body.appendChild(createMetadata(task));
  body.appendChild(createCardActions(task));
  card.appendChild(body);
  return card;
}

function updateEmptyMessage(tasks) {
  if (tasks.length === 0) {
    emptyTasksMessage.classList.remove('d-none');
  } else {
    emptyTasksMessage.classList.add('d-none');
  }
}

function updateSummary(tasks) {
  const doneCount = tasks.filter(isDone).length;
  countTotal.textContent = tasks.length;
  countPending.textContent = tasks.length - doneCount;
  countDone.textContent = doneCount;
}

// Las tareas hechas van al final para que las pendientes se vean primero.
function sortPendingFirst(tasks) {
  const pendientes = tasks.filter(function (task) { return !isDone(task); });
  const hechas = tasks.filter(isDone);
  return pendientes.concat(hechas);
}

// Único punto donde se pinta la lista: siempre se vacía y se dibuja de nuevo.
export function renderTaskList(tasks) {
  taskList.innerHTML = '';
  sortPendingFirst(tasks).forEach(function (task) {
    taskList.appendChild(createTaskCard(task));
  });
  updateEmptyMessage(tasks);
  updateSummary(tasks);
}
