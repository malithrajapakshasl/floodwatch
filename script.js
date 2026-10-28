
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue
} from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// 1. Replace these example values with your Firebase config.
const firebaseConfig = {
  apiKey: "AIzaSyDUotupFmIU2M8t2bY3N5ar8w93ecGvkX0",
  authDomain: "floodwatch-b1416.firebaseapp.com",
  databaseURL: "https://floodwatch-b1416-default-rtdb.firebaseio.com",
  projectId: "floodwatch-b1416",
  storageBucket: "floodwatch-b1416.firebasestorage.app",
  messagingSenderId: "831210558183",
  appId: "1:831210558183:web:a93573126c58f798c18842"
};

// 2. Connect to Firebase.
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 3. Listen for live data at /floodData.
const floodRef = ref(db, "floodData");

const connection = document.getElementById("connection");

function updateDashboard(data) {
  const level = Number(data.waterLevel);
  const distance = Number(data.distance);
  const maximum = Number(data.maximumLevel);
  const warning = Number(data.warningLevel);
  const danger = Number(data.dangerLevel);

  if (
    !Number.isFinite(level) ||
    !Number.isFinite(distance) ||
    !Number.isFinite(maximum) ||
    !Number.isFinite(warning) ||
    !Number.isFinite(danger) ||
    maximum <= 0 ||
    level < 0 ||
    level > maximum
  ) {
    document.getElementById("status").textContent = "INVALID DATA";
    return;
  }

  const percent = (level / maximum) * 100;

  document.getElementById("level").textContent =
    level.toFixed(1);

  document.getElementById("distance").textContent =
    `Sensor distance: ${distance.toFixed(1)} cm`;

  document.getElementById("fill").style.width =
    `${percent}%`;

  let status = "NORMAL";
  let message = "Water level is within the normal range.";

  if (level >= danger) {
    status = "DANGER";
    message = "Critical water level! Check flood conditions.";
  } else if (level >= warning) {
    status = "WARNING";
    message = "Water is rising. Stay alert.";
  }

  document.getElementById("status").textContent = status;
  document.getElementById("statusText").textContent = message;

  document.getElementById("status").style.color =
    status === "DANGER" ? "#dc2626" :
    status === "WARNING" ? "#d97706" : "#16a34a";

  const timestamp = Number(data.updatedAt);

  document.getElementById("updated").textContent =
    Number.isFinite(timestamp) && timestamp > 0
      ? new Date(timestamp).toLocaleTimeString()
      : new Date().toLocaleTimeString();

  document.getElementById("historyText").textContent =
    `Current water level: ${percent.toFixed(1)}% of maximum.`;
}

// 4. Receive updates whenever Firebase data changes.
onValue(
  floodRef,
  (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      connection.textContent = "NO DATA";
      document.getElementById("status").textContent = "NO DATA";
      document.getElementById("statusText").textContent =
        "Waiting for the ESP32 to send data.";
      return;
    }

    updateDashboard(data);
    connection.textContent = "CONNECTED";
  },
  (error) => {
    connection.textContent = "ERROR";
    document.getElementById("status").textContent =
      "Connection error";
    document.getElementById("statusText").textContent =
      error.message;
    console.error("Firebase error:", error);
  }
);
