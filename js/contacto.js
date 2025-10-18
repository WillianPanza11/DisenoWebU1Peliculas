$(document).ready(function() {
  
  // ========== CONTADOR DE CARACTERES EN TIEMPO REAL ==========
  $('#mensaje').on('input', function() {
    const longitud = $(this).val().length;
    $('#contador-caracteres').text(longitud);
    
    // Cambiar color según longitud
    if (longitud < 20) {
      $('#contador-caracteres').removeClass('text-success text-warning').addClass('text-danger');
    } else if (longitud >= 20 && longitud <= 50) {
      $('#contador-caracteres').removeClass('text-danger text-warning').addClass('text-success');
    } else {
      $('#contador-caracteres').removeClass('text-danger text-success').addClass('text-warning');
    }
  });
  
  // ========== VALIDACIÓN EN TIEMPO REAL (opcional) ==========
  // Validar nombre mientras escribe
  $('#nombre').on('blur', function() {
    validarNombre();
  });
  
  // Validar email mientras escribe
  $('#correo').on('blur', function() {
    validarEmail();
  });
  
  // Validar mensaje mientras escribe
  $('#mensaje').on('blur', function() {
    validarMensaje();
  });
  
  // ========== VALIDACIÓN AL ENVIAR ==========
  $('#form-contacto').on('submit', function(e) {
    e.preventDefault();
    
    
    // Limpiar alertas previas
    $('#alerta').hide();
    
    // Validar todos los campos
    const nombreValido = validarNombre();
    const emailValido = validarEmail();
    const mensajeValido = validarMensaje();
    
    // Si todos son válidos
    if (nombreValido && emailValido && mensajeValido) {
      
      // Mostrar mensaje de éxito
      $('#alerta').fadeIn();
      
      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        $('#form-contacto')[0].reset();
        $('#contador-caracteres').text('0');
        $('#alerta').fadeOut();
        
        // Limpiar clases de validación
        $('.form-control').removeClass('is-valid is-invalid');
        $('.error-message').removeClass('show');
      }, 3000);
      
    } else {
      
      // Hacer scroll al primer error
      const primerError = $('.form-control.is-invalid').first();
      if (primerError.length) {
        $('html, body').animate({
          scrollTop: primerError.offset().top - 100
        }, 500);
      }
    }
  });
  
  // ========== FUNCIONES DE VALIDACIÓN ==========
  
  function validarNombre() {
    const nombre = $('#nombre').val().trim();
    const campo = $('#nombre');
    const error = $('#error-nombre');
    
    // Campo vacío
    if (nombre === '') {
      mostrarError(campo, error, '⚠️ El nombre es obligatorio');
      return false;
    }
    
    // Muy corto
    if (nombre.length < 3) {
      mostrarError(campo, error, '⚠️ El nombre debe tener al menos 3 caracteres');
      return false;
    }
    
    // Validar que solo contenga letras y espacios
    if (!/^[a-záéíóúñ\s]+$/i.test(nombre)) {
      mostrarError(campo, error, '⚠️ El nombre solo debe contener letras');
      return false;
    }
    
    // Todo OK
    mostrarExito(campo, error);
    return true;
  }
  
  function validarEmail() {
    const email = $('#correo').val().trim();
    const campo = $('#correo');
    const error = $('#error-correo');
    
    // Campo vacío
    if (email === '') {
      mostrarError(campo, error, '⚠️ El correo electrónico es obligatorio');
      return false;
    }
    
    // Validar formato de email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      mostrarError(campo, error, '⚠️ Ingresa un correo electrónico válido');
      return false;
    }
    
    // Todo OK
    mostrarExito(campo, error);
    return true;
  }
  
  function validarMensaje() {
    const mensaje = $('#mensaje').val().trim();
    const campo = $('#mensaje');
    const error = $('#error-mensaje');
    const longitud = mensaje.length;
    
    // Campo vacío
    if (mensaje === '') {
      mostrarError(campo, error, '⚠️ El mensaje es obligatorio');
      return false;
    }
    
    // ⭐ VALIDACIÓN CRÍTICA: Entre 20 y 50 caracteres
    if (longitud < 20) {
      mostrarError(campo, error, `⚠️ El mensaje debe tener al menos 20 caracteres (tienes ${longitud})`);
      return false;
    }
    
    if (longitud > 50) {
      mostrarError(campo, error, `⚠️ El mensaje no puede exceder 50 caracteres (tienes ${longitud})`);
      return false;
    }
    
    // Todo OK
    mostrarExito(campo, error);
    return true;
  }
  
  // ========== FUNCIONES AUXILIARES ==========
  
  function mostrarError(campo, errorDiv, mensaje) {
    campo.removeClass('is-valid').addClass('is-invalid');
    errorDiv.text(mensaje).addClass('show');
  }
  
  function mostrarExito(campo, errorDiv) {
    campo.removeClass('is-invalid').addClass('is-valid');
    errorDiv.removeClass('show');
  }
  
});