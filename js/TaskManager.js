// Claves de localStorage: constantes para evitar errores de escritura al repetirlas.
const TASKS_KEY = 'tasks';
const CURRENT_ID_KEY = 'currentId';

export class TaskManager {
  constructor() {
    this.tasks = [];
    this.currentId = 0;
  }

  // localStorage solo guarda texto, por eso se convierte antes de guardar.
  save() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(this.tasks));
    localStorage.setItem(CURRENT_ID_KEY, String(this.currentId));
  }
  load() {
    const savedTasks = localStorage.getItem(TASKS_KEY);
    if (savedTasks === null) {
      return;
    }
    try {
      this.tasks = JSON.parse(savedTasks);
    } catch (error) {
      // Si el texto guardado está dañado, se empieza con la lista vacía en vez de romper la app.
      console.warn('No se pudieron cargar las tareas guardadas:', error);
      this.tasks = [];
      return;
    }
    const savedId = localStorage.getItem(CURRENT_ID_KEY);
    if (savedId !== null) {
      this.currentId = Number(savedId);
    }
  }
  getAllTasks() {
    return this.tasks;
  }

  addTask(task) {
    this.currentId = this.currentId + 1;
    task.id = this.currentId;
    this.tasks.push(task);
    return task;
  }

  deleteTask(taskId) {
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === taskId) {
        this.tasks.splice(i, 1);
        return;
      }
    }
  }

  markTaskAsDone(taskId) {
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === taskId) {
        if (this.tasks[i].estado !== 'HECHO') {
          this.tasks[i].estadoAnterior = this.tasks[i].estado;
          this.tasks[i].estado = 'HECHO';
        }
        return this.tasks[i];
      }
    }
    return null;
  }

  unmarkTaskAsDone(taskId) {
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === taskId) {
        if (this.tasks[i].estado === 'HECHO') {
          this.tasks[i].estado = this.tasks[i].estadoAnterior || 'POR HACER';
        }
        return this.tasks[i];
      }
    }
    return null;
  }
}
