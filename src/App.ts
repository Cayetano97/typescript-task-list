import { Fetch } from "./Fetch";

interface Task {
  id: string;
  title: string;
  isDone: boolean;
}

export class App {
  alert :HTMLElement | null; // HTMLElemente quiere decir que puede ser cualquier elemento HTML
  close: HTMLElement | null;
  input: HTMLInputElement; // HTMLInputElement: la interfaz para elementos <input>.
  arrow: HTMLElement | null;
  table: HTMLTableSectionElement | null; // HTMLTableElement: la interfaz para elementos <table>.

  constructor() {
    this.alert  = document.querySelector(".alert"); // HTMLElement quiere decir que puede ser cualquier elemento HTML
    this.close  = this.alert?.firstElementChild as HTMLElement; 
    this.input = document.querySelector("input") as HTMLInputElement;
    this.arrow = document.querySelector(".arrow");
    this.table = document.querySelector("tbody");
  }

  init = async () => {
    //eventos
    //Cerrar la alerta en el botón con la X
    if (this.close) {
    this.close?.addEventListener("click", () => {
      this.alert?.classList.add("dismissible");
    });
  }
    //Impedir la recarga de la página y añadir una nueva tarea
    this.input?.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.code == "Enter" || e.code == "NumpadEnter") {
        e.preventDefault();
        this.addTask(this.input, this.idGenerator, this.input?.value, this.alert as HTMLElement);
      }
    });
    this.input?.addEventListener("input", (e) => {
      if (this.input?.value !== "" && !this.alert?.classList.contains("dismissible")) {
        this.alert?.classList.add("dismissible");
      }
    });
    //Añadir una nueva tarea
    this.arrow?.addEventListener("click", () => {
      this.addTask(this.input!, this.idGenerator, this.input?.value, this.alert!);
    });
    // Fetch all tasks
    let tasks = await Fetch.getAll();
    // Render all tasks
    this.renderTasks(tasks as unknown as Task[]);
  };
  // //prepara una plantilla HTML, y la actualiza con contenido dinámico
  generateRow = (id: string, title: string, isDone: boolean) => {
    let newRow = document.createElement("tr");
    newRow.setAttribute("id", id);
    title = isDone ? `<del>${title}</del>` : title;
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
      (event: Event) => {
        this.crossOut(event as MouseEvent);
      }
    );
    //Activar el modo edición desde la tarea
    newRow.firstElementChild?.lastElementChild?.addEventListener("focus", (event: Event) => {
      this.editModeOn(event as MouseEvent, true);
    });
    //Desactivar el modo edición
    newRow.firstElementChild?.lastElementChild?.addEventListener("blur", (event: Event) => {
      this.editModeOff(event as MouseEvent);
    });
    //Activar el modo edición desde el icono
    newRow.firstElementChild?.nextElementSibling?.firstElementChild?.lastElementChild?.addEventListener(
      "click",
      (event: Event) => {
        this.editModeOn(event as MouseEvent, false);
      }
    );
    //Eliminar la fila
    newRow.lastElementChild?.firstElementChild?.lastElementChild?.addEventListener(
      "click",
      (event: Event) => {
        this.removeRow(event as MouseEvent,false);
      }
    );
    return newRow;
  };
  renderTasks = (tasks: Task[]) => {
    console.log(tasks.length);
    tasks.forEach((task: Task) => {
      this.table?.appendChild(this.generateRow(task.id, task.title, task.isDone));
    });
  };
  // //Tachado de tarea
  crossOut = (event: MouseEvent) => {
    let task = (event.target as HTMLElement)?.nextElementSibling as HTMLElement;
    let text = task.innerHTML;
    text = text.includes("<del>") ? task.firstElementChild?.textContent ?? "" : `<del>${text}</del>`;
    task.innerHTML = text;
    task.closest('.task-container')?.setAttribute("data-completed", text.includes("<del>") ? "true" : "false");
  };
  

  //Añadir nueva tarea
  addTask = (input: HTMLInputElement, idGenerator: () => string, text: string, alert: HTMLElement): void => {
    if (!text) {
      input.value = "";
      alert.classList.remove("dismissible");
    } else {
      text = input.value;
      const id = idGenerator();
      document.querySelector("tbody")?.appendChild(this.generateRow(id, text, alert?.classList.contains("dismissible")));
      input.value = "";
    }
  };
  //Modo Edición
  editModeOn = (e: Event, onFocus: boolean): void => {
    let task: HTMLElement;
    if (onFocus) {
      task = e.currentTarget as HTMLElement;
    } else {
      task = (((((e.currentTarget as HTMLElement).parentNode as HTMLElement).parentNode as HTMLElement).previousElementSibling as HTMLElement).lastElementChild as HTMLElement);
      task.focus();
    }
    // console.log(task);(((
    task.classList.add("editable");
    document.addEventListener("keydown", (e) => {
      if (e.code == "Enter" || e.code == "NumpadEnter" || e.code == "Escape") {
        task.blur();
      }
    });
  };
  editModeOff = (e: MouseEvent) => {
    let task = e.currentTarget as HTMLElement;
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
  // Eliminación de tarea
   removeRow = (e: Event, editionMode: boolean): void => {
     if (editionMode) {
      (e.currentTarget as HTMLElement).closest("tr")?.remove();
    } else {
       // console.log(e.target.parentNode.parentNode.parentNode);
       (((e.target as HTMLElement).parentNode as HTMLElement).parentNode as HTMLElement).remove();
      }
   };


  //Eliminación de espacios en blanco
  clearWhitespaces = (text: string) => {
    return text.replace(new RegExp(/&nbsp;/, "g"), "").trim();
  };
  idGenerator = () => {
    // generate random hex string
     return Math.floor(Math.random() * 16777215).toString(16);
   }

}
