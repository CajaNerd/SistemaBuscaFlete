$(document).ready(function(){

//validarUsuario();

});

var socket = io.connect('http://buscaflete.cl:8000',{
      'auto connect': false
    });

function ocultardiv(id){
    document.getElementById(id).style.display="none";
}

function mostrar(id){
    document.getElementById(id).style.display="block";
}

function cerrarSesion(){
    //ocultar los div
    ocultardiv('infousuario');
    mostrar('no-login');
    //CerrarSesion LocalStorage
    localStorage.usernameBF= "";
    localStorage.idCLienteBF= "";
    $('#solicitudes').css('display','none');
}

function validarUsuario() {
    // Validar si el usuario ha ingresado antes o no
    if (localStorage.usernameBF)
    {
        socket.socket.reconnect();
        document.getElementById("status2").innerHTML= localStorage.usernameBF;
        console.log("Holi "+localStorage.usernameBF);
        ocultardiv('no-login');
        mostrar('infousuario');
        mostrarSolicitudes(); 
    }
    else{
        //Agregamos el Botón De Login
        ocultardiv('infousuario');
        mostrar('no-login');
    }
}

function registrarUsuario(){
    var data = {"nombreCliente": ""+$("#nombreRegistro").val()+"", "passwordCliente": ""+$("#passRegistro").val()+"", "telefonoCliente": ""+$("#telefonoRegistro").val()+"", "correoCliente": ""+$("#correoRegistro").val()+""};

    socket.socket.reconnect();
    socket.emit("registrarCliente", data, function(request){
        if(request){
            $('#modalRegistro').modal('hide');
            $('#modalResultadoRegistro').modal('show');
            document.getElementById("mensajeRegistro").innerHTML = "Usuario Registrado con éxito!";
            socket.socket.disconnect();
            //Usuario registrado con exito
        }
        else{
            //hubo un problema
            $('#formCorreo').addClass('has-error');
            alert("Correo Ya existe!");
            socket.disconnect();
        }

    });
}

function connect()
{
    try
    {
        document.getElementById('status2').innerHTML ="Conectando al servidor...";
		socket.socket.reconnect();
        socket.emit('login', {"correo":document.getElementById('un').value, "pass":document.getElementById('pw').value}, function(data){
            if (data == 0) {
                document.getElementById('errorLogin').innerHTML = 'Usuario y/o contraseña inválidos';
                socket.disconnect();
            }else{
                $('#modalLogin').modal('hide');
                document.getElementById('status2').innerHTML = data.nombre;
                ocultardiv('no-login');
                mostrar('infousuario');
                localStorage.usernameBF= data.nombre;
                localStorage.idCLienteBF= data.idUsuario;
                //socket.socket.disconnect();
                mostrarSolicitudes();  
            }

        });
    }catch(err)
    {
        document.getElementById('status2').innerHTML = err.message;
    }
}

