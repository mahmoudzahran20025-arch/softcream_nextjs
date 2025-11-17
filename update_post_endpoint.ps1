# Update POST /orders/:id/update endpoint
$filePath = "C:/Users/mahmo/Documents/SERVER_SIDE/worker/softcream-api/src/routes/orders.js"
$content = Get-Content $filePath -Raw

# Find and replace the console.log line with enhanced version
$pattern = "console\.log\('âœ… Order status updated via webhook:', orderId, 'â†'', status\);"

$replacement = @"
// Add status history record
        const now = Date.now();
        try {
          await env.DB.prepare(`
            INSERT INTO order_status_history (order_id, status, timestamp, updated_by)
            VALUES (?, ?, ?, ?)
          `).bind(orderId, status, now, processedBy || 'admin').run();
        } catch (e) {
          console.warn('Failed to record status history:', e.message);
        }

        // Clear cache
        try {
          await env.CACHE.delete('tracking:' + orderId);
          console.log('Cache cleared for order:', orderId);
        } catch (e) {
          console.warn('Cache delete failed:', e.message);
        }

        console.log('Order status updated via webhook:', orderId, '->', status);
"@

$newContent = $content.Replace($pattern, $replacement)
Set-Content -Path $filePath -Value $newContent -Encoding UTF8

Write-Host "Updated POST endpoint with cache invalidation and status history!" -ForegroundColor Green