// ==========================================================================
// 1. SELECTORI GLOBALI CORE (Identici cu elementele tale din index.html)
// ==========================================================================
const catImg = document.getElementById('cat-img');
const bulaText = document.getElementById('bula-text');
const gridPrincipal = document.getElementById('grid-principal');
const quizContainer = document.getElementById('quiz-container');
const containerPlanta = document.getElementById('exercitiu-vizual-container');
const subMeniuriMatematica = document.getElementById('sub-meniuri-matematica');
const subMeniuriRomana = document.getElementById('sub-meniuri-romana');

let indexIntrebareCurenta = 0;
let dateQuiz = [];
let dateProiect = { utilizatori: [], materii: { Matematica: [], Stiinte: [], Romana: [] } };
let utilizatorLogat = "";
let rolLogat = "";
let clasaCurentaSelectata = "";

// Schimbă textul din bulă fără să modifice poziția sau dimensiunea imaginii
function schimbaStareMascota(stare, text) {
    if (bulaText) {
        bulaText.innerText = text;
    }
}

// Încărcare sigură din materii.json
async function incarcaDate() {
    try {
        const raspuns = await fetch('materii.json');
        dateProiect = await raspuns.json();
        console.log("Datele din JSON au fost încărcate cu succes!");
    } catch (err) {
        console.error("Eroare la încărcarea fișierului JSON:", err);
    }
}
incarcaDate();

// ==========================================================================
// 2. LOGICĂ DE LOGIN ȘI SELECTARE ROL
// ==========================================================================
function comutaEcraneAutentificare(tip) {
    const fLogin = document.getElementById('fereastra-login') || document.getElementById('form-login');
    const fRegister = document.getElementById('fereastra-register') || document.getElementById('form-register');
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

function setRol(ales) {
    rolLogat = ales;
    document.getElementById('ecran-rol').classList.add('ascuns');
    document.getElementById('interfata-principala').classList.remove('ascuns');

    if (rolLogat === "profesor") {
        document.getElementById('dashboard-profesor').classList.remove('ascuns');
        if (gridPrincipal) gridPrincipal.classList.add('ascuns');
        schimbaStareMascota('vesel', 'Bun venit, domnule Profesor!');
        afiseazaClaseProfesor();
    } else {
        document.getElementById('dashboard-profesor').classList.add('ascuns');
        if (gridPrincipal) gridPrincipal.classList.remove('ascuns');
        schimbaStareMascota('vesel', 'Salut, micule explorator! Alege clasa ta.');
    }
}

// ==========================================================================
// 3. NAVIGARE DISCIPLINE (Apelate direct de butoanele tale din HTML)
// ==========================================================================

// Când utilizatorul apasă pe Clasa Pregătitoare -> Științe
function deschidePregatitoareStiinte() {
    ascundeToateSectiunile();
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    if (containerPlanta) containerPlanta.classList.remove('ascuns');
    document.getElementById('btn-acasa-nou').classList.remove('ascuns');
    schimbaStareMascota('vesel', 'Ajut-o pe căpșună să crească mare! 🍓');
}

// Când utilizatorul apasă pe o clasă din categoria Gimnaziu/Liceu -> Matematica
function deschideMatematicaMeniu() {
    ascundeToateSectiunile();
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    if (subMeniuriMatematica) {
        subMeniuriMatematica.classList.remove('ascuns');
        subMeniuriMatematica.style.display = 'flex';
    }
    document.getElementById('btn-acasa-nou').classList.remove('ascuns');
}

// Când utilizatorul apasă pe o clasă din categoria Gimnaziu/Liceu -> Romana
function deschideRomanaMeniu() {
    ascundeToateSectiunile();
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    if (subMeniuriRomana) {
        subMeniuriRomana.classList.remove('ascuns');
        subMeniuriRomana.style.display = 'flex';
    }
    document.getElementById('btn-acasa-nou').classList.remove('ascuns');
}

function toggleSubMath(idSub) {
    const sub = document.getElementById(idSub);
    if (sub) {
        sub.style.display = (sub.style.display === 'flex') ? 'none' : 'flex';
    }
}

// ==========================================================================
// 4. LOGICĂ QUIZ & COMPORTAMENT BUTOANE
// ==========================================================================
function pornesteQuiz(materie) {
    ascundeToateSectiunile();
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    if (quizContainer) quizContainer.classList.remove('ascuns');
    document.getElementById('btn-acasa-nou').classList.remove('ascuns');
    
    // Încărcăm setul corect de întrebări din JSON
    dateQuiz = dateProiect.materii[materie] || [];
    
    indexIntrebareCurenta = 0;
    incarcaIntrebare();
}

function incarcaIntrebare() {
    const qText = document.getElementById('quiz-intrebare-text');
    const optContainer = document.getElementById('quiz-optiuni-container');
    const explBox = document.getElementById('quiz-explicatie-box');
    if (explBox) explBox.classList.add('ascuns');

    if (indexIntrebareCurenta >= dateQuiz.length) {
        if (qText) qText.innerText = "🎉 Felicitări! Ai rezolvat toate cerințele din această lecție!";
        if (optContainer) optContainer.innerHTML = "";
        
        let streak = document.getElementById('streak-num');
        if (streak) streak.innerText = parseInt(streak.innerText) + 1;
        return;
    }

    let curent = dateQuiz[indexIntrebareCurenta];
    if (qText) qText.innerText = `${indexIntrebareCurenta + 1}. ${curent.intrebare}`;
    
    if (optContainer) {
        optContainer.innerHTML = "";
        curent.optiuni.forEach((opt, idx) => {
            const btn = document.createElement('button');
            // Folosim DOAR clasa ta nativă curată, fără cod inline care să strice designul
            btn.className = "btn-math-main";
            btn.style.width = "100%";
            btn.style.margin = "10px 0";
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
        butonApasat.style.backgroundColor = "#27ae60"; 
        butonApasat.style.color = "white";
        schimbaStareMascota('vesel', 'Răspuns corect! Excelent! 🌟');
        indexIntrebareCurenta++;
        setTimeout(incarcaIntrebare, 800);
    } else {
        butonApasat.style.backgroundColor = "#c0392b";
        butonApasat.style.color = "white";
        if (explBox && textExpl) {
            textExpl.innerText = curent.explicatie || "Analizează din nou variantele.";
            explBox.classList.remove('ascuns');
        }
    }
}

// Funcția pentru Căpșună
function udaPlanta() {
    alert("Ai udat căpșuna! 💦");
    const stadiuText = document.getElementById('stadiu-planta-text');
    if (stadiuText) stadiuText.innerText = "Stadiu: Căpșună coaptă și gustoasă! 🍓";
}

// ==========================================================================
// 5. CONTROL ȘI RESETĂRI INTERFAȚĂ (BUTONUL ACASĂ)
// ==========================================================================
function resetInterfata() {
    ascundeToateSectiunile();
    document.getElementById('btn-acasa-nou').classList.add('ascuns');
    
    if (rolLogat === "profesor") {
        if (gridPrincipal) gridPrincipal.classList.add('ascuns');
        document.getElementById('dashboard-profesor').classList.remove('ascuns');
    } else {
        document.getElementById('dashboard-profesor').classList.add('ascuns');
        if (gridPrincipal) gridPrincipal.classList.remove('ascuns');
        schimbaStareMascota('vesel', 'Alege clasa din care faci parte!');
    }
}

function ascundeToateSectiunile() {
    if (subMeniuriMatematica) { subMeniuriMatematica.classList.add('ascuns'); subMeniuriMatematica.style.display = 'none'; }
    if (subMeniuriRomana) { subMeniuriRomana.classList.add('ascuns'); subMeniuriRomana.style.display = 'none'; }
    if (quizContainer) quizContainer.classList.add('ascuns');
    if (containerPlanta) containerPlanta.classList.add('ascuns');
}

function deschideModalCont() { document.getElementById('modal-cont').classList.remove('ascuns'); }
function inchideModalCont() { document.getElementById('modal-cont').classList.add('ascuns'); }
