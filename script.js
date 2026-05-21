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

// ÎNCĂRCARE DATE DIN JSON
async function incarcaDate() {
    try {
        const raspuns = await fetch('materii.json');
        dateProiect = await raspuns.json();
    } catch (err) {
        console.error("Eroare la încărcarea fișierului JSON:", err);
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
                if (m.nume === 'Matematica') pornesteQuiz('clasa_1_4_matematica');
                else if (m.nume === 'Stiinte') pornesteQuiz('clasa_1_4_stiinte');
                return;
            }
            if (m.nume === 'Romana' && clasaNumar >= 9 && clasaNumar <= 12) { afiseazaLecturiBac(); return; }
            if (m.nume === 'Romana' && clasaNumar >= 5 && clasaNumar <= 8) {
                gridPrincipal.innerHTML = '';
                const meniuRomana = document.getElementById('sub-meniuri-romana');
                if (meniuRomana) {
                    const btnTeorie = document.getElementById('btn-teorie-romana');
                    const btnExercitii = document.getElementById('btn-exercitii-romana');
                    if (btnTeorie) btnTeorie.onclick = () => window.open(`Teorie_Romana_Clasa_${clasaNumar}.pdf`, '_blank');
                    if (btnExercitii) btnExercitii.onclick = () => {
                        meniuRomana.classList.add("ascuns"); meniuRomana.style.display = 'none';
                        pornesteQuiz(`clasa_${clasaNumar}_romana_exercitii`);
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
                        meniuMath.classList.add("ascuns"); meniuMath.style.display = 'none'; pornesteQuiz(`clasa_${clasaNumar}_algebra_exercitii`);
                    };
                    if (btnExercitiiGeometrie) btnExercitiiGeometrie.onclick = () => {
                        meniuMath.classList.add("ascuns"); meniuMath.style.display = 'none';
                        pornesteQuiz(`clasa_${clasaNumar}_${clasaNumar === 11 ? 'analiza' : 'geometrie'}_exercitii`);
                    };
                    if (btnTeorieAlgebra) btnTeorieAlgebra.onclick = () => window.open((clasaNumar >= 9) ? `Teorie_Algebra_Clasa_${clasaNumar}_Portocaliu.pdf` : `Teorie_Algebra_Clasa_${clasaNumar}.pdf`, '_blank');
                    
                    if (clasaNumar === 11) {
                        if (btnMainB) btnMainB.innerText = "Analiză Matematică";
                        if (btnTeorieGeometrie) btnTeorieGeometrie.onclick = () => window.open("Teorie_Analiza_Matematica_Clasa_11.pdf", '_blank');
                    } else {
                        if (clasaNumar === 9) { if (btnMainB) btnMainB.innerText = "Geometrie Vectorială"; }
                        else if (clasaNumar === 10) { if (btnMainB) btnMainB.innerText = "Geometrie Analitică"; }
                        else { if (btnMainB) btnMainB.innerText = "Geometrie"; }
                        if (btnTeorieGeometrie) btnTeorieGeometrie.onclick = () => {
                            let f = clasaNumar === 5 ? "Teorie_Geometrie_Clasa_5_Portocaliu.pdf" : (clasaNumar === 9 ? "Teorie_Geometrie_Vectoriala_Clasa_9.pdf" : (clasaNumar === 10 ? "Teorie_Geometrie_Analitica_Clasa_10.pdf" : `Teorie_Geometrie_Clasa_${clasaNumar}.pdf`));
                            window.open(f, '_blank');
                        };
                    }
                    meniuMath.classList.remove("ascuns"); meniuMath.style.display = 'flex';
                }
            } else if (numeClasa === 'Clasa 0' && m.nume === 'Stiinte') {
                if (gridPrincipal) gridPrincipal.classList.add('ascuns'); 
                if (containerPlanta) containerPlanta.classList.remove('ascuns');
                schimbaStareMascota('vesel', 'Uită-te la plantă! Poți numi părțile ei?');
            } else { 
                pornesteQuiz(m.nume); 
            }
        };
        gridPrincipal.appendChild(card);
    });
}

function afiseazaLecturiBac() {
    if (!gridPrincipal) return;
    gridPrincipal.innerHTML = `
        <div class="card-selectie" style="max-width: 650px; text-align: left; margin: 30px auto; padding: 25px; background: #fffaf5; border: 2px solid #f5d6b8; border-radius: 12px;">
            <h2 style="color: #d35400; text-align: center; margin-top: 0;">📚 Opere Canonice Obligatorii pentru BAC</h2>
            <ul style="list-style-type: none; padding-left: 0; line-height: 1.8;">
                <li>🔸 <strong>Povestea lui Harap-Alb</strong> – Ion Creangă</li>
                <li>🔸 <strong>Moara cu noroc</strong> – Ioan Slavici</li>
                <li>🔸 <strong>Luceafărul</strong> – Mihai Eminescu</li>
                <li>🔸 <strong>O scrisoare pierdută</strong> – I.L. Caragiale</li>
                <li>🔸 <strong>Ion</strong> – Liviu Rebreanu</li>
                <li>🔸 <strong>Enigma Otiliei</strong> – George Călinescu</li>
                <li>🔸 <strong>Baltagul</strong> – Mihail Sadoveanu</li>
            </ul>
            <button class="btn-acasa" onclick="resetInterfata()" style="margin-top: 20px; width: 100%;">Înapoi la clase</button>
        </div>`;
}

// ==========================================
// 4. LOGICĂ SISTEM QUIZ
// ==========================================
function pornesteQuiz(materie) {
    if (gridPrincipal) gridPrincipal.classList.add('ascuns'); 
    if (quizContainer) quizContainer.classList.remove('ascuns');
    indexIntrebareCurenta = 0; 
    dateQuiz = dateProiect.materii[materie] || [];
    if (dateQuiz.length > 0) afiseazaIntrebare();
    else { 
        const txt = document.getElementById('intrebare-text');
        const opt = document.getElementById('optiuni');
        if (txt) txt.innerText = "Nu avem întrebări momentan."; 
        if (opt) opt.innerHTML = ''; 
    }
}

function afiseazaIntrebare() {
    const data = dateQuiz[indexIntrebareCurenta]; 
    const txt = document.getElementById('intrebare-text');
    if (txt) txt.innerText = data.intrebare; 
    
    const containerOptiuni = document.getElementById('optiuni'); 
    if (!containerOptiuni) return;
    containerOptiuni.innerHTML = ''; 
    
    if(document.getElementById('quiz-progres')) document.getElementById('quiz-progres').innerText = `${indexIntrebareCurenta + 1} / ${dateQuiz.length}`;
    if(document.getElementById('btn-prev')) document.getElementById('btn-prev').disabled = (indexIntrebareCurenta === 0);
    if(document.getElementById('btn-next')) document.getElementById('btn-next').disabled = true;

    if (data.optiuni) {
        data.optiuni.forEach((varianta, index) => {
            const buton = document.createElement('button');
            buton.className = "btn-optiune-quiz"; buton.innerText = varianta;
            buton.onclick = () => verificareRaspuns(index === data.corect, data.explicatie); 
            containerOptiuni.appendChild(buton);
        });
    } else if (data.tip === "input") {
        containerOptiuni.innerHTML = `<div class="input-container"><input type="text" id="raspuns-utilizator" placeholder="Scrie rezultatul..."><button id="btn-verifica" onclick="verificaRaspunsInput()">Trimite</button></div>`;
    }
}
function verificaRaspunsInput() { 
    const rUtilizator = document.getElementById('raspuns-utilizator');
    const val = rUtilizator ? rUtilizator.value.trim() : "";
    verificareRaspuns(val === dateQuiz[indexIntrebareCurenta].raspuns_corect, dateQuiz[indexIntrebareCurenta].explicatie); 
}

function verificareRaspuns(isCorect, explicatie) {
    if (isCorect) {
        schimbaStareMascota('vesel', "Bravo! " + explicatie);
        document.querySelectorAll('#optiuni button, #optiuni input').forEach(el => el.disabled = true);
        if(document.getElementById('btn-next')) document.getElementById('btn-next').disabled = false;
    } else { 
        schimbaStareMascota('trist', "Mai încearcă! Uită-te cu atenție."); 
    }
}
function urmatoareaIntrebare() {
    indexIntrebareCurenta++;
    if (indexIntrebareCurenta < dateQuiz.length) afiseazaIntrebare();
    else {
        const txt = document.getElementById('intrebare-text');
        const opt = document.getElementById('optiuni');
        if (txt) txt.innerText = "Felicitări! Ai terminat toate întrebările! 🎉";
        if (opt) opt.innerHTML = '<button class="btn-acasa" onclick="resetInterfata()">Înapoi la meniu</button>';
    }
}
function intrebarePrecedenta() { if (indexIntrebareCurenta > 0) { indexIntrebareCurenta--; afiseazaIntrebare(); } }

function schimbaStareMascota(stare, mesaj = "Să învățăm împreună!") {
    if (!catImg) return;
    catImg.src = stare === 'vesel' ? 'pisiuc_vesel.png' : (stare === 'trist' ? 'pisiuc_trist.png' : 'pisiuc_neutru.png');
    if(bulaText) { bulaText.innerText = mesaj; bulaText.classList.remove('ascuns'); }
    setTimeout(() => { if(bulaText) bulaText.classList.add('ascuns'); if(catImg) catImg.src = 'pisiuc_neutru.png'; }, 5000); 
}

function resetInterfata() {
    if (quizContainer) quizContainer.classList.add('ascuns'); 
    if (containerPlanta) containerPlanta.classList.add('ascuns');
    
    const viewClasaElev = document.getElementById('vizualizare-clasa-elev');
    if (viewClasaElev) viewClasaElev.classList.add('ascuns');
    
    const dashProf = document.getElementById('dashboard-profesor');
    if (rolLogat === 'profesor') {
        if (gridPrincipal) gridPrincipal.classList.add('ascuns');
        if (dashProf) dashProf.classList.remove('ascuns');
    } else {
        if (dashProf) dashProf.classList.add('ascuns');
        if (gridPrincipal) gridPrincipal.classList.remove('ascuns');
        afiseazaSelectieClase();
    }
    const btnAcasa = document.getElementById('btn-acasa-nou'); if(btnAcasa) btnAcasa.classList.add('ascuns');
    ['sub-meniuri-matematica', 'sub-meniuri-romana'].forEach(id => {
        let el = document.getElementById(id); if (el) { el.classList.add("ascuns"); el.style.display = 'none'; }
    });
    schimbaStareMascota('neutru');
}

// ==========================================
// 5. DRAG AND DROP / MENIURI INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".draggable").forEach(d => {
        d.addEventListener("dragstart", e => { e.dataTransfer.setData("text/plain", d.dataset.part); d.classList.add("dragging"); });
        d.addEventListener("dragend", () => d.classList.remove("dragging"));
    });
    document.querySelectorAll(".drop-zone").forEach(z => {
        z.addEventListener("dragover", e => { e.preventDefault(); z.classList.add("hovered"); });
        z.addEventListener("dragleave", () => z.classList.remove("hovered"));
        z.addEventListener("drop", e => {
            e.preventDefault(); z.classList.remove("hovered");
            if (e.dataTransfer.getData("text/plain") === z.dataset.accept) {
                let orig = document.querySelector(`.draggable[data-part="${z.dataset.accept}"]`);
                if (orig) {
                    z.innerText = orig.innerText; z.classList.add("corect"); orig.style.visibility = "hidden";
                    schimbaStareMascota('vesel', `Corect: ${orig.innerText}! ✨`);
                }
            } else { schimbaStareMascota('trist', "Mai încearcă."); }
        });
    });
});

function toggleSubMath(id) { ['sub-algebra', 'sub-geometrie'].forEach(i => { let el=document.getElementById(i); if(el) el.style.display='none'; }); if(document.getElementById(id)) document.getElementById(id).style.display = 'flex'; }

// ==========================================
// 6. SISTEMUL DE MANAGEMENT PENTRU PROFESORI ȘI ELEVI
// ==========================================

// --- PROFESOR ---
function genereazaCodClasa() { return Math.random().toString(36).substring(2, 7).toUpperCase(); }

function creeazaClasa() {
    const numeClasa = document.getElementById('nume-clasa-noua').value.trim();
    if (!numeClasa) { alert("Introdu un nume pentru clasă!"); return; }
    let safeClase = localStorage.getItem('eduquest_clase_virtuale');
    let clase = safeClase ? JSON.parse(safeClase) : [];
    let nouaClasa = { id: genereazaCodClasa(), nume: numeClasa, profesor: utilizatorLogat, elevi: [] };
    clase.push(nouaClasa);
    localStorage.setItem('eduquest_clase_virtuale', JSON.stringify(clase));
    document.getElementById('modal-creare-clasa').classList.add('ascuns');
    document.getElementById('nume-clasa-noua').value = '';
    alert(`Clasa a fost creată! Codul pentru elevi este: ${nouaClasa.id}`);
    afiseazaClaseProfesor();
}

function afiseazaClaseProfesor() {
    const container = document.getElementById('grid-clase-profesor'); 
    if (!container) return;
    container.innerHTML = '';
    let safeClase = localStorage.getItem('eduquest_clase_virtuale');
    let clase = safeClase ? JSON.parse(safeClase).filter(c => c.profesor === utilizatorLogat) : [];
    if(clase.length === 0) { container.innerHTML = "<p>Nu ai creat nicio clasă încă.</p>"; return; }
    
    clase.forEach(c => {
        let eleviCount = c.elevi ? c.elevi.length : 0;
        let card = document.createElement('div');
        card.className = "clasa-card verde";
        card.innerHTML = `<h3>${c.nume}</h3><p>Cod: <span class="cod-badge">${c.id}</span></p><p style="font-size:12px; margin-top:5px;">${eleviCount} elevi înscriși</p>`;
        container.appendChild(card);
    });
}

function deschideModalMaterial() {
    let safeClase = localStorage.getItem('eduquest_clase_virtuale');
    let clase = safeClase ? JSON.parse(safeClase).filter(c => c.profesor === utilizatorLogat) : [];
    if(clase.length === 0) { alert("Trebuie să creezi o clasă mai întâi!"); return; }
    const select = document.getElementById('select-clasa-material'); 
    if (!select) return;
    select.innerHTML = '';
    clase.forEach(c => { select.innerHTML += `<option value="${c.id}">${c.nume}</option>`; });
    document.getElementById('modal-postare-material').classList.remove('ascuns');
}

function posteazaMaterial() {
    const clasaId = document.getElementById('select-clasa-material').value;
    const titlu = document.getElementById('titlu-material').value.trim();
    const descriere = document.getElementById('descriere-material').value.trim();
    if(!titlu || !descriere) { alert("Completează titlul și descrierea!"); return; }
    
    let safeMat = localStorage.getItem('eduquest_materiale_postate');
    let materiale = safeMat ? JSON.parse(safeMat) : [];
    materiale.push({ clasaId: clasaId, titlu: titlu, descriere: descriere, data: new Date().toLocaleDateString() });
    localStorage.setItem('eduquest_materiale_postate', JSON.stringify(materiale));
    
    document.getElementById('modal-postare-material').classList.add('ascuns');
    document.getElementById('titlu-material').value = ''; document.getElementById('descriere-material').value = '';
    alert("Materialul a fost postat cu succes!");
}

// --- ELEV ---
function alaturaClasaElev() {
    const cod = document.getElementById('cod-clasa-alaturare').value.trim().toUpperCase();
    if(!cod) { alert("Introdu codul clasei!"); return; }
    let safeClase = localStorage.getItem('eduquest_clase_virtuale');
    let clase = safeClase ? JSON.parse(safeClase) : [];
    let clasaGasita = clase.find(c => c.id === cod);
    if (!clasaGasita) { alert("Nu există nicio clasă cu acest cod!"); return; }
    if (!clasaGasita.elevi) clasaGasita.elevi = [];
    if (clasaGasita.elevi.includes(utilizatorLogat)) { alert("Ești deja înscris în această clasă!"); return; }
    
    clasaGasita.elevi.push(utilizatorLogat);
    localStorage.setItem('eduquest_clase_virtuale', JSON.stringify(clase));
    document.getElementById('modal-alaturare-clasa').classList.add('ascuns');
    document.getElementById('cod-clasa-alaturare').value = '';
    alert(`Te-ai alăturat clasei: ${clasaGasita.nume}!`);
    afiseazaSelectieClase(); 
}

function incarcaClaseVirtualeElev() {
    const container = document.getElementById('grid-clase-virtuale-elev');
    if (!container) return;
    container.innerHTML = '';
    let safeClase = localStorage.getItem('eduquest_clase_virtuale');
    let clase = safeClase ? JSON.parse(safeClase).filter(c => c.elevi && c.elevi.includes(utilizatorLogat)) : [];
    
    if (clase.length === 0) {
        container.innerHTML = "<p style='color:#7e4a1f; font-style:italic;'>Nu ești înscris în nicio clasă virtuală încă.</p>";
        return;
    }
    clase.forEach(c => {
        let card = document.createElement('div');
        card.className = "clasa-card albastru"; card.style.minHeight = "80px";
        card.innerHTML = `<h3>${c.nume}</h3><p style="font-size:12px;">Profesor: ${c.profesor}</p>`;
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
        lista.innerHTML = "<p>Profesorul nu a postat încă niciun material.</p>"; return;
    }
    
    materiale.reverse().forEach(m => { 
        lista.innerHTML += `
            <div class="card-material">
                <h3>${m.titlu}</h3>
                <p>${m.descriere}</p>
                <span class="data-postare">Postat pe: ${m.data}</span>
            </div>
        `;
    });
}
