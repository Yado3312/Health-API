// APIS LINKS y KEYS.
const EXERCISE_API_URL = 'https://exercisedb.p.rapidapi.com';
const EXERCISE_API_KEY = '60ebdf900bmsh96b055ae3b57eaep105652jsn5075b74b2a71'; 
const FDA_API_URL = 'https://api.fda.gov/drug/event.json';
const MEAL_API_URL = 'https://www.themealdb.com/api/json/v1/1';

document.addEventListener('DOMContentLoaded', function() {
    // Fecha actual
    document.getElementById('updateDate').textContent = new Date().toLocaleDateString('es-ES');
    
    // Manejo de pestanas
    // Usamos query selector para poder seleccionar el elemento desde el css 
    document.querySelectorAll('.tab-button').forEach(button => { // Dentro de un boton insertamos una funcion la cual nos permite ocultar y activar los botones
        button.addEventListener('click', function() {

            // Ocultar todos los contenidos de pestanas
            document.querySelectorAll('.tab-content').forEach(content => { content.classList.remove('active'); });
            
            // Desactivar todos los botones
            document.querySelectorAll('.tab-button').forEach(btn => {  btn.classList.remove('active'); });
            
            // Mostrar la pestana seleccionada
            const tabId = this.getAttribute('data-tab'); // Obtenemos el id de nuestro elemento del html datatab 
            document.getElementById(tabId).classList.add('active');
            this.classList.add('active');
        });
    });
    
    //  pestana de ejercicios
    initExerciseTab();
    //  pestana de medicamentos
    initMedicineTab();
    
    // pestana de comidas
    initMealTab();
});

function initExerciseTab() {
    // hacemsos todos los getters para los id del html
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const searchType = document.getElementById('search-type');
    const bodyPartFilter = document.getElementById('body-part-filter');
    const equipmentFilter = document.getElementById('equipment-filter');
    
    // Cargar filtros al inicio
    loadExerciseFilters(); // metodo para poder cargar los filtros de ejercicio
    
    // Manejar busqueda
    searchBtn.addEventListener('click', handleExerciseSearch);
    // hacemso que el enter pueda ser util
    searchInput.addEventListener('keypress', (e) => {  if (e.key === 'Enter') handleExerciseSearch(); });
    
    // Manejar cambios en los filtros LOS REGISTRAMOS
    bodyPartFilter.addEventListener('change', handleExerciseFilterChange);
    equipmentFilter.addEventListener('change', handleExerciseFilterChange);
    
    // Cargar ejercicios al azar al inicio
    fetchRandomExercises();
}

function initMedicineTab() {
    // Manejar busqueda
    document.getElementById('searchButton').addEventListener('click', searchFDA);
    document.getElementById('drugSearch').addEventListener('keypress', function(e) { if (e.key === 'Enter') searchFDA(); });
}

function initMealTab() {
    const searchBtn = document.getElementById('meal-search-btn');
    const searchInput = document.getElementById('meal-search-input'); // Barra de busqueda
    
    // Cargar comidas al azar al inicio
    fetchRandomMeals();
    
    // Manejar busqueda
    searchBtn.addEventListener('click', () => {
        const ingredient = searchInput.value.trim(); // Usando trim eliminamos los espacios en blanco de los ingredientes.
        if (ingredient) { fetchMealsByIngredient(ingredient); } // verificamossi el ingrediente existe
        else { alert('Por favor ingresa un ingrediente'); } // Manejo de errores
    });
    
    // Habilitar el enter para la nisqueda XD 
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { searchBtn.click(); }
    });
}

// EJERCICIOS 
async function loadExerciseFilters() {
    try {
        // Cargar grupos musculares
        // SOLICITUD HTTP para poder cargar la data 
        const bodyPartsResponse = await fetch(`${EXERCISE_API_URL}/exercises/bodyPartList`, {
            headers: {
                'X-RapidAPI-Key': EXERCISE_API_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });

        const bodyParts = await bodyPartsResponse.json(); // Convertir la respuesta a un objeto JSON
        
        const bodyPartFilter = document.getElementById('body-part-filter');
        bodyParts.forEach(part => {
            const option = document.createElement('option'); // creamos una nueva opcion por cada parte del cuerpo
            option.value = part; // restablecemos el valor por la part 
            option.textContent = part.charAt(0).toUpperCase() + part.slice(1); // Conversion de las letras para la presentacion 
            bodyPartFilter.appendChild(option); // anadimos la opcion al body 
        });
        
        // Cargar equipos 
        // Request UR L
        const equipmentResponse = await fetch(`${EXERCISE_API_URL}/exercises/equipmentList`, {
            headers: {
                'X-RapidAPI-Key': EXERCISE_API_KEY,
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
    } catch (error) { console.error('Error al cargar filtros:', error); } // son 3 filtros tons
}

function handleExerciseSearch() {
    const searchTerm = document.getElementById('search-input').value.trim(); // usamos trim para eliminar espacios en blanco y poder buscar los elementos
    const searchType = document.getElementById('search-type').value;
    
    if (!searchTerm) { alert('Por favor BUSCA ALGO'); return; }
    
    if (searchType === 'name') { fetchExercisesByName(searchTerm); } // estan las categorias de busqueda
    else if (searchType === 'target') { fetchExercisesByTarget(searchTerm); } // buscamos por el nombre o el target
    else if (searchType === 'equipment') { fetchExercisesByEquipment(searchTerm); } // buscamos por el equipo
}

function handleExerciseFilterChange() {
    const bodyPart = document.getElementById('body-part-filter').value;
    const equipment = document.getElementById('equipment-filter').value;
    
    if (bodyPart || equipment) { // si hay algun filtro activo para que no truene 
        let url = `${EXERCISE_API_URL}/exercises?`;
        if (bodyPart) url += `bodyPart=${bodyPart}`;
        if (bodyPart && equipment) url += '&';
        if (equipment) url += `equipment=${equipment}`;
        
        fetchExercises(url);
    } else { fetchRandomExercises(); }
}

async function fetchRandomExercises() {
    try {
        const exercisesContainer = document.getElementById('exercises-container');
        exercisesContainer.innerHTML = '<p>Cargando ejercicios...</p>';
        
        // reqiest de ;os ejercicios qwue van a llegar al usuario de manear aleatporia
        const response = await fetch(`${EXERCISE_API_URL}/exercises`, {
            headers: {
                'X-RapidAPI-Key': EXERCISE_API_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        const data = await response.json(); // convertimos a un formato json 
        
        // Mostrar just 12 ejercicios aleatorios
        const randomExercises = data.sort(() => 0.5 - Math.random()).slice(0, 12); // aqui volvemos la busqeuda aleatoria
        displayExercises(randomExercises); // mstramos los ejercicios 
    } catch (error) {
        console.error('Error al obtener ejercicios:', error);
        exercisesContainer.innerHTML = '<p>Error al cargar los ejercicios. Intenta mas tarde</p>'; // manejo de errores
    }
}

// Funcion para mostrar los ejercicios por nambe
async function fetchExercisesByName(name) {
    const url = `${EXERCISE_API_URL}/exercises/name/${name}`;
    await fetchExercises(url);
}
// Funcion para mostrar los ejercicios por target 
async function fetchExercisesByTarget(target) {
    const url = `${EXERCISE_API_URL}/exercises/target/${target}`;
    await fetchExercises(url);
}
// Funcion para mostrar los ejercicios por  por equipment 
async function fetchExercisesByEquipment(equipment) {
    const url = `${EXERCISE_API_URL}/exercises/equipment/${equipment}`;
    await fetchExercises(url);
}

async function fetchExercises(url) { // funcion para mostrar los ejercicios por body part
    try {
        const exercisesContainer = document.getElementById('exercises-container');
        exercisesContainer.innerHTML = '<p>Buscando ejercicios...</p>';
        
        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': EXERCISE_API_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        const exercises = await response.json();
        
        if (exercises.length > 0) { displayExercises(exercises); } 
        else { exercisesContainer.innerHTML = '<p>No se encontraron ejercicios con esos criterios.</p>'; } // manejo de errores 
    } catch (error) {
        console.error('Error al buscar ejercicios:', error);
        exercisesContainer.innerHTML = '<p>Error al buscar ejercicios. Intenta mas tarde.</p>';
    }
}

// DISPLAY Ejercicios ------------------------- EJERCICIOS ============================ WORKOUT =======================

function displayExercises(exercises) {
    const exercisesContainer = document.getElementById('exercises-container');
    exercisesContainer.innerHTML = '';
    
    if (!exercises || exercises.length === 0) { exercisesContainer.innerHTML = '<p>No se encontraron ejercicios.</p>'; return; } // en caso de que no se vea ningun ejercicio.
    
    exercises.forEach(exercise => { // printeamos con un inner html la informacion devuelta de cada ejercicio. 
        const exerciseCard = document.createElement('div');
        exerciseCard.className = 'exercise-card';
        
        exerciseCard.innerHTML = `
            <img src="${exercise.gifUrl}" alt="${exercise.name}">
            <div>
                <h3>${exercise.name}</h3>
                <p><strong>Grupo muscular:</strong> ${exercise.target}</p>
                <p><strong>Parte del cuerpo suculento:</strong> ${exercise.bodyPart}</p>
                <p><strong>Equipo:</strong> ${exercise.equipment}</p>
                <details>
                    <summary>Ver innstructions</summary>
                    <ol>  ${exercise.instructions.map(inst => `<li>${inst}</li>`).join('')} </ol>
                </details>
            </div> `;
        
        exercisesContainer.appendChild(exerciseCard); // anadimos 
    });
}

// MEDICAMENTOS 
async function searchFDA() {
    const searchTerm = document.getElementById('drugSearch').value.trim();
    const searchType = document.querySelector('input[name="searchType"]:checked').value; // habilitamos la barra de busqueda
    
    if (!searchTerm) { alert('Por favor BUSCA ALGO'); return; }
    
    // Mostrar el tremendo loanding 
    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultsContainer').innerHTML = '';
    document.getElementById('resultInfo').innerHTML = '';
    
    try {
        let url;
        // Buscar por medicamento
        if (searchType === 'drug') { url = `${FDA_API_URL}?search=patient.drug.medicinalproduct:"${encodeURIComponent(searchTerm)}"&limit=10`;} 
        // Buscar por si el medicamento da de que reacciones o asi 
        else { url = `${FDA_API_URL}?search=patient.reaction.reactionmeddrapt:"${encodeURIComponent(searchTerm)}"&limit=10`;}
        
        const response = await fetch(url);
        const data = await response.json(); // onvertimos a un objeto json 
        
        if (!response.ok) { throw new Error(data.error.message || 'Error al consultar la API'); } // manejo de error 
        
        displayFDAResults(data.results, searchTerm, searchType);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('resultsContainer').innerHTML = `
            <div> <div> <i class="fas fa-exclamation-triangle"></i> Error al obtener datos: ${error.message} </div> </div>`;
    }  // mostramos el ERRORRR
    finally { document.getElementById('loading').style.display = 'none'; }
}

function displayFDAResults(results, searchTerm, searchType) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = ` <div> <div> No se encontraron resultados para "${searchTerm}" </div> </div>`;
        return;
    } // en caso que no se hayan encontrado resultados 
    
    document.getElementById('resultInfo').innerHTML = ` <p>Mostrando ${results.length} resultados para "${searchTerm}"</p>`;
    
    resultsContainer.innerHTML = '';
    
    results.forEach((item, index) => { // recorremos los resultados
        const card = document.createElement('div');
        card.className = 'health-card';
        
        let cardContent = '';
        let adverseReactions = [ ];
        let drugs = [ ];
        
        if (item.patient && item.patient.drug) { drugs = item.patient.drug.map(drug => drug.medicinalproduct).filter(Boolean);}
        
        if (item.patient && item.patient.reaction) {adverseReactions = item.patient.reaction.map(r => r.reactionmeddrapt).filter(Boolean);}
        
        cardContent += `<h5>Caso #${index + 1}</h5>`;
        
        if (drugs.length > 0) {
            cardContent += `
                <h6><i class="fas fa-pills"></i> Medicamento(s):</h6>
                <div> ${drugs.map(drug => `<span class="types-of-drugs">${drug} </span>`).join('')} </div>`;
        }
        
        if (adverseReactions.length > 0) {
            cardContent += `
                <h6><i class="fas fa-exclamation-triangle"></i> Reacción(es) adversa(s):</h6>
                <div> ${adverseReactions.map(reaction => `<span>${reaction}</span>`).join('')} </div>`;
        }
        
        if (item.receivedate) {
            cardContent += ` <p> <i class="far fa-calendar-alt"></i> Fecha de reorte: ${new Date(item.receivedate).toLocaleDateString('es-ES')}</p>`;}
        
        cardContent += `
                </div>
                <div>
                    <button class="see-details-btn" onclick="showDetails(${index})"> <i class="fas fa-info-circle"></i> Ver detalles </button>
                </div>
            </div> `;
        
        card.innerHTML = cardContent;
        resultsContainer.appendChild(card);
    });
    
    // GUARDAR PERROS RESUTADOS DEL MODAL
    window.currentResults = results;
}

function showDetails(index) {
    const item = window.currentResults[index];
    let detailsContent = '';
    
    // Informacion del pasiente 
    if (item.patient) {
        detailsContent += ` <h4>Informacian del Paciente</h4> <ul>`;
        
        if (item.patient.patientagegroup) { detailsContent += `<li>Grupo de edad: ${item.patient.patientagegroup}</li>`; }
        
        if (item.patient.patientsex) { detailsContent += `<li>SEXOOOo: ${item.patient.patientsex === '1' ? 'Masculino' : 'Femenino'}</li>`;}
        
        if (item.patient.patientweight) { detailsContent += `<li>Peso: ${item.patient.patientweight} kg</li>`;}
        
        detailsContent += `</ul>`;
    }
    
    // MDICAMENTOS
    if (item.patient.drug) {
        detailsContent += `
            <h4>Medicamentos</h4>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Indicación</th>
                            <th>Dosis</th>
                        </tr>
                    </thead>
                    <tbody> `;
        
        item.patient.drug.forEach(drug => {
            detailsContent += `
                <tr>
                    <td>${drug.medicinalproduct || 'N/A'}</td>
                    <td>${drug.drugindication || 'N/A'}</td>
                    <td>${drug.drugdosagetext || 'N/A'}</td>
                </tr> `;
        });
        
        detailsContent += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Reacciones adversas
    if (item.patient.reaction) {
        detailsContent += `
            <h4>Reacciones Adversas</h4>
            <ul>
        `;
        
        item.patient.reaction.forEach(reaction => {
            detailsContent += `
                <li>
                    ${reaction.reactionmeddrapt || 'Reacción no especificada'}
                    ${reaction.reactionoutcome ? `<span> ${getOutcomeText(reaction.reactionoutcome)} </span>` : ''}
                </li> `;
        });
        
        detailsContent += `</ul>`;
    }
    
    // MODAL DEL LOS MEDICAMENTOS BRO 
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    document.getElementById('modalTitle').textContent = `Detalles del Caso #${index + 1}`;
    document.getElementById('modalBody').innerHTML = detailsContent;
    modal.show();
}

function getOutcomeText(code) {
    const outcomes = {
        '1': 'Recuperado',
        '2': 'En recuperación',
        '3': 'No recuperado',
        '4': 'Recuperado con secuelas',
        '5': 'Fatal',
        '6': 'Desconocido'
    };
    return outcomes[code] || 'Desconocido';
}

// COMIDAS QUE TE PONEN MAMADO
async function fetchRandomMeals() {
    try {
        const mealsContainer = document.getElementById('meals-container');
        mealsContainer.innerHTML = '<p>Cargando comidas...</p>';
        
        // Hacer 5 solicitudes para obtener comidas aleatorias
        const promises = [];
        for (let i = 0; i < 5; i++) { promises.push(fetch(`${MEAL_API_URL}/random.php`).then(res => res.json())); }
        
        const results = await Promise.all(promises);
        const meals = results.map(result => result.meals[0]);
        
        displayMeals(meals);
    } catch (error) {
        console.error('Error al obtener comidas:', error);
        mealsContainer.innerHTML = '<p>Error al cargar las comidas. Intenta mas tarde</p>';
    }
}

async function fetchMealsByIngredient(ingredient) {
    try {
        const mealsContainer = document.getElementById('meals-container');
        mealsContainer.innerHTML = '<p>Buscando comidas...</p>';
        
        const response = await fetch(`${MEAL_API_URL}/filter.php?i=${ingredient}`);
        const data = await response.json();
        
        if (data.meals) {
            // Obtener detalles completos de cada comida
            const mealPromises = data.meals.map(meal => 
                fetch(`${MEAL_API_URL}/lookup.php?i=${meal.idMeal}`).then(res => res.json()) //  Obtener detalles completos de cada comida
            );
            const mealDetails = await Promise.all(mealPromises); //  Obtener detalles completos de cada comida por medio de la promesa
            const fullMeals = mealDetails.map(detail => detail.meals[0]); // aqui conjuntamos las comidas completas con los detalles
            
            displayMeals(fullMeals);
        } 
        else { mealsContainer.innerHTML = `<p>No se encontraron comidas con ${ingredient}. Intenta con otro ingrediente.</p>`; }
    } catch (error) {
        console.error('Error al buscar comidas:', error);
        mealsContainer.innerHTML = '<p>Error al buscar comidas. Intenta MAS TARDE.</p>';
    }
}

// DISPLAY MEALS COMIDAS - APPENCHILD DE LAS COMIDAS - TARJETAS DE COMIDA =========================================================================

function displayMeals(meals) {
    const mealsContainer = document.getElementById('meals-container');
    mealsContainer.innerHTML = '';
    
    if (!meals || meals.length === 0) { mealsContainer.innerHTML = '<p>No se encontraron comidas.</p>'; return;}
    
    meals.forEach(meal => { //  Cada comida es un objeto
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        
        // Extraer los ingredientes y medidas 
        const ingredients = []; 
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`]) { ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`); } // iteramos entre cada una dela comida
        }
        // inner donde mostramos donde es que la comida se acomoda estructura htl 
        mealCard.innerHTML = `
            <img class="meals-img" src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-card-body">
                <h3 class="meals-h3" >${meal.strMeal}</h3>
                <p><strong>Categoria:</strong> ${meal.strCategory}</p>
                <p><strong>Area :</strong> ${meal.strArea}</p>
                <details>
                    <summary>Ver ingredientes</summary>
                    <ul> ${ingredients.map(ing => `<li>${ing}</li>`).join('')} </ul>
                </details>
                <details>
                    <summary>Ver instrucciones</summary>
                    <p>${meal.strInstructions}</p>
                </details>
                ${meal.strYoutube ? `<a  class="youtube-btn display-flex-center" href="${meal.strYoutube}" target="_blank">Tutorial</a>` : ''}
            </div> `;
        // el join une los eementos ed un array.
        mealsContainer.appendChild(mealCard);
    });
}