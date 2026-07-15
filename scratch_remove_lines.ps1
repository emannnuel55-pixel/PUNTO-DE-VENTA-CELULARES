$file = "C:\Users\jesriver\Documents\PUNTO-DE-VENTA-CELULARES\app\globals.css"
$lines = Get-Content $file -Encoding UTF8
Write-Host "Total lines: $($lines.Count)"

# Keep lines 1-2424 (index 0-2423) and lines 3574+ (index 3573+)
$before = $lines[0..2423]
$after = $lines[3573..($lines.Count - 1)]

$newContent = $before + $after
Write-Host "New total lines: $($newContent.Count)"

# Write back
$newContent | Set-Content $file -Encoding UTF8
Write-Host "Done! File written successfully."
