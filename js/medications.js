import { medicationList, emptyState, medForm, medIdInput, specificDaysToggle, daysOfWeekContainer, dosesContainer, medNameInput, medColorInput, medQuantityInput, medNotesInput, modalTitle, quantitySection, quantityLabel, medModal, medModalContent, deleteConfirmModal, deleteConfirmModalContent, deleteConfirmText, confirmDeleteBtn } from './constants.js';
import { getState, setMedications, setCompletedMeds } from './state.js';
import { openModal, closeModal, createTimeInput } from './ui.js';
import { sendMedicationsToSW } from './notifications.js';
import { renderCalendar } from './calendar.js';

// --- Lógica de Medicamentos (CRUD) ---
export const renderMedications = () => {
  const { medications } = getState();
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
            quantityText = `<span class=\"text-red-500 font-bold\">Quedan: ${med.quantity} dosis ⚠️</span>`;
          } else {
            quantityText = `<span class=\"text-gray-600 dark:text-gray-400\">Quedan: ${med.quantity} dosis</span>`;
          }
        }

        let notesHTML = "";
        if (med.notes) {
          notesHTML = `<p class=\"text-xs text-gray-500 dark:text-gray-400 mt-1 italic overflow-hidden text-ellipsis whitespace-nowrap max-w-xs\" title=\"${med.notes}\">Nota: ${med.notes}</p>`;
        }

        let daysText = "Diario";
        if (med.days && med.days.length > 0) {
          daysText =
            "Días: " + med.days.map((d) => dayNames[d]).join(", ");
        }

        div.innerHTML = `
                    <div class="flex items-center">
                        <span class="w-4 h-4 rounded-full mr-3" style="background-color: ${med.color || "#22c55e"}"></span>
                        <div class="overflow-hidden">
                            <p class="font-semibold text-teal-700 dark:text-teal-400">${med.name}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${med.times.join(
            ", "
          )} - <span class="font-medium">${daysText}</span></p>
                            <div class="text-sm mt-1">${quantityText}</div>
                            ${notesHTML}
                        </div>
                    </div>
                    <div class="space-x-2 flex items-center flex-shrink-0">
                        <button data-id="${med.id}" class="edit-btn text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                        </button>
                        <button data-id="${med.id}" class="delete-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                `;
        medicationList.appendChild(div);
      });
  }
};

export const handleMedFormSubmit = (e) => {
  e.preventDefault();
  const { medications } = getState();
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
  ).map((input) => input.value).sort();

  let newMedications;
  if (id) {
    // Editar
    newMedications = medications.map((med) => {
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
    newMedications = [...medications, medData];
  }

  setMedications(newMedications);
  renderMedications();
  sendMedicationsToSW();
  closeModal(medModal, medModalContent);
};

const openEditModal = (medToEdit) => {
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

const openDeleteModal = (medToDelete) => {
    deleteConfirmText.innerHTML = `¿Estás seguro de que quieres eliminar <strong>${medToDelete.name}</strong>?`;
    confirmDeleteBtn.dataset.id = medToDelete.id; // Store id in the button
    openModal(deleteConfirmModal, deleteConfirmModalContent);
}

export const handleMedicationListClick = (e) => {
    const { medications } = getState();
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
        const id = editBtn.dataset.id;
        const medToEdit = medications.find((med) => med.id == id);
        if (medToEdit) {
            openEditModal(medToEdit);
        }
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const medToDelete = medications.find((med) => med.id == id);
        if (medToDelete) {
            openDeleteModal(medToDelete);
        }
    }
};

export const handleConfirmDelete = () => {
  const { medications } = getState();
  const id = confirmDeleteBtn.dataset.id;
  const newMedications = medications.filter((med) => med.id != id);
  setMedications(newMedications);
  renderMedications();
  sendMedicationsToSW();
  closeModal(deleteConfirmModal, deleteConfirmModalContent);
};

export const markMedAsTaken = (medId) => {
  const { medications, completedMeds } = getState();
  const medIndex = medications.findIndex((m) => m.id == medId);
  if (medIndex === -1) return;

  const medTaken = medications[medIndex];
  let newMedications = [...medications];

  // Decrement quantity
  if (
    medTaken.quantity !== undefined &&
    medTaken.quantity !== null &&
    medTaken.quantity > 0
  ) {
    newMedications[medIndex] = { ...medTaken, quantity: medTaken.quantity - 1 };
    setMedications(newMedications);
    renderMedications();
    sendMedicationsToSW();
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  const timeTaken = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const newCompletedMeds = { ...completedMeds };
  if (!newCompletedMeds[today]) {
    newCompletedMeds[today] = [];
  }

  // Evita duplicados si se hace clic varias veces en el mismo minuto
  const alreadyTaken = newCompletedMeds[today].some(
    (m) => m.id === medId && m.timeTaken === timeTaken
  );

  if (!alreadyTaken) {
    newCompletedMeds[today].push({
      id: medId,
      color: medTaken.color,
      name: medTaken.name,
      timeTaken: timeTaken,
      notes: medTaken.notes,
    });
  }
  setCompletedMeds(newCompletedMeds);
  renderCalendar();
};
