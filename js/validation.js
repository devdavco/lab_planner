// Validación del formulario de tareas. Muestra los errores junto a cada campo.

// Cada regla recibe el valor ya recortado y devuelve el mensaje de error, o '' si es válido.
// Así validar todo el formulario o un solo campo usa exactamente las mismas reglas.
function checkName(value) {
  if (value === '') {
    return 'El nombre es obligatorio.';
  }
  if (!isNaN(value)) {
    return 'El nombre no puede ser numérico.';
  }
  if (value.length <= 8) {
    return 'El nombre debe tener más de 8 caracteres.';
  }
  return '';
}

function checkDescription(value) {
  if (value === '') {
    return 'La descripción es obligatoria.';
  }
  if (value.length <= 15) {
    return 'La descripción debe tener más de 15 caracteres.';
  }
  return '';
}

function checkAssignedTo(value) {
  if (value === '') {
    return 'El campo «Asignado a» es obligatorio.';
  }
  if (!isNaN(value)) {
    return 'El campo «Asignado a» no puede ser numérico.';
  }
  if (value.length <= 4) {
    return 'El campo «Asignado a» debe tener más de 4 caracteres.';
  }
  return '';
}

function checkTargetDate(value) {
  if (value === '') {
    return 'Elige una fecha de entrega.';
  }
  return '';
}

function checkStatus(value) {
  if (value === '') {
    return 'Selecciona un estado.';
  }
  return '';
}

// Las claves son los id de los campos. El orden define cuál recibe el foco primero.
const FIELD_RULES = {
  taskName: checkName,
  taskDescription: checkDescription,
  assignedTo: checkAssignedTo,
  targetDate: checkTargetDate,
  taskStatus: checkStatus,
};

function getFieldError(input) {
  const rule = FIELD_RULES[input.id];
  return rule(input.value.trim());
}

// Cada campo tiene su contenedor de error con el id del campo + "Error".
function getErrorElement(input) {
  return document.getElementById(input.id + 'Error');
}

// aria-invalid avisa a los lectores de pantalla; is-invalid es solo visual.
function showFieldError(input, message) {
  input.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  getErrorElement(input).textContent = message;
}

function clearFieldError(input) {
  input.classList.remove('is-invalid');
  input.removeAttribute('aria-invalid');
  getErrorElement(input).textContent = '';
}

// Al cerrar el modal se quitan los errores, pero lo escrito se conserva para no hacer perder el trabajo.
export function clearAllFieldErrors() {
  for (const fieldId of Object.keys(FIELD_RULES)) {
    clearFieldError(document.getElementById(fieldId));
  }
}

// Solo quita el error cuando el campo ya es válido, para no mostrar errores mientras se escribe.
export function clearFieldErrorIfValid(input) {
  if (FIELD_RULES[input.id] === undefined) {
    return;
  }
  if (!input.classList.contains('is-invalid')) {
    return;
  }
  if (getFieldError(input) === '') {
    clearFieldError(input);
  }
}

// Devuelve true si el formulario es válido y false si hay errores.
export function validateTaskForm() {
  let firstInvalidInput = null;

  for (const fieldId of Object.keys(FIELD_RULES)) {
    const input = document.getElementById(fieldId);
    const message = getFieldError(input);
    if (message === '') {
      clearFieldError(input);
    } else {
      showFieldError(input, message);
      if (firstInvalidInput === null) {
        firstInvalidInput = input;
      }
    }
  }

  // El foco lleva al usuario directo al primer campo que tiene que corregir.
  if (firstInvalidInput !== null) {
    firstInvalidInput.focus();
    return false;
  }
  return true;
}
