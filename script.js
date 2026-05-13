// 1. SELECTARE ELEMENTE GLOBALE
const catImg = document.getElementById('cat-img');
const bulaText = document.getElementById('bula-text');
const gridPrincipal = document.getElementById('grid-principal');
const quizContainer = document.getElementById('quiz-container');
const containerPlanta = document.getElementById('exercitiu-vizual-container');

// 2. NAVIGARE (LOGIN -> ROL -> INTERFAȚĂ)
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

// 3. GENERARE CARDURI CLASE (Inspirat din 4307.jpg)
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

// 4. GENERARE MATERII
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
            gridPrincipal.classList.add('ascuns');
            if (numeClasa === 'Clasa 0' && m.nume === 'Stiinte') {
                containerPlanta.classList.remove('ascuns');
                schimbaStareMascota('vesel', 'Uită-te la plantă! Poți numi părțile ei?');
            } else {
                quizContainer.classList.remove('ascuns');
                afiseazaIntrebarea();
            }
        };
        gridPrincipal.appendChild(card);
    });
}

// 5. LOGICĂ QUIZ (MATE)
async function afiseazaIntrebarea() {
    try {
        const raspuns = await fetch('materii.json');
        const date = await raspuns.json();
        const q = date.materii.Matematica[0];

        document.getElementById('intrebare-text').innerText = q.intrebare;
        const divOptiuni = document.getElementById('optiuni');
        divOptiuni.innerHTML = '';

        q.optiuni.forEach((text, index) => {
            const btn = document.createElement('button'); 
            btn.innerText = text;
            btn.onclick = () => {
                if(index === q.corect) {
                    schimbaStareMascota('vesel', `Bravo! ${q.explicatie}`);
                } else {
                    schimbaStareMascota('trist', 'Off... mai încearcă!');
                }
            };
            divOptiuni.appendChild(btn); 
        });
    } catch (e) { console.error("Eroare JSON:", e); }
}

// 6. MASCOTA PISIUC (Animație și Mesaje)
function schimbaStareMascota(stare, mesaj) {
    if (stare === 'vesel') catImg.src = 'pisiuc_vesel.png';
    else if (stare === 'trist') catImg.src = 'pisiuc_trist.png';

    if(bulaText) {
        bulaText.innerText = mesaj;
        bulaText.classList.remove('ascuns');
    }

    setTimeout(() => {
        catImg.src = 'pisiuc_neutru.png';
        if(bulaText) bulaText.classList.add('ascuns');
    }, 3000); 
}