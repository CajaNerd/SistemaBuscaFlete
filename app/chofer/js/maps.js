			//Declaro variables globales//
			// variable geocoder, geocodificacion inversa, transforma Latitud y longitud en una direccion String
			var geocoder = new google.maps.Geocoder();
			// incializamos inforWindow...muestra informacion en un content
			var infoWindow = new google.maps.InfoWindow();
			// variables para datos de domicilio usuario
			var direccionMapa = document.querySelector('#start');//direccion de casa
			var direccionMapa = document.createElement('input');
			direccionMapa.id='start';
			direccionMapa.type='text';
			direccionMapa.disabled = 'true';
			direccionMapa.style.textAlign = 'center';
			direccionMapa.title = 'Tú posición';
			direccionMapa.className = 'form-control input-md';
			direccionMapa.index = 1 ;
			// Variable para guardar longitud y latitud
			var myLatlng;
			// declaracion de objeto mapa 
            var map = null;
			// Declaracion de variables para trazar ruta
			var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});//para obtener resultados
			var directionsService = new google.maps.DirectionsService();//solicitando api trazado de ruta
			var markersArray = [];
			//Creamos boton gps
			var botonGps = document.createElement('button');
			var imgGps= document.createElement('i');
			imgGps.className='glyphicon glyphicon-map-marker';
			botonGps.id='gps';
			botonGps.className = 'btn btn-default btn-sm';
			//botonGps.innerHTML = 'GPS';
			botonGps.appendChild(imgGps);
			//botonGps.onclick = geocalizando;
			botonGps.index = 1;
			//Creamos control personalizado
			/*var logo = document.createElement('img');
			logo.src = '../../img/camion2.png';
			logo.title = 'Arrastra el fondo para mejorar tu ubicación';
			logo.index=1;*/
			//Declaracion de Markers del mapa
			var icons ={
				chof: new google.maps.MarkerImage(
					// URL
					'img/chof.png',
					// (width,height)
					new google.maps.Size(71,72),
					// The origin point (x,y)
					new google.maps.Point(0,0),
					// The anchor point (x,y)
					new google.maps.Point(22,32)
					),
				start: new google.maps.MarkerImage(
					// URL
					'img/start.png',
					// (width,height)
					new google.maps.Size(48,48),
					// The origin point (x,y)
					new google.maps.Point(0,0),
					// The anchor point (x,y)
					new google.maps.Point(22,32)
					),
				end: new google.maps.MarkerImage(
					'img/end.png',
					new google.maps.Size(64,64),
					new google.maps.Point(0,0),
					new google.maps.Point(22,32)
					),
				user: new google.maps.MarkerImage(
					'img/user.png',
					new google.maps.Size(48,48),
					new google.maps.Point(0,0),
					new google.maps.Point(22,32)
					)			
			};
			var markerGeo;
			//--CARGAR MAPA--//
			///////////////////////////////
			//Funcion que inicia el sistema
			function load_map() {
			// Declarar Opciones de Mapa
			var myOptions = {
	        zoom: 16,
			mapTypeControl: false,
			panControl: false,
			zoomControlOptions: {style: google.maps.ZoomControlStyle.LARGE, position: google.maps.ControlPosition.LEFT_CENTER},
			streetViewControl: false,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	   		 };
			// Mostrar Mapa en Pantalla
			map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
			markerGeo = new google.maps.Marker({map: map, icon: icons.chof, title: "Tu posición", animation: google.maps.Animation.DROP});
			//PONEMOS CONTROLES EN EL MAPA!
			map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(botonGps);
			map.controls[google.maps.ControlPosition.TOP_CENTER].push(direccionMapa);
			//map.controls[google.maps.ControlPosition.CENTER].push(logo);
			/////HTML5 GEOCALIZAR AL USUARIO/////
			geocalizando();
			botonGps.onclick = function(){map.panTo(myLatlng); map.setZoom(16); nuevaPosicion()};
			///Evento click map, funcion para mostrar un cuadrado en el mapa con informacion con infoWindow
			//google.maps.event.addListener(marker, 'click', geocalizando);//
			//marker.bindTo('position', map, 'center');//mantiene marker en el centro
			//variables para trazar ruta
			}///FIN LOAD_MAP/////////////////
			////////////////////////////////
			
			//////////////////////////////////////
			/////FUNCION GEOLOCATION USARIO!//////
			function geocalizando(){
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
				myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);				
				markerGeo.setPosition(myLatlng);
				map.panTo(myLatlng);
				codeLatLng(myLatlng);//mostramos su direccion!
			}, function() {
				handleNoGeolocation(true);
			});	
			//watchPosition: nueva posicion del usuario
			navigator.geolocation.watchPosition(function(position){
				myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				markerGeo.setPosition(myLatlng);
				//USAMOS WEBSOCKET

			}, handleNoGeolocation(true),{enableHighAccuracy:true, maximumAge:30000, timeout:27000});

			} else {
			// Funcion de Excepcion si el browser no soporta geocalizacion
			handleNoGeolocation(false);
			}
			}///FIN GEOLOCATION////
			/////////////////////
			///Excepcion de GEOLOCATION en caso de ERROR.
			function handleNoGeolocation(errorFlag) {
			if (errorFlag) {
			var content = 'Error: El servicio de geolocalización fallo, verifica el estado de tu GPS y actualiza la aplicación';
			} else {
			var content = 'Error: Tu navegador no da soporte a la geolocalización.';
			}
			var options = {
			map: map,
			position: new google.maps.LatLng(60, 105),//en caso de error mostrar mapa en la posicion especificada
			content: content
			};
			infoWindow = new google.maps.InfoWindow(options);
			map.setCenter(options.position);
			}//fin funcion excepcion
			////////////////////////
					
			///////////////////////////////////////////
			//FUNCION REVERSE GEOLOCATION PARA MOSTRA DIRECCION ACTUAL DEL USUARIO
			function codeLatLng(pos) {
			//var infowindow = new google.maps.InfoWindow();
			var ll=""+pos; //pasamos latitud y longitud a string?
			var newPos = ll.substr(1, ll.length-2); //sacamos los parentesis
			var input = newPos; //pasamos longitud y latitud a la variable input -000,000
			var latlngStr = input.split(',', 2);//divido en las comas y guardo en 2 cadena
			var lat = parseFloat(latlngStr[0]);//obtengo la primera cadena
			var lng = parseFloat(latlngStr[1]);//obtengo la segunda cadena
			var latlng = new google.maps.LatLng(lat, lng);
			geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {				
				$('#start').val(results[0].address_components[1].long_name+" "+results[0].address_components[0].short_name);
				//direccion.setAttribute("value", results[0].address_components[1].long_name);//Direccion de la casa results[1].address_components[0].long_name (muestra con mas detalle)
				}else {alert('Ningún resultado encontrado');}
			}else {alert('Geocoder failed due to: ' + status);}
			});
			}//////FIN FUNCION REVERSE GEOLOCATION!
			/////////////////////////////////////////		
			

			//FUNCION TRAZAR RUTA
			function verRuta(solicitud,usuario){
    		var destDirec = solicitud.destino;
    		var waypts =[]
    		var myDirec = $('#start').val();
    		waypts.push({
    			location:solicitud.origen,
    			stopover:true
    		});
    		//datos para la solicitud
    		var request = {
        	origin: myDirec,
        	destination: destDirec,
        	waypoints: waypts,
        	travelMode: google.maps.DirectionsTravelMode['DRIVING'],
        	unitSystem: google.maps.DirectionsUnitSystem['METRIC'],
        	provideRouteAlternatives: false
    		};
		    //hacemos la solicitud a la API con lo que establecimos en request
		    directionsService.route(request, function(response, status) {
		    if (status == google.maps.DirectionsStatus.OK) {
		        directionsDisplay.setMap(map);
		        //directionsDisplay.setPanel($("#directions_panel").get(0));
				//$("#directions_panel").text("a "+response.routes[0].legs[0].distance.text+" y "+ response.routes[0].legs[0].duration.text + " Aprox.");
		        directionsDisplay.setDirections(response);
		        makeMarker(response.routes[0].legs[0].start_location, icons.start, "Tu punto de partida!", "Datos de partida",response.routes[0].legs[0].start_address);
				makeMarkerUser(response.routes[0].legs[0].end_location, icons.user, "Tu cliente esta aqui!. Haz click para ver información",usuario, solicitud);
				makeMarker(response.routes[0].legs[1].end_location, icons.end, "Aqui debes llegar!","Destino de descarga",response.routes[0].legs[1].end_address);
		    } else {alert("¡No existen rutas entre los puntos!");}
			});
		}
		//Funcion para crear Markers
		function makeMarker(position, icon, title, label, section){
			var contenido = '<b>'+label+'</b><br>'+section;
			var marker = new google.maps.Marker({
				position: position,
				map: map,
				icon: icon,
				title: title
			});
			markersArray.push(marker);
			new google.maps.event.addListener(marker, 'click', function() {
        		infoWindow.setContent(contenido); 
        		infoWindow.open(map,marker);
       		});

		}
		function makeMarkerUser(position, icon, title, usuario, solicitud){
			var contenido = '<b>Datos del cliente</b><br><span> Nombre: '+usuario.nombre+'</span><br><span> Correo: '+usuario.correo+'</span><br><span> Celular: '+usuario.celular+'</span><br><span><b>Datos de solicitud</b></span><br><span> Origen: '+solicitud.origen+'</span><br><span> Destino: '+solicitud.destino+'</span><br><span> Cargar: '+solicitud.cargar+' Descargar: '+solicitud.descargar+'<span><br><span>Comentario: '+solicitud.comentario+'</span><br><span>Distancia total: '+solicitud.kms+" y "+solicitud.tiempo+'</span><br><b>Precio: '+solicitud.precio+'</b>';
			var marker = new google.maps.Marker({
				position: position,
				map: map,
				icon: icon,
				title: title
			});
			markersArray.push(marker);
			new google.maps.event.addListener(marker, 'click', function() {
        		infoWindow.setContent(contenido); 
        		infoWindow.open(map,marker);
       		});

		}

		function clearMap(){
			directionsDisplay.setMap(null);
			for (var i = 0; i < markersArray.length; i++ ) {
    			markersArray[i].setMap(null);
  			}
  			markersArray = [];
  			map.panTo(myLatlng); 
			map.setZoom(16);
		}

		function myLatLng(){return myLatlng}


function nuevaPosicion(){
	if (localStorage.idChoferBF) {
		var ll=""+myLatlng; //pasamos latitud y longitud a string?
		var newPos = ll.substr(1, ll.length-2); //sacamos los parentesis
		var input = newPos; //pasamos longitud y latitud a la variable input -000,000
		var latlngStr = input.split(',', 2);//divido en las comas y guardo en 2 cadena
		var lat = parseFloat(latlngStr[0]);//obtengo la primera cadena
		var lng = parseFloat(latlngStr[1]);//obtengo la segunda cadena
		cliSocket.emit("nuevaPosicion", {'lat': lat, 'long': lng, 'idChofer': localStorage.idChoferBF});
	};

}

//////////////////////////////
///CARGAMOS EL MAPA EN LA WEB!		
google.maps.event.addDomListener(window, 'load', load_map);

		
	