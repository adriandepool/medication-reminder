import {
    addMedBtn,
    exportPdfBtn,
    backupBtn,
    restoreBtn,
    importFile,
    themeToggle,
    medModal,
    medModalContent,
    cancelBtn,
    medForm,
    medicationList,
    modalTitle,
    medIdInput,
    medColorInput,
    quantitySection,
    quantityLabel,
    medQuantityInput,
    specificDaysToggle,
    daysOfWeekContainer,
    dosesContainer,
    addDoseBtn,
    confirmationModal,
    confirmationModalContent,
    confirmTakenBtn,
    snoozeBtn,
    confirmSkipBtn,
    historyModal,
    historyModalContent,
    closeHistoryBtn,
    deleteConfirmModal,
    deleteConfirmModalContent,
    cancelDeleteBtn,
    confirmDeleteBtn,
    importConfirmModal,
    importConfirmModalContent,
    cancelImportBtn,
    confirmImportBtn,
} from './constants.js';

import { applyTheme, createTimeInput, openModal, closeModal } from './ui.js';
import { renderMedications, handleMedFormSubmit, handleMedicationListClick, handleConfirmDelete, markMedAsTaken } from './medications.js';
import { renderCalendar, setupCalendarNav } from './calendar.js';
import { registerServiceWorker, setupNotifications, updateNotificationButton, showNextMedInQueue } from './notifications.js';
import { exportToPDF, exportData, handleFileImport, handleConfirmImport } from './data.js';

document.addEventListener("DOMContentLoaded", () => {
    // --- Inicialización ---
    const initialize = () => {
        // Cargar tema
        const savedTheme = localStorage.getItem("theme") || "light";
        applyTheme(savedTheme);

        // Renderizar contenido inicial
        renderMedications();
        renderCalendar();

        // Configurar notificaciones
        updateNotificationButton();
        setupNotifications();
        registerServiceWorker();

        // Configurar navegación del calendario
        setupCalendarNav();
    };

    // --- Event Listeners ---

    // Tema
    themeToggle.addEventListener("click", () => {
        const currentTheme = localStorage.getItem("theme") || "light";
        const newTheme = currentTheme === "light" ? "dark" : "light";
        applyTheme(newTheme);
    });

    // Modales
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

    cancelBtn.addEventListener("click", () => closeModal(medModal, medModalContent));
    confirmSkipBtn.addEventListener("click", () => closeModal(confirmationModal, confirmationModalContent, showNextMedInQueue));
    closeHistoryBtn.addEventListener("click", () => closeModal(historyModal, historyModalContent));
    cancelDeleteBtn.addEventListener("click", () => closeModal(deleteConfirmModal, deleteConfirmModalContent));
    cancelImportBtn.addEventListener("click", () => closeModal(importConfirmModal, importConfirmModalContent));

    medModal.addEventListener("click", (e) => {
        if (e.target === medModal) closeModal(medModal, medModalContent);
    });
    historyModal.addEventListener("click", (e) => {
        if (e.target === historyModal) closeModal(historyModal, historyModalContent);
    });
    deleteConfirmModal.addEventListener("click", (e) => {
        if (e.target === deleteConfirmModal) closeModal(deleteConfirmModal, deleteConfirmModalContent);
    });
    importConfirmModal.addEventListener("click", (e) => {
        if (e.target === importConfirmModal) closeModal(importConfirmModal, importConfirmModalContent);
    });

    specificDaysToggle.addEventListener("change", (e) => {
        daysOfWeekContainer.classList.toggle("hidden", !e.target.checked);
    });

    // Dosis
    addDoseBtn.addEventListener("click", () => createTimeInput());

    // Medicamentos
    medForm.addEventListener("submit", handleMedFormSubmit);
    medicationList.addEventListener("click", handleMedicationListClick);
    confirmDeleteBtn.addEventListener("click", handleConfirmDelete);
    confirmTakenBtn.addEventListener("click", () => {
        const medId = document.getElementById("confirmMedId").value;
        markMedAsTaken(medId);
        closeModal(confirmationModal, confirmationModalContent, showNextMedInQueue);
    });
    snoozeBtn.addEventListener("click", () => {
        closeModal(confirmationModal, confirmationModalContent, showNextMedInQueue);
    });


    // Datos
    backupBtn.addEventListener("click", exportData);
    restoreBtn.addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", handleFileImport);
    confirmImportBtn.addEventListener("click", handleConfirmImport);
    exportPdfBtn.addEventListener("click", exportToPDF);


    // Iniciar la aplicación
    initialize();
});
