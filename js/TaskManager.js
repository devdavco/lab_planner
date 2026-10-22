class TaskManager {
  constructor() {
    this.tasks = [];
    this.currentId = 0;
  }

  getAllTasks() {
    return this.tasks;
  }

  getTasksWithStatus(status) {
    let resultado = [];
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].estado === status) {
        resultado.push(this.tasks[i]);
      }
    }
    return resultado;
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

  updateTask(taskId, status) {
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === taskId) {
        this.tasks[i].estado = status;
      }
    }
  }

  assignTask(taskId, assignee) {
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === taskId) {
        this.tasks[i].asignadoA = assignee;
      }
    }
  }
}
