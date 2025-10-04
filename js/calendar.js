import { calendarEl, currentMonthYearEl, historyModal, historyModalContent, historyModalTitle, historyModalList, prevMonthBtn, nextMonthBtn } from './constants.js';
import { getState, setCurrentDate } from './state.js';
import { openModal } from './ui.js';

const showDayHistory = (dateStr) => {
    const { completedMeds } = getState();
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
                    noteHistoryHTML = `<p class=\"text-xs text-gray-500 dark:text-gray-400 italic mt-1\">Nota: ${med.notes}</p>`;
                }

                div.innerHTML = `
                    <div class=\"flex items-center justify-between\">
                        <div class=\"flex items-center\">
                            <span class=\"completed-dot mr-3\" style=\"background-color: ${med.color};\"></span>
                            <span>${med.name}</span>
                        </div>
                        <span class=\"font-semibold text-gray-600 dark:text-gray-400\">${med.timeTaken} hs</span>
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

export const renderCalendar = () => {
    const { currentDate, completedMeds } = getState();
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

export const setupCalendarNav = () => {
    prevMonthBtn.addEventListener("click", () => {
        const { currentDate } = getState();
        currentDate.setMonth(currentDate.getMonth() - 1);
        setCurrentDate(currentDate);
        renderCalendar();
    });

    nextMonthBtn.addEventListener("click", () => {
        const { currentDate } = getState();
        currentDate.setMonth(currentDate.getMonth() + 1);
        setCurrentDate(currentDate);
        renderCalendar();
    });
};
