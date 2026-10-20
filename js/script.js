
class TaskManager {
  // El constructor se ejecuta al hacer `new TaskManager()`.
  constructor() {
    // Array interno donde se guardan todas las tareas.
    this.tasks = [];
    // Contador para generar IDs enteros únicos: 1, 2, 3...
    this.currentId = 0;
  }

  // Devuelve todas las tareas.
  getAllTasks() {
    return this.tasks;
  }

  // Devuelve solo las tareas cuyo estado coincide con `status`.
  // filter() crea un array nuevo con los elementos que cumplen la condición.
  getTasksWithStatus(status) {
    return this.tasks.filter((task) => task.estado === status);
  }

  // Agrega una tarea nueva. Recibe los datos sin id, le asigna el siguiente
  // id del contador y devuelve la tarea completa (con id).
  addTask(task) {
    // Primero incrementamos el contador, así el primer id es 1.
    this.currentId++;

    // Construimos el objeto solo con strings y números, compatible con JSON.
    const newTask = {
      id: this.currentId,
      nombre: task.nombre,
      descripcion: task.descripcion,
      asignadoA: task.asignadoA,
      fechaDeEntrega: task.fechaDeEntrega,
      estado: task.estado,
      prioridad: task.prioridad,
    };

    // Guardamos la tarea en el array interno.
    this.tasks.push(newTask);
    return newTask;
  }

  // Elimina la tarea con ese id. filter() se queda con todas las tareas
  // cuyo id es distinto, y reemplazamos el array por ese resultado.
  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
  }

  // Cambia el estado de una tarea. find() devuelve la primera tarea que
  // cumple la condición, o undefined si no existe.
  // Devuelve la tarea actualizada, o null si el id no existe.
  updateTask(taskId, status) {
    const task = this.tasks.find((task) => task.id === taskId);
    if (!task) {
      return null;
    }
    task.estado = status;
    return task;
  }

  // Cambia la persona asignada a una tarea. Funciona igual que updateTask.
  assignTask(taskId, assignee) {
    const task = this.tasks.find((task) => task.id === taskId);
    if (!task) {
      return null;
    }
    task.asignadoA = assignee;
    return task;
  }

  // Construye y devuelve la tarjeta (un <article>) de una tarea, usando
  // document.createElement en lugar de innerHTML. Así el texto que escribe
  // el usuario se inserta siempre como texto, nunca como HTML.
  // Ojo: solo la crea; quien la llama decide dónde agregarla.
  createTaskCard(task) {
    // Contenedor principal con la clase "card" de Bootstrap.
    const card = document.createElement('article');
    card.className = 'card shadow-sm';
    // Guardamos el id en un atributo data-* para identificar la tarjeta.
    card.dataset.taskId = task.id;

    // Cuerpo de la tarjeta (padding interior).
    const body = document.createElement('div');
    body.className = 'card-body';

    // Título: nombre de la tarea.
    const title = document.createElement('h3');
    title.className = 'card-title h5';
    title.textContent = task.nombre;

    // Párrafo con la descripción.
    const description = document.createElement('p');
    description.className = 'card-text';
    description.textContent = task.descripcion;

    // Lista con el resto de datos. list-unstyled quita las viñetas.
    const details = document.createElement('ul');
    details.className = 'list-unstyled small mb-3';

    // Función auxiliar: crea un <li> con "Etiqueta: valor" y lo agrega a la lista.
    const addDetail = (label, value) => {
      const item = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = `${label}: `;
      // append() acepta elementos y strings; los strings se insertan como texto.
      item.append(strong, value);
      details.append(item);
    };

    addDetail('Assigned to', task.asignadoA);
    // datetime-local guarda "2026-10-20T14:30"; cambiamos la T por un espacio.
    addDetail('Target date', task.fechaDeEntrega.replace('T', ' '));
    addDetail('Status', task.estado);
    addDetail('Priority', task.prioridad);

    // Botón para eliminar. type="button" evita que actúe como submit.
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-outline-danger btn-sm';
    deleteButton.textContent = 'Eliminar';

    // Montamos la estructura: elementos dentro del body, body dentro de la card.
    body.append(title, description, details, deleteButton);
    card.append(body);

    return card;
  }
}


/* -------------------------------------------------------------------------
   Referencias al DOM y la instancia de TaskManager
   ------------------------------------------------------------------------- */

// Una única instancia que guarda todas las tareas de la página.
// Al ser una constante de nivel superior, también se puede usar desde la
// consola del navegador escribiendo `taskManager`.
const taskManager = new TaskManager();

// Elementos del HTML que usamos varias veces.
const form = document.getElementById('taskForm');
const formErrors = document.getElementById('formErrors');
const taskList = document.getElementById('taskList');
const emptyTasksMessage = document.getElementById('emptyTasksMessage');


/* -------------------------------------------------------------------------
   Funciones auxiliares
   ------------------------------------------------------------------------- */

// Lee los valores del formulario y les quita los espacios del principio y
// del final con trim(). La validación y la creación de la tarea usan esta
// misma función, así ambas trabajan con los mismos datos.
// FormData + Object.fromEntries (como en el Sprint 1) convierten el
// formulario en un objeto { name: valor }.
function getFormValues() {
  const data = Object.fromEntries(new FormData(form));
  // Si en el select sigue elegida la opción deshabilitada, FormData no
  // incluye ese campo; `?? ''` lo convierte en un string vacío.
  return {
    nombre: (data.taskName ?? '').trim(),
    descripcion: (data.taskDescription ?? '').trim(),
    asignadoA: (data.assignedTo ?? '').trim(),
    fechaDeEntrega: data.targetDate ?? '',
    estado: data.taskStatus ?? '',
    prioridad: data.taskPriority ?? '',
  };
}

// Muestra el mensaje de "no hay tareas" solo si la lista está vacía.
// classList.toggle(clase, condición) agrega la clase si la condición es
// true y la quita si es false. d-none es la clase de Bootstrap que oculta.
function updateEmptyMessage() {
  const hasTasks = taskManager.getAllTasks().length > 0;
  emptyTasksMessage.classList.toggle('d-none', hasTasks);
}

// Muestra una lista de errores dentro del alert y lo hace visible.
function showErrors(errors) {
  const list = document.createElement('ul');
  list.className = 'mb-0';
  errors.forEach((error) => {
    const item = document.createElement('li');
    item.textContent = error;
    list.append(item);
  });
  // replaceChildren() borra el contenido anterior y pone el nuevo.
  formErrors.replaceChildren(list);
  formErrors.classList.remove('d-none');
}

// Vacía y oculta el alert de errores.
function clearErrors() {
  formErrors.replaceChildren();
  formErrors.classList.add('d-none');
}


function validateTaskForm() {
  const values = getFormValues();
  const errors = [];

  // Nombre: no vacío y más de 8 caracteres.
  if (values.nombre === '') {
    errors.push('Task: this field is required.');
  } else if (values.nombre.length <= 8) {
    errors.push('Task: must be more than 8 characters.');
  }

  // Descripción: no vacía y más de 15 caracteres.
  if (values.descripcion === '') {
    errors.push('Description: this field is required.');
  } else if (values.descripcion.length <= 15) {
    errors.push('Description: must be more than 15 characters.');
  }

  // Asignado a: no vacío y más de 8 caracteres.
  if (values.asignadoA === '') {
    errors.push('Assigned to: this field is required.');
  } else if (values.asignadoA.length <= 8) {
    errors.push('Assigned to: must be more than 8 characters.');
  }

  // Fecha de entrega: no vacía. Si la fecha está incompleta, el navegador
  // también devuelve un string vacío.
  if (values.fechaDeEntrega === '') {
    errors.push('Target date: choose a date and time.');
  }

  // Estado: debe haber una opción elegida (la opción inicial vale "").
  if (values.estado === '') {
    errors.push('Status: select a status.');
  }

  // Si hay errores los mostramos todos juntos; si no, limpiamos el alert.
  if (errors.length > 0) {
    showErrors(errors);
    return false;
  }

  clearErrors();
  return true;
}


/* -------------------------------------------------------------------------
   Flujo del formulario
   ------------------------------------------------------------------------- */

// Escuchamos 'submit' en el formulario (no 'click' en el botón): se dispara
// tanto al pulsar el botón como al presionar Enter en un campo.
form.addEventListener('submit', (event) => {
  // Evitamos que el navegador envíe el formulario y recargue la página.
  event.preventDefault();

  // Si la validación falla, cortamos aquí: no se llama a addTask.
  if (!validateTaskForm()) {
    return;
  }

  // Leemos los valores ya validados y creamos la tarea (addTask le pone el id).
  const task = taskManager.addTask(getFormValues());
  console.log('Nueva tarea:', task);

  // Creamos la tarjeta de la tarea.
  const card = taskManager.createTaskCard(task);

  // Botón "Eliminar" de esta tarjeta: al hacer click borramos la tarea del
  // array y la tarjeta del DOM, y revisamos si la lista quedó vacía.
  const deleteButton = card.querySelector('button');
  deleteButton.addEventListener('click', () => {
    taskManager.deleteTask(task.id);
    card.remove();
    updateEmptyMessage();
  });

  // Agregamos la tarjeta al final del contenedor de tareas.
  taskList.append(card);

  // Ocultamos el mensaje de "no hay tareas".
  updateEmptyMessage();

  // validateTaskForm() ya limpió los errores; solo falta vaciar el formulario.
  form.reset();
});
