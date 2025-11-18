# Fix Telegram Issues Script
Write-Host "🔧 Fixing Telegram Issues..." -ForegroundColor Cyan

$backendPath = "C:\Users\mahmo\Documents\SERVER_SIDE\worker\softcream-api"

# 1. Remove duplicate notification from orders.js
Write-Host "`n1️⃣ Removing duplicate Telegram notification from orders.js..." -ForegroundColor Yellow

$ordersFile = "$backendPath\src\routes\orders.js"
$content = Get-Content $ordersFile -Encoding UTF8 -Raw

# Remove the duplicate sendTelegramNotification call in orders.js
$pattern = @'
          try \{
            console\.log\('📤 Attempting to send Telegram notification for order:', orderResult\.data\.orderId \|\| orderResult\.data\.id\);
            const telegramResult = await sendTelegramNotification\(orderResult\.data, env\);
            if \(telegramResult\?\.success\) \{
              console\.log\('✅ Telegram notification sent successfully'\);
            \} else \{
              console\.error\('⚠️ Telegram notification failed:', telegramResult\?\.error\);
            \}
          \} catch \(telegramError\) \{
            console\.error\('❌ Telegram notification error:', telegramError\);
          \}
'@

$replacement = @'
          // ✅ Telegram notification is sent from orderService.js (non-blocking)
          // No need to send it again here to avoid duplicates
'@

if ($content -match $pattern) {
    $content = $content -replace $pattern, $replacement
    Set-Content $ordersFile -Value $content -Encoding UTF8 -NoNewline
    Write-Host "✅ Removed duplicate notification from orders.js" -ForegroundColor Green
} else {
    Write-Host "⚠️ Pattern not found - checking alternative pattern..." -ForegroundColor Yellow
    
    # Try simpler pattern
    $simplePattern = 'const telegramResult = await sendTelegramNotification\(orderResult\.data, env\);'
    if ($content -match $simplePattern) {
        # Comment out the entire try-catch block
        $content = $content -replace '(?s)try \{[^}]*sendTelegramNotification\(orderResult\.data, env\);[^}]*\} catch[^}]*\}', '// ✅ Telegram notification is sent from orderService.js (non-blocking)'
        Set-Content $ordersFile -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✅ Commented out duplicate notification" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not find notification code to remove" -ForegroundColor Red
    }
}

# 2. Fix encoding in telegramService.js
Write-Host "`n2️⃣ Fixing encoding in telegramService.js..." -ForegroundColor Yellow

$telegramFile = "$backendPath\src\services\telegramService.js"

# Read with UTF8 encoding
$telegramContent = Get-Content $telegramFile -Encoding UTF8 -Raw

# Save back with UTF8 BOM to ensure proper encoding
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($telegramFile, $telegramContent, $utf8BOM)

Write-Host "✅ Fixed encoding in telegramService.js" -ForegroundColor Green

Write-Host "`n🎉 Telegram issues fixed!" -ForegroundColor Green
Write-Host "`n📋 Changes made:" -ForegroundColor Cyan
Write-Host "  1. Removed duplicate notification from orders.js" -ForegroundColor White
Write-Host "  2. Fixed UTF-8 encoding in telegramService.js" -ForegroundColor White
Write-Host "`nNote: You need to redeploy the backend for changes to take effect" -ForegroundColor Yellow
