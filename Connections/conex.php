<?php
# FileName="Connection_php_mysql.htm"
# Type="MYSQL"
# HTTP="true"
$hostname_conex = "localhost";
$database_conex = "u900787045_db";
$username_conex = "chofer";
$password_conex = "Da2jb3qFw8YQEjNm";
$conex = mysql_pconnect($hostname_conex, $username_conex, $password_conex) or trigger_error(mysql_error(),E_USER_ERROR); 
?>