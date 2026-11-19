---
title: Curl命令学习笔记
published: 2026-07-19
description: 记录一些常用的Curl命令
image: ''
tags: ['curl']
category: Note
draft: false 
lang: ''
---

# curl 零基础到实用指南（macOS 版）

环境依据：编写时本机 `/usr/bin/curl` 为 **8.7.1**，默认 Shell 为 **zsh**；本机也已安装 `jq`、`python3`、`dig`、`nc` 和 `shasum`。

这份教程的目标不是背下全部选项，而是让你能够：看懂一条 curl 命令、独立下载文件、调用接口、发送 JSON、上传文件，并逐步定位网络问题。

## 阅读路线与示例约定

- **第一次学习**：先读第 1～7 节，掌握终端、URL、请求和下载。
- **开始调接口**：读第 8～15 节，掌握 JSON、上传、认证和错误处理。
- **遇到网络问题**：查第 16～20 节。
- **形成自己的工作流**：完成第 21～24 节，最后使用第 25 节速查。

本文示例分成三类：

- **公开练习**：使用 `https://example.com` 或 `https://httpbin.org`。它们是外部网站，需要联网；可用性和返回内容可能变化。httpbin 会回显你发送的数据，**只发送本文中的虚构练习数据，不要发送真实密码、令牌或私人文件**。
- **本地操作**：查看文件、创建练习文件、处理文本等。除非写出绝对路径，否则文件保存在终端的“当前目录”。
- **模板**：使用 `api.example.invalid`、`download.example.invalid` 等地址。`.invalid` 专用于无效域名示例，**不替换就无法访问**。应按真实接口文档替换地址、字段及凭证。

代码块中没有终端提示符 `$`，可以直接复制。出现 `你的用户名`、`你的接口地址` 等字样时，需要自行替换。不要整篇一次性运行；先理解每个示例。

## 目录

- [1. curl 到底是什么？](#chapter-1)
- [2. 打开终端，以及最少需要知道的命令](#chapter-2)
- [3. 看懂命令的基本结构](#chapter-3)
- [4. 最少的 HTTP 知识：你到底在发送什么？](#chapter-4)
- [5. 第一次请求：看正文、看头、看状态](#chapter-5)
- [6. 跳转、静默与压缩](#chapter-6)
- [7. 下载与保存文件](#chapter-7)
- [8. GET 请求与查询参数](#chapter-8)
- [9. 请求头：`-H`](#chapter-9)
- [10. POST：提交表单与 JSON](#chapter-10)
- [11. PUT、PATCH、DELETE：`-X` 的正确位置](#chapter-11)
- [12. 上传文件：表单上传与直接上传](#chapter-12)
- [13. 认证：用户名密码、Token 与 Cookie](#chapter-13)
- [14. 超时、重试与比较可靠的请求模板](#chapter-14)
- [15. HTTP 状态码与 curl 退出码：不是同一回事](#chapter-15)
- [16. 调试请求：`-v`、响应头与日志](#chapter-16)
- [17. 网络耗时、IP 与 HTTP 版本](#chapter-17)
- [18. 代理、DNS 与证书](#chapter-18)
- [19. 配套命令：与 curl 一起用才方便](#chapter-19)
- [20. 配套网络排查：dig、nc、ping 和 openssl](#chapter-20)
- [21. 从浏览器复制 curl 命令](#chapter-21)
- [22. 写一个能判断结果的简单脚本](#chapter-22)
- [23. 高级但有用：流式输出、多个下载与配置文件](#chapter-23)
- [24. 从零练习：按顺序完成 8 个小任务](#chapter-24)
- [25. 速查：先记住这些就够用](#chapter-25)
- [26. 新手常见错误与对应处理](#chapter-26)
- [27. 查帮助与继续学习](#chapter-27)
- [28. 本文的核验范围](#chapter-28)

<a id="chapter-1"></a>

## 1. curl 到底是什么？

**curl 是一个在命令行中传输数据的工具。** 最常见的用途，是通过 HTTP 或 HTTPS 向网站或接口发送请求，再接收结果。

你在浏览器中打开网页时，浏览器会向服务器请求内容。curl 也能发请求，但它通常直接输出服务器返回的数据，不会把网页排版成浏览器中的样子。

例如：

```sh
curl 'https://example.com'
```

这条命令的意思是：“请获取这个网址的内容，并显示在终端里。”你通常会看到 HTML 源码。

curl 常用于：

- 下载网页、安装包、图片和其他文件。
- 调用 API，也就是程序之间交换数据的接口。
- 发送表单、JSON 和上传文件。
- 检查响应头、HTTP 状态码和请求耗时。
- 排查 DNS、连接、代理和证书问题。

curl **不会自动执行网页中的 JavaScript**，也不会自动完成图形验证码或浏览器交互。网页在浏览器里能显示、curl 却拿不到相同内容，并不一定是命令错误。

<a id="chapter-2"></a>

## 2. 打开终端，以及最少需要知道的命令

### 2.1 打开 macOS 终端

按 `Command + 空格`，输入“终端”或 `Terminal`，按回车。

终端里通常有类似这样的提示：

```text
dsy@Mac ~ %
```

这不是你要输入的命令。你只需在它后面输入命令，然后按回车。

- `Control + C`：中断当前命令。适合请求长时间不结束时使用。
- 方向键 `↑`：查看上一条命令。
- `Tab`：补全文件名或目录名。
- `clear` 或 `Command + K`：清理屏幕显示；不等于删除历史记录。

### 2.2 先创建独立练习目录

```sh
mkdir -p "$HOME/Desktop/curl练习"
cd "$HOME/Desktop/curl练习"
pwd
```

逐行解释：

- `mkdir`：创建目录；`-p` 表示父目录不存在时一并创建，目录已存在时通常不报错。
- `$HOME`：你的个人主目录，在这台电脑上是 `/Users/dsy`。
- `cd`：切换当前目录。
- `pwd`：显示当前目录的完整路径。

后续教程默认你在这个练习目录里。**每次打开新的终端窗口，当前目录未必还是这里，需要重新 `cd`。**

### 2.3 查看目录与文件

```sh
ls
ls -lh
ls -la
```

- `ls`：列出文件。
- `-l`：显示详细信息。
- `-h`：以较易读的单位显示文件大小，常与 `-l` 一起使用。
- `-a`：也显示以点开头的隐藏文件。

查看小型文本文件：

```sh
cat '文件名.txt'
```

分页查看大型文本文件：

```sh
less '文件名.txt'
```

在 `less` 里，空格翻页，输入 `/关键词` 后回车可搜索，按 `q` 退出。这里的文件名只是模板，要换成实际存在的文件。

### 2.4 检查工具是否存在

```sh
curl --version
command -v curl
command -v jq
python3 --version
```

`command -v` 会显示将要执行的程序位置；没有输出通常表示当前搜索路径里找不到它。本机已检测到这些工具，不需要为了本教程重复安装。

`curl --version` 中：

- 首行包含版本号。
- `Protocols` 表示支持哪些协议。
- `Features` 表示编译时启用了哪些能力。

本机 curl 支持 HTTP/2，但检测到的能力列表里**没有 HTTP/3**。即使帮助里出现某个选项，也不代表当前构建一定支持该能力。

<a id="chapter-3"></a>

## 3. 看懂命令的基本结构

```text
curl [选项] [选项的值] URL
```

这里的方括号表示“可以有，也可以没有”，不是要输入的字符。

看一个例子：

```sh
curl -L -o example.html 'https://example.com'
```

- `curl`：程序名称。
- `-L`：允许跟随服务器的跳转。
- `-o`：指定保存到哪里。
- `example.html`：`-o` 的值，也就是本地文件名。
- 最后的字符串：目标网址。

### 3.1 短选项与长选项

很多选项有两种写法，例如：

```sh
curl -L 'https://example.com'
curl --location 'https://example.com'
```

这两条命令等价。短选项区分大小写：`-o` 和 `-O`、`-i` 和 `-I`、`-v` 和 `-V` 都不同。

不带参数的短选项常可以合并：

```sh
curl -sS -L 'https://example.com'
```

其中 `-sS` 相当于 `-s -S`。刚开始学习时，可以把选项分开写，方便理解。

### 3.2 为什么 URL 要加引号？

建议始终给 URL 加引号：

```sh
curl 'https://httpbin.org/get?name=Alice&age=20'
```

因为 `&`、`?`、`*` 等字符在 Shell 中有特殊含义。不加引号时，Shell 可能在 curl 收到 URL 之前就把它拆错。

- 单引号 `'...'`：内容基本按原样传递；里面的 `$变量` 不展开。
- 双引号 `"..."`：保留空格，同时允许展开 `$变量`。
- 路径有空格或中文时，也建议加引号。
- 使用英文半角引号，不要用中文弯引号 `“ ”` 替代。

例子：

```sh
URL='https://example.com'
curl "$URL"
```

变量赋值时，等号左右**不能有空格**。`curl '$URL'` 则会把 `$URL` 当成字面内容，并不会使用变量值。

### 3.3 多行命令中的反斜杠

```sh
curl --location \
  --connect-timeout 10 \
  --max-time 30 \
  'https://example.com'
```

行尾的 `\` 表示“这条命令下一行继续”。**反斜杠必须是该行最后一个字符，后面不要再放空格或注释。**

终端出现 `>` 提示符，通常表示命令还没输入完，例如引号未闭合。它不一定是网络卡住。拿不准时按 `Control + C` 取消，再重新粘贴。

### 3.4 `@`、`-` 和 `--` 的含义

- 在 `--data-binary @payload.json` 中，`@` 告诉 curl 从文件读取数据。
- 在 `--data-binary @-` 中，`-` 表示从标准输入读取数据。
- 在 `-o -` 中，`-` 表示把结果写到标准输出。
- 单独的 `--` 通常表示结束选项解析，后面的内容按非选项参数处理。

这些符号的意义与所在选项有关；`@` 不是任何位置都代表文件。

<a id="chapter-4"></a>

## 4. 最少的 HTTP 知识：你到底在发送什么？

### 4.1 URL 的组成

```text
https://api.example.invalid:443/users?page=1&size=10
```

- `https`：协议，HTTPS 会加密传输。
- `api.example.invalid`：域名。
- `443`：端口；HTTPS 默认 443，HTTP 默认 80，默认端口一般可以省略。
- `/users`：路径。
- `?page=1&size=10`：查询参数，多个参数用 `&` 分隔。

URL 中的 `#片段` 通常由客户端处理，HTTP 请求不会把它作为路径发送给服务器。

### 4.2 请求与响应

一次请求通常包含：

1. **方法**：例如 GET 或 POST。
2. **URL**：请求哪个地址。
3. **请求头**：例如告诉服务器你发送的是 JSON。
4. **请求体**：实际提交的数据；并非每个请求都有。

服务器返回的响应通常包含：

1. **状态码**：例如 200、404、500。
2. **响应头**：例如内容类型、缓存规则。
3. **响应体**：网页、JSON、图片或其他数据。

### 4.3 常见方法

- `GET`：读取资源。curl 在没有上传等特殊选项时通常默认使用它。
- `HEAD`：获取响应头，不接收正常的响应体。
- `POST`：提交数据，常用于创建记录、登录或触发操作。
- `PUT`：常用于整体写入或替换资源。
- `PATCH`：常用于部分修改资源。
- `DELETE`：常用于删除资源。

这是常见约定，**最终含义由接口文档决定**。不要仅凭方法名称判断某个真实接口有没有副作用。

### 4.4 常见状态码

- `200`：请求成功，但仍需检查响应内容是否符合业务预期。
- `201`：资源创建成功。
- `204`：成功，但没有响应体。
- `301`、`302`、`303`、`307`、`308`：常见重定向。
- `304`：资源未修改，通常与缓存条件请求有关。
- `400`：参数或请求格式有问题。
- `401`：缺少有效认证，或认证失败。
- `403`：服务器拒绝访问，可能与权限或访问策略有关。
- `404`：目标资源不存在。
- `405`：请求方法不被允许。
- `409`：状态冲突，例如重复创建。
- `415`：请求的数据类型不被支持。
- `422`：服务器无法按规则处理提交的数据，具体含义依接口而定。
- `429`：请求太频繁。
- `500`：服务器内部错误。
- `502`、`503`、`504`：常见网关错误、服务不可用或上游超时。

<a id="chapter-5"></a>

## 5. 第一次请求：看正文、看头、看状态

### 5.1 只看响应体

```sh
curl 'https://example.com'
```

默认输出主要是响应体。进度信息和错误通常走另一个输出通道，后面会讲。

### 5.2 同时显示响应头与响应体：`-i`

```sh
curl -i 'https://example.com'
```

示意输出，不保证与你实际结果完全相同：

```text
HTTP/2 200
content-type: text/html
...

<!doctype html>
...
```

空行前主要是响应头，后面是响应体。

### 5.3 用 HEAD 获取响应头：`-I`

```sh
curl -I 'https://example.com'
```

**`-I` 会改用 HEAD 请求，并不是把 GET 的正文藏起来。** 有的接口支持 GET 却不支持 HEAD，因此 `curl -I` 得到 405 时，不能直接认定网站不可用。

如果需要真正执行 GET，但只保留响应头：

```sh
curl -sS -D - -o /dev/null 'https://example.com'
```

- `-D -`：把响应头写到标准输出。
- `-o /dev/null`：把响应体丢弃。
- `/dev/null`：系统提供的“丢弃数据”目标，不是你需要创建的文件。

### 5.4 只显示状态码：`-w`

```sh
curl -sS -o /dev/null -w '%{http_code}\n' 'https://example.com'
```

`-w` 在传输结束后输出指定信息。`%{http_code}` 是 curl 的变量，`\n` 表示换行。

如果看到 `000`，通常表示没有取得 HTTP 响应码；它不是服务器定义的 HTTP 状态码，需要结合 curl 的错误信息判断。

<a id="chapter-6"></a>

## 6. 跳转、静默与压缩

### 6.1 跟随跳转：`-L`

```sh
curl -L 'https://httpbin.org/redirect/2'
```

服务器可能让你改去另一个地址。curl 默认不会像浏览器那样自动跟随所有 HTTP 跳转；`-L` 用来开启这个行为。

限制跳转次数并查看最终地址：

```sh
curl -sS -L --max-redirs 5 \
  -o /dev/null \
  -w '最终地址：%{url_effective}\n状态码：%{http_code}\n' \
  'https://httpbin.org/redirect/2'
```

`-L` 不会执行 HTML 中的 JavaScript 跳转。对 POST 使用跳转时，还要注意方法可能变化：常见情况下，301、302、303 会让后续请求变为 GET；307、308 通常保留方法和请求体。

### 6.2 不显示进度，但保留错误：`-sS`

```sh
curl -sS 'https://example.com'
```

- `-s`：静默，会隐藏进度，也隐藏 curl 的错误提示。
- `-S`：配合 `-s` 时重新显示错误。
- 因而脚本与 JSON 处理通常用 `-sS`，不只用 `-s`。

`-sS` 不会隐藏响应体，也不会自动把 HTTP 404 当成命令失败。

### 6.3 请求压缩响应并自动解压：`--compressed`

```sh
curl -sS --compressed 'https://example.com'
```

curl 会声明支持的压缩格式，并自动解压服务器采用的受支持编码。你得到的通常是解压后的正文。

不要只手写 `Accept-Encoding: gzip` 就默认 curl 会以同样方式自动解压；需要这个行为时，直接使用 `--compressed`。

<a id="chapter-7"></a>

## 7. 下载与保存文件

**文件操作提醒：普通 `-o`、Shell 的 `>` 等操作可能覆盖同名文件。本文练习采用独立目录，下载示例尽量添加 `--no-clobber`。**

### 7.1 自己指定文件名：`-o`

```sh
curl -fL --no-clobber -o example.html 'https://example.com'
```

- `-f`：让常见 HTTP 4xx/5xx 响应导致 curl 返回失败，并不输出该错误响应体。
- `-L`：跟随跳转。
- `-o example.html`：保存到当前目录的这个文件。
- `--no-clobber`：不覆盖已存在文件；通常会使用带数字后缀的新名字。留意实际保存的文件名。

查看结果：

```sh
ls -lh example.html
file example.html
head -n 5 example.html
```

`file` 尝试识别文件类型，`head -n 5` 显示前 5 行。若下载到了带后缀的新文件，请相应替换文件名。

### 7.2 使用 URL 中的文件名：`-O`

下面是模板，需要换成真实下载地址：

```sh
curl -fL --no-clobber -O 'https://download.example.invalid/files/manual.pdf'
```

`-O` 是大写字母 O，它通常使用 URL 路径末尾的名字保存文件，不需要你再提供本地文件名。

- `-o report.pdf URL`：你指定名字。
- `-O URL`：从 URL 取名字。
- `-OJ URL`：结合 `-J` 使用服务器 `Content-Disposition` 响应头中的文件名。只对可信来源使用，执行后检查实际文件名。

新手优先使用 `-o`，结果更明确。下载失败时也可能留下空文件或部分文件，不能仅凭“文件存在”判断成功。

### 7.3 保存到指定目录

```sh
curl -fL --no-clobber --create-dirs \
  -o "$HOME/Desktop/curl练习/pages/example.html" \
  'https://example.com'
```

`--create-dirs` 为输出路径创建缺少的目录。双引号让 `$HOME` 展开，并保护路径中的空格。

### 7.4 显示简洁进度条

```sh
curl -fL --progress-bar --no-clobber \
  -o example-progress.html 'https://example.com'
```

`--progress-bar` 的短写是 `-#`。很小的文件可能瞬间完成，看不到明显进度变化。

### 7.5 大文件断点续传：`-C -`

模板：

```sh
curl -fL -C - -o large.zip \
  'https://download.example.invalid/files/large.zip'
```

- `-C -`：根据现有本地文件长度，尝试从断点继续。
- 服务器需要支持相应的范围请求。
- 本地部分文件必须属于同一个、内容没有变化的远程文件。
- 这是有意继续写入已有文件，所以不要和“另存为新文件”的思路混用。
- 失败后先看错误，别随意删除 `-C -` 重跑，否则可能从头覆盖已有部分文件。

### 7.6 限速、限制大小与范围下载

以下均是模板：

```sh
curl -fL --limit-rate 500K --no-clobber -o package.zip \
  'https://download.example.invalid/files/package.zip'
```

`500K` 在这里表示约 500 × 1024 字节/秒，不是 500 千比特/秒。

```sh
curl -fL --max-filesize 10M --no-clobber -o small-package.zip \
  'https://download.example.invalid/files/package.zip'
```

`--max-filesize` 限制下载大小；不同旧版本对未知长度响应的处理有差异，使用前可查本机手册。

```sh
curl -fL --range 0-1023 --no-clobber -o first-1024-bytes.bin \
  'https://download.example.invalid/files/package.zip'
```

`0-1023` 是前 1024 个字节，但服务器可能忽略范围并返回完整内容。应检查是否得到 `206 Partial Content` 及 `Content-Range`，不能只凭参数就认定只下载了一小段。

<a id="chapter-8"></a>

## 8. GET 请求与查询参数

### 8.1 参数直接写在 URL 中

```sh
curl -sS 'https://httpbin.org/get?name=Alice&age=20'
```

httpbin 会返回 JSON，其中 `args` 字段能看到传入的查询参数。

### 8.2 有中文、空格或特殊符号：`-G` + `--data-urlencode`

```sh
curl -sS --get \
  --data-urlencode 'q=curl 入门教程' \
  --data-urlencode 'page=1' \
  'https://httpbin.org/get'
```

- `--get` 的短写是 `-G`。
- `--data-urlencode` 编码参数中的特殊字符。
- 配合 `--get`，这些数据放进 URL 查询参数，而不是按默认行为作为 POST 请求体提交。

**只有 `--data-urlencode`、没有 `-G` 时，curl 通常会发送 POST。**

不要用 `-X GET -d ...` 代替 `-G`。前者只是显式指定方法，可能形成带请求体的 GET，并不会自动把数据放进 URL。

查询参数可能出现在日志和历史中，不适合承载密码或令牌。

<a id="chapter-9"></a>

## 9. 请求头：`-H`

```sh
curl -sS \
  -H 'Accept: application/json' \
  -H 'X-Learning-Note: curl-basics' \
  'https://httpbin.org/headers'
```

`-H` 每次添加一个请求头，可重复使用。请求头名称通常不区分大小写。

最容易混淆的两个头：

- **`Content-Type`**：我发给服务器的数据是什么格式。
- **`Accept`**：我希望服务器返回什么格式；服务器不一定接受这个偏好。

其他常见头：

- `Authorization`：认证凭证。
- `User-Agent`：客户端标识。
- `Cookie`：会话信息等。
- `Referer`：请求来源地址，拼写就是 `Referer`。

使用专门的选项设置客户端标识和来源：

```sh
curl -sS \
  -A 'curl-learning/1.0' \
  -e 'https://example.com/' \
  'https://httpbin.org/headers'
```

`-A` 对应 `User-Agent`，`-e` 对应 `Referer`。改变这些头不等于获得访问权限，也不等于让 curl 具备浏览器的 JavaScript 能力。

<a id="chapter-10"></a>

## 10. POST：提交表单与 JSON

### 10.1 普通表单：`-d`

```sh
curl -sS \
  -d 'name=Alice' \
  -d 'age=20' \
  'https://httpbin.org/post'
```

- `-d` 是 `--data` 的短写。
- 使用它时，curl 默认改用 POST，所以通常不用再写 `-X POST`。
- 多个 `-d` 通常用 `&` 连接。
- 默认内容类型为 `application/x-www-form-urlencoded`。
- `-d` 不会替你正确编码所有字段值中的特殊字符。

字段有中文、空格或 `&` 时，用：

```sh
curl -sS \
  --data-urlencode 'name=张三' \
  --data-urlencode 'message=hello & goodbye' \
  'https://httpbin.org/post'
```

### 10.2 发送 JSON：先看完整写法

JSON 是一种常见的数据格式。对象用 `{}`，字段名和字符串使用英文双引号，数字不加引号。

```sh
curl -sS \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  --data '{"name":"Alice","age":20,"active":true}' \
  'https://httpbin.org/post'
```

这里外层单引号归 Shell 使用；里面的双引号属于 JSON。

以下是有效 JSON：

```json
{"name":"Alice","age":20,"active":true}
```

下面是无效 JSON，不要提交：

```text
{'name': 'Alice'}
{"name":"Alice",}
```

原因分别是 JSON 字符串不能使用单引号，以及最后一个字段后不能有多余逗号。

### 10.3 更简洁的写法：`--json`

```sh
curl -sS \
  --json '{"name":"Alice","age":20,"active":true}' \
  'https://httpbin.org/post'
```

`--json` 从 curl 7.82.0 开始提供，本机 8.7.1 支持它。它会设置 JSON 相关请求头，并以类似 `--data-binary` 的方式发送数据。

**`--json` 不会替你验证 JSON 语法，也不会替你对变量值做 JSON 转义。**

### 10.4 从文件读取 JSON

在练习目录中创建一个新文件。下面使用 `noclobber` 防止覆盖同名文件；如果文件已存在，会报错，此时先查看它或换一个文件名。

```sh
(
  set -o noclobber
  cat > payload.json <<'JSON'
{
  "name": "Alice",
  "age": 20,
  "message": "你好，curl"
}
JSON
)
```

这是 Shell 的 **here-document** 写法：把两行 `JSON` 标记之间的内容交给 `cat`。标记本身不是文件内容。`<<'JSON'` 中的引号阻止 Shell 展开正文里的变量。圆括号让这次 Shell 选项设置仅影响里面的命令。

验证语法：

```sh
jq . payload.json
```

提交文件：

```sh
curl -sS --json @payload.json 'https://httpbin.org/post'
```

`@payload.json` 表示读取本地文件。如果路径有空格，可写成：

```sh
curl -sS --json '@我的请求数据.json' 'https://httpbin.org/post'
```

上面第二条要求你已经有对应文件。

### 10.5 `-d`、`--data-raw`、`--data-binary` 的区别

- `-d 'x=1'`：常见表单文本。
- `-d @file.txt`：读取文件，但可能去掉文件中的回车、换行等字符，不适合要求原样发送的内容。
- `--data-raw '@hello'`：把 `@hello` 当作普通文字，不按文件名读取。
- `--data-binary @file.bin`：尽量原样发送文件字节，适合二进制或需要保留换行的内容。
- `--json @payload.json`：方便地发送 JSON 文件，并配置相关请求头。

`--data-binary` 本身不自动推断正确的媒体类型。发送二进制时常需要自行设置 `Content-Type: application/octet-stream`。

<a id="chapter-11"></a>

## 11. PUT、PATCH、DELETE：`-X` 的正确位置

**以下写操作只对 httpbin 的回显端点演示。把地址换成真实服务后，可能修改或删除真实数据，应先确认目标和影响。**

PUT：

```sh
curl -sS -X PUT \
  --json '{"name":"Alice","age":21}' \
  'https://httpbin.org/put'
```

PATCH：

```sh
curl -sS -X PATCH \
  --json '{"age":22}' \
  'https://httpbin.org/patch'
```

DELETE：

```sh
curl -sS -X DELETE 'https://httpbin.org/delete'
```

`-X` 的作用是显式指定 HTTP 方法。它不是“开启某种完整工作模式”的万能开关：

- 下载不需要写 `-X GET`。
- `-d`、`--json`、`-F` 通常已经默认使用 POST。
- 获取 HEAD 响应用 `-I`，不要用 `-X HEAD` 冒充它。
- 显式 `-X` 与 `-L` 组合时，方法在后续跳转中的表现可能出乎预期；调试写操作时先看接口的跳转规则。

<a id="chapter-12"></a>

## 12. 上传文件：表单上传与直接上传

### 12.1 先创建无隐私的练习文件

```sh
(
  set -o noclobber
  printf '%s\n' 'Hello curl. This is a public practice file.' > upload-demo.txt
)
```

### 12.2 表单上传：`-F`

```sh
curl -sS \
  -F 'file=@upload-demo.txt' \
  -F 'description=curl practice' \
  'https://httpbin.org/post'
```

- `-F` 使用 `multipart/form-data` 格式。
- `file` 是服务端约定的字段名，真实接口未必叫这个。
- `@upload-demo.txt` 表示把文件作为上传文件提交。
- `description` 是普通文本字段。

**不要自己随意加 `-H 'Content-Type: multipart/form-data'`。** curl 会生成包含分隔标记 boundary 的正确请求头，手动设置容易破坏格式。

指定上传文件的媒体类型：

```sh
curl -sS \
  -F 'file=@upload-demo.txt;type=text/plain' \
  'https://httpbin.org/post'
```

字段内容来自不确定的文本、可能以 `@` 开头时，可用 `--form-string 'note=@不是文件'` 强制作为普通字符串处理。

### 12.3 直接上传：`-T`

```sh
curl -sS -T upload-demo.txt 'https://httpbin.org/put'
```

对 HTTP 而言，`-T` 通常发起 PUT，把文件作为请求体直接上传。这与 `-F` 的多段表单上传不是同一种格式。

真实服务是否接受 `-T`、需要哪种认证，取决于接口文档。**上传方式要匹配服务器要求，不是任选一个能用的参数。**

<a id="chapter-13"></a>

## 13. 认证：用户名密码、Token 与 Cookie

### 13.1 HTTP Basic Auth：`-u`

公开练习：

```sh
curl -sS -u 'demo:demo-pass' \
  'https://httpbin.org/basic-auth/demo/demo-pass'
```

用户名为 `demo`，密码为 `demo-pass`，都是虚构练习值。

Basic Auth 对用户名和密码做编码，不是单独的加密。真实认证应通过 HTTPS 传输。

真实接口模板中，可以只提供用户名，让 curl 交互询问密码：

```sh
curl -sS -u '你的用户名' \
  'https://api.example.invalid/me'
```

这样可以避免直接把密码写进命令文本，但仍应注意运行环境和日志安全。

### 13.2 Bearer Token

Token 可以理解为服务器发给你的访问凭证。常见请求头形式是：

```text
Authorization: Bearer 你的令牌
```

以下为真实接口模板。先把地址替换成你有权访问的服务；不要把真实令牌发给 httpbin。

```sh
printf '请输入 Token（输入不回显）：'
read -rs API_TOKEN
printf '\n'

curl -sS \
  -H "Authorization: Bearer $API_TOKEN" \
  'https://api.example.invalid/me'

unset API_TOKEN
```

- `read -rs`：读取一行，保留反斜杠，且不在屏幕回显输入。
- 双引号允许展开变量，所以这里不能使用单引号。
- `unset` 删除当前 Shell 中的变量。

这种方式能减少令牌直接进入命令历史的机会，但**不是彻底隐藏秘密**：展开后的参数可能被进程检查看到，调试日志也可能记录凭证。

不要把真实 Token 放进教程、截图、共享日志、Git 仓库或公共回显网站。不要为了跨域跳转认证就盲目使用 `--location-trusted`，它可能把凭证发送到跳转后的其他主机。

### 13.3 Cookie：`-b` 和 `-c`

发送一个虚构 Cookie：

```sh
curl -sS -b 'theme=dark' 'https://httpbin.org/cookies'
```

把服务器设置的 Cookie 保存到文件：

```sh
curl -sS -L -c cookies.txt \
  'https://httpbin.org/cookies/set?theme=dark'
```

下次读取并发送：

```sh
curl -sS -b cookies.txt 'https://httpbin.org/cookies'
```

- `-b`：发送 Cookie，既可接收字符串，也可从文件读取。
- `-c`：把 Cookie 存储写入指定文件，会更新或覆盖该文件。
- `-b cookies.txt -c cookies.txt`：读取旧会话，并在请求后保存更新。

真实登录的 Cookie 可能等同于账号凭证。不要共享它，也不要把不同网站的 Cookie 随意混用。登录常还涉及 CSRF 校验等步骤，仅复制 Cookie 不一定足够。

<a id="chapter-14"></a>

## 14. 超时、重试与比较可靠的请求模板

### 14.1 两种超时

```sh
curl -sS \
  --connect-timeout 10 \
  --max-time 30 \
  'https://example.com'
```

- `--connect-timeout 10`：连接阶段最多等约 10 秒，涉及 DNS、连接及所需握手。
- `--max-time 30`，短写 `-m 30`：限制一次传输的总耗时，包括连接和数据传输。

它们不是“服务器处理时间”和“下载时间”的简单拆分。下载大文件时，30 秒可能太短，需要调整。

### 14.2 自动重试

```sh
curl -sS --fail-with-body \
  --connect-timeout 10 \
  --max-time 30 \
  --retry 3 \
  --retry-delay 2 \
  --retry-max-time 90 \
  'https://example.com'
```

- `--retry 3`：对 curl 认定的某些临时错误，最多重试 3 次，不含第一次请求。
- `--retry-delay 2`：设置重试等待时间；服务器的 `Retry-After` 等也可能影响等待。
- `--retry-max-time 90`：限制继续发起重试的时间窗口，**不是严格的整个命令 90 秒截止时间**；最后一次已开始的请求可能继续运行。

默认不是所有错误都重试。`--retry-all-errors` 范围更大，新手不应直接当作通用修复。

**付款、创建订单、发送消息等请求，不要盲目自动重试。** 服务器可能已经处理成功，只是响应丢失，再次提交可能造成重复操作。能否安全重试应依据接口的幂等机制，即重复提交是否仍只产生一次预期效果。

### 14.3 常用读取接口模板

```sh
curl -sS --fail-with-body \
  --connect-timeout 10 \
  --max-time 30 \
  -H 'Accept: application/json' \
  'https://httpbin.org/get'
```

如果接口文档要求跟随跳转，再考虑添加 `-L`。模板并不保证适用于所有接口；流式响应、大文件和特殊认证可能需要不同设置。

<a id="chapter-15"></a>

## 15. HTTP 状态码与 curl 退出码：不是同一回事

### 15.1 默认情况下，404 也可能退出成功

```sh
curl -sS 'https://httpbin.org/status/404'
echo $?
```

如果网络传输正常完成，curl 默认可能返回退出码 `0`，尽管 HTTP 状态码是 `404`。

`$?` 是**上一条命令的退出码**。必须紧接着读取；中间运行别的命令就会被覆盖。

### 15.2 `--fail` 与 `--fail-with-body`

```sh
curl -sS --fail-with-body 'https://httpbin.org/status/404'
echo $?
```

通常会得到 curl 退出码 `22`。

- `-f` / `--fail`：常见 HTTP 错误返回非零退出码，并抑制错误响应体。
- `--fail-with-body`：也返回非零退出码，但保留错误响应体，方便查看 API 给出的原因。
- 两者选一个使用，不要同时指定。
- `--fail-with-body` 从 curl 7.76.0 起提供，本机支持。

这些选项不是业务成功判定器，也不等于所有非 2xx 都失败；重定向等情况需要单独看状态码。认证握手等特殊场景还应以手册和实际行为为准。

### 15.3 常见 curl 退出码

- `0`：curl 层面的传输按其规则完成，不代表业务一定成功。
- `3`：URL 格式错误。
- `5`：无法解析代理主机。
- `6`：无法解析目标主机。
- `7`：连接失败。
- `18`：传输的文件不完整。
- `22`：启用失败选项后检测到 HTTP 错误。
- `23`：写入本地文件或输出失败。
- `26`：读取本地输入文件失败。
- `28`：超时。
- `35`：TLS/SSL 握手相关错误。
- `47`：重定向次数过多。
- `52`：服务器未返回预期响应内容，出现空回复。
- `56`：接收数据失败。
- `60`：服务端证书验证失败。

这不是完整列表，排查时保留原始错误文字比只记数字更有帮助。

<a id="chapter-16"></a>

## 16. 调试请求：`-v`、响应头与日志

### 16.1 详细日志：`-v`

```sh
curl -v --connect-timeout 10 --max-time 30 'https://example.com'
```

常见标记：

- `*`：连接和协议说明。
- `>`：发出的请求信息。
- `<`：收到的响应信息。

可以依次观察：域名是否解析成功 → 是否连接成功 → TLS 是否成功 → 发出了什么方法和头 → 收到了什么状态码和正文。

### 16.2 分别保存响应体、响应头和调试日志

在练习目录中，以下命令会写入三个文件。**重复执行可能覆盖 `response.headers` 和 `debug.log`；正文已有文件时会因 `--no-clobber` 改名。**

```sh
curl -v --no-clobber \
  --connect-timeout 10 --max-time 30 \
  -D response.headers \
  -o response.html \
  'https://example.com' \
  2> debug.log
```

- `-D response.headers`：响应头。
- `-o response.html`：响应体。
- `2> debug.log`：Shell 把标准错误写入日志；curl 的详细调试信息通常在这里。

跳转或代理连接可能产生多组响应头，不能总把第一行状态码当成最终结果。

### 16.3 更完整的追踪

```sh
curl --trace-ascii trace.txt --trace-time \
  -o /dev/null \
  'https://example.com'
```

`--trace-ascii` 会记录更详细的收发内容，`--trace-time` 加入时间信息。日志会写入指定文件，重复执行可能覆盖。

**日志可能包含 Token、Cookie 和请求正文。共享前先脱敏。** `-v` 与 trace 通常按调试需要择一使用。

<a id="chapter-17"></a>

## 17. 网络耗时、IP 与 HTTP 版本

### 17.1 查看一次请求的耗时

```sh
curl -sS -o /dev/null \
  --connect-timeout 10 --max-time 30 \
  -w '状态码：%{http_code}\n远端IP：%{remote_ip}\nDNS累计：%{time_namelookup}s\n连接累计：%{time_connect}s\nTLS累计：%{time_appconnect}s\n首字节累计：%{time_starttransfer}s\n总耗时：%{time_total}s\n下载字节：%{size_download}\n平均下载速度：%{speed_download} 字节/秒\n' \
  'https://example.com'
```

这些时间多数是**从请求开始算起的累计时间点**，不能直接相加。

在一次简单、全新、直连的 HTTPS 请求里，可以近似理解：

- DNS 阶段：`time_namelookup`。
- DNS 后到连接完成：`time_connect - time_namelookup`。
- TLS 阶段：`time_appconnect - time_connect`。
- 首字节时间还包含网络往返和服务端处理等，不能简单等同于后端代码执行时间。

代理、连接复用和多次跳转都会让解释更复杂。一次测速也不能代表网站长期性能。

### 17.2 强制 IPv4 或 IPv6

```sh
curl -4 -I --connect-timeout 10 --max-time 20 'https://example.com'
curl -6 -I --connect-timeout 10 --max-time 20 'https://example.com'
```

如果只有 `-6` 失败，可能是当前网络没有可用的 IPv6 路径，不一定是网站故障。

### 17.3 HTTP/1.1 与 HTTP/2

```sh
curl --http1.1 -I 'https://example.com'
curl --http2 -I 'https://example.com'
```

是否最终使用 HTTP/2 还与服务端和协议协商有关。可以输出实际版本：

```sh
curl -sS -o /dev/null -w '%{http_version}\n' 'https://example.com'
```

不要照抄 `--http3` 假定能用：本机当前 curl 构建未显示 HTTP/3 支持。

<a id="chapter-18"></a>

## 18. 代理、DNS 与证书

### 18.1 HTTP 代理：`-x`

下面是模板，前提是本机已有代理程序，并确认了端口。**7890 只是示例，不代表你电脑上的真实端口。**

```sh
curl -x 'http://127.0.0.1:7890' \
  --connect-timeout 10 --max-time 30 \
  'https://example.com'
```

`127.0.0.1` 表示本机。通过 HTTP 代理访问 HTTPS 目标时，通常使用 CONNECT 建立隧道，不意味着目标连接变成明文 HTTP。

### 18.2 SOCKS5 代理

```sh
curl --proxy 'socks5h://127.0.0.1:7890' \
  --connect-timeout 10 --max-time 30 \
  'https://example.com'
```

- `socks5://`：目标域名通常在本地解析。
- `socks5h://`：把目标域名解析交给代理。

代理协议和端口必须匹配你的实际配置。

### 18.3 临时绕过代理

```sh
curl --noproxy '*' 'https://example.com'
```

星号需要引号保护。它表示本次请求对所有主机绕过代理。

代理也可能来自环境变量，例如 `http_proxy`、`https_proxy`、`ALL_PROXY` 和 `NO_PROXY`。检查时只查看相关变量，避免把整个环境里的秘密打印出来：

```sh
printenv http_proxy https_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY all_proxy NO_PROXY no_proxy
```

未设置某些变量时，命令可能返回非零退出码，这不一定是异常。输出里也可能含代理账号密码，分享前要检查。

注意：curl 出于安全原因不把大写 `HTTP_PROXY` 当作 HTTP 代理配置，通常应使用小写 `http_proxy`。不要假定所有环境变量都大小写等价。

只对单次命令设置环境变量：

```sh
https_proxy='http://127.0.0.1:7890' curl 'https://example.com'
```

这不会永久更改系统代理设置。

### 18.4 指定域名解析到某个 IP：`--resolve`

这是测试服务器时的模板：

```sh
curl --resolve 'api.example.invalid:443:203.0.113.10' \
  'https://api.example.invalid/health'
```

这里的域名和 IP 都是示例。`203.0.113.10` 属于文档示例地址，不能当成真实服务使用。

`--resolve` 可以在本次请求中指定域名与端口对应的 IP，同时保留 URL 的主机名供 HTTP 和 TLS 使用。它比“直接访问 IP，再手写 Host 头”更适合许多 HTTPS 测试场景；代理存在时，解析行为还需结合代理类型判断。

### 18.5 证书问题先排查，不先关闭验证

出现证书错误时，先检查：

1. 系统日期和时间是否正确。
2. URL 域名是否写错。
3. 证书是否过期，证书链是否完整。
4. 公司网络、代理或测试环境是否使用自有证书。

如果管理方提供了可信 CA 文件，可按实际环境使用：

```sh
curl --cacert company-ca.pem 'https://api.example.invalid/health'
```

`--cacert` 是指定用于验证服务器的 CA 证书文件。

`-k` / `--insecure` 会跳过服务器证书校验，削弱防止冒充服务器的保护。它不是通用修复方法，尤其不要对带真实凭证的请求长期使用。

双向 TLS 的模板：

```sh
curl --cert client.crt --key client.key --cacert ca.pem \
  'https://api.example.invalid/health'
```

这是服务器要求客户端证书时才用的高级场景。客户端证书、私钥、CA 文件的格式和要求依环境而定。

<a id="chapter-19"></a>

## 19. 配套命令：与 curl 一起用才方便

这一节的命令不是 curl 的选项，而是其他命令行工具或 Shell 语法。

### 19.1 管道 `|`、标准输出和标准错误

```sh
curl -sS 'https://httpbin.org/get' | jq .
```

`|` 把前一个命令的**标准输出**交给后一个命令的**标准输入**。curl 得到 JSON，jq 负责格式化。

- 标准输入：程序从哪里读取输入。
- 标准输出，编号 `1`：正常结果。
- 标准错误，编号 `2`：错误和诊断信息。
- `>`：把标准输出写入文件，通常覆盖原内容。
- `>>`：追加到文件末尾。
- `2>`：把标准错误写入文件。
- `2>&1`：把标准错误合并到标准输出当前指向的位置。

**不要把 `-v` 的日志用 `2>&1` 混进 JSON 后再交给 jq**，否则 jq 可能无法解析。同样，`curl -i ... | jq .` 往往失败，因为响应头不是 JSON。

### 19.2 jq：格式化与提取 JSON

格式化整个对象：

```sh
curl -sS --fail-with-body 'https://httpbin.org/get' | jq .
```

提取字段：

```sh
curl -sS 'https://httpbin.org/get?name=Alice' | jq '.args.name'
```

输出通常是 `"Alice"`，包含 JSON 字符串的引号。去掉外层引号：

```sh
curl -sS 'https://httpbin.org/get?name=Alice' | jq -r '.args.name'
```

本地练习一个数组，避免依赖外网：

```sh
printf '%s\n' '{"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]}' \
  | jq -r '.users[].name'
```

- `.`：当前 JSON 值。
- `.args.name`：逐层取字段。
- `.users[]`：遍历数组。
- `-r`：字符串以普通文本输出。

检查文件是否包含合法 JSON：

```sh
jq . payload.json > /dev/null
echo $?
```

语法合法不代表字段符合 API 规则。对于业务条件，可用 `jq -e`，让结果为 `false`、`null` 或无结果等情况反映到退出状态。

### 19.3 动态变量生成 JSON：不要手工拼接

```sh
NAME='张三'
jq -n --arg name "$NAME" --argjson age 20 \
  '{name: $name, age: $age}'
```

- `-n`：从零构造 JSON，不读取普通输入。
- `--arg`：把值作为字符串传入，并处理必要的转义。
- `--argjson`：把值作为 JSON 值传入，例如数字、布尔值或对象。

构造后直接提交公开练习数据：

```sh
NAME='张三'
jq -n --arg name "$NAME" --argjson age 20 \
  '{name: $name, age: $age}' \
  | curl -sS --json @- 'https://httpbin.org/post'
```

这比把变量塞进 JSON 字符串更稳妥，因为名字可能包含引号、换行等字符。

### 19.4 Python：没有 jq 时格式化 JSON

```sh
curl -sS 'https://httpbin.org/get' | python3 -m json.tool
```

或者验证本地文件：

```sh
python3 -m json.tool payload.json
```

### 19.5 grep / rg：搜索文本

```sh
curl -sS -I 'https://example.com' | grep -i '^content-type:'
```

- `grep`：按模式筛选文本行。
- `-i`：忽略大小写。
- `^`：表示行开头。

若安装了 `rg`，也可使用：

```sh
rg -i 'error|warning' debug.log
```

搜索文本可以用 grep 或 rg；**提取结构化 JSON 应优先用 jq**，不要用字符串截取来假装解析 JSON。

### 19.6 head / tail / wc / file

```sh
head -n 10 response.html
tail -n 20 debug.log
wc -c response.html
file response.html
```

- `head`：看开头。
- `tail`：看结尾。
- `wc -c`：统计文件字节数。
- `file`：识别文件类型。

这些命令依赖前面生成的文件，文件名不同时请替换。

`curl URL | head` 可能让 head 提前退出，导致 curl 报写入失败，例如退出码 23。需要可靠下载时，先保存完整文件，再用 head 查看。

### 19.7 tee：边看边保存

```sh
curl -sS 'https://httpbin.org/get' | tee result.json | jq .
```

`tee` 把输入同时写入文件和下一个输出通道。**默认会覆盖 `result.json`**。

`tee -a` 可以追加文本，但不要随便往 JSON 文件追加另一个 JSON 对象，否则文件可能不再是单个合法 JSON 文档。

### 19.8 shasum：验证文件摘要

模板，需要先有实际下载文件：

```sh
shasum -a 256 package.zip
```

它会计算 SHA-256 摘要。应与发布方通过可信渠道提供的摘要逐字比较。

摘要相同可支持“内容一致”的判断，但如果文件和摘要都来自同一个被篡改来源，就不能据此证明来源可信。

### 19.9 open：用 macOS 应用打开结果

```sh
open example.html
open .
```

`open example.html` 用默认应用打开文件，`open .` 在 Finder 中打开当前目录。只打开你信任的下载内容。

<a id="chapter-20"></a>

## 20. 配套网络排查：dig、nc、ping 和 openssl

### 20.1 dig：域名能不能解析？

```sh
dig example.com
dig +short example.com A
dig +short example.com AAAA
```

- `A`：IPv4 地址记录。
- `AAAA`：IPv6 地址记录。
- `+short`：简洁输出。

没有输出不一定是断网，也可能是没有对应类型的记录。DNS 解析结果也不等于 HTTP 服务可用；代理可能使用不同的 DNS 路径。

### 20.2 nc：端口能不能建立 TCP 连接？

macOS 示例：

```sh
nc -vz -G 5 example.com 443
```

- `-v`：显示较详细结果。
- `-z`：探测端口，不发送普通应用数据。
- `-G 5`：macOS 版本的连接超时设置。

不同系统的 nc 选项有差异。**连接 443 成功只说明 TCP 层面可连接，不代表 HTTPS 证书、页面或接口业务正常。**

### 20.3 ping：基础连通性参考

```sh
ping -c 4 example.com
```

`-c 4` 表示发送 4 次探测。部分网站或网络禁用 ICMP，所以 ping 失败不等于 HTTPS 访问失败。

### 20.4 openssl：查看 TLS 握手与证书

```sh
openssl s_client \
  -connect example.com:443 \
  -servername example.com \
  -showcerts < /dev/null
```

- `-connect`：连接主机和端口。
- `-servername`：设置 TLS SNI，告诉服务器要访问哪个域名。
- `-showcerts`：显示服务器发送的证书链。
- `< /dev/null`：不给命令继续提供交互输入。

这主要用于观察，不是完整的网站安全验证。openssl 与 curl 可能使用不同 TLS 后端或信任库，所以二者的验证表现可能不同。

### 20.5 推荐排查顺序

1. 先用带超时的 `curl -v` 看原始错误。
2. 解析失败：检查域名拼写、DNS 和代理。
3. 连接失败：检查端口、服务状态、网络或代理配置。
4. TLS 失败：检查时间、域名、证书与信任配置。
5. 已收到 HTTP 响应：按状态码检查方法、路径、认证与参数。
6. HTTP 200 但业务不对：检查响应体、业务错误字段和预期结果。

<a id="chapter-21"></a>

## 21. 从浏览器复制 curl 命令

如果网页里某个操作成功，而你不知道对应请求怎么写，可以借助浏览器开发者工具。

以 Chrome 或 Edge 为例：

1. 打开有权限访问的页面。
2. 按 `Command + Option + I` 打开开发者工具。
3. 进入 **Network / 网络** 面板。
4. 在网页中完成目标操作，让请求出现在列表里。
5. 选择相关请求，右键选择 **Copy → Copy as cURL**。如果有平台选项，在 macOS 选 Bash 风格。
6. 先阅读复制的命令，确认目标域名、方法和请求数据，再决定是否执行。

注意三点：

- 复制结果可能包含登录 Cookie、Authorization 和个人信息，不要直接发给他人或贴到公共平台。
- POST、DELETE 等请求再次执行，可能重复创建或删除数据。
- 某些字段或签名会过期，所以刚复制能用，不代表以后永久可用。

跨域 CORS 主要是浏览器的限制机制，curl 通常不受浏览器 CORS 限制。因而 curl 成功，并不能证明网页中的跨域请求也会成功。

<a id="chapter-22"></a>

## 22. 写一个能判断结果的简单脚本

前面的命令一次执行一条。这一节把“请求、保存、检查”组合起来。

将下面内容保存为 `check-api.sh`，放在练习目录中。它会读取公开测试接口，在**新的临时目录**中保存响应，并检查 HTTP 状态码与响应字段。脚本标注为 Bash，所以后面明确使用 `bash` 运行，不依赖当前交互 Shell。

```bash
#!/bin/bash

set -u
set -o pipefail

if ! command -v jq > /dev/null 2>&1; then
  printf '%s\n' '缺少 jq，无法执行 JSON 检查。' >&2
  exit 1
fi

result_dir=$(mktemp -d "${TMPDIR:-/tmp}/curl-learning.XXXXXX") || exit 1
body_file="$result_dir/body.json"
headers_file="$result_dir/headers.txt"

http_code=$(curl -sS --fail-with-body \
  --connect-timeout 10 \
  --max-time 30 \
  -D "$headers_file" \
  -o "$body_file" \
  -w '%{http_code}' \
  'https://httpbin.org/get?course=curl')
curl_code=$?

printf '结果目录：%s\n' "$result_dir"
printf 'curl 退出码：%s\nHTTP 状态码：%s\n' "$curl_code" "$http_code"

if [ "$curl_code" -ne 0 ]; then
  printf '%s\n' '请求失败；请结合错误、响应头和响应体排查。' >&2
  exit "$curl_code"
fi

case "$http_code" in
  2??) ;;
  *)
    printf '%s\n' '没有取得预期的 2xx 响应。' >&2
    exit 1
    ;;
esac

if ! jq -e '.args.course == "curl"' "$body_file" > /dev/null; then
  printf '%s\n' '响应不是预期的练习数据，或不是有效 JSON。' >&2
  exit 1
fi

printf '%s\n' '检查通过：收到 2xx，且响应中的 course 字段符合预期。'
jq . "$body_file"
```

运行方式：

```sh
bash check-api.sh
```

这里不需要先 `chmod +x`。另一种执行方式是先 `chmod +x check-api.sh` 再 `./check-api.sh`，前者为文件增加可执行权限。

几个新增语法：

- `$(命令)`：捕获命令的标准输出。
- `>&2`：把提示输出到标准错误。
- `[ "$curl_code" -ne 0 ]`：判断数字是否不等于 0。
- `if ...; then ... fi`：条件判断。
- `case`：按模式匹配，这里 `2??` 匹配三位的 2xx 状态码。
- `exit`：结束脚本，并设置退出码。
- `mktemp -d`：创建独一无二的临时目录，避免覆盖现有文件。
- `set -u`：使用未设置变量时报告错误。
- `set -o pipefail`：让管道中前面的失败有机会反映到整条管道的退出状态。

脚本保留临时文件方便排查。真实项目中，应把业务判断换成真实接口的约定，而不是只检查 HTTP 200。

### 为什么管道需要注意退出状态？

```sh
curl -sS --fail-with-body 'https://httpbin.org/get' | jq .
```

在常见 Shell 的默认设置下，管道退出状态主要由最后一个命令决定。curl 失败时，后面的命令未必能完整反映这个失败。

脚本中可以启用 `pipefail`，或者像上面的完整例子一样，先捕获 curl 的状态、再处理保存的响应。`pipefail` 不会自动停止所有后续操作，也不自动判断业务成功。

<a id="chapter-23"></a>

## 23. 高级但有用：流式输出、多个下载与配置文件

### 23.1 流式接口：`-N`

模板：

```sh
curl -N -sS --max-time 60 \
  -H 'Accept: text/event-stream' \
  'https://api.example.invalid/events'
```

`-N` / `--no-buffer` 关闭 curl 的输出缓冲，常用于服务端持续推送数据的接口。它不会强迫服务器立即发送数据，也不能保证代理不缓冲。

设置 60 秒超时意味着到时会主动结束，可能返回退出码 28；想持续接收时需按实际需求调整。

### 23.2 同时下载两个文件

模板：

```sh
curl --parallel --parallel-max 2 --fail --location --no-clobber \
  -o file-a.zip 'https://download.example.invalid/file-a.zip' \
  -o file-b.zip 'https://download.example.invalid/file-b.zip'
```

`--parallel` 开启并行传输，`--parallel-max 2` 限制并行数量。不要对不允许高频访问的服务随意提高并发。

多 URL 请求的选项作用范围与退出状态比单请求复杂，不要只看一个最终退出码就认定所有文件都成功。初学时先使用单 URL 命令。

### 23.3 显式配置文件：`-K`

创建一个文本文件 `request.conf`，内容如下：

```text
url = "https://example.com"
location
silent
show-error
fail-with-body
connect-timeout = 10
max-time = 30
```

运行：

```sh
curl -K request.conf
```

这可以减少重复输入，但配置文件不是 Shell 脚本，不要假定里面的 `$变量` 会自动展开。

curl 还会尝试读取默认配置，例如 `~/.curlrc`。本教程不需要修改它。如果排查“同一命令在不同电脑行为不同”，可以让 `-q` 成为 curl 后的**第一个选项**，跳过默认配置：

```sh
curl -q -sS --max-time 30 'https://example.com'
```

`-q` 不等于清除代理环境变量；两类配置要分别排查。

<a id="chapter-24"></a>

## 24. 从零练习：按顺序完成 8 个小任务

练习网站可能暂时不可达。如果失败，先保留报错，不要连续重复所有写操作。

### 任务 1：确认环境

运行 `curl --version` 和 `pwd`。目标：知道自己使用哪个版本，以及文件会保存到哪里。

### 任务 2：取一个网页

```sh
curl -sS --connect-timeout 10 --max-time 30 'https://example.com'
```

目标：认识 HTML 正文，不把源码显示误认为乱码或失败。

### 任务 3：查看状态与响应头

```sh
curl -I --max-time 30 'https://example.com'
```

目标：找出 HTTP 状态码和 `Content-Type`。理解这次发的是 HEAD。

### 任务 4：下载成文件

```sh
curl -fL --max-time 30 --no-clobber \
  -o practice-page.html 'https://example.com'
```

目标：用 `ls -lh` 和 `file` 检查结果；如果保存为带后缀文件，使用实际名字。

### 任务 5：发送中文查询参数

```sh
curl -sS --max-time 30 -G \
  --data-urlencode 'topic=学习 curl' \
  'https://httpbin.org/get' | jq '.args'
```

目标：看到 `topic` 字段，理解 URL 编码并不意味着原文丢失。

### 任务 6：提交 JSON

```sh
curl -sS --max-time 30 \
  --json '{"name":"Alice","lesson":1}' \
  'https://httpbin.org/post' | jq '.json'
```

目标：看到服务器回显的 JSON 对象。

### 任务 7：观察 HTTP 错误与退出码

```sh
curl -sS --max-time 30 --fail-with-body \
  'https://httpbin.org/status/404'
echo $?
```

目标：在正常连通且服务按预期响应时看到退出码 22，而不是把 HTTP 404 与 curl 退出码混在一起。

### 任务 8：独立读懂一条组合命令

```sh
curl -sS --fail-with-body \
  --connect-timeout 10 --max-time 30 \
  -G --data-urlencode 'q=curl tutorial' \
  -H 'Accept: application/json' \
  'https://httpbin.org/get' | jq -r '.args.q'
```

试着解释每个选项。预期最终输出 `curl tutorial`。如果能说明为什么用 `-G`、为什么 URL 要加引号、为什么用 `jq -r`，就已经掌握基础调用方式。

<a id="chapter-25"></a>

## 25. 速查：先记住这些就够用

### 最常见的选项

- `-L`：跟随 HTTP 跳转。
- `-o 文件`：指定本地输出文件。
- `-O`：按 URL 中的名字保存。
- `--no-clobber`：防止下载覆盖已有文件，可能改用带数字后缀的名字。
- `-i`：正文前附带响应头。
- `-I`：发送 HEAD 请求。
- `-D 文件`：单独保存响应头。
- `-sS`：隐藏进度，保留错误。
- `-f`：HTTP 错误时返回失败，不输出错误响应体。
- `--fail-with-body`：HTTP 错误时返回失败，保留响应体。
- `-G`：把数据作为 GET 查询参数。
- `--data-urlencode`：对提交字段进行 URL 编码。
- `-d`：提交数据，默认通常是 POST 表单。
- `--json`：发送 JSON，并设置相关头。
- `--data-binary`：原样发送字节数据。
- `-H`：添加请求头。
- `-X`：显式指定方法。
- `-F`：多段表单，常用于上传文件。
- `-T`：直接上传文件；对 HTTP 通常为 PUT。
- `-u`：用户名和密码认证。
- `-b`：发送或读取 Cookie。
- `-c`：保存 Cookie。
- `--connect-timeout`：连接阶段超时。
- `--max-time` / `-m`：一次传输的总超时。
- `--retry`：对符合条件的错误重试。
- `-v`：查看详细过程。
- `-w`：输出状态码、耗时等指标。
- `-x`：指定代理。
- `--cacert`：指定 CA 证书文件。
- `-N`：关闭输出缓冲。
- `--compressed`：请求压缩响应，并自动解压支持的编码。

### 容易混淆的几组

- **`-i` 与 `-I`**：前者显示头和体；后者改变为 HEAD 请求。
- **`-o` 与 `-O`**：前者自己命名；后者取 URL 中的名字。
- **`-v` 与 `-V`**：前者调试；后者显示版本。
- **`-d` 与 `-F`**：前者常见于普通表单；后者用于 multipart 表单。
- **`-G` 与 `-X GET`**：只有指定方法，不会自动把请求体转换成查询参数。
- **`Content-Type` 与 `Accept`**：前者说明发出的格式；后者表达期望收到的格式。
- **HTTP 状态码与退出码**：一个来自 HTTP 响应，一个来自 curl 程序运行结果。
- **请求成功与业务成功**：网络完成、HTTP 200、业务结果正确是不同层面的判断。

<a id="chapter-26"></a>

## 26. 新手常见错误与对应处理

### `zsh: no matches found`

常见原因是 URL 中的 `?` 或方括号未被引号保护。先给完整 URL 加单引号。

如果 URL 本身含有需按字面传递的 `{}` 或 `[]`，引号只能阻止 Shell 展开；还可能需要 curl 的 `--globoff` / `-g` 来关闭 curl 自己的 URL 展开。

### `Could not resolve host`

先检查域名是否拼错、URL 是否被空格拆开、是否正在使用本文 `.invalid` 模板，以及 DNS 和代理是否正常。

### `Failed to connect` 或 `Connection refused`

主机可能已解析成功，但端口没有服务、地址或端口错误，或代理没有运行。不要直接把所有情况归结为“没有网络”。

### 下载到的不是 ZIP，而是一段 HTML

常见原因是下载地址返回了登录页、错误页、跳转页，或请求缺少权限。检查状态码、`Content-Type`、最终 URL 和文件类型。

### `jq: parse error`

可能响应并不是 JSON，或者把响应头、调试日志混进了正文。先单独保存响应体查看，不要只盯着 jq 语法。

### 401 / 403

检查认证方式、凭证有效期、账号权限和接口策略。换 User-Agent 或关闭证书验证并不能合理解决权限问题。

### 400 / 415 / 422

检查 JSON 是否有效、字段名和类型是否正确、`Content-Type` 是否匹配接口要求，以及是否把表单误当成 JSON。

### 一直等待，或者没有可见输出

有可能是连接慢、服务端慢、返回空正文、开启了静默，或访问的是持续输出的接口。加上合理超时，并用 `-v` 查看阶段；必要时按 `Control + C`。

### 证书错误后加 `-k` 就好了

这只说明跳过验证改变了结果，不说明证书问题被修复。按第 18 节检查信任链、域名和环境。

### 命令里出现 `curl ... | sh` 或 `curl ... | bash`

这会把下载的内容直接作为程序执行，影响可能远超下载文件。初学时不要照抄不明来源的一键安装命令；应先确认来源、下载查看，再按发布方可信说明决定是否运行。

<a id="chapter-27"></a>

## 27. 查帮助与继续学习

本机帮助通常最匹配当前版本：

```sh
curl --help
curl --help all
curl --help http
curl --manual
man curl
```

`man curl` 中可以输入 `/关键词` 搜索，按 `n` 找下一个，按 `q` 退出。

官方资料：

- [curl 官方首页](https://curl.se/)
- [curl 命令行手册](https://curl.se/docs/manpage.html)
- [Everything curl：官方完整学习书](https://everything.curl.dev/)
- [curl 退出码说明](https://ec.haxx.se/cmdline/exitcode.html)
- [httpbin 练习接口与说明](https://httpbin.org/)
- [jq 官方手册](https://jqlang.org/manual/)

在线手册可能描述比本机更新的版本。遇到 `unknown option` 时，先用 `curl --version` 和 `curl --help all` 核对，不要认定是自己复制错了。

<a id="chapter-28"></a>

## 28. 本文的核验范围

本文根据本机 curl 8.7.1 的选项帮助与手册核对常用参数。公开接口的响应随时间和网络环境变化，示例输出不是对未来结果的保证。

具体执行过哪些检查、哪些场景未验证，见文件末尾的核验记录。涉及真实认证、代理、断点续传、双向 TLS 或业务写操作的模板，需要在你自己的授权测试环境中验证，不能因本文列出命令就认为已经完成真实功能测试。

### 核验记录（2026 年 11 月 13 日）

已运行并通过：

- 检查本机 curl 版本、功能列表及配套工具位置，核对关键参数的本机手册说明。
- 检查 Markdown 代码围栏是否完整闭合，验证标为 JSON 的有效示例。
- 对全文 **110 个 Shell 代码块**做语法检查：`sh` 标记的片段使用本机 Bash 与 zsh 检查，完整 Bash 脚本使用 Bash 检查。**语法通过不代表其中每条命令都完成了真实请求测试。**
- 对 `https://example.com` 实测 HTTPS 读取、HEAD 响应头和下载，下载结果包含预期的 Example Domain 页面文字。
- 对 httpbin 实测带中文参数的 GET 请求，响应中正确回显 `curl 入门`。
- 对 httpbin 的 404 端点实测 `--fail-with-body`，确认 HTTP 状态码为 404、curl 退出码为 22。
- 实际运行第 22 节完整检查脚本，确认取得 HTTP 200，且 JSON 中 `args.course` 等于 `curl`，脚本正常结束。

未运行：

- POST、PUT、PATCH、DELETE、文件上传、认证、Cookie 会话和流式接口的真实请求测试。
- 代理、指定 DNS 解析、IPv6、客户端证书、断点续传、并行下载及大文件限速等场景的功能测试。
- dig、nc、ping、openssl 等全部配套命令的逐条网络测试。

这些未运行的内容是学习示例或需按环境调整的模板，不应理解为已经验证了你实际服务的兼容性。本次检查没有使用真实账号或令牌，没有修改系统代理、curl 默认配置或启动项目服务。

