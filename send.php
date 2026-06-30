<?php
/* ============================================================================
   send.php — приём заявки с формы и отправка её на email.
   Работает на хостинге Beget (PHP + функция mail()).

   КАК НАСТРОИТЬ:
   1. Впишите ниже e-mail, куда должны приходить заявки (RECIPIENT).
   2. FROM должен быть на вашем домене (иначе письма уходят в спам).
      Заведите в Beget почтовый ящик, напр. noreply@anchorplus.ru,
      и укажите его в FROM.
   ========================================================================== */

// --- НАСТРОЙКИ (замените на реальные значения) ---------------------------
// RECIPIENT: куда приходят заявки (указал заказчик).
const RECIPIENT = 'info@anchor-plus.ru';
// FROM: технический ящик на домене сайта (создаётся в Beget → Почта). НЕ менять.
const FROM       = 'zayavki@anchorplus.ru';
const SITE_NAME  = 'Anchor Plus';
// ------------------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');

// Принимаем только POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method']);
    exit;
}

// Простейшая защита от ботов: скрытое поле должно быть пустым
if (!empty($_POST['website'])) {
    // бот заполнил ловушку — делаем вид, что всё ок, но ничего не шлём
    echo json_encode(['ok' => true]);
    exit;
}

// Собираем и чистим поля
function field(string $name, int $max = 1000): string {
    $v = isset($_POST[$name]) ? (string) $_POST[$name] : '';
    $v = trim($v);
    $v = mb_substr($v, 0, $max);
    // убираем переводы строк из однострочных полей-заголовков (анти-инъекция)
    return $v;
}

$name      = field('name', 200);
$phone     = field('phone', 50);
$company   = field('company', 200);
$cargo     = field('cargo', 200);
$direction = field('direction', 300);
$message   = field('message', 4000);
$consent   = isset($_POST['consent']) && $_POST['consent'] !== '' && $_POST['consent'] !== '0';

// Серверная валидация обязательных полей
$phoneDigits = preg_replace('/\D/', '', $phone);
$errors = [];
if ($name === '')                  $errors[] = 'name';
if (strlen($phoneDigits) < 10)     $errors[] = 'phone';
if (!$consent)                     $errors[] = 'consent';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation', 'fields' => $errors]);
    exit;
}

// Формируем письмо
$lines = [
    'Новая заявка с сайта ' . SITE_NAME,
    '',
    'Имя:         ' . $name,
    'Телефон:     ' . $phone,
    'Компания:    ' . ($company   !== '' ? $company   : '—'),
    'Тип груза:   ' . ($cargo     !== '' ? $cargo     : '—'),
    'Направление: ' . ($direction !== '' ? $direction : '—'),
    'Сообщение:   ' . ($message   !== '' ? $message   : '—'),
    '',
    'Время: ' . date('Y-m-d H:i:s'),
    'IP:    ' . ($_SERVER['REMOTE_ADDR'] ?? '—'),
];
$body = implode("\n", $lines);

$subject = '=?UTF-8?B?' . base64_encode('Заявка с сайта ' . SITE_NAME) . '?=';

$headers   = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . SITE_NAME . ' <' . FROM . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = @mail(RECIPIENT, $subject, $body, implode("\r\n", $headers), '-f' . FROM);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'mail']);
}
