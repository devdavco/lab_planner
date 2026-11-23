// Validación del formulario de tareas. Solo lee los campos y muestra errores.

const formErrors = document.getElementById('formErrors');

function showFormErrors(errores) {
  formErrors.innerHTML = errores.join('<br>');
  formErrors.classList.remove('d-none');
}

function hideFormErrors() {
  formErrors.innerHTML = '';
  formErrors.classList.add('d-none');
}

// Devuelve true si el formulario es válido y false si hay errores.
export function validateTaskForm() {
  const nombre = document.getElementById('taskName').value.trim();
  const descripcion = document.getElementById('taskDescription').value.trim();
  const asignadoA = document.getElementById('assignedTo').value.trim();
  const fechaDeEntrega = document.getElementById('targetDate').value;
  const estado = document.getElementById('taskStatus').value;

  const errores = [];

  if (nombre === '') {
    errores.push('Nombre: campo es obligatorio.');
  } else if (!isNaN(nombre)) {
    errores.push('Nombre: no puede ser numérico.');
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
  } else if (!isNaN(asignadoA)) {
    errores.push('Asignado a: no puede ser numérico.');
  } else if (asignadoA.length <= 4) {
    errores.push('Asignado a: debe tener más de 4 caracteres.');
  }

  if (fechaDeEntrega === '') {
    errores.push('Fecha de entrega: elige una fecha y hora.');
  }

  if (estado === '') {
    errores.push('Estado: selecciona un estado.');
  }

  if (errores.length > 0) {
    showFormErrors(errores);
    return false;
  }

  hideFormErrors();
  return true;
}
