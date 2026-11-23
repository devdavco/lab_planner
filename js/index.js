// Punto de entrada: conecta los datos, la validación y la interfaz.
import { TaskManager } from './TaskManager.js';
import { validateTaskForm, clearFieldErrorIfValid, clearAllFieldErrors } from './validation.js';
import { renderTaskList } from './ui.js';
import { addDays, toInputDateValue, getDatePart } from './dateUtils.js';

const taskManager = new TaskManager();
const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const dateInput = document.getElementById('targetDate');
const quickDateButtons = document.getElementById('quickDateButtons');
const modalElement = document.getElementById('taskModal');
const nameInput = document.getElementById('taskName');
const newTaskButton = document.getElementById('newTaskButton');
const modalTitle = document.getElementById('taskModalLabel');
const submitButton = document.getElementById('submitTaskButton');

// Los textos del modal viven aquí para cambiarlos desde un solo lugar.
const MODAL_TEXTS = {
  create: { title: 'Nueva tarea', button: 'Agregar tarea' },
  edit: { title: 'Editar tarea', button: 'Guardar cambios' },
};

// null significa que el formulario está creando; con un id, está editando esa tarea.
let editingTaskId = null;

function readTaskFromForm() {
  return {
    nombre: document.getElementById('taskName').value.trim(),
    descripcion: document.getElementById('taskDescription').value.trim(),
    asignadoA: document.getElementById('assignedTo').value.trim(),
    fechaDeEntrega: document.getElementById('targetDate').value,
    estado: document.getElementById('taskStatus').value,
    prioridad: document.getElementById('taskPriority').value,
  };
}

function findTaskById(taskId) {
  return taskManager.getAllTasks().find(function (task) { return task.id === taskId; });
}

function toggleDone(task) {
  if (task.estado === 'HECHO') {
    taskManager.unmarkTaskAsDone(task.id);
  } else {
    taskManager.markTaskAsDone(task.id);
  }
}

function setModalMode(mode) {
  modalTitle.textContent = MODAL_TEXTS[mode].title;
  submitButton.textContent = MODAL_TEXTS[mode].button;
}

function fillFormWithTask(task) {
  document.getElementById('taskName').value = task.nombre;
  document.getElementById('taskDescription').value = task.descripcion;
  document.getElementById('assignedTo').value = task.asignadoA;
  // Las tareas antiguas guardan fecha y hora; un input type="date" solo acepta AAAA-MM-DD.
  document.getElementById('targetDate').value = getDatePart(task.fechaDeEntrega);
  document.getElementById('taskStatus').value = task.estado;
  document.getElementById('taskPriority').value = task.prioridad;
}

// bootstrap es global: su script se carga antes que los módulos, que esperan a que termine el HTML.
function showTaskModal() {
  bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

function closeTaskModal() {
  bootstrap.Modal.getOrCreateInstance(modalElement).hide();
}

function openEditModal(task) {
  fillFormWithTask(task);
  editingTaskId = task.id;
  setModalMode('edit');
  showTaskModal();
}

// Vuelve el modal a su estado normal para que el siguiente "Nueva tarea" empiece limpio.
function leaveEditMode() {
  form.reset();
  editingTaskId = null;
  setModalMode('create');
}

// Al editar o crear se pasan los mismos seis campos; solo cambia qué método los recibe.
function saveTaskFromForm() {
  const taskData = readTaskFromForm();
  if (editingTaskId !== null) {
    taskManager.editTask(editingTaskId, taskData);
  } else {
    taskManager.addTask(taskData);
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (validateTaskForm() === false) {
    return;
  }
  saveTaskFromForm();
  renderTaskList(taskManager.getAllTasks());
  taskManager.save();
  form.reset();
  closeTaskModal();
}

function handleTaskListClick(event) {
  const actionElement = event.target.closest('[data-action]');
  const cardElement = event.target.closest('[data-id]');
  // Un clic fuera de un botón no debe hacer nada.
  if (actionElement === null || cardElement === null) {
    return;
  }

  // dataset siempre devuelve texto; hay que pasarlo a número para comparar con task.id.
  const taskId = Number(cardElement.dataset.id);
  const action = actionElement.dataset.action;

  // Editar solo abre el formulario: no cambia datos, así que no renderiza ni guarda.
  if (action === 'edit') {
    const taskToEdit = findTaskById(taskId);
    if (taskToEdit === undefined) {
      return;
    }
    openEditModal(taskToEdit);
    return;
  }

  if (action === 'delete') {
    taskManager.deleteTask(taskId);
  } else if (action === 'toggle-done') {
    const task = findTaskById(taskId);
    if (task === undefined) {
      return;
    }
    toggleDone(task);
  } else {
    return;
  }

  renderTaskList(taskManager.getAllTasks());
  taskManager.save();
}

// Escuchar en el formulario cubre todos los campos con un solo listener por evento.
// 'change' hace falta para los select y la fecha, que no siempre disparan 'input'.
function handleFieldEdit(event) {
  clearFieldErrorIfValid(event.target);
}

function handleQuickDateClick(event) {
  const button = event.target.closest('[data-days]');
  if (button === null) {
    return;
  }
  const days = Number(button.dataset.days);
  dateInput.value = toInputDateValue(addDays(new Date(), days));
  // Cambiar value desde código no dispara 'input' ni 'change', así que el error se limpia aquí.
  clearFieldErrorIfValid(dateInput);
}

// Bootstrap enfoca el modal, no su primer campo; se enfoca Nombre para poder escribir de inmediato.
function handleModalShown() {
  nameInput.focus();
}

// El render reemplaza todas las tarjetas, así que el botón Editar se busca de nuevo por data-id.
function findEditButton(taskId) {
  if (taskId === null) {
    return null;
  }
  return taskList.querySelector('[data-id="' + taskId + '"] [data-action="edit"]');
}

function focusAfterModalClosed(editedTaskId) {
  const editButton = findEditButton(editedTaskId);
  if (editButton !== null) {
    editButton.focus();
    return;
  }
  // Respaldo: si el foco se perdió en body, va al botón del encabezado.
  if (document.activeElement === document.body) {
    newTaskButton.focus();
  }
}

// Se quitan los errores. En modo crear se conserva lo escrito; en modo edición se descarta,
// porque ese texto pertenece a otra tarea y no debe aparecer en "Nueva tarea".
// Bootstrap devuelve el foco al botón que abrió el modal, pero esa devolución ocurre después de
// este evento; con setTimeout 0 se espera a que termine para no pelear con él por el foco.
function handleModalHidden() {
  clearAllFieldErrors();
  const editedTaskId = editingTaskId;
  if (editedTaskId !== null) {
    leaveEditMode();
  }
  setTimeout(function () {
    focusAfterModalClosed(editedTaskId);
  }, 0);
}

form.addEventListener('submit', handleFormSubmit);
modalElement.addEventListener('shown.bs.modal', handleModalShown);
modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
form.addEventListener('input', handleFieldEdit);
form.addEventListener('change', handleFieldEdit);
quickDateButtons.addEventListener('click', handleQuickDateClick);
taskList.addEventListener('click', handleTaskListClick);
// Primero se cargan los datos guardados y después se pinta, para no mostrar la lista vacía.
taskManager.load();
renderTaskList(taskManager.getAllTasks());
