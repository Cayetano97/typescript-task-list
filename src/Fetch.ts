/**
 * @class Fetch
 * @description Clase para realizar las peticiones a la API
 * @method getAll() Obtiene todas las tareas
 * @method create(task) Crea una tarea
 * @method update(task) Actualiza una tarea
 * @method delete(id) Elimina una tarea
 * @property BASE_URL URL base de la API
 * @static
 * @throws Error
 * @returns {Promise} Promise
 */

export interface ITask {
  id: string;
  title: string;
  isDone: boolean;
}

export type Data = ITask[];
export type PatchTask = Partial<ITask> & { id: string };

export class Fetch {
  static BASE_URL: string = "http://localhost:8000/tasks";

  static async getAll() {
    const response: Response = await fetch(this.BASE_URL);
    if (!response.ok) {
      throw new Error(
        `Error al obtener las tareas: ${response.status} ${response.statusText}`
      );
    }
    const data: Data = await response.json();
    return data;
  }

  static async create(task: ITask) {
    const response: Response = await fetch(this.BASE_URL, {
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
    const data: ITask = await response.json();
    return data;
  }

  static async update(task: PatchTask) {
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
    const data: ITask = await response.json();
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
