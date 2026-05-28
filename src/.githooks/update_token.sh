#!/bin/bash
# 更新管理员 token

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOKEN_FILE="$SCRIPT_DIR/.admin_token"
HOOK_FILE="$SCRIPT_DIR/pre-commit"

# 生成新密码
generate_password() {
    openssl rand -base64 32 | tr -d '=/+@#%&' | cut -c1-24
}

# 显示用法
show_usage() {
    echo "用法: $0 [新密码]"
    echo ""
    echo "示例:"
    echo "  $0                             # 生成随机密码"
    echo "  $0 MyNewPassword123            # 使用指定密码"
    echo ""
    echo "警告: 更新密码后，旧密码立即失效"
}

# 主逻辑
main() {
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_usage
        exit 0
    fi

    # 获取或生成密码
    if [ -n "$1" ]; then
        NEW_TOKEN="$1"
    else
        NEW_TOKEN=$(generate_password)
        echo "生成新密码: $NEW_TOKEN"
    fi

    # 计算哈希
    NEW_HASH=$(printf '%s' "$NEW_TOKEN" | shasum -a 256 | cut -d' ' -f1)

    # 更新 token 文件
    echo "$NEW_TOKEN" > "$TOKEN_FILE"
    chmod 600 "$TOKEN_FILE"

    # 更新 pre-commit 中的预期哈希
    sed -i.bak "s/EXPECTED_HASH=\"[a-f0-9]\{64\}\"/EXPECTED_HASH=\"$NEW_HASH\"/" "$HOOK_FILE"
    rm -f "$HOOK_FILE.bak"

    echo ""
    echo "✅ Token 更新完成"
    echo "   新密码: $NEW_TOKEN"
    echo "   新哈希: $NEW_HASH"
    echo ""
    echo "使用方式:"
    echo "   本地: .githooks/pre-commit (自动读取 .admin_token)"
    echo "   CI/CD: GIT_ADMIN_TOKEN=$NEW_TOKEN git commit ..."
}

main "$@"
