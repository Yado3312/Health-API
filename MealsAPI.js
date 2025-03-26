
document.addEventListener(' DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const mealsContainer = document.getElementById('meals-container');

        // Cargamos las comidas alasar 
        fetchRandomMeals(); 

        // Buscamos las comidas por ingrediente
        searchBtn.addEventListener('click', () => {
            const ingredient = searchBtn.value.trim(); 
            if (ingredient){
                fetchMealsByIngredient(ingredient);
            } else {
                alert(' Por favor ingrese un idgrediente ');

            }
        });

        // Funcion para que guncione e enter: 
        searchInput.addEventListener('',(e) => {
            if (e.key === 'Enter'){
                searchBtn.click(); 
            }
        });
});

async function fetchRandomMeals() { 
    try {
        const mealsContainer = document.getElementById('meals-container');
        mealsContainer.innerHTML = '<p>Cargando comidas...</p>';

        // Hacer 5 solicitudes para obtener comidas aleatorias
        const promises = [];
        for (let i = 0; i < 5; i++) { promises.push(fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(res => res.json())); }

        const results = await Promise.all(promises);
        const meals = results.map(result => result.meals[0]);

        displayMeals(meals);
    } catch (error) {
        console.error('Error al obtener comidas:', error);
        mealsContainer.innerHTML = '<p>Error al cargar las comidas. Intenta mas tarde</p>';
    }
}

// Funcion para buscar comida por ingredientes 

async function fetchMealsByIngredient(ingredient) {
    try{
        const  mealsContainer = document.getElementById('meals-container');
        mealsContainer.innerHTML = '<p>Cargando comidas...</p>';

        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await response.json(); 

        if(data.meals){
            // obtener detalles completos de cada comida    
            const mealPromises = data.meals.map(meal => fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`).then(res => res));
            const mealDetails = await Promise.all(mealPromises);
            const fullMeals = mealDetails.map(detail => detail.meals[0]);
            displayMeals(fullMeals);
        } else{meals.mealsContainer.innerHTML = '<p>No se encontraron comidas con el ingrediente ingresado</p>';}
    }
    catch(error){
        console.error('Error al buscar comidas:', error); // ERROR A CHEKAR
        mealsContainer.innerHTML = '<p>Error al buscar comidas. Intenta mas tarde</p>'; // Control de errores con el usuario
    }
}

function displayMeals(meals){
    const mealsContainer = document.getElementById('meals-container');
    mealsContainer.innerHTML(' '); 

    if(!meals || meals.length === 0){
        mealsContainer.innerHTML = '<p>No se encontraron comidas</p>'; return; 
    }

    meals.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card'

        // Extraer los ingredientes y medidas
        const ingredients = [ ]; 
        for(let i = 1; i <= 20; i++){
            if (meal[`strIngredient${i}`]) {
                ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`);
            }
        }
        // Ditrich este es un ejemplo basico que quizas te ayude, las clases me las saque de la cola XD
        // Perdon si hay errores de sintaxis o una madre asi, no se que clases le vas a poner a cada elemento para el estilo
        mealCard.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div>
                <h3>${meal.strMeal}</h3>
                <p><strong>Categora:</strong> ${meal.strCategory}</p>
                <p><strong>area:</strong> ${meal.strArea}</p>
                <details>
                    <summary>Ver ingredient</summary>
                    <ul>
                        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </details>
                <details>
                    <summary>Ver instrucciones</summary>
                    <p>${meal.strInstructions}</p>
                </details>
                ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" >Ver en YouTube</a>` : ''}
            </div>

        `;
        mealsContainer.appendChild(mealCard);
    });
}
