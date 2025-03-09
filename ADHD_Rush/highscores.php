<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$dbname = 'adhd_rush';
$username = 'root';
$password = ''; // wpisz swoje hasło do MySQL

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $nickname = filter_input(INPUT_POST, 'nickname', FILTER_SANITIZE_STRING);
        $score = filter_input(INPUT_POST, 'score', FILTER_VALIDATE_INT);
        
        $stmt = $db->prepare("INSERT INTO highscores (nickname, score) VALUES (?, ?)");
        $stmt->execute([$nickname, $score]);
        
        echo json_encode(['status' => 'success']);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $db->query("SELECT nickname, score, date FROM highscores ORDER BY score DESC LIMIT 10");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
