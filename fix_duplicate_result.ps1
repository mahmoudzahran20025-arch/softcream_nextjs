# Fix duplicate result variable
$filePath = "C:/Users/mahmo/Documents/SERVER_SIDE/worker/softcream-api/src/services/telegramService.js"
$content = Get-Content $filePath -Raw

# Replace the second occurrence of "const result" with "const updateResult"
$lines = Get-Content $filePath
$newLines = @()
$resultCount = 0

foreach ($line in $lines) {
    if ($line -match "^\s*const result = await env\.DB\.prepare") {
        $resultCount++
        if ($resultCount -eq 3) {  # Third occurrence (line 414)
            $newLine = $line -replace "const result", "const updateResult"
            $newLines += $newLine
        } else {
            $newLines += $line
        }
    } elseif ($line -match "if \(result\.changes === 0\)" -and $resultCount -eq 3) {
        $newLine = $line -replace "result\.changes", "updateResult.changes"
        $newLines += $newLine
    } else {
        $newLines += $line
    }
}

Set-Content -Path $filePath -Value $newLines -Encoding UTF8
Write-Host "Fixed duplicate result variable!" -ForegroundColor Green