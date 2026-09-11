$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "C:\Users\basit\Dropbox\My PC (LAPTOP-L7PDQOB1)\Downloads\Code\smartcare\screenshots"
$artifactDir = "C:\Users\basit\.gemini\antigravity\brain\d3309552-c191-476a-8ae5-2ae478b30083"
$tempProf = Join-Path $env:TEMP "smartcare_shot_prof"

if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir }

$pages = @(
    @{ Name = "landingpage.png"; Url = "http://localhost:5173/" },
    @{ Name = "login.png"; Url = "http://localhost:5173/login" },
    @{ Name = "booking_feature.png"; Url = "http://localhost:5173/dashboard/patient/apply/1?demo=patient" },
    @{ Name = "patient_dashboard.png"; Url = "http://localhost:5173/dashboard/patient?demo=patient" },
    @{ Name = "medical_passport.png"; Url = "http://localhost:5173/dashboard/patient/history?demo=patient" },
    @{ Name = "doctor_workspace.png"; Url = "http://localhost:5173/dashboard/hospital?demo=doctor" },
    @{ Name = "ambulance_dispatch.png"; Url = "http://localhost:5173/ambulance" },
    @{ Name = "donor_network.png"; Url = "http://localhost:5173/donate" },
    @{ Name = "pharmacy_verification.png"; Url = "http://localhost:5173/verify-rx" },
    @{ Name = "hospital_analytics.png"; Url = "http://localhost:5173/dashboard/analytics?demo=staff" }
)

foreach ($p in $pages) {
    $targetFile = Join-Path $outDir $p.Name
    $logFile = Join-Path $env:TEMP ("log_" + $p.Name + ".txt")
    Write-Host "Capturing $($p.Name) from $($p.Url)..."
    
    $cmd = "`"$chrome`" --headless=new --no-sandbox --disable-gpu --virtual-time-budget=4500 --window-size=1440,900 --user-data-dir=`"$tempProf`" --screenshot=`"$targetFile`" `"$($p.Url)`""
    cmd /c "$cmd > `"$logFile`" 2>&1"
    
    if (Test-Path $targetFile) {
        $len = (Get-Item $targetFile).Length
        Write-Host "  Success: $($p.Name) ($len bytes)"
        Copy-Item -Force -Path $targetFile -Destination (Join-Path $artifactDir $p.Name)
    } else {
        Write-Host "  Failed to capture $($p.Name). Log:"
        if (Test-Path $logFile) { Get-Content $logFile }
    }
}

Write-Host "All captures finished."
