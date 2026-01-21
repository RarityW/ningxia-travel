# 下载首页默认候选图片到 images/ 目录
# 在 PowerShell（Windows）中运行：
#   ./scripts/download_images.ps1

$pairs = @(
    @{ path = 'images/banner-1.jpg'; url = 'https://images.pexels.com/photos/17585514/pexels-photo-17585514.jpeg' },
    @{ path = 'images/banner-2.jpg'; url = 'https://images.pexels.com/photos/3970368/pexels-photo-3970368.jpeg' },
    @{ path = 'images/product-1.jpg'; url = 'https://images.pexels.com/photos/6732733/pexels-photo-6732733.jpeg' },
    @{ path = 'images/product-2.jpg'; url = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
    @{ path = 'images/product-3.jpg'; url = 'https://images.pexels.com/photos/3970368/pexels-photo-3970368.jpeg' },
    @{ path = 'images/product-4.jpg'; url = 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg' },
    @{ path = 'images/product-5.jpg'; url = 'https://images.pexels.com/photos/10323348/pexels-photo-10323348.jpeg' },
    @{ path = 'images/product-6.jpg'; url = 'https://images.pexels.com/photos/31896555/pexels-photo-31896555.jpeg' }
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')

foreach ($item in $pairs) {
    $rel = $item.path
    $url = $item.url
    $out = Join-Path $repoRoot $rel
    $outDir = Split-Path $out -Parent
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    Write-Host "下载 $url -> $out"
    try {
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Warning "下载失败： $url 。请检查网络或替换为可用链接。"
    }
}

Write-Host "下载完成。请检查 images/ 目录并在需要时优化图片大小或格式。"
