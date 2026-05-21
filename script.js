// ==========================================
// 1. ELEMENTE GLOBALE ȘI CONFIGURARE
// ==========================================
const catImg = document.getElementById('cat-img');
const bulaText = document.getElementById('bula-text');
const gridPrincipal = document.getElementById('grid-principal');
const quizContainer = document.getElementById('quiz-container');
const containerPlanta = document.getElementById('exercitiu-vizual-container');

let indexIntrebareCurenta = 0;
let dateQuiz = [];
let dateProiect = { utilizatori: [], materii: { Matematica: [], Stiinte: [] } };
let utilizatorLogat = "";

// ÎNCĂRCARE DATE DIN JSON
async function incarcaDate() {
    try {
        const raspuns = await fetch('materii.json');
        dateProiect = await raspuns.json();
        console.log("Date încărcate cu succes!");
    } catch (err) {
        console.error("Eroare la încărcarea fișierului JSON:", err);
    }
}
incarcaDate();

// ==========================================
// 2. LOGICĂ DE AUTENTIFICARE & CONT
// ==========================================

// Comutare vizuală între login și înregistrare
function comutaEcraneAutentificare(tip) {
    if (tip === 'register') {
        document.getElementById('form-login').classList.add('ascuns');
        document.getElementById('form-register').classList.remove('ascuns');
    } else {
        document.getElementById('form-register').classList.add('ascuns');
        document.getElementById('form-login').classList.remove('ascuns');
    }
}

// Înregistrare din interfață (Salvare în localStorage)
function proceseazaInregistrare() {
    const user = document.getElementById('register-user').value.trim();
    const pass = document.getElementById('register-pass').value.trim();

    if (!user || !pass) {
        alert("Te rugăm să completezi ambele câmpuri!");
        return;
    }

    let utilizatori = JSON.parse(localStorage.getItem('baza_date_utilizatori')) || [];
    const existaDeja = utilizatori.find(u => u.username.toLowerCase() === user.toLowerCase());
    
    if (existaDeja) {
        alert("Acest utilizator există deja!");
        return;
    }
    
    utilizatori.push({ username: user, parola: pass });
    localStorage.setItem('baza_date_utilizatori', JSON.stringify(utilizatori));
    alert("Cont creat cu succes! Acum te poți loga.");
    
    // Resetare inputuri și întoarcere la login
    document.getElementById('register-user').value = "";
    document.getElementById('register-pass').value = "";
    comutaEcraneAutentificare('login');
}

// Login unificat (Verifică atât JSON-ul static cât și localStorage)
function proceseazaLogin() {
    const userInjected = document.getElementById('login-user').value.trim();
    const passInjected = document.getElementById('login-pass').value.trim();

    if (!userInjected || !passInjected) {
        alert("Te rugăm să completezi ambele câmpuri!");
        return;
    }

    let utilizatoriJSON = dateProiect.utilizatori || [];
    let utilizatoriLocal = JSON.parse(localStorage.getItem('baza_date_utilizatori')) || [];
    let totiUtilizatorii = [...utilizatoriJSON, ...utilizatoriLocal.map(u => ({ user: u.username, parola: u.parola }))];

    const utilizatorGasit = totiUtilizatorii.find(u => u.user === userInjected && u.parola === passInjected);

    if (utilizatorGasit) {
        utilizatorLogat = userInjected;
        
        // Afișare elemente header profil dacă există în HTML
        const headerUser = document.getElementById('header-username');
        const userBadge = document.getElementById('user-profile-badge');
        if(headerUser) headerUser.innerText = userInjected;
        if(userBadge) userBadge.classList.remove('ascuns');
        
        arataSelectieRol(); 
    } else {
        alert("Username sau parolă incorectă!");
    }
}

// Ferestre Modal Profil
function deschideModalCont() {
    if (!utilizatorLogat) return;
    document.getElementById('modal-username').innerText = utilizatorLogat;
    document.getElementById('modal-rol').innerText = utilizatorLogat.toLowerCase().includes('profesor') ? "Profesor Coordonator" : "Elev Explorator";
    document.getElementById('modal-cont').classList.remove('ascuns');
}

function inchideModalCont() {
    document.getElementById('modal-cont').classList.add('ascuns');
}

// ==========================================
// 3. NAVIGARE ȘI INTERFAȚĂ MENIURI
// ==========================================
function arataSelectieRol() {
    document.getElementById('ecran-login').classList.add('ascuns');
    document.getElementById('ecran-rol').classList.remove('ascuns');
}

function setRol(rol) {
    document.getElementById('ecran-rol').classList.add('ascuns');
    document.getElementById('interfata-principala').classList.remove('ascuns');
    
    if(rol === 'elev') {
        schimbaStareMascota('vesel', 'Salut, micule explorator! Alege o clasă.');
        afiseazaSelectieClase();
    } else {
        alert("Modul Profesor va fi disponibil curând!");
    }
}

function afiseazaSelectieClase() {
    gridPrincipal.classList.remove('ascuns');
    quizContainer.classList.add('ascuns');
    if(containerPlanta) containerPlanta.classList.add('ascuns');
    
    const btnAcasa = document.getElementById('btn-acasa-nou');
    if(btnAcasa) btnAcasa.classList.add('ascuns');
    
    gridPrincipal.innerHTML = '';

    // Generăm automat toate clasele de la 0 la 12
    for (let i = 0; i <= 12; i++) {
        let numeClasa = i === 0 ? 'Clasa 0' : `Clasa a ${i}-a`;
        let descriere = '';
        let culoareCSS = '';

        // Determinăm categoria și culoarea în funcție de intervalul clasei
        if (i === 0) {
            descriere = 'Pregătitoare';
            culoareCSS = 'verde';
        } else if (i >= 1 && i <= 4) {
            descriere = 'Învățământ Primar';
            culoareCSS = 'verde';
        } else if (i >= 5 && i <= 8) {
            descriere = 'Gimnaziu';
            culoareCSS = 'portocaliu';
        } else if (i >= 9 && i <= 12) {
            descriere = 'Liceu';
            culoareCSS = 'albastru';
        }

        const card = document.createElement('div');
        card.className = `clasa-card ${culoareCSS}`;
        card.innerHTML = `<h3>${numeClasa}</h3><p>${descriere}</p>`;
        
        // Păstrăm funcționalitatea: la click, deschide materiile pentru clasa selectată
        card.onclick = () => afiseazaMateriile(numeClasa);
        gridPrincipal.appendChild(card);
    }
}

function afiseazaMateriile(numeClasa) {
    gridPrincipal.innerHTML = '';
    const btnAcasa = document.getElementById('btn-acasa-nou');
    if(btnAcasa) btnAcasa.classList.remove('ascuns');

    const materii = [
        { nume: 'Matematica', clasaCSS: 'albastru' },
        { nume: 'Stiinte', clasaCSS: 'verde' }
    ];

    materii.forEach(m => {
        const card = document.createElement('div');
        card.className = `clasa-card ${m.clasaCSS}`;
        card.innerHTML = `<h3>${m.nume}</h3>`;
        card.onclick = () => {
            if (numeClasa === 'Clasa 0' && m.nume === 'Stiinte') {
                gridPrincipal.classList.add('ascuns');
                containerPlanta.classList.remove('ascuns');
                schimbaStareMascota('vesel', 'Uită-te la plantă! Poți numi părțile ei?');
            } else {
                pornesteQuiz(m.nume); 
            }
        };
        gridPrincipal.appendChild(card);
    });
}

// ==========================================
// 4. LOGICĂ SISTEM QUIZ (CU NAVIGARE MANUALĂ)
// ==========================================
function pornesteQuiz(materie) {
    gridPrincipal.classList.add('ascuns');
    quizContainer.classList.remove('ascuns');
    
    indexIntrebareCurenta = 0;
    dateQuiz = dateProiect.materii[materie] || [];
    
    if (dateQuiz.length > 0) {
        afiseazaIntrebare();
    } else {
        document.getElementById('intrebare-text').innerText = "Momentan nu avem întrebări pentru această materie.";
        document.getElementById('optiuni').innerHTML = '';
    }
}

function afiseazaIntrebare() {
    const data = dateQuiz[indexIntrebareCurenta]; 
    const containerText = document.getElementById('intrebare-text');
    const containerOptiuni = document.getElementById('optiuni');
    
    containerText.innerText = data.intrebare; 
    containerOptiuni.innerHTML = ''; 

    const progres = document.getElementById('quiz-progres');
    if(progres) progres.innerText = `${indexIntrebareCurenta + 1} / ${dateQuiz.length}`;
    
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if(btnPrev) btnPrev.disabled = (indexIntrebareCurenta === 0);
    if(btnNext) btnNext.disabled = true; // Forțăm utilizatorul să rezolve înainte de a da înainte

    // Afișare opțiuni Grilă
    if (data.optiuni) {
        data.optiuni.forEach((varianta, index) => {
            const buton = document.createElement('button');
            buton.className = "btn-optiune-quiz"; 
            buton.innerText = varianta;
            buton.onclick = () => verificareRaspuns(index === data.corect, data.explicatie); 
            containerOptiuni.appendChild(buton);
        });
    } 
    // Afișare opțiuni Input direct
    else if (data.tip === "input") {
        const inputDiv = document.createElement('div');
        inputDiv.className = "input-container";
        inputDiv.innerHTML = `
            <input type="text" id="raspuns-utilizator" placeholder="Scrie rezultatul...">
            <button id="btn-verifica" onclick="verificaRaspunsInput()">Trimite</button>
        `;
        containerOptiuni.appendChild(inputDiv);
    }
}

function verificaRaspunsInput() {
    const data = dateQuiz[indexIntrebareCurenta];
    const valoare = document.getElementById('raspuns-utilizator').value.trim();
    verificareRaspuns(valoare === data.raspuns_corect, data.explicatie);
}

function verificareRaspuns(isCorect, explicatie) {
    if (isCorect) {
        schimbaStareMascota('vesel', "Bravo! " + explicatie);
        
        // Blocăm opțiunile curente ca să nu poată re-da click
        const butoaneOptiuni = document.querySelectorAll('#optiuni button, #optiuni input');
        butoaneOptiuni.forEach(el => el.disabled = true);
        
        // Deblocăm butonul de Next
        const btnNext = document.getElementById('btn-next');
        if(btnNext) btnNext.disabled = false;
    } else {
        schimbaStareMascota('trist', "Mai încearcă! Uită-te cu atenție.");
    }
}

function urmatoareaIntrebare() {
    indexIntrebareCurenta++;
    if (indexIntrebareCurenta < dateQuiz.length) {
        afiseazaIntrebare();
    } else {
        document.getElementById('intrebare-text').innerText = "Felicitări! Ai terminat toate întrebările! 🎉";
        document.getElementById('optiuni').innerHTML = '<button class="btn-acasa" onclick="resetInterfata()">Înapoi la meniu</button>';
        
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        if(btnPrev) btnPrev.disabled = true;
        if(btnNext) btnNext.disabled = true;
        if(document.getElementById('quiz-progres')) document.getElementById('quiz-progres').innerText = "Sfârșit!";
    }
}

function intrebarePrecedenta() {
    if (indexIntrebareCurenta > 0) {
        indexIntrebareCurenta--;
        afiseazaIntrebare();
    }
}

// ==========================================
// 5. MODULUL MASCOTA PISIUC & RESET
// ==========================================
function schimbaStareMascota(stare, mesaj = "Să învățăm împreună!") {
    if (stare === 'vesel') catImg.src = 'pisiuc_vesel.png';
    else if (stare === 'trist') catImg.src = 'pisiuc_trist.png';
    else catImg.src = 'pisiuc_neutru.png';

    if(bulaText) {
        bulaText.innerText = mesaj;
        bulaText.classList.remove('ascuns');
    }

    // Mesajul rămâne vizibil 5 secunde pentru o lectură relaxată
    setTimeout(() => {
        if(bulaText) bulaText.classList.add('ascuns');
        catImg.src = 'pisiuc_neutru.png';
    }, 5000); 
}

function resetInterfata() {
    quizContainer.classList.add('ascuns');
    if(containerPlanta) containerPlanta.classList.add('ascuns');
    gridPrincipal.classList.remove('ascuns');
    if(bulaText) bulaText.classList.add('ascuns');
    
    const btnAcasa = document.getElementById('btn-acasa-nou');
    if(btnAcasa) btnAcasa.classList.add('ascuns');
    
    schimbaStareMascota('neutru');
    afiseazaSelectieClase();
}


// ==========================================
// 6. LOGICĂ DRAG AND DROP (EXERCIȚIU VIZUAL)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initDragAndDrop();
});

function initDragAndDrop() {
    const draggables = document.querySelectorAll(".draggable");
    const dropZones = document.querySelectorAll(".drop-zone");

    // 1. Evenimente pentru etichetele care pot fi trase (Draggable)
    draggables.forEach(draggable => {
        draggable.addEventListener("dragstart", (e) => {
            // Salvăm tipul componentei trase (ex: "radacina", "tulpina")
            e.dataTransfer.setData("text/plain", draggable.dataset.part);
            draggable.classList.add("dragging");
        });

        draggable.addEventListener("dragend", () => {
            draggable.classList.remove("dragging");
        });
    });

    // 2. Evenimente pentru zonele de plasare (Drop Zones)
    dropZones.forEach(zone => {
        // Obligatoriu: prevenim comportamentul default pentru a permite drop-ul
        zone.addEventListener("dragover", (e) => {
            e.preventDefault();
            zone.classList.add("hovered");
        });

        zone.addEventListener("dragleave", () => {
            zone.classList.remove("hovered");
        });

        zone.addEventListener("drop", (e) => {
            e.preventDefault();
            zone.classList.remove("hovered");

            // Preluăm piesa care a fost aruncată aici
            const dataPart = e.dataTransfer.getData("text/plain");
            const expectedPart = zone.dataset.accept;

            // Verificăm dacă piesa se potrivește cu zona corectă
            if (dataPart === expectedPart) {
                // Găsim elementul HTML tras ca să-l mutăm fizic în zonă
                const originalElement = document.querySelector(`.draggable[data-part="${dataPart}"]`);
                
                if (originalElement) {
                    // Schimbăm stilul zonei pentru a arăta că e completată corect
                    zone.innerText = originalElement.innerText;
                    zone.classList.add("corect");
                    
                    // Ascundem eticheta originală din listă deoarece a fost plasată cu succes
                    originalElement.style.visibility = "hidden";
                    
                    // Recompensă vizuală de la Pisiuc!
                    schimbaStareMascota('vesel', `Ai plasat corect componenta: ${originalElement.innerText}! ✨`);
                    
                    // Verificăm dacă jocul s-a terminat
                    verificaFinalizareJoc();
                }
            } else {
                // Greșeală - Pisiuc te atenționează
                schimbaStareMascota('trist', "Nu e locul potrivit! Mai încearcă.");
            }
        });
    });
}

function verificaFinalizareJoc() {
    const toateZonele = document.querySelectorAll(".drop-zone");
    const zoneCorecte = document.querySelectorAll(".drop-zone.corect");
    
    // Dacă numărul de zone completate corect este egal cu numărul total de zone
    if (toateZonele.length === zoneCorecte.length) {
        setTimeout(() => {
            schimbaStareMascota('vesel', "Felicitări! Ai identificat toate părțile plantei! 🍓🎉");
        }, 1500);
    }
}
