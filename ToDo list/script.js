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

    // Biến lưu trữ Task đang được chọn để sửa
    let currentEditingTask = null;

    // --- 2. CÁC HÀM HỖ TRỢ ---

    // Hàm đóng tất cả popup
    const closeAllPopups = () => {
        popupAdd.style.display = "none";
        popupEdit.style.display = "none";
        overlay.classList.remove("show");
        
        // Reset biến tạm
        currentEditingTask = null;
        
        // Reset form Add
        document.querySelector(".taskName2").value = "";
        document.querySelector(".description2").value = "";
        document.querySelector(".tag_text2").value = "";
        document.querySelector(".date2").value = ""; 
    };

    // --- 3. XỬ LÝ SỰ KIỆN TRÊN DANH SÁCH TASK (QUAN TRỌNG) ---
    // Sử dụng Event Delegation: Bắt sự kiện click chung trên list cha
    taskList.addEventListener('click', function(e) {
        
        //  Click vào nút TICK (Hoàn thành)
        const tickBtn = e.target.closest('.tick');
        if (tickBtn) {
            // Ngăn sự kiện click lan ra box cha (để không mở popup edit)
            e.stopPropagation(); 
            
            const box = tickBtn.closest(".box");
            const tickIcon = tickBtn.querySelector(".tik");
            const priorityLabel = box.querySelector(".priority");
            // Hiệu ứng giao diện
            tickIcon.classList.toggle("show");
            tickBtn.classList.toggle("active");
            box.classList.toggle("active");

            // Logic đổi màu/chữ Priority
            if (box.classList.contains("active")) {
                // Lưu lại giá trị cũ để khôi phục khi bỏ tick
                priorityLabel.setAttribute('data-old-text', priorityLabel.textContent);
                // priorityLabel.textContent = "Done";
                priorityLabel.style.backgroundColor = "rgb(7, 254, 7)"; // Màu xanh
                // descriptionel.innerHTML=
            } else {
                // Khôi phục lại text cũ
                const oldText = priorityLabel.getAttribute('data-old-text') || "HIGH";
                priorityLabel.textContent = oldText;
                priorityLabel.style.backgroundColor = "rgba(255, 0, 0, 0.448)"; // Màu đỏ nhạt mặc định
            }
            return; // Dừng xử lý tại đây
        }

        // TRƯỜNG HỢP B: Click vào BOX (Để xem chi tiết / Sửa)
        const box = e.target.closest('.box');
        if (box) {
            currentEditingTask = box; // Lưu lại box đang click
            
            // Lấy dữ liệu từ Box hiện tại
            const title = box.querySelector(".box_title b").textContent;
            const desc = box.querySelector(".description").textContent;
            const tagElement = box.querySelector(".tag");
            const tag = tagElement ? tagElement.textContent : "";
            const date = box.querySelector(".deadline").textContent;
            
            // Xử lý Priority (Nếu đang Done thì lấy giá trị gốc, nếu không thì lấy hiện tại)
            const prioLabel = box.querySelector(".priority");
            let priority = prioLabel.textContent;
            if (priority === "Done") {
                priority = prioLabel.getAttribute('data-old-text') || "High";
            }

            // Đổ dữ liệu vào Form Edit
            editNameInput.value = title;
            editDescInput.value = desc;
            editPriorityInput.value = priority;
            editTagInput.value = tag;
            
            // Xử lý ngày tháng (chỉ gán nếu đúng định dạng date)
            if (date !== "today" && date !== "No date") {
                editDateInput.value = date;
            } else {
                editDateInput.value = "";
            }

            // Hiện popup Edit
            popupEdit.style.display = "block";
            overlay.classList.add("show");
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
        const dateInput = document.querySelector(".date2"); 

        // Kiểm tra dữ liệu
        if (!nameInput.value.trim()) {
            alert("Vui lòng nhập tên Task!");
            return;
        }

        // Tạo HTML Box mới
        const taskHTML = `
            <div class="box">
                <div class="head_box">
                    <div class="priority"><b>${priorityInput.value}</b></div>
                    <div class="selection">
                        <button class="tick"><i class="fa-solid fa-check tik"></i></button>
                    </div>
                </div>
                <div class="box_title"><b>${nameInput.value.trim()}</b></div>
                <div class="description">${descInput.value.trim()}</div>
                <div class="tag_parent">
                    ${tagInput.value.trim() ? `<div class="tag">${tagInput.value.trim()}</div>` : ""}
                </div>
                <div class="time">
                    <i class="fa-regular fa-calendar-days"></i>
                    <div class="deadline">${dateInput.value || "No date"}</div>
                </div>
            </div>
        `;

        // Chèn vào đầu danh sách
        taskList.insertAdjacentHTML("afterbegin", taskHTML);
        
        closeAllPopups();
    });

    // --- 5. CHỨC NĂNG SỬA & LƯU (SAVE) ---
    btnSave.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentEditingTask) {
            // Cập nhật Tên & Mô tả
            currentEditingTask.querySelector(".box_title b").textContent = editNameInput.value;
            currentEditingTask.querySelector(".description").textContent = editDescInput.value;

            // Cập nhật Priority
            const prioLabel = currentEditingTask.querySelector(".priority");
            // Nếu task chưa Done thì cập nhật luôn text hiển thị
            if (prioLabel.textContent !== "Done") {
                prioLabel.textContent = editPriorityInput.value;
            } 
            // Luôn cập nhật data ẩn để nhớ trạng thái
            prioLabel.setAttribute('data-old-text', editPriorityInput.value);

            // Cập nhật Tag
            const tagParent = currentEditingTask.querySelector(".tag_parent");
            if (editTagInput.value.trim()) {
                tagParent.innerHTML = `<div class="tag">${editTagInput.value.trim()}</div>`;
            } else {
                tagParent.innerHTML = "";
            }

            // Cập nhật Date
            currentEditingTask.querySelector(".deadline").textContent = editDateInput.value || "No date";

            closeAllPopups();
        }
    });

    // --- 6. CHỨC NĂNG XÓA (DELETE) ---
    btnDelete.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentEditingTask) {
            if (confirm("Bạn có chắc muốn xóa task này không?")) {
                currentEditingTask.remove();
                closeAllPopups();
            }
        }
    });

    // --- 7. CÁC NÚT ĐÓNG / HỦY ---
    cancelBtn.addEventListener("click", closeAllPopups);     // Nút Cancel ở form Add
    btnCloseEdit.addEventListener("click", closeAllPopups);  // Nút Close ở form Edit
    overlay.addEventListener("click", closeAllPopups);       // Click ra ngoài
