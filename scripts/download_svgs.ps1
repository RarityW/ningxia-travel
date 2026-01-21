# 下载首页功能入口 SVG 到 images/ 目录
# 在 PowerShell（Windows）中运行：
#   ./scripts/download_svgs.ps1
# 本脚本默认使用 images/manifest.json 中的 svg_defaults 映射（如果需要替换映射，请编辑 manifest.json）。

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..")

# 如果 manifest.json 存在，优先从中读取 svg_defaults
$manifestPath = Join-Path $repoRoot "images\manifest.json"
$map = @{}
if (Test-Path $manifestPath) {
    try {
        $json = Get-Content $manifestPath -Raw | ConvertFrom-Json
        if ($json.function_icons -and $json.function_icons.svg_defaults) {
            foreach ($k in $json.function_icons.svg_defaults.PSObject.Properties.Name) {
                $map[$k] = $json.function_icons.svg_defaults.$k
            }
        }
    } catch {
        Write-Warning "读取 manifest.json 失败：$manifestPath 。将使用内置默认映射。"
    }
}

# 内置默认（当 manifest 中没有时使用）
if ($map.Count -eq 0) {
    $map = @{
        "images/function-feiyi.svg" = "https://api.iconify.design/lucide:book-open.svg"
        "images/function-wenchuang.svg" = "https://api.iconify.design/lucide:palette.svg"
        "images/function-jingqu.svg" = "https://api.iconify.design/lucide:map-pin.svg"
        "images/function-jiudian.svg" = "https://api.iconify.design/lucide:building.svg"
        "images/function-minsu.svg" = "https://api.iconify.design/lucide:home.svg"
        "images/function-meishi.svg" = "https://api.iconify.design/lucide:coffee.svg"
    }
}

foreach ($rel in $map.Keys) {
    $url = $map[$rel]
    $out = Join-Path $repoRoot $rel
    $outDir = Split-Path $out -Parent
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
    Write-Host "下载 $url -> $out"
    try {
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Warning "下载失败： $url 。如 404 或网络问题可手动替换 URL 到 manifest.json 后重试。"
    }
}

Write-Host "SVG 下载完成。若需把 SVG 转为 PNG，请安装 ImageMagick 并运行： Convert SVG 转 PNG 的命令示例："
Write-Host "  magick convert -background none images/function-feiyi.svg images/function-feiyi.png"
