<#
Convert SVG to PNG and optimize images using ImageMagick (magick).

Usage (PowerShell):
  Set-ExecutionPolicy Bypass -Scope Process -Force
  cd "C:\Users\wzq33\宁夏文旅小程序"
  ./scripts/convert_and_optimize.ps1

Requirements:
- ImageMagick (with `magick` command) installed and on PATH.
  https://imagemagick.org/

What the script does:
- Converts SVG files in `images/` to PNG (120x120 for function icons).
- Optimizes JPG images in `images/` (strips metadata, sets progressive/interlace, compresses quality to 85).
- Resizes product images to 300x300 (center-crop) and banner images to 750x400 (center-crop).
- Leaves original SVG files intact and writes PNG siblings.
- Reports results.
#>

Write-Host "== Convert & Optimize Script =="

# Check for magick
$magick = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magick) {
    Write-Host "ImageMagick (magick) 未检测到。请先安装 ImageMagick 并确保 'magick' 在 PATH 中。"
    Write-Host "下载: https://imagemagick.org/"
    exit 1
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$imagesDir = Join-Path $repoRoot 'images'

if (-not (Test-Path $imagesDir)) {
    Write-Warning "images/ 目录不存在： $imagesDir"
    exit 1
}

# 1) Convert SVG icons -> PNG (120x120)
Write-Host "Converting SVG -> PNG (icons, 120x120)..."
Get-ChildItem -Path $imagesDir -Filter 'function-*.svg' -File | ForEach-Object {
    $svg = $_.FullName
    $png = [System.IO.Path]::ChangeExtension($svg, '.png')
    Write-Host "-> $($_.Name)  => $(Split-Path $png -Leaf)"
    & magick convert -background none $svg -resize 120x120^ -gravity center -extent 120x120 -strip -quality 90 $png
}

# 2) Resize & optimize banners (750x400)
Write-Host "Optimizing banners (750x400)..."
$banners = @('banner-1.jpg','banner-2.jpg')
foreach ($b in $banners) {
    $p = Join-Path $imagesDir $b
    if (Test-Path $p) {
        Write-Host "-> Optimizing $b"
        & magick convert $p -resize 1500x800^ -gravity center -extent 750x400 -strip -interlace Plane -quality 85 $p
    }
}

# 3) Resize & optimize products to 300x300
Write-Host "Optimizing products (300x300)..."
Get-ChildItem -Path $imagesDir -Filter 'product-*.jpg' -File | ForEach-Object {
    $p = $_.FullName
    Write-Host "-> Optimizing $($_.Name)"
    & magick convert $p -resize 600x600^ -gravity center -extent 300x300 -strip -interlace Plane -quality 85 $p
}

# 4) Global JPG optimization (fallback for any other jpg)
Write-Host "Applying global JPG optimization (quality 85, strip metadata)..."
Get-ChildItem -Path $imagesDir -Include *.jpg -File | ForEach-Object {
    $p = $_.FullName
    Write-Host "-> Recompress $($_.Name)"
    & magick convert $p -strip -interlace Plane -quality 85 $p
}

Write-Host "转换与优化完成。请检查 images/ 目录下的 PNG/JPG 文件。"
Write-Host "如果你想自动提交改动，回复 '提交'。"
