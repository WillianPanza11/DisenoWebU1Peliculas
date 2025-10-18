// Variables globales
let peliculasDisponibles = [];
let preciosPorDia = {};

// Cargar películas al iniciar
$(document).ready(function() {
  cargarPeliculas();
  
  // Event listeners
  $('#dias-renta').on('input', actualizarResumen);
  $('#form-renta').on('submit', procesarRenta);
});

// Función para cargar películas desde JSON
function cargarPeliculas() {
  $.ajax({
    url: "../data/peliculas.json",
    method: "GET",
    dataType: "json",
    success: function(peliculas) {
      console.log("✅ Películas cargadas para renta:", peliculas.length);
      peliculasDisponibles = peliculas;
      
      // Ocultar spinner
      $("#spinner-peliculas").hide();
      
      // Generar checkboxes de películas
      let html = "";
      
      peliculas.forEach(function(peli) {
        // Guardar el precio normal para cálculos
        preciosPorDia[peli.id] = peli.precios.normal;
        
        html += `
          <div class="col-md-6 mb-3">
            <div class="card h-100 pelicula-card">
              <div class="card-body">
                <div class="form-check">
                  <input 
                    class="form-check-input pelicula-checkbox" 
                    type="checkbox" 
                    value="${peli.id}" 
                    id="peli-${peli.id}"
                    data-titulo="${peli.titulo}"
                    data-precio="${peli.precios.normal}">
                  <label class="form-check-label d-flex align-items-start" for="peli-${peli.id}">
                    <img src="../img/${peli.imagen}" alt="${peli.titulo}" 
                         class="img-thumbnail me-3" style="width: 80px; height: 120px; object-fit: cover;">
                    <div>
                      <h6 class="mb-1">${peli.titulo}</h6>
                      <small class="text-muted">${peli.generos.join(', ')}</small>
                      <p class="mb-0 mt-2"><strong class="text-success">$${peli.precios.normal.toFixed(2)}/día</strong></p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>`;
      });
      
      $("#lista-peliculas-renta").html(html);
      
      // Event listener para actualizar resumen al seleccionar películas
      $('.pelicula-checkbox').on('change', actualizarResumen);
      
    },
    error: function(xhr, status, error) {
      console.error("❌ Error al cargar películas:", error);
      $("#spinner-peliculas").html(`
        <div class="alert alert-danger">
          No se pudieron cargar las películas. Por favor, recarga la página.
        </div>
      `);
    }
  });
}

// Función para actualizar el resumen en tiempo real
function actualizarResumen() {
  const peliculasSeleccionadas = $('.pelicula-checkbox:checked');
  const dias = parseInt($('#dias-renta').val()) || 1;
  
  let total = 0;
  let cantidad = peliculasSeleccionadas.length;
  
  peliculasSeleccionadas.each(function() {
    const precio = parseFloat($(this).data('precio'));
    total += precio * dias;
  });
  
  // Actualizar UI
  $('#resumen-cantidad').text(cantidad);
  $('#resumen-dias').text(dias);
  $('#resumen-total').text(total.toFixed(2));
  
  // Cambiar color si no hay películas seleccionadas
  if (cantidad === 0) {
    $('#resumen-total').parent().removeClass('text-danger').addClass('text-muted');
  } else {
    $('#resumen-total').parent().removeClass('text-muted').addClass('text-danger');
  }
}

// Función para procesar la renta
function procesarRenta(e) {
  e.preventDefault();
  
  // Validar que haya al menos una película seleccionada
  const peliculasSeleccionadas = $('.pelicula-checkbox:checked');
  
  if (peliculasSeleccionadas.length === 0) {
    $('#error-peliculas').show();
    $('html, body').animate({
      scrollTop: $('#lista-peliculas-renta').offset().top - 100
    }, 500);
    return false;
  }
  
  $('#error-peliculas').hide();
  
  // Recopilar datos del formulario
  const nombreCliente = $('#nombre-cliente').val();
  const emailCliente = $('#email-cliente').val();
  const telefonoCliente = $('#telefono-cliente').val();
  const dias = parseInt($('#dias-renta').val());
  const formaPago = $('#forma-pago').val();
  
  // Recopilar películas seleccionadas
  let peliculasRentadas = [];
  let total = 0;
  
  peliculasSeleccionadas.each(function() {
    const titulo = $(this).data('titulo');
    const precio = parseFloat($(this).data('precio'));
    const subtotal = precio * dias;
    
    peliculasRentadas.push({
      titulo: titulo,
      precioDia: precio,
      subtotal: subtotal
    });
    
    total += subtotal;
  });
  
  // Llenar el modal con los datos
  $('#modal-cliente').text(nombreCliente);
  $('#modal-email').text(emailCliente);
  $('#modal-telefono').text(telefonoCliente);
  $('#modal-dias').text(dias + (dias === 1 ? ' día' : ' días'));
  $('#modal-pago').text(formaPago);
  $('#modal-total').text(total.toFixed(2));
  
  // Generar lista de películas en el modal
  let listaPeliculas = '';
  peliculasRentadas.forEach(function(peli) {
    listaPeliculas += `
      <li>
        <strong>${peli.titulo}</strong> - 
        $${peli.precioDia.toFixed(2)}/día × ${dias} días = 
        <strong class="text-success">$${peli.subtotal.toFixed(2)}</strong>
      </li>`;
  });
  $('#modal-peliculas').html(listaPeliculas);
  
  // Mostrar el modal
  const modal = new bootstrap.Modal(document.getElementById('modal-confirmacion'));
  modal.show();
  
  // Limpiar formulario (opcional)
  // $('#form-renta')[0].reset();
  // $('.pelicula-checkbox').prop('checked', false);
  // actualizarResumen();
  
  console.log("✅ Renta procesada:", {
    cliente: nombreCliente,
    peliculas: peliculasRentadas,
    dias: dias,
    total: total
  });
}