# Insert cache invalidation before line 224
$filePath = "C:/Users/mahmo/Documents/SERVER_SIDE/worker/softcream-api/src/routes/orders.js"
$lines = Get-Content $filePath

$insertIndex = 223  # Before line 224 (0-based index)

$newCode = @(
    "",
    "        // Add status history record",
    "        const now = Date.now();",
    "        try {",
    "          await env.DB.prepare(\`",
    "            INSERT INTO order_status_history (order_id, status, timestamp, updated_by)",
    "            VALUES (?, ?, ?, ?)",
    "          \`).bind(orderId, status, now, processedBy || 'admin').run();",
    "        } catch (e) {",
    "          console.warn('Failed to record status history:', e.message);",
    "        }",
    "",
    "        // Clear cache",
    "        try {",
    "          await env.CACHE.delete('tracking:' + orderId);",
    "          console.log('Cache cleared for order:', orderId);",
    "        } catch (e) {",
    "          console.warn('Cache delete failed:', e.message);",
    "        }",
    ""
)

# Insert the new code
$newLines = @()
$newLines += $lines[0..($insertIndex-1)]
$newLines += $newCode
$newLines += $lines[$insertIndex..($lines.Count-1)]

Set-Content -Path $filePath -Value $newLines -Encoding UTF8
Write-Host "Successfully added cache invalidation and status history!" -ForegroundColor Green