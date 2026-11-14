/* =========================================
   RUANG PRODUKTIF
   Productivity Dashboard
========================================= */

/**
 * Mengambil elemen HTML berdasarkan ID.
 * @param {string} id - ID elemen HTML.
 * @returns {HTMLElement} Elemen yang ditemukan.
 */
 function getElement(id) {
    return document.getElementById(id);
  }
  
  // ==========================================
  // 1. DOM ELEMENTS
  // ==========================================
  
  const taskList = getElement("taskList");
  const taskForm = getElement("taskForm");
  const taskModalElement = getElement("taskModal");
  
  const addTaskBtn = getElement("addTaskBtn");
  const modalTitle = getElement("modalTitle");
  
  const taskIdInput = getElement("taskId");
  const taskTitleInput = getElement("taskTitle");
  const taskDescriptionInput = getElement("taskDescription");
  const taskCategoryInput = getElement("taskCategory");
  const taskDateInput = getElement("taskDate");
  
  const searchInput = getElement("searchInput");
  const categoryFilter = getElement("categoryFilter");
  const statusFilter = getElement("statusFilter");
  
  const totalTasksElement = getElement("totalTasks");
  const completedTasksElement = getElement("completedTasks");
  const pendingTasksElement = getElement("pendingTasks");
  
  const currentDateElement = getElement("currentDate");
  
  // Bootstrap Modal
  const taskModal = new bootstrap.Modal(taskModalElement);
  
  // ==========================================
  // 2. DATA MANAGEMENT
  // ==========================================
  
  /**
   * Mengambil data tugas dari localStorage.
   * @returns {Array} Daftar tugas.
   */
  function loadTasks() {
    try {
      const savedTasks = localStorage.getItem("ruangProduktifTasks");
      const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];
  
      return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch (error) {
      console.error("Gagal membaca data tugas:", error);
      return [];
    }
  }
  
  let tasks = loadTasks();
  
  /**
   * Menyimpan data tugas ke localStorage.
   */
  function saveTasks() {
    try {
      localStorage.setItem("ruangProduktifTasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Gagal menyimpan data tugas:", error);
  
      Swal.fire({
        icon: "error",
        title: "Penyimpanan gagal",
        text: "Data tugas tidak dapat disimpan di browser.",
      });
    }
  }
  
  // ==========================================
  // 3. UTILITY FUNCTIONS
  // ==========================================
  
  /**
   * Menghindari HTML injection dari input pengguna.
   * @param {string} value - Teks yang akan diamankan.
   * @returns {string} Teks yang sudah di-escape.
   */
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
  
      return entities[character];
    });
  }
  
  /**
   * Menampilkan tanggal hari ini.
   */
  function displayCurrentDate() {
    const today = new Date();
  
    currentDateElement.textContent = today.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  
  /**
   * Mengubah tanggal menjadi format Indonesia.
   * @param {string} date - Tanggal format YYYY-MM-DD.
   * @returns {string} Tanggal format Indonesia.
   */
  function formatDate(date) {
    if (!date) return "-";
  
    const [year, month, day] = date.split("-");
  
    return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  
  /**
   * Membuat ID unik untuk setiap tugas.
   * @returns {string} ID tugas.
   */
  function generateTaskId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  
  // ==========================================
  // 4. SUMMARY
  // ==========================================
  
  /**
   * Memperbarui ringkasan jumlah tugas.
   */
  function updateSummary() {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
  
    totalTasksElement.textContent = total;
    completedTasksElement.textContent = completed;
    pendingTasksElement.textContent = pending;
  }
  
  // ==========================================
  // 5. TASK RENDERING
  // ==========================================
  
  /**
   * Menampilkan daftar tugas berdasarkan pencarian dan filter.
   */
  function renderTasks() {
    const keyword = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;
  
    const filteredTasks = tasks.filter((task) => {
      const matchesKeyword =
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword);
  
      const matchesCategory =
        selectedCategory === "all" ||
        task.category === selectedCategory;
  
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "completed" && task.completed) ||
        (selectedStatus === "pending" && !task.completed);
  
      return matchesKeyword && matchesCategory && matchesStatus;
    });
  
    if (filteredTasks.length === 0) {
      taskList.innerHTML = `
        <div class="text-center py-5">
          <p class="text-muted mb-0">
            Belum ada tugas yang sesuai.
          </p>
        </div>
      `;
  
      return;
    }
  
    taskList.innerHTML = filteredTasks
      .map(
        (task) => `
          <div class="task-item ${
            task.completed ? "task-completed" : ""
          }" data-id="${escapeHTML(task.id)}">
  
            <div class="task-info">
              <input
                type="checkbox"
                class="task-checkbox"
                data-action="toggle"
                ${task.completed ? "checked" : ""}
                aria-label="Tandai ${escapeHTML(task.title)} selesai"
              />
  
              <div class="task-details">
                <h3 class="task-title">
                  ${escapeHTML(task.title)}
                </h3>
  
                <p class="task-description">
                  ${escapeHTML(task.description || "Tidak ada deskripsi")}
                </p>
  
                <div class="task-meta">
                  <span class="task-category">
                    ${escapeHTML(task.category)}
                  </span>
  
                  <span class="task-date">
                    Tenggat: ${formatDate(task.date)}
                  </span>
                </div>
              </div>
            </div>
  
            <div class="task-actions">
              <button
                class="btn btn-outline-dark btn-sm"
                data-action="edit"
              >
                Edit
              </button>
  
              <button
                class="btn btn-outline-danger btn-sm"
                data-action="delete"
              >
                Hapus
              </button>
            </div>
  
          </div>
        `,
      )
      .join("");
  }
  
  // ==========================================
  // 6. ADD TASK
  // ==========================================
  
  /**
   * Membuka modal untuk menambahkan tugas baru.
   */
  function openAddTaskModal() {
    taskForm.reset();
    taskIdInput.value = "";
    modalTitle.textContent = "Tambah Tugas";
  
    taskModal.show();
  }
  
  addTaskBtn.addEventListener("click", openAddTaskModal);
  
  // ==========================================
  // 7. EDIT TASK
  // ==========================================
  
  /**
   * Membuka modal dengan data tugas yang dipilih.
   * @param {string} id - ID tugas.
   */
  function editTask(id) {
    const task = tasks.find((item) => item.id === id);
  
    if (!task) return;
  
    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskDescriptionInput.value = task.description;
    taskCategoryInput.value = task.category;
    taskDateInput.value = task.date;
  
    modalTitle.textContent = "Edit Tugas";
  
    taskModal.show();
  }
  
  // ==========================================
  // 8. DELETE TASK
  // ==========================================
  
  /**
   * Menghapus tugas setelah konfirmasi pengguna.
   * @param {string} id - ID tugas.
   */
  async function deleteTask(id) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus tugas?",
      text: "Tugas yang dihapus tidak dapat dikembalikan.",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#222222",
    });
  
    if (!result.isConfirmed) return;
  
    tasks = tasks.filter((task) => task.id !== id);
  
    saveTasks();
    renderAll();
  
    Swal.fire({
      icon: "success",
      title: "Tugas dihapus",
      text: "Tugas berhasil dihapus.",
      timer: 1500,
      showConfirmButton: false,
    });
  }
  
  // ==========================================
  // 9. TOGGLE TASK STATUS
  // ==========================================
  
  /**
   * Mengubah status penyelesaian tugas.
   * @param {string} id - ID tugas.
   */
  function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
  
    if (!task) return;
  
    task.completed = !task.completed;
    task.completedAt = task.completed
      ? new Date().toISOString()
      : null;
  
    saveTasks();
    renderAll();
  }
  
  // ==========================================
  // 10. TASK EVENT DELEGATION
  // ==========================================
  
  taskList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
  
    if (!button) return;
  
    const taskItem = button.closest(".task-item");
    const id = taskItem.dataset.id;
    const action = button.dataset.action;
  
    if (action === "edit") {
      editTask(id);
    }
  
    if (action === "delete") {
      deleteTask(id);
    }
  });
  
  taskList.addEventListener("change", function (event) {
    if (!event.target.matches('[data-action="toggle"]')) return;
  
    const taskItem = event.target.closest(".task-item");
  
    toggleTask(taskItem.dataset.id);
  });
  
  // ==========================================
  // 11. FORM SUBMISSION
  // ==========================================
  
  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
  
    const id = taskIdInput.value;
  
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const category = taskCategoryInput.value;
    const date = taskDateInput.value;
  
    if (!title || !category || !date) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Silakan lengkapi nama, kategori, dan tanggal tugas.",
      });
  
      return;
    }
  
    if (id) {
      // Update existing task
      const task = tasks.find((item) => item.id === id);
  
      if (!task) return;
  
      task.title = title;
      task.description = description;
      task.category = category;
      task.date = date;
  
      Swal.fire({
        icon: "success",
        title: "Tugas diperbarui",
        text: "Perubahan tugas berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      // Create new task
      const newTask = {
        id: generateTaskId(),
        title,
        description,
        category,
        date,
        completed: false,
        completedAt: null,
      };
  
      tasks.push(newTask);
  
      Swal.fire({
        icon: "success",
        title: "Tugas ditambahkan",
        text: "Tugas baru berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  
    saveTasks();
    renderAll();
    taskModal.hide();
  });
  
  // ==========================================
  // 12. SEARCH AND FILTER
  // ==========================================
  
  searchInput.addEventListener("input", renderTasks);
  categoryFilter.addEventListener("change", renderTasks);
  statusFilter.addEventListener("change", renderTasks);
  
  // ==========================================
  // 13. PRODUCTIVITY CHART
  // ==========================================
  
  let productivityChart = null;
  
  /**
   * Membuat grafik jumlah tugas yang diselesaikan
   * selama tujuh hari terakhir.
   */
  function renderProductivityChart() {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js tidak tersedia.");
      return;
    }
  
    const labels = [];
    const completedCounts = [];
  
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
  
      date.setDate(date.getDate() - i);
  
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
  
      const dateKey = `${year}-${month}-${day}`;
  
      labels.push(
        date.toLocaleDateString("id-ID", {
          weekday: "short",
        }),
      );
  
      const count = tasks.filter((task) => {
        if (!task.completedAt) return false;
  
        const completedDate = new Date(task.completedAt);
  
        return (
          completedDate.getFullYear() === year &&
          completedDate.getMonth() === date.getMonth() &&
          completedDate.getDate() === date.getDate()
        );
      }).length;
  
      completedCounts.push(count);
    }
  
    const chartData = {
      labels,
      datasets: [
        {
          label: "Tugas Selesai",
          data: completedCounts,
          backgroundColor: "#333333",
          borderColor: "#333333",
          borderWidth: 1,
          borderRadius: 5,
        },
      ],
    };
  
    if (productivityChart) {
      productivityChart.data = chartData;
      productivityChart.update();
      return;
    }
  
    const chartCanvas = getElement("productivityChart");
  
    productivityChart = new Chart(chartCanvas, {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1,
            },
          },
        },
      },
    });
  }
  
  // ==========================================
  // 14. RENDER ALL
  // ==========================================
  
  /**
   * Memperbarui seluruh tampilan dashboard.
   */
  function renderAll() {
    updateSummary();
    renderTasks();
    renderProductivityChart();
  }
  
  // ==========================================
  // 15. INITIALIZATION
  // ==========================================
  
  /**
   * Menjalankan fungsi awal aplikasi.
   */
  function initApp() {
    displayCurrentDate();
    renderAll();
  
    console.log("Ruang Produktif berhasil dijalankan.");
  }
  
  initApp();