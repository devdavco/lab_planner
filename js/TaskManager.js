export class TaskManager {
  constructor() {
    this.tasks = [];
    this.currentId = 0;
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
