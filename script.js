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

async function incarcaDate() {
    try {
        const raspuns = await fetch('materii.json');
        dateProiect = await raspuns.json();
    } catch (err) { console.error("Eroare JSON:", err); }
}
incarcaDate();

// ==========================================
// 2. LOGICĂ DE AUTENTIFICARE
// ==========================================
function comutaEcraneAutentificare(tip) {
    if (tip === 'register') {
        document.getElementById('form-login').classList.add('ascuns');
        document.getElementById('form-register').classList.remove('ascuns');
    } else {
        document.getElementById('form-register').classList.add('ascuns');
        document.getElementById('form-login').classList.remove('ascuns');
    }
}

function proceseazaInregistrare() {
    const user = document.getElementById('register-user').value.trim();
    const pass = document.getElementById('register-pass').value.trim();
    if (!user || !pass) { alert("Completează tot!"); return; }
    let utilizatori = JSON.parse(localStorage.getItem('baza_date_utilizatori')) || [];
    if (utilizatori.find(u => u.username === user)) { alert("Există deja!"); return; }
    utilizatori.push({ username: user, parola: pass });
    localStorage.setItem('baza_date_utilizatori', JSON.stringify(utilizatori));
    alert("Cont creat!");
    comutaEcraneAutentificare('login');
}

function proceseazaLogin() {
    const userInjected = document.getElementById('login-user').value.trim();
    const passInjected = document.getElementById('login-pass').value.trim();
    let utilizatoriLocal = JSON.parse(localStorage.getItem('baza_date_utilizatori')) || [];
    const utilizatorGasit = utilizatoriLocal.find(u => u.username === userInjected && u.parola === passInjected);
    if (utilizatorGasit) {
        utilizatorLogat = userInjected;
        document.getElementById('header-username').innerText = userInjected;
        document.getElementById('user-profile-badge').classList.remove('ascuns');
        arataSelectieRol(); 
    } else { alert("Login greșit!"); }
}

function arataSelectieRol() {
    document.getElementById('ecran-login').classList.add('ascuns');
    document.getElementById('ecran-rol').classList.remove('ascuns');
}

function setRol(rol) {
    document.getElementById('ecran-rol').classList.add('ascuns');
    document.getElementById('interfata-principala').classList.remove('ascuns');
    if(rol === 'elev') afiseazaSelectieClase();
}

// ==========================================
// 3. AFIȘARE MATERII ȘI PDF-URI DINAMICE
// ==========================================
function afiseazaSelectieClase() {
    gridPrincipal.classList.remove('ascuns');
    quizContainer.classList.add('ascuns');
    gridPrincipal.innerHTML = '';
    for (let i = 5; i <= 11; i++) {
        const card = document.createElement('div');
        card.className = `clasa-card`;
        card.innerHTML = `<h3>Clasa a ${i}-a</h3>`;
        card.onclick = () => afiseazaMateriile(`Clasa a ${i}-a`);
        gridPrincipal.appendChild(card);
    }
}

function afiseazaMateriile(numeClasa) {
    gridPrincipal.innerHTML = '';
    const btnAcasa = document.getElementById('btn-acasa-nou');
    if(btnAcasa) btnAcasa.classList.remove('ascuns');

    const clasaNumar = parseInt(numeClasa.replace(/[^0-9]/g, ''), 10) || 0;
    const materii = [{ nume: 'Matematica', clasaCSS: 'albastru' }, { nume: 'Stiinte', clasaCSS: 'verde' }];

    materii.forEach(m => {
        const card = document.createElement('div');
        card.className = `clasa-card ${m.clasaCSS}`;
        card.innerHTML = `<h3>${m.nume}</h3>`;
        card.onclick = () => {
            if (m.nume === 'Matematica') {
                gridPrincipal.innerHTML = ''; 
                const meniuMath = document.getElementById('sub-meniuri-matematica');
                if (meniuMath) {
                    const btnMainB = meniuMath.querySelector('.math-section-container:nth-child(2) .btn-math-main');
                    const linkAlg = document.getElementById('link-teorie-algebra');
                    const linkGeom = document.getElementById('link-teorie-geometrie');

                    let numeAlg = (clasaNumar >= 9) ? `Teorie_Algebra_Clasa_${clasaNumar}_Portocaliu.pdf` : `Teorie_Algebra_Clasa_${clasaNumar}.pdf`;
                    if(linkAlg) linkAlg.setAttribute('href', numeAlg);

                    if (clasaNumar === 11) {
                        btnMainB.innerText = "Analiză Matematică";
                        if(linkGeom) linkGeom.setAttribute('href', "Teorie_Analiza_Matematica_Clasa_11.pdf");
                    } else if (clasaNumar === 9) {
                        btnMainB.innerText = "Geometrie Vectorială";
                        if(linkGeom) linkGeom.setAttribute('href', "Teorie_Geometrie_Vectoriala_Clasa_9.pdf");
                    } else if (clasaNumar === 10) {
                        btnMainB.innerText = "Geometrie Analitică";
                        if(linkGeom) linkGeom.setAttribute('href', "Teorie_Geometrie_Analitica_Clasa_10.pdf");
                    } else {
                        btnMainB.innerText = "Geometrie";
                        if(linkGeom) linkGeom.setAttribute('href', `Teorie_Geometrie_Clasa_${clasaNumar}.pdf`);
                    }
                    meniuMath.classList.remove("ascuns");
                    meniuMath.style.display = 'flex';
                }
            } else { pornesteQuiz(m.nume); }
        };
        gridPrincipal.appendChild(card);
    });
}

function toggleSubMath(id) {
    document.getElementById('sub-algebra').style.display = 'none';
    document.getElementById('sub-geometrie').style.display = 'none';
    const c = document.getElementById(id);
    if(c) c.style.display = 'flex';
}

// ==========================================
// 4. RESTUL LOGICII (Quiz & Mascota) - Păstrate intacte
// ==========================================
function pornesteQuiz(materie) {
    gridPrincipal.classList.add('ascuns');
    quizContainer.classList.remove('ascuns');
    dateQuiz = dateProiect.materii[materie] || [];
    afiseazaIntrebare();
}

function afiseazaIntrebare() { /* ... logica ta de quiz ... */ }
function schimbaStareMascota(stare, mesaj) { /* ... logica ta de mascotă ... */ }
function resetInterfata() {
    quizContainer.classList.add('ascuns');
    gridPrincipal.classList.remove('ascuns');
    const meniuMath = document.getElementById('sub-meniuri-matematica');
    if(meniuMath) { meniuMath.classList.add("ascuns"); meniuMath.style.display = 'none'; }
    afiseazaSelectieClase();
}
