# Add new tracking endpoint to orders.js
$filePath = "C:/Users/mahmo/Documents/SERVER_SIDE/worker/softcream-api/src/routes/orders.js"
$content = Get-Content $filePath -Raw

# Find the position after the existing track endpoint
$insertAfter = "return jsonResponse(await trackOrder(orderId, env), 200, origin);`n    }"

$newEndpoint = @"
return jsonResponse(await trackOrder(orderId, env), 200, origin);
    }

    // ✅ GET /api/orders/:id/tracking - جلب بيانات التتبع الشاملة (محسن)
    if (method === 'GET' && path.match(/^\/orders\/[^\/]+\/tracking$/)) {
      try {
        const pathParts = path.split('/');
        const orderId = pathParts[2];

        // 🔒 Rate Limiting للـ Tracking
        const identifier = getRateLimitIdentifier(request);
        const rateLimitCheck = await checkRateLimit(identifier, 'TRACKING_POLL', env);
        if (!rateLimitCheck.allowed) {
          return jsonResponse({ 
            success: false,
            error: 'Too many tracking requests. Please wait.' 
          }, 429, origin, {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitCheck.resetIn.toString(),
            'Retry-After': rateLimitCheck.resetIn.toString()
          });
        }

        // 📦 محاولة قراءة من Cache أولاً
        const cacheKey = `tracking:${orderId}`;
        let cachedData = null;
        let cacheTimestamp = 0;
        
        try {
          const cached = await env.CACHE.get(cacheKey, 'json');
          if (cached && cached.data && cached.timestamp) {
            const cacheAge = Date.now() - cached.timestamp;
            if (cacheAge < 5000) { // 5 seconds TTL
              cachedData = cached.data;
              cacheTimestamp = cached.timestamp;
              console.log(`📦 Cache hit for tracking: ${orderId} (age: ${cacheAge}ms)`);
            }
          }
        } catch (e) {
          console.warn('⚠️ Cache read failed:', e.message);
        }

        // 🔄 Conditional Request - تحقق من If-Modified-Since
        const ifModifiedSince = request.headers.get('If-Modified-Since');
        if (cachedData && ifModifiedSince) {
          const clientTime = new Date(ifModifiedSince).getTime();
          if (cacheTimestamp <= clientTime) {
            console.log(`✅ Not Modified (304) for: ${orderId}`);
            return new Response(null, {
              status: 304,
              headers: {
                'Access-Control-Allow-Origin': origin,
                'Last-Modified': new Date(cacheTimestamp).toUTCString(),
                'Cache-Control': 'private, max-age=5',
                'X-Cache': 'HIT'
              }
            });
          }
        }

        // إذا كان Cache موجود وصالح، أرجعه
        if (cachedData) {
          return jsonResponse(cachedData, 200, origin, {
            'X-Cache': 'HIT',
            'Last-Modified': new Date(cacheTimestamp).toUTCString(),
            'Cache-Control': 'private, max-age=5',
            'X-RateLimit-Remaining': rateLimitCheck.remaining.toString()
          });
        }

        // جلب من DB - استخدام trackOrder الموجود
        console.log(`💾 Cache miss - fetching from DB: ${orderId}`);
        const trackingResult = await trackOrder(orderId, env);
        
        if (!trackingResult.success) {
          return jsonResponse(trackingResult, 404, origin);
        }

        // 💾 حفظ في Cache لمدة 5 ثواني
        const currentTimestamp = Date.now();
        try {
          await env.CACHE.put(cacheKey, JSON.stringify({
            data: trackingResult,
            timestamp: currentTimestamp
          }), { expirationTtl: 5 });
          console.log(`💾 Cached tracking data for: ${orderId}`);
        } catch (e) {
          console.warn('⚠️ Cache write failed:', e.message);
        }

        return jsonResponse(trackingResult, 200, origin, {
          'X-Cache': 'MISS',
          'Last-Modified': new Date(currentTimestamp).toUTCString(),
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
"@

$newContent = $content.Replace($insertAfter, $newEndpoint)
Set-Content -Path $filePath -Value $newContent -Encoding UTF8

Write-Host "✅ Added new tracking endpoint with caching and rate limiting!" -ForegroundColor Green