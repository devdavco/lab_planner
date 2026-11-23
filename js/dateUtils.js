// Funciones de fecha. Todo se calcula en hora local para evitar desfases por UTC.

// Las tareas viejas guardan "AAAA-MM-DDTHH:MM"; los primeros 10 caracteres son siempre la fecha.
export function getDatePart(value) {
  return value.slice(0, 10);
}

// new Date('AAAA-MM-DD') se interpreta en UTC y en Colombia mostraría el día anterior.
// Con año, mes y día por separado, JavaScript usa la hora local.
export function parseLocalDate(value) {
  const parts = value.split('-');
  const year = Number(parts[0]);
  const monthIndex = Number(parts[1]) - 1; // En Date los meses van de 0 a 11.
  const day = Number(parts[2]);
  return new Date(year, monthIndex, day);
}

// Texto corto para la tarjeta, por ejemplo "mar, 14 oct".
export function formatDueDate(value) {
  if (!value) {
    return '';
  }
  const date = parseLocalDate(getDatePart(value));
  // Si el valor guardado no es una fecha válida, se muestra tal cual en vez de "Invalid Date".
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Se copia la fecha para no modificar la original; setDate ajusta solo el cambio de mes o año.
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// toISOString() usa UTC y de noche podría devolver el día siguiente; aquí se usa la fecha local.
export function toInputDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}
