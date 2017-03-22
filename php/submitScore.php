<?php
$name = $_POST["name"];
$points = $_POST["points"];
$diff = $_POST["difficulty"];
$timestamp = $_POST["timestamp"];
$ok = ($name != "") && ($score >= 0) && ($diff > -1) && ($timestamp > 0);
if (!$ok) {
    echo "invalid";
    exit();
}

$servername = "localhost";
$username = "cenix";
$password = "5xCTEp9jrud9qCb8";
$dbname = "cenix";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$sql = "INSERT INTO highscore (name, points, difficulty, timestamp) VALUES ('" . $name . "', " . $points . ", " . $diff . ", " . $timestamp . ")";

if ($conn->query($sql) === true) {
    echo "ok";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>