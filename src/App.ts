import { Fetch, Data } from "./Fetch.js";

/**
 * @class App
 * @description Clase principal de la aplicación
 * @method init() Inicializa la aplicación
 * @method generateRow(id, title, done) Genera una fila de la tabla
 * @method renderTasks(tasks) Renderiza todas las tareas
 * @method addTask(input, alert) Añade una nueva tarea
 * @method crossOut(e) Marca o desmarca una tarea realizada
 * @method editModeOn(e, fromTask) Activa el modo edición
 * @method editModeOff(e, fromTask) Desactiva el modo edición
 * @method removeRow(e) Elimina una tarea
 * @method clearWhitespaces(str) Elimina los espacios en blanco de la tarea en el modo edición
 * @method idGenerator() Genera un id aleatorio hexadecimal
 * @property alert Alerta de error
 * @property close Botón para cerrar la alerta
 * @property input Input para añadir una nueva tarea
 * @property arrow Botón para guardar una nueva tarea
 * @property table Tabla de tareas
 * @throws Error
 * @returns {Promise} Promise
 *
 */
export class App {
  alert: HTMLDivElement | null;
  close: HTMLSpanElement | null;
  input: HTMLInputElement | null;
  arrow: HTMLDivElement | null;
  table: HTMLTableSectionElement | null;
  constructor() {
    this.alert = document.querySelector(".alert");
    this.close = this.alert?.firstElementChild as HTMLElement;
    this.input = document.querySelector("input");
    this.arrow = document.querySelector(".arrow");
    this.table = document.querySelector("tbody");
  }
  init = async () => {
    //eventos
    //Cerrar la alerta en el botón con la X
    if (this.close !== null) {
      this.close.addEventListener("click", () => {
        this.alert?.classList.remove("dismissible");
      });
    }
    //Impedir la recarga de la página y añadir una nueva tarea
    if (this.input !== null) {
      this.input.addEventListener("keydown", (e) => {
        if (e.code == "Enter" || e.code == "NumpadEnter") {
          e.preventDefault();
          this.addTask(this.input, this.alert);
        }
      });
      this.input.addEventListener("input", (e) => {
        if (
          this.input?.value !== "" &&
          !this.alert?.classList.contains("dismissible")
        ) {
          this.alert?.classList.add("dismissible");
        }
      });
    }
    if (this.arrow !== null) {
      //Añadir una nueva tarea
      this.arrow.addEventListener("click", () => {
        this.addTask(this.input, this.alert);
      });
    }
    // Fetch all tasks
    let tasks: Data = await Fetch.getAll();
    // Render all tasks
    this.renderTasks(tasks);
  };
  // //prepara una plantilla HTML, y la actualiza con contenido dinámico
  generateRow = (id: string, title: string, done: boolean) => {
    let newRow = document.createElement("tr");
    newRow.setAttribute("id", id);
    title = done ? `<del>${title}</del>` : title;
    newRow.innerHTML = `
<td>
  <i class="fa-solid fa-circle-check"></i>
  <span contenteditable="true" class="task">${title}</span>
</td>
<td>
  <span class="fa-stack fa-2x">
    <i class="fa-solid fa-square fa-stack-2x"></i>
    <i class="fa-solid fa-stack-1x fa-pencil fa-inverse"></i>
  </span>
</td>
<td>
  <span class="fa-stack fa-2x">
    <i class="fa-solid fa-square fa-stack-2x"></i>
    <i class="fa-solid fa-stack-1x fa-trash fa-inverse"></i>
  </span>
</td>
  `;
    //Tachar una tarea realizada
    newRow.firstElementChild?.firstElementChild?.addEventListener(
      "click",
      (e: Event) => this.crossOut(e)
    );
    //Activar el modo edición desde la tarea
    newRow.firstElementChild?.lastElementChild?.addEventListener(
      "focus",
      (e: Event) => {
        let currentEvent = e as Event & { currentTarget: HTMLElement };
        this.editModeOn(currentEvent, true);
      }
    );
    //Desactivar el modo edición
    newRow.firstElementChild?.lastElementChild?.addEventListener(
      "blur",
      (e) => {
        let currentEvent = e as Event & {
          currentTarget: HTMLElement;
          target: HTMLElement;
        };
        this.editModeOff(currentEvent);
      }
    );
    //Activar el modo edición desde el icono
    newRow.firstElementChild?.nextElementSibling?.firstElementChild?.lastElementChild?.addEventListener(
      "click",
      (e) => {
        let currentEvent = e as Event & { currentTarget: HTMLElement };
        this.editModeOn(currentEvent, false);
      }
    );
    //Eliminar la fila
    newRow.lastElementChild?.firstElementChild?.lastElementChild?.addEventListener(
      "click",
      (e) => {
        let currentEvent = e as Event & { target: HTMLElement };
        this.removeRow(currentEvent, false);
      }
    );
    return newRow;
  };
  // Añade todas las tareas a la tabla
  renderTasks = (tasks: Data) => {
    if (this.table !== null) {
      tasks.forEach((task) => {
        this.table?.appendChild(
          this.generateRow(task.id, task.title, task.isDone)
        );
      });
    }
  };
  // //Tachado de tarea
  crossOut = (e: Event) => {
    let task: HTMLElement | null = (e.target as HTMLElement)
      ?.nextElementSibling as HTMLElement;
    let text: string | null = task?.innerHTML as string | null;
    const row = (task as HTMLElement)?.parentNode?.parentNode;
    if (text?.includes("<del>")) {
      text = task?.firstElementChild?.textContent as string;
      task.innerHTML = text;
      // Para validar que existe el elemento, antes de acceder a sus propiedades
      if (row instanceof HTMLElement) {
        row.setAttribute("data-completed", "false");
      }
    } else {
      task.innerHTML = `<del>${text}</del>`;
      if (row instanceof HTMLElement) {
        row.setAttribute("data-completed", "true");
      }
    }
  };
  //Añadir nueva tarea
  addTask = (input: HTMLInputElement | null, alert: HTMLDivElement | null) => {
    let text: string;
    if (input?.value.trim() === "") {
      input.value = "";
      alert?.classList.remove("dismissible");
    } else if (input !== null) {
      text = input?.value;
      document
        .querySelector("tbody")
        ?.appendChild(this.generateRow(this.idGenerator(), text, false));
      input.value = "";
    }
  };
  //Activar el modo edición
  editModeOn = (
    e: Event & { currentTarget: HTMLElement },
    onFocus: boolean
  ) => {
    let task: HTMLElement;
    if (onFocus) {
      task = e.currentTarget;
    } else {
      task = (
        (e.currentTarget?.parentNode as HTMLElement)?.parentNode as HTMLElement
      )?.previousElementSibling?.lastElementChild as HTMLElement;
      task.focus();
    }
    task.classList.add("editable");
    document.addEventListener("keydown", (e) => {
      if (e.code == "Enter" || e.code == "NumpadEnter" || e.code == "Escape") {
        task.blur();
      }
    });
  };
  //Desactivar el modo edición
  editModeOff = (
    e: Event & { currentTarget: HTMLElement; target: HTMLElement }
  ) => {
    let task = e.currentTarget;
    if (task.innerHTML === "") {
      this.removeRow(e, true);
    } else {
      task.classList.remove("editable");
      task.innerHTML = this.clearWhitespaces(task.innerHTML);
      if (task.innerHTML === "") {
        this.removeRow(e, true);
      }
    }
  };
  //Eliminación de tarea
  removeRow = (e: Event & { target: HTMLElement }, editionMode: boolean) => {
    if (editionMode) {
      (
        (e.target?.parentNode as HTMLElement)?.parentNode as HTMLElement
      )?.remove();
    } else {
      (
        ((e.target?.parentNode as HTMLElement)?.parentNode as HTMLElement)
          ?.parentNode as HTMLElement
      ).remove();
    }
  };
  //Eliminación de espacios en blanco
  clearWhitespaces = (text: string): string => {
    return text.replace(new RegExp(/&nbsp;/, "g"), "").trim();
  };
  idGenerator = (): string => {
    // generate random hex string
    return Math.floor(Math.random() * 16777215).toString(16);
  };
}
