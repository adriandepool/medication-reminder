import { confirmationModal, confirmationModalContent, confirmMedIdInput, confirmMedText, enableNotificationsBtn } from './constants.js';
import { getState, setModalQueue, shiftModalQueue } from './state.js';
import { openModal } from './ui.js';

// --- Lógica de Notificaciones y Service Worker ---
export const showNextMedInQueue = () => {
    const { modalQueue } = getState();
    if (modalQueue.length > 0) {
        const nextMed = shiftModalQueue();
        showConfirmationModal(nextMed);
    }
};

export const sendMedicationsToSW = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            if (registration.active) {
                const { medications, completedMeds } = getState();
                registration.active.postMessage({
                    type: 'UPDATE_MEDICATIONS',
                    payload: {
                        medications: medications,
                        completedMeds: completedMeds
                    }
                });
            }
        });
    }
};

const showConfirmationModal = (med) => {
    confirmMedIdInput.value = med.id;
    confirmMedText.textContent = `¿Ya tomaste tu ${med.name}?`;
    openModal(confirmationModal, confirmationModalContent);
};

export const updateNotificationButton = () => {
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

export const setupNotifications = () => {
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
};

export const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration);
                navigator.serviceWorker.ready.then(readyRegistration => {
                    console.log("Service Worker listo.");
                    sendMedicationsToSW();
                });
            })
            .catch(error => {
                console.log('Error al registrar el Service Worker:', error);
            });

        navigator.serviceWorker.onmessage = (event) => {
            if (event.data && event.data.type === 'SHOW_MODAL_QUEUE') {
                const meds = event.data.payload;
                if (meds && meds.length > 0) {
                    if (!confirmationModal.classList.contains('hidden')) {
                        return;
                    }
                    setModalQueue(meds);
                    showNextMedInQueue();
                }
            }
        };
    }
};
