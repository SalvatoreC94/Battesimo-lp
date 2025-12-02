// Temi predefiniti
const themes = {
    classic: {
        primary: '#3d5a40',
        background: 'rgb(252, 242, 233)',
        accent: 'rgb(128, 128, 0)'
    },
    romantic: {
        primary: '#d4567d',
        background: '#fff5f8',
        accent: '#ff69b4'
    },
    ocean: {
        primary: '#1e3a5f',
        background: '#e8f4f8',
        accent: '#4a90e2'
    },
    sunset: {
        primary: '#e67e22',
        background: '#fef5e7',
        accent: '#f39c12'
    }
};

let selectedTheme = 'classic';

// Gestione selezione tema
document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedTheme = this.dataset.theme;

        const customColors = document.getElementById('customColors');
        if (selectedTheme === 'custom') {
            customColors.style.display = 'block';
        } else {
            customColors.style.display = 'none';
        }
    });
});

// Form submission
document.getElementById('configuratorForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const loading = document.getElementById('loading');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = e.target.querySelector('.generate-btn');

    // Show loading
    loading.classList.add('show');
    submitBtn.disabled = true;

    // Raccogli dati dal form
    const formData = {
        eventType: document.getElementById('eventType').value,
        personName: document.getElementById('personName').value,
        eventDate: document.getElementById('eventDate').value,
        eventTime: document.getElementById('eventTime').value,
        subtitle: document.getElementById('subtitle').value,
        location1: {
            name: document.getElementById('location1Name').value,
            address: document.getElementById('location1Address').value,
            lat: document.getElementById('location1Lat').value,
            lng: document.getElementById('location1Lng').value
        },
        location2: {
            name: document.getElementById('location2Name').value,
            address: document.getElementById('location2Address').value,
            lat: document.getElementById('location2Lat').value,
            lng: document.getElementById('location2Lng').value
        },
        recipientName: document.getElementById('recipientName').value,
        whatsappNumber: document.getElementById('whatsappNumber').value,
        theme: selectedTheme === 'custom' ? {
            primary: document.getElementById('primaryColor').value,
            background: document.getElementById('bgColor').value,
            accent: document.getElementById('accentColor').value
        } : themes[selectedTheme]
    };

    try {
        // Genera i file
        await generateLandingPage(formData);

        // Show success
        loading.classList.remove('show');
        successMessage.classList.add('show');

        setTimeout(() => {
            successMessage.classList.remove('show');
            submitBtn.disabled = false;
        }, 3000);

    } catch (error) {
        alert('Errore durante la generazione: ' + error.message);
        loading.classList.remove('show');
        submitBtn.disabled = false;
    }
});

// Genera la landing page
async function generateLandingPage(data) {
    const zip = new JSZip();

    // Formatta data
    const dateObj = new Date(data.eventDate + 'T' + data.eventTime);
    const dateISO = dateObj.toISOString().slice(0, 19) + '+02:00';
    const [year, month, day] = data.eventDate.split('-');
    const monthNames = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO',
                        'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];
    const dayNames = ['DOMENICA', 'LUNEDÌ', 'MARTEDÌ', 'MERCOLEDÌ', 'GIOVEDÌ', 'VENERDÌ', 'SABATO'];
    const dayName = dayNames[dateObj.getDay()];
    const monthName = monthNames[parseInt(month) - 1];

    // 1. Genera index.html
    const indexHTML = generateIndexHTML(data, dayName, day, monthName, year);
    zip.file('index.html', indexHTML);

    // 2. Genera style.css
    const styleCSS = generateStyleCSS(data.theme);
    zip.folder('css').file('style.css', styleCSS);

    // 3. Genera script.js
    const scriptJS = generateScriptJS(data, dateISO);
    zip.folder('js').file('script.js', scriptJS);

    // 4. Genera file ICS per calendario
    const icsFile = generateICS(data, dateISO);
    zip.file('evento.ics', icsFile);

    // 5. Aggiungi README
    const readme = generateREADME(data);
    zip.file('README.txt', readme);

    // Genera e scarica ZIP
    const content = await zip.generateAsync({type: 'blob'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `landing-page-${data.personName.toLowerCase().replace(/\s+/g, '-')}.zip`;
    link.click();
}

function generateIndexHTML(data, dayName, day, monthName, year) {
    return `<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.eventType} di ${data.personName} – ${day} ${monthName.toLowerCase()} ${year}</title>

    <!-- SEO Meta Tags -->
    <meta name="description" content="Siete invitati al ${data.eventType} di ${data.personName} il ${day} ${monthName.toLowerCase()} ${year}. Festeggeremo insieme!">
    <meta name="robots" content="noindex, nofollow">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${data.eventType} di ${data.personName}">
    <meta property="og:description" content="Siete invitati al ${data.eventType} di ${data.personName}. Vi aspettiamo per festeggiare insieme!">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Allura&family=Playfair+Display:wght@500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Meow+Script&display=swap" rel="stylesheet">

    <!-- Stylesheet -->
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <!-- Copertina con porte -->
    <div id="cover">
        <div class="door left"></div>
        <div class="door right"></div>
        <div id="seal" class="seal-icon" role="button" tabindex="0" aria-label="Clicca per aprire l'invito">
            ✨
        </div>
    </div>

    <!-- Invito -->
    <div class="overlay">
        <h1 class="main-name">${data.personName}</h1>
        <div class="subtitle">${data.subtitle}</div>

        <div class="date-block">
            <div>${dayName}</div>
            <div class="center">
                <div class="day">${day}</div>
                <div class="month">${monthName}</div>
            </div>
            <div class="year">${year}</div>
        </div>
        <div class="time">ORE ${data.eventTime}</div>

        <div class="linea-sottile"></div>
        <div class="locations">
            <div class="location">
                <a id="location1" class="icon" href="#" target="_blank" rel="noopener noreferrer" aria-label="Ottieni indicazioni per ${data.location1.name}">
                    <span class="location-icon">🏛️</span>
                </a>
                <div class="label">${data.location1.name}</div>
                <div class="address">${data.location1.address}</div>
            </div>
            <div class="location">
                <a id="location2" class="icon" href="#" target="_blank" rel="noopener noreferrer" aria-label="Ottieni indicazioni per ${data.location2.name}">
                    <span class="location-icon">🍽️</span>
                </a>
                <div class="label">${data.location2.name}</div>
                <div class="address">${data.location2.address}</div>
            </div>
        </div>

        <footer>
            <div class="ask">Ci sarai?</div>
            <div class="answers">
                <a id="yesLink" href="#" aria-label="Conferma presenza tramite WhatsApp">Sì</a>
                <a id="noLink" href="#" aria-label="Declina invito tramite WhatsApp">No</a>
            </div>
            <div id="rsvpFeedback" class="rsvp-feedback" role="status" aria-live="polite"></div>

            <div class="buttons">
                <a id="addToCal" href="evento.ics" aria-label="Aggiungi evento al calendario">Aggiungi al calendario</a>
            </div>
        </footer>
    </div>

    <!-- Controllo audio -->
    <button id="audioToggle" class="audio-toggle" aria-label="Attiva/disattiva musica di sottofondo" style="display: none;">
        <span class="audio-icon">🔇</span>
    </button>

    <script src="js/script.js"></script>
</body>

</html>`;
}

function generateStyleCSS(theme) {
    return `/*
Reset & CSS Variables
 */

:root {
    --primary-green: ${theme.primary};
    --bg-cream: ${theme.background};
    --accent-gold: ${theme.accent};
    --text-dark: #2f2f2f;
    --text-gray: #555;
    --border-gray: #888;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    font-family: Arial, Helvetica, sans-serif;
}

body,
html {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    font-family: "Inter", sans-serif;
    overflow: hidden;
}

body {
    background-color: var(--bg-cream);
    background-image: linear-gradient(135deg, var(--bg-cream) 0%, rgba(255,255,255,0.5) 100%);
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Focus Styles for Accessibility */
a:focus,
button:focus,
div[role="button"]:focus {
    outline: 3px solid var(--primary-green);
    outline-offset: 2px;
}

a:focus:not(:focus-visible),
button:focus:not(:focus-visible) {
    outline: none;
}

a:focus-visible,
button:focus-visible {
    outline: 3px solid var(--primary-green);
    outline-offset: 2px;
}

/* --- Copertina "porte" --- */
#cover {
    position: fixed;
    inset: 0;
    display: flex;
    z-index: 1000;
}

.door {
    flex: 1;
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
    transition: transform 1.5s ease-in-out;
    background-color: var(--bg-cream);
}

.door.left {
    border-right: 1px solid;
    background-color: var(--bg-cream);
}

.door.right {
    border-left: 1px solid;
    background-color: var(--bg-cream);
}

/* Seal Icon */
.seal-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    cursor: pointer;
    z-index: 1100;
    transition: transform 0.3s;
    background: var(--primary-green);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.seal-icon:hover {
    transform: translate(-50%, -50%) scale(1.1) rotate(10deg);
}

.open .left {
    transform: translateX(-100%);
}

.open .right {
    transform: translateX(100%);
}

.open .seal-icon {
    opacity: 0;
    pointer-events: none;
}

/* --- Invito --- */
.overlay {
    padding: 20px 15px;
    border-radius: 16px;
    width: 95%;
    max-width: 600px;
    text-align: center;
    z-index: 1;
}

.linea-sottile {
    width: 70%;
    height: 1.5px;
    background-color: darkgray;
    margin: 30px auto;
}

h1 {
    font-family: 'Allura', cursive;
    font-size: 64px;
    margin: 50px 0 5px;
    color: var(--primary-green);
}

.main-name {
    font-family: 'Meow Script', cursive;
    font-size: 64px;
    margin: 0;
    color: var(--accent-gold);
}

.subtitle {
    font-family: "Playfair Display", serif;
    font-size: 16px;
    margin: 10px 0 20px;
    color: #444;
}

/* Data stile */
.date-block {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    justify-items: center;
    gap: 10px;
    margin: 20px 0 10px;
    font-family: "Playfair Display", serif;
    font-weight: 600;
    font-size: 24px;
    color: #000;
}

.date-block .center {
    border-left: 1px solid #888;
    border-right: 1px solid #888;
    padding: 0 12px;
    text-align: center;
}

.date-block .day {
    font-size: 42px;
    line-height: 1;
}

.date-block .month {
    font-size: 18px;
    margin-top: 4px;
}

.year {
    font-size: 30px;
    margin-left: -30px;
    margin-top: -8px;
}

.time {
    font-size: 14px;
    font-weight: 600;
    margin-top: 25px;
    margin-bottom: 5px;
}

/* Locations */
.locations {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin: 20px 0 25px;
    flex-wrap: wrap;
}

.location {
    flex: 1 1 120px;
    max-width: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.location a.icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
    font-size: 26px;
    color: var(--primary-green);
    text-decoration: none;
    margin-bottom: 8px;
}

.location-icon {
    font-size: 32px;
}

.location .label {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-dark);
}

.location .address {
    font-size: 12px;
    color: var(--text-gray);
}

/* RSVP */
.ask {
    font-family: 'Meow Script', cursive;
    font-size: 34px;
    margin: 0;
    color: var(--accent-gold);
}

.answers {
    display: flex;
    justify-content: center;
    gap: 40px;
    font-size: 22px;
    font-weight: 600;
}

.answers a {
    text-decoration: none;
    color: var(--primary-green);
}

/* Bottoni */
.buttons {
    margin-top: 20px;
}

#addToCal {
    display: inline-block;
    background: transparent;
    border: 1px solid var(--primary-green);
    color: var(--primary-green);
    padding: 8px 16px;
    border-radius: 30px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
}

#addToCal:hover {
    background: var(--primary-green);
    color: #fff;
}

/* Audio Toggle Button */
.audio-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary-green);
    border: 2px solid white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    transition: transform 0.2s, background 0.3s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.audio-toggle:hover {
    transform: scale(1.1);
}

.audio-icon {
    font-size: 24px;
}

/* RSVP Feedback */
.rsvp-feedback {
    margin-top: 15px;
    min-height: 24px;
    font-size: 14px;
    color: var(--primary-green);
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.3s;
}

.rsvp-feedback.show {
    opacity: 1;
}

/* --- Desktop --- */
@media(min-width:768px) {
    h1, .main-name {
        font-size: 72px;
    }

    .subtitle {
        font-size: 20px;
    }

    .date-block {
        gap: 20px;
        font-size: 18px;
    }

    .date-block .day {
        font-size: 64px;
    }

    .date-block .month {
        font-size: 16px;
    }

    .time {
        font-size: 18px;
    }

    .location a.icon {
        width: 70px;
        height: 70px;
        font-size: 32px;
    }

    .location .label {
        font-size: 16px;
    }

    .location .address {
        font-size: 14px;
    }

    .ask {
        font-size: 28px;
    }

    .answers {
        font-size: 26px;
    }

    #addToCal {
        font-size: 14px;
        padding: 10px 20px;
    }

    .seal-icon {
        width: 150px;
        height: 150px;
        font-size: 60px;
    }

    .audio-toggle {
        width: 60px;
        height: 60px;
    }

    .audio-icon {
        font-size: 28px;
    }

    .rsvp-feedback {
        font-size: 16px;
    }
}`;
}

function generateScriptJS(data, dateISO) {
    return `const CONFIG = {
    dateISO: "${dateISO}",
    whatsappNumber: "${data.whatsappNumber}",
    recipientName: "${data.recipientName}",
    location1: { lat: ${data.location1.lat}, lng: ${data.location1.lng} },
    location2: { lat: ${data.location2.lat}, lng: ${data.location2.lng} }
};

// --- RSVP (WhatsApp + memoria locale) ---
const yesLink = document.getElementById("yesLink");
const noLink = document.getElementById("noLink");
const rsvpFeedback = document.getElementById("rsvpFeedback");

const yesMsg = \`Ciao \${CONFIG.recipientName}, certo che ci sarò! ❤️🥂\`;
const noMsg = \`Ciao \${CONFIG.recipientName}, purtroppo non potrò esserci 😭\`;

// Normalizza il numero (solo cifre)
const phone = CONFIG.whatsappNumber.replace(/\\D/g, "");

// Usa api.whatsapp.com per compatibilità iOS/Android
const WA_BASE = "https://api.whatsapp.com/send?phone=";
yesLink.href = \`\${WA_BASE}\${phone}&text=\${encodeURIComponent(yesMsg)}\`;
noLink.href = \`\${WA_BASE}\${phone}&text=\${encodeURIComponent(noMsg)}\`;

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
document.getElementById("location1").href =
    \`https://www.google.com/maps/dir/?api=1&destination=\${CONFIG.location1.lat},\${CONFIG.location1.lng}\`;
document.getElementById("location2").href =
    \`https://www.google.com/maps/dir/?api=1&destination=\${CONFIG.location2.lat},\${CONFIG.location2.lng}\`;

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
});`;
}

function generateICS(data, dateISO) {
    const startDate = dateISO.replace(/[-:]/g, '').split('+')[0];
    const endDate = new Date(new Date(dateISO).getTime() + 4 * 3600000).toISOString().replace(/[-:]/g, '').split('.')[0];

    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${data.eventType} di ${data.personName}
LOCATION:${data.location1.name}, ${data.location1.address}
DESCRIPTION:Festeggeremo insieme il ${data.eventType} di ${data.personName}. Dopo la cerimonia ci ritroveremo a ${data.location2.name}, ${data.location2.address}.
END:VEVENT
END:VCALENDAR`;
}

function generateREADME(data) {
    return `========================================
  LANDING PAGE - ${data.eventType.toUpperCase()} DI ${data.personName.toUpperCase()}
========================================

Congratulazioni! La tua landing page è stata generata con successo!

📁 CONTENUTO DEL PACCHETTO:
---------------------------
- index.html       → Pagina principale
- css/style.css    → Foglio di stile
- js/script.js     → Funzionalità interattive
- evento.ics       → File calendario
- README.txt       → Questo file

✨ CARATTERISTICHE:
------------------
✅ Design completamente responsive (mobile + desktop)
✅ Animazione "porte" di apertura
✅ RSVP automatico via WhatsApp
✅ Integrazione Google Maps
✅ Pulsante "Aggiungi al Calendario"
✅ Feedback visivo per conferme
✅ Accessibile e SEO-friendly

🚀 COME PUBBLICARE ONLINE:
--------------------------

OPZIONE 1 - NETLIFY (GRATUITO E FACILE)
1. Vai su https://www.netlify.com
2. Crea un account gratuito
3. Trascina la cartella nella sezione "Deploy"
4. Il tuo sito sarà online in pochi secondi!
5. Riceverai un link tipo: https://nome-evento.netlify.app

OPZIONE 2 - GITHUB PAGES (GRATUITO)
1. Crea un account su https://github.com
2. Crea un nuovo repository
3. Carica tutti i file
4. Vai in Settings → Pages
5. Attiva GitHub Pages
6. Link: https://tuousername.github.io/nome-repo

OPZIONE 3 - VERCEL (GRATUITO)
1. Vai su https://vercel.com
2. Registrati gratuitamente
3. Importa il progetto
4. Deploy automatico!

📱 CONDIVISIONE:
---------------
Una volta online, condividi il link via:
- WhatsApp
- Instagram Stories
- Facebook
- Email

🎨 PERSONALIZZAZIONE:
--------------------
Se vuoi modificare qualcosa:
- Testi: apri index.html con un editor
- Colori: modifica le variabili CSS in style.css (righe 5-11)
- Dati: modifica CONFIG in js/script.js (righe 1-7)

❓ SUPPORTO:
-----------
Per domande o problemi, contatta il venditore.

🎉 BUON EVENTO!
----------------------------
Creato con ❤️ dal Configuratore Landing Page`;
}
