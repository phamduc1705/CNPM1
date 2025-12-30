// --- 1. KHAI BÁO BIẾN (SELECTORS) ---
const taskList = document.getElementById("taskList");
const overlay = document.getElementById("overlay");

// Các biến cho POPUP ADD (Thêm mới)
const addTaskBtn = document.getElementById("addTaskBtn");
const popupAdd = document.querySelector(".root2");
const createBtn = document.querySelector(".create2");
const cancelBtn = document.querySelector(".cancel2");

// Các biến cho POPUP EDIT (Sửa/Xóa)
const popupEdit = document.querySelector(".root3");
const btnSave = document.querySelector(".btn-save");
const btnDelete = document.querySelector(".btn-delete");
const btnCloseEdit = document.querySelector(".btn-close-edit");

// Các biến Input của form EDIT
const editNameInput = document.querySelector(".editTaskName");
const editDescInput = document.querySelector(".editDescription");
const editPriorityInput = document.getElementById("editPriority");
const editTagInput = document.querySelector(".editTag");
const editDateInput = document.querySelector(".editDate");

// Các biến cho POPUP SET TIME
const root4 = document.querySelector(".root4");
const settime1 = document.querySelector(".settime1");
const saveTimeBtn = document.querySelector(".saveTimeBtn");
const cancelTimeBtn = document.querySelector(".cancelTimeBtn");

// Biến lưu trữ Task đang được chọn để sửa
let currentEditingTask = null;

// Quản lý danh sách mảng toàn cục
let array = [];
let availableKeywords = [];
let lastNav = 1; // Mặc định là 1 (Dashboard)

// --- 2. CÁC HÀM HỖ TRỢ ---

// Hàm đóng tất cả popup
const closeAllPopups = () => {
    popupAdd.style.display = "none";
    popupEdit.style.display = "none";
    overlay.classList.remove("show");
    root4.style.display = "none";
    
    // Reset biến tạm
    currentEditingTask = null;
    
    // Reset form Add
    document.querySelector(".taskName2").value = "";
    document.querySelector(".description2").value = "";
    document.querySelector(".tag_text2").value = "";
    document.querySelector(".date2").value = ""; 
};

// Hàm tạo Box HTML từ Object Task
function createTaskBox(task) {
    const div = document.createElement("div");
    div.className = "box";
    // Nếu task đã hoàn thành, thêm class active
    if (task.status === "done") {
        div.classList.add("active");
    }
    div.dataset.id = task.id; 
    div.dataset.status = task.status;
    div.dataset.priority = task.priorityLower;
    div.draggable = true;

    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragend", handleDragEnd);

    // Xử lý hiển thị UI khi task đã Done (màu sắc, icon check)
    const priorityColor = task.status === "done" ? "rgb(7, 254, 7)" : "rgba(255, 0, 0, 0.448)";
    const checkIconClass = task.status === "done" ? "show" : "";

    div.innerHTML = `
        <div class="head_box" >
            <div class="priority" style="background-color: ${priorityColor}" data-old-text="${task.priority}"><b>${task.priority}</b></div>
            <div class="selection">
                <button class="tick ${task.status === "done" ? "active" : ""}"><i class="fa-solid fa-check tik ${checkIconClass}"></i></button>
            </div>
        </div>

        <div class="box_title"><b>${task.title}</b></div>
        <div class="description">${task.description}</div>

        <div class="tag_parent">
            ${task.tags.map(t => `<div class="tag">${t}</div>`).join("")}
        </div>

        <div class="time">
            <i class="fa-regular fa-calendar-days"></i>
            <div class="deadline">${task.deadline || "No date"}</div>

            <div class="deletebox">
                <button class="deletebtn">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>

            <div class="editbox">
                <button class="editbtn">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
            </div>
        </div>
    `;

    return div;
}

// Hàm cập nhật mảng từ khóa tìm kiếm
function updateAvailableKeywords() {
    availableKeywords = [];

    array.forEach(box => {
        const title = box.querySelector(".box_title b").textContent;
        const desc = box.querySelector(".description").textContent;
        const tags = [...box.querySelectorAll(".tag")].map(t => t.textContent);

        availableKeywords.push(title, desc, ...tags);
    });
}


// --- 3. XỬ LÝ SỰ KIỆN TRÊN DANH SÁCH TASK (QUAN TRỌNG) ---
taskList.addEventListener('click', function(e) {
    // ===== XÓA TASK =====
    const deleteBtn = e.target.closest(".deletebtn");
    if (deleteBtn) {
        e.stopPropagation();

        const box = deleteBtn.closest(".box");
        const id = Number(box.dataset.id);

        if (!confirm("Xóa task?")) return;

        // LẤY task từ localStorage
        let tasks = JSON.parse(localStorage.getItem("task1")) || [];

        // LỌC BỎ task bị xóa
        tasks = tasks.filter(t => t.id !== id);

        // LƯU LẠI localStorage
        localStorage.setItem("task1", JSON.stringify(tasks));

        // XÓA KHỎI MẢNG array (search, filter)
        const index = array.indexOf(box);
        if (index !== -1) array.splice(index, 1);

        // XÓA GIAO DIỆN
        box.remove();
        checkEmptyTask();
        updateAvailableKeywords(); // Cập nhật search

        return;
    }

    //  Click vào nút TICK (Hoàn thành)
    const tickBtn = e.target.closest('.tick');
    if (tickBtn) {
        e.stopPropagation(); 
        
        const box = tickBtn.closest(".box");
        const tickIcon = tickBtn.querySelector(".tik");
        const priorityLabel = box.querySelector(".priority");
        const id = Number(box.dataset.id);

        // Hiệu ứng giao diện
        tickIcon.classList.toggle("show");
        tickBtn.classList.toggle("active");
        box.classList.toggle("active");

        let newStatus = "in-progress";

        // Logic đổi màu/chữ Priority
        if (box.classList.contains("active")) {
            // Done
            priorityLabel.setAttribute('data-old-text', priorityLabel.textContent);
            priorityLabel.style.backgroundColor = "rgb(7, 254, 7)"; // Màu xanh
            box.dataset.status = "done";
            newStatus = "done";
        } else {
            // Undone
            const oldText = priorityLabel.getAttribute('data-old-text') || "HIGH";
            priorityLabel.textContent = oldText;
            priorityLabel.style.backgroundColor = "rgba(255, 0, 0, 0.448)"; // Màu đỏ nhạt mặc định
            box.dataset.status = "in-progress";
            newStatus = "in-progress";
        }

        // CẬP NHẬT TRẠNG THÁI VÀO LOCALSTORAGE
        let tasks = JSON.parse(localStorage.getItem("task1")) || [];
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            localStorage.setItem("task1", JSON.stringify(tasks));
        }

        return; 
    }

    // Sửa TASK
    const editBtn = e.target.closest(".editbtn");
    if (editBtn) {
        e.stopPropagation();

        const box = editBtn.closest(".box");
        if (!box) return;

        currentEditingTask = box;

        // Lấy dữ liệu từ box
        const title = box.querySelector(".box_title b").textContent;
        const desc = box.querySelector(".description").textContent;
        //  Lấy tag và join lại thành chuỗi
        const tags = [...box.querySelectorAll(".tag")].map(t => t.textContent).join(", ");

        const date = box.querySelector(".deadline").textContent;

        const prioLabel = box.querySelector(".priority");
        let priority = prioLabel.textContent;
        // Nếu đang Done thì lấy text gốc
        if (box.classList.contains("active")) {
            priority = prioLabel.getAttribute("data-old-text") || "High";
        }

        // Đổ dữ liệu vào form edit
        editNameInput.value = title;
        editDescInput.value = desc;
        editPriorityInput.value = priority;
        editTagInput.value = tags; 
        editDateInput.value = (date !== "today" && date !== "No date") ? date : "";

        // Mở popup edit
        popupEdit.style.display = "block";
        overlay.classList.add("show");
        return; 
    }
});

// --- 4. CHỨC NĂNG THÊM TASK MỚI (CREATE) ---
addTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    popupAdd.style.display = "block";
    overlay.classList.add("show");
});

createBtn.addEventListener("click", (e) => {
    e.preventDefault();
    
    const nameInput = document.querySelector(".taskName2");
    const descInput = document.querySelector(".description2");
    const priorityInput = document.getElementById("priorityInput");
    const tagInput = document.querySelector(".tag_text2");
    
    //Kiểm tra tagInput có giá trị không trước khi split
    const tags = tagInput.value
        ? tagInput.value.split(",").map(t => t.trim().toLowerCase()).filter(t => t !== "")
        : [];

    const dateInput = document.querySelector(".date2"); 

    // Kiểm tra dữ liệu
    if (!nameInput.value.trim()) {
        alert("Vui lòng nhập tên Task!");
        return;
    }

    //Chuyển thành object để dễ quản lý
    const task = {
        id: Date.now(), 
        title: nameInput.value.trim(),
        description: descInput.value.trim(),
        priority: priorityInput.value,
        priorityLower: priorityInput.value.toLowerCase(),
        tags: tags,
        deadline: dateInput.value || null, 
        // tách ngày để lọc calendar
        year: dateInput.value ? new Date(dateInput.value).getFullYear() : null,
        month: dateInput.value ? new Date(dateInput.value).getMonth() + 1 : null,
        date: dateInput.value ? new Date(dateInput.value).getDate() : null,
        status: "in-progress",
    };
    //Lưu vào localStorage
    let task1 = JSON.parse(localStorage.getItem("task1")) || [];
    task1.push(task);
    localStorage.setItem("task1", JSON.stringify(task1));
    
    // Tạo Box và chèn vào danh sách
    const newBox = createTaskBox(task);
    taskList.prepend(newBox);
    
    // Update mảng quản lý
    array.unshift(newBox); 
    updateAvailableKeywords();
    
    checkEmptyTask();
    tags.forEach(tag => addTagToSidebar(tag));
    
    // Áp dụng style chiều rộng theo Nav hiện tại
    if (lastNav === 1) {
        newBox.style.width = "300px";
    } else if (lastNav === 2) {
        newBox.style.width = "630px";
    }

    closeAllPopups();
});

// --- 5. CHỨC NĂNG SỬA & LƯU (SAVE) ---
btnSave.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentEditingTask) {
        // Cập nhật Tên & Mô tả trên giao diện
        currentEditingTask.querySelector(".box_title b").textContent = editNameInput.value;
        currentEditingTask.querySelector(".description").textContent = editDescInput.value;

        // Cập nhật Priority
        const prioLabel = currentEditingTask.querySelector(".priority");
        // Nếu task chưa Done thì cập nhật luôn text hiển thị
        if (currentEditingTask.dataset.status !== "done") {
            prioLabel.textContent = editPriorityInput.value;
        } 
        // Luôn cập nhật data ẩn để nhớ trạng thái
        prioLabel.setAttribute('data-old-text', editPriorityInput.value);
        currentEditingTask.dataset.priority = editPriorityInput.value.toLowerCase();

        // Cập nhật Tag
        const tagParent = currentEditingTask.querySelector(".tag_parent");
        const oldTags = [...tagParent.querySelectorAll(".tag")].map(t => t.textContent.toLowerCase());
        const newTags = editTagInput.value.split(",").map(t => t.trim().toLowerCase()).filter(t => t !== "");
        const mergedTags = [...new Set([...oldTags, ...newTags])];

        // HIỂN THỊ tag lên task card
        tagParent.innerHTML = mergedTags.map(t => `<div class="tag">${t}</div>`).join("");

        // Cập nhật sidebar tag 
        mergedTags.forEach(t => addTagToSidebar(t));

        // --- CẬP NHẬT localStorage ---
        const id = Number(currentEditingTask.dataset.id);
        let tasks = JSON.parse(localStorage.getItem("task1")) || [];
        const taskIndex = tasks.findIndex(t => t.id === id);

        if (taskIndex !== -1) {
            tasks[taskIndex].title = editNameInput.value.trim();
            tasks[taskIndex].description = editDescInput.value.trim();
            tasks[taskIndex].priority = editPriorityInput.value;
            tasks[taskIndex].priorityLower = editPriorityInput.value.toLowerCase();
            tasks[taskIndex].tags = mergedTags;

            const d = editDateInput.value;
            tasks[taskIndex].deadline = d || null;
            tasks[taskIndex].year = d ? new Date(d).getFullYear() : null;
            tasks[taskIndex].month = d ? new Date(d).getMonth() + 1 : null;
            tasks[taskIndex].date = d ? new Date(d).getDate() : null;
        }
        localStorage.setItem("task1", JSON.stringify(tasks));

        // Cập nhật Date UI
        currentEditingTask.querySelector(".deadline").textContent = editDateInput.value || "No date";

        updateAvailableKeywords(); // Update search keywords
        closeAllPopups();
    }
});

// --- 7. CÁC NÚT ĐÓNG / HỦY ---
cancelBtn.addEventListener("click", closeAllPopups);     
btnCloseEdit.addEventListener("click", closeAllPopups);  
overlay.addEventListener("click", closeAllPopups);       

// --- TIMER LOGIC ---
const time1 = document.querySelector(".time_clock_1").textContent;
let DEFAULT_TIME = Number(time1.split(":")[0]) * 60;
let totalSeconds = DEFAULT_TIME;
let timer = null;
let isRunning = false;

const timeEl = document.querySelector(".time_clock_1");
const toggleBtn = document.querySelector(".toggleBtn");
const resetBtn = document.querySelector(".resetBtn");

function updateDisplay() {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    timeEl.textContent =
        String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0");
}

function startTimer() {
    if (timer) return;
    timer = setInterval(() => {
        if (totalSeconds <= 0) {
            stopTimer();
            alert("⏰ Hết giờ Focus!");
            return;
        }
        totalSeconds--;
        updateDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
    timer = null;
    isRunning = false;
    toggleBtn.textContent = "Start";
}

toggleBtn.onclick = () => {
    if (!isRunning) {
        isRunning = true;
        toggleBtn.textContent = "Pause";
        startTimer();
    } else {
        stopTimer();
    }
};

resetBtn.onclick = () => {
    stopTimer();
    totalSeconds = DEFAULT_TIME;
    updateDisplay();
};

updateDisplay();

settime1.onclick = () => {
    if (root4.style.display === "block") {
        root4.style.display = "none";
        overlay.classList.remove("show");
    } else {
        root4.style.display = "block";
        overlay.classList.add("show");
    }
}
saveTimeBtn.onclick = () => {
    const input= document.querySelector(".focusTimeInput").value;
    if(input && input > 0) {
        DEFAULT_TIME = Number(input) * 60;
        totalSeconds = DEFAULT_TIME;
        updateDisplay();
    }
    root4.style.display = "none";
    overlay.classList.remove("show");
}
cancelTimeBtn.onclick = () => {
    root4.style.display = "none";
    overlay.classList.remove("show");
}

// --- SEARCH ---
const resultSearch = document.querySelector(".result_search ul");
const inputSearch = document.getElementById("search_form");



// Hiển thị kết quả search khi gõ
inputSearch.onkeyup = function() {
    let input = inputSearch.value.trim();
    let result = [];
    
    if (input.length) {
        result = availableKeywords.filter((keyword) => {
            return keyword.toLowerCase().includes(input.toLowerCase());
        });
    }

    resultSearch.innerHTML = result.slice(0, 2).map(item => `<li>${item}</li>`).join('');

    if (result.length === 0 && input.length) {
        resultSearch.innerHTML = '<li>Không có kết quả</li>';
    }

    // Nếu ô search trống -> Trả lại danh sách theo view hiện tại (Nav1 hoặc Nav2)
    if (input.length === 0) {
        if (lastNav === 2) {
             nav2.click(); // Gọi lại logic filter ngày hôm nay
        } else {
             nav1.click(); // Gọi lại logic dashboard
        }
    }
}

// Thêm sự kiện click cho các <li>
resultSearch.addEventListener("click", function(e) {
    const li = e.target.closest("li"); 
    if (!li) return; 
    inputSearch.value = li.textContent; 
});

const search_button = document.querySelector(".search_button"); // nút Find

search_button.addEventListener("click", function(e){
    e.preventDefault();
    const keyword = inputSearch.value.trim().toLowerCase();
    if(!keyword) return; 

    // Lọc các box có title khớp từ mảng array
    const filteredBoxes = array.filter(box => {
        const title = box.querySelector(".box_title b").textContent.toLowerCase();
        return title.includes(keyword);
    });

    taskList.innerHTML = "";
    resultSearch.innerHTML = "";

    filteredBoxes.forEach(box => taskList.appendChild(box));
    checkEmptyTask();
});

// --- NAVIGATION (Dashboard vs Calendar) ---
const nav1 = document.querySelector(".box_nav1"); //DashBoard
const nav2 = document.querySelector(".box_nav2"); //Calendar

const today = new Date();
const currentD = today.getDate();
const currentM = today.getMonth() + 1;
const currentY = today.getFullYear();

nav1.addEventListener("click", function(e) {
    if(e) e.preventDefault();
    taskList.innerHTML = "";          
    array.forEach(box => {
        taskList.appendChild(box);    
        box.style.width = "300px";  
        box.style.display = ""; // Reset display property (do bộ lọc có thể ẩn)
    });
    lastNav = 1; 
    checkEmptyTask();
});

nav2.addEventListener("click", function (e) {
    if(e) e.preventDefault();
    taskList.innerHTML = "";

    let hasTaskToday = false;

    array.forEach(box => {
        // Reset display để đảm bảo nó hiện lên nếu đúng ngày
        box.style.display = "";
        
        const deadlineEl = box.querySelector(".deadline");
        if (!deadlineEl) return;

        const deadline = deadlineEl.innerText;
        if (deadline === "No date") return;

        // tách yyyy-mm-dd
        const [y, m, d] = deadline.split("-").map(Number);

        if (y === currentY && m === currentM && d === currentD) {
            taskList.appendChild(box);
            box.style.width = "630px";
            hasTaskToday = true;
        }
    });
    lastNav = 2; 
    if (!hasTaskToday) {
        taskList.innerHTML = "<div style='color:white; text-align:center; width:100%; margin-top:20px;'>Hôm nay không có công việc gì</div>";
    }
});

// --- 8. LỌC THEO TRẠNG THÁI ---
const statusButtons = document.querySelectorAll(".status-filter");
statusButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        const tasks = document.querySelectorAll("#taskList .box");
        tasks.forEach(task => {
            const taskStatus = task.dataset.status;
            if (filter === "all" || taskStatus === filter) {
                task.style.display = "";
            } else {
                task.style.display = "none";
            }
        });
    });
});

// --- 9. LỌC CÔNG VIỆC THEO ĐỘ ƯU TIÊN ---
const priorityItems = document.querySelectorAll(".priority-list li");
let activePriority = null;

priorityItems.forEach(item => {
    item.addEventListener("click", () => {
        const filter = item.dataset.priority;
        const tasks = document.querySelectorAll("#taskList .box");

        if (activePriority === filter) {
            activePriority = null;
            item.classList.remove("active");
            tasks.forEach(t => t.style.display = "");
            return;
        }

        activePriority = filter;
        priorityItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        tasks.forEach(task => {
            task.style.display =
                task.dataset.priority === filter ? "" : "none";
        });
    });
});

// --- 10. LỌC CÔNG VIỆC THEO TAG ---
let activeTag = null;

function addTagToSidebar(tag) {
    const sidebar = document.getElementById("sidebarTags");
    // Chuyển về chữ thường để so sánh tránh trùng lặp
    const exists = [...sidebar.querySelectorAll(".tag1")]
        .some(t => t.textContent.toLowerCase() === tag.toLowerCase());

    if (exists) return;

    const div = document.createElement("div");
    div.className = "tag1";
    div.textContent = tag;
    div.onclick = () => filterByTag(tag.toLowerCase());
    sidebar.appendChild(div);
}

function filterByTag(clickedTag) {
    const tasks = document.querySelectorAll("#taskList .box");

    if (activeTag === clickedTag) {
        activeTag = null;
        tasks.forEach(task => task.style.display = "");
        clearActiveTagUI();
        return;
    }

    activeTag = clickedTag;
    tasks.forEach(task => {
        const tags = [...task.querySelectorAll(".tag")]
            .map(t => t.textContent.toLowerCase());
        task.style.display = tags.includes(clickedTag) ? "" : "none";
    });
    
    setActiveTagUI(clickedTag);
}

// Hàm thiết lập UI active cho Tag
function setActiveTagUI(tagName) {
    clearActiveTagUI();
    const sidebarTags = document.querySelectorAll("#sidebarTags .tag1");
    sidebarTags.forEach(tag => {
        if(tag.textContent.toLowerCase() === tagName) {
            tag.classList.add("active");
        }
    });
}

function clearActiveTagUI() {
    document.querySelectorAll("#sidebarTags .tag1")
        .forEach(el => el.classList.remove("active"));
}

// Gắn sự kiện cho các tag có sẵn (HTML tĩnh)
document.querySelectorAll("#sidebarTags .tag1").forEach(tagEl => {
    tagEl.onclick = () => {
        filterByTag(tagEl.textContent.toLowerCase());
    };
});

// --- INITIALIZE (KHỞI TẠO) ---
document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("taskList");
    const task1 = JSON.parse(localStorage.getItem("task1")) || [];

    // Xóa sạch để render lại từ đầu tránh trùng lặp nếu có HTML tĩnh
    taskList.innerHTML = "";
    array = [];
    task1.forEach(task => {
        const box = createTaskBox(task);
        taskList.prepend(box); // Prepend: Mới nhất lên đầu
        array.unshift(box);    // Sync mảng array
        
        // Render tags vào sidebar
        if(task.tags) {
            task.tags.forEach(tag => addTagToSidebar(tag));
        }
    });

    updateAvailableKeywords();
    checkEmptyTask();
});

function checkEmptyTask() {
    const boxes = document.querySelectorAll(".main_box .box");
    console.log(boxes);
    const emptyText = document.getElementById("emptyText");
    if(emptyText) {
        if (boxes.length == 0) {
            emptyText.style.display = "block";
        } else {
            emptyText.style.display = "none";
        }
    }
}


//Drag and Drop
let draggedElement = null;
// --- DRAG EVENTS ---
taskList.addEventListener("dragover", handleDragOver);
taskList.addEventListener("dragleave", handleDragLeave);
taskList.addEventListener("drop", handleDrop);

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add("dragging");

    // Firefox cần setData mới drag được
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
}

function handleDragEnd() {
    this.classList.remove("dragging");
    draggedElement = null;

    document.querySelectorAll(".box").forEach(box => {
        box.classList.remove("drag-over");
    });
}

function handleDragOver(e) {
    e.preventDefault();

    const target = e.target.closest(".box");
    if (!target || target === draggedElement) return;

    // ===== 1. Drag-over UI =====
    document.querySelectorAll(".box").forEach(box =>
        box.classList.remove("drag-over")
    );
    target.classList.add("drag-over");

    // ===== 2. AUTO SCROLL =====
    const container = taskList;
    const containerRect = container.getBoundingClientRect();

    const scrollSpeed = 10;      // tốc độ scroll
    const scrollZone = 50;       // vùng kích hoạt (px)

    // Gần mép trên
    if (e.clientY < containerRect.top + scrollZone) {
        container.scrollTop -= scrollSpeed;
    }

    // Gần mép dưới
    if (e.clientY > containerRect.bottom - scrollZone) {
        container.scrollTop += scrollSpeed;
    }
}


function handleDragLeave(e) {
    const target = e.target.closest(".box");
    if (target) {
        target.classList.remove("drag-over");
    }
}

function handleDrop(e) {
    e.preventDefault();
    const target = e.target.closest(".box");

    if (!target || target === draggedElement) return;

    target.classList.remove("drag-over");

    const allBoxes = [...taskList.querySelectorAll(".box")];
    const draggedIndex = allBoxes.indexOf(draggedElement);
    const targetIndex = allBoxes.indexOf(target);

    if (draggedIndex < targetIndex) {
        taskList.insertBefore(draggedElement, target.nextSibling);
    } else {
        taskList.insertBefore(draggedElement, target);
    }

    // Cập nhật lại mảng array (rất quan trọng cho search/filter)
    array = [...taskList.querySelectorAll(".box")];
}

