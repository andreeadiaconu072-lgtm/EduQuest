// ==========================================================================
// 1. STATE GLOBAL ȘI CONFIGURĂRI INITIALE
// ==========================================================================
let dateProiect;
let utilizatorLogat = "";
let rolLogat = "";

// Referințe către elementele cheie din DOM
const gridPrincipal = document.getElementById("grid-principal");
const subMeniuriMatematica = document.getElementById("sub-meniuri-matematica");
const subMeniuriRomana = document.getElementById("sub-meniuri-romana");
const quizContainer = document.getElementById("quiz-container");
const exercitiuVizualContainer = document.getElementById("exercitiu-vizual-container");
const interfataPrincipala = document.getElementById("interfata-principala");
const ecranLogin = document.getElementById("ecran-login");
const ecranRol = document.getElementById("ecran-rol");
const btnAcasaNou = document.getElementById("btn-acasa-nou");

// Inițializare baze de date în LocalStorage dacă nu există
if (!localStorage.getItem('eduquest_clase_virtuale')) {
    localStorage.setItem('eduquest_clase_virtuale', JSON.stringify([]));
}
if (!localStorage.getItem('eduquest_materiale_postate')) {
    localStorage.setItem('eduquest_materiale_postate', JSON.stringify([]));
}

// Încărcare din fișierul JSON local cu fallback de siguranță
async function incarcaDate() {
    try {
        const raspuns = await fetch('materii.json');
        dateProiect = await raspuns.json();
    } catch (err) {
        console.warn("Rulare locală detectată. Se încarcă utilizatorii de siguranță.");
        dateProiect = {
            utilizatori: [
                { "user": "elev1", "parola": "1234" },
                { "user": "profesor1", "parola": "profesor2026" }
            ],
            materii: {
                "Matematica": {},
                "Romana": {},
                "Stiinte": {}
            }
        };
    }
}
incarcaDate();

// ==========================================================================
// 2. LOGICĂ DE AUTENTIFICARE (LOGIN & ÎNREGISTRARE)
// ==========================================================================
function comutaEcraneAutentificare(tip) {
    const fLogin = document.getElementById('fereastra-login');
    const fRegister = document.getElementById('fereastra-register');
    if (tip === 'register') {
        fLogin.classList.add('ascuns');
        fRegister.classList.remove('ascuns');
    } else {
        fRegister.classList.add('ascuns');
        fLogin.classList.remove('ascuns');
    }
}

function proceseazaLogin() {
    const userIn = document.getElementById('login-user').value.trim();
    const passIn = document.getElementById('login-pass').value.trim();

    if (!userIn || !passIn) {
        alert("Te rugăm să completezi ambele câmpuri!");
        return;
    }

    const gasit = dateProiect.utilizatori.find(u => u.user === userIn && u.parola === passIn);

    if (gasit) {
        utilizatorLogat = userIn;
        if (userIn.includes("profesor")) {
            rolLogat = "profesor";
            pornesteAplicatie();
        } else if (userIn.includes("elev")) {
            rolLogat = "elev";
            pornesteAplicatie();
        } else {
            ecranLogin.classList.add('ascuns');
            ecranRol.classList.remove('ascuns');
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

    dateProiect.utilizatori.push({ "user": userIn, "parola": passIn });
    alert("Cont creat! Acum te poți loga.");
    comutaEcraneAutentificare('login');
}

function setRol(ales) {
    rolLogat = ales;
    ecranRol.classList.add('ascuns');
    pornesteAplicatie();
}

function pornesteAplicatie() {
    ecranLogin.classList.add('ascuns');
    ecranRol.classList.add('ascuns');
    interfataPrincipala.classList.remove('ascuns');

    document.getElementById('user-profile-badge').classList.remove('ascuns');
    document.getElementById('header-username').innerText = utilizatorLogat;

    if (rolLogat === "profesor") {
        gridPrincipal.classList.add('ascuns');
        document.getElementById('dashboard-profesor').classList.remove('ascuns');
        afiseazaClaseProfesor();
    } else {
        gridPrincipal.classList.remove('ascuns');
        document.getElementById('dashboard-profesor').classList.add('ascuns');
        afiseazaMeniuDiscipline();
    }
}

// ==========================================================================
// 3. AFIȘARE ȘI GESTIONARE DISCIPLINE & CLASE
// ==========================================================================
function afiseazaMeniuDiscipline() {
    if (!gridPrincipal) return;
    gridPrincipal.innerHTML = "";
    
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
    }
}

function deschideDisciplina(disciplina) {
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    if (btnAcasaNou) btnAcasaNou.classList.remove('ascuns');

    if (disciplina === "Matematica") {
        subMeniuriMatematica.classList.remove('ascuns');
    } else if (disciplina === "Romana") {
        subMeniuriRomana.classList.remove('ascuns');
    } else if (disciplina === "Stiinte") {
        if(exercitiuVizualContainer) exercitiuVizualContainer.classList.remove('ascuns');
    }
}

function toggleSubMath(idSub) {
    const sub = document.getElementById(idSub);
    if(sub) {
        sub.style.display = (sub.style.display === 'flex') ? 'none' : 'flex';
    }
}

// ==========================================================================
// 4. FUNCȚIONALITĂȚI PRIVILEGII PROFESOR
// ==========================================================================
function afiseazaClaseProfesor() {
    const container = document.getElementById('grid-clase-profesor');
    if (!container) return;
    container.innerHTML = '';
    
    let safeClase = localStorage.getItem('eduquest_clase_virtuale');
    let clase = safeClase ? JSON.parse(safeClase).filter(c => c.profesor === utilizatorLogat) : [];
    
    if(clase.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #777;'>Nu ai nicio clasă creată încă.</p>";
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
    alert(`Clasa a fost creată! Cod: ${cod}`);
}

function deschideModalMaterial() {
    const select = document.getElementById('select-clasa-material');
    if(!select) return;
    select.innerHTML = "";

    let clase = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')).filter(c => c.profesor === utilizatorLogat);
    if(clase.length === 0) { alert("Creează o clasă mai întâi!"); return; }

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
    alert("Material postat!");
}

// ==========================================================================
// 5. ZONE ELEVI (VIZUALIZARE TEME & MATERIALE)
// ==========================================================================
function alaturaClasaElev() {
    const cod = document.getElementById('cod-clasa-alaturare').value.trim().toUpperCase();
    if(!cod) { alert("Introdu codul clasei!"); return; }

    let toateClasele = JSON.parse(localStorage.getItem('eduquest_clase_virtuale'));
    let clasaGasita = toateClasele.find(c => c.id === cod);

    if(!clasaGasita) {
        alert("Codul nu este valid!");
        return;
    }

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
    alert(`Te-ai alăturat clasei: ${clasaGasita.nume}`);
    deschideClaseleMeleElev();
}

function deschideClaseleMeleElev() {
    if (gridPrincipal) gridPrincipal.innerHTML = "";
    if (gridPrincipal) gridPrincipal.classList.remove('ascuns');
    ascundeToateSectiunile();

    let cheieInscrieri = `eduquest_inscrieri_${utilizatorLogat}`;
    let safeInscrieri = localStorage.getItem(cheieInscrieri);
    let clase = safeInscrieri ? JSON.parse(safeInscrieri) : [];
    
    if(clase.length === 0) {
        gridPrincipal.innerHTML = "<p style='text-align: center; width: 100%; color: #777; margin-top:20px;'>Nu faci parte din nicio clasă încă.</p>";
        if(btnAcasaNou) btnAcasaNou.classList.remove('ascuns');
        return;
    }
    
    clase.forEach(c => {
        const card = document.createElement('div');
        card.className = "card-disciplina-nou";
        card.style.borderColor = "var(--orange-primary)";
        card.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 10px;">🏫</div>
            <h3 style="margin: 5px 0; color: var(--orange-dark);">${c.nume}</h3>
            <p style="font-size: 13px; color: #777; margin: 0;">Profesor: ${c.profesor}</p>
        `;
        card.onclick = () => deschideClasaElev(c.id, c.nume);
        gridPrincipal.appendChild(card);
    });

    if(btnAcasaNou) btnAcasaNou.classList.remove('ascuns');
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
        lista.innerHTML = "<p style='text-align: center; color: #777; margin: 20px 0;'>Nu există materiale postate aici.</p>"; 
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

// ==========================================================================
// 6. NAVIGARE ȘI RESETĂRI INTERFAȚĂ
// ==========================================================================
function resetInterfata() {
    ascundeToateSectiunile();
    if(btnAcasaNou) btnAcasaNou.classList.add('ascuns');

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

function ascundeToateSectiunile() {
    if(subMeniuriMatematica) subMeniuriMatematica.classList.add('ascuns');
    if(subMeniuriRomana) subMeniuriRomana.classList.add('ascuns');
    if(quizContainer) quizContainer.classList.add('ascuns');
    if(exercitiuVizualContainer) exercitiuVizualContainer.classList.add('ascuns');
    document.getElementById('vizualizare-clasa-elev').classList.add('ascuns');
}

function deschideModalCont() {
    document.getElementById('modal-username').innerText = utilizatorLogat;
    document.getElementById('modal-rol').innerText = (rolLogat === "profesor") ? "Profesor Coordonator 🎓" : "Elev Explorator 🚀";
    document.getElementById('modal-cont').classList.remove('ascuns');
}
function inchideModalCont() {
    document.getElementById('modal-cont').classList.add('ascuns');
}
