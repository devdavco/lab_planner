// Punto de entrada: conecta los datos, la validación y la interfaz.
import { TaskManager } from './TaskManager.js';
import { validateTaskForm, clearFieldErrorIfValid, clearAllFieldErrors } from './validation.js';
import { renderTaskList } from './ui.js';
import { addDays, toInputDateValue } from './dateUtils.js';

const taskManager = new TaskManager();
const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const dateInput = document.getElementById('targetDate');
const quickDateButtons = document.getElementById('quickDateButtons');
const modalElement = document.getElementById('taskModal');
const nameInput = document.getElementById('taskName');
const newTaskButton = document.getElementById('newTaskButton');

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

// bootstrap es global: su script se carga antes que los módulos, que esperan a que termine el HTML.
function closeTaskModal() {
  bootstrap.Modal.getOrCreateInstance(modalElement).hide();
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (validateTaskForm() === false) {
    return;
  }
  taskManager.addTask(readTaskFromForm());
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

// Se quitan los errores pero no lo escrito. Bootstrap devuelve el foco al botón que abrió el modal,
// pero esa devolución ocurre después de este evento. Con setTimeout 0 se espera a que termine,
// y solo si el foco quedó en body (el botón del estado vacío ya está oculto) va al botón del encabezado.
function handleModalHidden() {
  clearAllFieldErrors();
  setTimeout(function () {
    if (document.activeElement === document.body) {
      newTaskButton.focus();
    }
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
