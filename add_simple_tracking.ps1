# Add simple tracking endpoint
$filePath = "C:/Users/mahmo/Documents/SERVER_SIDE/worker/softcream-api/src/routes/orders.js"
$content = Get-Content $filePath -Raw

# Find insertion point after existing track endpoint
$pattern = "return jsonResponse\(await trackOrder\(orderId, env\), 200, origin\);\s*\n\s*\}"

$replacement = @"
return jsonResponse(await trackOrder(orderId, env), 200, origin);
    }

    // GET /api/orders/:id/tracking - Enhanced tracking with caching
    if (method === 'GET' && path.match(/^\/orders\/[^\/]+\/tracking$/)) {
      try {
        const pathParts = path.split('/');
        const orderId = pathParts[2];

        // Rate Limiting
        const identifier = getRateLimitIdentifier(request);
        const rateLimitCheck = await checkRateLimit(identifier, 'TRACKING_POLL', env);
        if (!rateLimitCheck.allowed) {
          return jsonResponse({ 
            success: false,
            error: 'Too many requests' 
          }, 429, origin, {
            'X-RateLimit-Remaining': '0',
            'Retry-After': rateLimitCheck.resetIn.toString()
          });
        }

        // Cache check
        const cacheKey = 'tracking:' + orderId;
        let cachedData = null;
        let cacheTimestamp = 0;
        
        try {
          const cached = await env.CACHE.get(cacheKey, 'json');
          if (cached && cached.data && cached.timestamp) {
            const cacheAge = Date.now() - cached.timestamp;
            if (cacheAge < 5000) {
              cachedData = cached.data;
              cacheTimestamp = cached.timestamp;
              console.log('Cache hit for tracking:', orderId);
            }
          }
        } catch (e) {
          console.warn('Cache read failed:', e.message);
        }

        // Conditional Request
        const ifModifiedSince = request.headers.get('If-Modified-Since');
        if (cachedData && ifModifiedSince) {
          const clientTime = new Date(ifModifiedSince).getTime();
          if (cacheTimestamp <= clientTime) {
            return new Response(null, {
              status: 304,
              headers: {
                'Access-Control-Allow-Origin': origin,
                'Last-Modified': new Date(cacheTimestamp).toUTCString(),
                'X-Cache': 'HIT'
              }
            });
          }
        }

        // Return cached data
        if (cachedData) {
          return jsonResponse(cachedData, 200, origin, {
            'X-Cache': 'HIT',
            'Last-Modified': new Date(cacheTimestamp).toUTCString(),
            'X-RateLimit-Remaining': rateLimitCheck.remaining.toString()
          });
        }

        // Fetch from DB
        console.log('Cache miss - fetching:', orderId);
        const trackingResult = await trackOrder(orderId, env);
        
        if (!trackingResult.success) {
          return jsonResponse(trackingResult, 404, origin);
        }

        // Save to cache
        const currentTimestamp = Date.now();
        try {
          await env.CACHE.put(cacheKey, JSON.stringify({
            data: trackingResult,
            timestamp: currentTimestamp
          }), { expirationTtl: 5 });
        } catch (e) {
          console.warn('Cache write failed:', e.message);
        }

        return jsonResponse(trackingResult, 200, origin, {
          'X-Cache': 'MISS',
          'Last-Modified': new Date(currentTimestamp).toUTCString(),
          'Cache-Control': 'private, max-age=5',
          'X-RateLimit-Remaining': rateLimitCheck.remaining.toString()
        });
      } catch (error) {
        console.error('Error fetching tracking data:', error);
        return jsonResponse({ 
          success: false, 
          error: error.message 
        }, 400, origin);
      }
    }
"@

$newContent = $content -replace $pattern, $replacement
Set-Content -Path $filePath -Value $newContent -Encoding UTF8

Write-Host "Added enhanced tracking endpoint!" -ForegroundColor Green