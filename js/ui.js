// Todo lo que se dibuja en pantalla. No modifica datos ni registra eventos.

const taskList = document.getElementById('taskList');
const emptyTasksMessage = document.getElementById('emptyTasksMessage');

function createParagraph(text, className) {
  const paragraph = document.createElement('p');
  if (className) {
    paragraph.className = className;
  }
  paragraph.textContent = text;
  return paragraph;
}

// Los botones llevan data-action para que index.js los distinga con un solo listener.
function createButton(text, className, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.dataset.action = action;
  return button;
}

function createDoneButton(task) {
  if (task.estado === 'HECHO') {
    return createButton('Desmarcar', 'btn btn-outline-secondary btn-sm me-2', 'toggle-done');
  }
  return createButton('Marcar como hecha', 'btn btn-outline-success btn-sm me-2', 'toggle-done');
}

export function createTaskCard(task) {
  const card = document.createElement('article');
  card.className = 'card shadow-sm';
  // El id en la tarjeta permite saber a qué tarea pertenece un clic.
  card.dataset.id = task.id;

  const body = document.createElement('div');
  body.className = 'card-body';

  const titulo = document.createElement('h3');
  titulo.className = 'card-title h5';
  titulo.textContent = task.nombre;
  if (task.estado === 'HECHO') {
    titulo.classList.add('text-decoration-line-through');
  }

  const botones = document.createElement('div');
  botones.appendChild(createDoneButton(task));
  botones.appendChild(createButton('Eliminar', 'btn btn-outline-danger btn-sm', 'delete'));

  body.appendChild(titulo);
  body.appendChild(createParagraph(task.descripcion));
  body.appendChild(createParagraph('Asignado a: ' + task.asignadoA, 'mb-1 small'));
  body.appendChild(createParagraph('Fecha de entrega: ' + task.fechaDeEntrega.replace('T', ' '), 'mb-1 small'));
  body.appendChild(createParagraph('Estado: ' + task.estado, 'mb-1 small'));
  body.appendChild(createParagraph('Prioridad: ' + task.prioridad, 'mb-3 small'));
  body.appendChild(botones);
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

// Las tareas hechas van al final para que las pendientes se vean primero.
function sortPendingFirst(tasks) {
  const pendientes = tasks.filter(function (task) { return task.estado !== 'HECHO'; });
  const hechas = tasks.filter(function (task) { return task.estado === 'HECHO'; });
  return pendientes.concat(hechas);
}

// Único punto donde se pinta la lista: siempre se vacía y se dibuja de nuevo.
export function renderTaskList(tasks) {
  taskList.innerHTML = '';
  sortPendingFirst(tasks).forEach(function (task) {
    taskList.appendChild(createTaskCard(task));
  });
  updateEmptyMessage(tasks);
}
