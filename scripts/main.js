//Render if no tasks are available and check for it
const renderToAddFirstTask = () => {
  const drawAddFirstTask = $(".render-if-no-tasks");
  const hideIfTasksAvailable = ToDo.tasks.length ? "hide-element" : "";
  drawAddFirstTask.html(`
      <div class="add-first-task ${hideIfTasksAvailable}">
      <i class="fas fa-tasks"></i>
      <p>Add your first task!</p>
      <span>😊</span>
      </div>
`);
};

renderToAddFirstTask();

// If width is mobile, change event to click instead of dblclick
const addToggleTaskListeners = () => {
  const task = document.querySelectorAll(".task");
  task.forEach((btn) => {
    btn.addEventListener(isMobile ? "click" : "dblclick", () => {
      ToDo.toggleTask(btn.dataset.id);
    });
  });
  document.addEventListener("keydown", (e) => {
    const targetId = document.activeElement?.dataset.id;
    if (targetId && (e.code === "Enter" || e.code === "Space")) {
      ToDo.toggleTask(targetId);
    }
  });
};
// Run on each task object, of the tasks array, and render them.
const renderTasks = (searchResults) => {
  const tasks = searchResults?.length ? searchResults : ToDo.tasks;
  let tasksHtml = "";
  tasks.forEach((task, index) => {
    const isCompletedClass = task.completed ? "completed" : "";
    const oddIndex = index % 2 !== 0 ? "task-reversed" : "";
    const date = dayjs(task.fullDate + " " + task.time).format("dddd, MM-DD-YYYY, HH:mm A");
    tasksHtml += `
        <div class="task-wrapper" tabindex="${10 + index}"  data-id="${index}">
          <div class="task ${isCompletedClass} ${oddIndex}"  
            data-id="${index}">
            <div class="content"> 
          <div class="content-left">
            <button class="edit btn tippy" data-id="${index}" data-tippy-content="Save/Edit" data-tippy-placement="top-end">
              <i class="fas fa-pencil-alt editbtn"></i>
              <i class="fas fa-save savebtn"></i>
            </button>
          </div>
            <div class="content-right">
              <p class="text" spellcheck="false">${task.text}</p>
                <span class="time">${date}</span>
            </div>
          </div>
            <div class="task__status">
            <button class="delete btn" data-id="${index}" >
            <i class="fas fa-times tippy" data-tippy-content="Delete" data-tippy-placement="top-end"></i>
            </button>
            <i class="fas fa-check tippy" data-tippy-content="Task Completed" data-tippy-placement="top-start"></i>
            </div>
          </div>
        </div>
        `;
  });
  $(".tasks").html(tasksHtml);

  // Prevent going down a line when editing and pressing Enter
  $(document).keydown((e) => {
    if (e.keyCode === 13 && ToDo.isEdited) {
      e.preventDefault();
    }
  });

  // Event listeners for action buttons
  const editBtn = document.querySelectorAll(".edit");
  editBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ToDo.editTask(btn.dataset.id);
    });
  });

  const deleteBtn = document.querySelectorAll(".delete");
  deleteBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ToDo.deleteTask(btn.dataset.id);
    });
  });

  const deleteAll = document.querySelector(".delete-all");
  deleteAll.addEventListener("click", () => {
    ToDo.deleteAllTasks();
  });

  addToggleTaskListeners();
  activateTippy();
};

// Render the header and modal btn
const renderTaskHeader = () => {
  const unCompletedTasks = ToDo.tasks.filter(({ completed }) => completed === false);
  const modalClass = !ToDo.tasks.length ? "hide-element" : ``;
  const hideIfAllCompleted = ToDo.tasks.every((item) => item.completed) ? "hide-element" : "";
  const hideIfSomeUnCompleted = ToDo.tasks.some((item) => !item.completed) ? "hide-element" : "";
  const subHeaderClass1 = ToDo.tasks.every((item) => item.completed)
    ? "No Tasks Left <span class='emoji'>👏</span>"
    : unCompletedTasks.length === 1
    ? `<span class="task-left-amount">${unCompletedTasks.length}</span> Task Left`
    : `<span class="task-left-amount">${unCompletedTasks.length}</span> Tasks Left`;
  const subHeaderClass2 = isMobile ? "Click on a task to update ✔" : "Double click on a task to update ✔";
  const drawTaskHeader = document.querySelector(".task-list--wrapper");
  drawTaskHeader.innerHTML = `
  <div class="button-wrapper">
     <button class="open-modal ${modalClass} btn-cta task-header-buttons" 
    aria-label="Open Modal">Remove All</button>
    </div>
  <div class="tasks-header">
  <h2 class="${modalClass}">${subHeaderClass1}</h2>
  <h6 class="${modalClass}">${subHeaderClass2}</h6>
</div>
<div class="button-wrapper">
  <button class="complete-all ${modalClass} btn-cta ${hideIfAllCompleted} task-header-buttons">Complete All</button>
  <button class="uncomplete-all ${modalClass} btn-cta ${hideIfSomeUnCompleted} task-header-buttons" >Uncomplete All</button>
</div>

  `;
  activateTippy();

  // Event to complete all tasks
  const completeAll = document.querySelector(".complete-all");
  completeAll.addEventListener("click", () => ToDo.completeAllTasks());
  const unCompleteAll = document.querySelector(".uncomplete-all");
  unCompleteAll.addEventListener("click", () => ToDo.unCompleteAllTasks());

  // Open Delete Modal
  $(".open-modal").click(() => openModal());
};

// Close/Open Delete all tasks modal
let isOpen = false;
const deleteModal = document.querySelector(".modal");
const deleteModalOverlay = document.querySelector(".modal__overlay");
const openModal = () => {
  if (!isOpen) {
    deleteModal.classList.add("modal--active");
    deleteModalOverlay.classList.add("overlay--active");
    isOpen = true;
  }
};
const closeModal = () => {
  if (isOpen) {
    deleteModal.classList.remove("modal--active");
    deleteModalOverlay.classList.remove("overlay--active");
    isOpen = false;
  }
};

// If modal is open, pressing Enter will delete all tasks!
$(document).keydown((e) => {
  if (e.keyCode === 13 && isOpen) {
    ToDo.deleteAllTasks();
  }
});

// Get search results on input change, with mappedResults that fit the search values
const searchInput = $(".search-task");
searchInput.on("input", () => {
  const mappedResults = ToDo.$fuse.search(searchInput.val()).map(({ item }) => item);
  if (!mappedResults.length) {
    $("#search-result-amount").html(`No Results - Showing all tasks`);
  } else {
    $("#search-result-amount").html(
      `${mappedResults.length === 1 ? mappedResults.length + " Result" : mappedResults.length + " Results"}`
    );
  }
  renderTasks(mappedResults);
  if (!searchInput.val()) {
    $("#search-result-amount").html(``);
    renderTasks();
  }
});

// Checks
const textBox = $("#text");
$(".redo-form").hide();
textBox.on("input", () => {
  if (textBox.val()) {
    $(".redo-form").show();
  } else {
    $(".redo-form").hide();
  }
});

// Redo Form click and Enter event
$(".redo-form").on("click", () => ToDo.resetForm());
$(".redo-form").on("keydown", (e) => {
  if (e.code === "Enter" || e.code === "Space") {
    e.preventDefault();
    ToDo.resetForm();
  }
});

// Hide Search bar if array length is below 2
$(".task-search").hide();
const hideAndShowSearchBar = () => {
  if (ToDo.tasks.length <= 1) {
    $(".task-search").hide();
  } else {
    $(".task-search").show();
  }
};
// Events to update UI
document.addEventListener("tasks-updated", () => {
  renderTasks();
  renderTaskHeader();
  renderToAddFirstTask();
  renderTaskHeader();
  hideAndShowSearchBar();
});
document.addEventListener("tasks-completed", () => {
  renderTaskHeader();
});

// Date conversion, min/max/value for inputs on top
let dateFormat = dayjs().format("YYYY-MM-DD");
let timeFormat = dayjs().format("HH:mm");
const initializeDateAndTime = (reset = false) => {
  const dateDates = {
    min: dayjs().add(-1, "day").format("YYYY-MM-DD"),
    max: dayjs().add(1, "year").format("YYYY-MM-DD"),
    value: reset ? null : dateFormat,
  };
  for (const key in dateDates) {
    $("#date").attr(key, dateDates[key]);
  }
  $("#time").attr("value", reset ? null : timeFormat);
};
initializeDateAndTime();

const drawCurrentDateOnClicks = () => {
  // If date and time box value is different from current day values, pressing Enter on the Icon will inject current date again.
  if ($("#date").val() !== dateFormat || $("#time").val() !== timeFormat) {
    $("#date").val(dateFormat);
    $("#time").val(timeFormat);
  }
};

$(".current-date").click(() => {
  drawCurrentDateOnClicks();
});

$(".current-date").on("keydown", (e) => {
  if (e.code === "Enter" || e.code === "Space") {
    e.preventDefault();
    drawCurrentDateOnClicks();
  }
});

//Events for button between inputs to get current date/time
$(document).ready(() => {
  if ($(".task-wrapper")) {
    gsap.from(".task-wrapper", {
      y: 250,
      opacity: 0,
      filter: "blur(20px)",
      stagger: 0.27,
      duration: 0.9,
    });
  }

  gsap
    .from(document.querySelectorAll("header, section, main"), {
      autoAlpha: 0,
      y: 220,
      filter: "blur(10px)",
      opacity: 0,
      ease: Power1.ease,
      stagger: 0.2,
      clearProps: "all",
    })
    .totalDuration(1.05);

  setTimeout(() => {
    $("html, body").animate({ scrollTop: 0 }, "slow");
  }, 200);
  // Tippies for Tooltips
  activateTippy();
  //Load Audio on page load
});
