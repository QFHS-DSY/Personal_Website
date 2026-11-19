---
title: Mac上四款网络命令行工具实用教程
published: 2026-07-23
description: gping、mtr、HTTPie、aria2
image: ''
tags: ['cli','gping','mtr','HTTPie','aria2']
category: Note
draft: false 
lang: ''
---

# Mac 网络命令行实用教程：gping、mtr、HTTPie、aria2

> 为 Mac + Ghostty + zsh 环境编写。 
> 本机版本：gping 1.21.0、mtr 0.96、HTTPie 3.2.4、aria2 1.37.0。  
> 所有工具均已通过 Homebrew 安装，无需重复安装。

## 怎么读这份教程

先读第 1 节了解用途，再从第 6 节的本机练习开始动手。遇到实际问题时，回到对应工具的章节查参数。

- **【可以直接试】**：无需替换参数，或只访问你自己的电脑；访问互联网的示例仍取决于网络可达性。
- **【需要替换】**：网址、主机、端口或文件名是占位示例，应替换为你的实际对象。
- **【会写入】**：会创建、追加或覆盖本地文件。
- **【会发送】**：会将输入的数据发往指定服务器。
- **【需要管理员权限】**：使用 `sudo`，会要求你的 Mac 登录密码；输入时通常不显示字符。
- **【Ghostty 专属】**：只涉及终端窗口操作，不是这四款工具的参数。

代码块中的命令可以在终端输入，前面的解释、代码块标记不要一起粘贴。多行命令末尾的 `\` 表示续行，反斜杠后面不要再加空格。

文中的 `https://example.com` 是保留的示例网站；`https://example.com/file.zip`、`https://api.example.com/...` 等业务或文件地址是占位示例，不代表那里真的存在文件或 API。公共测试服务的可达性没有保证。

## 目录

1. 什么时候用哪一个工具
2. gping：把网络延迟画出来
3. mtr：分析到目标的网络路径
4. HTTPie：理解和调试 HTTP 请求
5. aria2：可靠地下载文件
6. 不依赖外网的完整练习
7. 三种常见问题的排查流程
8. 更新、帮助与验证说明

---

## 1. 什么时候用哪一个工具

- **网页或游戏偶尔卡顿，想看延迟是否波动**：用 `gping`。
- **到某个目标一直很慢，想看沿途节点的响应情况**：用 `mtr`。
- **想知道网站返回了什么、接口参数有没有发对**：用 HTTPie，命令名是 `http`。
- **想下载大文件、暂停后继续、批量下载**：用 aria2，命令名是 `aria2c`。

它们测量的不是同一个东西：

- 延迟：一次探测往返用了多久，通常用毫秒 `ms` 表示。
- 丢包：发出的探测中，有多少没有得到预期响应。
- 吞吐量：每秒实际传输了多少数据，例如 `MiB/s`。
- HTTP 状态：服务器对一次具体请求作出的结果，例如 200、404、503。

**低延迟不代表下载快；能 ping 通不代表网站正常；HTTP 200 也不代表应用的所有功能都正常。**

### 1.1 确认命令可用

**【可以直接试】**

```zsh
gping --version
mtr --version
http --version
aria2c --version
```

在你的 Mac 上，命令位于：

- `/opt/homebrew/bin/gping`
- `/opt/homebrew/sbin/mtr`
- `/opt/homebrew/bin/http`
- `/opt/homebrew/bin/aria2c`

Ghostty 和 VS Code 的本地 zsh 都可以使用。SSH 到另一台机器之后，需要那台机器也安装这些工具。

### 1.2 先记住退出方式

- `gping`：按 `q` 或 Ctrl + C 退出。
- `mtr` 交互界面：按 `q` 或 Ctrl + C 退出。
- HTTPie：正常请求完成后自动退出；持续等待时可以 Ctrl + C。
- aria2：完成后自动退出；按一次 Ctrl + C 请求有序停止，保留尚未完成的下载状态。

Ctrl + Z 通常只是暂停程序，不是正常结束。

**【Ghostty 专属】** `⌘ + D` 创建右侧分屏，`⌘ + Option + 方向键` 切换分屏。可以一边观察延迟，一边执行 HTTP 请求或下载。

## 2. gping：把网络延迟画出来

### 2.1 它能回答什么

gping 默认向目标发送 ICMP 探测，将响应时间显示为实时曲线。适合看延迟是否稳定、是否有突然的尖峰、是否出现无响应。

它不是宽带测速工具，也不会自动告诉你“是哪款应用占网速”。

### 2.2 第一次使用

**【可以直接试：只探测本机】**

```zsh
gping 127.0.0.1
```

`127.0.0.1` 是本机回环地址。这个结果可以说明程序在本机能工作，不能证明 Wi-Fi、路由器或互联网正常。

按 `q` 退出后，试一个公共地址：

```zsh
gping 1.1.1.1
```

曲线越低，表示这类探测的往返延迟越小。曲线越平稳，表示采样期间波动越小。

某些网络或主机不回复 ICMP；全部超时不一定等于目标离线。

### 2.3 同时比较多个目标

```zsh
gping 1.1.1.1 8.8.8.8
```

不同目标使用不同曲线。这里是在比较到两个地址的网络响应，**不是比较它们的 DNS 查询速度**。

一种有用的排查方法是同时测：本地网关、公共目标、实际使用的业务目标。

先查看默认路由：

```zsh
route -n get default
```

找到 `gateway` 一项。如果它显示具体 IPv4 地址，可作为网关探测目标。例如下面的 `192.168.1.1` **需要替换**：

```zsh
gping 192.168.1.1 1.1.1.1 example.com
```

VPN 或多网络接口可能改变默认路由，不要把 `192.168.1.1` 当成所有人的路由器地址。

判断思路：

- 网关和外部目标同时明显变差：可以优先检查本机、Wi-Fi 或路由器。
- 网关稳定，外部目标变差：可以继续检查外部路径、运营商或目标服务。
- 只有一个目标变差：可能与该目标或特定路径有关。

这些是排查线索，不是仅凭一张曲线就能确定的故障结论。

### 2.4 调整刷新频率和显示时间

```zsh
gping -n 1 -b 60 -0 1.1.1.1
```

- `-n 1`：探测间隔为 1 秒。
- `-b 60`：显示最近 60 秒的数据。
- `-0`：纵轴从 0 开始，便于比较图形。

注意：**gping 的 `-n` 是间隔，不是 ping 命令常见的次数参数。** 不同工具的同名字母选项可能含义完全不同。

需要观察更长时间，可以把 `-b 60` 改为 `-b 300`。间隔越短，对短暂波动越敏感，但探测更频繁，日常观察通常不用追求极高频率。

### 2.5 固定 IPv4 或 IPv6

```zsh
gping -4 example.com
gping -6 example.com
```

这适合检查同一域名通过不同地址族访问时是否有差异。IPv6 测试要求本机网络和目标都具备相应支持；域名也可能没有 IPv6 地址。

### 2.6 用 TCP 代替 ICMP

某个主机不响应普通 ping，但其网站可以打开时，可以测 TCP 端口：

```zsh
gping --tcp --tcp-port 443 --tcp-rst drop example.com
```

- `--tcp`：使用 TCP 探测。
- `--tcp-port 443`：目标端口为 HTTPS 常用的 443。
- `--tcp-rst drop`：把“连接被拒绝”当作失败。

你当前版本默认的 TCP RST 行为是 `pong`：只要主机明确拒绝连接，也可以被计作“主机有回应”。如果想确认端口可建立连接，示例中指定 `drop` 更容易理解。

TCP 探测成功也不等于 HTTPS 握手、证书、登录或接口业务正常。下一步应使用 HTTPie 请求实际网址。

### 2.7 显示异常与常见误解

- 图形挤在一起：增大终端窗口，或用 Ghostty 的 `⌘ + Shift + F` 临时放大当前分屏。
- 线条显示不理想：试 `gping -s 1.1.1.1`，使用更简单的图形。
- 开着浏览器代理却探测失败：ICMP 不会像浏览器 HTTP 流量那样自动经过应用层代理。
- 某次延迟很大：应持续观察并和其他目标对比，避免根据单次尖峰下结论。

进阶功能 `--cmd` 可以绘制命令的执行耗时，例如 `gping --cmd 'sleep 0.2' 'sleep 0.5'`。这个耗时包含程序执行过程，不应解释为网络延迟；其中的命令会反复执行，只能使用你确认无副作用的命令。

## 3. mtr：分析到目标的网络路径

### 3.1 它比 gping 多了什么

mtr 持续探测到目标沿途的跳点，同时统计响应时间与无响应比例。每个跳点通常对应路径上的一个路由节点，但隧道、负载均衡和设备策略会让结果更复杂。

它帮助你寻找问题可能开始的位置，不能保证展示互联网真实路径的所有细节。

### 3.2 开始一次交互式检查

**【需要管理员权限】**

```zsh
sudo mtr -n 1.1.1.1
```

- `sudo`：你安装的 macOS 版 mtr 需要管理员权限来执行探测。
- `-n`：不对中间跳点做反向 DNS 查询，优先显示 IP。
- 目标：这次探测最终要到达的地址。

如果出现 `sudo: mtr: command not found`，使用完整路径：

```zsh
sudo /opt/homebrew/sbin/mtr -n 1.1.1.1
```

输入密码时不显示字符是正常的。只输入你的 Mac 登录密码，不是网站账号密码。

`-n` 不代表完全不用 DNS：如果目标本身写成域名，mtr 仍需要先解析这个域名。

### 3.3 读懂主要列

界面中的具体排列会随版本或显示模式变化，主要含义是：

- **Host／节点**：该跳点的 IP 或主机名。
- **Loss%**：探测中未收到预期响应的比例。
- **Snt**：已发送的探测数量。
- **Last**：最近一次响应时间。
- **Avg**：平均响应时间。
- **Best / Wrst**：最好／最差响应时间。
- **StDev**：响应时间的离散程度，用于观察波动。

响应时间通常以毫秒为单位。刚开始样本很少时，百分比和平均值容易波动，建议积累一定样本再看。

### 3.4 最重要的判断规则：不要误读中间节点丢包

**假设示例，不是你的实测数据：** 第 4 跳显示 70% 无响应，但后面的节点和最终目标都没有丢包。这个现象可能只是第 4 跳对探测响应限速，不代表它真的丢掉了 70% 的业务数据。

更值得关注的是：某一跳之后，后续跳点和最终目标持续出现类似的异常，并且你实际使用的服务也受到影响。

即使如此，也要考虑返回路径不一致、负载均衡和目标侧的响应策略。不要仅凭一行结果就断言运营商、路由器或某台服务器故障。

整行 `???` 也可能意味着设备不响应探测。如果最后仍能到达目标，不必把每个不回应的中间节点都当成故障。

### 3.5 生成固定次数的报告

```zsh
sudo mtr -r -w -n -c 30 -i 1 1.1.1.1
```

- `-r`：报告模式，完成后退出。
- `-w`：使用较宽的报告格式。
- `-c 30`：执行 30 个报告周期。
- `-i 1`：探测间隔为 1 秒。

实际耗时不一定恰好 30 秒，还会受路径探测、等待响应和结束宽限时间等影响。

**【会写入】** 保存报告：

```zsh
sudo mtr -r -w -n -c 30 -i 1 1.1.1.1 \
  > "$HOME/Desktop/mtr-report-$(date +%Y%m%d-%H%M%S).txt"
```

文件名使用时间戳，降低与已有文件重名的机会。`>` 仍是覆盖写入语法，同名文件存在时会覆盖。

报告可能包含局域网、出口和目标地址，发送给别人前先检查内容。

### 3.6 换一种探测方式

网站访问异常时，可以尝试 TCP 443：

```zsh
sudo mtr -T -P 443 -n example.com
```

- `-T`：TCP 探测。
- `-P 443`：目标端口。

普通 ICMP、TCP 和 UDP 探测可能被网络以不同方式处理。换一种方式是补充证据，不是绕过网络限制的万能办法。TCP 模式也不检查 HTTPS 证书或网页内容。

固定 IPv4：

```zsh
sudo mtr -4 -r -w -n -c 20 example.com
```

`-6` 可改为 IPv6。需要机器可读结果时，当前版本还提供 `--json`、`--csv` 和 `--xml`，例如：

```zsh
sudo mtr --json -n -c 10 1.1.1.1
```

### 3.7 常见错误

- 权限不足：确认使用 `sudo mtr`；不要为此修改系统目录权限。
- 很多中间节点不响应：先看最终目标和真实服务，不要只盯着中间的 Loss%。
- mtr 看起来正常，网站仍打不开：继续用 HTTPie 检查 TLS、HTTP 状态和实际响应。
- 浏览器走代理，mtr 结果不同：两者可能根本没有走同一条路径。

## 4. HTTPie：理解和调试 HTTP 请求

### 4.1 基本结构

命令名是 `http`，不是 `httpie`：

```text
http [选项] 请求方法 URL [请求项...]
```

建议初学时明确写出 `GET`、`HEAD` 或 `POST`，避免依赖自动判断。

如果省略请求方法：没有数据时通常是 GET；有数据字段时通常会变成 POST。**多写一个 `name=value` 可能改变请求方法。**

### 4.2 查看一个网站

```zsh
http --timeout=15 GET https://example.com
```

通常会显示响应状态、响应头和正文。终端中的结果会按内容着色或排版，输出重定向到文件时默认行为可能不同。

只请求响应头：

```zsh
http --timeout=15 HEAD https://example.com
```

只显示响应头，但请求仍然使用 GET：

```zsh
http --timeout=15 --headers GET https://example.com
```

这两条不是同一个操作。某些服务不支持 HEAD，可能返回 405，但 GET 仍然正常。

**特别注意：HTTPie 的 `-h` 是 `--headers`，不是帮助。查看帮助请使用 `http --help`。**

### 4.3 看懂状态码

- **200**：这次请求成功返回，但还要检查正文是否符合预期。
- **201**：通常表示资源已创建。
- **204**：请求成功，但没有正文。
- **301 / 302 / 307 / 308**：重定向，要查看 `Location`。
- **400**：请求格式或参数可能不符合接口要求。
- **401**：通常缺少有效身份认证。
- **403**：服务器拒绝当前请求，可能与权限或策略有关。
- **404**：路径或资源未找到。
- **405**：请求方法不被这个接口接受。
- **429**：请求过于频繁或触及服务限额。
- **500 / 502 / 503 / 504**：服务端或其上游出现问题，需要结合具体响应解释。

这些含义用于定位方向，不能代替接口文档或服务端日志。

### 4.4 跟随重定向

```zsh
http --timeout=15 --follow --all GET http://example.com
```

- `--follow`：跟随服务器给出的重定向。
- `--all`：也显示中间请求／响应，便于观察跳转过程。

不要把从 HTTP 跳到 HTTPS 的正常重定向直接理解为网站异常。

### 4.5 先用离线模式学习参数

**【可以直接试：不会真正发送请求】**

```zsh
http --offline --print=HB POST https://api.example.com/items \
  name=demo count:=3 enabled:=true
```

这会构造并打印请求，不连接目标服务器。用它可以先确认方法、头部和 JSON 内容。

这里的核心分隔符：

- `name=demo`：JSON 字符串字段。
- `count:=3`：JSON 数字。
- `enabled:=true`：JSON 布尔值。
- `tags:='["mac", "network"]'`：JSON 数组，外层单引号由 Shell 处理。
- `q==ghostty`：URL 查询参数。
- `Accept:application/json`：请求头。

`count=3` 通常发送字符串 `"3"`，`count:=3` 才是数字 `3`。这个区别会影响接口的参数校验。

### 4.6 GET 查询参数和请求头

**【会发送】** 以下请求只包含示例数据，发送到公共回显服务：

```zsh
http --timeout=15 GET https://httpbin.org/get \
  q==ghostty page==1 \
  Accept:application/json \
  X-Demo:network-practice
```

`httpbin.org` 用于回显请求，便于观察实际参数。它是第三方服务，不要拿它测试真实密码、私有文件或业务令牌。如果无法访问，可以先使用 `--offline`，或做第 6 节的本机练习。

直接输入带 `?`、`&` 的 URL 时，应把整个 URL 引起来：

```zsh
http --timeout=15 GET 'https://httpbin.org/get?q=ghostty&page=1'
```

### 4.7 POST JSON

**【会发送】**

```zsh
http --timeout=15 POST https://httpbin.org/post \
  name=demo count:=3 enabled:=true \
  tags:='["mac", "network"]'
```

HTTPie 默认按 JSON 序列化这些字段。收到的回显中应能找到字符串、数字、布尔值和数组，注意检查类型而不只是内容。

POST、PUT、PATCH、DELETE 在真实业务 API 上可能创建、修改或删除数据。应先确认目标是测试接口以及具体影响；不能因为命令行看起来像“查询”就认为它没有副作用。

### 4.8 表单和文件上传

普通表单使用 `--form`：

```zsh
http --offline --form POST https://api.example.com/form \
  name=demo message='hello world'
```

文件上传使用 `字段名@文件路径`。假设当前目录已有一个专门用于练习的 `sample.txt`：

```zsh
http --offline --form POST https://api.example.com/upload \
  file@sample.txt description=demo
```

带文件的表单通常使用 multipart/form-data。以上命令保留 `--offline`，只展示构造结果；去掉它就会把文件内容发送出去。不要用真实私有文件练习。

### 4.9 从文件读取原始请求体

**【会写入】** 以下会创建或覆盖当前目录的 `payload.json`：

```zsh
printf '%s\n' '{"name":"demo","count":3}' > payload.json
http --offline POST https://api.example.com/items \
  Content-Type:application/json < payload.json
```

使用 `< payload.json` 时，正文来自标准输入，不要同时又添加会生成另一份 JSON 正文的字段参数。

在脚本或其他非交互环境中，如果命令并不需要读取标准输入，可以加 `--ignore-stdin`，避免意外等待输入或误读管道内容。

### 4.10 控制输出与保存结果

```zsh
http --timeout=15 --body GET https://httpbin.org/get
http --timeout=15 --verbose GET https://example.com
```

- `--body`：只显示响应正文。
- `--verbose`：显示请求和响应的更多信息。
- `--print=HBhb`：大写 `H/B` 是请求头／请求体，小写 `h/b` 是响应头／响应体。

详细输出可能包含 Cookie、认证头或业务数据，分享日志前应检查。

**【会写入】** 保存正文到新文件：

```zsh
http --ignore-stdin --timeout=15 --check-status --body \
  GET https://httpbin.org/get \
  > "response-$(date +%Y%m%d-%H%M%S).json"
```

`>` 会覆盖同名文件，而且 Shell 在请求成功之前就会创建或截断目标文件。请求失败时可能留下空文件或错误正文，不能只看“文件存在”就认为成功。

### 4.11 让脚本识别失败

```zsh
http --ignore-stdin --timeout=15 --check-status \
  GET https://httpbin.org/status/404
printf '退出状态：%s\n' "$?"
```

加上 `--check-status` 后，HTTPie 会把部分 HTTP 状态转换为非零退出状态：4xx 通常返回 4，5xx 返回 5；未跟随的 3xx 通常返回 3。

`$?` 必须紧接着读取，否则后面的命令会覆盖它。

`--timeout=15` **不是整个请求绝对只能用 15 秒**。它用于连接和等待网络数据等超时判断；如果服务器持续缓慢发送数据，总耗时可能更长。

### 4.12 认证、代理和证书

Bearer 认证的离线示例：

```zsh
http --offline GET https://api.example.com/me \
  Authorization:'Bearer DEMO_TOKEN'
```

`DEMO_TOKEN` 是假令牌。真实密钥不要写进教程、截图、共享日志或容易泄漏的命令历史中。

HTTPie 的 `--session` 可以保存 Cookie、认证信息和自定义请求头，适合重复访问，但会产生持久化会话文件。初学阶段不需要为了简单测试就启用它。

如果你已经运行了本地 HTTP 代理，可以按真实地址显式指定，例如：

```zsh
http --timeout=15 --proxy=https:http://127.0.0.1:7890 \
  GET https://example.com
```

`7890` 只是常见示例端口，必须与实际代理一致；这条命令不会替你启动代理。

证书错误应检查网址、系统时间、网络和可信证书配置。不要把跳过证书校验作为日常解决方案。

## 5. aria2：可靠地下载文件

### 5.1 最小用法

命令名是 `aria2c`。基本结构：

```text
aria2c [选项] '文件的直接下载链接'
```

下载链接应指向文件内容。一个包含下载按钮的网页地址，不一定就是直接下载链接；保存下来也可能只是 HTML 页面。

### 5.2 指定保存位置和文件名

**【需要替换／会写入】** 把网址替换成真实文件链接：

```zsh
aria2c \
  --dir="$HOME/Downloads" \
  --out=archive.zip \
  --auto-file-renaming=false \
  --allow-overwrite=false \
  'https://example.com/file.zip'
```

- `--dir` 或 `-d`：保存目录。
- `--out` 或 `-o`：保存的文件名，相对于 `--dir`。
- `--auto-file-renaming=false`：同名时不自动另起带编号的名称。
- `--allow-overwrite=false`：不允许直接从头覆盖没有对应控制文件的已有目标。

这两个显式保护选项适合初学时理解“同名文件怎么办”。它们不代表下载目录可以被随便重复使用；已有部分下载是否能恢复，仍取决于控制文件、续传参数和服务器支持。

默认情况下，aria2 的自动重命名通常开启，所以重复下载可能出现 `archive.1.zip` 等文件。

### 5.3 暂停和断点续传

下载过程中按一次 Ctrl + C，等待 aria2 有序退出。

不完整文件旁边可能有一个 `.aria2` 控制文件，其中记录下载进度。**想恢复时应保留它和原文件。**

继续下载，使用相同的链接、目录和文件名：

```zsh
aria2c -c \
  -d "$HOME/Downloads" -o archive.zip \
  --auto-file-renaming=false --allow-overwrite=false \
  'https://example.com/file.zip'
```

`-c` 是 `--continue`。它也可以尝试续传其他程序从文件开头顺序下载留下的部分文件，但要求服务器支持对应的 Range 请求，并且远端内容没有发生不兼容变化。

如果链接带过期签名，原链接可能失效；需要从原网站取得新的有效链接，并确认仍指向同一份文件。不要把旧文件和新版本误拼在一起。

### 5.4 多连接下载

```zsh
aria2c -c -x 4 -s 4 -k 1M \
  -d "$HOME/Downloads" -o archive.zip \
  --auto-file-renaming=false --allow-overwrite=false \
  'https://example.com/file.zip'
```

- `-x 4`：同一下载任务对同一服务器最多使用 4 个连接。
- `-s 4`：一个文件尝试分为最多相应数量的连接来下载。
- `-k 1M`：调整最小分段尺度；太小的文件或字节范围仍不会被进一步拆分。

当前 `-x` 允许的上限是 16，但不建议一开始就开到最大。先试 4 个连接，再观察实际变化。

**连接数不会保证达到设置值，更不会保证速度成倍提升。** 小文件、服务器不支持范围请求、总带宽瓶颈、限速和反滥用策略都可能让多连接没有收益，甚至更慢。

这与你之前下载字体的场景有关：分段下载可以利用服务器支持的 Range 请求，但最终仍要检查下载是否完整。

### 5.5 限速，避免影响其他工作

```zsh
aria2c --max-download-limit=2M \
  -d "$HOME/Downloads" \
  'https://example.com/file.zip'
```

- `--max-download-limit=2M`：限制单个任务的下载速度。
- `--max-overall-download-limit=4M`：限制所有任务合计的速度。
- `0` 表示不限速。

aria2 的这类数值按字节／秒计算，`M` 使用 1024 进制单位。`2M` 约为 2 MiB/s，不是宽带宣传中的 2 Mbps。字节与比特相差 8 倍，实际吞吐还会受协议开销影响。

### 5.6 批量下载：区分文件数与连接数

创建一个 UTF-8 文本文件 `downloads.txt`，每行放一个真实下载链接。下面只是文件内容示例，不能直接把占位地址当作有效下载任务：

```text
https://example.com/file-a.zip
https://example.com/file-b.zip
```

然后运行：

```zsh
aria2c -i downloads.txt -j 2 -x 4 -s 4 \
  -d "$HOME/Downloads" \
  --save-session=pending-downloads.txt
```

- `-i`：读取链接清单。
- `-j 2`：同时进行最多 2 个下载任务。
- `-x` 和 `-s`：控制每个文件的连接／分段行为。
- `--save-session`：退出时将未完成或出错任务写入会话文件，可能更新同名文件。

恢复清单时可以使用：

```zsh
aria2c -c -i pending-downloads.txt -j 2 -x 4 -s 4 \
  -d "$HOME/Downloads" \
  --save-session=pending-downloads.txt
```

会话文件不等于文件本体或 `.aria2` 控制文件，需要一起保留。已完成任务通常不会作为未完成任务留在该清单里。

### 5.7 给下载设置等待和重试

```zsh
aria2c \
  --connect-timeout=15 --timeout=30 \
  --max-tries=3 --retry-wait=5 \
  -d "$HOME/Downloads" \
  'https://example.com/file.zip'
```

- `--connect-timeout`：建立连接时的超时。
- `--timeout`：连接后的网络等待超时，不是整个下载的总时限。
- `--max-tries=3`：限制尝试次数；`0` 表示无限次，通常不适合排错。
- `--retry-wait=5`：重试间隔；并非所有错误都会因此自动修复或重试。

403、404、签名过期、需要登录等错误，通常应先修正链接或权限，而不是无限重试。

### 5.8 验证下载文件

下载完成后，可以计算 SHA-256：

```zsh
shasum -a 256 "$HOME/Downloads/archive.zip"
```

**必须与发布方通过可信渠道提供的值比较。** 只计算出一个哈希值，本身不能证明文件来自官方或没有被篡改。

aria2 也可以在下载时设置已知校验值，语法是：

```text
--checksum=sha-256=发布方给出的64位十六进制值
```

这行是参数结构说明，不是可以原样执行的命令。第 6 节会使用本机文件演示真实校验值的填写方式。

若压缩包下载下来却无法打开，可以先运行 `file 文件路径`，确认它是不是错误页面或登录页，再核对文件长度与校验值。

### 5.9 代理和配置文件

已有本地 HTTP 代理时，可以按实际地址添加：

```zsh
aria2c --all-proxy=http://127.0.0.1:7890 \
  -d "$HOME/Downloads" \
  'https://example.com/file.zip'
```

这只是示例端口，不会替你开启代理。aria2 的这个参数也不能直接当成所有 SOCKS 代理通用的配置写法。

本教程没有创建 aria2 的全局配置或后台下载服务。若未来已有配置导致行为不明，可以在单次命令中加 `--no-conf=true`，临时跳过配置文件读取，便于排查。

aria2 还有 BitTorrent、Metalink、RPC 等能力。它们不是普通 HTTP 文件下载必需的功能，本教程不要求开启。

## 6. 不依赖外网的完整练习

这部分让你在本机完成 HTTP 请求、下载和内容校验，不需要第三方网站，也不需要 `sudo`。

**【会写入】** 会创建独立的桌面练习目录。你将手动启动一个临时文件服务器，只监听本机 `127.0.0.1`，结束后用 Ctrl + C 关闭。

### 6.1 终端 A：准备数据并启动本机服务器

在 Ghostty 的一个标签页执行：

```zsh
practice_dir=$(mktemp -d "$HOME/Desktop/network-practice.XXXXXX")
mkdir "$practice_dir/source" "$practice_dir/downloads"
printf '%s\n' '{"message":"hello network","count":3}' \
  > "$practice_dir/source/demo.json"
printf '%s\n' '这是一份用于本机下载练习的文件。' \
  > "$practice_dir/source/sample.txt"
printf '练习目录：%s\n' "$practice_dir"
shasum -a 256 "$practice_dir/source/sample.txt"
python3 -m http.server 8765 --bind 127.0.0.1 \
  --directory "$practice_dir/source"
```

请记下显示的练习目录，以及 `sample.txt` 的 SHA-256 值。

最后一条命令会一直运行，显示请求日志。没有返回提示符是正常的，不是卡住。

如果报 `Address already in use`，说明 8765 端口已被占用。不要直接结束不认识的进程；可以改用另一个空闲端口，并同步修改后续网址。

### 6.2 终端 B：使用 HTTPie

**【Ghostty 专属】** 按 `⌘ + D` 打开右侧分屏。新分屏是独立 Shell，不会自动继承终端 A 的 `practice_dir` 变量。

在终端 B 中运行：

```zsh
http --ignore-stdin --timeout=5 GET http://127.0.0.1:8765/demo.json
http --ignore-stdin --timeout=5 --body GET http://127.0.0.1:8765/demo.json
http --ignore-stdin --timeout=5 HEAD http://127.0.0.1:8765/sample.txt
```

第一条可以看到响应头和 JSON 正文；第二条只看正文；第三条请求文本文件的响应头。

再请求一个不存在的文件：

```zsh
http --ignore-stdin --timeout=5 --check-status \
  GET http://127.0.0.1:8765/not-found.txt
printf '退出状态：%s\n' "$?"
```

你应看到 404 响应，并观察到非零退出状态。这是刻意设计的练习，不是安装失败。

Python 这个简单文件服务器主要处理 GET 和 HEAD，**不提供你的业务 POST API**。向它 POST 失败不能说明 HTTPie 无法发送 JSON。

### 6.3 终端 B：使用 aria2 下载

先将 `练习目录` 设置成终端 A 输出的真实路径。下面路径中的 `XXXXXX` 只是占位符，不能原样照抄：

```zsh
practice_dir="$HOME/Desktop/network-practice.XXXXXX"
```

确认后运行：

```zsh
aria2c --no-conf=true \
  --auto-file-renaming=false --allow-overwrite=false \
  -d "$practice_dir/downloads" -o sample-downloaded.txt \
  'http://127.0.0.1:8765/sample.txt'
```

比较源文件与下载文件：

```zsh
shasum -a 256 "$practice_dir/source/sample.txt"
shasum -a 256 "$practice_dir/downloads/sample-downloaded.txt"
cmp "$practice_dir/source/sample.txt" \
  "$practice_dir/downloads/sample-downloaded.txt" \
  && printf '内容完全一致\n'
```

也可以用真实校验值再下载到另一个新文件：

```zsh
expected_sha=$(shasum -a 256 "$practice_dir/source/sample.txt" | awk '{print $1}')
aria2c --no-conf=true \
  --checksum="sha-256=$expected_sha" \
  --auto-file-renaming=false --allow-overwrite=false \
  -d "$practice_dir/downloads" -o sample-verified.txt \
  'http://127.0.0.1:8765/sample.txt'
```

这次练习验证的是“下载结果与本机已知源文件一致”。它不等于第三方软件的官方来源认证。

简单文件服务器的 Range 支持取决于实现和版本，不应拿这个小文件示例证明所有服务器都支持多连接或断点续传。

### 6.4 终端 B：观察本机响应

```zsh
gping 127.0.0.1
```

按 `q` 退出。也可以针对正在监听的文件服务端口测试 TCP：

```zsh
gping --tcp --tcp-port 8765 --tcp-rst drop 127.0.0.1
```

服务器关闭之后，这个端口通常无法再建立连接。它演示的是端口可达性的变化，不是互联网线路的变化。

### 6.5 可选：mtr 的本机练习

这一步需要管理员权限，不是完成前面练习的必要条件：

```zsh
sudo mtr -r -n -c 5 127.0.0.1
```

本机回环路径很简单，只适合确认基本探测能力，不能用来判断家庭网络或公网质量。

### 6.6 结束练习

1. 在运行 gping 的分屏按 `q`。
2. 切回终端 A，按 Ctrl + C 停止 Python 文件服务器。
3. 确认终端 A 重新出现 Shell 提示符。
4. 练习目录可保留；需要清理时，用 Finder 核对名称后移到废纸篓。

不要为了清理一次练习而结束全部 Python 进程或删除所有名称相似的目录。

## 7. 三种常见问题的排查流程

### 7.1 “网页突然变慢了”

1. 使用 gping 同时观察本地网关和外部目标，确认是否存在持续的延迟波动。
2. 使用 HTTPie 请求实际网站，查看状态码、重定向和报错类型。
3. 需要进一步分析路径时，再用 mtr 收集一段时间的报告。
4. 对比关闭／开启 VPN 等不同实际网络条件时的结果；先记录当前状态，不要盲目重置网络配置。

网页慢也可能来自 DNS、TLS、服务端处理、浏览器扩展或页面资源，不能全部归因于 ping 延迟。

### 7.2 “接口返回错误，不知道是我还是服务器的问题”

1. 用 `http --offline` 检查你构造的请求：方法、URL、请求头、JSON 类型是否正确。
2. 对照接口文档，确认 `=`、`:=`、`==` 是否用对。
3. 在适当的测试环境发送请求，查看状态码和正文。
4. 必要时用 `--verbose` 查看更多信息，保存前先去除敏感内容。
5. 如果是网络连接或证书错误，先解决连接层问题；这类错误不一定已经到达业务服务器。

### 7.3 “大文件下载慢或总是失败”

1. 确认拿到的是直接下载链接，且链接仍有效。
2. 从单连接开始，再比较 `-x 4 -s 4` 的实际效果。
3. 网络中断后保留文件和 `.aria2`，用相同目标和 `-c` 尝试续传。
4. 看到 403、404、429 或证书错误时，按错误类型排查，不要只提高连接数。
5. 完成后比较官方提供的校验值，而不是只看进度显示 100%。

## 8. 更新、帮助与验证说明

### 8.1 查看帮助

```zsh
gping --help
mtr --help
man mtr
http --help
aria2c --help
aria2c --help=continue
aria2c --help='#http'
```

`man` 阅读器通常用 `q` 退出。aria2 的帮助标签带 `#` 时，使用引号更清楚。

不同版本可能新增或调整参数；本手册以顶部注明的本机版本为依据。

### 8.2 更新软件

**【会修改已安装软件】** 需要更新时可以执行：

```zsh
brew update
brew upgrade gping mtr httpie aria2
```

`brew update` 更新包信息，`brew upgrade` 才升级已安装软件。不要重复安装来代替排错。

这份教程的生成过程没有升级工具、修改 Ghostty 设置或配置全局代理。

### 8.3 验证范围

- 参数和版本来自本机工具的 `--help`、`--version`，不是凭版本印象编写。
- 文中公网目标是用法示例，不表示已经验证过你到这些目标的连通性、速度或服务质量。
- mtr 的管理员权限探测未运行；其报告解释和示例来自工具帮助及通用网络诊断原理。
- 自动化验证范围见本节最后的“本次实际检查结果”；未列入其中的场景不应视为已经测试。

### 8.4 官方资料

- gping：[项目与说明](https://github.com/orf/gping)
- mtr：[项目与说明](https://github.com/traviscross/mtr)
- HTTPie：[命令行文档](https://httpie.io/docs/cli)
- aria2：[官方手册](https://aria2.github.io/manual/en/html/aria2c.html)

### 8.5 本次实际检查结果

- **语法检查通过**：全部 53 个 zsh 代码块均经过 `zsh -n` 检查。语法通过不等于所有命令都已执行。
- **HTTPie 本机实测通过**：GET 查询参数、自定义请求头、HEAD、跟随重定向、404 与退出状态、JSON 字符串／数字／布尔值／数组、普通表单、练习文件上传、从标准输入读取 JSON，以及离线构造请求。
- **aria2 本机实测通过**：下载文件、按已知 SHA-256 校验、通过 HTTP Range 请求续传预先准备的部分文件；最终文件内容与源文件完全一致。
- **gping 本机实测通过**：以 TCP 模式连接本机测试端口并显示交互界面，按 `q` 正常退出。未把这项检查当作公网质量测试。
- 测试使用独立临时目录和本机回环服务；检查结束后，临时监听已关闭。
- **未运行**：需要管理员权限的 mtr 路由探测、公网连通性或测速、代理和真实账号认证、批量下载与限速的功能测试，以及 Ghostty／VS Code 图形界面的逐项操作测试。
