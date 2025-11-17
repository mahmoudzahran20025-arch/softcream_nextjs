# Fix orders.js file
$filePath = "C:/Users/mahmo/Documents/SERVER_SIDE/worker/softcream-api/src/routes/orders.js"
$content = Get-Content $filePath -Raw

# Find and fix the broken section around line 183
$pattern = "          'Cache-Control': 'private, max-age=5',\s+// Update order status"
$replacement = @"
          'Cache-Control': 'private, max-age=5',
          'X-RateLimit-Remaining': rateLimitCheck.remaining.toString()
        });
      } catch (error) {
        console.error('❌ Error fetching tracking data:', error);
        return jsonResponse({ 
          success: false, 
          error: error.message 
        }, 400, origin);
      }
    }

    // ✅ DELETE /api/orders/:id/cancel - إلغاء الطلب
    if (method === 'DELETE' && path.match(/^\/orders\/[^\/]+\/cancel$/)) {
      try {
        const pathParts = path.split('/');
        const orderId = pathParts[2];
        const result = await cancelOrder(orderId, env);
        return jsonResponse(result, 200, origin);
      } catch (error) {
        return jsonResponse({ 
          success: false, 
          error: error.message,
          message: error.message.includes('Cancel period expired') 
            ? 'انتهت فترة الإلغاء المسموحة (5 دقائق)'
            : error.message
        }, 400, origin);
      }
    }

    // ✅ PUT /api/orders/:id - تعديل الطلب
    if (method === 'PUT' && path.match(/^\/orders\/[^\/]+$/)) {
      try {
        const pathParts = path.split('/');
        const orderId = pathParts[2];
        const { items } = body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
          return jsonResponse({ 
            success: false, 
            error: 'Items array is required and must not be empty' 
          }, 400, origin);
        }

        const { editOrder } = await import('../services/orderService.js');
        const result = await editOrder(orderId, items, env);

        if (!result.success) {
          return jsonResponse({ 
            success: false, 
            error: result.error || 'Failed to edit order' 
          }, 400, origin);
        }

        return jsonResponse({ 
          success: true, 
          data: result.data 
        }, 200, origin);
      } catch (error) {
        return jsonResponse({ 
          success: false, 
          error: error.message 
        }, 400, origin);
      }
    }

    // ✅ POST /api/orders/:id/update - تحديث حالة الطلب
    if (method === 'POST' && path.match(/^\/orders\/[^\/]+\/update$/)) {
      try {
        const pathParts = path.split('/');
        const orderId = pathParts[2];
        const { status, processedBy, estimatedMinutes } = body;
        
        if (!status) {
          return jsonResponse({ 
            success: false, 
            error: 'Status is required' 
          }, 400, origin);
        }

        // Update order status
"@

$newContent = $content -replace [regex]::Escape($pattern), $replacement

Set-Content -Path $filePath -Value $newContent -Encoding UTF8

Write-Host "✅ File fixed!" -ForegroundColor Green
