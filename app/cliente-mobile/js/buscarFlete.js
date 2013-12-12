var modalSolicitud;
$(document).ready(function(){
  modalSolicitud = $('#modalSolicitud').html();
  validarUsuario();

});//Fin document ready 

  //Variables globales
  var nomU,
  idU,//Usuario conectado
  idChofer,
  posChof,
  latLongChofer,
  idSolicitud,
  chofOrd = new Array(),
  start = 0;

  function validarSolicitud(){
    $('#modalSolicitud').html(modalSolicitud);
  	if(localStorage.idCLienteBF){
      nomU = localStorage.usernameBF,
      idU = localStorage.idCLienteBF
      if ($('#end').val()){
        if (keyy) {
            buscarFlete();         
        }else{alert("Debes rutear tu ruta!");}  
      }else{alert("Ingrese un destino!");} 
    }else {alert("no registrado!");   }
  };
	//Funcion: iniciacion para busar fleteros, llenamos datos y conectamos al server
	function buscarFlete(){

    $('#fatalClose').unbind("click").click(function(){
    $('#modalSolicitud').modal('hide');     
    socket.disconnect();
    });

    socket.socket.reconnect();
    start = 0;
    var datos={"idUsuario" : idU,"origen" : $('#start').val(), "destino" : $('#end').val(), "cargar" : $('#slider-flip-C').val(), "descargar" : $('#slider-flip-D').val(), "comentario" : $('#textarea').val()};
		$('#modalSolicitud').modal({
		    show: true,
		    backdrop: false,
		    keyboard: false
		});		
    
    //Chofer finaliza la transaccion
    socket.on('finalizaFlete', function(data){
      $('#modalFin').modal({
        backdrop: false,
        keyboard: false,
        show: true
      });
      $('#btnFin').css('display','none');
      finalizarFlete(data,"Ha finalizado!",false);   
    });

		enviarSolicitud(datos);

  };// Fin funcion buscar flete

    //Funcion: Registramos solicitud en la bd
    function enviarSolicitud(datos){
      socket.emit("nuevaSolicitud", datos, function(data){
        if(data['estado']){
          idSolicitud = data['idSolicitud'];
          buscarFleteros();//Buscamos choferes de la bd
        }else{
          alert("Lo sentimos, nuestro sistema no esta disponible.")
        }        
      });
    };//fin funcion enviar solicitud
    
    //Funcion: Buscamos fleteros disponibles en la bd y ordenamos a mas cercanos      
    function buscarFleteros(){
      socket.emit("buscarFlete", idU, function(choferes){
        chofOrd = choferesCercanos(choferes);
        validarArray(start);
      });
    };//fin funcion Buscar Flete

    //Funcion: Valida si hay fleteros por mandar notificacion
    function validarArray(ptr){
      if(ptr == chofOrd.length){//si no quedan mas choferes le preguntamos si desea buscar nuevamente 
        $('#buscando').css('display','none');
        $('#nofletes').css('display','block');
        $('#opcionesDos').css('display','block');

        $('#nuevoDos').unbind("click").click(function(){
          $('#buscando').css('display','block');
          $('#nofletes').css('display','none');
          $('#opcionesDos').css('display','none');
            start = 0;
            chofOrd = new Array();
            buscarFleteros();            
        });
        
        $('#cerrarDos').unbind("click").click(function(){
          $('#modalSolicitud').modal('hide');
          socket.disconnect();
        });

      }else{enviarNotificacion(chofOrd[ptr]);}
    };
    
    //Funcion: Enviar notificacion al primero de la lista ordenada, luego al siguiente y esperamos su oferta.
    function enviarNotificacion(chofer){
      idChofer = chofer.idChofer
      socket.emit("enviarSolicitud", {"idSolicitud": idSolicitud, "idChofer": idChofer, "idUsuario": idU, "kms" : kms, "tiempo" : tiempo, "fotos": arrayPhotos}, function(data){
        //Respuesta del chofer             
        if(data['respuesta']){//chofer envio oferta
          $('#buscando').css('display','none');
          $('#datosSolicitud').css('display','block');
          $('#opciones').css('display','block'); //botones de opciones
          $('.progress-bar').css('width', '0%');
          $('.progress-bar').attr('aria-valuenow', 0).progressbar();
          //Usuario acepta el flete
          $('#acepto').unbind("click").click(function(){
            $('#datosSolicitud').css('display','none');
            $('#opciones').css('display','none');
            $('#gracias').css('display','block');
            acepto();
          });
                
          //Busca otro chofer (mandamos solicitud al siguiente de la lista ordenada)
          $('#nuevo').unbind("click").click(function(){                    
              $('#opciones').css('display','none');
              $('#datosSolicitud').css('display','none');
              $('#buscando').css('display','block');                           
              nuevo();
          });              
                
          //Usuario cierra la solicitud
          $('#cerrar').unbind("click").click(function(){                    
              $('#modalSolicitud').modal('hide');        
              cerrar();
          });

          //Mostramos informacion del chofer y el precio
          $('#flete').text(data['nombreChofer']);
          $('#precio').text(data['precio']);
          $('#posicion').text(data['posicion']);
          latLongChofer = data['latLong'];



        }else{//Un chofer rechazo y no envio oferta                 
          start+=1;
          validarArray(start);//Enviamos solicitud al siguiente chofer de la array.
        }
      });//fin emit solicitud
    };//fin funcion enviar notificacion

    function cerrar(){
      //$('#modalSolicitud').html(modalSolicitud);
      start = 0;
    	socket.emit("procesarSolicitud", {"estado": false});
    	socket.disconnect();
    }
    function nuevo(){
    	socket.emit("procesarSolicitud", {"estado": "nuevo"});
    	start+=1;validarArray(start);
    }
    function acepto(){
      $('#modalSolicitud').modal('hide');
    	socket.emit("procesarSolicitud", {"estado": true});
      //mostramos chofer en el mapa
      posicionChofer(latLongChofer);
    }

    function finalizarFlete(nombre, myText, key){
      $('#myTextFin').text(nombre+" "+myText);     
      $('#btnSend').unbind("click").click(function(){
        if ($('#rateit9').rateit('value')!=0) {
          removeMarker();
          socket.emit('ratingUser', {"tabla": "ratchofer", "idChofer": idChofer, "idUsuario": idU, "rating": $('#rateit9').rateit('value'), "comentario": $('#textareaRat').val()});
          if (key) {
            socket.emit("userEnd", {"id": idChofer, "user": true, "nombre": nomU});
          }
          $('#modalFin').modal('hide');
          mostrarSolicitudes();             
        }else {alert("Debes calificar al chofer!")}
      });      
    }

    function finFlete(){
      $('#modalFin').modal({
        show: true,
        backdrop: false,
        keyboard: false
      });
      //Usuario Finaliza transaccion flete      
      $('#btnFin').css('display', 'block');
      finalizarFlete(nomU,"estas finalizando el flete!", true);
    }

    function mostrarSolicitudes(){ 
      /*for (var i = 0; i < 5; i++) {
      $("#panel"+i+"").css('display','none');
    };*/
    console.log("Devolviendo solicitudes al usuario");     
      socket.emit('solicitudes', {"id":localStorage.idCLienteBF, "where": "usuario_fk", "campo": "chofer", "tabla": "chofer", "idUsuario": "idChofer"}, function(data){
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
          socket.socket.disconnect();             
        }
      });   
    }
