// Estado de la aplicación
let medications = JSON.parse(localStorage.getItem("medications")) || [];
let completedMeds = JSON.parse(localStorage.getItem("completedMeds")) || {};
let currentDate = new Date();
let dataToImport = null;
let modalQueue = [];

export const getState = () => ({
    medications,
    completedMeds,
    currentDate,
    dataToImport,
    modalQueue,
});

export const setMedications = (newMedications) => {
    medications = newMedications;
    localStorage.setItem("medications", JSON.stringify(medications));
};

export const setCompletedMeds = (newCompletedMeds) => {
    completedMeds = newCompletedMeds;
    localStorage.setItem("completedMeds", JSON.stringify(completedMeds));
};

export const setCurrentDate = (newDate) => {
    currentDate = newDate;
};

export const setDataToImport = (data) => {
    dataToImport = data;
};

export const setModalQueue = (queue) => {
    modalQueue = queue;
};

export const shiftModalQueue = () => {
    return modalQueue.shift();
}
