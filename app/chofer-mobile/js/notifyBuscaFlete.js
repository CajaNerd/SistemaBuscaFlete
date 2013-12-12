//Conectamos al servidor node
var cliSocket = io.connect('http://localhost:8000',{
  'auto connect': false
});

$(document).ready(function(){
  if (localStorage.idChoferBF) {
    cliSocket.socket.reconnect();
    ingresarSistema();
  }else{
    $('#modalLogin').popup({
      show:true,
      backdrop:false,
      keyboard:false
    });
  }
});//fin document ready

function ingresarSistema(){
  cliSocket.emit('idChofer', {idChofer: localStorage.idChoferBF, estado: 1}, function(datos){});
  mostrarSolicitudes();
  $('#miNombre').text(localStorage.nombreChoferBF);
  var formNotify;
  var idChofer = localStorage.idChoferBF;
  var nomChofer = localStorage.nombreChoferBF;
  var idUsuario;
  $('#status').text("Conectado");

  //Boton cerrarSession
  $('#cerrarSesion').unbind("click").click(function(){
    cerrarSesion();
  });
  //Boton terminar trans
  $('#btnTrans').unbind("click").click(function(){
    finalizarTransaccion(nomChofer,"estas finalizando el flete!");
  });
  //Obtenemos rating del chofer
  cliSocket.emit('getRating',{"tabla": "ratchofer", "id": idChofer}, function(data){
    if (data) {
    $('#rateit10').rateit('value',data)
    }else{$('#rateit10').rateit('value',0)}
  });

  //Espera de una nueva solicitud
  cliSocket.on('nuevaSolicitud', function (data, callback) {
    formNotify = $('#notificacion').html();
    //Nueva solicitud
    verSolicitud(data);  
    //Si termina el progresBar rechazamos
    $('.progress-bar').progressbar({
      update: function(current_percentage) {
              $('#potje').html(current_percentage);},
      done: function(){
        /*callback({"respuesta": false});*/
        //cerrarSolicitud(1000);
      }
    });
    //Si rechaza devolvemos false
    $('#rechazar').unbind("click").click(function(){
      callback({"respuesta": false});
      cerrarSolicitud(1000);
    });
     //Si acepta devolvemos true
    $('#aceptar').unbind("click").click(function(){
      if ($('#precio').val()) {
        var latlng = myLatLng();
        callback({"respuesta": true, "precio": $('#precio').val(), "posicion": $('#start').val(), "nombreChofer": nomChofer, "latLong": latlng});
        //Esperamos respuesta del cliente
        esperarRespuesta();
      }else{alert("Debes fijar un precio.")}
    });

    cliSocket.on('procesarDecision',function(respuesta){
      //recibimos respuesta del usuario
      if(respuesta['estado'] == true)
      {
        idUsuario = respuesta['idUsuario'];
        aceptaOferta();
        //Iniciamos traslado de datos
        execSolicitud(data, $('#precio').val());
      }
      else rechazaOferta();
    });
  });
  
  //Si usuario finaliza el flete
  cliSocket.on('finalizaFlete', function(data){
    $('#modalFin').modal({
      backdrop: false,
      keyboard: false,
      show: true
    });
    $('#btnTrans').css('display','none');
    $('#cerrarSesion').css('display','block');
    finalizarTransaccionUser(data,"Ha finalizado!");   
  });


  function verSolicitud(data){
      //Mostramos ventana notificacion
      $('#notificacion').modal({
      backdrop: false,
      keyboard: false,
      show: true
      });
      //Llenamos campos:
      //$('#fotos').val("aca las fotos");
      verFotos(data.fotos);
      $('#origen').text(data.origen);
      $('#destino').text(data.destino);
      $('#kms').text(data.kms);
      $('#tiempo').text(data.tiempo);
      $('#cargar').text(data.cargar);
      $('#descargar').text(data.descargar);
      $('#comentario').text(data.comentario);
  };

  function cerrarSolicitud(tme)
  {
      setTimeout(function(){
        $('#notificacion').modal('hide');
        $('#notificacion').html(formNotify);
      }, tme);
     //Reseteamos ventana notificacion
  };

    function esperarRespuesta(){
      //$('.progress-bar').attr('aria-valuetransitiongoal',0);      
      $('#aceptar').attr('disabled',true);
      $('#rechazar').attr('disabled',true);
      $('#myAlert').toggleClass('alert-danger alert-success');
      $('#alerText').replaceWith('<div id="alerText"><strong>Esperando!</strong> respuesta del cliente <strong id="potje2"></strong>%.</div>');
      $('#barTime').remove();
      $('#loading').prepend('<div id="barTime" class="progress-bar progress-bar-success cli-sec-ease-in-out" aria-valuetransitiongoal="100"></div>');
      $('#loading').toggleClass('right left');
      $('#barTime').progressbar({
        update: function(current_percentage) {
                $('#potje2').html(current_percentage);}
        });
    };

    function aceptaOferta(){
      $('#myAlert').toggleClass('alert-success alert-info');
      $('#alerText').replaceWith('<div id="alerText"><strong>Aceptado!</strong> usuario acepto su oferta.</div>');
      $('#barTime').css('width','10%');
      cerrarSolicitud(4000);
    }

    function rechazaOferta()
    {
      $('#myAlert').toggleClass('alert-success alert-danger');
      $('#alerText').replaceWith('<div id="alerText"><strong>Lo sentimos!</strong> usuario rechazo su oferta.</div>');
      $('#barTime').css('width','15%');
      cerrarSolicitud(3000);
    }

    function execSolicitud(data, valor){
      $('#cerrarSesion').css('display','none');
      var usuario = {
        nombre: data.usuario,
        celular: data.telefono,
        correo: data.correo
      };
      var solicitud = {
        origen: data.origen,
        destino: data.destino,
        cargar: data.cargar,
        descargar: data.descargar,
        comentario: data.comentario,
        precio: valor,
        kms: data.kms,
        tiempo: data.tiempo
      };
      //mandamos datos para poner en el marker
      verRuta(solicitud, usuario);
      $('#btnTrans').css("display", "block");
      $("#progressTrans").css("display","block");
      $('#status').text("Ocupado");
      $("#status").css("color","orange");
    }

  function finalizarTransaccion(nombre,myText){
    $('#modalFin').modal({
      backdrop: false,
      keyboard: false,
      show: true
    });
    $('#btnFin').css('display', 'block');
    $('#myTextFin').text(nombre+" "+myText);
    $('#btnSend').unbind("click").click(function(){
      if ($('#rateit9').rateit('value')!=0) {
        emitirFinalizacion();    
        enviarRating();
        cliSocket.emit('estadoChofer', {idChofer: idChofer, estado: 1}, function(data){
          setTimeout(function(){
            $('#cerrarSesion').css('display','block');
            $('#btnTrans').css('display','none');  
            $("#status").css("color","green");
            $('#status').text("Conectado");
            //restaurar mapa y bar
            clearMap();
            $("#progressTrans").css("display","none");
            //mostramos modal de calificacion
          }, 3000);          
        });
        $('#modalFin').modal('hide');
        mostrarSolicitudes();
      }else {alert("Debes calificar al usuario.")}
    });
  }
   function finalizarTransaccionUser(nombre,myText){
    $('#btnFin').css('display', 'none');
    $('#myTextFin').text(nombre+" "+myText);
    $('#btnSend').unbind("click").click(function(){
      if ($('#rateit9').rateit('value')!=0) {
          enviarRating();          
          cliSocket.emit('estadoChofer', {idChofer: idChofer, estado: 1}, function(data){
            setTimeout(function(){
              $("#status").css("color","green");
              $('#status').text("Conectado");
              //restaurar mapa y bar
              clearMap();
              $("#progressTrans").css("display","none");
              //mostramos modal de calificacion
            }, 3000);        
          });
          $('#modalFin').modal('hide');
          mostrarSolicitudes();
        }else{alert("Debes calificar al usuario.")}
    });
  }

  //Funcion: emitir finalizacion del fletero al usuario
  function emitirFinalizacion(){
    cliSocket.emit("userEnd", {"id": idUsuario, "user": false, "nombre": nomChofer});
  }
  function enviarRating(){
    cliSocket.emit('ratingUser', {"tabla": "ratusuario", "idChofer": idChofer, "idUsuario": idUsuario, "rating": $('#rateit9').rateit('value'), "comentario": $('#textareaRat').val()});
    setTimeout(function(){
      idUsuario = '';
    }, 2000);
  }

  function verFotos(fotos){
    for (var i = 0; i < fotos.length; i++) {
      $('#imagenes').append('<img src="' + fotos[i] + '"/>');
    };  
  }

  function mostrarSolicitudes(){
    for (var i = 0; i < 5; i++) {
      $("#panel"+i+"").css('display','none');
    };
    cliSocket.emit('solicitudes', {"id":localStorage.idChoferBF, "where": "chofer_fk", "campo": "usuario", "tabla": "usuario", "idUsuario": "idUsuario"}, function(data){
        if (data) {
          $('#solicitudes').css('display','block');
          $('#noSendSolicitud').css('display','none');
          for (var i = 0; i < data.length; i++) {
            //mostramos solicitudes
            $("#myId"+i+"").text(data[i].idSolicitud);
            $("#miChofer"+i+"").text(data[i].nombre);
            $("#miOrigen"+i+"").text(data[i].origen);
            $("#miDestino"+i+"").text(data[i].destino);
            $("#miCargar"+i+"").text(data[i].cargar);
            $("#miDescargar"+i+"").text(data[i].descargar);
            $("#miPrecio"+i+"").text(data[i].precio);
            $("#miFecha"+i+"").text(data[i].fecha);
            $("#panel"+i+"").css('display','block');
          };
        }
      });   
  }
}

function iniciarSesion(){
    cliSocket.socket.reconnect();
    $('#btnIni').button("loading");
    cliSocket.emit('loginChofer', {"correo":document.getElementById('correoChofer').value, "pass":document.getElementById('passwordChofer').value}, function(data){
      if(data==0){
          document.getElementById('errorLogin').innerHTML = 'Usuario y/o contraseña inválidos';
          cliSocket.disconnect();
      }else{
        //Estado chofer a 1        
          $('#modalLogin').modal('hide');
          localStorage.nombreChoferBF= data.nombre;
          localStorage.idChoferBF= data.idChofer;            
          ingresarSistema();     
      }
      $('#btnIni').button("reset");
  });
}

function cerrarSesion(){
  //Modificamos al chofer como no disponible
  $('#cerrarSesion').button("loading");
  cliSocket.emit('estadoChofer', {idChofer:localStorage.idChoferBF, estado: 0}, function(data){
    if(data){            
      //Desconectamos del servidor
      cliSocket.disconnect(); 
      localStorage.nombreChoferBF= '';
      localStorage.idChoferBF= '';           
      $('#miNombre').text("No usuario");
      $('#status').text("");
      $('#modalLogin').modal({
        show:true,
        backdrop:false,
        keyboard:false
      });
      $('#cerrarSesion').button("reset");
    }else{
      //alert("ERROR MYSQL: Por favor intentelo denuevo");
      $('#cerrarSesion').button("reset");
    }
  });
}
