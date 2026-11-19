---
title: Ghostty与zsh终端操作手册
published: 2025-11-19
description: 初学shell命令
image: ''
tags: ['cli','zsh','shell','Ghostty']
category: Note
draft: false 
lang: ''
---

# Mac 终端操作手册：以 Ghostty + zsh 为例

> 适用设备：我的Mac。 
> 已核对：Ghostty 1.4.0、zsh 5.9、Starship Catppuccin Powerline、Maple Mono NF CN 字体，以及本机实际配置。  
> 本文介绍的是我当前配置下的操作，不是所有软件的出厂默认设置。

## 阅读标记

- **【通用 Shell】**：命令和基本概念通常适用于其他终端；具体快捷键仍取决于 Shell 和按键设置。
- **【zsh／你的配置】**：适用于你这台 Mac 上的 zsh，Ghostty 和 VS Code 的本地 zsh 终端共用。
- **【Ghostty 专属】**：Ghostty 窗口、分屏、搜索、外观等功能；不会自动同步到 VS Code。
- **【macOS】**：Finder、剪贴板、打开应用等 Mac 系统功能。
- **【注意影响】**：涉及覆盖、删除、结束进程、安装或远程操作，执行前先确认对象。

键盘符号：`⌘` 是 Command，`⌥` 是 Option，`⌃` 是 Control，`⇧` 是 Shift。`+` 表示同时按下，不是输入加号。

除特别说明外，代码块内容都是在终端提示符后输入。不要把 Markdown 的三个反引号、章节标题或示例输出一起粘贴执行。按 Enter 执行前，先看清整行命令。

## 目录

1. 先分清 Ghostty、zsh、Starship
2. 最常用的操作速查
3. Ghostty 窗口、标签页与分屏
4. Ghostty 全局下拉终端
5. 输入命令、光标移动与编辑
6. Tab 与 Shift + Tab 补全
7. 路径、目录与文件地址
8. 在安全练习目录里操作文件
9. 查看、编辑和搜索文件
10. 引号、空格、通配符和变量
11. 管道、重定向与组合命令
12. 历史记录与重复执行
13. 运行程序、脚本和开发工具
14. 中断、后台任务与进程
15. 权限和 sudo
16. 网络、SSH 与远程终端
17. Homebrew 与 Git 入门
18. 配置文件、生效方式和恢复
19. 常见故障排查
20. 一次完整练习
21. 验证范围与参考资料

---

## 1. 先分清 Ghostty、zsh、Starship

你当前的使用关系是：**Ghostty 显示终端窗口 → zsh 解释命令 → 程序执行工作**。Starship 为 zsh 绘制彩色提示符，字体负责显示字符和图标。

- **Ghostty**：终端模拟器，负责窗口、标签、分屏、字体、透明背景、复制粘贴、滚动和按键传递。
- **zsh**：Shell，负责理解 `cd`、变量、管道、补全、重定向等语法，并启动程序。
- **Starship**：提示符工具，显示彩色箭头、目录、Git 分支、时间等信息，不会把 zsh 替换掉。
- **Maple Mono NF CN**：你安装的字体，带有终端主题需要的图标。
- **VS Code 内置终端**：另一个终端界面，也可以运行 zsh 和 Starship，但不使用 Ghostty 的窗口设置。

因此，VS Code 终端标签显示 `zsh` 是正常的；彩色箭头路径栏不是可以点击输入地址的文件管理器地址栏。

**【zsh／你的配置】** 当前 Starship 路径最多展示部分目录层级，某些目录名还会替换成图标。要确认真实、完整的工作目录，输入：

```zsh
pwd
```

**提示符出现**通常表示 Shell 正在等你输入。程序运行中没有提示符时，输入往往交给那个程序，而不是 zsh。例如，在 Python 解释器中输入 `cd`，并不会执行 Shell 的切换目录命令。

## 2. 最常用的操作速查

### 常用 Shell 命令

- `pwd`：显示当前目录。
- `ls`：列出当前目录内容。
- `ls -lah`：包含隐藏文件、权限和便于阅读的大小。
- `cd 目录`：进入目录。
- `cd ..`：返回上一级目录。
- `cd`：回到用户主目录。
- `cd -`：切换回上一次所在目录。
- `open .`：在 Finder 打开当前目录，属于 **【macOS】** 功能。
- `clear` 或 `Ctrl + L`：清理当前显示；不是删除文件或清除历史记录。
- `exit`：退出当前 Shell；如果通过 SSH 连接远程，通常是退出远程会话。

### 最常用的键

- **【zsh／你的配置】** Tab：下一个补全项；Shift + Tab：上一个补全项。
- **【通用 Shell】** Ctrl + C：请求中断前台程序，或取消当前输入。
- **【通用 Shell】** Ctrl + Q：如果误按 Ctrl + S 导致终端输出暂停，可尝试恢复输出。
- **【Ghostty 专属】** `⌘ + C`：复制选中文字；`⌘ + V`：粘贴。
- **【Ghostty 专属】** `⌘ + T`：新建标签页。
- **【Ghostty 专属】** `⌘ + D`：左右分屏；`⌘ + Shift + D`：上下分屏。

**注意：`⌘ + C` 与 `Ctrl + C` 不同。一个用于复制，一个用于中断。**

## 3. Ghostty 窗口、标签页与分屏

本节全部属于 **【Ghostty 专属】**，按键来自你当前的有效配置。

### 3.1 窗口与标签页

- `⌘ + N`：新建窗口。
- `⌘ + T`：新建标签页。
- `⌘ + Shift + ←`：上一个标签页，属于你的自定义绑定。
- `⌘ + Shift + →`：下一个标签页，属于你的自定义绑定。
- `Ctrl + Tab`：下一个标签页。
- `Ctrl + Shift + Tab`：上一个标签页。
- `⌘ + 1` 至 `⌘ + 8`：切换到对应序号的标签页。
- `⌘ + 9`：切换到最后一个标签页，不一定是第九个。
- `⌘ + W`：关闭当前终端区域；如果标签页只有一个终端区域，通常也会关闭这个标签页。
- `⌘ + Shift + W`：关闭当前窗口。
- `⌘ + Q`：退出 Ghostty 应用。

**【注意影响】** 关闭终端区域、窗口或退出应用，可能中断其中运行的任务。不能把“关闭窗口”当成“任务仍在后台运行”。

### 3.2 分屏

- `⌘ + D`：在当前区域右侧新建分屏，形成左右布局。
- `⌘ + Shift + D`：在当前区域下方新建分屏，形成上下布局。
- `⌘ + Option + ← / → / ↑ / ↓`：切换到对应方向的分屏。
- `⌘ + Control + 方向键`：调整当前分屏尺寸。
- `⌘ + Shift + E`：均衡各分屏大小，属于你的自定义绑定。
- `⌘ + Shift + F`：放大当前分屏，再按一次恢复，属于你的自定义绑定。
- `⌘ + W`：关闭当前分屏。

一个实用布局：左边编辑文件，右边运行程序，下方查看日志。每个分屏是独立的 Shell 会话：在左边执行 `cd` 或设置变量，不会自动改变右边的目录或变量。

### 3.3 搜索、滚动与字号

- `⌘ + F`：搜索当前终端的输出。
- 搜索时 `⌘ + G`：下一个匹配；`⌘ + Shift + G`：上一个匹配。
- 搜索时 Esc：退出 Ghostty 搜索。
- 鼠标滚轮或触控板双指滚动：查看先前输出。
- `⌘ + ↑ / ↓`：跳到前一个／后一个命令提示位置，依赖 Shell 集成与已有命令记录。
- `⌘ + +`：增大字号；`⌘ + -`：减小字号；`⌘ + 0`：恢复配置中的字号。某些键盘输入 `+` 本身需要 Shift。
- `⌘ + K`：触发 Ghostty 清屏动作；它不等于删除 Shell 历史文件，也不是可靠的敏感信息擦除方法。
- `⌘ + Shift + P`：打开 Ghostty 命令面板，用文字查找操作。

**Ghostty 搜索只搜索终端输出缓冲区，不是在磁盘中查找文件内容。** 搜索项目代码请使用后文的 `rg` 等命令。

### 3.4 你的外观与复制设置

当前是 Catppuccin Mocha 深色配色、14 号字体、85% 不透明度和背景模糊。

你开启了 **选中文字自动复制到系统剪贴板**。在 Ghostty 中拖动选择文字，会更新剪贴板。复制重要内容后，不要随手选择别的文字再粘贴。

## 4. Ghostty 全局下拉终端

**【Ghostty 专属／你的自定义】** 按 **Control + 反引号键（`）**，切换顶部下拉终端的显示状态。

常见美式键盘的反引号键位于数字 `1` 左边；不要按成单引号 `'`，也不需要额外按 Shift。

生效条件：

1. Ghostty 已启动，并仍在后台运行。
2. macOS 的“系统设置 → 隐私与安全性 → 辅助功能”中，已允许 Ghostty。
3. 快捷键配置已加载，且没有被其他软件或系统功能拦截。

**它不能启动已经退出的 Ghostty。** 先打开应用，再切到桌面测试。可以用 macOS 的 `⌘ + H` 隐藏 Ghostty；用 `⌘ + Q` 退出后，它就不能监听这个快捷键。

你的下拉终端会出现在鼠标所在屏幕的顶部，并在失去焦点时自动隐藏。切换到其他应用后消失，是当前设置的正常行为。

如果希望开机后就能用，需要另行设置 Ghostty 登录时启动；本手册没有替你修改登录项。

## 5. 输入命令、光标移动与编辑

### 5.1 命令的结构

例如：

```zsh
ls -lah ~/Documents
```

- `ls` 是命令。
- `-lah` 是选项组合，改变命令行为。
- `~/Documents` 是参数，指定操作哪个目录。

命令通常区分大小写。命令、选项与参数之间需要空格。程序成功完成时可能没有任何输出，不能仅凭“没显示文字”判断卡住。

### 5.2 你当前 zsh 的编辑键

以下是 **【zsh／你的配置】**，已核对本机的 Emacs 风格按键绑定：

- `Ctrl + A`：移动到整行开头。
- `Ctrl + E`：移动到整行结尾。
- `Ctrl + U`：清空整条输入行。**你当前绑定是 `kill-whole-line`，不是只删除光标前的部分。**
- `Ctrl + K`：删除光标到行尾的内容。
- `Ctrl + W`：删除光标前的一个“词”；词的边界由 zsh 规则决定，不保证正好是一级目录。
- `Ctrl + Y`：插回 Shell 编辑器最近剪掉的内容；不是粘贴 macOS 系统剪贴板。
- `Ctrl + L`：清理显示并重绘当前输入。
- `↑ / ↓`：浏览历史命令；多行输入或菜单中行为可能不同。
- `Ctrl + R`：向后搜索历史记录。

**【Ghostty 专属】** 你当前还可以用 `⌘ + ← / →` 移动到行首／行尾，用 `Option + ← / →` 按词移动。其他终端不一定映射成相同按键序列。

### 5.3 Ctrl + D 与连续输入提示

- 在空的 Shell 提示行按 `Ctrl + D`，通常会结束当前 Shell。
- 在行中有文字时，它通常执行删除字符或列出补全，不等于退出应用。
- 某些正在读取标准输入的程序会将 Ctrl + D 视为输入结束；具体行为取决于程序。

如果出现 `quote>`、`dquote>` 等提示，通常是引号未闭合，Shell 在等待你补完。可以补上缺失的引号，也可以按 Ctrl + C 取消这条尚未执行的输入。

## 6. Tab 与 Shift + Tab 补全

**【zsh／你的自定义】** 你启用了 `compinit` 和菜单补全，设置存放在 `/Users/dsy/.zshrc`。Ghostty 与 VS Code 的本地 zsh 共用此设置。

当前行为：

1. 输入命令和文件名的一部分。
2. Tab 选择下一个候选项。
3. Shift + Tab 选择上一个候选项。
4. 多候选菜单处于选择状态时，第一次 Enter 确认所选项。
5. 检查整条命令，再按 Enter 执行。

只有一个候选、没有进入菜单选择状态时，Enter 可能直接执行命令，不能机械地认为任何时候都需要两次 Enter。

例如，目录中有 `alpha-one`、`alpha-three`、`alpha-two`：

```zsh
cd alpha-
```

在末尾按 Tab，继续按 Tab 可以前进，按 Shift + Tab 可以后退，首尾之间可以循环。

目录候选末尾的 `/` 是目录标记，属于正常补全结果。你当前的设置已验证能在带 `/` 的候选之间反向选择。

**退出／取消补全：优先用 Ctrl + C 取消这条输入。** 不要把 Esc 当成所有补全场景都可靠的退出键：本机补全菜单未单独绑定 Esc，且它还可能作为按键序列的前缀。前面聊天中“Esc 一定能退出补全菜单”的说法过于笼统；本手册以实际核对结果为准。

如果 Shift + Tab 在某个程序中不生效，先确定你是否真的处于 zsh 提示行。在 Python、Vim、交互式工具或远程机器中，按键由相应程序或远程 Shell 处理。

## 7. 路径、目录与文件地址

### 7.1 绝对路径和相对路径

- `/Users/dsy/Desktop`：绝对路径，从 `/` 开始。
- `notes.txt`：当前目录下的文件。
- `./notes.txt`：明确表示当前目录下的文件。
- `../notes.txt`：上一级目录下的文件。
- `.`：当前目录。
- `..`：上一级目录。
- `~`：你的用户主目录，即 `/Users/dsy`。

```zsh
pwd
cd ~/Desktop
ls -lah
cd ..
cd -
cd
```

`cd` 只改变当前 Shell 的工作目录。它不会移动文件。

### 7.2 复制文件地址

**【macOS】** Finder 中选中文件或文件夹，按 `⌘ + Option + C` 复制完整路径。普通 `⌘ + C` 复制的是文件对象，不是相同的路径文字操作。

如果路径带空格，作为命令参数时要加引号。操作方法：先输入 `cd "`，粘贴路径，再补上结尾的 `"`。只有目标是目录，才能用 `cd` 进入。

也可以把 Finder 中的项目拖入终端输入区。Ghostty 通常会填入经过转义的路径；执行前仍要查看内容。VS Code 中拖到终端输入区与拖到编辑区，效果可能不同。

### 7.3 在 Finder 与终端之间切换

```zsh
open .
open ~/Desktop
pwd | pbcopy
```

- `open .`：用 Finder 打开当前目录。
- `pwd | pbcopy`：把当前目录路径复制为文字到系统剪贴板，通常带一个换行。
- `pbpaste`：把系统剪贴板中的文字输出到终端。

这些都是 **【macOS】** 命令，不是 Ghostty 的独有功能。不要在录屏或共享终端时随意运行 `pbpaste`，剪贴板可能包含不希望展示的内容。

## 8. 在安全练习目录里操作文件

### 8.1 创建独立练习目录

以下命令会在桌面创建一个带随机后缀的新目录，并进入它，不会覆盖已有练习目录：

```zsh
practice_dir=$(mktemp -d "$HOME/Desktop/shell-practice.XXXXXX")
cd "$practice_dir"
pwd
```

`practice_dir` 只是当前 Shell 的变量。新建分屏或标签后，这个变量不会自动带过去；可以从 Finder 复制练习目录路径重新进入。

后面的文件操作示例，除另有说明外，都假设你已经进入这个练习目录。各节是独立演示，不要求从头到尾连续执行；如果某个示例改变了目录，可以用 `cd "$practice_dir"` 回到练习目录。第 20 节提供了可按顺序操作的完整练习。

### 8.2 创建文件和目录

```zsh
mkdir notes
mkdir -p projects/demo/src
touch notes/empty.txt
printf 'hello\nworld\n' > notes/sample.txt
ls -lah notes
```

- `mkdir`：创建目录。
- `mkdir -p`：必要时一并创建上层目录。
- `touch`：文件不存在时创建空文件，存在时通常更新修改时间，不是清空内容。
- `printf`：输出文字；这里的 `>` 将文字写入文件。

**【注意影响】** `>` 会创建文件，或覆盖并清空已有文件的原内容。上面的 `notes/sample.txt` 应当是新练习目录中的文件。

### 8.3 复制、移动和改名

```zsh
cp -i notes/sample.txt notes/sample-copy.txt
mv -i notes/sample-copy.txt notes/renamed.txt
cp -R notes notes-backup
```

- `cp`：复制文件。
- `cp -R`：递归复制目录；如果目标已存在，目录层级和合并行为需要额外确认。
- `mv`：移动文件，也用于改名。
- `-i`：遇到可能覆盖的目标时询问；它不能防止所有误操作。

移动和复制前，先运行 `pwd` 与 `ls` 确认位置。尤其注意命令参数的顺序是 **来源 → 目标**。

### 8.4 删除

```zsh
rm -i notes/empty.txt
mkdir empty-directory
rmdir empty-directory
```

**【注意影响】** `rm` 通常不会把文件放进废纸篓，也没有通用撤销按钮。`rmdir` 只删除空目录。

对于不确定的文件，优先使用 Finder 移到废纸篓。初学时不要对不熟悉的路径使用强制递归删除，更不要搭配 `sudo` 尝试“解决权限问题”。

## 9. 查看、编辑和搜索文件

### 9.1 查看文本

在上面的练习目录中：

```zsh
cat notes/sample.txt
head -n 10 notes/sample.txt
tail -n 10 notes/sample.txt
wc -l notes/sample.txt
less notes/sample.txt
```

- `cat`：一次输出全部内容，适合短文本。
- `head` / `tail`：查看开头／结尾若干行。
- `wc -l`：统计换行数量，通常用于估计文本行数。
- `less`：分页查看；按空格向下翻页，`b` 向上翻页，`/关键词` 搜索，`n` 下一个匹配，`q` 退出。

不要用 `cat` 直接查看大型二进制文件，输出可能不可读。可以先用：

```zsh
file notes/sample.txt
```

持续观察日志：

```zsh
tail -f notes/sample.txt
```

这条命令会持续等待新增内容，不自动返回提示符。按 Ctrl + C 停止观察。

### 9.2 编辑文本

```zsh
nano notes/sample.txt
```

在 nano 中按底部提示操作：通常 `Ctrl + O` 保存、Enter 确认文件名、`Ctrl + X` 退出。这里的快捷键属于 nano，不是 Ghostty 或 zsh。

**【macOS】** 可以使用 TextEdit：

```zsh
open -a TextEdit notes/sample.txt
```

编辑配置文件时应保持纯文本格式。

如果 `code` 命令已经安装并在 PATH 中，可以使用 `code .` 打开当前项目。本机此前检查时未发现 `code` 命令，因此不能假定它已经可用；可以从 VS Code 命令面板执行安装 `code` 到 PATH 的操作，或使用 VS Code 的“打开文件夹”。

### 9.3 按名称查找文件

```zsh
find . -type f -name '*.txt'
find . -type d -name 'notes'
```

`find` 后面的 `.` 表示只从当前目录向下查找。`'*.txt'` 加了引号，让通配模式由 `find` 处理，而不是先被 Shell 展开。

### 9.4 按内容搜索

```zsh
grep -n 'hello' notes/sample.txt
```

`-n` 显示行号。如果安装了 ripgrep，常用：

```zsh
rg -n 'hello' .
rg --files -g '*.txt'
```

`rg` 默认会跳过一些隐藏或被忽略的文件；“没有搜索结果”不一定代表所有文件都不含该内容。可以先用 `command -v rg` 检查是否可用。

## 10. 引号、空格、通配符和变量

### 10.1 含空格的路径

下面示例在练习目录中创建含空格的文件：

```zsh
touch "my notes.txt"
ls -l "my notes.txt"
```

不加引号的 `my notes.txt` 会被解析为两个参数。中文路径通常不需要特殊处理，但带空格或特殊符号时仍应加引号。

### 10.2 单引号和双引号

```zsh
printf '%s\n' '$HOME'
printf '%s\n' "$HOME"
```

第一条输出字面文字 `$HOME`；第二条展开为你的主目录。

- 单引号：大多数内容按原样处理。
- 双引号：保留为一个参数，但仍会展开 `$变量`、`$(命令)` 等。
- `~` 放进引号后通常不再按主目录展开。需要引用时写 `"$HOME/目录名"`，不要写 `"~/目录名"`。

### 10.3 通配符

- `*`：匹配任意数量字符。
- `?`：匹配一个字符。
- `[abc]`：匹配括号中的一个字符。

```zsh
ls notes/*.txt
```

如果没有匹配项，你的 zsh 可能报告 `no matches found`。这通常不是命令程序出错，而是 Shell 在启动程序前未找到匹配项。

如果你要向程序传递字面模式，应加引号。含 `?`、`&` 等字符的网址也建议整体引用：

```zsh
curl -I 'https://example.com/?page=1&sort=name'
```

上面是网络请求示例，不是本手册验证过的实际访问结果。

### 10.4 变量和环境变量

```zsh
greeting='hello'
printf '%s\n' "$greeting"
export DEMO_MODE='practice'
```

普通变量由当前 Shell 保存；`export` 后，之后启动的子进程可以继承它。已经运行的其他分屏、其他应用或父进程，不会因此同步改变。

`$(...)` 表示执行里面的命令并取其输出，例如前面的 `practice_dir=$(mktemp ...)`。不要运行来源不明的命令替换，也不要把令牌、密码随手写进会留下历史记录的命令。

## 11. 管道、重定向与组合命令

### 11.1 标准输入、标准输出和错误输出

程序通常有三个通道：标准输入用于读数据，标准输出用于输出正常结果，标准错误用于诊断信息。

管道 `|` 将前一个命令的标准输出交给后一个命令：

```zsh
printf 'apple\nbanana\napple\n' | sort | uniq
```

它会排序并去除相邻重复项。这里是先排序再去重，单独 `uniq` 不会自动找出所有不相邻的重复行。

### 11.2 输出到文件

在练习目录中：

```zsh
printf 'first line\n' > result.txt
printf 'second line\n' >> result.txt
cat result.txt
```

- `>`：覆盖写入，**会清空目标文件原有内容**。
- `>>`：追加到文件结尾。
- `<`：从文件读取标准输入。
- `2>`：把错误输出写到文件，也会覆盖已有目标。
- `2>&1`：把错误输出接到“此时标准输出所指向的位置”。

例如，以下模板把一个程序的正常输出和错误输出都写到 `run.log`：

```zsh
./your-program > run.log 2>&1
```

`./your-program` 是示意名称，必须替换为你的实际程序。重定向顺序有意义；不要认为交换顺序后效果一定相同。

### 11.3 条件执行

```zsh
mkdir demo-new && cd demo-new
```

`&&`：前一个命令成功才执行后一个。因此目录创建失败时，不会继续 `cd`。

```zsh
test -f missing.txt || printf '没有找到文件\n'
```

`||`：前一个命令失败才执行后一个。分号 `;` 则通常不关心前一个是否成功，继续执行下一条。

### 11.4 退出状态

```zsh
test -f missing.txt
printf '%s\n' "$?"
```

`$?` 是上一条命令的退出状态：一般 `0` 表示成功，非零表示失败或其他特殊状态。要紧接着读取，否则它会被后续命令的状态替代。

## 12. 历史记录与重复执行

**【zsh】** 按 `↑ / ↓` 浏览已有命令；按 `Ctrl + R` 输入关键词查找历史，再按 Ctrl + R 可以继续向更早的匹配项搜索。按 Ctrl + C 可以取消。

```zsh
fc -l -20
```

这可以查看最近的历史条目。当前本机历史文件是 `/Users/dsy/.zsh_history`，启动检查显示 `HISTSIZE=2000`、`SAVEHIST=1000`。不同会话之间何时同步历史，由系统和 Shell 的历史设置决定，不保证实时一致。

历史命令再次执行前要重新确认当前目录。昨天在练习目录里执行安全的删除命令，今天在其他目录重复执行可能完全不同。

终端滚动记录和 Shell 历史记录是两回事：前者保存显示过的输出，后者主要保存执行过的命令。清屏不会自动删除历史文件。

## 13. 运行程序、脚本和开发工具

### 13.1 命令从哪里来

```zsh
command -v python3
command -v git
command -v starship
printf '%s\n' "$PATH"
```

Shell 会根据 `PATH` 等规则寻找命令。当前目录通常不应默认放在 PATH 中，所以运行当前目录的程序常写成 `./程序名`。

程序报 `command not found`，常见原因是没有安装、名字拼错，或安装位置不在 PATH 中。不要一看到这个错误就加 `sudo`。

### 13.2 创建并运行一个小脚本

以下示例会在当前练习目录创建 `hello.zsh`：

```zsh
cat > hello.zsh <<'EOF'
#!/bin/zsh
name=${1:-朋友}
printf '你好，%s！\n' "$name"
EOF

zsh hello.zsh 小明
```

这里最后一条明确调用 zsh 解释文件，不要求脚本有执行权限。

如果想直接执行：

```zsh
chmod u+x hello.zsh
./hello.zsh 小明
```

`chmod u+x` 只为文件所有者添加执行权限。`#!/bin/zsh` 告诉系统直接执行时使用哪个解释器。

### 13.3 执行与 source 的区别

- `zsh hello.zsh`：在子 Shell 中执行；脚本里的 `cd` 和普通变量不会反过来改变当前 Shell。
- `source 文件`：在当前 Shell 中执行文件内容，会影响当前目录、变量、函数、别名和按键等。

因此，只应 `source` 你信任且知道用途的文件。重新加载 `/Users/dsy/.zshrc` 属于常见用途，但反复加载某些配置可能重复添加钩子或 PATH；**修改设置后新建标签页通常更稳妥**。

### 13.4 Python 和项目工具

```zsh
python3 --version
node --version
```

这些用于查看已安装工具的版本。本手册不安装项目依赖、不启动项目服务。

对于带 `package.json`、`pyproject.toml`、`Makefile` 的项目，应先阅读该项目 README 和现有脚本，再决定运行 `npm`、`python3` 或 `make` 的哪条命令。不要把别的项目的命令直接套用。

## 14. 中断、后台任务与进程

### 14.1 三个容易混淆的概念

- **Ctrl + C**：通常向前台任务发送中断信号，请求它停止；不是所有程序都会立即退出。
- **Ctrl + Z**：通常暂停前台任务；任务还存在，没有真正结束。
- **在命令末尾加 `&`**：让任务在后台启动，Shell 通常立即返回提示符。

### 14.2 一个可控的小实验

```zsh
sleep 30 &
jobs
```

`sleep 30` 只是等待 30 秒。`jobs` 列出当前 Shell 管理的任务，不是全系统进程。

可以运行 `fg` 把最近的任务带回前台，然后 Ctrl + C 停止它。若有多个任务，先查看 `jobs`，再用实际编号，例如 `fg %1`。不要假定每次任务编号都为 1。

暂停任务后，`bg` 可以请求它在后台继续运行。某些需要持续读取终端输入的程序不适合直接放后台。

### 14.3 查看与结束进程

```zsh
ps -p $$ -o pid,ppid,comm
pgrep -fl '程序名'
```

`$$` 是当前 Shell 的进程 ID；第二条中的“程序名”需要替换为你要查找的实际名称。

**【注意影响】** 要结束进程，先确认 PID 和用途，再使用 `kill PID`。默认通常发送 TERM 信号，让程序有机会清理退出。强制结束可能导致未保存数据丢失，不应作为第一步。

关闭 Ghostty 窗口、`&` 放后台、远程断开后继续运行，三者不是同一回事。需要可靠的长期会话时，可以另外学习 `tmux` 或服务管理工具；本手册不假定它们已安装。

## 15. 权限和 sudo

```zsh
ls -l notes/sample.txt
```

开头类似 `-rw-r--r--` 的部分表示文件类型和访问权限；后面会显示所有者、所属组、大小与日期。

- 文件的 `r`：读取；`w`：修改；`x`：执行。
- 目录的 `x` 通常表示可以穿过／进入该目录，不应简单理解为“执行目录”。

`sudo` 使用更高权限执行命令，输密码时通常不显示星号，这不代表键盘没反应。

**【注意影响】** 不要用 `sudo` 反复尝试不明命令，不要为解决一个文件权限问题把整个目录设成 `777`。应先检查报错路径、文件所有者、实际需要的权限。

Homebrew 日常安装通常不需要自己在命令前加 `sudo`。

## 16. 网络、SSH 与远程终端

### 16.1 简单网络检查

```zsh
curl -I --max-time 15 https://example.com
```

这会尝试请求响应头，最多等待约 15 秒。服务器返回 HTTP 状态不等于整个应用功能正常。

`curl` 遇到证书错误时，应检查网络、系统时间和证书来源，不要直接跳过证书校验。之前字体安装出现过网络与证书问题，后续通过正常校验的下载完成了安装。

### 16.2 SSH

示意命令：

```zsh
ssh username@server.example.com
```

用户名和地址需要换成你有权限访问的真实服务器。首次连接的主机指纹应与可信来源核对；不要盲目接受不认识的服务器。

连接后，输入的命令通常在远程机器执行：

- `pwd` 显示的是远程目录。
- `rm` 删除的是远程文件。
- 本地 Starship、补全和字体安装不等于远程也完成相同配置。
- **【Ghostty 专属】** 本地窗口与分屏快捷键仍由 Ghostty 处理。
- `exit` 退出远程 Shell，通常返回本地会话。

远程 Linux 与 macOS 的工具选项可能不同，不要假定所有命令参数完全一致。

## 17. Homebrew 与 Git 入门

### 17.1 Homebrew

**【macOS／Homebrew】** 常用查询：

```zsh
brew --version
brew list
brew info starship
brew info --cask ghostty
```

- `brew install 软件名`：通常安装命令行工具或软件包。
- `brew install --cask 应用名`：按 Cask 方式安装 macOS 应用、字体等。
- `brew update`：更新软件包元数据，不等于把全部已安装软件升级。
- `brew upgrade 软件名`：升级指定已安装软件。

**【注意影响】** 安装、升级和卸载会改变系统上的软件，先确认具体名称。本文只讲用法，没有自动升级或卸载任何软件。

你目前使用的相关包是 Ghostty、Starship 和 `font-maple-mono-nf-cn`。字体图标正常显示，既需要字体已安装，也需要对应终端选择该字体。

### 17.2 Git：先学查看状态

在一个已有 Git 仓库的目录内：

```zsh
git status
git diff
git diff --cached
git log --oneline -5
```

- `git status`：看当前分支与文件变更状态。
- `git diff`：看未暂存的改动。
- `git diff --cached`：看已经暂存、准备提交的改动。
- `git log`：看历史提交。

Starship 的 Git 分支和状态部分，只有进入相关仓库时才有意义。普通桌面目录里不显示 Git 分支是正常的。

暂存、提交、推送是不同步骤；推送会把提交发送到远程。删除分支、重置、强制推送等操作影响较大，操作前应确认范围和恢复方式。本手册不替你执行这些动作。

## 18. 配置文件、生效方式和恢复

### 18.1 三套配置分别控制什么

**【Ghostty 专属】**

实际文件：`/Users/dsy/Library/Application Support/com.mitchellh.ghostty/config.ghostty`

控制字体、窗口、透明度、Ghostty 快捷键等。原配置头部的示例注释写过 `~/.config/ghostty/config`，但那不是本机当前实际使用的文件；应以这里的实际路径为准。

- `⌘ + ,`：打开 Ghostty 配置。
- `⌘ + Shift + ,`：重新加载 Ghostty 配置。
- 某些选项只影响新窗口，或需要完整重启应用。

**【zsh】**

文件：`/Users/dsy/.zshrc`

控制交互式 zsh 的补全、按键、函数、别名，以及加载 Starship。Ghostty 和 VS Code 本地 zsh 共用。修改后新建标签页；这与 Ghostty 的“重新加载配置”不是同一件事。

**【Starship】**

文件：`/Users/dsy/.config/starship.toml`

控制彩色提示符内容和配色。Starship 通常在下一次生成提示符时读取配置；新建终端也可以检查效果。

**【VS Code 专属】**

文件：`/Users/dsy/Library/Application Support/Code/User/settings.json`

你已设置 `terminal.integrated.fontFamily` 为 `Maple Mono NF CN`。VS Code 不会读取 Ghostty 的透明度或分屏快捷键。工作区设置、用户配置档和远程设置还可能覆盖部分用户设置。

### 18.2 检查配置

```zsh
zsh -n ~/.zshrc
starship --version
```

第一条只做 Shell 语法检查，不代表所有交互功能都正常。

如果当前 Shell 能找到 `ghostty` 命令，可以运行：

```zsh
ghostty +validate-config
ghostty +show-config
ghostty +list-themes
```

若报找不到命令，可以使用应用内的完整路径，例如：

```zsh
/Applications/Ghostty.app/Contents/MacOS/ghostty +validate-config
```

`+show-config` 用于检查有效配置，**不要把它的全部输出直接覆盖进配置文件**。你原始配置中的 `background-blur-radius` 等旧写法可能被当前版本接受并规范化显示，不能仅因为输出名称不同就判断失效。

原参考配置有一条注释说“自动切换浅色／深色”，但实际设置是 `theme = Catppuccin Mocha`，因此本机当前使用的是固定深色主题；注释本身不会产生功能。

### 18.3 备份与恢复

此前改动已在原目录留下带时间戳的备份，可查看：

```zsh
ls -lt ~/.zshrc.backup-*
ls -lt "$HOME/Library/Application Support/com.mitchellh.ghostty/"config.ghostty.backup-*
ls -lt "$HOME/Library/Application Support/Code/User/"settings.json.backup-*
```

如果没有匹配备份，zsh 可能提示 `no matches found`。

恢复前先比较备份与当前文件，并另外备份当前版本。不同时间的备份包含不同配置：恢复较早的 `.zshrc` 可能同时移除后面新增的 Starship 或补全设置，不应只凭“最新／最旧”盲目覆盖。

## 19. 常见故障排查

### 19.1 “Shell 卡住了”

按下面顺序判断：

1. **出现补全菜单？** Enter 可能只是在确认候选；Ctrl + C 可以取消当前输入。
2. **正在运行 `less`？** 按 `q` 退出。
3. **正在运行 `tail -f`、服务器或等待输入的程序？** 没有返回提示符可能是正常的；需要停止时按 Ctrl + C。
4. **画面突然不再刷新？** 尝试 Ctrl + Q，解除可能误触的 Ctrl + S 输出暂停。
5. **正在输密码？** 密码通常不回显；输入完成后按 Enter。
6. **出现引号未闭合的提示？** 补上引号，或 Ctrl + C 取消。
7. **仍无响应？** 新建标签页确认是否只是一个会话的问题，先保留原会话，不要立刻结束整个应用。

Ctrl + Z 只是暂停程序，不是通用的“修复卡住”按钮。

### 19.2 全局快捷键呼不出 Ghostty

- 确认 Ghostty 正在运行，而不是已经 `⌘ + Q` 退出。
- 检查辅助功能权限。
- 确认按的是 Control + 反引号，不是 Command + 单引号。
- 检查是否被其他工具占用、是否处于会限制全局按键的安全输入状态。
- 修改后加载配置；需要重启时先处理好现有任务。

### 19.3 主题没有出现或图标变成方块

- 新建终端，确认运行的是本地 zsh。
- `command -v starship` 应能找到程序。
- Ghostty 和 VS Code 都应选择 Maple Mono NF CN 字体。
- 远程 SSH、容器、其他用户的 Shell 不会自动继承本地 `.zshrc`。
- 显示 `zsh` 只是 Shell 名称，不代表 Starship 没生效。

### 19.4 Shift + Tab 不后退

- 新建终端，让最新 `.zshrc` 生效。
- 确认正在 Shell 提示行，不是在编辑器或交互式程序里。
- 可查看绑定：

```zsh
bindkey '^I'
bindkey '^[[Z'
bindkey -M menuselect '^[[Z'
```

当前预期分别包含 `menu-complete`、`reverse-menu-complete`、`reverse-menu-complete`。

如果只有 VS Code 不生效，还要检查 VS Code 是否把 Shift + Tab 截获用于焦点导航或其他快捷键；远程会话则要查远程配置。

### 19.5 “没有这个文件或目录”

先运行 `pwd`，再 `ls` 确认文件名。检查相对路径、空格、大小写和引号。路径显示在 Starship 中被缩短，不代表真实目录名变了。

### 19.6 输出很长，找不到上一条结果

- **【Ghostty 专属】** 用 `⌘ + F` 搜索现有输出。
- 对长文本使用 `less`。
- 对需要保存的结果，明确选择文件名后重定向到文件。
- 滚动缓冲区有容量上限，你当前配置约 25 MB，不是无限历史存档。

## 20. 一次完整练习

建议在新建的 Ghostty 标签页里按顺序操作。以下过程只创建一个新的桌面练习目录和其中的文件：

```zsh
practice_dir=$(mktemp -d "$HOME/Desktop/shell-practice.XXXXXX")
cd "$practice_dir"
mkdir alpha-one alpha-two alpha-three
printf 'hello shell\nhello Ghostty\n' > example.txt
pwd
ls -lah
cat example.txt
grep -n 'Ghostty' example.txt
cp -i example.txt example-copy.txt
open .
```

然后做键盘练习：

1. 输入 `cd alpha-`，先不要按 Enter。
2. 连续按 Tab 查看候选，再按 Shift + Tab 退回。
3. 确认候选后按 Enter；若只是退出菜单，再按 Enter 执行。
4. 输入 `pwd` 检查进入了哪个目录，然后 `cd ..` 返回。
5. 按 `⌘ + D` 新建右侧分屏，观察这是另一个 Shell 会话。
6. 按 `⌘ + Option + ← / →` 切换分屏。
7. 按 `⌘ + Shift + F` 放大当前分屏，再按一次恢复。
8. 在其中一个分屏输入 `sleep 30`，再 Ctrl + C 中断。
9. 用 Finder 的 `⌘ + Option + C` 复制练习文件路径，练习正确引用路径。

练习完成后，可以在 Finder 把对应 `shell-practice.*` 文件夹移到废纸篓；先核对它确实是这次创建的练习目录。

## 21. 验证范围与参考资料

### 已核对的事实

- 本机 Ghostty 版本、实际配置文件与有效快捷键。
- 当前 zsh 的补全配置、Starship 初始化和主要编辑按键。
- 当前字体、主题、历史文件位置及 VS Code 终端字体设置。
- 此前在隔离交互式终端中验证过 Tab 前进、Shift + Tab 后退，以及带斜杠目录候选的首尾循环。
- 编写本手册时，47 个 zsh 示例代码块均通过语法检查；在独立测试目录中实际运行并核对了文件创建、复制、改名、目录复制、管道、覆盖／追加写入和简单脚本示例。语法检查不等于所有示例都经过功能验证。

### 不应误读为完整功能验证的部分

- Ghostty 和 VS Code 的全部图形界面快捷键没有逐一实测。
- 辅助功能授权状态、全局快捷键冲突及不同键盘布局下的表现未逐一验证。
- SSH、网络、项目工具、后台任务等章节主要是使用说明，不代表替你连接过服务器或执行过所有示例。
- 示例中的删除、结束进程、权限变更、安装和升级不会因阅读本文件而自动执行。

### 获取帮助

```zsh
man ls
man cp
man zsh
```

在手册阅读器中通常按 `q` 退出。部分程序支持 `--help`，但 macOS 系统工具并非都支持，优先看 `man` 或官方说明。

- Ghostty 文档：https://ghostty.org/docs
- Ghostty 配置参考：https://ghostty.org/docs/config/reference
- zsh 文档：https://zsh.sourceforge.io/Doc/
- Starship 配置：https://starship.rs/config/
- Homebrew 文档：https://docs.brew.sh/

本手册使用本机实际配置作为快捷键依据。未来如果你更改了配置，以应用菜单、有效配置输出和实际按键绑定为准。
