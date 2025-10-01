let medications = [];
let checkInterval;
let notifiedToday = [];
let lastCheckDate = null;

const resetDailyState = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (lastCheckDate !== today) {
        notifiedToday = [];
        lastCheckDate = today;
    }
};

const checkMedicationTime = () => {
    resetDailyState();

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    medications.forEach((med) => {
        const isDaily = !med.days || med.days.length === 0;
        const isToday = med.days && med.days.includes(currentDay);

        if (isDaily || isToday) {
            med.times.forEach((time) => {
                const notificationId = `${med.id}-${time}`;
                // Comprueba si la hora de la dosis ya pasó o es la actual, y si no ha sido notificada hoy
                if (time <= currentTime && !notifiedToday.includes(notificationId)) {
                    showNotification(med, time);
                    notifiedToday.push(notificationId);
                }
            });
        }
    });
};

const showNotification = (med, time) => {
    const notificationText = `Es hora de tu dosis de las ${time} de ${med.name}.`;
    const notificationTitle = "Recordatorio de Medicamento";

    self.registration.showNotification(notificationTitle, {
        body: notificationText,
        icon: "https://cdn-icons-png.flaticon.com/512/893/893309.png",
        tag: med.id.toString() + '-' + time // Tag único por dosis
    });

    // Enviar mensaje a la página para mostrar el modal si está abierta
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({ type: "SHOW_CONFIRMATION_MODAL", payload: med });
        });
    });
};

self.addEventListener("message", (event) => {
    if (event.data.type === "UPDATE_MEDICATIONS") {
        medications = event.data.payload;
        // Al recibir nuevos medicamentos, reinicia el estado diario y comprueba inmediatamente
        resetDailyState();
        checkMedicationTime(); 

        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(checkMedicationTime, 15000);
    }
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    event.waitUntil(
        clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then(function (clientList) {
                if (clientList.length > 0) {
                    let client = clientList[0];
                    for (let i = 0; i < clientList.length; i++) {
                        if (clientList[i].focused) {
                            client = clientList[i];
                        }
                    }
                    return client.focus();
                }
                return clients.openWindow("/medication-reminder/");
            })
    );
});

self.addEventListener("activate", (event) => {
    // Inicia el intervalo cuando el SW se activa
    if (checkInterval) clearInterval(checkInterval);
    checkInterval = setInterval(checkMedicationTime, 15000);
});
