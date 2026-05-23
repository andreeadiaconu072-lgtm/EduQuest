// ==========================================================================
// ÎNLOCUIEȘTE FUNCȚIILE CORESPUNZĂTOARE ÎN JAVASCRIPT-UL TĂU CURENT:
// ==========================================================================

function afiseazaMeniuDiscipline() {
    if (!gridPrincipal) return;
    gridPrincipal.innerHTML = "";
    
    // În loc să punem culori inline fixe, adăugăm clase CSS semantice curate
    for (const disciplina in dateProiect.materii) {
        const card = document.createElement("div");
        card.className = "card-disciplina-nou"; 
        
        // Atribuim o iconiță sugestivă în funcție de disciplină
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
        cardAlaturare.style.borderColor = "var(--brand-blue)";
        cardAlaturare.innerHTML = `
            <div style="font-size: 45px; margin-bottom: 10px;">🏫</div>
            <h3 style="margin: 10px 0 5px 0; font-size: 20px; color: var(--brand-blue);">Clasă Virtuală</h3>
            <p style="color: #777; margin: 0; font-size: 14px;">Introdu codul profesorului</p>
        `;
        cardAlaturare.onclick = () => document.getElementById('modal-alaturare-clasa').classList.remove('ascuns');
        gridPrincipal.appendChild(cardAlaturare);
    }
}

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
        card.className = "clasa-card-nou";
        card.innerHTML = `
            <h3 style="margin: 0 0 8px 0; color: var(--brand-purple);">${c.nume}</h3>
            <div style="background: #eedfff; display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; color: var(--brand-purple);">
                Cod: ${c.id}
            </div>
        `;
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
        lista.innerHTML = "<p style='text-align: center; color: #777; margin: 20px 0;'>Profesorul nu a postat încă niciun material în această clasă.</p>"; 
        return;
    }
    
    materiale.forEach(m => {
        const div = document.createElement('div');
        div.className = "card-material-nou";
        div.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #b68500;">📌 ${m.titlu}</h3>
            <p style="margin: 0; line-height: 1.5; color: var(--text-dark); white-space: pre-wrap;">${m.descriere}</p>
        `;
        lista.appendChild(div);
    });
}

function deschideClaseleMeleElev() {
    if (gridPrincipal) gridPrincipal.innerHTML = "";
    
    let safeInscrieri = localStorage.getItem('eduquest_clase_virtuale');
    let clase = safeInscrieri ? JSON.parse(safeInscrieri) : [];
    
    let container = gridPrincipal;
    
    if(clase.length === 0) {
        container.innerHTML = "<p style='text-align: center; width: 100%; color: #777;'>Nu te-ai alăturat niciunei clase încă.</p>";
        return;
    }
    
    clase.forEach(c => {
        const card = document.createElement('div');
        card.className = "card-disciplina-nou";
        card.style.borderColor = "var(--brand-purple)";
        card.style.boxShadow = "0 6px 0 #ded0fd";
        card.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 10px;">🏫</div>
            <h3 style="margin: 5px 0;">${c.nume}</h3>
            <p style="font-size: 13px; color: #777; margin: 0;">Profesor: ${c.profesor}</p>
        `;
        card.onclick = () => deschideClasaElev(c.id, c.nume);
        container.appendChild(card);
    });
}
