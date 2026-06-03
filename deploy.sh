#!/bin/bash
set -e

echo "=== 1/3 安装依赖 ==="
pnpm install

echo ""
echo "=== 2/3 构建项目 ==="
pnpm build

echo ""
echo "=== 3/3 打包 dist ==="
cd dist
tar -czf ../dist.tar.gz *
cd ..

echo ""
echo "✅ 完成！dist.tar.gz 已生成"
echo ""
echo "下一步："
echo "  1. 打开 1Panel → 文件管理 → 进入 /opt/1panel/www/sites/luoyegg.com/index/"
echo "  2. 删除目录里的旧文件"
echo "  3. 上传 dist.tar.gz 并解压"
echo "  4. 删除 dist.tar.gz"
