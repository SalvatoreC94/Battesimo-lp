const CONFIG = {
    dateISO: "2025-10-11T19:00:00+02:00",
    whatsappNumber: "393511495299",
    recipientName: "Alessia",
    reception: { lat: 40.7714452, lng: 14.5963169 },
    church: { lat: 40.7338691, lng: 14.5722424 }
};

// --- AUDIO ---
const audio = document.getElementById("bgAudio");
const audioToggle = document.getElementById("audioToggle");
const audioIcon = audioToggle.querySelector(".audio-icon");

// Unmute audio al primo click
document.body.addEventListener("click", () => {
    if (audio.muted) {
        audio.muted = false;
        audio.play().catch(() => {
            // Gestione errore autoplay bloccato
            console.log("Autoplay bloccato, l'utente deve cliccare il pulsante audio");
        });
        updateAudioIcon();
    }
}, { once: true });

// Toggle audio con bottone
audioToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (audio.paused) {
        audio.play().catch(() => {
            console.log("Impossibile riprodurre l'audio");
        });
    } else {
        audio.pause();
    }
    updateAudioIcon();
});

// Aggiorna icona audio
function updateAudioIcon() {
    if (audio.paused || audio.muted) {
        audioIcon.textContent = "🔇";
        audioToggle.setAttribute("aria-label", "Attiva musica di sottofondo");
    } else {
        audioIcon.textContent = "🔊";
        audioToggle.setAttribute("aria-label", "Disattiva musica di sottofondo");
    }
}

// Ascolta eventi audio per aggiornare l'icona
audio.addEventListener("play", updateAudioIcon);
audio.addEventListener("pause", updateAudioIcon);

// Stop musica quando si lascia la pagina
window.addEventListener("beforeunload", () => {
    const audio = document.getElementById("bgAudio");
    if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
    }
});

// Stop anche quando la scheda non è visibile
document.addEventListener("visibilitychange", () => {
    const audio = document.getElementById("bgAudio");
    if (document.hidden && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
    }
});

// --- RSVP (WhatsApp + memoria locale) ---
const yesLink = document.getElementById("yesLink");
const noLink = document.getElementById("noLink");
const rsvpFeedback = document.getElementById("rsvpFeedback");

const yesMsg = `Ciao ${CONFIG.recipientName}, certo che ci sarò! ❤️🥂`;
const noMsg = `Ciao ${CONFIG.recipientName}, purtroppo non potrò esserci 😭`;

// Normalizza il numero (solo cifre)
const phone = CONFIG.whatsappNumber.replace(/\D/g, "");

// Usa api.whatsapp.com per compatibilità iOS/Android
const WA_BASE = "https://api.whatsapp.com/send?phone=";
yesLink.href = `${WA_BASE}${phone}&text=${encodeURIComponent(yesMsg)}`;
noLink.href = `${WA_BASE}${phone}&text=${encodeURIComponent(noMsg)}`;

// Funzione per bloccare dopo risposta
function disableRSVP() {
    document.querySelectorAll(".answers a").forEach(l => {
        l.style.pointerEvents = "none";
        l.style.opacity = "0.5";
    });
}

// Funzione per mostrare feedback
function showFeedback(message) {
    rsvpFeedback.textContent = message;
    rsvpFeedback.classList.add("show");
    setTimeout(() => {
        rsvpFeedback.classList.remove("show");
    }, 5000);
}

// Se già risposto, disabilita e mostra messaggio
const savedAnswer = localStorage.getItem("rsvpAnswer");
if (savedAnswer) {
    disableRSVP();
    const message = savedAnswer === "yes"
        ? "Grazie per aver confermato! ❤️"
        : "Grazie per averci avvisato";
    showFeedback(message);
}

// Memorizza risposta
yesLink.addEventListener("click", () => {
    setTimeout(() => {
        localStorage.setItem("rsvpAnswer", "yes");
        disableRSVP();
        showFeedback("Grazie! Non vediamo l'ora di vederti! ❤️🥂");
    }, 800);
});

noLink.addEventListener("click", () => {
    setTimeout(() => {
        localStorage.setItem("rsvpAnswer", "no");
        disableRSVP();
        showFeedback("Grazie per averci avvisato. Ci mancherai! 💙");
    }, 800);
});

// --- MAPS ---
document.getElementById("chiesa").href =
    `https://www.google.com/maps/dir/?api=1&destination=${CONFIG.church.lat},${CONFIG.church.lng}`;
document.getElementById("ristorante").href =
    `https://www.google.com/maps/dir/?api=1&destination=${CONFIG.reception.lat},${CONFIG.reception.lng}`;

// --- CALENDARIO ---
function formatDateLocal(d) {
    const pad = n => (n < 10 ? '0' + n : n);
    return (
        d.getFullYear().toString() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) + 'T' +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        pad(d.getSeconds())
    );
}

const start = new Date(CONFIG.dateISO);
const end = new Date(start.getTime() + 4 * 60 * 60000); // durata evento 4h
const userAgent = navigator.userAgent || navigator.vendor || window.opera;
const addToCal = document.getElementById("addToCal");

if (/android/i.test(userAgent)) {
    // Android → Google Calendar
    addToCal.href =
        `https://www.google.com/calendar/render?action=TEMPLATE&text=Battesimo di Giulia` +
        `&dates=${formatDateLocal(start)}/${formatDateLocal(end)}` +
        `&details=Festeggeremo insieme il Battesimo di Giulia` +
        `&location=Nuova Chiesa di Costantinopoli, Angri`;
} else {
    // iOS + Desktop → ICS
    addToCal.href = "battesimo.ics";
}

// --- PORTE ---
const seal = document.getElementById("seal");
const cover = document.getElementById("cover");

function openDoors() {
    cover.classList.add("open");
    setTimeout(() => {
        cover.style.display = "none";
    }, 1500);
}

seal.onclick = openDoors;

// Supporto accessibilità tastiera
seal.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDoors();
    }
});
