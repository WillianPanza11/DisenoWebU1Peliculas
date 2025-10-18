
// Verificar que una pelicula es nueva (estreno en los últimos 30 días)
function esPeliculaNueva(fechaEstreno) {
  if (!fechaEstreno) {
    return false;
  }

  // Convertir fechas a objetos Date
  const hoy = new Date();
  const estreno = new Date(fechaEstreno);

  // Verificar si la fecha es válida
  if (isNaN(estreno.getTime())) {
    return false;
  }

  // Calcular diferencia en milisegundos y convertir a días
  const diferenciaMs = hoy.getTime() - estreno.getTime();
  const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

  return diferenciaDias < 30;
}

// Función para calcular el precio actual
function calcularPrecio(fechaEstreno, precios) {
  // Validación: si precios no existe o está vacío
  if (!precios || typeof precios !== 'object') {
    return 8.00;
  }

  // Validación: si faltan los campos estreno o normal
  if (precios.estreno === undefined || precios.normal === undefined) {
    return precios.normal || precios.estrenos || 8.00;
  }

  return esPeliculaNueva(fechaEstreno) ? precios.estrenos : precios.normal;
}

// Funcion para generar insignia de generos
function generarInsigniasGeneros(generos) {
  return generos.map(genero => `<span class="badge bg-secondary me-1">${genero}</span>`).join('');
}

$(document).ready(function () {
  // Alerta de Bienvenida
  // Verificar si es la primera vez que visita
  const yaVisito = localStorage.getItem('bienvenidaMostrada');

  if (!yaVisito) {
    console.log("🎉 Primera visita, mostrando bienvenida");

    // Mostrar el modal de bienvenida
    const modalBienvenida = new bootstrap.Modal(document.getElementById('modalBienvenida'));
    modalBienvenida.show();

    // Guardar en localStorage que ya vio la bienvenida
    localStorage.setItem('bienvenidaMostrada', 'true');

    console.log("✅ Bienvenida guardada en localStorage");
  } else {
    console.log("👋 Ya visitó antes, no mostrar bienvenida");
  }
  // Mostrar el spinner (ya está visible por defecto)
  $("#spinner-carga").show();
  $("#lista-peliculas").hide();


  // Simular retraso de 5 segundos usando setTimeout
  setTimeout(function () {
    $.ajax({
      url: "data/peliculas.json",
      method: "GET",
      dataType: "json",
      success: function (peliculas) {
        let html = "";
        peliculas.forEach(function (peli) {
          const hoy = new Date();
          const estreno = new Date(peli.estreno);
          const dias = Math.floor((hoy - estreno) / (1000 * 60 * 60 * 24));

          // Calcular precio y estado de la película
          const precioActual = calcularPrecio(peli.estreno, peli.precios);
          const badgeEstreno = esPeliculaNueva(peli.estreno)
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
          </div>


          <!-- Agregar boton del trailer -->
          <div class="d-grid gap-2">
              <button 
                class="btn btn-outline-danger btn-sm btn-ver-trailer" 
                data-trailer="${peli.trailer}"
                data-titulo="${peli.titulo}"
                data-id="${peli.id}">
                🎬 Ver Tráiler
              </button>
              <a href="pages/detalle.html?id=${peli.id}" class="btn btn-primary btn-sm">
                Ver más
              </a>
            </div>
        </div>
      </div>
    </div>`;
        });

        // Ocultar spinner y mostrar películas con animación
        $("#spinner-carga").fadeOut(500, function () {
          $("#lista-peliculas").html(html).hide().fadeIn(1000);
          // Event Listener para los botones de tráiler
          $(".btn-ver-trailer").on("click", function () {
            const trailer = $(this).data("trailer");
            const titulo = $(this).data("titulo");
            const id = $(this).data("id");

            console.log("🎬 Abriendo tráiler de:", titulo);

            // Actualizar contenido del modal
            $("#modalTrailerTitulo").text(`Tráiler: ${titulo}`);
            $("#modalTrailerVideo").attr("src", trailer);
            $("#modalTrailerVerMas").attr("href", `pages/detalle.html?id=${id}`);

            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('modalTrailer'));
            modal.show();

            // Limpiar video cuando se cierra el modal
            $("#modalTrailer").on("hidden.bs.modal", function () {
              $("#modalTrailerVideo").attr("src", "");
              console.log("✅ Modal cerrado, video limpiado");
            });
          });
        });
      },
      error: function (xhr, status, error) {
        // Ocultar spinner y mostrar error
        $("#spinner-carga").fadeOut(500, function () {
          $("#lista-peliculas").html(`
          <div class="col-12">
            <div class="alert alert-danger text-center" role="alert">
              No se pudo cargar la lista de películas. Intenta nuevamente más tarde.
            </div>
          </div>
        `).hide().fadeIn(500);
        });
      }
    });
  }, 5000); // 5000 milisegundos = 5 segundos
});
