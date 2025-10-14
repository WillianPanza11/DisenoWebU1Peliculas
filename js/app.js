$(document).ready(function () {
    $.ajax({
      url: "data/peliculas.json",
      method: "GET",
      dataType: "json",
      success: function (peliculas) {
        let html = "";
        peliculas.forEach(function (peli) {
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
  