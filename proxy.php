<?php
$url = $_REQUEST['url'];
//echo $url;
if (preg_match('/\b(https?|ftp):\/\/*/', $url) !== 1) die;
echo (file_get_contents($url));
?>