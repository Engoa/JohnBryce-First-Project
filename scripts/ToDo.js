const ToDo = {
  //DATA MEMBERS
  tasks: [],
  isEdited: false,

  //METHODS
  update(index, path, value) {
    return {
      ...this.tasks[index],
      [path]: value,
    };
  },

  addTask(tasks) {
    this.tasks.unshift(tasks);
    const textBox = document.querySelector("#text");
    textBox.focus();
    this.syncLSandUI();
  },

  deleteTask(index) {
    this.tasks.splice(index, 1);
    toggleSnackBar("A task has been deleted ❌");
    this.syncLSandUI();
  },

  deleteAllTasks() {
    this.tasks = [];
    closeModal();
    toggleSnackBar("All tasks have been deleted ❌");
    this.syncLSandUI();
  },

  editTask(index) {
    let textDiv = document.querySelectorAll(`.text`)[index];
    const divTask = document.querySelectorAll(`.task`)[index];
    if (this.isEdited) {
      textDiv.removeAttribute("contenteditable");
      this.tasks[index] = this.update(index, "text", textDiv.textContent);
      divTask.classList.remove("edited");
      toggleSnackBar("Task successfully edited");
      setLS("tasks", this.tasks);
    } else {
      textDiv.setAttribute("contenteditable", true);
      textDiv.focus();
      divTask.classList.add("edited");
      setEndOfContenteditable(textDiv);
    }
    this.isEdited = !this.isEdited;
  },

  toggleTask(index) {
    const divTask = document.querySelectorAll(`.task`)[index];
    const { completed } = this.tasks[index];
    if (!completed) {
      divTask.classList.add("completed");
      toggleSnackBar("Task is now completed ✔");
    } else {
      divTask.classList.remove("completed");
    }
    this.tasks[index] = this.update(index, "completed", !completed);
    this.updateUICompleted();
  },

  completeAllTasks() {
    this.tasks = this.tasks.map((item) => ({
      ...item,
      completed: true,
    }));
    toggleSnackBar("All tasks are now completed ✔");
    this.syncLSandUI();
  },

  unCompleteAllTasks() {
    this.tasks = this.tasks.map((item) => ({
      ...item,
      completed: false,
    }));
    toggleSnackBar("All tasks are now uncompleted");
    this.syncLSandUI();
  },

  resetForm() {
    const form = document.querySelector("#new-task-form");
    $(".redo-form").hide();
    form.reset();
  },

  updateUICompleted() {
    document.dispatchEvent(new CustomEvent("tasks-completed"));
    setLS("tasks", this.tasks);
  },

  syncLSandUI() {
    document.dispatchEvent(new CustomEvent("tasks-updated"));
    setLS("tasks", this.tasks);
  },
};
const form = document.querySelector("#new-task-form");
form.addEventListener("submit", (e) => {
  let textBox = document.querySelector("#text").value;
  let dateBox = document.querySelector("#date").value;
  let timeBox = document.querySelector("#time").value;
  const formInputs = {
    textBox,
    dateBox,
    timeBox,
  };

  const date = new Date(dateBox + "," + timeBox).toLocaleString([], {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  e.preventDefault();

  const isValidDate = Date.parse(formInputs.dateBox);
  if (isNaN(isValidDate)) {
    toggleSnackBar("Date must have a valid format 📅");
  }
  if (
    !formInputs.textBox.trim() ||
    !formInputs.dateBox ||
    !formInputs.timeBox
  ) {
    $(".redo-form").hide();
    toggleSnackBar("All fields must have a value! 😟");
    return;
  } else {
    $(".redo-form").show();
    ToDo.addTask({
      text: textBox,
      completed: false,
      date,
    });
    $(".task-wrapper:first-of-type").hide();
    $(".task-wrapper:first-of-type").fadeIn(800);
    form.reset();
    $(".redo-form").hide();
    toggleSnackBar("A task has been added 👍");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (getLS("tasks")) {
    ToDo.tasks = getLS("tasks");
    ToDo.syncLSandUI();
  }
});
