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
let rolLogat = "";

// Inițializare Bază de Date Locală securizată (Pentru Clase Virtuale)
if (!localStorage.getItem('eduquest_clase_virtuale')) {
    localStorage.setItem('eduquest_clase_virtuale', JSON.stringify([]));
}
if (!localStorage.getItem('eduquest_materiale_postate')) {
    localStorage.setItem('eduquest_materiale_postate', JSON.stringify([]));
}

// ÎNCĂRCARE DATE DIN JSON cu mecanism de siguranță locală
async function incarcaDate() {
    try {
        const raspuns = await fetch('materii.json');
        dateProiect = await raspuns.json();
    } catch (err) {
        console.warn("Atenție: Se folosesc datele de rezervă deoarece materii.json nu a putut fi citit local:", err);
        // Siguranță: definim utilizatorii direct în cod dacă JSON-ul dă eroare la citire locală pe PC
        dateProiect = {
            utilizatori: [
                { "user": "elev1", "parola": "1234" },
                { "user": "profesor1", "parola": "profesor2026" }
            ],
            materii: {
                Matematica: [],
                Stiinte: []
            }
        };
    }
}
incarcaDate();

// ==========================================
// 2. LOGICĂ DE AUTENTIFICARE & CONT
// ==========================================
function comutaEcraneAutentificare(tip) {
    const fLogin = document.getElementById('fereastra-login');
    const fRegister = document.getElementById('fereastra-register');
    
    if (tip === 'register') {
        if(fLogin) fLogin.classList.add('ascuns');
        if(fRegister) fRegister.classList.remove('ascuns');
    } else {
        if(fRegister) fRegister.classList.add('ascuns');
        if(fLogin) fLogin.classList.remove('ascuns');
    }
}

function proceseazaLogin() {
    const userIn = document.getElementById('login-user').value.trim();
    const passIn = document.getElementById('login-pass').value.trim();

    if (!userIn || !passIn) {
        alert("Te rugăm să completezi ambele câmpuri!");
        return;
    }

    // Verificăm dacă utilizatorii există în baza de date loaded
    if (!dateProiect.utilizatori) {
        alert("Eroare la încărcarea datelor. Încearcă din nou!");
        return;
    }

    const gasit = dateProiect.utilizatori.find(u => u.user === userIn && u.parola === passIn);

    if (gasit) {
        utilizatorLogat = userIn;
        // Determinăm rolul automat sau deschidem selecția de rol
        if (userIn.includes("profesor")) {
            rolLogat = "profesor";
            pornesteAplicatie();
        } else if (userIn.includes("elev")) {
            rolLogat = "elev";
            pornesteAplicatie();
        } else {
            // Dacă e un cont nou creat, mergem la ecranul de selecție rol
            document.getElementById('ecran-login').classList.add('ascuns');
            document.getElementById('ecran-rol').classList.remove('ascuns');
        }
    } else {
        alert("Utilizator sau parolă incorectă!");
    }
}

function proceseazaInregistrare() {
    const userIn = document.getElementById('register-user').value.trim();
    const passIn = document.getElementById('register-pass').value.trim();

    if (!userIn || !passIn) {
        alert("Te rugăm să completezi toate câmpurile!");
        return;
    }

    const exista = dateProiect.utilizatori.find(u => u.user === userIn);
    if (exista) {
        alert("Acest nume de utilizator este deja luat!");
        return;
    }

    // Adăugăm utilizatorul în lista temporară a sesiunii
    dateProiect.utilizatori.push({ "user": userIn, "parola": passIn });
    alert("Cont creat cu succes! Acum te poți loga.");
    comutaEcraneAutentificare('login');
}

function setRol(rol ales) {
    rolLogat = ales;
    document.getElementById('ecran-rol').classList.add('ascuns');
    pornesteAplicatie();
}

function pornesteAplicatie() {
    document.getElementById('ecran-login').classList.add('ascuns');
    document.getElementById('ecran-rol').classList.add('ascuns');
    document.getElementById('interfata-principala').classList.remove('ascuns');

    // Afișăm badge-ul de utilizator sus în header
    const badge = document.getElementById('user-profile-badge');
    const headerUser = document.getElementById('header-username');
    if(badge) badge.classList.remove('ascuns');
    if(headerUser) headerUser.innerText = utilizatorLogat;

    // Redirecționare în funcție de rol
    if (rolLogat === "profesor") {
        if(gridPrincipal) gridPrincipal.classList.add('ascuns');
        document.getElementById('dashboard-profesor').classList.remove('ascuns');
        afiseazaClaseProfesor();
    } else {
        if(gridPrincipal) gridPrincipal.classList.remove('ascuns');
        document.getElementById('dashboard-profesor').classList.add('ascuns');
        afiseazaMeniuDiscipline();
    }
    
    salutaMascota(`Salutare, ${utilizatorLogat}! Pregătit de aventură? 🐾`);
}

// ==========================================
// 3. INTERFAȚĂ DISCIPLINE ȘI CLASE VIRTUALE
// ==========================================
function afiseazaMeniuDiscipline() {
    if (!gridPrincipal) return;
    gridPrincipal.innerHTML = "";
    gridPrincipal.classList.remove('ascuns');
    
    for (const disciplina in dateProiect.materii) {
        const card = document.createElement("div");
        card.className = "card-disciplina-nou"; 
        
        let icon = "📚";
        if(disciplina === "Matematica") icon = "📐";
        if(disciplina === "Romana") icon = "✍️";
        if(disciplina === "Stiinte") icon = "🧪";

        card.innerHTML = `
            <div style="font-size: 45px; margin-bottom: 10px;">${icon}</div>
            <h3 style="margin: 10px 0 5px 0; font-size: 20px;">${disciplina}</h3>
            <p style="color: #777; margin: 0; font-size: 14px;">Explorează lecțiile</p>
        `;
        
        card.onclick = () => deschideDisciplina(disciplina);
        gridPrincipal.appendChild(card);
    }

    if (rolLogat === "elev") {
        // Butonul pentru alăturare clasă profesori
        const cardAlaturare = document.createElement("div");
        cardAlaturare.className = "card-disciplina-nou";
        cardAlaturare.style.borderColor = "var(--orange-primary)";
        cardAlaturare.innerHTML = `
            <div style="font-size: 45px; margin-bottom: 10px;">🏫</div>
            <h3 style="margin: 10px 0 5px 0; font-size: 20px; color: var(--orange-dark);">Clasă Virtuală</h3>
            <p style="color: #777; margin: 0; font-size: 14px;">Introdu codul profesorului</p>
        `;
        cardAlaturare.onclick = () => document.getElementById('modal-alaturare-clasa').classList.remove('ascuns');
        gridPrincipal.appendChild(cardAlaturare);

        // Buton vizualizare clasele mele din care fac parte
        const cardClaseleMele = document.createElement("div");
        cardClaseleMele.className = "card-disciplina-nou";
        cardClaseleMele.style.borderColor = "#9b59b6";
        cardClaseleMele.innerHTML = `
            <div style="font-size: 45px; margin-bottom: 10px;">🎒</div>
            <h3 style="margin: 10px 0 5px 0; font-size: 20px; color: #8e44ad;">Clasele Mele</h3>
            <p style="color: #777; margin: 0; font-size: 14px;">Vezi temele primite</p>
        `;
        cardClaseleMele.onclick = () => deschideClaseleMeleElev();
        gridPrincipal.appendChild(cardClaseleMele);
    }
}

function deschideDisciplina(disciplina) {
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    const btnAcasa = document.getElementById('btn-acasa-nou');
    if(btnAcasa) btnAcasa.classList.remove('ascuns');

    if (disciplina === "Matematica") {
        document.getElementById('sub-meniuri-matematica').classList.remove('ascuns');
    } else if (disciplina === "Romana") {
        document.getElementById('sub-meniuri-romana').classList.remove('ascuns');
    } else if (disciplina === "Stiinte") {
        // Deschide jocul interactiv drag & drop direct
        document.getElementById('exercitiu-vizual-container').classList.remove('ascuns');
        initJocPlanta();
    }
}

// ==========================================
// 4. FUNCȚIONALITĂȚI DEDICATE PROFESORILOR
// ==========================================
function afiseazaClaseProfesor() {
    const container = document.getElementById('grid-clase-profesor');
    if (!container) return;
    container.innerHTML = '';
    
    let safeClase = localStorage.getItem('eduquest_clase_virtuale');
    let clase = safeClase ? JSON.parse(safeClase).filter(c => c.profesor === utilizatorLogat) : [];
    
    if(clase.length === 0) {
        container.innerHTML = "<p style='text-align: center; color: #777; width:100%;'>Nu ai nicio clasă creată încă.</p>";
        return;
    }
    
    clase.forEach(c => {
        const card = document.createElement('div');
        card.className = "card-clasa-noua";
        card.style.minWidth = "200px";
        card.innerHTML = `
            <h3 style="margin: 0 0 8px 0; color: var(--orange-dark);">${c.nume}</h3>
            <div style="background: var(--orange-soft); display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; color: var(--text-brown);">
                Cod: ${c.id}
            </div>
        `;
        container.appendChild(card);
    });
}

function creeazaClasa() {
    const nume = document.getElementById('nume-clasa-noua').value.trim();
    if(!nume) { alert("Introdu numele clasei!"); return; }

    let cod = Math.random().toString(36).substring(2, 7).toUpperCase();
    let safeClase = JSON.parse(localStorage.getItem('eduquest_clase_virtuale'));
    
    safeClase.push({ id: cod, nume: nume, profesor: utilizatorLogat });
    localStorage.setItem('eduquest_clase_virtuale', JSON.stringify(safeClase));
    
    document.getElementById('nume-clasa-noua').value = "";
    document.getElementById('modal-creare-clasa').classList.add('ascuns');
    afiseazaClaseProfesor();
    alert(`Clasa a fost creată! Cod de acces: ${cod}`);
}

function deschideModalMaterial() {
    const select = document.getElementById('select-clasa-material');
    if(!select) return;
    select.innerHTML = "";

    let clase = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')).filter(c => c.profesor === utilizatorLogat);
    if(clase.length === 0) { alert("Creează mai întâi o clasă!"); return; }

    clase.forEach(c => {
        let opt = document.createElement('option');
        opt.value = c.id; opt.innerText = c.nume;
        select.appendChild(opt);
    });
    document.getElementById('modal-postare-material').classList.remove('ascuns');
}

function posteazaMaterial() {
    const clasaId = document.getElementById('select-clasa-material').value;
    const titlu = document.getElementById('titlu-material').value.trim();
    const descriere = document.getElementById('descriere-material').value.trim();

    if(!titlu || !descriere) { alert("Completează toate câmpurile!"); return; }

    let materiale = JSON.parse(localStorage.getItem('eduquest_materiale_postate'));
    materiale.push({ clasaId: clasaId, titlu: titlu, descriere: descriere });
    localStorage.setItem('eduquest_materiale_postate', JSON.stringify(materiale));

    document.getElementById('titlu-material').value = "";
    document.getElementById('descriere-material').value = "";
    document.getElementById('modal-postare-material').classList.add('ascuns');
    alert("Materialul a fost postat cu succes!");
}

// ==========================================
// 5. FUNCȚIONALITĂȚI CLASE PENTRU ELEVI
// ==========================================
function alaturaClasaElev() {
    const cod = document.getElementById('cod-clasa-alaturare').value.trim().toUpperCase();
    if(!cod) { alert("Introdu codul clasei!"); return; }

    let toateClasele = JSON.parse(localStorage.getItem('eduquest_clase_virtuale'));
    let clasaGasita = toateClasele.find(c => c.id === cod);

    if(!clasaGasita) {
        alert("Codul introdus nu este valid!");
        return;
    }

    // Salvăm înscrierile în siguranță pe contul elevului curent folosind un prefix unic
    let cheieInscrieri = `eduquest_inscrieri_${utilizatorLogat}`;
    let inscrierileMele = localStorage.getItem(cheieInscrieri) ? JSON.parse(localStorage.getItem(cheieInscrieri)) : [];
    
    if(inscrierileMele.some(c => c.id === cod)) {
        alert("Ești deja înscris în această clasă!");
        return;
    }

    inscrierileMele.push(clasaGasita);
    localStorage.setItem(cheieInscrieri, JSON.stringify(inscrierileMele));
    
    document.getElementById('cod-clasa-alaturare').value = "";
    document.getElementById('modal-alaturare-clasa').classList.add('ascuns');
    alert(`Te-ai alăturat cu succes clasei: ${clasaGasita.nume}`);
    deschideClaseleMeleElev();
}

function deschideClaseleMeleElev() {
    if (gridPrincipal) gridPrincipal.innerHTML = "";
    if (gridPrincipal) gridPrincipal.classList.remove('ascuns');
    ascundeToateSubmeniurile();

    let cheieInscrieri = `eduquest_inscrieri_${utilizatorLogat}`;
    let safeInscrieri = localStorage.getItem(cheieInscrieri);
    let clase = safeInscrieri ? JSON.parse(safeInscrieri) : [];
    
    if(clase.length === 0) {
        gridPrincipal.innerHTML = "<p style='text-align: center; width: 100%; color: #777; margin-top:20px;'>Nu te-ai alăturat niciunei clase încă. Folosește butonul 'Clasă Virtuală' și adaugă un cod.</p>";
        const btnAcasa = document.getElementById('btn-acasa-nou');
        if(btnAcasa) btnAcasa.classList.remove('ascuns');
        return;
    }
    
    clase.forEach(c => {
        const card = document.createElement('div');
        card.className = "card-disciplina-nou";
        card.style.borderColor = "#9b59b6";
        card.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 10px;">🏫</div>
            <h3 style="margin: 5px 0; color: #8e44ad;">${c.nume}</h3>
            <p style="font-size: 13px; color: #777; margin: 0;">Profesor: ${c.profesor}</p>
        `;
        card.onclick = () => deschideClasaElev(c.id, c.nume);
        gridPrincipal.appendChild(card);
    });

    const btnAcasa = document.getElementById('btn-acasa-nou');
    if(btnAcasa) btnAcasa.classList.remove('ascuns');
}

function deschideClasaElev(clasaId, numeClasa) {
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    document.getElementById('vizualizare-clasa-elev').classList.remove('ascuns');
    
    document.getElementById('titlu-clasa-activa').innerText = `Materiale: ${numeClasa}`;
    
    const lista = document.getElementById('lista-materiale-elev'); 
    if (!lista) return;
    lista.innerHTML = '';
    
    let safeMat = localStorage.getItem('eduquest_materiale_postate');
    let materiale = safeMat ? JSON.parse(safeMat).filter(m => m.clasaId === clasaId) : [];
    
    if (materiale.length === 0) {
        lista.innerHTML = "<p style='text-align: center; color: #777; margin: 20px 0;'>Profesorul nu a postat încă lecții sau teme aici.</p>"; 
        return;
    }
    
    materiale.forEach(m => {
        const div = document.createElement('div');
        div.className = "card-material-nou";
        div.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: var(--orange-dark);">📌 ${m.titlu}</h3>
            <p style="margin: 0; line-height: 1.5; color: var(--text-dark); white-space: pre-wrap;">${m.descriere}</p>
        `;
        lista.appendChild(div);
    });
}

// ==========================================
// 6. CONTROL GLOBAL INTERFAȚĂ ȘI NAVIGARE
// ==========================================
function resetInterfata() {
    ascundeToateSubmeniurile();
    
    const btnAcasa = document.getElementById('btn-acasa-nou');
    if(btnAcasa) btnAcasa.classList.add('ascuns');

    if (rolLogat === "profesor") {
        if(gridPrincipal) gridPrincipal.classList.add('ascuns');
        document.getElementById('dashboard-profesor').classList.remove('ascuns');
        afiseazaClaseProfesor();
    } else {
        if(gridPrincipal) gridPrincipal.classList.remove('ascuns');
        document.getElementById('dashboard-profesor').classList.add('ascuns');
        afiseazaMeniuDiscipline();
    }
}

function ascundeToateSubmeniurile() {
    document.getElementById('sub-meniuri-matematica').classList.add('ascuns');
    document.getElementById('sub-meniuri-romana').classList.add('ascuns');
    if(quizContainer) quizContainer.classList.add('ascuns');
    if(containerPlanta) containerPlanta.classList.add('ascuns');
    document.getElementById('vizualizare-clasa-elev').classList.add('ascuns');
}

function toggleSubMath(idSub) {
    const sub = document.getElementById(idSub);
    if(sub) {
        sub.style.display = (sub.style.display === 'flex') ? 'none' : 'flex';
    }
}

// Modale Cont / Profil
function deschideModalCont() {
    document.getElementById('modal-username').innerText = utilizatorLogat;
    document.getElementById('modal-rol').innerText = (rolLogat === "profesor") ? "Profesor Coordonator 🎓" : "Elev Explorator 🚀";
    document.getElementById('modal-cont').classList.remove('ascuns');
}
function inchideModalCont() {
    document.getElementById('modal-cont').classList.add('ascuns');
}

// Mascota Bula de dialog
function salutaMascota(text) {
    if(bulaText) {
        bulaText.innerText = text;
        bulaText.classList.remove('ascuns');
        setTimeout(() => bulaText.classList.add('ascuns'), 5000);
    }
}

// Joc Interactiv - Șablon Placeholder 
function initJocPlanta() {
    salutaMascota("Trage denumirile în cercurile corespunzătoare de pe plantă! 🌱");
}
