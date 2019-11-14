<?php
ini_set('error_reporting', E_ALL );
ini_set('display_errors', 1 );

require_once __DIR__.'/SimpleXLSX.php';

$excel = isset($_FILES['excel']) ? 'xlxs' : NULL;

if (!file_exists("../excelfiles/")) {
    mkdir("../excelfiles/", 0777, true);
    }

if (array_key_exists("excel",$_FILES))
{
    $filename = "../excelfiles/" .$_FILES['excel']['name'][0];
    move_uploaded_file($_FILES['excel']['tmp_name'][0],$filename);
}

if ($xlsx = SimpleXLSX::parse('../excelfiles/'.$_FILES['excel']['name'][0])) {
    $detail =  $xlsx->rows();
    echo json_encode(array(
        "status" => 1,
        "detail" => $detail
    ));
} else {
	echo SimpleXLSX::parseError();
}
?>