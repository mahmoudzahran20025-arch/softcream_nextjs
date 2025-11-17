# Simple insertion
$filePath = "C:/Users/mahmo/Documents/SERVER_SIDE/worker/softcream-api/src/routes/orders.js"
$lines = Get-Content $filePath
$cacheCode = Get-Content "cache_code.txt"

$insertIndex = 223  # Before line 224

# Insert the new code
$newLines = @()
$newLines += $lines[0..($insertIndex-1)]
$newLines += ""
$newLines += $cacheCode
$newLines += ""
$newLines += $lines[$insertIndex..($lines.Count-1)]

Set-Content -Path $filePath -Value $newLines -Encoding UTF8
Write-Host "Added cache invalidation!" -ForegroundColor Green