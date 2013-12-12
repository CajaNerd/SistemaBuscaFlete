<?php require_once('../Connections/conex.php'); ?>
<?php
if (!function_exists("GetSQLValueString")) {
function GetSQLValueString($theValue, $theType, $theDefinedValue = "", $theNotDefinedValue = "") 
{
  if (PHP_VERSION < 6) {
    $theValue = get_magic_quotes_gpc() ? stripslashes($theValue) : $theValue;
  }

  $theValue = function_exists("mysql_real_escape_string") ? mysql_real_escape_string($theValue) : mysql_escape_string($theValue);

  switch ($theType) {
    case "text":
      $theValue = ($theValue != "") ? "'" . $theValue . "'" : "NULL";
      break;    
    case "long":
    case "int":
      $theValue = ($theValue != "") ? intval($theValue) : "NULL";
      break;
    case "double":
      $theValue = ($theValue != "") ? doubleval($theValue) : "NULL";
      break;
    case "date":
      $theValue = ($theValue != "") ? "'" . $theValue . "'" : "NULL";
      break;
    case "defined":
      $theValue = ($theValue != "") ? $theDefinedValue : $theNotDefinedValue;
      break;
  }
  return $theValue;
}
}

// *** Redirect if username exists
$MM_flag="MM_insert";
if (isset($_POST[$MM_flag])) {
  $MM_dupKeyRedirect="mensajes/CorreoDuplicado.php";
  $loginUsername = $_POST['correo'];
  $LoginRS__query = sprintf("SELECT correo FROM chofer WHERE correo=%s", GetSQLValueString($loginUsername, "text"));
  mysql_select_db($database_conex, $conex);
  $LoginRS=mysql_query($LoginRS__query, $conex) or die(mysql_error());
  $loginFoundUser = mysql_num_rows($LoginRS);

  //if there is a row in the database, the username was found - can not add the requested username
  if($loginFoundUser){
    $MM_qsChar = "?";
    //append the username to the redirect page
    if (substr_count($MM_dupKeyRedirect,"?") >=1) $MM_qsChar = "&";
    $MM_dupKeyRedirect = $MM_dupKeyRedirect . $MM_qsChar ."requsername=".$loginUsername;
    header ("Location: $MM_dupKeyRedirect");
    exit;
  }
}

$editFormAction = $_SERVER['PHP_SELF'];
if (isset($_SERVER['QUERY_STRING'])) {
  $editFormAction .= "?" . htmlentities($_SERVER['QUERY_STRING']);
}

if ((isset($_POST["MM_insert"])) && ($_POST["MM_insert"] == "registroChofer")) {
  $insertSQL = sprintf("INSERT INTO chofer (nombre, password, correo, telefono, rutChofer) VALUES (%s, %s, %s, %s, %s)",
                       GetSQLValueString($_POST['nombre'], "text"),
                       GetSQLValueString($_POST['password'], "text"),
                       GetSQLValueString($_POST['correo'], "text"),
                       GetSQLValueString($_POST['telefono'], "int"),
                       GetSQLValueString($_POST['rutChofer'], "text"));

  mysql_select_db($database_conex, $conex);
  $Result1 = mysql_query($insertSQL, $conex) or die(mysql_error());

  $insertGoTo = "mensajes/usuarioRegistrado.php";
  if (isset($_SERVER['QUERY_STRING'])) {
    $insertGoTo .= (strpos($insertGoTo, '?')) ? "&" : "?";
    $insertGoTo .= $_SERVER['QUERY_STRING'];
  }
  header(sprintf("Location: %s", $insertGoTo));
}

$colname_rsChofer = "-1";
if (isset($_SESSION['MM_Username'])) {
  $colname_rsChofer = $_SESSION['MM_Username'];
}
mysql_select_db($database_conex, $conex);
$query_rsChofer = sprintf("SELECT * FROM chofer WHERE correo = %s", GetSQLValueString($colname_rsChofer, "text"));
$rsChofer = mysql_query($query_rsChofer, $conex) or die(mysql_error());
$row_rsChofer = mysql_fetch_assoc($rsChofer);
$totalRows_rsChofer = mysql_num_rows($rsChofer);
?>
<?php
// *** Validate request to login to this site.
if (!isset($_SESSION)) {
  session_start();
}

$loginFormAction = $_SERVER['PHP_SELF'];
if (isset($_GET['accesscheck'])) {
  $_SESSION['PrevUrl'] = $_GET['accesscheck'];
}

if (isset($_POST['correo'])) {
  $loginUsername=$_POST['correo'];
  $password=$_POST['password'];
  $MM_fldUserAuthorization = "";
  $MM_redirectLoginSuccess = "index.php";
  $MM_redirectLoginFailed = "mensajes/usuarioError.php";
  $MM_redirecttoReferrer = false;
  mysql_select_db($database_conex, $conex);
  
  $LoginRS__query=sprintf("SELECT correo, password FROM chofer WHERE correo=%s AND password=%s",
    GetSQLValueString($loginUsername, "text"), GetSQLValueString($password, "text")); 
   
  $LoginRS = mysql_query($LoginRS__query, $conex) or die(mysql_error());
  $loginFoundUser = mysql_num_rows($LoginRS);
  if ($loginFoundUser) {
     $loginStrGroup = "";
    
	if (PHP_VERSION >= 5.1) {session_regenerate_id(true);} else {session_regenerate_id();}
    //declare two session variables and assign them
    $_SESSION['MM_Username'] = $loginUsername;
    $_SESSION['MM_UserGroup'] = $loginStrGroup;	      

    if (isset($_SESSION['PrevUrl']) && false) {
      $MM_redirectLoginSuccess = $_SESSION['PrevUrl'];	
    }
    header("Location: " . $MM_redirectLoginSuccess );
  }
  else {
    header("Location: ". $MM_redirectLoginFailed );
  }
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="shortcut icon" href="../img/favicon.png">

    <title>Transportistas Busca Flete</title>
    
    <!-- Bootstrap core CSS -->
    <link href="../css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="css/jumbotron.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="../../assets/js/html5shiv.js"></script>
      <script src="../../assets/js/respond.min.js"></script>
    <![endif]-->
    
    
    <style>
        input {
            height: 24px;
            }
    </style>
  </head>

  <body>
  	<div data-role="page">
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand pacifico" href="../index.html">Busca Flete</a>
        </div>
        <div class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
            <li class="active"><a href="#">Inicio</a></li>
            <li><a role="dialog" data-toggle="modal" href="#" data-target="#nosotros" >Nosotros</a></li>
            <li><a role="dialog" data-toggle="modal" href="#" data-target="#contacto">Contacto</a></li>
            
            <!--
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">Mi <b class="caret"></b></a>
              <ul class="dropdown-menu">
                <li><a href="usr/index.html"><span class="glyphicon glyphicon-globe"></span> Web app</a></li>
                <li><a href="../android/BuscaFleteChofer.apk"><img src="../img/android.png" style="width: 16px;"> Android app</a></li>
                <li><a href="usr/index.html"><img src="../img/ios.png" style="width: 16px;"> Ios app</a></li>
              </ul>
            </li>
            -->
          </ul>
          
          <form ACTION="<?php echo $loginFormAction; ?>" METHOD="POST" class="navbar-form navbar-right" id="logearChofer" autocomplete="on">
            <div class="form-group">
              <input type="email" placeholder="Email" class="form-control" id="correo" name="correo" autocomplete="on" required>
            </div>
            <div class="form-group">
              <input type="password" placeholder="Password" class="form-control" id="password" name="password" autocomplete="on" required>
            </div>
            <button type="submit" class="btn btn-success" >Acceso Choferes</button>
          </form>
        </div><!--/.navbar-collapse -->
      </div>
    </div>

    <!-- Main jumbotron for a primary marketing message or call to action -->
    <div class="jumbotron camion">
      <div class="container">
        <p class="blanco">Unete a nuestra red de transportistas.</p>
        <p><a class="btn btn-primary btn-lg" role="dialog" data-toggle="modal" href="#" data-target="#postular">Registro &raquo;</a></p>
      </div>
    </div>

    <div class="container">
      <!-- Example row of columns -->
      <div class="row">
        <div class="col-lg-4">
          <h2><span class="glyphicon glyphicon-check"></span> Postula Gratis</h2>
          <p>Procesaremos en menos de 48 horas tu solicitud, si toda tu documentación es correcta te enviaremos un email con toda la información que necesitas saber, además uno de nuestros agentes se comunicara directamente al número telefónico de tu móvil.</p>
          <p><a class="btn btn-default" role="dialog" data-toggle="modal" href="#" data-target="#postula">Ver Detalles &raquo;</a></p>
        </div>
        <div class="col-lg-4">
          <h2><span class="glyphicon glyphicon-home"></span> Tecnologia</h2>
          <p>Controla tus viajes, obtén ingresos extras con toda independencia, nuestro canal de comunicación puede soportar miles de solicitudes de clientes de todas partes, así mismo tú ofreces el precio de tus servicios directamente con los demandantes desde tu Smartphone.</p>
          <p><a class="btn btn-default" role="dialog" data-toggle="modal" href="#" data-target="#empresas">Ver Procesos &raquo;</a></p>
       </div>
        <div class="col-lg-4">
          <h2><span class="glyphicon glyphicon-credit-card"></span> Formas de pago</h2>
          <p>Pagas solo lo que usas, ingresa al panel de facturación disponible solo para navegadores web y revisa en vivo el estado de tu facturación, puedes pagar las boletas emitidas cuando quieras dentro del periodo del mes.</p>
          <p><a class="btn btn-default" role="dialog" data-toggle="modal" href="#" data-target="#pagos" >Ver Detalles &raquo;</a></p>
        </div>
      </div>

      <hr>

      <footer>
        <p>&copy; Busca Flete 2013</p>
      </footer>
    </div> <!-- /container -->
    </div><!-- /page -->

     <div class="modal fade" id="postula" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h3 class="modal-title"><span class="glyphicon glyphicon-search"></span> Pasos Para Postulación</h3>
          </div>
          <div class="modal-body">
            <p><b>1.</b>Presiona en <a class="btn btn-primary btn-lg" role="dialog" data-toggle="modal" href="#" data-target="#postular">Postular Gratis Aqui</a></p>
			<p><b>2.</b> Completa y Envia el Formulario Con toda la información Solicitada.</p>
			<p><b>3.</b> Te debera llegar en unos minutos un correo con la información previa de tu futura cuenta</p>
			<p><b>4.</b> Descarga e instala la aplicacion movil exclusiva para Choferes desde tu pagina de inicio.</p>
			<p><b>5.</b> Si toda tu documentación es correcta nos comunicaremos contigo para felicitarte, tenemos un plazo minimo de 2 dias habiles para comprobar tus datos.</p>
			<p><b>6.</b> ¡Listo! ya estas listo para recibir solicitudes</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    
     <div class="modal fade" id="empresas" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h3 class="modal-title"><span class="glyphicon glyphicon-ok"></span> Procesos Basicos de Usuarios en buscaflete.cl</h3>
          </div>
          <div class="modal-body">
		  <h4><img src="../../img/icono.svg"> Cliente </h4>
		  	<p>1. Registro Cliente</p>
			<p>2. Inicio de Sesión Cliente </p>
            <p>3. Cliente sube a lo menos una fotografia para que tu puedas identificar la carga mas adelante</p>
			<p>4. Cliente ingresa el destino</p>
			<p>5. Cliente Revisa el MAPA</p>
			<p>6. Cliente Envia Solicitud</p>
			<p>7. Cliente Acepta/Rechaza precio propuesto</p>
			<p>8. Cliente Finaliza Solicitud</p>
			<p>9. Cliente Califica Chofer </p>
			
		 <h4><img src="../../img/camion2.png" style=" width:40px; height:40px;"> Chofer </h4>
		 	<p>1. Registro Chofer</p>
			<p>2. Inicio de Sesión Chofer </p>
            <p>3. Chofer recibe solicitud</p>
			<p>4. Chofer envia precio dispuesto a Cliente</p>
			<p>5. Chofer realiza el transporte </p>
			<p>6. Chofer Califica Cliente</p>
			
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    
     <div class="modal fade" id="pagos" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h3 class="modal-title">Pagos y Precios</h3>
          </div>
          <div class="modal-body">
		  <h4><span class="glyphicon glyphicon-credit-card"></span><b> Formas De Pago</b></h4>
		  <li>Desposito Bancario, Transferencia Electronica y Efectivo</li>
		  
		  <h4 style="padding-top: 15px;"><b> Costos por Solicitud</b></h4>
    
			<span class="glyphicon glyphicon-usd"></span><span class="glyphicon glyphicon-chevron-right"></span><b>Opción 1.</b> <p>Precio Fijo:  <b>$1.000 CLP</b> x Solicitud Aceptada</p>
			<span class="glyphicon glyphicon-usd"></span><span class="glyphicon glyphicon-chevron-right"></span><b>Opción 2.</b> <p>Precio Variable: Comision del <b>5%</b> segun el precio aceptado.</p>
          
          <span class="glyphicon glyphicon-asterisk"></span><b>USUARIOS NUEVOS</b> <p>50% Desct. x 1 mes.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    
    <div class="modal fade" id="nosotros" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h3 class="modal-title"><span class="glyphicon glyphicon-question-sign"></span> Acerca de Nosotros</h3>
          </div>
          <div class="modal-body">
            <img src="../img/75x75.png" style="padding-bottom: 10px;">
			<p><span class="glyphicon glyphicon-registration-mark"></span> <b>BuscaFlete.cl</b></p>
            <p><span class="glyphicon glyphicon-screenshot"></span> <b>Misión:</b> Nuestra Misión es ser la solución mas moderna, rápida y simple entre las personas y empresas que necesiten transportar carga con transportistas de nuestra plataforma</p>
          	<p><span class="glyphicon glyphicon-map-marker"></span> <b>Dirección: </b> Av.El Peral 6120, Puente Alto, Chile </p>
			<p><span class="glyphicon glyphicon-earphone"></span> <b>Telefono:</b><tel> + 56 9 7821 0204 </tel><p>
			<p><span class="glyphicon glyphicon-envelope"></span> <b>Email</b> <mail>contacto@buscaflete.cl</mail></p>
			
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">(Esc) Cerrar</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    
    <div class="modal fade" id="contacto" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h3 class="modal-title"><span class="glyphicon glyphicon-comment"></span> Formulario de Contacto</h3>
          </div>
          <div class="modal-body">
           
           	<form action="" id="contact-form" class="form-horizontal">
						  <fieldset>
						   
						    <div class="control-group">
						      <label class="control-label" for="name"><span class="glyphicon glyphicon-user"></span> Su Nombre</label>
						      <div class="controls">
						        <input type="text" class="form-control" name="name" id="name">
						      </div>
						    </div>
						    <div class="control-group">
						      <label class="control-label" for="email"><span class="glyphicon glyphicon-envelope"></span> Email</label>
						      <div class="controls">
						        <input type="text" class="form-control" name="email" id="email">
						      </div>
						    </div>
						    <div class="control-group">
						      <label class="control-label" for="subject"><span class="glyphicon glyphicon-font"></span> Asunto</label>
						      <div class="controls">
						        <input type="text" class="form-control" name="subject" id="subject">
						      </div>
						    </div>
						    <div class="control-group">
						      <label class="control-label" for="message"><span class="glyphicon glyphicon-pencil"></span> Su Mensaje</label>
						      <div class="controls">
						        <textarea class="form-control" name="message" id="message" rows="3"></textarea>
						      </div>
						    </div>
	             		<div class="form-actions">
							<button type="submit" class="btn btn-primary btn-large">Enviar</button>
							<button type="reset" class="btn">Limpiar Todo</button>
						</div>
									
	        			
						  </fieldset>
						</form>
			

          </div>
          <div class="modal-footer">
		   
            <button type="button" class="btn btn-default" data-dismiss="modal">(Esc) Cerrar Ventana</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    
    <div class="modal fade" id="postular" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h3 class="modal-title"><span class="glyphicon glyphicon-check"></span> Formulario de Postulación</h3>
          </div>
        <div class="modal-body">
          	<span class="glyphicon glyphicon-warning-sign"></span>
          	<b>El siguiente formulario, es el primer paso para pertenecer a nuestra red, por favor complete todos los campos.</b>
  
            <p>&nbsp;</p>
<form action="<?php echo $editFormAction; ?>"  role="form" id="registroChofer" method="POST" name="registroChofer">
                <div class="form-group" id="formCorreo">
                    <label for="correoRegistro" class="col-lg-3 control-label"><span class="glyphicon glyphicon-envelope"></span> Correo</label>
                    <div class="col-lg-8">
                        <input type="email" class="form-control" name="correo" id="correo" placeholder="Ingrese su email" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="nombreRegistro" class="col-lg-3 control-label"><span class="glyphicon glyphicon-user"></span> Nombres</label>
                    <div class="col-lg-8">
                        <input type="text" class="form-control" name="nombre" id="nombre" placeholder="Nombre y Apellido" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="passRegistro" class="col-lg-3 control-label"><span class="glyphicon glyphicon-asterisk"></span> Contraseña</label>
                    <div class="col-lg-8">
                        <input type="password" class="form-control"  name="password" id="password" placeholder="********" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="telefonoRegistro" class="col-lg-3 control-label"><span class="glyphicon glyphicon-earphone"></span> Móvil</label>
                    <div class="col-lg-8">
		                <div class="input-group">
		                  <span class="input-group-btn">
		                    <button class="btn btn-default" type="button">+56-9</button>
		                  </span>
		                  <input type="text" class="form-control" name="telefono" id="telefono" placeholder="ej:12345678" pattern="[0-9]{8}" title="Ingresa tú número móvil de 8 digitos" required>
		              
		                </div><!-- /input-group -->
                    </div> 
                </div> 
                <div class="form-group">
                <label for="passRegistro" class="col-lg-3 control-label"><span class="glyphicon glyphicon-credit-card"></span> R.U.T</label>
                	<div class="col-lg-8">
                		<input type="text" class="form-control" name="rutChofer" id="rutChofer" placeholder="ej:12345678-9" pattern="[0-9]+-[0-9A-Za-z]{1}" title="Ingresa un RUT valido (ejemplo: 17255763-5)" required>
		           </div>  
                </div>
                <div class="form-group">
                <label for="contrato">He leído, y  acepto los terminos y condiciones de buscaflete.cl</label>
                	<div class="col-lg-2">
                		<input type="checkbox" required id="contrato" name="contrato">
                	</div>
                		

                </div>
                <div class="form-group">
                 	<div class="col-lg-2">
                		<button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>
                	</div>
				
            	<input type="submit" value="Insertar registro">
            	</div>
          <input type="hidden" name="MM_insert" value="<?php echo $row_rsChofer['']; ?>">
          <input type="hidden" name="MM_insert" value="registroChofer">
</form>
           
        </div>
         	
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

   
    
    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="../js/jquery.js"></script>
    <script src="../js/bootstrap.min.js"></script>


<!-- Validate plugin -->
		<script src="assets/js/jquery.validate.js"></script>


<!-- Scripts specific to this page -->
<script src="validar.js"></script>
		<!--<script src="scriptRegistro.js"></script>-->
  </body>
</html>
<?php
mysql_free_result($rsChofer);
?>
