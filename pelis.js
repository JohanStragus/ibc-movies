window.onload = function () {

    // VARIABLES //

    const API_KEY = "55562c90a82d558d6998e038a072ba37";
    const BASE_URL = "https://api.themoviedb.org/3";

    const input = document.getElementById('filmSearch');
    const suggestions = document.getElementById('suggestions');
    const searchButton = document.getElementById('filmButton');
    const moviesContainer = document.getElementById('movies');
    var i;

    // LIMPIAMOS EL CONTENEDOR DE PELIS
    moviesContainer.innerHTML = '';

    // EVENTOS // 

    input.addEventListener('input', loadSuggestions);
    suggestions.addEventListener('click', accesoFitxa);
    searchButton.addEventListener('click', layaout);

    // FUNCIONES //

    // Buscar sugerencias
    async function loadSuggestions() {
        // valor del input
        const query = input.value.trim();

        // si el input es < 3 que no muestre nada (Evitar abrumación de sugerencias)
        if (query.length < 3) {
            suggestions.innerHTML = '';
            suggestions.style.display = 'none';
            return;
        }

        // url de la API, en la cual query es el valor del input
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`;

        // si Ocurre algo dentro de este bloque
        try {
            // respuesta de la API
            const response = await fetch(url);

            // si la respuesta no es correcta, lanzamos un error
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            };

            // Convertimos la respuesta a JSON
            const data = await response.json();

            // Dejamos limpio el contenedor de sugerencias
            suggestions.innerHTML = '';

            // Lista para controlar títulos ya mostrados
            var titulosMostrados = [];

            // Recorremos todas las pelis
            for (i = 0; i < data.results.length; i++) {
                // Obtenemos la peli de la iteración
                var movie = data.results[i];
                // obtenemos el título de la peli
                var title = movie.title.trim();

                // Si en el array ya tenemos el título no mostramos otro igual
                if (titulosMostrados.includes(title)) {
                    continue;
                }

                // detallesUrl para obtener el id de IMDB
                const detailsUrl = `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&append_to_response=external_ids`;
                // respuesta de la API
                const detailsResponse = await fetch(detailsUrl);

                // si la respuesta no es correcta, lanzamos un error
                if (!detailsResponse.ok) {
                    throw new Error('Error en la respuesta de detalles de la película');
                };
                // Convertimos la respuesta a JSON
                const detailsData = await detailsResponse.json();

                // Obtenemos el id de IMDB de la respuesta (ejemplo: Data es un array que dentro tiene external_ids uno de esos external_ids es imbd_id)
                var imdbId = detailsData.external_ids.imdb_id;

                // Si no tiene imdb_id, lo saltamos (hay muchos que tienen null)
                if (!imdbId) {
                    continue;
                }

                // Añadimos el título a la lista de mostrados (En caso de que no haya sido mostrado ya y que no tenga id de IMDB en null)
                titulosMostrados.push(title);

                // Creamos un div en cada iteración
                var div = document.createElement('div');
                // Creamos +classname 'suggest-element' para cada peli
                div.className = 'suggest-element';
                // El texto del div es el título de la peli
                div.textContent = title;
                // ponemos el id de la peli en el atributo id
                div.setAttribute('id', movie.id);
                // añadimos en el contenedor de sugerencias el div creado
                suggestions.appendChild(div);
            };

            // Estilo contenedor de sugerencias
            suggestions.style.display = 'block';

        } catch (error) {
            alert('No se pudo acceder a la ficha de la película.');
            console.error('Error cargando sugerencias:', error);
        };
    };

    // Cuando clicamos una sugerencia, accedemos a la ficha de la peli
    async function accesoFitxa(event) {
        // Obtenemos el elemento que hemos clicado
        var clickedElement = event.target;

        // Comprobamos que hemos pulsado sobre una sugerencia
        if (!clickedElement.classList.contains('suggest-element')) {
            return;
        }

        // Obtenemos el id de la peli clicada
        var movieId = clickedElement.getAttribute('id');

        // Esto permite que solo se haga una petición append-to-response.
        const detailsUrl = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=external_ids`;

        // si ocurre algún error dentro de este bloque
        try {
            // respuesta de la API
            const response = await fetch(detailsUrl);

            // si la respuesta no es correcta, lanzamos un error
            if (!response.ok) {
                throw new Error('Error en la respuesta de detalles de la película');
            }

            // Convertimos la respuesta a JSON
            const data = await response.json();
            // Obtenemos el id de IMDB de la respuesta
            var imdbId = data.external_ids.imdb_id;

            // Si el id de IMDB existe, abrimos la ficha de IMDB en una nueva pestaña
            if (imdbId) {
                window.open(`https://www.imdb.com/es-es/title/${imdbId}/`, '_blank');
            } else {
                // Si no hay id de IMDB, mostramos un mensaje de error.
                alert('Esta película no tiene ficha en IMDb.');
            }

        } catch (error) {
            alert('No se pudo acceder a la ficha de la película.');
            console.error('Error accediendo a la ficha de IMDB:', error);
        };
    };

    // Cuando clicamos el botón de busqueda se muestra el layaout de las pelis del input de ese momento
    async function layaout() {
        // si clicamos el botón de búsqueda, ocultamos las sugerencias (detalles)
        suggestions.style.display = 'none';

        const query = input.value.trim();

        // mostramos la rueda de carga
        showLoading();

        // url de la API, en la cual query es el valor del input
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`;

        // si ocurre algún error dentro de este bloque
        try {
            // respuesta de la API
            const response = await fetch(url);

            // si la respuesta no es correcta, lanzamos un error
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }

            // convertimos la respuesta a JSON
            const data = await response.json();

            // Limpiamos el contenedor de las peliculas para que no sean las predefinidas, ya que se actualiza con el input
            moviesContainer.innerHTML = '';

            // recorremos todas las pelis
            for (i = 0; i < data.results.length; i++) {
                // obtenemos la peli de la iteración
                const movie = data.results[i];
                // obtenemos el id de la peli
                const movieId = movie.id;

                // los detalles de esa peli en concreto
                const detailsUrl = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,external_ids`;
                // respuesta de la API
                const detailsResponse = await fetch(detailsUrl);

                // si la respuesta no es correcta, lanzamos un error
                if (!detailsResponse.ok) {
                    throw new Error('Error en la respuesta de detalles de la película');
                }
                // convertimos la respuesta a JSON
                const detailsData = await detailsResponse.json();

                let img;
                // Si la peli tiene una imagen, la obtenemos de la API, sino, mostramos una imagen por defecto
                if (detailsData.poster_path) {
                    // imagen de la API
                    img = `https://image.tmdb.org/t/p/original${detailsData.poster_path}`;

                // Si no tiene imagen, mostramos una por defecto
                } else {
                    // imagen por defecto
                    img = 'https://placehold.co/208x312/cccccc/ffffff?text=POSTER%0ANO%20DISPONIBLE';
                }

                // obtenemos el titulo de la peli
                const title = detailsData.title;
                // obtenemos solo 3 generos de la peli (si tiene más de 3, no los muestra todos)
                const genero = detailsData.genres.slice(0, 3).map(g => g.name).join(', ');
                // obtenemos fecha de salida
                const releaseDate = detailsData.release_date;
                // obtenemos solo 3 nombres de actores (si tiene más de 3, no los muestra todos)
                const nActors = detailsData.credits.cast.slice(0, 3).map(a => a.name).join(', ');
                // id externo de detailsData que representa el id de IMDB
                const imdbId = detailsData.external_ids.imdb_id;

                // Si no tiene imdbId, NO mostramos esta película (para evitar enlaces que no existen)
                if (!imdbId) {
                    continue;
                }

                // Creamos un div para cada peli
                const div = document.createElement('div');

                // Creamos el div classnmae y todo el contendido de la tarjeta (referenciarse del html original)
                div.className = 'col-md-4';
                div.innerHTML = `
                <div class="card mb-4 box-shadow">
                    <img class="card-img-top" src="${img}" alt="${title}" style="width: 100%; display: block;">
                    <div class="card-body text-center">
                        <h5 class="card-title text-center">${title}</h5>
                        <div><small class="text-muted"><i class="bi bi-film mx-2"></i> ${genero}</small></div>
                        <div><small class="text-muted"><i class="bi bi-calendar3 mx-2"></i> ${releaseDate}</small></div>
                        <small class="text-muted"><i class="bi bi-people mx-2"></i> ${nActors}</small>
                    </div>
                    <div class="card-footer bg-primary text-white text-center">
                        <a href="https://www.imdb.com/title/${imdbId}/" class="text-white" target="_blank">
                            <i class="bi bi-eye"></i> Veure fitxa a IMDB
                        </a>
                    </div>
                </div>
            `;

                // Añadimos cada tarjeta al contenedor
                moviesContainer.appendChild(div);

            }

            // Si no hay resultados, mostramos un mensaje
        } catch (error) {
            console.error('Error al cargar el layout:', error);

            // ultimamente, la última acción es ocultar la rueda de carga
        } finally {
            // ocultamos la rueda de carga
            hideLoading();
        }
    };

    // Mostrar rueda de carga
    function showLoading() {
        document.querySelector('.loading').style.display = 'block';
    }
    // ocultar rueda de carga
    function hideLoading() {
        document.querySelector('.loading').style.display = 'none';
    }

};
