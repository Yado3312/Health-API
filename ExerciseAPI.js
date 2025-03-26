// Configuración de la API
const API_URL = 'https://exercisedb.p.rapidapi.com';
const API_KEY = '60ebdf900bmsh96b055ae3b57eaep105652jsn5075b74b2a71'; 

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const searchType = document.getElementById('search-type');
    const bodyPartFilter = document.getElementById('body-part-filter');
    const equipmentFilter = document.getElementById('equipment-filter');
    const exercisesContainer = document.getElementById('exercises-container');

    // Cargar filtros al inicio
    loadFilters();

    // Manejar búsqueda
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Manejar cambios en los filtros
    bodyPartFilter.addEventListener('change', handleFilterChange);
    equipmentFilter.addEventListener('change', handleFilterChange);

    // Cargar ejercicios al azar al inicio
    fetchRandomExercises();
});

async function loadFilters() {
    try {
        // Cargar grupos musculares
        	
        const bodyParts = await bodyPartsResponse.json();
        
        const bodyPartFilter = document.getElementById('body-part-filter');
        bodyParts.forEach(part => {
            const option = document.createElement('option');
            option.value = part;
            option.textContent = part.charAt(0).toUpperCase() + part.slice(1);
            bodyPartFilter.appendChild(option);
        });

        // Cargar equipos
        const equipmentResponse = await fetch(`${API_URL}/exercises/equipmentList`, {
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        const equipmentList = await equipmentResponse.json();
        
        const equipmentFilter = document.getElementById('equipment-filter');
        equipmentList.forEach(equip => {
            const option = document.createElement('option');
            option.value = equip;
            option.textContent = equip.charAt(0).toUpperCase() + equip.slice(1);
            equipmentFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar filtros:', error);
    }
}

function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    const searchType = document.getElementById('search-type').value;
    
    if (!searchTerm) {
        alert('Ingrese termino de busqueda');
        return;
    }

    if (searchType === 'name') {
        fetchExercisesByName(searchTerm);
    } else if (searchType === 'target') {
        fetchExercisesByTarget(searchTerm);
    } else if (searchType === 'equipment') {
        fetchExercisesByEquipment(searchTerm);
    }
}

function handleFilterChange() {
    const bodyPart = document.getElementById('body-part-filter').value;
    const equipment = document.getElementById('equipment-filter').value;
    
    if (bodyPart || equipment) {
        let url = `${API_URL}/exercises?`;
        if (bodyPart) url += `bodyPart=${bodyPart}`;
        if (bodyPart && equipment) url += '&';
        if (equipment) url += `equipment=${equipment}`;
        
        fetchExercises(url);
    } else {
        fetchRandomExercises();
    }
}

async function fetchRandomExercises() {
    try {
        const exercisesContainer = document.getElementById('exercises-container');
        exercisesContainer.innerHTML = '<p>Cargando ejercicios...</p>';

        const response = await fetch(`${API_URL}/exercises`, {
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        const data = await response.json();

        // Mostrar solo 12 ejercicios aleatorios
        const randomExercises = data.sort(() => 0.5 - Math.random()).slice(0, 12);
        displayExercises(randomExercises);
    } catch (error) {
        console.error('Error al obtener ejercicios:', error);
        exercisesContainer.innerHTML = '<p>Error al cargar los ejercicios. Intenta mas tarde.</p>';
    }
}

async function fetchExercisesByName(name) {
    const url = `${API_URL}/exercises/name/${name}`;
    await fetchExercises(url);
}

async function fetchExercisesByTarget(target) {
    const url = `${API_URL}/exercises/target/${target}`;
    await fetchExercises(url);
}

async function fetchExercisesByEquipment(equipment) {
    const url = `${API_URL}/exercises/equipment/${equipment}`;
    await fetchExercises(url);
}

async function fetchExercises(url) {
    try {
        const exercisesContainer = document.getElementById('exercises-container');
        exercisesContainer.innerHTML = '<p>Buscando ejercicios...</p>';

        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        const exercises = await response.json();

        if (exercises.length > 0) {
            displayExercises(exercises);
        } else {
            exercisesContainer.innerHTML = '<p>No se encontraron ejercicios con esos criterios.</p>';
        }
    } catch (error) {
        console.error('Error al buscar ejercicios:', error);
        exercisesContainer.innerHTML = '<p>Error al buscar ejercicios. Intenta mas tarde</p>';
    }
}

function displayExercises(exercises) {
    const exercisesContainer = document.getElementById('exercises-container');
    exercisesContainer.innerHTML = '';

    if (!exercises || exercises.length === 0) {
        exercisesContainer.innerHTML = '<p>No se encontraron ejercicios</p>';
        return;
    }

    exercises.forEach(exercise => {
        const exerciseCard = document.createElement('div');
        exerciseCard.className = 'exercise-card';

        
        exerciseCard.innerHTML = `
            <img src="${exercise.gifUrl}" alt="${exercise.name}">
            <div class="exercise-info">
                <h1>${exercise.name}</h1>
                <p><strong>musclar:</strong> ${exercise.target}</p>
                <p><strong>Parte  cuerpo </strong> ${exercise.bodyPart}</p>
                <p><strong>Equipo</strong> ${exercise.equipment}</p>
                <details>
                    <summary>Ver instrucciones</summary>
                    <ol>
                        ${exercise.instructions.map(inst => `<li>${inst}</li>`).join('')} 
                    </ol>
                </details>
            </div>
        `;

        exercisesContainer.appendChild(exerciseCard);
    });
}
