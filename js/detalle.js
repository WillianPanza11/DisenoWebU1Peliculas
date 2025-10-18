// ========== FUNCIONES AUXILIARES ==========

// Verificar si una película es estreno
function esPeliculaNueva(fechaEstreno) {
  if (!fechaEstreno) return false;
  
  const partes = fechaEstreno.split('-');
  const año = parseInt(partes[0]);
  const mes = parseInt(partes[1]) - 1;
  const dia = parseInt(partes[2]);
  
  const estreno = new Date(año, mes, dia);
  const hoy = new Date();
  
  hoy.setHours(0, 0, 0, 0);
  estreno.setHours(0, 0, 0, 0);
  
  const diferenciaMs = hoy.getTime() - estreno.getTime();
  const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
  
  return diferenciaDias >= 0 && diferenciaDias < 30;
}

// Calcular precio actual
function calcularPrecio(fechaEstreno, precios) {
  if (!precios || typeof precios !== 'object') {
    return 8.00;
  }
  
  if (precios.estrenos === undefined || precios.normal === undefined) {
    return precios.normal || precios.estrenos || 8.00;
  }
  
  return esPeliculaNueva(fechaEstreno) ? precios.estrenos : precios.normal;
}

// Generar badges de géneros
function generarBadgesGeneros(generos) {
  if (!Array.isArray(generos) || generos.length === 0) {
    return '<span class="badge bg-secondary me-1">Sin género</span>';
  }
  return generos.map(genero => 
    `<span class="badge bg-secondary me-1">${genero}</span>`
  ).join('');
}

// ⭐ NUEVA FUNCIÓN: Generar estrellas según calificación
function generarEstrellas(calificacion) {
  let estrellas = '';
  
  // Estrellas llenas
  for (let i = 1; i <= 5; i++) {
    if (i <= calificacion) {
      estrellas += '<span class="estrella-llena"></span>';
    } else {
      estrellas += '<span class="estrella-vacia"></span>';
    }
  }
  
  return `<span class="estrellas">${estrellas}</span>`;
}

// Cargar reseñas de la película
function cargarResenas(peliculaId) {
  
  $.ajax({
    url: "../data/resenas.json",
    method: "GET",
    dataType: "json",
    success: function(todasResenas) {
      
      // Filtrar reseñas de esta película
      const resenasDeEstaPelicula = todasResenas.filter(r => r.peliculaId == peliculaId);
            
      // Ocultar spinner
      $("#spinner-resenas").hide();
      
      if (resenasDeEstaPelicula.length === 0) {
        $("#sin-resenas").show();
        return;
      }
      
      // Generar HTML de reseñas
      let html = '<div class="row">';
      
      resenasDeEstaPelicula.forEach(function(resena) {
        html += `
          <div class="col-md-6 mb-3">
            <div class="card resena-card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="card-subtitle mb-0">
                    <strong>${resena.autor}</strong>
                  </h6>
                  <small class="text-muted">${formatearFecha(resena.fecha)}</small>
                </div>
                
                <div class="mb-2">
                  ${generarEstrellas(resena.calificacion)}
                  <span class="ms-2 text-muted">(${resena.calificacion}/5)</span>
                </div>
                
                <p class="card-text">${resena.comentario}</p>
              </div>
            </div>
          </div>`;
      });
      
      html += '</div>';
      
      // Mostrar reseñas
      $("#lista-resenas").html(html);
      
      // Calcular promedio de calificaciones
      const promedio = resenasDeEstaPelicula.reduce((sum, r) => sum + r.calificacion, 0) / resenasDeEstaPelicula.length;
      
      // Agregar promedio en el header
      $(".card-header h4").html(`
        ⭐ Reseñas de Usuarios 
        <span class="badge bg-warning text-dark ms-2">
          ${promedio.toFixed(1)} / 5.0
        </span>
        <small class="text-muted">(${resenasDeEstaPelicula.length} reseñas)</small>
      `);
      
    },
    error: function(xhr, status, error) {
      $("#spinner-resenas").hide();
      $("#lista-resenas").html(`
        <div class="alert alert-danger">
          No se pudieron cargar las reseñas. Por favor, intenta más tarde.
        </div>
      `);
    }
  });
}

// Función para formatear fecha
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return fecha.toLocaleDateString('es-ES', opciones);
}

// ========== FIN FUNCIONES AUXILIARES ==========

// Cargar película al iniciar
$(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  
  $.ajax({
    url: "../data/peliculas.json",
    method: "GET",
    dataType: "json",
    success: function (peliculas) {
      const peli = peliculas.find((p) => p.id == id);
      
      if (peli) {

        const precioActual = calcularPrecio(peli.estreno, peli.precios);
        const badgeEstreno = esPeliculaNueva(peli.estreno)
          ? '<span class="badge bg-danger">🔥 ESTRENO</span>'
          : '<span class="badge bg-success">En Cartelera</span>';

        $("#titulo").text(peli.titulo);
        $("#poster").attr("src", "../img/" + peli.imagen);
        $("#sinopsis").text(peli.sinopsis);
        $("#trailer").attr("src", peli.trailer);
        
        // Actualizar la alerta con el precio y estado
        $(".alert-info").html(`
          ${badgeEstreno} 
          <strong>Precio: $${precioActual.toFixed(2)}</strong> - 
          ¡Disfruta del tráiler oficial y conoce más sobre esta película!
        `);

        // Mostrar géneros
        $("#genero").html(generarBadgesGeneros(peli.generos));
        
        // CARGAR RESEÑAS
        cargarResenas(peli.id);
        
      } else {
        mostrarError();
      }
    },
    error: function () {
      mostrarError();
    },
  });

  function mostrarError() {
    $(".container").html(`
      <div class="alert alert-danger text-center" role="alert">
        <i class="bi bi-exclamation-triangle"></i>
        No se pudo cargar la información de la película.
      </div>
      <div class="text-center">
        <a href="../index.html" class="btn btn-secondary mt-3">Volver al inicio</a>
      </div>
    `);
  }
});