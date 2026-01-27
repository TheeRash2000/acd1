# Extract Heart Runs (Faction Trade Missions) items from items.xml
# PowerShell fallback script
#
# Usage:
#   .\scripts\extract-heart-items.ps1
#   .\scripts\extract-heart-items.ps1 -ItemsXmlPath "C:\path\to\items.xml"
#
# Pipe output to file:
#   .\scripts\extract-heart-items.ps1 > heart-items.txt

param(
    [string]$ItemsXmlPath = "src\data\items.xml"
)

$ErrorActionPreference = "Stop"

Write-Host "🔍 Extracting heart run items from items.xml..." -ForegroundColor Cyan

# Check if file exists
if (-not (Test-Path $ItemsXmlPath)) {
    Write-Host "❌ items.xml not found at: $ItemsXmlPath" -ForegroundColor Red
    exit 1
}

# Define patterns
$tokenPattern = "T1_FACTION_(FOREST|HIGHLAND|STEPPE|MOUNTAIN|SWAMP|CAERLEON)_TOKEN_\d+"
$heartPattern = "HEART"
$fragmentPattern = "FRAGMENT"

Write-Host "📂 Loading: $ItemsXmlPath" -ForegroundColor Green

# Load XML and extract unique names
try {
    [xml]$xml = Get-Content $ItemsXmlPath
    $items = $xml.items.item | Select-Object -ExpandProperty "unique_name" -ErrorAction SilentlyContinue
    
    if (-not $items) {
        Write-Host "❌ Could not parse items.xml" -ForegroundColor Red
        exit 1
    }

    Write-Host "✓ Found $($items.Count) items`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error parsing XML: $_" -ForegroundColor Red
    exit 1
}

# Extract tokens
Write-Host "🎟️  Faction Tokens:" -ForegroundColor Yellow
$tokens = $items | Where-Object { $_ -match $tokenPattern } | Sort-Object
$tokens | ForEach-Object { Write-Host "  - $_" }
Write-Host "  Count: $($tokens.Count)" -ForegroundColor Gray

# Extract hearts
Write-Host "`n❤️  Hearts:" -ForegroundColor Yellow
$hearts = $items | Where-Object { $_ -like "*$heartPattern*" } | Sort-Object
$hearts | ForEach-Object { Write-Host "  - $_" }
Write-Host "  Count: $($hearts.Count)" -ForegroundColor Gray

# Extract fragments
Write-Host "`n💔 Fragments:" -ForegroundColor Yellow
$fragments = $items | Where-Object { $_ -like "*$fragmentPattern*" } | Sort-Object
$fragments | ForEach-Object { Write-Host "  - $_" }
Write-Host "  Count: $($fragments.Count)" -ForegroundColor Gray

Write-Host "`n✅ Extraction complete!" -ForegroundColor Green
