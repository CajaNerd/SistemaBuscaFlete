<?php require_once('../Connections/conex.php'); ?>
<?php
//initialize the session
if (!isset($_SESSION)) {
  session_start();
}

// ** Logout the current user. **
$logoutAction = $_SERVER['PHP_SELF']."?doLogout=true";
if ((isset($_SERVER['QUERY_STRING'])) && ($_SERVER['QUERY_STRING'] != "")){
  $logoutAction .="&". htmlentities($_SERVER['QUERY_STRING']);
}

if ((isset($_GET['doLogout'])) &&($_GET['doLogout']=="true")){
  //to fully log out a visitor we need to clear the session varialbles
  $_SESSION['MM_Username'] = NULL;
  $_SESSION['MM_UserGroup'] = NULL;
  $_SESSION['PrevUrl'] = NULL;
  unset($_SESSION['MM_Username']);
  unset($_SESSION['MM_UserGroup']);
  unset($_SESSION['PrevUrl']);
	
  $logoutGoTo = "login.php";
  if ($logoutGoTo) {
    header("Location: $logoutGoTo");
    exit;
  }
}
?>
<?php
if (!isset($_SESSION)) {
  session_start();
}
$MM_authorizedUsers = "";
$MM_donotCheckaccess = "true";

// *** Restrict Access To Page: Grant or deny access to this page
function isAuthorized($strUsers, $strGroups, $UserName, $UserGroup) { 
  // For security, start by assuming the visitor is NOT authorized. 
  $isValid = False; 

  // When a visitor has logged into this site, the Session variable MM_Username set equal to their username. 
  // Therefore, we know that a user is NOT logged in if that Session variable is blank. 
  if (!empty($UserName)) { 
    // Besides being logged in, you may restrict access to only certain users based on an ID established when they login. 
    // Parse the strings into arrays. 
    $arrUsers = Explode(",", $strUsers); 
    $arrGroups = Explode(",", $strGroups); 
    if (in_array($UserName, $arrUsers)) { 
      $isValid = true; 
    } 
    // Or, you may restrict access to only certain users based on their username. 
    if (in_array($UserGroup, $arrGroups)) { 
      $isValid = true; 
    } 
    if (($strUsers == "") && true) { 
      $isValid = true; 
    } 
  } 
  return $isValid; 
}

$MM_restrictGoTo = "login.php";
if (!((isset($_SESSION['MM_Username'])) && (isAuthorized("",$MM_authorizedUsers, $_SESSION['MM_Username'], $_SESSION['MM_UserGroup'])))) {   
  $MM_qsChar = "?";
  $MM_referrer = $_SERVER['PHP_SELF'];
  if (strpos($MM_restrictGoTo, "?")) $MM_qsChar = "&";
  if (isset($_SERVER['QUERY_STRING']) && strlen($_SERVER['QUERY_STRING']) > 0) 
  $MM_referrer .= "?" . $_SERVER['QUERY_STRING'];
  $MM_restrictGoTo = $MM_restrictGoTo. $MM_qsChar . "accesscheck=" . urlencode($MM_referrer);
  header("Location: ". $MM_restrictGoTo); 
  exit;
}
?>
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

$editFormAction = $_SERVER['PHP_SELF'];
if (isset($_SERVER['QUERY_STRING'])) {
  $editFormAction .= "?" . htmlentities($_SERVER['QUERY_STRING']);
}

if ((isset($_POST["MM_update"])) && ($_POST["MM_update"] == "form1")) {
  $updateSQL = sprintf("UPDATE chofer SET password=%s, fotoCedula=%s, telefono=%s WHERE idChofer=%s",
                       GetSQLValueString($_POST['password'], "text"),
                       GetSQLValueString($_POST['fotoCedula'], "text"),
                       GetSQLValueString($_POST['telefono'], "int"),
                       GetSQLValueString($_POST['idChofer'], "int"));

  mysql_select_db($database_conex, $conex);
  $Result1 = mysql_query($updateSQL, $conex) or die(mysql_error());

  $updateGoTo = "index.php";
  if (isset($_SERVER['QUERY_STRING'])) {
    $updateGoTo .= (strpos($updateGoTo, '?')) ? "&" : "?";
    $updateGoTo .= $_SERVER['QUERY_STRING'];
  }
  header(sprintf("Location: %s", $updateGoTo));
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

$colname_rsSolicitud = "-1";
if (isset($_SESSION['MM_Username'])) {
  $colname_rsSolicitud = $_SESSION['MM_Username'];
}
mysql_select_db($database_conex, $conex);
$query_rsSolicitud = sprintf("SELECT * FROM solicitud WHERE chofer_fk = %s", GetSQLValueString($colname_rsSolicitud, "int"));
$rsSolicitud = mysql_query($query_rsSolicitud, $conex) or die(mysql_error());
$row_rsSolicitud = mysql_fetch_assoc($rsSolicitud);
$totalRows_rsSolicitud = mysql_num_rows($rsSolicitud);
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
            
            
            <li></li>

            
            
            <li class="dropdown active">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown"><?php echo $row_rsChofer['nombre']; ?> <b class="caret"></b></a>
              <ul class="dropdown-menu">
   				<li><a href="../app/chofer/index.html"><span class="glyphicon glyphicon-globe" ></span> Web APP</a></li>
                <li><a href="<?php echo $logoutAction ?>" ><span class="glyphicon glyphicon-off"></span> Cerrar Sesión</a></li>
              </ul>
            </li>
           
          </ul>

        </div><!--/.navbar-collapse -->
      </div>
    </div>

   

    <div class="container">
   	
	  <ul class="nav nav-tabs" id="myTab">
  <li class="active"><a href="#home" data-toggle="tab"><span class="glyphicon glyphicon glyphicon-home"></span> Home</a></li>
  <li><a href="#profile" data-toggle="tab"><span class="glyphicon glyphicon-qrcode"> Descargas</a></li>
  <li><a href="#vehiculo" data-toggle="tab"><img src="	../img/favicon2.png"> Mi Vehiculo</a></li>
  <li><a href="#messages" data-toggle="tab"><span class="glyphicon glyphicon glyphicon-list"></span> Historial de viajes</a></li>
  <li><a href="#settings" data-toggle="tab"><span class="glyphicon glyphicon-cog"></span> Configuraciones</a></li>
</ul>

<div class="tab-content">
  <div class="tab-pane active" id="home">
  	 <h3>Resumen</h3>
    	<h4><span class="glyphicon  glyphicon-time"></span> Miembro desde</h4>
      	<p><?php echo $row_rsChofer['fecha_creacion']; ?> </p>

      	<h4><span class="glyphicon glyphicon-play"></span> Estado</h4>
      	<p>&nbsp;<?php echo $row_rsChofer['estado']; ?></p>

      	<h4><span class="glyphicon glyphicon-user"></span> R.U.T</h4>
      	<p>&nbsp;<?php echo $row_rsChofer['rutChofer']; ?></p>
   <h4><span class="glyphicon glyphicon-phone"></span> Móvil</h4>
      	<p>&nbsp;<?php echo $row_rsChofer['telefono']; ?></p>
        <h4><span class="glyphicon glyphicon-envelope"></span> Correo</h4>
      	<p>&nbsp;<?php echo $row_rsChofer['correo']; ?></p>
      	
      	<div class="row">
      	  <div class="col-md-3"><h4><span class="glyphicon glyphicon-usd"></span> Monto Facturación </h4><p><?php echo $row_rsChofer['montoFacturacion']; ?></p></div>
			<div class="col-md-2"><button class="btn btn-primary">Pagar Factura</button></div>  
		</div>  

		  
  </div>
  <div class="tab-pane" id="profile">
  <img src="	../img/chart.png">
  <a href="../descargas/BuscaFlete_clChoferes-debug.apk" style="padding-left: 42px;"><span class="glyphicon glyphicon-save" ></span> .apk <img src="../img/android.png" style="width: 16px;"> </a>
  <a href="../descargas/BuscaFleteclChoferes.ipa" style="padding-left: 42px;"><span class="glyphicon glyphicon-save" ></span> .ipa <img src="../img/ios.png" style="width: 16px;"> </a>
  </div>
  <div class="tab-pane" id="messages">
  <h4>Viajes</h4>
  <?php echo $totalRows_rsSolicitud ?> </div>
  
  <div class="tab-pane" id="settings">
  	 <form method="post" name="form1" action="<?php echo $editFormAction; ?>">
      <table align="center">
        <tr valign="baseline">
          <td nowrap align="right">Password</td>
          <td><input type="text" name="password" value="<?php echo htmlentities($row_rsChofer['password'], ENT_COMPAT, 'utf-8'); ?>" size="32"></td>
        </tr>
        <tr valign="baseline">
          <td nowrap align="right">FotoCedula</td>
          <td><input type="file" name="fotoCedula" value="<?php echo htmlentities($row_rsChofer['fotoCedula'], ENT_COMPAT, 'utf-8'); ?>" size="32"></td>
        </tr>
        <tr valign="baseline">
          <td nowrap align="right">Telefono</td>
          <td><input type="text" name="telefono" value="<?php echo htmlentities($row_rsChofer['telefono'], ENT_COMPAT, 'utf-8'); ?>" size="32"></td>
        </tr>
        <tr valign="baseline">
          <td nowrap align="right">&nbsp;</td>
          <td><input type="submit" value="Actualizar registro"></td>
        </tr>
      </table>
      <input type="hidden" name="MM_update" value="form1">
      <input type="hidden" name="idChofer" value="<?php echo $row_rsChofer['idChofer']; ?>">
    </form>
    <p>&nbsp;</p>
  </div>
  <div class="tab-pane" id="vehiculo">
  <?php echo $row_rsChofer['idCamion']; ?>
  <?php echo $row_rsChofer['capacidadCarga']; ?>
  
  </div>
</div>

<script>
  $(function () {
    $('#myTab a:last').tab('show')
  })
</script>
		
    </div>

      <hr>

      <footer>
        <div class="footer" style=" padding-left:5%;">
        <div class="row">
        <div class="col-md-2"> <p>© BuscaFlete.cl 2013</p></div>
        <div class="col-md-1"><a role="dialog" data-toggle="modal" href="#" data-target="#nosotros" > Nosotros</a></div>
        <div class="col-md-1"> <a role="dialog" data-toggle="modal" href="#" data-target="#contacto">Contacto</a></div>
        	      
        </div>
      </div>
      </footer>
    </div> <!-- /container -->
    
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
    
    
   
    
    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="../js/jquery.js"></script>
    <script src="../js/bootstrap.min.js"></script>


<!-- Validate plugin -->
		<script src="assets/js/jquery.validate.js"></script>


<!-- Scripts validacion de campos -->
		<script src="validar.js"></script>
   
  </body>
</html>
<?php
mysql_free_result($rsChofer);

mysql_free_result($rsSolicitud);
?>
