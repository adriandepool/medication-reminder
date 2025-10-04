import { themeIconLight, themeIconDark, dosesContainer } from './constants.js';

// --- Lógica del Tema (Modo Oscuro) ---
export const applyTheme = (theme) => {
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

// --- Lógica de Dosis ---
export const createTimeInput = (time = "") => {
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

// --- Lógica de Modales ---
export const openModal = (modal, content) => {
  modal.classList.remove("hidden");
  setTimeout(() => {
    content.classList.remove("scale-95", "opacity-0");
  }, 10);
};

export const closeModal = (modal, content, callback) => {
  content.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
    if (callback) callback();
  }, 200);
};
