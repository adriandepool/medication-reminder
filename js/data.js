import { importConfirmModal, importConfirmModalContent, importFile } from './constants.js';
import { getState, setMedications, setCompletedMeds, setDataToImport } from './state.js';
import { openModal, closeModal } from './ui.js';
import { renderMedications } from './medications.js';
import { renderCalendar } from './calendar.js';
import { sendMedicationsToSW } from './notifications.js';

export const exportToPDF = () => {
    const { medications, completedMeds, currentDate } = getState();
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
        `Historial de Tomas - ${currentDate.toLocaleString(
        "es-ES",
        { month: "long" }
    )} ${currentDate.getFullYear()}`,
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

export const exportData = () => {
    const { medications, completedMeds } = getState();
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

export const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.medications && importedData.completedMeds) {
                setDataToImport(importedData);
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

export const handleConfirmImport = () => {
    const { dataToImport } = getState();
    if (dataToImport) {
        setMedications(dataToImport.medications);
        setCompletedMeds(dataToImport.completedMeds);
        renderMedications();
        renderCalendar();
        sendMedicationsToSW();
    }
    closeModal(importConfirmModal, importConfirmModalContent);
    setDataToImport(null);
};
