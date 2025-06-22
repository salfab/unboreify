#!/bin/bash

echo "🔍 Debugging Netlify Dev API Proxy Issues"
echo "=========================================="
echo ""

echo "📋 Current Configuration:"
echo "-------------------------"
echo "✓ netlify.toml redirects:"
cat netlify.toml | grep -A 2 "from.*deejai"
echo ""
echo "✓ _redirects file:"
head -2 public/_redirects
echo ""

echo "🌐 Environment Variables:"
echo "-------------------------"
echo "VITE_API_URL: $(grep VITE_API_URL .env)"
echo ""

echo "🧪 Testing API Endpoints:"
echo "-------------------------"
echo "Testing deej.ai proxy..."
curl -I http://localhost:8888/api/deejai/health 2>/dev/null | head -1 || echo "❌ Failed to connect"
echo ""

echo "🔧 Recommended Steps:"
echo "--------------------"
echo "1. Stop netlify dev if running"
echo "2. Clear browser cache"
echo "3. Run: netlify dev --debug"
echo "4. Check that Vite dev server is running on port 5173"
echo "5. Check that Netlify Dev is proxying to port 5173"
echo ""
echo "🐛 If still not working, try:"
echo "- Kill all node processes: pkill -f node"
echo "- Delete node_modules and reinstall: rm -rf node_modules && pnpm install"
echo "- Use regular 'pnpm run dev' instead of 'netlify dev' for testing"
