如何下载并替换首页图片（步骤）

1. 我已在 `images/manifest.json` 列出了候选来源与默认下载链接。
2. 在本地仓库根目录打开 PowerShell，运行：

```powershell
cd "c:\Users\wzq33\宁夏文旅小程序"
./scripts/download_images.ps1
```

3. 运行后脚本会把默认候选图片写入 `images/`：
   - images/banner-1.jpg
   - images/banner-2.jpg
   - images/product-1.jpg … images/product-6.jpg

4. 功能入口 SVG：
   - 我已在 `images/manifest.json` 提供 `function_icons` 的候选来源链接（unDraw / Heroicons）。
   - 若要我自动抓取并（可选）把 SVG 转成 PNG，请回复“抓取 SVG”。

注意：脚本使用外部网络访问，运行时请确保网络通畅并遵守站点许可。若你希望我改用其它具体图片 URL，请把链接发给我，我会更新 `images/manifest.json` 并提供新的下载脚本。
