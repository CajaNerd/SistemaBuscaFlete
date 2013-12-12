		//--Declaro variables globales--//
			// variable geocoder, geocodificacion inversa, transforma Latitud y longitud en una direccion String
			var geocoder = new google.maps.Geocoder();
			// incializamos inforWindow...muestra informacion en un content
			var infoWindow = new google.maps.InfoWindow();
			// Icono chofer
			var icons ={
				chof: new google.maps.MarkerImage(
					// URL
					'img/camion2.png',
					// (width,height)
					new google.maps.Size(71,72),
					// The origin point (x,y)
					new google.maps.Point(0,0),
					// The anchor point (x,y)
					new google.maps.Point(22,32)
					)
			};
			var keyy;//variable para buscarflete
			//tiempo estimado
			var kms,tiempo;
			//Marker chofer
			var markerChof;
			var direccion = $('#start').val();
			// Variable para guardar longitud y latitud
			var myLatlng;
			// declaracion de objeto mapa 
            var map = null;
			// Declaracion de variables para trazar ruta
			var directionsDisplay = null;//solicitud a la api
			var directionsService = null;//mostrar lo obtenido
			//Creamos boton gps
			var botonGps = document.createElement('button');
			var imgGps= document.createElement('i');
			imgGps.className='glyphicon glyphicon-map-marker';
			botonGps.id='gps';
			botonGps.className = 'btn btn-default btn-sm';
			//botonGps.innerHTML = 'GPS';
			botonGps.appendChild(imgGps);
			botonGps.onclick = geocalizando;
			botonGps.index = 1;
			//CREAMOS MARKER PERSONALIZADO
			var logo = document.createElement('img');
			logo.src = 'img/icononoback.svg';
			logo.title = 'Arrastra el fondo para mejorar tu ubicación';
			logo.index=1;
			var autocomplete;
			//--CARGAR MAPA-->
			///////////////////////////////
			//Funcion que inicia el sistema
			function load_map() {
			// Declarar Opciones de Mapa
			var myOptions = {
	        zoom: 15,
			mapTypeControl: false,
			panControl: false,
			zoomControlOptions: {style: google.maps.ZoomControlStyle.LARGE, position: google.maps.ControlPosition.LEFT_CENTER},
			streetViewControl: false,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	   		 };
			// Mostrar Mapa en Pantalla
			map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
			//Direccion autocomplete
			var inputOrigen = /** @type {HTMLInputElement} */(document.getElementById('start'));
  			var options = {
  				componentRestrictions: {country: 'cl'}
  			}
  			var autocomplete = new google.maps.places.Autocomplete(inputOrigen,options);
  			autocomplete.bindTo('bounds', map);
  			google.maps.event.addListener(autocomplete, 'place_changed', function() {
			    var place = autocomplete.getPlace();
			    if (!place.geometry) {
			      	// Inform the user that the place was not found and return.
			    	//inputOrigen.text = 'notfound';
			      return;
			    }
			    if (place.geometry.viewport) {
			    	map.fitBounds(place.geometry.viewport);
			    } else {
			      	map.setCenter(place.geometry.location);
			      	map.setZoom(17);  // Why 17? Because it looks good.
			    }
			    var address = '';
			    if (place.address_components) {
			      address = [
			        (place.address_components[0] && place.address_components[0].short_name || ''),
			        (place.address_components[1] && place.address_components[1].short_name || ''),
			        (place.address_components[2] && place.address_components[2].short_name || '')
			      ].join(' ');
			    }
			 });
  			var inputDestino = (document.getElementById('end'));
  			var autocompleteDest = new google.maps.places.Autocomplete(inputDestino,options);
			//asignamos el mapa al marcador
			//marker.setMap(map);
			//PONEMOS EL BOTON EN EL MAPA!
			map.controls[google.maps.ControlPosition.RIGHT_TOP].push(botonGps);
			map.controls[google.maps.ControlPosition.CENTER].push(logo);
			/////HTML5 GEOCALIZAR AL USUARIO/////
			geocalizando();
			///Evento click map, funcion para mostrar un cuadrado en el mapa con informacion con infoWindow
			google.maps.event.addListener(map, 'click', findAddress);//funcion findAdress
			google.maps.event.addListener(map, 'dragend', findAddressDragend);
			//google.maps.event.addListener(marker, 'click', geocalizando);//
			//marker.bindTo('position', map, 'center');//mantiene marker en el centro
			//variables para trazar ruta
			directionsDisplay = new google.maps.DirectionsRenderer();//para obtener resultados
			directionsService = new google.maps.DirectionsService();//solicitando api trazado de ruta
			}///FIN LOAD_MAP/////////////////
			////////////////////////////////

			//////////////////////////////
			///CARGAMOS EL MAPA EN LA WEB!		
			google.maps.event.addDomListener(window, 'load', load_map);
			
			//////////////////////////////////////
			/////FUNCION GEOLOCATION USARIO!//////
			function geocalizando(){
			if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
			myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			map.panTo(myLatlng);
			map.setZoom(15);
			codeLatLng(myLatlng);//mostramos su direccion!
			}, function() {
			handleNoGeolocation(true);
			});	
			} else {
			// Funcion de Excepcion si el browser no soporta geocalizacion
			handleNoGeolocation(false);
			}
			}///FIN GEOLOCATION////
			/////////////////////
			///Excepcion de GEOLOCATION en caso de ERROR.
			function handleNoGeolocation(errorFlag) {
			if (errorFlag) {
			var content = 'Error: The Geolocation service failed.';
			} else {
			var content = 'Error: Your browser doesn\'t support geolocation.';
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
				if (results[1]) {
					$('#start').val(results[0].address_components[1].long_name+' '+results[0].address_components[0].short_name);
				}else {alert('No results found');}
			}else {alert('Geocoder failed due to: ' + status);}
			});
			}//////FIN FUNCION REVERSE GEOLOCATION!
			/////////////////////////////////////////

			///FUNCIONes para Obtener Direccion, Para mostrar en inputs
			function findAddress(event) {
			geocoder.geocode({latLng: event.latLng}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0]) {
						$('#start').val(results[0].address_components[1].long_name+' '+results[0].address_components[0].short_name);
					map.panTo(event.latLng);
					}
				}	
			});
			}function findAddressDragend() {
			geocoder.geocode({latLng: map.getCenter()}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0]) {
						$('#start').val(results[0].address_components[1].long_name+' '+results[0].address_components[0].short_name);
					}
				}	
			});
			}///FIN funcion findAddress
			//////////////////////////////
			
			//FUNCION TRAZAR RUTA
			function verRuta(){
    		//datos para la solicitud
    		var request = {
        	origin: $('#start').val(),
        	destination: $('#end').val(),
        	travelMode: google.maps.DirectionsTravelMode['DRIVING'],
        	unitSystem: google.maps.DirectionsUnitSystem['METRIC'],
        	provideRouteAlternatives: false
    		};
		    //hacemos la solicitud a la API con lo que establecimos en request
		    directionsService.route(request, function(response, status) {
		    if (status == google.maps.DirectionsStatus.OK) {
		        directionsDisplay.setMap(map);
		        //directionsDisplay.setPanel($("#directions_panel").get(0));
				$("#directions_panel").text(" "+ response.routes[0].legs[0].duration.text + " Aproximadamente.");
		        kms= response.routes[0].legs[0].distance.text;
		        tiempo= response.routes[0].legs[0].duration.text;
		        directionsDisplay.setDirections(response);
		        keyy = true;
		    } else {alert("No existen rutas entre ambos puntos"); keyy=false}
			});
		}

		function choferesCercanos(data){
			//Obteniendo mi lat y long 
			var ll=""+myLatlng; //pasamos latitud y longitud a string?
			var newPos = ll.substr(1, ll.length-2); //sacamos los parentesis
			var input = newPos; //pasamos longitud y latitud a la variable input -000,000
			var latlngStr = input.split(',', 2);//divido en las comas y guardo en 2 cadena
			var lat = parseFloat(latlngStr[0]);//obtengo la primera cadena
			var lng = parseFloat(latlngStr[1]);//obtengo la segunda cadena
			var choferes = []; //lista ordenada de los choferes
			var tamaño = data.length;
			for(var a = 0; a<tamaño; a++){
				var indexChofer = masCercano(data, lat, lng);
				choferes[a] = (data[indexChofer]);
				data.splice(indexChofer,1);//borramos chofer de la lista 
			}
			return choferes;
		}
		function rad(x) {return x*Math.PI/180;}

		//Funcion: devuelve al chofer mas cercano de una array
		function masCercano(data, lat, lng){
			var R = 6371; //radio
			var distances = [];
			var closest = -1;
			for (i=0; i<data.length; i++)
			{
				var mLat = data[i].lat;
				var mLng = data[i].lon;
				var dLat = rad(mLat - lat);
				var dLng = rad(mLng - lng);
				var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLng/2) * Math.sin(dLng/2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
				var d = R * c;
				distances[i] = d;
				if (closest == -1 || d < distances[closest]){
					closest = i;
				}
			}
			return closest;

		}

		function posicionChofer(latLongChof){
			//datos para la solicitud
			console.log("posicionChofer "+ latLongChof.ob + " "+ latLongChof.pb);
			var posCh = new google.maps.LatLng(latLongChof.ob, latLongChof.pb);
			markerChof = new google.maps.Marker({
				position: posCh,
				map: map,
				title: "Camion flete",
				icon: icons.chof
				});
			$('#searchTransport').css('display', 'none');
			$('#finishTransport').css('display', 'block');			
			//verRuta();
			//map.panTo(posCh);			
		}

		function removeMarker(){ 
			markerChof.setMap(null);
			$('#finishTransport').css('display', 'none');
			$('#searchTransport').css('display', 'block');
			directionsDisplay.setMap(null);
			geocalizando();

		}

		function validarDestino(destino){		
			geocoder.geocode({'address': destino}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {	
					return true					
				}else {return false}
			});
			
		}
			
			
