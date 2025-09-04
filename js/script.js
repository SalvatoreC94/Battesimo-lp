const CONFIG = {
    dateISO: "2025-10-11T19:00:00+02:00",
    whatsappNumber: "393511495299",
    recipientName: "Alessia",
    church: { lat: 40.7436, lng: 14.5693 },
    reception: { lat: 40.7499, lng: 14.6123 }
};

// Countdown
// const countdownEl = document.getElementById("countdown");
// function tick() {
//     const eTs = new Date(CONFIG.dateISO).getTime(), now = Date.now();
//     let diff = eTs - now;
//     if (diff <= 0) { countdownEl.textContent = "Oggi è il grande giorno!"; return; }
//     const d = Math.floor(diff / 86400000); diff -= d * 86400000;
//     const h = Math.floor(diff / 3600000); diff -= h * 3600000;
//     const m = Math.floor(diff / 60000);
//     countdownEl.textContent = `Mancano ${d}g ${h}h ${m}m`;
// }
// setInterval(tick, 1000); tick();

// Audio unlock
document.body.addEventListener("click", () => {
    const audio = document.getElementById("bgAudio");
    if (audio.muted) { audio.muted = false; audio.play(); }
}, { once: true });

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

// RSVP con memoria locale
const yesLink = document.getElementById("yesLink");
const noLink = document.getElementById("noLink");

const yesMsg = `Ciao ${CONFIG.recipientName}, certo che ci sarò!❤️🥂`;
const noMsg = `Ciao ${CONFIG.recipientName}, purtroppo non potrò esserci.😭`;

yesLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(yesMsg)}`;
noLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(noMsg)}`;

// function disableRSVP() {
//     document.querySelectorAll(".answers a").forEach(l => {
//         l.style.pointerEvents = "none";
//         l.style.opacity = "0.5";
//     });
// }

// if (localStorage.getItem("rsvpAnswer")) {
//     disableRSVP();
// }

yesLink.addEventListener("click", () => {
    localStorage.setItem("rsvpAnswer", "yes");
    disableRSVP();
});

noLink.addEventListener("click", () => {
    localStorage.setItem("rsvpAnswer", "no");
    disableRSVP();
});

// Maps
document.getElementById("chiesa").href = `https://www.google.com/maps/dir/?api=1&destination=${CONFIG.church.lat},${CONFIG.church.lng}`;
document.getElementById("ristorante").href = `https://www.google.com/maps/dir/?api=1&destination=${CONFIG.reception.lat},${CONFIG.reception.lng}`;

// Funzione per date locali
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

// Google Calendar link (inizio alle 19:00)
const start = new Date(CONFIG.dateISO);
const end = new Date(start.getTime() + 4 * 60 * 60000);
document.getElementById("addToCal").href =
    `https://www.google.com/calendar/render?action=TEMPLATE&text=Battesimo di Giulia` +
    `&dates=${formatDateLocal(start)}/${formatDateLocal(end)}` +
    `&details=Festeggeremo insieme il Battesimo di Giulia` +
    `&location=Nuova Chiesa di Costantinopoli, Angri`;

// Porte
document.getElementById("seal").onclick = () => {
    document.getElementById("cover").classList.add("open");
    setTimeout(() => { document.getElementById("cover").style.display = "none"; }, 1500);
};
