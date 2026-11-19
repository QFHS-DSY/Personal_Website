#!/bin/bash
set -e

fail() {
	printf '错误：%s\n' "$1" >&2
	exit 1
}

usage() {
	printf '用法：%s [--publish]\n不加参数构建并生成本地压缩包；--publish 构建并用临时包更新线上站点。\n' "$0"
}

if (( $# > 1 )); then
	usage >&2
	exit 2
fi

case "${1:-}" in
	"") ;;
	--publish) ;;
	-h|--help) usage; exit 0 ;;
	*) usage >&2; exit 2 ;;
esac

local_coreutil() {
	if [[ "$OSTYPE" == msys* ]]; then
		PATH="/usr/bin:$PATH" command "$@"
	else
		command "$@"
	fi
}

cleanup_publish_archive() {
	if ! local_coreutil rm -f -- "$archive_path" || ! local_coreutil rmdir -- "$archive_dir"; then
		printf '警告：无法清理本地临时目录：%s\n' "$archive_dir" >&2
	fi
}

publish_site() (
	ssh_bin=ssh
	scp_bin=scp
	windows_root=${SYSTEMROOT:-${SystemRoot:-}}
	if [[ "$OSTYPE" == msys* && -n "$windows_root" && -x /usr/bin/cygpath.exe ]]; then
		openssh_dir="$(/usr/bin/cygpath.exe -u "$windows_root")/System32/OpenSSH"
		if [[ -x "$openssh_dir/ssh.exe" && -x "$openssh_dir/scp.exe" ]]; then
			ssh_bin="$openssh_dir/ssh.exe"
			scp_bin="$openssh_dir/scp.exe"
			export MSYS2_ARG_CONV_EXCL='*'
		fi
	fi

	ssh_options=(-o StrictHostKeyChecking=yes)
	release_dir=$("$ssh_bin" "${ssh_options[@]}" -T hostwin 'mktemp -d /root/luoyegg-release.XXXXXX') || fail '无法在 hostwin 创建上传目录'
	release_dir=${release_dir%$'\r'}
	[[ "$release_dir" =~ ^/root/luoyegg-release\.[A-Za-z0-9]{6}$ ]] || fail '服务器返回的上传目录不符合预期'
	"$scp_bin" "${ssh_options[@]}" "$1" "hostwin:$release_dir/site.tar.gz" || fail '上传构建包失败'

	"$ssh_bin" "${ssh_options[@]}" -T hostwin "bash -se -- '$release_dir' '/opt/1panel/www/sites/luoyegg.com/index'" <<'REMOTE'
release_dir=$1
site_dir=$2
staged_dist="$release_dir/dist"
backup="$release_dir/previous-site.tar.gz"

test -s "$site_dir/index.html" || { echo '未找到线上首页，停止发布。' >&2; exit 1; }
mkdir "$staged_dist"
tar --no-same-owner --no-same-permissions -xzf "$release_dir/site.tar.gz" -C "$staged_dist"
test -s "$staged_dist/index.html" || { echo '构建包没有首页，停止发布。' >&2; exit 1; }
tar -czf "$backup" -C "$site_dir" .
printf '线上备份：%s\n' "$backup"
rsync -rlti --delay-updates "$staged_dist/" "$site_dir/"
REMOTE
)

if [[ "${BASH_SOURCE[0]}" == */* ]]; then
	cd -- "${BASH_SOURCE[0]%/*}" || fail '无法进入项目目录'
fi

echo "=== 1/3 安装依赖 ==="
pnpm install || fail '安装依赖失败，未发布'

echo ""
echo "=== 2/3 构建项目 ==="
pnpm build || fail '构建失败，未发布'
[[ -s dist/index.html ]] || fail '构建产物没有首页，未发布'

echo ""
echo "=== 3/3 打包 dist ==="
archive_path=dist.tar.gz
if [[ "${1:-}" == --publish ]]; then
	archive_dir=$(local_coreutil mktemp -d ./.deploy.XXXXXX) || fail '无法创建本地临时打包目录，未发布'
	archive_path="$archive_dir/dist.tar.gz"
	trap cleanup_publish_archive EXIT
fi
tar -czf "$archive_path" -C dist . || fail '打包失败，未发布'

echo ""
printf '%s 已生成\n' "$archive_path"

if [[ "${1:-}" == --publish ]]; then
	echo '=== 发布至 hostwin：上传、备份并同步 ==='
	publish_site "$archive_path" || fail '发布失败；如果已输出备份路径，请先检查线上状态，勿假定所有文件均未变更'
	echo '发布完成，请检查线上首页与新文章。'
else
	echo '未发布。需要更新线上站点时，请运行 ./deploy.sh --publish。'
fi
