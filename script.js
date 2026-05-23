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

// Funcție de siguranță pentru mascotă (previne erorile dacă elementele lipsesc)
function schimbaStareMascota(stare, text) {
    console.log(`Mascota starea ${stare}: ${text}`);
    if (bulaText) bulaText.innerText = text;
}

// Inițializare Bază de Date Locală securizată (Pentru Clase Virtuale)
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
    } catch (err) {
        console.error("Eroare la încărcarea fișierului JSON. Activare fallback local:", err);
        // Fallback în caz că rulează local fără server web
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
// 3. NAVIGARE PRINCIPALĂ & CLASE
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

    // INJECTARE SECȚIUNE CLASE VIRTUALE ELEV
    const divVirtual = document.createElement('div');
    divVirtual.style.width = "100%";
    divVirtual.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; width:100%;">
            <h2 style="color:#d35400; margin:0;">📚 Clasele Mele (Virtuale)</h2>
            <button class="btn-math-sub" style="margin:0; font-size:14px;" onclick="document.getElementById('modal-alaturare-clasa').classList.remove('ascuns')">+ Alătură-te</button>
        </div>
        <div id="grid-clase-virtuale-elev" style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:30px; width:100%;"></div>
        <hr style="width:100%; border: 1px solid #fdebd0; margin-bottom:30px;">
    `;
    gridPrincipal.appendChild(divVirtual);
    incarcaClaseVirtualeElev();

    // RĂMÂNE LOGICA PENTRU CLASELE 0-12
    for (let i = 0; i <= 12; i++) {
        let numeClasa = i === 0 ? 'Clasa 0' : `Clasa a ${i}-a`;
        let culoareCSS = (i === 0 || i <= 4) ? 'verde' : (i <= 8 ? 'portocaliu' : 'albastru');
        const card = document.createElement('div');
        card.className = `clasa-card ${culoareCSS}`;
        card.innerHTML = `<h3>${numeClasa}</h3>`;
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
        card.innerHTML = `<h3>${m.nume}</h3>`;
        card.onclick = () => {
            if (clasaNumar >= 1 && clasaNumar <= 4) {
                if (m.nume === 'Matematica') pornesteQuiz('Matematica');
                else if (m.nume === 'Stiinte') pornesteQuiz('Stiinte');
                return;
            }
            if (m.nume === 'Romana' && clasaNumar >= 9 && clasaNumar <= 12) { afiseazaLecturiBac(); return; }
            if (m.nume === 'Romana' && clasaNumar >= 5 && clasaNumar <= 8) {
                gridPrincipal.innerHTML = '';
                const meniuRomana = document.getElementById('sub-meniuri-romana');
                if (meniuRomana) {
                    const btnTeorie = document.getElementById('btn-teorie-romana');
                    const btnExercitii = document.getElementById('btn-exercitii-romana');
                    if (btnTeorie) btnTeorie.onclick = () => alert(`Se deschide Teorie Română Clasa ${clasaNumar}`);
                    if (btnExercitii) btnExercitii.onclick = () => {
                        meniuRomana.classList.add("ascuns"); meniuRomana.style.display = 'none';
                        pornesteQuiz(`Romana`);
                    };
                    meniuRomana.classList.remove("ascuns"); meniuRomana.style.display = 'flex';
                }
                return;
            }
            if (m.nume === 'Matematica' && clasaNumar >= 5 && clasaNumar <= 11) {
                gridPrincipal.innerHTML = ''; 
                const meniuMath = document.getElementById('sub-meniuri-matematica');
                if (meniuMath) {
                    const btnMainB = meniuMath.querySelector('.math-section-container:nth-child(2) .btn-math-main');
                    const btnTeorieAlgebra = document.getElementById('btn-teorie-alg');
                    const btnTeorieGeometrie = document.getElementById('btn-teorie-geom');
                    const btnExercitiiAlgebra = document.getElementById('btn-ex-alg');
                    const btnExercitiiGeometrie = document.getElementById('btn-ex-geom');

                    if (btnExercitiiAlgebra) btnExercitiiAlgebra.onclick = () => {
                        meniuMath.classList.add("ascuns"); meniuMath.style.display = 'none'; pornesteQuiz(`Matematica`);
                    };
                    if (btnExercitiiGeometrie) btnExercitiiGeometrie.onclick = () => {
                        meniuMath.classList.add("ascuns"); meniuMath.style.display = 'none'; pornesteQuiz(`Matematica`);
                    };
                    if (btnTeorieAlgebra) btnTeorieAlgebra.onclick = () => alert(`Se deschide Teorie Algebră Clasa ${clasaNumar}`);
                    
                    if (clasaNumar === 11) {
                        if (btnMainB) btnMainB.innerText = "Analiză Matematică";
                        if (btnTeorieGeometrie) btnTeorieGeometrie.onclick = () => alert("Se deschide Teorie Analiză Matematică");
                    } else {
                        if (btnMainB) btnMainB.innerText = clasaNumar === 9 ? "Geometrie Vectorială" : (clasaNumar === 10 ? "Geometrie Analitică" : "Geometrie");
                        if (btnTeorieGeometrie) btnTeorieGeometrie.onclick = () => alert(`Se deschide Teorie Geometrie Clasa ${clasaNumar}`);
                    }
                    meniuMath.classList.remove("ascuns"); meniuMath.style.display = 'flex';
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
    gridPrincipal.innerHTML = '<h2 style="color:#d35400; width:100%; text-align:center;">📖 Lecturi Obligatorii BAC</h2>';
    const opere = ["Luceafărul", "Baltagul", "O scrisoare pierdută", "Ion", "Ultima noapte de dragoste..."];
    opere.forEach(op => {
        const div = document.createElement('div');
        div.className = "clasa-card portocaliu";
        div.innerHTML = `<h3>${op}</h3>`;
        div.onclick = () => pornesteQuiz('Romana');
        gridPrincipal.appendChild(div);
    });
}

// ==========================================
// 4. LOGICĂ QUIZ (PENTRU TOATE MATERIILE)
// ==========================================
function pornesteQuiz(materie) {
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    if (quizContainer) quizContainer.classList.remove('ascuns');
    
    // Luăm întrebările din fișierul JSON în funcție de cheia materiei
    dateQuiz = dateProiect.materii[materie] || [
        { "intrebare": "Exemplu de siguranță: Cât face 5 + 5?", "optiuni": ["a) 8", "b) 10", "c) 12", "d) 15"], "corect": 1, "explicatie": "5 + 5 = 10." }
    ];
    indexIntrebareCurenta = 0;
    incarcaIntrebare();
}

function incarcaIntrebare() {
    const qText = document.getElementById('quiz-intrebare-text');
    const optContainer = document.getElementById('quiz-optiuni-container');
    const explBox = document.getElementById('quiz-explicatie-box');
    if (explBox) explBox.classList.add('ascuns');

    if (indexIntrebareCurenta >= dateQuiz.length) {
        if (qText) qText.innerText = "🎉 Felicitări! Ai terminat acest set de exerciții!";
        if (optContainer) optContainer.innerHTML = "";
        // Creștem streak-ul ca bonus
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
            btn.className = "btn-math-main";
            btn.style.margin = "10px 0";
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
        b.style.backgroundColor = "#27ae60";
        alert("Corect! 🌟");
        indexIntrebareCurenta++;
        setTimeout(incarcaIntrebare, 1000);
    } else {
        b.style.backgroundColor = "#c0392b";
        if (explBox && textExpl) {
            textExpl.innerText = curent.explicatie || "Mai încearcă, sigur vei reuși!";
            explBox.classList.remove('ascuns');
        }
    }
}

// ==========================================
// 5. GESTIONARE CLASE VIRTUALE (PROFESOR & ELEV)
// ==========================================
function afiseazaClaseProfesor() {
    const container = document.getElementById('grid-clase-profesor');
    if (!container) return;
    container.innerHTML = '';
    
    let clase = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')) || [];
    let claseleMele = clase.filter(c => c.profesor === utilizatorLogat);
    
    if (claseleMele.length === 0) {
        container.innerHTML = "<p style='color:#777;'>Nu ai nicio clasă creată încă.</p>";
        return;
    }
    
    claseleMele.forEach(c => {
        const card = document.createElement('div');
        card.style.background = "white";
        card.style.padding = "15px";
        card.style.borderRadius = "12px";
        card.style.border = "2px solid #fdebd0";
        card.innerHTML = `<h3>${c.nume}</h3><p style="font-size:13px; color:#7e4a1f;"><b>Cod: ${c.id}</b></p>`;
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
    alert(`Clasa a fost creată! Oferă-le elevilor codul: ${cod}`);
}

function deschideModalMaterial() {
    const select = document.getElementById('select-clasa-material');
    if (!select) return;
    select.innerHTML = "";

    let clase = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')) || [];
    let claseleMele = clase.filter(c => c.profesor === utilizatorLogat);
    
    if (claseleMele.length === 0) { alert("Creează o clasă mai întâi!"); return; }

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

    if (!titlu || !descriere) { alert("Completează toate câmpurile!"); return; }

    let materiale = JSON.parse(localStorage.getItem('eduquest_materiale_postate')) || [];
    materiale.push({ clasaId: clasaId, titlu: titlu, descriere: descriere });
    localStorage.setItem('eduquest_materiale_postate', JSON.stringify(materiale));

    document.getElementById('titlu-material').value = "";
    document.getElementById('descriere-material').value = "";
    document.getElementById('modal-postare-material').classList.add('ascuns');
    alert("Materialul a fost distribuit cu succes!");
}

function alaturaClasaElev() {
    const cod = document.getElementById('cod-clasa-alaturare').value.trim().toUpperCase();
    if (!cod) { alert("Introdu codul clasei!"); return; }

    let toateClasele = JSON.parse(localStorage.getItem('eduquest_clase_virtuale')) || [];
    let clasaGasita = toateClasele.find(c => c.id === cod);

    if (!clasaGasita) { alert("Codul este greșit sau inexistent!"); return; }

    let cheieInscrieri = `inscrieri_${utilizatorLogat}`;
    let inscrieri = JSON.parse(localStorage.getItem(cheieInscrieri)) || [];
    
    if (inscrieri.some(c => c.id === cod)) { alert("Ești deja înscris în această clasă!"); return; }

    inscrieri.push(clasaGasita);
    localStorage.setItem(cheieInscrieri, JSON.stringify(inscrieri));
    
    document.getElementById('cod-clasa-alaturare').value = "";
    document.getElementById('modal-alaturare-clasa').classList.add('ascuns');
    alert(`Te-ai alăturat cu succes clasei: ${clasaGasita.nume}`);
    incarcaClaseVirtualeElev();
}

function incarcaClaseVirtualeElev() {
    const container = document.getElementById('grid-clase-virtuale-elev');
    if (!container) return;
    container.innerHTML = '';

    let cheieInscrieri = `inscrieri_${utilizatorLogat}`;
    let clase = JSON.parse(localStorage.getItem(cheieInscrieri)) || [];

    if (clase.length === 0) {
        container.innerHTML = "<p style='font-size:14px; color:#999; margin:10px 0;'>Nu ești înscris în nicio clasă virtuală. Folosește butonul de mai sus!</p>";
        return;
    }

    clase.forEach(c => {
        const card = document.createElement('div');
        card.className = "clasa-card albastru";
        card.style.minHeight = "80px";
        card.innerHTML = `<h3>${c.nume}</h3><p style="font-size:12px; margin:0;">Profesor: ${c.profesor}</p>`;
        card.onclick = () => deschideClasaElev(c.id, c.nume);
        container.appendChild(card);
    });
}

function deschideClasaElev(clasaId, numeClasa) {
    if (gridPrincipal) gridPrincipal.classList.add('ascuns');
    const containerMateriale = document.getElementById('vizualizare-clasa-elev');
    if (containerMateriale) containerMateriale.classList.remove('ascuns');
    
    const tClasa = document.getElementById('titlu-clasa-activa');
    if (tClasa) tClasa.innerText = `Materiale: ${numeClasa}`;
    
    const btnAcasa = document.getElementById('btn-acasa-nou'); 
    if(btnAcasa) btnAcasa.classList.remove('ascuns');
    
    const lista = document.getElementById('lista-materiale-elev'); 
    if (!lista) return;
    lista.innerHTML = '';
    
    let safeMat = localStorage.getItem('eduquest_materiale_postate');
    let materiale = safeMat ? JSON.parse(safeMat).filter(m => m.clasaId === clasaId) : [];
    
    if (materiale.length === 0) {
        lista.innerHTML = "<p style='color:#777; padding: 10px;'>Profesorul nu a postat încă niciun material în această clasă virtuală.</p>"; 
        return;
    }
    
    materiale.forEach(m => {
        const div = document.createElement('div');
        div.style.background = "#fffaf0";
        div.style.padding = "15px";
        div.style.borderRadius = "10px";
        div.style.marginBottom = "10px";
        div.style.borderLeft = "4px solid #ff8c00";
        div.innerHTML = `<h4>📌 ${m.titlu}</h4><p style="white-space:pre-wrap; margin:5px 0 0 0; font-size:14px;">${m.descriere}</p>`;
        lista.appendChild(div);
    });
}
