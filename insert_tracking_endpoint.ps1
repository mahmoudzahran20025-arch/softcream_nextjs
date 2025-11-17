# Insert new tracking endpoint
$filePath = "C:/Users/mahmo/Documents/SERVER_SIDE/worker/softcream-api/src/routes/orders.js"
$lines = Get-Content $filePath

# Find the line with "return jsonResponse(await trackOrder(orderId, env), 200, origin);"
$insertIndex = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "return jsonResponse\(await trackOrder\(orderId, env\), 200, origin\);") {
        $insertIndex = $i + 1  # Insert after the closing brace
        break
    }
}

if ($insertIndex -eq -1) {
    Write-Host "❌ Could not find insertion point" -ForegroundColor Red
    exit
}

# Find the closing brace
while ($insertIndex -lt $lines.Count -and $lines[$insertIndex] -notmatch "^\s*}") {
    $insertIndex++
}
$insertIndex++ # After the closing brace

$newEndpoint = @(
    "",
    "    // ✅ GET /api/orders/:id/tracking - جلب بيانات التتبع الشاملة (محسن)",
    "    if (method === 'GET' && path.match(/^\/orders\/[^\/]+\/tracking$/)) {",
    "      try {",
    "        const pathParts = path.split('/');",
    "        const orderId = pathParts[2];",
    "",
    "        // 🔒 Rate Limiting للـ Tracking",
    "        const identifier = getRateLimitIdentifier(request);",
    "        const rateLimitCheck = await checkRateLimit(identifier, 'TRACKING_POLL', env);",
    "        if (!rateLimitCheck.allowed) {",
    "          return jsonResponse({ ",
    "            success: false,",
    "            error: 'Too many tracking requests' ",
    "          }, 429, origin, {",
    "            'X-RateLimit-Remaining': '0',",
    "            'Retry-After': rateLimitCheck.resetIn.toString()",
    "          });",
    "        }",
    "",
    "        // 📦 محاولة قراءة من Cache أولاً",
    "        const cacheKey = `tracking:`+orderId;",
    "        let cachedData = null;",
    "        let cacheTimestamp = 0;",
    "        ",
    "        try {",
    "          const cached = await env.CACHE.get(cacheKey, 'json');",
    "          if (cached && cached.data && cached.timestamp) {",
    "            const cacheAge = Date.now() - cached.timestamp;",
    "            if (cacheAge < 5000) {",
    "              cachedData = cached.data;",
    "              cacheTimestamp = cached.timestamp;",
    "              console.log('📦 Cache hit for tracking:', orderId);",
    "            }",
    "          }",
    "        } catch (e) {",
    "          console.warn('⚠️ Cache read failed:', e.message);",
    "        }",
    "",
    "        // 🔄 Conditional Request",
    "        const ifModifiedSince = request.headers.get('If-Modified-Since');",
    "        if (cachedData && ifModifiedSince) {",
    "          const clientTime = new Date(ifModifiedSince).getTime();",
    "          if (cacheTimestamp <= clientTime) {",
    "            return new Response(null, {",
    "              status: 304,",
    "              headers: {",
    "                'Access-Control-Allow-Origin': origin,",
    "                'Last-Modified': new Date(cacheTimestamp).toUTCString(),",
    "                'X-Cache': 'HIT'",
    "              }",
    "            });",
    "          }",
    "        }",
    "",
    "        // إذا كان Cache موجود، أرجعه",
    "        if (cachedData) {",
    "          return jsonResponse(cachedData, 200, origin, {",
    "            'X-Cache': 'HIT',",
    "            'Last-Modified': new Date(cacheTimestamp).toUTCString(),",
    "            'X-RateLimit-Remaining': rateLimitCheck.remaining.toString()",
    "          });",
    "        }",
    "",
    "        // جلب من DB",
    "        console.log('💾 Cache miss - fetching:', orderId);",
    "        const trackingResult = await trackOrder(orderId, env);",
    "        ",
    "        if (!trackingResult.success) {",
    "          return jsonResponse(trackingResult, 404, origin);",
    "        }",
    "",
    "        // 💾 حفظ في Cache",
    "        const currentTimestamp = Date.now();",
    "        try {",
    "          await env.CACHE.put(cacheKey, JSON.stringify({",
    "            data: trackingResult,",
    "            timestamp: currentTimestamp",
    "          }), { expirationTtl: 5 });",
    "        } catch (e) {",
    "          console.warn('⚠️ Cache write failed:', e.message);",
    "        }",
    "",
    "        return jsonResponse(trackingResult, 200, origin, {",
    "          'X-Cache': 'MISS',",
    "          'Last-Modified': new Date(currentTimestamp).toUTCString(),",
    "          'Cache-Control': 'private, max-age=5',",
    "          'X-RateLimit-Remaining': rateLimitCheck.remaining.toString()",
    "        });",
    "      } catch (error) {",
    "        console.error('❌ Error fetching tracking data:', error);",
    "        return jsonResponse({ ",
    "          success: false, ",
    "          error: error.message ",
    "        }, 400, origin);",
    "      }",
    "    }"
)

# Insert the new endpoint
$newLines = @()
$newLines += $lines[0..($insertIndex-1)]
$newLines += $newEndpoint
$newLines += $lines[$insertIndex..($lines.Count-1)]

Set-Content -Path $filePath -Value $newLines -Encoding UTF8
Write-Host "✅ Successfully added tracking endpoint at line $insertIndex!" -ForegroundColor Green