// ELEMENTE GLOBALE
const catImg = document.getElementById('cat-img');
const bulaText = document.getElementById('bula-text');
const gridPrincipal = document.getElementById('grid-principal');
const quizContainer = document.getElementById('quiz-container');
const containerPlanta = document.getElementById('exercitiu-vizual-container');

let indexIntrebareCurenta = 0;
let dateQuiz = [];
let dateProiect = { materii: { Matematica: [], Stiinte: [] } };

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

// NAVIGARE
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
    
    const clase = [
        { nume: 'Clasa 0', clasaCSS: 'verde', desc: 'Exploratori' },
        { nume: 'Clasa a 5-a', clasaCSS: 'portocaliu', desc: 'Gimnaziu' },
        { nume: 'Clasa a 6-a', clasaCSS: 'rosu', desc: 'Gimnaziu' },
        { nume: 'Clasa a 12-a', clasaCSS: 'albastru', desc: 'Liceu' }
    ];

    gridPrincipal.innerHTML = '';
    clase.forEach(c => {
        const card = document.createElement('div');
        card.className = `clasa-card ${c.clasaCSS}`;
        card.innerHTML = `<h3>${c.nume}</h3><p>${c.desc}</p>`;
        card.onclick = () => afiseazaMateriile(c.nume);
        gridPrincipal.appendChild(card);
    });
}

function afiseazaMateriile(numeClasa) {
    gridPrincipal.innerHTML = '';
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

// LOGICĂ QUIZ
function pornesteQuiz(materie) {
    gridPrincipal.classList.add('ascuns');
    quizContainer.classList.remove('ascuns');
    
    indexIntrebareCurenta = 0;
    // Accesăm direct categoria din obiectul "materii"
    dateQuiz = dateProiect.materii[materie] || [];
    
    if (dateQuiz.length > 0) {
        afiseazaIntrebare();
    } else {
        document.getElementById('intrebare-text').innerText = "Ups! Nu am găsit întrebări pentru " + materie;
        document.getElementById('optiuni').innerHTML = '';
    }
}

function afiseazaIntrebare() {
    const data = dateQuiz[indexIntrebareCurenta]; 
    const containerText = document.getElementById('intrebare-text');
    const containerOptiuni = document.getElementById('optiuni');
    
    containerText.innerText = data.intrebare; 
    containerOptiuni.innerHTML = ''; 

    // Verificăm tipul de întrebare (Grilă sau Input)
    if (data.optiuni) {
        data.optiuni.forEach((varianta, index) => {
            const buton = document.createElement('button');
            buton.innerText = varianta;
            buton.onclick = () => verificareRaspuns(index === data.corect, data.explicatie); 
            containerOptiuni.appendChild(buton);
        });
    } else if (data.tip === "input") {
        const inputDiv = document.createElement('div');
        inputDiv.className = "input-container";
        inputDiv.innerHTML = `
            <input type="text" id="raspuns-utilizator" placeholder="Scrie rezultatul...">
            <button id="btn-verifica">Trimite</button>
        `;
        containerOptiuni.appendChild(inputDiv);

        document.getElementById('btn-verifica').onclick = () => {
            const valoare = document.getElementById('raspuns-utilizator').value.trim();
            verificareRaspuns(valoare === data.raspuns_corect, data.explicatie);
        };
    }
}

function verificareRaspuns(isCorect, explicatie) {
    if (isCorect) {
        schimbaStareMascota('vesel', "Bravo! " + explicatie);
        setTimeout(() => {
            indexIntrebareCurenta++;
            if (indexIntrebareCurenta < dateQuiz.length) {
                afiseazaIntrebare();
            } else {
                document.getElementById('intrebare-text').innerText = "Ai terminat toate întrebările!";
                document.getElementById('optiuni').innerHTML = '<button onclick="resetInterfata()">Înapoi la meniu</button>';
            }
        }, 3500);
    } else {
        schimbaStareMascota('trist', "Mai încearcă! Uită-te cu atenție.");
    }
}

// PISIUC
function schimbaStareMascota(stare, mesaj = "Să învățăm împreună!") {
    if (stare === 'vesel') catImg.src = 'pisiuc_vesel.png';
    else if (stare === 'trist') catImg.src = 'pisiuc_trist.png';
    else catImg.src = 'pisiuc_neutru.png';

    if(bulaText) {
        bulaText.innerText = mesaj;
        bulaText.classList.remove('ascuns');
    }

    setTimeout(() => {
        if(bulaText) bulaText.classList.add('ascuns');
        catImg.src = 'pisiuc_neutru.png';
    }, 4000); 
}

// RESETARE
function resetInterfata() {
    quizContainer.classList.add('ascuns');
    if(containerPlanta) containerPlanta.classList.add('ascuns');
    gridPrincipal.classList.remove('ascuns');
    if(bulaText) bulaText.classList.add('ascuns');
    schimbaStareMascota('neutru');
    afiseazaSelectieClase();
}