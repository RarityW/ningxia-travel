#!/bin/bash

echo "宁夏文旅小程序 - 后端服务启动脚本"
echo "=================================="

# 检查 Go 环境
if ! command -v go &> /dev/null; then
    echo "错误: Go 未安装"
    echo "请访问 https://golang.org/dl/ 下载并安装 Go"
    exit 1
fi

echo "Go 版本: $(go version)"

# 检查 MySQL
if ! command -v mysql &> /dev/null; then
    echo "警告: MySQL 客户端未找到"
    echo "请确保 MySQL 服务已启动"
fi

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "警告: .env 文件不存在"
    echo "复制 .env.example 为 .env 并修改配置"
    cp .env.example .env
    echo "请编辑 .env 文件后重新运行此脚本"
    exit 1
fi

echo ""
echo "正在安装依赖..."
go mod download

echo ""
echo "正在编译..."
go build -o main main.go

if [ $? -eq 0 ]; then
    echo "编译成功！"
else
    echo "编译失败！"
    exit 1
fi

echo ""
echo "正在启动服务..."
echo "服务地址: http://localhost:8080"
echo "按 Ctrl+C 停止服务"
echo ""

./main
