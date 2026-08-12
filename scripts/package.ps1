$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $projectRoot "x-promotion-filter-firefox.zip"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
}

$archive = [System.IO.Compression.ZipFile]::Open(
    $outputPath,
    [System.IO.Compression.ZipArchiveMode]::Create
)

try {
    $files = @(
        Get-Item -LiteralPath (Join-Path $projectRoot "manifest.json")
        Get-ChildItem -LiteralPath (Join-Path $projectRoot "src") -File -Recurse
        Get-ChildItem -LiteralPath (Join-Path $projectRoot "ui") -File -Recurse
    )

    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($projectRoot.Length + 1)
        $entryName = $relativePath.Replace("\", "/")

        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive,
            $file.FullName,
            $entryName,
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
}
finally {
    $archive.Dispose()
}

Write-Output "Created $outputPath"
