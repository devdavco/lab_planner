const taskManager = new TaskManager();

const form = document.getElementById('taskForm');
const formErrors = document.getElementById('formErrors');
const taskList = document.getElementById('taskList');
const emptyTasksMessage = document.getElementById('emptyTasksMessage');

function validateTaskForm() {
  const nombre = document.getElementById('taskName').value.trim();
  const descripcion = document.getElementById('taskDescription').value.trim();
  const asignadoA = document.getElementById('assignedTo').value.trim();
  const fechaDeEntrega = document.getElementById('targetDate').value;
  const estado = document.getElementById('taskStatus').value;

  let errores = [];

  if (nombre === '') {
    errores.push('Nombre: campo es obligatorio.');
  }else if( !isNaN(nombre)){
      errores.push('Asignado a: no puede ser numérico.');
  } else if (nombre.length <= 8) {
    errores.push('Nombre: debe tener más de 8 caracteres.');
  } 

  if (descripcion === '') {
    errores.push('Descripción: este campo es obligatorio.');
  } else if (descripcion.length <= 15) {
    errores.push('Descripción: debe tener más de 15 caracteres.');
  }

  if (asignadoA === '') {
    errores.push('Asignado a: este campo es obligatorio.');
  }else if( !isNaN(asignadoA)){
      errores.push('Asignado a: no puede ser numérico.');
  }else if (asignadoA.length <= 4) {
    errores.push('Asignado a: debe tener más de 4 caracteres.');
  }

  if (fechaDeEntrega === '') {
    errores.push('Fecha de entrega: elige una fecha y hora.');
  }

  if (estado === '') {
    errores.push('Estado: selecciona un estado.');
  }

  if (errores.length > 0) {
    formErrors.innerHTML = errores.join('<br>');
    formErrors.classList.remove('d-none');
    return false;
  }

  formErrors.innerHTML = '';
  formErrors.classList.add('d-none');
  return true;
}

function createTaskCard(task) {
  const card = document.createElement('article');
  card.className = 'card shadow-sm';

  const body = document.createElement('div');
  body.className = 'card-body';

  const titulo = document.createElement('h3');
  titulo.className = 'card-title h5';
  titulo.textContent = task.nombre;

  const descripcion = document.createElement('p');
  descripcion.textContent = task.descripcion;

  const asignado = document.createElement('p');
  asignado.className = 'mb-1 small';
  asignado.textContent = 'Asignado a: ' + task.asignadoA;

  const fecha = document.createElement('p');
  fecha.className = 'mb-1 small';
  fecha.textContent = 'Fecha de entrega: ' + task.fechaDeEntrega.replace('T', ' ');

  const estado = document.createElement('p');
  estado.className = 'mb-1 small';
  estado.textContent = 'Estado: ' + task.estado;

  const prioridad = document.createElement('p');
  prioridad.className = 'mb-3 small';
  prioridad.textContent = 'Prioridad: ' + task.prioridad;

  const botonEliminar = document.createElement('button');
  botonEliminar.type = 'button';
  botonEliminar.className = 'btn btn-outline-danger btn-sm';
  botonEliminar.textContent = 'Eliminar';

  botonEliminar.addEventListener('click', function () {
    taskManager.deleteTask(task.id);
    card.remove();
    updateEmptyMessage();
  });

  body.appendChild(titulo);
  body.appendChild(descripcion);
  body.appendChild(asignado);
  body.appendChild(fecha);
  body.appendChild(estado);
  body.appendChild(prioridad);
  body.appendChild(botonEliminar);
  card.appendChild(body);

  return card;
}

function updateEmptyMessage() {
  if (taskManager.getAllTasks().length === 0) {
    emptyTasksMessage.classList.remove('d-none');
  } else {
    emptyTasksMessage.classList.add('d-none');
  }
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  if (validateTaskForm() === false) {
    return;
  }

  const task = {
    nombre: document.getElementById('taskName').value.trim(),
    descripcion: document.getElementById('taskDescription').value.trim(),
    asignadoA: document.getElementById('assignedTo').value.trim(),
    fechaDeEntrega: document.getElementById('targetDate').value,
    estado: document.getElementById('taskStatus').value,
    prioridad: document.getElementById('taskPriority').value,
  };

  taskManager.addTask(task);

  const card = createTaskCard(task);
  taskList.appendChild(card);
  updateEmptyMessage();

  form.reset();
});
