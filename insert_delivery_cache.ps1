# Insert cache code in delivery status update
$filePath = "C:/Users/mahmo/Documents/SERVER_SIDE/worker/softcream-api/src/services/telegramService.js"
$lines = Get-Content $filePath
$cacheCode = Get-Content "telegram_cache_code.txt"

$insertIndex = 259  # Before line 260

# Insert the new code
$newLines = @()
$newLines += $lines[0..($insertIndex-1)]
$newLines += ""
$newLines += $cacheCode
$newLines += ""
$newLines += $lines[$insertIndex..($lines.Count-1)]

Set-Content -Path $filePath -Value $newLines -Encoding UTF8
Write-Host "Added cache invalidation to delivery status update!" -ForegroundColor Green