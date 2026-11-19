import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import test from "node:test";

const bash = process.env.DEPLOY_TEST_BASH ?? (process.platform === "win32"
	? join(process.env.ProgramFiles ?? "C:/Program Files", "Git", "bin", "bash.exe")
	: "bash");

function fixture(context) {
	const tempRoot = realpathSync(tmpdir());
	const dir = mkdtempSync(join(tempRoot, "website-deploy-test-"));
	context.after(() => {
		const resolved = realpathSync(dir);
		if (dirname(resolved) === tempRoot && basename(resolved).startsWith("website-deploy-test-")) {
			rmSync(resolved, { recursive: true });
		}
	});
	copyFileSync(new URL("../deploy.sh", import.meta.url), join(dir, "deploy.sh"));
	mkdirSync(join(dir, "site"));
	writeFileSync(join(dir, "site", "index.html"), "old homepage");
	writeFileSync(join(dir, "site", "keep.txt"), "keep this file");
	writeFileSync(join(dir, "mocks.sh"), `
OSTYPE=deploy_test
pnpm() {
	if [[ "$1" == install ]]; then return 0; fi
	[[ "$1" == build ]] || return 90
	[[ "\${DEPLOY_TEST_FAIL_BUILD:-}" != 1 ]] || return 17
	mkdir -p dist && printf 'new homepage' > dist/index.html
}
tar() {
	if [[ "$1" == -czf && "\${DEPLOY_TEST_FAIL_PACKAGE:-}" == 1 ]]; then
		printf 'partial archive' > "$2"
		return 18
	fi
	command tar "$@"
}
ssh() {
	printf 'ssh\\n' >> calls
	[[ "$4" == hostwin ]] || return 91
	case "$5" in
		'mktemp -d /root/luoyegg-release.XXXXXX') mkdir release && printf '/root/luoyegg-release.Abc123\\n' ;;
		"bash -se -- '/root/luoyegg-release.Abc123' '/opt/1panel/www/sites/luoyegg.com/index'") bash -se -- "$PWD/release" "$PWD/site" ;;
		*) return 92 ;;
	esac
}
scp() {
	printf 'scp\\n' >> calls
	[[ "$4" == hostwin:/root/luoyegg-release.Abc123/site.tar.gz ]] || return 93
	[[ "\${DEPLOY_TEST_FAIL_UPLOAD:-}" != 1 ]] || return 19
	cp "$3" release/site.tar.gz
}
rsync() {
	printf 'rsync\\n' >> calls
	[[ $# == 4 && "$1" == -rlti && "$2" == --delay-updates ]] || return 94
	test -s release/previous-site.tar.gz && cp -R "$3." "$4"
}
export -f rsync
`);
	return {
		dir,
		run: (args = [], env = {}) => spawnSync(bash, [
			"--noprofile", "--norc", "-c",
			"source ./mocks.sh && [[ $(type -t ssh) == function && $(type -t scp) == function ]] && source ./deploy.sh",
			"deploy-test", ...args,
		], { cwd: dir, encoding: "utf8", env: { ...process.env, ...env } }),
	};
}

function assertNoTemporaryArchives(dir) {
	assert.deepEqual(readdirSync(dir).filter((name) => name.startsWith(".deploy.")), []);
}

test("build-only mode packages without contacting the server", (context) => {
	const { dir, run } = fixture(context);
	const result = run();
	assert.equal(result.status, 0, result.error?.message ?? result.stderr);
	assert.ok(existsSync(join(dir, "dist.tar.gz")));
	assert.ok(!existsSync(join(dir, "calls")));
});

test("failed build does not publish even when a previous archive exists", (context) => {
	const { dir, run } = fixture(context);
	writeFileSync(join(dir, "dist.tar.gz"), "old archive");
	const result = run(["--publish"], { DEPLOY_TEST_FAIL_BUILD: "1" });
	assert.equal(result.status, 1, result.error?.message ?? result.stderr);
	assert.equal(readFileSync(join(dir, "dist.tar.gz"), "utf8"), "old archive");
	assert.ok(!existsSync(join(dir, "calls")));
});

test("publish uploads, backs up the old site and preserves unrelated files", (context) => {
	const { dir, run } = fixture(context);
	writeFileSync(join(dir, "dist.tar.gz"), "old archive");
	const result = run(["--publish"]);
	assert.equal(result.status, 0, result.error?.message ?? result.stderr);
	assert.equal(readFileSync(join(dir, "dist.tar.gz"), "utf8"), "old archive");
	assertNoTemporaryArchives(dir);
	assert.deepEqual(readFileSync(join(dir, "calls"), "utf8").trim().split(/\r?\n/), ["ssh", "scp", "ssh", "rsync"]);
	assert.equal(readFileSync(join(dir, "site", "index.html"), "utf8"), "new homepage");
	assert.equal(readFileSync(join(dir, "site", "keep.txt"), "utf8"), "keep this file");
	const backup = spawnSync(bash, ["--noprofile", "--norc", "-c", "tar -xOzf release/previous-site.tar.gz ./index.html"], { cwd: dir, encoding: "utf8" });
	assert.equal(backup.status, 0, backup.error?.message ?? backup.stderr);
	assert.equal(backup.stdout, "old homepage");
});

test("failed packaging preserves the old archive, cleans up and never connects", (context) => {
	const { dir, run } = fixture(context);
	writeFileSync(join(dir, "dist.tar.gz"), "old archive");
	const result = run(["--publish"], { DEPLOY_TEST_FAIL_PACKAGE: "1" });
	assert.equal(result.status, 1, result.error?.message ?? result.stderr);
	assert.match(result.stderr, /打包失败，未发布/);
	assert.equal(readFileSync(join(dir, "dist.tar.gz"), "utf8"), "old archive");
	assertNoTemporaryArchives(dir);
	assert.ok(!existsSync(join(dir, "calls")));
});

test("failed upload cleans up without changing the site", (context) => {
	const { dir, run } = fixture(context);
	const result = run(["--publish"], { DEPLOY_TEST_FAIL_UPLOAD: "1" });
	assert.equal(result.status, 1, result.error?.message ?? result.stderr);
	assert.match(result.stderr, /上传构建包失败/);
	assert.deepEqual(readFileSync(join(dir, "calls"), "utf8").trim().split(/\r?\n/), ["ssh", "scp"]);
	assert.equal(readFileSync(join(dir, "site", "index.html"), "utf8"), "old homepage");
	assert.ok(!existsSync(join(dir, "dist.tar.gz")));
	assertNoTemporaryArchives(dir);
});
