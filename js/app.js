
// Verificar que una pelicula es nueva (estreno en los últimos 30 días)
function esPeliculaNueva(fechaEstreno) {
  const hoy = new Date();
  const estreno = new Date(fechaEstreno);
  const diffTime = Math.floor((hoy - estreno) / (1000 * 60 * 60 * 24));
  return diffTime <= 30;
}

// Calcular el precio de la entrada actual
/*function calcularPrecio(precios, fechaEstreno) {
  return esPeliculaNueva(fechaEstreno) ? precios.estrenos : precios.normal;
}*/
// Función para calcular el precio actual
function calcularPrecio(fechaEstreno, precios) {
  // Validación: si precios no existe o está vacío
  if (!precios || typeof precios !== 'object') {
    console.warn("Precios no definido, usando precio por defecto");
    return 8.00;
  }

  // Validación: si faltan los campos estreno o normal
  if (precios.estreno === undefined || precios.normal === undefined) {
    console.warn("Precios incompletos:", precios);
    return precios.normal || precios.estrenos || 8.00;
  }

  return esEstreno(fechaEstreno) ? precios.estrenos : precios.normal;
}

// Funcion para generar insignia de generos
function generarInsigniasGeneros(generos) {
  return generos.map(genero => `<span class="badge bg-secondary me-1">${genero}</span>`).join('');
}

$(document).ready(function () {
  $.ajax({
    url: "data/peliculas.json",
    method: "GET",
    dataType: "json",
    success: function (peliculas) {
      let html = "";
      peliculas.forEach(function (peli) {
        
        /*
        html += `
            <div class="col-md-4">
              <div class="card h-100 shadow">
                <img src="img/${peli.imagen}" class="card-img-top" alt="${peli.titulo}">
                <div class="card-body">
                  <h5 class="card-title">${peli.titulo}</h5>
                  <p class="card-text">${peli.genero}</p>
                  <a href="pages/detalle.html?id=${peli.id}" class="btn btn-primary">Ver más</a>
                </div>
              </div>
            </div>`;
      });*/
        // Calcular precio y estado de la película
        const precioActual = calcularPrecio(peli.esPeliculaNueva, peli.precios);
        const badgeEstreno = esPeliculaNueva(peli.estrenos)
          ? '<span class="badge bg-danger mb-2">🔥 ESTRENO</span>'
          : '<span class="badge bg-success mb-2">En Cartelera</span>';

        html += `
    <div class="col-md-4 mb-4">
      <div class="card h-100 shadow">
        ${badgeEstreno}
        <img src="img/${peli.imagen}" class="card-img-top" alt="${peli.titulo}">
        <div class="card-body">
          <h5 class="card-title">${peli.titulo}</h5>
          <div class="mb-2">
            ${generarInsigniasGeneros(peli.generos)}
          </div>
          <p class="card-text text-truncate">${peli.sinopsis}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <span class="h5 mb-0 text-primary">$${precioActual.toFixed(2)}</span>
            <a href="pages/detalle.html?id=${peli.id}" class="btn btn-primary btn-sm">Ver más</a>
          </div>
        </div>
      </div>
    </div>`;
      });
      $("#lista-peliculas").html(html);
    },
    error: function (xhr, status, error) {
      console.error("Error al cargar las películas:", error);
      $("#lista-peliculas").html(`
          <div class="col-12">
            <div class="alert alert-danger text-center" role="alert">
              No se pudo cargar la lista de películas. Intenta nuevamente más tarde.
            </div>
          </div>
        `);
    }
  });
});
