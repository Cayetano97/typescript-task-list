interface Task {
  id: number;
  title: string;
  isDone: boolean;
}
export class Fetch {
  static BASE_URL: string = "http://localhost:8000/tasks";
  static async getAll() {
    const response: Response = await fetch("http://localhost:8000/tasks");
    if (!response.ok) {
      throw new Error(
        `Error al obtener las tareas: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  }

  static async create(task: Task) {
    const response = await fetch(this.BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(
        `Error al crear la tarea: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  }

  static async update(task: Task) {
    const response = await fetch(`${this.BASE_URL}${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(
        `Error al actualizar la tarea: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  }

  static async delete(id: string) {
    const response = await fetch(`${this.BASE_URL}${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(
        `Error al eliminar la tarea: ${response.status} ${response.statusText}`
      );
    }
  }
}
