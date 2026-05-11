#!/bin/bash
# post-deploy-check.sh - Validación post-despliegue del sistema de avatar
# Uso: bash scripts/post-deploy-check.sh [base_url]
# Ejemplo: bash scripts/post-deploy-check.sh http://localhost:3001

set -e
BASE="${1:-http://localhost:3001}"
PASS=0
FAIL=0
RESULTS=()

check() {
  local desc="$1" result="$2"
  if [ "$result" = "PASS" ]; then
    echo "  ✅ $desc"
    ((PASS++))
    RESULTS+=("PASS: $desc")
  else
    echo "  ❌ $desc"
    ((FAIL++))
    RESULTS+=("FAIL: $desc")
  fi
}

echo ""
echo "=============================================="
echo "  Post-Deploy Validation - Avatar System"
echo "  Base URL: $BASE"
echo "=============================================="
echo ""

# 1. Health check
echo "[1] Backend health"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$BASE/health" 2>/dev/null || echo "000")
[ "$HTTP" = "200" ] && check "Health endpoint (200)" "PASS" || check "Health endpoint" "FAIL"

# 2. Login endpoint
echo ""
echo "[2] Authentication"
TOKEN=$(curl -s -m 5 "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(d['data']['token'])
except: print('FAIL')
" 2>/dev/null)
if [ "$TOKEN" != "FAIL" ] && [ -n "$TOKEN" ]; then
  check "Login returns token" "PASS"
  HAS_AVATAR=$(curl -s -m 5 "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123"}' 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print('PASS' if 'avatar' in d['data']['user'] else 'FAIL')
except: print('FAIL')
" 2>/dev/null)
  check "Login returns avatar field" "$HAS_AVATAR"
else
  check "Login returns token" "FAIL"
  TOKEN=""
fi

# 3. Avatar endpoint exists
echo ""
echo "[3] Avatar endpoints"
if [ -n "$TOKEN" ]; then
  # No auth
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -m 5 -X POST "$BASE/api/users/me/avatar" 2>/dev/null || echo "000")
  [ "$HTTP" = "401" ] && check "POST /me/avatar sin auth → 401" "PASS" || check "POST /me/avatar sin auth → $HTTP" "FAIL"

  # No file
  ERR=$(curl -s -m 5 -X POST "$BASE/api/users/me/avatar" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print('PASS' if d.get('error') else 'FAIL')
except: print('FAIL')
" 2>/dev/null)
  check "POST /me/avatar sin archivo → error" "$ERR"

  # Valid upload (create PNG inline)
  PNG_CHECK=$(python3 -c "
import struct,zlib,subprocess,json
sig=b'\x89PNG\r\n\x1a\n'
ihdr=struct.pack('>I',13)+b'IHDR'+struct.pack('>IIBBBBB',2,2,8,2,0,0,0)+struct.pack('>I',zlib.crc32(b'IHDR'+struct.pack('>IIBBBBB',2,2,8,2,0,0,0)))
raw=b''.join(b'\x00'+b'\x00\x00\xff'*2 for _ in range(2))
comp=zlib.compress(raw)
idat=struct.pack('>I',len(comp))+b'IDAT'+comp+struct.pack('>I',zlib.crc32(b'IDAT'+comp))
iend=struct.pack('>I',0)+b'IEND'+struct.pack('>I',zlib.crc32(b'IEND'))
with open('/tmp/deploy-test.png','wb') as f: f.write(sig+ihdr+idat+iend)
r=json.loads(subprocess.run(['curl','-s','-m','10','-X','POST','$BASE/api/users/me/avatar','-H','Authorization: Bearer $TOKEN','-F','avatar=@/tmp/deploy-test.png'],capture_output=True,text=True).stdout)
print('PASS' if r.get('success') else r.get('error','FAIL'))
AVATAR=r.get('data',{}).get('user',{}).get('avatar','')
print(AVATAR)
  " 2>/dev/null)
  UPLOAD_RESULT=$(echo "$PNG_CHECK" | head -1)
  AVATAR_URL=$(echo "$PNG_CHECK" | tail -1)
  check "Upload válido → success" "$UPLOAD_RESULT"

  if [ -n "$AVATAR_URL" ]; then
    # HTTP access
    HTTP=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "http://localhost:80$AVATAR_URL" 2>/dev/null || echo "000")
    [ "$HTTP" = "200" ] && check "Nginx sirve avatar (200)" "PASS" || check "Nginx sirve avatar ($HTTP)" "FAIL"

    CT=$(curl -s -o /dev/null -w "%{content_type}" -m 5 "http://localhost:80$AVATAR_URL" 2>/dev/null || echo "")
    [ "$CT" = "image/png" ] && check "Content-Type correcto (image/png)" "PASS" || check "Content-Type correcto ($CT)" "FAIL"

    # Delete
    DEL_RESULT=$(curl -s -m 5 -X DELETE "$BASE/api/users/me/avatar" \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print('PASS' if d.get('success') and d.get('data',{}).get('user',{}).get('avatar') is None else 'FAIL')
except: print('FAIL')
" 2>/dev/null)
    check "DELETE → avatar null" "$DEL_RESULT"
  fi

  # Delete without avatar
  DEL2=$(curl -s -m 5 -X DELETE "$BASE/api/users/me/avatar" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print('PASS' if d.get('success') else 'FAIL')
except: print('FAIL')
" 2>/dev/null)
  check "DELETE sin avatar → success" "$DEL2"
else
  echo "  ⚠️  Saltando tests de avatar (no hay token)"
fi

# 4. Verify endpoint
echo ""
echo "[4] /auth/verify"
if [ -n "$TOKEN" ]; then
  VERIFY=$(curl -s -m 5 -X POST "$BASE/api/auth/verify" \
    -H "Content-Type: application/json" \
    -d "{\"token\": \"$TOKEN\"}" 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print('PASS' if d.get('success') and 'avatar' in d.get('data',{}).get('user',{}) else 'FAIL')
except: print('FAIL')
" 2>/dev/null)
  check "Verify retorna avatar" "$VERIFY"
fi

# 5. Frontend
echo ""
echo "[5] Frontend"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "http://localhost:3000/profile/edit" 2>/dev/null || echo "000")
[ "$HTTP" = "200" ] && check "Frontend /profile/edit (200)" "PASS" || check "Frontend /profile/edit ($HTTP)" "FAIL"

# Summary
echo ""
echo "=============================================="
echo "  Results: $PASS passed, $FAIL failed"
echo "=============================================="

# Cleanup
rm -f /tmp/deploy-test.png

exit $FAIL
