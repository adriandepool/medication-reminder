document.addEventListener("DOMContentLoaded", () => {
        // Elementos del DOM
        const addMedBtn = document.getElementById("addMedBtn");
        const exportPdfBtn = document.getElementById("exportPdfBtn");
        const backupBtn = document.getElementById("backupBtn");
        const restoreBtn = document.getElementById("restoreBtn");
        const importFile = document.getElementById("importFile");
        const themeToggle = document.getElementById("theme-toggle");
        const themeIconLight = document.getElementById("theme-icon-light");
        const themeIconDark = document.getElementById("theme-icon-dark");
        const enableNotificationsBtn = document.getElementById("enableNotificationsBtn");

        const medModal = document.getElementById("medModal");
        const medModalContent = document.getElementById("medModalContent");
        const cancelBtn = document.getElementById("cancelBtn");
        const medForm = document.getElementById("medForm");
        const medicationList = document.getElementById("medicationList");
        const modalTitle = document.getElementById("modalTitle");
        const medIdInput = document.getElementById("medId");
        const medNameInput = document.getElementById("medName");
        const medColorInput = document.getElementById("medColor");
        const medQuantityInput = document.getElementById("medQuantity");
        const medNotesInput = document.getElementById("medNotes");
        const quantitySection = document.getElementById("quantity-section");
        const quantityLabel = document.querySelector(
          'label[for="medQuantity"]'
        );
        const specificDaysToggle =
          document.getElementById("specificDaysToggle");
        const daysOfWeekContainer = document.getElementById("daysOfWeek");
        const dosesContainer = document.getElementById("dosesContainer");
        const addDoseBtn = document.getElementById("addDoseBtn");
        const emptyState = document.getElementById("empty-state");

        // Modal de confirmación
        const confirmationModal = document.getElementById("confirmationModal");
        const confirmationModalContent = document.getElementById(
          "confirmationModalContent"
        );
        const confirmMedText = document.getElementById("confirmMedText");
        const confirmTakenBtn = document.getElementById("confirmTakenBtn");
        const snoozeBtn = document.getElementById("snoozeBtn");
        const confirmSkipBtn = document.getElementById("confirmSkipBtn");
        const confirmMedIdInput = document.getElementById("confirmMedId");

        // Modal de historial
        const historyModal = document.getElementById("historyModal");
        const historyModalContent = document.getElementById(
          "historyModalContent"
        );
        const historyModalTitle = document.getElementById("historyModalTitle");
        const historyModalList = document.getElementById("historyModalList");
        const closeHistoryBtn = document.getElementById("closeHistoryBtn");

        // Modal de confirmación de borrado
        const deleteConfirmModal =
          document.getElementById("deleteConfirmModal");
        const deleteConfirmModalContent = document.getElementById(
          "deleteConfirmModalContent"
        );
        const deleteConfirmText = document.getElementById("deleteConfirmText");
        const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
        const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

        // Modal de confirmación de importación
        const importConfirmModal =
          document.getElementById("importConfirmModal");
        const importConfirmModalContent = document.getElementById(
          "importConfirmModalContent"
        );
        const cancelImportBtn = document.getElementById("cancelImportBtn");
        const confirmImportBtn = document.getElementById("confirmImportBtn");

        // Calendario
        const calendarEl = document.getElementById("calendar");
        const currentMonthYearEl = document.getElementById("currentMonthYear");
        const prevMonthBtn = document.getElementById("prevMonth");
        const nextMonthBtn = document.getElementById("nextMonth");

        // Estado de la aplicación
        let medications = JSON.parse(localStorage.getItem("medications")) || [];
        let completedMeds =
          JSON.parse(localStorage.getItem("completedMeds")) || {};
        let currentDate = new Date();
        let notificationQueue = [];
        let dataToImport = null;

        // --- Lógica del Tema (Modo Oscuro) ---
        const applyTheme = (theme) => {
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
            themeIconLight.classList.add("hidden");
            themeIconDark.classList.remove("hidden");
          } else {
            document.documentElement.classList.remove("dark");
            themeIconLight.classList.remove("hidden");
            themeIconDark.classList.add("hidden");
          }
          localStorage.setItem("theme", theme);
        };

        themeToggle.addEventListener("click", () => {
          const currentTheme = localStorage.getItem("theme") || "light";
          const newTheme = currentTheme === "light" ? "dark" : "light";
          applyTheme(newTheme);
        });

        const updateNotificationButton = () => {
          if (Notification.permission === "granted") {
            enableNotificationsBtn.classList.add(
              "bg-green-500",
              "cursor-not-allowed"
            );
            enableNotificationsBtn.classList.remove(
              "bg-blue-500",
              "hover:bg-blue-600"
            );
            enableNotificationsBtn.title = "Las notificaciones ya están habilitadas";
            enableNotificationsBtn.disabled = true;
          } else {
            enableNotificationsBtn.classList.remove(
              "bg-green-500",
              "cursor-not-allowed"
            );
            enableNotificationsBtn.classList.add(
              "bg-blue-500",
              "hover:bg-blue-600"
            );
            enableNotificationsBtn.title = "Habilitar Notificaciones";
            enableNotificationsBtn.disabled = false;
          }
        };

        enableNotificationsBtn.addEventListener("click", () => {
          if (Notification.permission !== "granted") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification("¡Gracias!", {
                  body: "Has habilitado las notificaciones.",
                  icon: "https://cdn-icons-png.flaticon.com/512/893/893309.png",
                });
              }
              updateNotificationButton();
            });
          }
        });

        // --- Lógica de Dosis ---
        const createTimeInput = (time = "") => {
          const div = document.createElement("div");
          div.className = "flex items-center space-x-2";
          const input = document.createElement("input");
          input.type = "time";
          input.className =
            "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
          input.value = time;
          input.required = true;
          div.appendChild(input);

          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.innerHTML =
            '<svg class="w-6 h-6 text-red-500 hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
          removeBtn.onclick = () => {
            if (dosesContainer.children.length > 1) {
              div.remove();
            }
          };
          div.appendChild(removeBtn);
          dosesContainer.appendChild(div);
        };

        addDoseBtn.addEventListener("click", () => createTimeInput());

        // --- Lógica de Modales ---
        const openModal = (modal, content) => {
          modal.classList.remove("hidden");
          setTimeout(() => {
            content.classList.remove("scale-95", "opacity-0");
          }, 10);
        };

        const closeModal = (modal, content) => {
          content.classList.add("scale-95", "opacity-0");
          setTimeout(() => {
            modal.classList.add("hidden");
            if (modal === confirmationModal) {
              processNotificationQueue(); // Procesa la siguiente notificación en la cola
            }
          }, 200);
        };

        // Abrir modal de agregar medicamento
        addMedBtn.addEventListener("click", () => {
          modalTitle.textContent = "Agregar Medicamento";
          medForm.reset();
          medColorInput.value = "#22c55e";
          medIdInput.value = "";
          quantitySection.style.display = "block";
          quantityLabel.textContent = "Cantidad Inicial (dosis)";
          medQuantityInput.required = true;
          daysOfWeekContainer.classList.add("hidden");
          dosesContainer.innerHTML = "";
          createTimeInput();
          openModal(medModal, medModalContent);
        });

        // Cerrar modales
        cancelBtn.addEventListener("click", () =>
          closeModal(medModal, medModalContent)
        );
        confirmSkipBtn.addEventListener("click", () =>
          closeModal(confirmationModal, confirmationModalContent)
        );
        closeHistoryBtn.addEventListener("click", () =>
          closeModal(historyModal, historyModalContent)
        );
        cancelDeleteBtn.addEventListener("click", () =>
          closeModal(deleteConfirmModal, deleteConfirmModalContent)
        );
        cancelImportBtn.addEventListener("click", () =>
          closeModal(importConfirmModal, importConfirmModalContent)
        );

        medModal.addEventListener("click", (e) => {
          if (e.target === medModal) closeModal(medModal, medModalContent);
        });
        historyModal.addEventListener("click", (e) => {
          if (e.target === historyModal)
            closeModal(historyModal, historyModalContent);
        });
        deleteConfirmModal.addEventListener("click", (e) => {
          if (e.target === deleteConfirmModal)
            closeModal(deleteConfirmModal, deleteConfirmModalContent);
        });
        importConfirmModal.addEventListener("click", (e) => {
          if (e.target === importConfirmModal)
            closeModal(importConfirmModal, importConfirmModalContent);
        });

        specificDaysToggle.addEventListener("change", (e) => {
          if (e.target.checked) {
            daysOfWeekContainer.classList.remove("hidden");
          } else {
            daysOfWeekContainer.classList.add("hidden");
          }
        });

        // --- Lógica de Medicamentos (CRUD) ---
        const renderMedications = () => {
          medicationList.innerHTML = "";
          if (medications.length === 0) {
            medicationList.appendChild(emptyState);
            emptyState.style.display = "block";
          } else {
            emptyState.style.display = "none";
            const dayNames = ["D", "L", "M", "Mi", "J", "V", "S"];
            medications
              .sort((a, b) => a.times[0].localeCompare(b.times[0]))
              .forEach((med) => {
                const div = document.createElement("div");
                div.className =
                  "flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700";

                let quantityText = "";
                if (med.quantity !== undefined && med.quantity !== null) {
                  if (med.quantity <= 7) {
                    quantityText = `<span class="text-red-500 font-bold">Quedan: ${med.quantity} dosis ⚠️</span>`;
                  } else {
                    quantityText = `<span class="text-gray-600 dark:text-gray-400">Quedan: ${med.quantity} dosis</span>`;
                  }
                }

                let notesHTML = "";
                if (med.notes) {
                  notesHTML = `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1 italic overflow-hidden text-ellipsis whitespace-nowrap max-w-xs" title="${med.notes}">Nota: ${med.notes}</p>`;
                }

                let daysText = "Diario";
                if (med.days && med.days.length > 0) {
                  daysText =
                    "Días: " + med.days.map((d) => dayNames[d]).join(", ");
                }

                div.innerHTML = `
                            <div class="flex items-center">
                                <span class="w-4 h-4 rounded-full mr-3" style="background-color: ${
                                  med.color || "#22c55e"
                                };"></span>
                                <div class="overflow-hidden">
                                    <p class="font-semibold text-teal-700 dark:text-teal-400">${
                                      med.name
                                    }</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">${med.times.join(
                                      ", "
                                    )} - <span class="font-medium">${daysText}</span></p>
                                    <div class="text-sm mt-1">${quantityText}</div>
                                    ${notesHTML}
                                </div>
                            </div>
                            <div class="space-x-2 flex items-center flex-shrink-0">
                                <button data-id="${
                                  med.id
                                }" class="edit-btn text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                </button>
                                <button data-id="${
                                  med.id
                                }" class="delete-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        `;
                medicationList.appendChild(div);
              });
          }
        };

        medForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const id = medIdInput.value;
          const selectedDays = [];
          if (specificDaysToggle.checked) {
            daysOfWeekContainer
              .querySelectorAll("input:checked")
              .forEach((checkbox) => {
                selectedDays.push(parseInt(checkbox.value, 10));
              });
          }

          const times = Array.from(
            dosesContainer.querySelectorAll("input[type='time']")
          ).map((input) => input.value);

          if (id) {
            // Editar
            medications = medications.map((med) => {
              if (med.id == id) {
                return {
                  ...med,
                  name: medNameInput.value,
                  times: times,
                  color: medColorInput.value,
                  quantity: parseInt(medQuantityInput.value, 10),
                  notes: medNotesInput.value,
                  days: selectedDays,
                };
              }
              return med;
            });
          } else {
            // Crear
            const medData = {
              name: medNameInput.value,
              times: times,
              color: medColorInput.value,
              id: Date.now(),
              quantity: parseInt(medQuantityInput.value, 10),
              notes: medNotesInput.value,
              days: selectedDays,
            };
            medications.push(medData);
          }

          localStorage.setItem("medications", JSON.stringify(medications));
          renderMedications();
          closeModal(medModal, medModalContent);
        });

        medicationList.addEventListener("click", (e) => {
          const editBtn = e.target.closest(".edit-btn");
          const deleteBtn = e.target.closest(".delete-btn");

          if (editBtn) {
            const id = editBtn.dataset.id;
            const medToEdit = medications.find((med) => med.id == id);
            if (medToEdit) {
              modalTitle.textContent = "Editar Medicamento";
              medIdInput.value = medToEdit.id;
              medNameInput.value = medToEdit.name;

              dosesContainer.innerHTML = "";
              medToEdit.times.forEach((time) => createTimeInput(time));

              medColorInput.value = medToEdit.color || "#22c55e";
              quantityLabel.textContent = "Cantidad (dosis)";
              medQuantityInput.value = medToEdit.quantity;
              medNotesInput.value = medToEdit.notes || "";
              quantitySection.style.display = "block";
              medQuantityInput.required = true;

              // Populate days of week
              const hasSpecificDays =
                medToEdit.days && medToEdit.days.length > 0;
              specificDaysToggle.checked = hasSpecificDays;
              if (hasSpecificDays) {
                daysOfWeekContainer.classList.remove("hidden");
              } else {
                daysOfWeekContainer.classList.add("hidden");
              }
              daysOfWeekContainer.querySelectorAll("input").forEach((cb) => {
                cb.checked =
                  hasSpecificDays &&
                  medToEdit.days.includes(parseInt(cb.value, 10));
              });

              openModal(medModal, medModalContent);
            }
          }

          if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            const medToDelete = medications.find((med) => med.id == id);
            if (medToDelete) {
              deleteConfirmText.innerHTML = `¿Estás seguro de que quieres eliminar <strong>${medToDelete.name}</strong>?`;
              confirmDeleteBtn.dataset.id = id; // Store id in the button
              openModal(deleteConfirmModal, deleteConfirmModalContent);
            }
          }
        });

        confirmDeleteBtn.addEventListener("click", () => {
          const id = confirmDeleteBtn.dataset.id;
          medications = medications.filter((med) => med.id != id);
          localStorage.setItem("medications", JSON.stringify(medications));
          renderMedications();
          closeModal(deleteConfirmModal, deleteConfirmModalContent);
        });

        const markMedAsTaken = (medId) => {
          const medIndex = medications.findIndex((m) => m.id == medId);
          if (medIndex === -1) return;

          const medTaken = medications[medIndex];

          // Decrement quantity
          if (
            medTaken.quantity !== undefined &&
            medTaken.quantity !== null &&
            medTaken.quantity > 0
          ) {
            medications[medIndex].quantity--;
            localStorage.setItem("medications", JSON.stringify(medications));
            renderMedications();
          }

          const now = new Date();
          const today = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
          const timeTaken = now.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });

          if (!completedMeds[today]) {
            completedMeds[today] = [];
          }

          // Evita duplicados si se hace clic varias veces en el mismo minuto
          const alreadyTaken = completedMeds[today].some(
            (m) => m.id === medId && m.timeTaken === timeTaken
          );

          if (!alreadyTaken) {
            completedMeds[today].push({
              id: medId,
              color: medTaken.color,
              name: medTaken.name,
              timeTaken: timeTaken,
              notes: medTaken.notes,
            });
          }
          localStorage.setItem("completedMeds", JSON.stringify(completedMeds));
          renderCalendar();
        };

        // --- Lógica de Notificaciones ---
        const checkMedicationTime = () => {
          const now = new Date();
          const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
          const currentTime = `${now
            .getHours()
            .toString()
            .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

          const lastCheckDate = localStorage.getItem("lastNotificationDate");
          const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

          if (lastCheckDate !== todayStr) {
            localStorage.setItem("notifiedMedsToday", JSON.stringify([]));
            localStorage.setItem("lastNotificationDate", todayStr);
          }

          let notifiedMedsToday =
            JSON.parse(localStorage.getItem("notifiedMedsToday")) || [];

          medications.forEach((med) => {
            const isDaily = !med.days || med.days.length === 0;
            const isToday = med.days && med.days.includes(currentDay);

            if (isDaily || isToday) {
              med.times.forEach((time) => {
                const notificationId = `${med.id}-${time}`;
                if (
                  time === currentTime &&
                  !notifiedMedsToday.includes(notificationId)
                ) {
                  notificationQueue.push(med);
                  notifiedMedsToday.push(notificationId);
                }
              });
            }
          });

          if (notificationQueue.length > 0) {
            localStorage.setItem(
              "notifiedMedsToday",
              JSON.stringify(notifiedMedsToday)
            );
            processNotificationQueue(); // Procesa la cola
          }
        };

        const processNotificationQueue = () => {
          // Solo muestra un modal si no hay otro abierto y si hay elementos en la cola
          if (
            confirmationModal.classList.contains("hidden") &&
            notificationQueue.length > 0
          ) {
            const med = notificationQueue.shift(); // Saca el primer elemento
            showNotification(med);
          }
        };

        const showNotification = (med) => {
    const notificationText = `Es hora de tomar tu ${med.name}.`;

    if (Notification.permission === "granted") {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("Recordatorio de Medicamento", {
                    body: notificationText,
                    icon: "https://cdn-icons-png.flaticon.com/512/893/893309.png",
                    tag: med.id
                });
            });
        } else {
            new Notification("Recordatorio de Medicamento", {
                body: notificationText,
                icon: "https://cdn-icons-png.flaticon.com/512/893/893309.png",
            });
        }
    }

    // Mostrar modal de confirmación
    confirmMedIdInput.value = med.id;
    confirmMedText.textContent = `¿Ya tomaste tu ${med.name}?`;
    openModal(confirmationModal, confirmationModalContent);
};

        snoozeBtn.addEventListener("click", () => {
          const medId = confirmMedIdInput.value;
          const medToSnooze = medications.find((med) => med.id == medId);
          if (medToSnooze) {
            setTimeout(() => {
              showNotification(medToSnooze);
            }, 300000); // 5 minutos
          }
          closeModal(confirmationModal, confirmationModalContent);
        });

        confirmTakenBtn.addEventListener("click", () => {
          const medId = confirmMedIdInput.value;
          markMedAsTaken(medId);
          closeModal(confirmationModal, confirmationModalContent);
        });

        // --- Lógica del Calendario ---
        const showDayHistory = (dateStr) => {
          const date = new Date(dateStr + "T00:00:00");
          const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          };
          historyModalTitle.textContent = `Historial del ${date.toLocaleDateString(
            "es-ES",
            options
          )}`;

          const medsForDay = completedMeds[dateStr] || [];
          historyModalList.innerHTML = "";

          if (medsForDay.length > 0) {
            medsForDay
              .sort((a, b) => a.timeTaken.localeCompare(b.timeTaken))
              .forEach((med) => {
                const div = document.createElement("div");
                div.className = "p-2 bg-gray-50 dark:bg-gray-700/50 rounded";

                let noteHistoryHTML = "";
                if (med.notes) {
                  noteHistoryHTML = `<p class="text-xs text-gray-500 dark:text-gray-400 italic mt-1">Nota: ${med.notes}</p>`;
                }

                div.innerHTML = `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <span class="completed-dot mr-3" style="background-color: ${med.color};"></span>
                                    <span>${med.name}</span>
                                </div>
                                <span class="font-semibold text-gray-600 dark:text-gray-400">${med.timeTaken} hs</span>
                            </div>
                            ${noteHistoryHTML}
                        `;
                historyModalList.appendChild(div);
              });
          } else {
            historyModalList.innerHTML =
              '<p class="text-center text-gray-500 dark:text-gray-400">No se registraron tomas este día.</p>';
          }

          openModal(historyModal, historyModalContent);
        };

        const renderCalendar = () => {
          calendarEl.innerHTML = "";
          const month = currentDate.getMonth();
          const year = currentDate.getFullYear();

          currentMonthYearEl.textContent = `${currentDate.toLocaleString(
            "es-ES",
            { month: "long" }
          )} ${year}`;

          const firstDayOfMonth = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          for (let i = 0; i < firstDayOfMonth; i++) {
            calendarEl.innerHTML += `<div class="bg-gray-50 dark:bg-gray-700/50 rounded"></div>`;
          }

          for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement("div");
            dayEl.className =
              "calendar-day p-2 border border-gray-200 dark:border-gray-700 rounded text-center";

            const dayStr = `${year}-${(month + 1)
              .toString()
              .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
            const today = new Date();
            if (
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear()
            ) {
              dayEl.classList.add(
                "bg-teal-100",
                "dark:bg-teal-900/50",
                "font-bold"
              );
            }

            let dayContent = `<div>${day}</div>`;

            if (completedMeds[dayStr] && completedMeds[dayStr].length > 0) {
              dayEl.classList.add(
                "cursor-pointer",
                "hover:bg-gray-100",
                "dark:hover:bg-gray-700",
                "transition-colors"
              );
              dayEl.addEventListener("click", () => showDayHistory(dayStr));

              let dotsHTML =
                '<div class="mt-1 flex justify-center items-center space-x-1">';
              completedMeds[dayStr].forEach((completed) => {
                dotsHTML += `<span class="completed-dot" style="background-color: ${completed.color};"></span>`;
              });
              dotsHTML += "</div>";
              dayContent += dotsHTML;
            }
            dayEl.innerHTML = dayContent;
            calendarEl.appendChild(dayEl);
          }
        };

        prevMonthBtn.addEventListener("click", () => {
          currentDate.setMonth(currentDate.getMonth() - 1);
          renderCalendar();
        });

        nextMonthBtn.addEventListener("click", () => {
          currentDate.setMonth(currentDate.getMonth() + 1);
          renderCalendar();
        });

        const exportToPDF = () => {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          const margin = 10;
          let y = margin;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          doc.text("Reporte de Medicamentos", margin, y);
          y += 10;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text("Mis Medicamentos", margin, y);
          y += 8;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const dayNames = ["D", "L", "M", "Mi", "J", "V", "S"];

          medications.forEach((med) => {
            let daysText = "Diario";
            if (med.days && med.days.length > 0) {
              daysText = "Días: " + med.days.map((d) => dayNames[d]).join(", ");
            }

            doc.text(`- ${med.name}`, margin, y);
            y += 5;
            doc.text(`   Horarios: ${med.times.join(", ")}`, margin, y);
            y += 5;
            doc.text(`   Frecuencia: ${daysText}`, margin, y);
            y += 5;
            if (med.quantity !== null && med.quantity !== undefined) {
              doc.text(
                `   Cantidad restante: ${med.quantity} dosis`,
                margin,
                y
              );
              y += 5;
            }
            if (med.notes) {
              doc.text(`   Notas: ${med.notes}`, margin, y);
              y += 5;
            }
            y += 5;
          });

          y += 10;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text(
            `Historial de Tomas - ${currentMonthYearEl.textContent}`,
            margin,
            y
          );
          y += 8;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);

          const month = currentDate.getMonth();
          const year = currentDate.getFullYear();
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          for (let day = 1; day <= daysInMonth; day++) {
            const dayStr = `${year}-${(month + 1)
              .toString()
              .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

            if (completedMeds[dayStr] && completedMeds[dayStr].length > 0) {
              doc.setFont("helvetica", "bold");
              doc.text(`Día ${day}:`, margin, y);
              y += 5;
              doc.setFont("helvetica", "normal");

              completedMeds[dayStr].forEach((med) => {
                doc.text(
                  `   - ${med.name} (Tomada a las ${med.timeTaken} hs)`,
                  margin,
                  y
                );
                y += 5;
                if (y > 280) {
                  // page break
                  doc.addPage();
                  y = margin;
                }
              });
            }
          }

          doc.save("Reporte_Medicamentos.pdf");
        };

        const exportData = () => {
          const dataToExport = {
            medications: medications,
            completedMeds: completedMeds,
          };
          const dataStr = JSON.stringify(dataToExport, null, 2);
          const dataBlob = new Blob([dataStr], { type: "application/json" });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "Pastillero_Backup.json";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        };

        const handleFileImport = (event) => {
          const file = event.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const importedData = JSON.parse(e.target.result);
              if (importedData.medications && importedData.completedMeds) {
                dataToImport = importedData;
                openModal(importConfirmModal, importConfirmModalContent);
              } else {
                alert("El archivo de respaldo no tiene el formato correcto.");
              }
            } catch (error) {
              alert(
                "No se pudo leer el archivo. Asegúrate de que sea un archivo de respaldo válido."
              );
            }
          };
          reader.readAsText(file);
          importFile.value = "";
        };

        confirmImportBtn.addEventListener("click", () => {
          if (dataToImport) {
            medications = dataToImport.medications;
            completedMeds = dataToImport.completedMeds;
            localStorage.setItem("medications", JSON.stringify(medications));
            localStorage.setItem(
              "completedMeds",
              JSON.stringify(completedMeds)
            );
            renderMedications();
            renderCalendar();
          }
          closeModal(importConfirmModal, importConfirmModalContent);
          dataToImport = null;
        });

        backupBtn.addEventListener("click", exportData);
        restoreBtn.addEventListener("click", () => importFile.click());
        importFile.addEventListener("change", handleFileImport);
        exportPdfBtn.addEventListener("click", exportToPDF);

        // --- Inicialización ---
        const initialize = () => {

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/medication-reminder/sw.js')
                .then(registration => {
                    console.log('Service Worker registrado con éxito:', registration);
                })
                .catch(error => {
                    console.log('Error al registrar el Service Worker:', error);
                });
        }

          const savedTheme = localStorage.getItem("theme");
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          if (savedTheme) {
            applyTheme(savedTheme);
          } else if (prefersDark) {
            applyTheme("dark");
          } else {
            applyTheme("light");
          }

          renderMedications();
          renderCalendar();
          updateNotificationButton();
          setInterval(checkMedicationTime, 15000); // Revisa cada 15 segundos
          checkMedicationTime(); // Revisa al cargar la página
        };

        initialize();
      });