// Version: 4
let medications = [];
let completedMeds = {};
let checkInterval;
let notifiedToday = [];
let lastCheckDate = null;

const resetDailyState = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (lastCheckDate !== today) {
        notifiedToday = [];
        lastCheckDate = today;
        console.log("Nuevo día, reiniciando notificaciones.");
    }
};

const checkMedicationTime = () => {
    resetDailyState();

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const dosesToShow = [];

    const todaysTakenMedsLog = completedMeds[todayStr] || [];

    medications.forEach((med) => {
        const isDaily = !med.days || med.days.length === 0;
        const isToday = med.days && med.days.includes(currentDay);

        if (isDaily || isToday) {
            const timesTakenCount = todaysTakenMedsLog.filter(t => t.id == med.id).length;
            const dueScheduledTimes = med.times.filter(t => t <= currentTime);

            if (dueScheduledTimes.length > timesTakenCount) {
                const pendingDoses = dueScheduledTimes.slice(timesTakenCount);

                pendingDoses.forEach(dueTime => {
                    const notificationId = `${med.id}-${dueTime}`;
                    if (!notifiedToday.includes(notificationId)) {
                        dosesToShow.push({ med, time: dueTime });
                        notifiedToday.push(notificationId);
                    }
                });
            }
        }
    });

    if (dosesToShow.length > 0) {
        showNotifications(dosesToShow);
    }
};


const showNotifications = (doses) => {
    const notificationTitle = "Recordatorio de Medicamento";
    let notificationText;

    if (doses.length === 1) {
        const { med, time } = doses[0];
        notificationText = `Es hora de tu dosis de las ${time} de ${med.name}.`;
    } else {
        notificationText = `Tienes ${doses.length} dosis pendientes. Abre la app para revisarlas.`;
    }

    self.registration.showNotification(notificationTitle, {
        body: notificationText,
        icon: "https://cdn-icons-png.flaticon.com/512/893/893309.png",
        tag: 'medication-reminder'
    });

    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({ type: "SHOW_MODAL_QUEUE", payload: doses.map(d => d.med) });
        });
    });
};

self.addEventListener("message", (event) => {
    if (event.data.type === "UPDATE_MEDICATIONS") {
        medications = event.data.payload.medications || [];
        completedMeds = event.data.payload.completedMeds || {};
        console.log("Service Worker: Lista de medicamentos actualizada", medications);
        console.log("Service Worker: Historial de tomas actualizado", completedMeds);

        notifiedToday = [];

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
                return clients.openWindow("./");
            })
    );
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activado.");
    if (checkInterval) clearInterval(checkInterval);
    checkInterval = setInterval(checkMedicationTime, 15000);
    self.clients.claim();
});