// ==========================================================================
// 1. STATE GLOBAL ȘI SELECTORI DOM CORE
// ==========================================================================
const catImg = document.getElementById('cat-img');
const bulaText = document.getElementById('bula-text');
const gridPrincipal = document.getElementById('grid-principal');
const quizContainer = document.getElementById('quiz-container');
const exercitiuVizualContainer = document.getElementById('exercitiu-vizual-container');
const subMeniuriMatematica = document.getElementById('sub-meniuri-matematica');
const subMeniuriRomana = document.getElementById('sub-meniuri-romana');

let indexIntrebareCurenta = 0;
let dateQuiz = [];
let dateProiect = { utilizatori: [], materii: { Matematica: [], Stiinte: [], Romana: [] } };
let utilizatorLogat = "";
let rolLogat = "";
let materieCurentaSelectata = "";
let clasaCurentaSelectata = 0;

// Schimbarea textului bulei fără a strica poziționarea flex/stânga a mascotei
function schimbaStareMascota(stare, text) {
    if (bulaText) {
        bulaText.innerText = text;
    }
}

// Structuri de LocalStorage obligatorii pentru funcționalitățile de Profesor
if (!localStorage.getItem('eduquest_clase_virtuale')) {
    localStorage.setItem('eduquest_clase_virtuale', JSON.stringify([]));
}
if (!localStorage.getItem('eduquest_materiale_postate')) {
    localStorage.setItem('eduquest_materiale_postate', JSON.stringify([]));
}

// Încărcare din materii.json cu fallback de siguranță completă
async function incarcaDate() {
    try {
        const raspuns = await fetch('materii.json');
        dateProiect = await raspuns.json();
        console.log("Datele EduQuest au fost încărcate cu succes!");
    } catch (err) {
        console.warn("Se rulează în mod local local. Se încarcă utilizatorii de test.");
        dateProiect = {
            utilizatori: [
                { "user": "elev1", "parola": "1234" },
                { "user": "profesor1", "parola": "profesor2026" }
            ],
            materii: { "Matematica": [], "Stiinte": [], "Romana": [] }
        };
    }
}
incarcaDate();

// ==========================================================================
// 2. LOGICĂ DE AUTENTIFICARE SOLIIDĂ
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
        document.getElementById('header-username').innerText = userIn;
        document.getElementById('user-profile-badge').classList.remove('ascuns');
        document.getElementById('ecran-login').classList.add('ascuns');
        document.getElementById('ecran-rol').classList.remove('ascuns');
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

    dateProiect.utilizatori.push({ "user": userIn, "parola": passIn });
    alert("Contul a fost creat cu succes! Te poți loga acum.");
    comutaEcraneAutentificare('login');
}

function setRol(ales) {
    rolLogat = ales;
    document.getElementById('ecran-rol').classList.add('ascuns');
    document.getElementById('interfata-principala').classList.remove('ascuns');

    if (rolLogat === "profesor") {
        document.getElementById('dashboard-profesor').classList.remove('ascuns');
        if (gridPrincipal) gridPrincipal.classList.add('ascuns');
        schimbaStareMascota('vesel', 'Spor la lucru, domnule Profesor! Gestionează-ți clasele de mai jos.');
        afiseazaClaseProfesor();
    } else {
        document.getElementById('dashboard-profesor').classList.add('ascuns');
        if (gridPrincipal) gridPrincipal.classList.remove('ascuns');
        schimbaStareMascota('vesel', 'Salutare! Alege clasa din care faci parte ca să începem aventura!');
        afiseazaMeniuClaseElev();
    }
}

function deschideModalCont() {
    document.getElementById('modal-username').innerText = utilizatorLogat;
    document.getElementById('modal-rol').innerText = (rolLogat === "profesor") ? "Profesor Coordonator 🎓" : "Elev Explorator 🚀";
    document.getElementById('modal-cont').classList.remove('ascuns');
}
function inchideModalCont() {
    document.getElementById('modal-cont').classList.add('ascuns');
}

// ==========================================================================
// 3. GENERARE INTERFAȚĂ CONFORM CLASELOR TALE DIN CSS (`style.css`)
// ==========================================================================
function afiseazaMeniuClaseElev() {
    if (!gridPrincipal) return;
    gridPrincipal.innerHTML = "";
    ascundeToateSectiunile();
    document.getElementById('btn-acasa-nou').classList.add('ascuns');

    // Generarea claselor respectând întocmai culorile și stilul tău din CSS
    for (let i = 0; i <= 12; i++) {
        const card = document.createElement("div");
        
        // Atribuirea claselor exact din style.css-ul tău (.clasa-card.verde / .portocaliu / .albastru)
        let tipCuloare = "albastru";
        if (i === 0 || i <= 4) tipCuloare = "verde";
        else if (i <= 8) tipCuloare = "portocaliu";

        card.className = `clasa-card ${tipCuloare}`;
        
        let textAfisat = (i === 0) ? "Clasa Pregătitoare" : `Clasa a ${i}-a`;
        card.innerHTML = `<h3>${textAfisat}</h3>`;
        
        card.onclick = () => deschideMateriileClasei(i);
        gridPrincipal.appendChild(card);
    }
}

function deschideMateriileClasei(numarClasa) {
    if (!gridPrincipal) return;
    gridPrincipal.innerHTML = "";
    document.getElementById('btn-acasa-nou').classList.remove('ascuns');
    clasaCurentaSelectata = numarClasa;

    // Definim materiile în funcție de ciclul de învățământ
    let disciplineDisponibile = ["Matematica", "Stiinte"];
    if (numarClasa >= 5) disciplineDisponibile.push("Romana");

    schimbaStareMascota('vesel', `Ai ales Clasa ${numarClasa === 0 ? 'Pregătitoare' : numarClasa}. Selectează o materie!`);

    disciplineDisponibile.forEach(disc => {
        const card = document.createElement("div");
        
        // Mapăm culorile frumoase pe materii conform template-ului tău de design
        let culoareMatorie = "verde";
        if (disc === "Matematica") culoareMatorie = "albastru";
        if (disc === "Romana") culoareMatorie = "portocaliu";

        card.className = `clasa-card ${culoareMatorie}`;
        
        let iconita = "📚";
        if (disc === "Matematica") iconita = "📐";
        if (disc === "Romana") iconita = "✍️";
        if (disc === "Stiinte") iconita = "🧪";

        card.innerHTML = `<h3>${iconita} ${disc}</h3>`;
        
        card.onclick = () => proceseazaAlegereMaterie(disc, numarClasa);
        gridPrincipal.appendChild(card);
    });
}

function proceseazaAlegereMaterie(materie, clasa) {
    materieCurentaSelectata = materie;
    
    // CAZ SPECIAL: Clasa Pregătitoare / Clasa 0 - Științe (Deschide Căpșuna)
    if (clasa === 0 && materie === "Stiinte") {
        if (gridPrincipal) gridPrincipal.classList.add('ascuns');
        if (exercitiuVizualContainer) exercitiuVizualContainer.classList.remove('ascuns');
        schimbaStareMascota('vesel', 'Uită-te la căpșună! Hai să o ajutăm să crească mare și sănătoasă!');
        return;
    }

    // Pentru clasele primare (0-4), deschidem direct Quiz-ul corespunzător
    if (clasa <= 4) {
        pornesteQuiz(materie);
        return;
    }

    // Pentru gimnaziu/liceu, deschidem sub-meniurile tale dedicate din HTML
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');

    if (materie === "Matematica") {
        if (subMeniuriMatematica) {
            subMeniuriMatematica.classList.remove('ascuns');
            subMeniuriMatematica.style.display = 'flex';
        }
    } else if (materie === "Romana") {
        if (subMeniuriRomana) {
            subMeniuriRomana.classList.remove('ascuns');
            subMeniuriRomana.style.display = 'flex';
        }
    } else {
        // Fallback general în caz că se apasă pe Științe la clase mari
        pornesteQuiz(materie);
    }
}

function toggleSubMath(idSub) {
    const sub = document.getElementById(idSub);
    if (sub) {
        sub.style.display = (sub.style.display === 'flex') ? 'none' : 'flex';
    }
}

// Funcții atașate butoanelor tale de Teorie din Sub-meniuri
function deschideTeorie(tip) {
    alert(`📚 [EduQuest Teorie]: Se încarcă modulul de teorie detaliată pentru ${tip} aferent Clasei a ${clasaCurentaSelectata}-a.`);
}

// ==========================================================================
// 4. LOGICĂ INJECTARE ȘI REZOLVARE ÎNTREBĂRI (QUIZ CORRIGAT)
// ==========================================================================
function pornesteQuiz(materie) {
    ascundeToateSectiunile();
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    if (quizContainer) quizContainer.classList.remove('ascuns');
    
    // Extragere sigură din structura fișierului tău JSON
    dateQuiz = dateProiect.materii[materie] || [];
    
    if (dateQuiz.length === 0) {
        // Fallback dinamic sigur ca să nu crăpe aplicația pe scenă la concurs
        dateQuiz = [
            { "intrebare": `Exercițiu din ${materie}: Cât obținem din calculul 5 + 5?`, "optiuni": ["a) 8", "b) 10", "c) 12", "d) 15"], "corect": 1, "explicatie": "Calcul simplu: 5 adunat cu 5 dă rezultatul 10." }
        ];
    }
    
    indexIntrebareCurenta = 0;
    incarcaIntrebare();
}

function incarcaIntrebare() {
    const qText = document.getElementById('quiz-intrebare-text');
    const optContainer = document.getElementById('quiz-optiuni-container');
    const explBox = document.getElementById('quiz-explicatie-box');
    if (explBox) explBox.classList.add('ascuns');

    if (indexIntrebareCurenta >= dateQuiz.length) {
        if (qText) qText.innerText = "🎉 Excelent! Ai terminat toate exercițiile din această secțiune!";
        if (optContainer) optContainer.innerHTML = "";
        
        let streak = document.getElementById('streak-num');
        if (streak) streak.innerText = parseInt(streak.innerText) + 1;
        schimbaStareMascota('vesel', 'Sunt mândru de tine! Ai rezolvat totul corect! 🔥');
        return;
    }

    let curent = dateQuiz[indexIntrebareCurenta];
    if (qText) qText.innerText = `${indexIntrebareCurenta + 1}. ${curent.intrebare}`;
    
    if (optContainer) {
        optContainer.innerHTML = "";
        curent.optiuni.forEach((opt, idx) => {
            const btn = document.createElement('button');
            
            // Folosim exact clasa ta nativă de buton din style.css fără stiluri inline dăunătoare!
            btn.className = "btn-math-main";
            btn.style.width = "100%";
            btn.style.margin = "8px 0";
            btn.innerText = opt;
            
            btn.onclick = () => verificaRaspuns(idx, btn);
            optContainer.appendChild(btn);
        });
    }
}

function verificaRaspuns(ales, butonApasat) {
    let curent = dateQuiz[indexIntrebareCurenta];
    const explBox = document.getElementById('quiz-explicatie-box');
    const textExpl = document.getElementById('quiz-explicatie-text');

    if (ales === curent.corect) {
        butonApasat.style.backgroundColor = "#27ae60"; // Schimbare temporară vizuală de succes
        butonApasat.style.color = "white";
        schimbaStareMascota('vesel', 'Răspuns corect! 🌟 Ține-o tot așa!');
        indexIntrebareCurenta++;
        setTimeout(incarcaIntrebare, 900);
    } else {
        butonApasat.style.backgroundColor = "#c0392b";
        butonApasat.style.color = "white";
        schimbaStareMascota('trist', 'Ooo! Nu-i nimic, citește explicația de mai jos și sigur vei înțelege.');
        if (explBox && textExpl) {
            textExpl.innerText = curent.explicatie || "Analizează cerința din nou cu atenție.";
            explBox.classList.remove('ascuns');
        }
    }
}

// Funcționalitatea căpșunei de la Pregătitoare
function udaPlanta() {
    alert("Ai udat căpșuna cu succes! 💦");
    const stadiuText = document.getElementById('stadiu-planta-text');
    if (stadiuText) stadiuText.innerText = "Stadiu: Căpșună coaptă, roșie și fericită! 🍓";
    schimbaStareMascota('vesel', 'Minunat! Datorită ție, planta a crescut complet!');
}

// ==========================================================================
// 5. ZONE PROFESORI & CLASE VIRTUALE
// ==========================================================================
function afiseazaClaseProfesor() {
    const container = document.getElementById('grid-clase-profesor');
    if (!container) return;
    container.innerHTML = '';
    
    let clase = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')) || [];
    let claseleMele = clase.filter(c => c.profesor === utilizatorLogat);
    
    if (claseleMele.length === 0) {
        container.innerHTML = "<p style='color:#777; font-style:italic;'>Nu aveți nicio clasă virtuală înființată încă.</p>";
        return;
    }
    
    claseleMele.forEach(c => {
        const card = document.createElement('div');
        card.style.background = "white";
        card.style.padding = "15px";
        card.style.borderRadius = "12px";
        card.style.border = "2px solid var(--orange-soft)";
        card.innerHTML = `<h3 style="margin:0 0 5px 0; color:var(--orange-dark);">${c.nume}</h3><p style="margin:0; font-size:13px; color:var(--text-brown);"><b>Cod de înscriere: ${c.id}</b></p>`;
        container.appendChild(card);
    });
}

function creeazaClasa() {
    const nume = document.getElementById('nume-clasa-noua').value.trim();
    if (!nume) { alert("Te rugăm să introduci numele clasei!"); return; }

    let cod = Math.random().toString(36).substring(2, 7).toUpperCase();
    let clase = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')) || [];
    
    clase.push({ id: cod, nume: nume, profesor: utilizatorLogat });
    localStorage.setItem('eduquest_clase_virtuale', JSON.stringify(clase));
    
    document.getElementById('nume-clasa-noua').value = "";
    document.getElementById('modal-creare-clasa').classList.add('ascuns');
    afiseazaClaseProfesor();
    alert(`Clasa a fost salvată! Codul de acces este: ${cod}`);
}

function deschideModalMaterial() {
    const select = document.getElementById('select-clasa-material');
    if (!select) return;
    select.innerHTML = "";

    let clase = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')) || [];
    let claseleMele = clase.filter(c => c.profesor === utilizatorLogat);
    
    if (claseleMele.length === 0) { alert("Vă rugăm să creați o clasă mai întâi!"); return; }

    claseleMele.forEach(c => {
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

    if (!titlu || !descriere) { alert("Toate câmpurile sunt obligatorii!"); return; }

    let materiale = JSON.parse(localStorage.getItem('eduquest_materiale_postate')) || [];
    materiale.push({ clasaId: clasaId, titlu: titlu, descriere: descriere });
    localStorage.setItem('eduquest_materiale_postate', JSON.stringify(materiale));

    document.getElementById('titlu-material').value = "";
    document.getElementById('descriere-material').value = "";
    document.getElementById('modal-postare-material').classList.add('ascuns');
    alert("Materialul didactic a fost postat cu succes în fluxul clasei!");
}

// ==========================================================================
// 6. CONTROL ȘI RESETĂRI INTERFAȚĂ (BUTONUL ACASĂ)
// ==========================================================================
function resetInterfata() {
    ascundeToateSectiunile();
    
    if (rolLogat === "profesor") {
        if (gridPrincipal) gridPrincipal.classList.add('ascuns');
        document.getElementById('dashboard-profesor').classList.remove('ascuns');
        afiseazaClaseProfesor();
    } else {
        document.getElementById('dashboard-profesor').classList.add('ascuns');
        if (gridPrincipal) gridPrincipal.classList.remove('ascuns');
        afiseazaMeniuClaseElev();
    }
}

function ascundeToateSectiunile() {
    if (subMeniuriMatematica) { subMeniuriMatematica.classList.add('ascuns'); subMeniuriMatematica.style.display = 'none'; }
    if (subMeniuriRomana) { subMeniuriRomana.classList.add('ascuns'); subMeniuriRomana.style.display = 'none'; }
    if (quizContainer) quizContainer.classList.add('ascuns');
    if (exercitiuVizualContainer) exercitiuVizualContainer.classList.add('ascuns');
    const vizClasaElev = document.getElementById('vizualizare-clasa-elev');
    if (vizClasaElev) vizClasaElev.classList.add('ascuns');
}
