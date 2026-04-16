# Real-Weave Global Intelligence Platform - Ignition Script
Write-Host "--- INITIALIZING REAL-WEAVE MISSION CONTROL ---" -ForegroundColor Cyan

# 1. Start Backend Signal Relay (Port 8000)
Write-Host "[1/2] Launching Backend Neural Relay..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python main.py"

# 2. Wait for backend to bind (briefly)
Start-Sleep -Seconds 2

# 3. Start Frontend Intelligence Hub (Port 3000)
Write-Host "[2/2] Launching Frontend Intelligence Hub..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nSYSTEM STATUS: INITIALIZING" -ForegroundColor Cyan
Write-Host "Connect to Dashbord: http://localhost:3000" -ForegroundColor White
Write-Host "Connect to API: http://localhost:8000" -ForegroundColor White
Write-Host "`nMonitoring both processes in separate consoles..." -ForegroundColor Gray
