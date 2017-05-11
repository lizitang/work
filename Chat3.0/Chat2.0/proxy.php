<?php
$url = (isset($_GET['url'])) ? $_GET['url'] : false;
if(!$url) exit;

$is_allowed = true; //deny abuse of your proxy from outside your site

$string = ($is_allowed) ? utf8_encode(file_get_contents($url)) : 'You are not allowed to use this proxy!';
$json = json_encode($string);
$callback = (isset($_GET['callback'])) ? $_GET['callback'] : false;
if($callback){
	$jsonp = "$callback($json)";
	header('Content-Type: application/javascript');
	echo $jsonp;
	exit;
}
echo $json;