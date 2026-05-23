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
let dateProiect = { utilizatori: [], materii: { Matematica: [], Stiinte: [], Romana: [] } };
let utilizatorLogat = "";
let rolLogat = "";

// Funcție de siguranță pentru mascotă
function schimbaStareMascota(stare, text) {
    if (bulaText) bulaText.innerText = text;
}

// Inițializare Baze de Date în LocalStorage
if (!localStorage.getItem('eduquest_clase_virtuale')) {
    localStorage.setItem('eduquest_clase_virtuale', JSON.stringify([]));
}
if (!localStorage.getItem('eduquest_materiale_postate')) {
    localStorage.setItem('eduquest_materiale_postate', JSON.stringify([]));
}

// ÎNCĂRCARE DATE DIN JSON
async function incarcaDate() {
    try {
        const raspuns = await fetch('materii.json');
        dateProiect = await raspuns.json();
        console.log("Datele JSON au fost încărcate cu succes!", dateProiect);
    } catch (err) {
        console.error("Eroare la încărcarea fișierului JSON:", err);
        // Fallback în caz de rulare directă din fișier
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

// ==========================================
// 2. LOGICĂ DE AUTENTIFICARE & CONT
// ==========================================
function comutaEcraneAutentificare(tip) {
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    
    if (tip === 'register') {
        if (loginForm) loginForm.classList.add('ascuns');
        if (registerForm) registerForm.classList.remove('ascuns');
    } else {
        if (registerForm) registerForm.classList.add('ascuns');
        if (loginForm) loginForm.classList.remove('ascuns');
    }
}

function proceseazaInregistrare() {
    const user = document.getElementById('register-user').value.trim();
    const pass = document.getElementById('register-pass').value.trim();
    if (!user || !pass) { alert("Completează ambele câmpuri!"); return; }
    
    let utilizatori = JSON.parse(localStorage.getItem('baza_date_utilizatori')) || [];
    if (utilizatori.find(u => u.username.toLowerCase() === user.toLowerCase())) { alert("Utilizator existent!"); return; }
    
    utilizatori.push({ username: user, parola: pass });
    localStorage.setItem('baza_date_utilizatori', JSON.stringify(utilizatori));
    alert("Cont creat cu succes!");
    comutaEcraneAutentificare('login');
}

function proceseazaLogin() {
    const userInjected = document.getElementById('login-user').value.trim();
    const passInjected = document.getElementById('login-pass').value.trim();
    if (!userInjected || !passInjected) { alert("Completează datele!"); return; }
    
    let utilizatoriJSON = dateProiect.utilizatori || [];
    let utilizatoriLocal = JSON.parse(localStorage.getItem('baza_date_utilizatori')) || [];
    let totiUtilizatorii = [...utilizatoriJSON, ...utilizatoriLocal.map(u => ({ user: u.username, parola: u.parola }))];

    const gasit = totiUtilizatorii.find(u => (u.user === userInjected || u.username === userInjected) && u.parola === passInjected);

    if (gasit) {
        utilizatorLogat = userInjected;
        document.getElementById('header-username').innerText = userInjected;
        document.getElementById('user-profile-badge').classList.remove('ascuns');
        document.getElementById('ecran-login').classList.add('ascuns');
        document.getElementById('ecran-rol').classList.remove('ascuns');
    } else { 
        alert("Nume utilizator sau parolă incorectă!"); 
    }
}

function deschideModalCont() {
    if (!utilizatorLogat) return;
    document.getElementById('modal-username').innerText = utilizatorLogat;
    document.getElementById('modal-rol').innerText = rolLogat === 'profesor' ? "Profesor Coordonator 🎓" : "Elev Explorator 🚀";
    document.getElementById('modal-cont').classList.remove('ascuns');
}

function inchideModalCont() { document.getElementById('modal-cont').classList.add('ascuns'); }

// ==========================================
// 3. NAVIGARE PRINCIPALĂ & MANAGEMENT INTERFAȚĂ
// ==========================================
function setRol(rol) {
    rolLogat = rol;
    document.getElementById('ecran-rol').classList.add('ascuns');
    document.getElementById('interfata-principala').classList.remove('ascuns');
    
    if (rol === 'profesor') {
        schimbaStareMascota('vesel', 'Bun venit, domnule Profesor!');
        document.getElementById('dashboard-profesor').classList.remove('ascuns');
        afiseazaClaseProfesor();
    } else {
        schimbaStareMascota('vesel', 'Salut, micule explorator! Alege o clasă.');
        afiseazaSelectieClase();
    }
}

function resetInterfata() {
    const subMeniuriMatematica = document.getElementById('sub-meniuri-matematica');
    const subMeniuriRomana = document.getElementById('sub-meniuri-romana');
    const vizualizareClasaElev = document.getElementById('vizualizare-clasa-elev');
    
    if (subMeniuriMatematica) { subMeniuriMatematica.classList.add('ascuns'); subMeniuriMatematica.style.display = 'none'; }
    if (subMeniuriRomana) { subMeniuriRomana.classList.add('ascuns'); subMeniuriRomana.style.display = 'none'; }
    if (vizualizareClasaElev) vizualizareClasaElev.classList.add('ascuns');
    if (quizContainer) quizContainer.classList.add('ascuns');
    if (containerPlanta) containerPlanta.classList.add('ascuns');
    
    if (rolLogat === 'profesor') {
        document.getElementById('dashboard-profesor').classList.remove('ascuns');
        if (gridPrincipal) gridPrincipal.classList.add('ascuns');
        afiseazaClaseProfesor();
    } else {
        document.getElementById('dashboard-profesor').classList.add('ascuns');
        afiseazaSelectieClase();
    }
}

function afiseazaSelectieClase() {
    if (gridPrincipal) gridPrincipal.classList.remove('ascuns');
    if (quizContainer) quizContainer.classList.add('ascuns');
    if (containerPlanta) containerPlanta.classList.add('ascuns');
    
    const btnAcasa = document.getElementById('btn-acasa-nou');
    if (btnAcasa) btnAcasa.classList.add('ascuns');
    
    if (!gridPrincipal) return;
    gridPrincipal.innerHTML = '';

    // Secțiune clase virtuale
    const divVirtual = document.createElement('div');
    divVirtual.style.width = "100%";
    divVirtual.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; width:100%;">
            <h2 style="color:#d35400; margin:0; font-family:'Fredoka', sans-serif;">📚 Clasele Mele (Virtuale)</h2>
            <button class="btn-math-sub" style="margin:0; font-size:14px; padding:8px 15px; border-radius:8px; cursor:pointer;" onclick="document.getElementById('modal-alaturare-clasa').classList.remove('ascuns')">+ Alătură-te</button>
        </div>
        <div id="grid-clase-virtuale-elev" style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:30px; width:100%;"></div>
        <hr style="width:100%; border: 1px solid #fdebd0; margin-bottom:30px;">
    `;
    gridPrincipal.appendChild(divVirtual);
    incarcaClaseVirtualeElev();

    // Generare clase 0-12
    for (let i = 0; i <= 12; i++) {
        let numeClasa = i === 0 ? 'Clasa 0' : `Clasa a ${i}-a`;
        let culoareCSS = (i === 0 || i <= 4) ? 'verde' : (i <= 8 ? 'portocaliu' : 'albastru');
        const card = document.createElement('div');
        card.className = `clasa-card ${culoareCSS}`;
        card.innerHTML = `<h3 style="margin:0; font-family:'Fredoka', sans-serif;">${numeClasa}</h3>`;
        card.onclick = () => afiseazaMateriile(numeClasa);
        gridPrincipal.appendChild(card);
    }
}

function afiseazaMateriile(numeClasa) {
    if (!gridPrincipal) return;
    gridPrincipal.innerHTML = '';
    const btnAcasa = document.getElementById('btn-acasa-nou');
    if (btnAcasa) btnAcasa.classList.remove('ascuns');
    const clasaNumar = parseInt(numeClasa.replace(/[^0-9]/g, ''), 10) || 0;

    let materii = [{ nume: 'Matematica', clasaCSS: 'albastru' }, { nume: 'Stiinte', clasaCSS: 'verde' }];
    if (clasaNumar >= 5 && clasaNumar <= 12) materii.push({ nume: 'Romana', clasaCSS: 'portocaliu' });

    materii.forEach(m => {
        const card = document.createElement('div');
        card.className = `clasa-card ${m.clasaCSS}`;
        card.innerHTML = `<h3 style="margin:0; font-family:'Fredoka', sans-serif;">${m.nume}</h3>`;
        card.onclick = () => {
            // VERIFICARE PENTRU CLASA PREGĂTITOARE (CLASA 0) ȘTIINȚE -> Deschide Căpșuna!
            if (clasaNumar === 0 && m.nume === 'Stiinte') {
                if (gridPrincipal) gridPrincipal.classList.add('ascuns');
                if (containerPlanta) containerPlanta.classList.remove('ascuns');
                schimbaStareMascota('vesel', 'Ajut-o pe căpșună să crească mare!');
                return;
            }

            // Chestionare pentru clasele primare (1-4)
            if (clasaNumar >= 0 && clasaNumar <= 4) {
                pornesteQuiz(m.nume);
                return;
            }

            // Română Gimnaziu / Liceu
            if (m.nume === 'Romana') {
                if (clasaNumar >= 9 && clasaNumar <= 12) {
                    afiseazaLecturiBac();
                } else {
                    gridPrincipal.innerHTML = '';
                    const meniuRomana = document.getElementById('sub-meniuri-romana');
                    if (meniuRomana) {
                        meniuRomana.classList.remove("ascuns");
                        meniuRomana.style.display = 'flex';
                        document.getElementById('btn-exercitii-romana').onclick = () => {
                            meniuRomana.classList.add("ascuns"); meniuRomana.style.display = 'none';
                            pornesteQuiz('Romana');
                        };
                        document.getElementById('btn-teorie-romana').onclick = () => alert(`Teorie Limba Română - Clasa a ${clasaNumar}-a`);
                    }
                }
                return;
            }

            // Matematică Gimnaziu
            if (m.nume === 'Matematica' && clasaNumar >= 5 && clasaNumar <= 11) {
                gridPrincipal.innerHTML = ''; 
                const meniuMath = document.getElementById('sub-meniuri-matematica');
                if (meniuMath) {
                    meniuMath.classList.remove("ascuns");
                    meniuMath.style.display = 'flex';
                    
                    document.getElementById('btn-ex-alg').onclick = () => { meniuMath.classList.add("ascuns"); meniuMath.style.display = 'none'; pornesteQuiz('Matematica'); };
                    document.getElementById('btn-ex-geom').onclick = () => { meniuMath.classList.add("ascuns"); meniuMath.style.display = 'none'; pornesteQuiz('Matematica'); };
                    document.getElementById('btn-teorie-alg').onclick = () => alert("Se deschide Teoria pentru Algebră.");
                    document.getElementById('btn-teorie-geom').onclick = () => alert("Se deschide Teoria pentru Geometrie.");
                }
            }
        };
        gridPrincipal.appendChild(card);
    });
}

function toggleSubMath(id) {
    const el = document.getElementById(id);
    if(el) el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
}

function afiseazaLecturiBac() {
    if (!gridPrincipal) return;
    gridPrincipal.innerHTML = '<h2 style="color:#d35400; width:100%; text-align:center; font-family:\'Fredoka\', sans-serif; margin-bottom:20px;">Locul tău pentru BAC 📖</h2>';
    const opere = ["Luceafărul", "Baltagul", "O scrisoare pierdută", "Ion", "Ultima noapte de dragoste..."];
    opere.forEach(op => {
        const div = document.createElement('div');
        div.className = "clasa-card portocaliu";
        div.innerHTML = `<h3 style="margin:0;">${op}</h3>`;
        div.onclick = () => pornesteQuiz('Romana');
        gridPrincipal.appendChild(div);
    });
}

// ==========================================
// 4. LOGICĂ INJECTARE ȘI REZOLVARE INTRREBĂRI QUIZ
// ==========================================
function pornesteQuiz(materie) {
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    if (quizContainer) quizContainer.classList.remove('ascuns');
    
    // Extragere directă din structura corectă a JSON-ului încărcat
    dateQuiz = dateProiect.materii[materie] || [];
    
    if (dateQuiz.length === 0) {
        // Fallback dinamic sigur în caz că proprietatea lipsește momentan
        dateQuiz = [
            { "intrebare": `Exercițiu demonstrativ (${materie}): Cât face 5 + 5?`, "optiuni": ["a) 8", "b) 10", "c) 12", "d) 15"], "corect": 1, "explicatie": "Răspunsul corect este 10." }
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
        if (qText) qText.innerText = "🎉 Felicitări! Ai parcurs cu succes toate activitățile din această secțiune!";
        if (optContainer) optContainer.innerHTML = "";
        
        let streak = document.getElementById('streak-num');
        if(streak) streak.innerText = parseInt(streak.innerText) + 1;
        return;
    }

    let curent = dateQuiz[indexIntrebareCurenta];
    if (qText) qText.innerText = `${indexIntrebareCurenta + 1}. ${curent.intrebare}`;
    
    if (optContainer) {
        optContainer.innerHTML = "";
        curent.optiuni.forEach((opt, idx) => {
            const btn = document.createElement('button');
            // Stilul forțat prin cod pentru a arăta ca butoane premium, perfect vizibile pe ecran
            btn.className = "btn-math-main";
            btn.style.width = "100%";
            btn.style.margin = "10px 0";
            btn.style.padding = "14px";
            btn.style.backgroundColor = "#ff8c00"; // Forțare fundal portocaliu original
            btn.style.color = "white";            // Text alb perfect lizibil
            btn.style.border = "none";
            btn.style.borderRadius = "12px";
            btn.style.fontSize = "16px";
            btn.style.fontWeight = "bold";
            btn.style.cursor = "pointer";
            btn.style.display = "block";
            
            btn.innerText = opt;
            btn.onclick = () => verificaRaspuns(idx, btn);
            optContainer.appendChild(btn);
        });
    }
}

function verificaRaspuns(ales, b) {
    let curent = dateQuiz[indexIntrebareCurenta];
    const explBox = document.getElementById('quiz-explicatie-box');
    const textExpl = document.getElementById('quiz-explicatie-text');

    if (ales === curent.corect) {
        b.style.backgroundColor = "#27ae60"; // Verde pentru succes
        alert("Răspuns corect! Excelent! 🌟");
        indexIntrebareCurenta++;
        setTimeout(incarcaIntrebare, 800);
    } else {
        b.style.backgroundColor = "#c0392b"; // Roșu pentru greșit
        if (explBox && textExpl) {
            textExpl.innerText = curent.explicatie || "Analizează din nou opțiunile, vei reuși!";
            explBox.classList.remove('ascuns');
        }
    }
}

// Interacțiune Căpșună/Plantă (Clasa 0 Științe)
function udaPlanta() {
    alert("Ai udat căpșuna! 💦");
    const stadiuText = document.getElementById('stadiu-planta-text');
    if (stadiuText) stadiuText.innerText = "Stadiu: Căpșună coaptă și fericită! 🍓";
    schimbaStareMascota('vesel', 'Super! Planta a primit apă și lumina soarelui!');
}

// ==========================================
// 5. CLASE VIRTUALE ȘI MATERIALE
// ==========================================
function afiseazaClaseProfesor() {
    const container = document.getElementById('grid-clase-profesor');
    if (!container) return;
    container.innerHTML = '';
    
    let safeClase = localStorage.getItem('eduquest_clase_virtuale');
    let clase = safeClase ? JSON.parse(safeClase).filter(c => c.profesor === utilizatorLogat) : [];
    
    if (clase.length === 0) {
        container.innerHTML = "<p style='color:#777;'>Nu aveți nicio clasă virtuală înregistrată.</p>";
        return;
    }
    
    clase.forEach(c => {
        const card = document.createElement('div');
        card.style.background = "white";
        card.style.padding = "15px";
        card.style.borderRadius = "12px";
        card.style.border = "2px solid #fdebd0";
        card.innerHTML = `<h3 style="margin:0 0 5px 0; color:#d35400;">${c.nume}</h3><p style="margin:0; font-size:13px; font-weight:bold; color:#7e4a1f;">Cod unic acces: ${c.id}</p>`;
        container.appendChild(card);
    });
}

function creeazaClasa() {
    const nume = document.getElementById('nume-clasa-noua').value.trim();
    if (!nume) { alert("Introdu numele clasei!"); return; }

    let cod = Math.random().toString(36).substring(2, 7).toUpperCase();
    let clase = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')) || [];
    
    clase.push({ id: cod, nume: nume, profesor: utilizatorLogat });
    localStorage.setItem('eduquest_clase_virtuale', JSON.stringify(clase));
    
    document.getElementById('nume-clasa-noua').value = "";
    document.getElementById('modal-creare-clasa').classList.add('ascuns');
    afiseazaClaseProfesor();
    alert(`Clasa a fost salvată! Cod partajare elevi: ${cod}`);
}

function deschideModalMaterial() {
    const select = document.getElementById('select-clasa-material');
    if (!select) return;
    select.innerHTML = "";

    let clase = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')) || [];
    let claseleMele = clase.filter(c => c.profesor === utilizatorLogat);
    
    if (claseleMele.length === 0) { alert("Adaugă mai întâi o clasă din panou!"); return; }

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

    if (!titlu || !descriere) { alert("Toate câmpurile trebuie completate!"); return; }

    let materiale = JSON.parse(localStorage.getItem('eduquest_materiale_postate')) || [];
    materiale.push({ clasaId: clasaId, titlu: titlu, descriere: descriere });
    localStorage.setItem('eduquest_materiale_postate', JSON.stringify(materiale));

    document.getElementById('titlu-material').value = "";
    document.getElementById('descriere-material').value = "";
    document.getElementById('modal-postare-material').classList.add('ascuns');
    alert("Materialul educațional a fost trimis către elevi!");
}

function alaturaClasaElev() {
    const cod = document.getElementById('cod-clasa-alaturare').value.trim().toUpperCase();
    if (!cod) { alert("Scrie codul clasei transmise de profesor!"); return; }

    let toateClasele = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')) || [];
    let clasaGasita = toateClasele.find(c => c.id === cod);

    if (!clasaGasita) { alert("Acest cod nu corespunde niciunei clase active!"); return; }

    let cheieInscrieri = `inscrieri_${utilizatorLogat}`;
    let inscrieri = JSON.parse(localStorage.getItem(cheieInscrieri)) || [];
    
    if (inscrieri.some(c => c.id === cod)) { alert("Faci deja parte din această clasă virtuală!"); return; }

    inscrieri.push(clasaGasita);
    localStorage.setItem(cheieInscrieri, JSON.stringify(inscrieri));
    
    document.getElementById('cod-clasa-alaturare').value = "";
    document.getElementById('modal-alaturare-clasa').classList.add('ascuns');
    alert(`Felicitări! Te-ai alăturat clasei: ${clasaGasita.nume}`);
    incarcaClaseVirtualeElev();
}

function incarcaClaseVirtualeElev() {
    const container = document.getElementById('grid-clase-virtuale-elev');
    if (!container) return;
    container.innerHTML = '';

    let cheieInscrieri = `inscrieri_${utilizatorLogat}`;
    let clase = JSON.parse(localStorage.getItem(cheieInscrieri)) || [];

    if (clase.length === 0) {
        container.innerHTML = "<p style='font-size:14px; color:#999; margin:5px 0;'>Nu ești conectat la nicio clasă virtuală.</p>";
        return;
    }

    clase.forEach(c => {
        const card = document.createElement('div');
        card.className = "clasa-card albastru";
        card.style.minHeight = "80px";
        card.style.cursor = "pointer";
        card.innerHTML = `<h3 style="margin:0; font-family:'Fredoka', sans-serif;">${c.nume}</h3><p style="font-size:12px; margin:5px 0 0 0;">Profesor: ${c.profesor}</p>`;
        card.onclick = () => deschideClasaElev(c.id, c.nume);
        container.appendChild(card);
    });
}

function deschideClasaElev(clasaId, numeClasa) {
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    const containerMateriale = document.getElementById('vizualizare-clasa-elev');
    if (containerMateriale) containerMateriale.classList.remove('ascuns');
    
    document.getElementById('titlu-clasa-activa').innerText = `Materiale distribuite: ${numeClasa}`;
    
    const btnAcasa = document.getElementById('btn-acasa-nou'); 
    if(btnAcasa) btnAcasa.classList.remove('ascuns');
    
    const lista = document.getElementById('lista-materiale-elev'); 
    if (!lista) return;
    lista.innerHTML = '';
    
    let materiale = (JSON.parse(localStorage.getItem('eduquest_materiale_postate')) || []).filter(m => m.clasaId === clasaId);
    
    if (materiale.length === 0) {
        lista.innerHTML = "<p style='color:#777; padding:10px;'>Nu au fost încărcate resurse pe acest flux de către profesor.</p>"; 
        return;
    }
    
    materiale.forEach(m => {
        const div = document.createElement('div');
        div.style.background = "#fffaf0";
        div.style.padding = "15px";
        div.style.borderRadius = "10px";
        div.style.marginBottom = "10px";
        div.style.borderLeft = "4px solid #ff8c00";
        div.innerHTML = `<h4 style="margin:0 0 5px 0; color:#d35400;">📌 ${m.titlu}</h4><p style="white-space:pre-wrap; margin:0; font-size:14px;">${m.descriere}</p>`;
        lista.appendChild(div);
    });
}
