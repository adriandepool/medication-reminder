// Elementos del DOM
export const addMedBtn = document.getElementById("addMedBtn");
export const exportPdfBtn = document.getElementById("exportPdfBtn");
export const backupBtn = document.getElementById("backupBtn");
export const restoreBtn = document.getElementById("restoreBtn");
export const importFile = document.getElementById("importFile");
export const themeToggle = document.getElementById("theme-toggle");
export const themeIconLight = document.getElementById("theme-icon-light");
export const themeIconDark = document.getElementById("theme-icon-dark");
export const enableNotificationsBtn = document.getElementById("enableNotificationsBtn");

export const medModal = document.getElementById("medModal");
export const medModalContent = document.getElementById("medModalContent");
export const cancelBtn = document.getElementById("cancelBtn");
export const medForm = document.getElementById("medForm");
export const medicationList = document.getElementById("medicationList");
export const modalTitle = document.getElementById("modalTitle");
export const medIdInput = document.getElementById("medId");
export const medNameInput = document.getElementById("medName");
export const medColorInput = document.getElementById("medColor");
export const medQuantityInput = document.getElementById("medQuantity");
export const medNotesInput = document.getElementById("medNotes");
export const quantitySection = document.getElementById("quantity-section");
export const quantityLabel = document.querySelector(
  'label[for="medQuantity"]'
);
export const specificDaysToggle =
  document.getElementById("specificDaysToggle");
export const daysOfWeekContainer = document.getElementById("daysOfWeek");
export const dosesContainer = document.getElementById("dosesContainer");
export const addDoseBtn = document.getElementById("addDoseBtn");
export const emptyState = document.getElementById("empty-state");

// Modal de confirmación
export const confirmationModal = document.getElementById("confirmationModal");
export const confirmationModalContent = document.getElementById(
  "confirmationModalContent"
);
export const confirmMedText = document.getElementById("confirmMedText");
export const confirmTakenBtn = document.getElementById("confirmTakenBtn");
export const snoozeBtn = document.getElementById("snoozeBtn");
export const confirmSkipBtn = document.getElementById("confirmSkipBtn");
export const confirmMedIdInput = document.getElementById("confirmMedId");

// Modal de historial
export const historyModal = document.getElementById("historyModal");
export const historyModalContent = document.getElementById(
  "historyModalContent"
);
export const historyModalTitle = document.getElementById("historyModalTitle");
export const historyModalList = document.getElementById("historyModalList");
export const closeHistoryBtn = document.getElementById("closeHistoryBtn");

// Modal de confirmación de borrado
export const deleteConfirmModal =
  document.getElementById("deleteConfirmModal");
export const deleteConfirmModalContent = document.getElementById(
  "deleteConfirmModalContent"
);
export const deleteConfirmText = document.getElementById("deleteConfirmText");
export const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
export const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

// Modal de confirmación de importación
export const importConfirmModal =
  document.getElementById("importConfirmModal");
export const importConfirmModalContent = document.getElementById(
  "importConfirmModalContent"
);
export const cancelImportBtn = document.getElementById("cancelImportBtn");
export const confirmImportBtn = document.getElementById("confirmImportBtn");

// Calendario
export const calendarEl = document.getElementById("calendar");
export const currentMonthYearEl = document.getElementById("currentMonthYear");
export const prevMonthBtn = document.getElementById("prevMonth");
export const nextMonthBtn = document.getElementById("nextMonth");
