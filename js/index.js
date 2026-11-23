// Punto de entrada: conecta los datos, la validación y la interfaz.
import { TaskManager } from './TaskManager.js';
import { validateTaskForm, clearFieldErrorIfValid } from './validation.js';
import { renderTaskList } from './ui.js';
import { addDays, toInputDateValue } from './dateUtils.js';

const taskManager = new TaskManager();
const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const dateInput = document.getElementById('targetDate');
const quickDateButtons = document.getElementById('quickDateButtons');

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

function handleFormSubmit(event) {
  event.preventDefault();
  if (validateTaskForm() === false) {
    return;
  }
  taskManager.addTask(readTaskFromForm());
  renderTaskList(taskManager.getAllTasks());
  taskManager.save();
  form.reset();
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
form.addEventListener('submit', handleFormSubmit);
form.addEventListener('input', handleFieldEdit);
form.addEventListener('change', handleFieldEdit);
quickDateButtons.addEventListener('click', handleQuickDateClick);
taskList.addEventListener('click', handleTaskListClick);
// Primero se cargan los datos guardados y después se pinta, para no mostrar la lista vacía.
taskManager.load();
renderTaskList(taskManager.getAllTasks());
