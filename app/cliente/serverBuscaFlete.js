//Autor: Sebahard
//Contacto: Sebasay1@gmail.com

var io                  = require('socket.io').listen(8000),
    mysql               = require('mysql'),
    connectionsArray    = [],
    connection          = mysql.createConnection({
        host        : 'localhost',
        user        : 'root',
        password    : 'Abp8v50mu%5B',
        database    : 'u900787045_db',
        port        : '3306'
    }),
    usuarios = {},
    choferes = {};

 /*var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser);*/

//Conectamos la base de datos, si ocurre un error se mostrara en la consola
connection.connect(function(err) {
	if(err) console.log("Base de datos "+err );
 	else console.log( "Conectado a Base de datos");
});

//Creamos WebSocket para mantener abierto la comunicacion AJAX
io.sockets.on('connection', function (socket){
	//Almacenamos identificacion de chofer
	socket.on("idChofer", function(data, callback){
		console.log("Ingreso Chofer: ",data['idChofer']);
		socket.nickname = data['idChofer'];
		choferes[socket.nickname] = socket;
		modificarChofer(data,callback);
		
	});
	//Almacenamos identificacion del usuario y registramos solicitud
	socket.on("nuevaSolicitud", function(data, callback){
		console.log("Ingreso Usuario: ",data['idUsuario']);
		socket.nickname = data['idUsuario'];
		usuarios[socket.nickname] = socket;
		registrarSolicitud(data, callback);
	});
	//Recibimos solicitud del usuario para enviarla al chofer
	socket.on("enviarSolicitud", enviarNotificacion);
	//Modificamos estado chofer
	socket.on("estadoChofer", modificarChofer);
	//Enviamos fleteros disponibles
	socket.on("buscarFlete", enviarFleteros);
	//usuario finaliza flete
	socket.on("userEnd", finFlete);
	//Registramos ratings
	socket.on("ratingUser", registrarRating);
	//Obtenemos rating del usuario o chofer
	socket.on('getRating', getRating);
	//Registramos el usuario y llamamos a la funcion registrarUsuario
	socket.on("registrarCliente", registrarCliente);
	//Registramos el Chofer y llamamos a la funcion registrarChofer
	socket.on("registrarChofer", registrarChofer);
	//Mostrar solicitudes de los usuarios y choferes realizadas
	socket.on("solicitudes", mostrarSolicitudes);
	//Mostrar posicion chofer al usuario
	socket.on("nuevaPosicion", guardarLatLng);
	//Login del cliente
	socket.on("login", loginUsuario);
    //Login Fletero
	socket.on("loginChofer", loginChofer);
    //Cliente se descoencta del server
    socket.on('disconnect', function(){
    	console.log('Server has disconnected');
    });

});

//Funcion: registramos solicitud del cliente en la bd 
function registrarSolicitud(data, callback)
{
	console.log("Registrando Solicitud...");
	var a=data['idUsuario'],b=data['origen'],c=data['destino'],d=data['cargar'],e=data['descargar'],f=data['comentario'], g="Solicitando";
	var result = connection.query('INSERT INTO solicitud SET usuario_fk=?, origen=?, destino=?, cargar=?, descargar=?, comentario=?, estado=?', [a, b, c, d, e, f, g]);
	//Manejamos excepciones
	result
	.on('error', function(err) {
        //Si ocurre un error al ingresar solicitud
        console.log( err );
        callback({"estado":false});
	})
    .on('result', function( user ) {
    	//Resultado obtenido al ingresar solicitud
    	console.log( "Solicitud Ingresada" );
    	//obtenemos idSolicitud
    	console.log( "id Solicitud: "+ user.insertId);
    	callback({"estado":true, "idSolicitud":user.insertId});
    	
    })		
    .on('end',function(){
    	//Finalizacion del query
    	console.log( "Query terminado" );
    });


};
//Fin funcion registrarSolicitud

//Funcion: enviamos notificacion a chofer mas cercano
function enviarNotificacion(data, callback){
	var a=data['idSolicitud'], b=data['idChofer'], c=data['idUsuario'], d=data['kms'], e=data['tiempo'], photos=data['fotos'];
	console.log("Enviando solicitud y modificando estado del chofer "+b+" a ocupado (0)...");
	connection.query('UPDATE chofer SET estado = ? WHERE idChofer = ?', [0, b]);
   	console.log("Estado Modificado con exito.");
   	console.log("Obteniendo solicitud "+a+" de la BD...");
   	connection.query("SELECT usuario.nombre, usuario.telefono, usuario.correo, origen, destino, cargar, descargar, comentario FROM solicitud INNER JOIN usuario ON usuario_fk=usuario.idUsuario WHERE idSolicitud=?",[a], function(err,results){
   		if(err){
   			throw err; //?
   			console.log(err);
   		}else{
   			console.log("Solicitud obtenida");
   			//Mandamos solicitud al chofer y esperamos su respuesta
    		console.log("Enviando solicitud al chofer "+b+" y en espera de su respuesta");
    		choferes[b].emit("nuevaSolicitud", {usuario: results[0].nombre, telefono: results[0].telefono, correo: results[0].correo, origen: results[0].origen, destino: results[0].destino, cargar: results[0].cargar, descargar: results[0].descargar, comentario: results[0].comentario, kms: d, tiempo: e, fotos: photos}, function(respuesta){
    			//Recibimos respuesta del chofer
    			if(respuesta['respuesta']){
    				console.log("Solicitud aceptada con precio: "+respuesta['precio']);
    				console.log("Guardando precio y estado de la solicitud: "+a);
    				connection.query('UPDATE solicitud SET precio = ?, estado = ?, chofer_fk = ?, posicionChofer = ?, kilometros = ?, tiempo = ? WHERE idSolicitud = ?', [respuesta['precio'], 'Acepta', b, respuesta['posicion'], d, a, a]);
    				//Enviamos oferta al usuario
    				console.log("Enviando oferta de "+respuesta['precio']+" al usuario: "+c);
    				callback({"respuesta": true, "precio": respuesta['precio'], "posicion": respuesta['posicion'], "nombreChofer": respuesta['nombreChofer'], "latLong": respuesta['latLong']});
    				console.log("Esperando decision del usuario...");
    				//Esperamos decision del usuario
    				usuarios[c].on("procesarSolicitud", function(respuesta, callback){
    					//Enviamos respuesta del usuario al chofer
    					if(respuesta['estado'] == true){
							connection.query('UPDATE solicitud SET  estado = ? WHERE idSolicitud = ?', ['Iniciando', a]);
							choferes[b].emit("procesarDecision", {'estado':respuesta['estado'], 'idUsuario': c});
							console.log("Usuario "+c+" acepto oferta!, respuesta del usuario enviada al chofer: "+respuesta['estado']);
						}
						if (respuesta['estado'] == "rebaja") {							
							console.log("Usuario "+c+" pidio rebaja!, respuesta del usuario enviada al chofer: "+respuesta['estado']);
							choferes[b].emit("procesarDecision", {'estado':respuesta['estado'], 'idUsuario': c});
							choferes[b].on("nuevaOferta", function(resp){
								console.log("El chofer responde para nueva oferta");
								if (resp['oferta']) {
									console.log("Guardando precio: "+resp['oferta']);
									connection.query('UPDATE solicitud SET precio = ? WHERE idSolicitud = ?', [resp['oferta'], a]);
									callback({"oferta": resp['oferta']});
								}else{
									callback({"oferta": resp['oferta'], "motivo": resp['motivo']});										
									connection.query('UPDATE solicitud SET  estado = ?, chofer_fk = ? WHERE idSolicitud = ?', ['Rechazado', b,a]);//hacer trigger en la bd, para ver cuantos choferes rechazo esta solicitud
				    				console.log("Chofer rechazo la solicitud. Cambiando estado chofer a online, Solicitud rechazada");
				    				connection.query('UPDATE chofer SET estado = ? WHERE idChofer = ?', [1, b]);				    											}
							})										
						}else {
							if(respuesta['estado']== false){
								connection.query('UPDATE solicitud SET estado = ? WHERE idSolicitud = ?', ['Cancelado', a]);
								console.log("El usuario "+c+" cancelo la solicitud.");
							}
							if(respuesta['estado']== "nuevo"){
								connection.query('UPDATE solicitud SET estado = ?, chofer_fk = ?, precio = ?, posicionChofer = ?, kilometros = ?, tiempo = ? WHERE idSolicitud = ?', ['Solicitando', null, null, null,  null, null, a]);
								console.log("El usuario "+c+" desea buscar a otro chofer. Solicitud formateada.");
							}
							//Modificamos estado del chofer
							connection.query('UPDATE chofer SET estado = ? WHERE idChofer = ?', [1, b]);
							console.log("Cambiando estado chofer a online");
							//Enviamos respueta al chofer
							choferes[b].emit("procesarDecision", {'estado':respuesta['estado'], 'idUsuario': c});
							console.log("Respuesta del usuario enviada al chofer: "+respuesta['estado']);
						}
    				});
    			}else{
    				//MOTIVOS DEL RECHAZO
    				// 1 = no puede realizar solicitud
    				// 2 = Fotos mal tomadas
    				// 3 = comentario no se entiende
    				// 4 = Direcciones en mal formato    	
    				callback({"respuesta": false, "motivo": respuesta["motivo"]});			
    				connection.query('UPDATE solicitud SET  estado = ?, chofer_fk = ? WHERE idSolicitud = ?', ['Rechazado', b,a]);//hacer trigger en la bd, para ver cuantos choferes rechazo esta solicitud
    				console.log("Chofer rechazo la solicitud. Cambiando estado chofer a online, Solicitud rechazada");
    				connection.query('UPDATE chofer SET estado = ? WHERE idChofer = ?', [1, b]);    				
    			}
    		});
   		}		
	});
};

//Funcion: modificar estado chofer 1(disponible) o 0(ocupado)
function modificarChofer(data, callback)
{
	console.log("Modificando estado chofer a "+data['estado']);
	var result = connection.query('UPDATE chofer SET estado = ? WHERE idChofer = ?', [data['estado'], data['idChofer']]);
	//Manejamos  excepciones
	result
	.on('error', function(err){
		console.log(err);
		callback(false);
	})
	.on('result', function(user){
		console.log("Estado id chofer "+data['idChofer']+" modificado a "+data['estado']);
		callback(true);
	})
	.on('end', function(){
		console.log("Query terminado");
	});
};
//Fin funciona modificarChofer

//Funcion: enviar fleteros disponibles
function enviarFleteros(data, callback){
	var fleteros = new Array();
	console.log("Usuario "+data+" Solicito fleteros");
	connection.query("SELECT idChofer, nombre, lat, lon FROM chofer WHERE estado = 1", function(err, results){
		for (var i=0; i<results.length; i++)
		{
			fleteros.push(results[i]);
			console.log("Fletero "+results[i].nombre+" guardado.");
		}	
		callback(fleteros);
	});
};

//Funcion: RegistrarCliente en la bd
function registrarCliente(data, callback)
{
	console.log("Registrando cliente con nombre: "+data['nombreCliente']);
    var a=data['nombreCliente'],b=data['passwordCliente'],c=data['telefonoCliente'],d=data['correoCliente'];
	var result = connection.query('INSERT INTO usuario SET nombre=?, password=?, telefono=?, correo=?', [a, b, c, d]);
    //Manejamos  excepciones
	result
	.on('error', function(err){
		console.log(err);
		callback(false);
	})
	.on('result', function(user){
		console.log("Insert Realizado con éxito");
		callback(true);
	})
	.on('end', function(){
		console.log("Query terminado");
	});
};

//Funcion: RegistrarChofer en la bd
function registrarChofer(data, callback){
	console.log("Registrando chofer...." + data['nombreChofer']);
    var a=data['nombreChofer'],b=data['passwordChofer'],c=data['telefonoChofer'],d=data['correoChofer'];
	var result = connection.query('INSERT INTO chofer SET nombre=?, password=?, telefono=?, correo=?', [a, b, c, d]);
    //Manejamos  excepciones
	result
	.on('error', function(err){
		console.log("Ocurrio un error: "+ err);
		callback(false);
	})
	.on('result', function(user){
		console.log("Insert Realizado con éxito");
		callback(true);
	})
	.on('end', function(){
		console.log("Query terminado");
	});
};


//Funcion: Finalizar flete por parte del usuario o chofer
function finFlete(data){
	if(data['user']){//usuario finaliza
		console.log("Usuario finalizo flete.");
		choferes[data['id']].emit('finalizaFlete', data['nombre']);
	}
	else//chofer finaliza
	{	
		console.log("Chofer finalizo flete.");
		usuarios[data['id']].emit('finalizaFlete', data['nombre']);
	}

	//almacenamos registro
}

//Funcion: Registrar calificacion de los usuaruis y choferes
function registrarRating(data){
	console.log("Guardando rating en "+data['tabla']);
	connection.query("INSERT INTO "+data['tabla']+" SET idChofer=?, idUsuario=?, rating=?, comentario=?", [data['idChofer'], data['idUsuario'], data['rating'], data['comentario']]);
}

//Funcion: Obtener el rating de los choferes
function getRating(data,callback){
	console.log("Obteniendo rating de "+data['tabla']);
	connection.query("SELECT SUM( rating ) / COUNT( idChofer ) as rating FROM ratchofer WHERE idChofer = ?", [data['id']], function(err,results){
		if(err){
			throw err;
			console.log("Hubo un error al obtener rating.");
			callback(false);
		}
		else{
			console.log("Rating obtenido: "+results[0].rating);
			callback(results[0].rating);
		}

	});
}

//Funcion: Mostrar solicitudes de los choferes y usuarios
function mostrarSolicitudes(data,callback){
	connection.query("SELECT idSolicitud,  "+data['campo']+".nombre, origen, destino, cargar, descargar, comentario, precio, solicitud.fecha FROM solicitud INNER JOIN "+data['tabla']+" ON "+data['idUsuario']+" = "+data['campo']+"_fk WHERE "+data['where']+" = ? ORDER BY fecha DESC LIMIT 5", [data['id']], function(err,results){
		if (err) {
			throw err;
			console.log("Hubo un error al obtener las solicitudes.");
			callback(false);
		}else{
			console.log("Mandando solicitudes :"+results.length);
			callback(results);
			
		}
	});

}

//Funcion: Enviar posicion del chofer al usuario
function verPosicion(){

}

//function: Gurdar posicion en ltng del chofer
function guardarLatLng(data){
	console.log("Guardando posicion en Latitud y logitud");
	connection.query("UPDATE chofer SET lat = ?, lon = ? WHERE idChofer = ?", [data['lat'], data['long'], data['idChofer']], function(err,results){
		if (err) {
			throw err;
			console.log("Hubo un error al guradar Latitud y longitud.");
		}else{
		console.log("Posicion guardado con exito."+data['lat']+" "+data['long']);
		}
	});

}

function loginUsuario(data, callback){
	console.log("Devolviendo login usuario...");
    	var TEST_TABLE = 'usuario';
        connection.query('SELECT nombre, idUsuario FROM '+TEST_TABLE+' WHERE correo = "'+data['correo']+'" AND password = "'+data['pass']+'"', function(err, results) {
	        if (err){ 
				throw err;
				console.log(err);
				callback(0);
			}
			else{
				if(results.length>0){
					console.log(results[0]); // [{1: 1}]
					console.log('Usuario encontrado: ' +results[0]['nombre']);
					callback({nombre:results[0]['nombre'],idUsuario:results[0]['idUsuario']});
				}else{
					console.log("Usuario no encontrado");
					callback(0);
				}
			}
        });
}

function loginChofer(data, callback){
	console.log("Devolviendo login chofer...");
	connection.query('SELECT nombre, idChofer FROM chofer WHERE correo=? AND password=?',[data['correo'],data['pass']], function (err, results) {
		if (err) {
			throw err;
			console.log(err);
			callback(0);
		}
		else {
			if (results.length > 0) {
				console.log(results[0]); // [{1: 1}]
				console.log('El número de filas afectadas es: ' + results.length);
				callback({ nombre: results[0]['nombre'], idChofer: results[0]['idChofer'] });
		  	}else {
				console.log("Usuario no encontrado");
				callback(0);
		  	}
		 }
	}); 
}