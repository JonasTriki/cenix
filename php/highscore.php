<?php
$difficulty = $_POST["difficulty"];
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

$sql = "SELECT * FROM highscore WHERE difficulty=" . $difficulty;
$result = $conn->query($sql);


if ($result->num_rows > 0) {
    $hs = array();
    while($row = $result->fetch_assoc()) {
        array_push($hs, array("name" => $row["name"], "points" => (int)$row["points"], "difficulty" => (int)$row["difficulty"], "timestamp" => (int)$row["timestamp"]));
    }
    echo json_encode($hs);
} else {
    echo "";
}

$conn->close();
?>