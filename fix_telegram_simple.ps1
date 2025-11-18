# Fix Telegram Duplicate Notifications
Write-Host "Fixing Telegram duplicate notifications..." -ForegroundColor Cyan

$backendPath = "C:\Users\mahmo\Documents\SERVER_SIDE\worker\softcream-api"
$ordersFile = "$backendPath\src\routes\orders.js"

# Read file
$content = Get-Content $ordersFile -Encoding UTF8 -Raw

# Find and comment out the duplicate notification
$oldCode = @"
          try {
            console.log('📤 Attempting to send Telegram notification for order:', orderResult.data.orderId || orderResult.data.id);
            const telegramResult = await sendTelegramNotification(orderResult.data, env);
            if (telegramResult?.success) {
              console.log('✅ Telegram notification sent successfully');
            } else {
              console.error('⚠️ Telegram notification failed:', telegramResult?.error);
            }
          } catch (telegramError) {
            console.error('❌ Telegram notification error:', telegramError);
          }
"@

$newCode = @"
          // ✅ Telegram notification is sent from orderService.js (non-blocking)
          // Removed duplicate notification to avoid sending twice
"@

if ($content.Contains("sendTelegramNotification(orderResult.data, env)")) {
    $content = $content.Replace($oldCode, $newCode)
    Set-Content $ordersFile -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Done! Duplicate notification removed." -ForegroundColor Green
} else {
    Write-Host "Notification code not found or already fixed." -ForegroundColor Yellow
}
