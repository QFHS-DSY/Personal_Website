---
title: Mac远程控制Win
published: 2026-11-06
description: Mac远程控制Windows_Tailscale_WindowsApp配置指南
image: ''
tags: ['Mac','Windows']
category: ''
draft: false 
lang: ''
---

# Mac 跨网络远程控制 Windows：Tailscale + Windows App 完整配置指南

适用场景：一台 Mac 控制一台 Windows 专业版电脑，两台电脑位于不同局域网，Windows 旁边可以没人。

资料核对日期：2026 年 11 月 17 日。

**完成后的效果：**在 Mac 上先连接 Tailscale，再打开 Windows App，即可通过互联网登录自己的 Windows 桌面。完成无人值守设置后，Windows 正常重启到登录界面时也应能重新连接。

**验证状态：**本文已对照微软和 Tailscale 官方说明核对；你的两台电脑上的安装、实际远程连接、睡眠及重启测试均未运行。文中的复选框是待你执行的验收项目。

## 1. 开始前准备

### 1.1 两台电脑分别安装什么

- **Windows：**安装 Tailscale，启用系统自带的“远程桌面”。
- **Mac：**安装 Tailscale 和微软的 Windows App。
- **Tailscale 的作用：**让不同网络中的两台电脑建立加密的私有连接。
- **Windows App 的作用：**通过这个连接显示 Windows 桌面，并传递键盘、鼠标等操作。

本方案使用 Tailscale 提供的私有地址连接，无需购买公网 IP、配置路由器端口转发或租用服务器。路由器上无需开放公网 3389 端口。

### 1.2 前提与费用

1. Windows 已是专业版，且你有管理员权限。
2. 两台电脑都能正常上网。首次配置 Windows 时，应能直接操作它，或有人在它旁边协助。
3. 准备一个用于登录 Tailscale 的个人账号，例如 Google、Microsoft、Apple 或其他页面支持的登录方式。**两台电脑使用同一种登录方式、同一个账号。**建议为这个登录账号开启双重验证。
4. 准备用于登录 Windows 的用户名和账户密码。它与 Tailscale 账号是两回事。
5. 个人非商业用途可以使用 Tailscale Personal 免费套餐；Windows App 免费，Windows 专业版已包含远程桌面功能。商业用途应另核对 Tailscale 适用套餐。
6. Mac 需要满足客户端的系统要求。核对当日，Windows App 的 Mac App Store 页面标注需要 **macOS 15.0 或更高版本**；Tailscale 的安装文档标注需要 macOS 13.0 或更高版本。安装时以实际下载页面要求为准。

本文主要按 Windows 11 编写；Windows 10 中相近设置的名称可能略有不同。软件版本变化也可能改变按钮文字，文中同时给出常见英文名称。

### 1.3 记录这些信息

可以把以下内容记在自己的笔记里，**密码放在密码管理器中，不写进本文**：

- Windows 设备名称：________
- Windows 登录用户名：__________
- Windows 的 Tailscale IPv4 地址：__________
- Mac 的 Tailscale IPv4 地址：__________
- Tailscale 使用的登录方式及账号：__________

后文的 `100.90.80.70` 是 Windows 地址示例，`100.90.80.71` 是 Mac 地址示例。请替换成客户端或管理后台显示的真实地址。

## 2. 在 Windows 上完成设置

### 2.1 确认设备名称和登录账户

1. 打开 **设置 → 系统 → 关于**。
2. 记录“设备名称”，例如 `DESKTOP-ABC123`。
3. 确认“Windows 规格 → 版本”显示专业版。
4. 打开 **设置 → 账户 → 你的信息**，判断目前使用的是本地账户，还是个人 Microsoft 账户。

按下面与你实际情况相符的一种方式准备登录信息。

#### A. 当前使用本地账户

1. 按 `Win + R`，输入 `cmd`，回车。
2. 输入下面的只读命令：

```bat
whoami
```

3. 输出通常类似 `desktop-abc123\zhangsan`。记录这个完整名称，后面在 Mac 的远程桌面登录框中使用。
4. 确认你知道该账户的**非空密码**。如果还没有密码，在 **设置 → 账户 → 登录选项 → 密码** 中添加。

注意：Windows Hello 的 PIN、指纹、人脸识别与账户密码不同。本文采用普通密码登录远程桌面，不能把 PIN 当作远程桌面的密码。

#### B. 当前使用个人 Microsoft 账户

1. 记录与这台 Windows 关联的完整 Microsoft 账户邮箱。
2. 准备该 Microsoft 账户的实际密码。
3. 在 Mac 的远程桌面登录框中，用户名可以使用 `MicrosoftAccount\你的完整邮箱`，例如 `MicrosoftAccount\name@example.com`。
4. 首次配置时，在 Windows 本机确认能够通过“登录选项 → 密码”登录一次，再测试远程连接。
5. 如果只显示 PIN、指纹或人脸登录，在 **设置 → 账户 → 登录选项 → 其他设置/附加设置** 中查找“为了提高安全性，仅允许对此设备上的 Microsoft 账户使用 Windows Hello 登录”等选项。需要密码登录时，可关闭这项限制，再锁屏查看密码登录选项。此调整会允许本机使用密码登录，并不会删除已有 PIN。

如果 Microsoft 账户本身启用了完全无密码登录，单纯修改上述 Windows Hello 选项不会凭空创建密码。可以先处理该账户的密码登录设置，或者按下一小节创建专用本地账户。

#### C. 可选：创建专门用于远程操作的本地账户

仅当你希望使用独立账户，或现有 Microsoft 账户不便使用密码登录时执行。

1. 打开 **设置 → 账户 → 其他用户 → 添加账户**。Windows 10 中可能叫“家庭和其他用户”。
2. 选择 **我没有这个人的登录信息**。
3. 选择 **添加一个没有 Microsoft 账户的用户**。
4. 设置用户名，例如 `remoteuser`，以及独立、足够强的非空密码，完成页面要求的恢复信息。
5. 保留“标准用户”类型即可；下一节单独授予远程桌面权限。
6. 后续远程登录用户名填写 `Windows设备名称\remoteuser`，例如 `DESKTOP-ABC123\remoteuser`。

**这会创建新的 Windows 用户环境。**它不会自动进入原账户的桌面，也不会自动继承原账户的文件、登录状态和按用户安装的软件。若需要继续操作原账户的环境，应优先使用原账户连接。

### 2.2 开启 Windows 远程桌面

1. 打开 **设置 → 系统 → 远程桌面**。
2. 打开“远程桌面”开关，确认提示。
3. 保持 **要求设备使用网络级别身份验证进行连接（推荐）** 开启，英文通常包含 `Network Level Authentication` 或 `NLA`。
4. 如果准备用管理员账户登录，管理员通常默认具有远程桌面权限。
5. 如果准备用普通账户或新建的 `remoteuser` 登录，点击 **远程桌面用户 → 添加**。可以通过 **高级 → 立即查找** 选择该账户，逐层点击“确定”。
6. 启用远程桌面通常会同步启用相应的 Windows 防火墙规则。若后续连接失败，按第 6.2 节检查；不要关闭整个防火墙来排查。

Windows 端无需为了接收连接而另装 Windows App。它使用的是系统自带的远程桌面服务。

### 2.3 安装并登录 Tailscale

1. 在 Windows 浏览器打开 [Tailscale 官方下载页](https://tailscale.com/download)。
2. 选择 Windows 安装程序，下载并运行；出现管理员确认时批准安装。
3. 安装后，在任务栏右下角找到 Tailscale 图标；如果没显示，展开隐藏图标的小箭头。
4. 右键图标，选择 **Log in / 登录**。
5. 在打开的浏览器中选择你的登录方式，完成登录。
6. 按提示将这台电脑加入自己的 Tailscale 网络；个人非商业用途选择 **Personal** 免费套餐。
7. 回到客户端，确认状态为已连接。也可以打开 [Tailscale 设备管理页](https://login.tailscale.com/admin/machines)，确认 Windows 出现在设备列表并在线。
8. 从客户端或设备管理页复制这台 Windows 的 Tailscale IPv4 地址，记录到第 1.3 节。

应使用管理后台明确标为 Tailscale 地址的 `100.x.x.x` 地址。不要把路由器给电脑分配的 `192.168.x.x` 地址填到外网连接配置里，也不要仅凭地址以 `100` 开头就认定它属于 Tailscale。

### 2.4 启用无人值守：保证重启后可以连接

这一项对你的场景非常重要，单纯“开机启动”不能替代它。

1. 在 Windows 任务栏右下角，右键 Tailscale 图标。
2. 打开 **Preferences / 偏好设置**。
3. 勾选 **Run unattended / 无人值守运行**。
4. 出现确认窗口时选择 **Yes / 是**，按需要批准管理员提示。
5. 再次打开菜单，确认该选项旁边有勾选标记。

启用后，Tailscale 会继续使用这台电脑已配置的登录身份，在用户注销或 Windows 重启后保持可用。**不需要为了远控而开启 Windows 自动登录。**

如需检查服务：按 `Win + R`，输入 `services.msc`，找到 **Tailscale**，确认启动类型为“自动”，当前状态为“正在运行”。

### 2.5 配置电源和网络，避免离开后失联

1. Windows 11 打开 **设置 → 系统 → 电源和电池/电源 → 屏幕、睡眠和休眠超时**。较早版本可能显示“屏幕和睡眠”。
2. Windows 10 对应入口通常是 **设置 → 系统 → 电源和睡眠**。
3. 将“接通电源后，使设备进入睡眠状态”的时间设为 **从不**。
4. 显示屏关闭时间可以保留为几分钟；屏幕熄灭不等于电脑睡眠。
5. 如果电源计划还设置了自动休眠，打开 **控制面板 → 电源选项 → 更改计划设置 → 更改高级电源设置 → 睡眠**，将“接通电源”时的自动休眠设为“从不”；没有该项目的电脑可跳过。
6. 如果 Windows 是笔记本，建议接通电源。若计划合盖运行，在 **控制面板 → 电源选项 → 选择关闭笔记本计算机盖的功能** 中，将“接通电源时关闭盖子”设置为 **不采取任何操作**，保存，并保证通风。
7. 优先使用稳定的有线网络。使用 Wi-Fi 时，确认该网络勾选自动连接，并在后面的重启测试中验证无需进入桌面就能联网。

手动选择睡眠、休眠或关机仍然会使电脑不可达。Tailscale 不会自动把关机的电脑启动起来。本方案的前提是 Windows 已启动、联网且保持清醒。

### 2.6 可选：处理 Tailscale 设备密钥到期

Tailscale 的设备身份需要定期重新认证；新网络默认到期周期通常为 180 天，实际以后台显示为准。无人值守不等于永不过期。

对于长期放在固定地点、由你保管的 Windows，可以选择关闭**这台 Windows 设备**的密钥到期：

1. 在任一电脑浏览器打开 [设备管理页](https://login.tailscale.com/admin/machines)。
2. 根据设备名称和地址找到 Windows。
3. 点击该设备的 `…` 菜单。
4. 选择 **Disable key expiry / 禁用密钥到期**。
5. 确认该设备显示密钥到期已禁用或相应状态。

取舍：这样能避免到期导致远程失联，但也取消了这台设备的定期重新认证。只对自己控制的可信设备使用；设备丢失、出售或不再使用时，应及时从后台撤销/移除。以后可用 **Enable key expiry** 恢复到期机制。

如果希望保留默认到期机制，就记录后台显示的日期，并提前在仍能访问 Windows 时完成重新登录。Mac 在你手边，可以保留默认到期设置，按提示重新登录。

## 3. 在 Mac 上完成设置并连接

### 3.1 安装并登录 Tailscale

1. 打开 [Tailscale 官方下载页](https://tailscale.com/download)，选择 macOS。
2. 本文采用官方推荐的独立安装版；按下载页或 [官方安装说明](https://tailscale.com/docs/install/mac) 下载并安装。
3. 打开“应用程序”中的 Tailscale。
4. 按引导批准 Tailscale 所需的系统扩展、网络扩展或 VPN 配置；不同 macOS 版本显示的提示可能不同。确认授权对象是刚安装的 Tailscale。
5. 点击 **Log in / 登录**，使用和 Windows **相同的登录方式、相同的账号**。
6. 确认 Mac 菜单栏中的 Tailscale 显示已连接；如有 **Launch at login / 登录时启动** 选项，可以启用。
7. 打开 [设备管理页](https://login.tailscale.com/admin/machines)，确认 Windows 和 Mac 都位于同一设备列表，并显示在线。
8. 记录 Mac 的 Tailscale IPv4 地址；再次核对 Windows 的地址。

如果你的 Mac 已装有可正常使用的 Tailscale，可以直接使用现有版本；不要同时运行 App Store 版和独立安装版。

这一步只需要两台设备互通，保持默认的出口节点设置即可，不需要配置子网路由或开启整机流量转发。

### 3.2 安装 Windows App

1. 打开 Mac 的 App Store，搜索 **Windows App**，确认发布者是 **Microsoft Corporation**。
2. 也可以直接打开 [Windows App 的 App Store 页面](https://apps.apple.com/app/windows-app/id1295203466)。
3. 点击“获取”并完成安装。
4. 打开 Windows App，按需要跳过首次介绍。

**添加自己的远程 PC 不需要先登录 Windows App 的工作/学校账户。**直接使用下一节的“添加 PC”。Tailscale 登录、Windows App 的组织账号登录、远程 Windows 账户登录是不同的步骤；本方案只需要第一项和第三项。

### 3.3 添加 Windows 电脑

1. 在 Windows App 的 **Devices / 设备** 页面，点击 `+`，选择 **Add PC / 添加 PC**。
2. **PC name / PC 名称：**填写 Windows 的 Tailscale IPv4 地址，例如 `100.90.80.70`。默认端口无需另填；不要在地址前加 `https://`。
3. **Friendly name / 友好名称：**填写便于识别的名字，例如“家里的 Windows”。
4. **Credentials / Saved credential / 凭据：**首次选择 **Ask when required / 需要时询问**，便于确认正确的账户信息。
5. **Gateway / 网关：**如界面提供此项，保持 **No gateway / 无网关**。
6. 首次连接时，显示、声音等其他选项可以先保留默认值。
7. 点击 **Add / 添加**，设备卡片会出现在列表中。

### 3.4 首次连接与身份验证

1. 确认 Mac 的 Tailscale 仍为已连接。
2. 双击刚添加的 Windows 设备卡片。
3. 出现远程电脑凭据输入框时，填写第 2.1 节准备的 Windows 账户信息：
   - 本地账户：`Windows设备名称\用户名`，例如 `DESKTOP-ABC123\zhangsan`。
   - 专用本地账户：例如 `DESKTOP-ABC123\remoteuser`。
   - 个人 Microsoft 账户：例如 `MicrosoftAccount\name@example.com`。
4. 密码填写相应 Windows 账户的实际密码。Mac 登录凭据、Tailscale 登录凭据和 Windows Hello PIN 都不能替代它。
5. 如果出现证书信任提示，先确认 PC 地址与 Tailscale 后台记录一致，并检查证书中的计算机名称是否与自己的 Windows 对应。默认自签名证书可能出现提示；核对无误后再继续。目标不一致或证书异常变化时先排查。
6. 进入桌面后，打开一个已有应用，测试键盘输入、鼠标点击、中文输入和窗口切换。

正常情况下，远程连接会使 Windows 本机屏幕进入锁定状态。Windows 专业版通常只允许一个交互用户会话处于活动状态，本机重新登录也可能使远程会话断开。它不适合两个人同时独立操作同一台 Windows。

### 3.5 可选：保存凭据和调整使用体验

首次成功后再做这些设置：

1. 在 Windows App 中找到设备卡片，打开 `…` 或右键菜单，选择 **Edit / 编辑**。
2. 在凭据设置中选择添加/保存凭据，填写已验证成功的用户名和密码。只有你自己使用、妥善保护的 Mac 才建议保存密码。
3. 在显示设置中按需要开启适应窗口、全屏或多显示器。网络一般时先降低分辨率，并先用单个显示器。
4. 如需两边复制文字，在设备/重定向设置中确认剪贴板功能启用，再实际测试。
5. 如需访问 Mac 文件，在 **Folders / 文件夹** 等重定向设置里添加一个专门的传输文件夹，并批准对应的 macOS 文件访问权限。重新连接后，在 Windows 的“此电脑”中查看重定向的位置。

共享文件夹可能允许远程 Windows 读取或修改其中内容，建议只选择需要传输的文件夹。剪贴板和文件夹重定向还可能受 Windows 策略限制，应以实测为准。

## 4. 必做验收：确认人在外面也能用

**完成配置不等于已经验证可用。**下面的测试应在你仍能接触 Windows、能处理失联的情况下完成。重启和注销前先保存工作；注销会结束当前用户会话中的程序。

### 4.1 验证跨网络操作

- [ ] Windows 留在原来的网络中。
- [ ] Mac 使用另一个网络；如果两台当时在同一 Wi-Fi 下，可让 Mac 临时连接手机热点。
- [ ] 两台 Tailscale 都在线。
- [ ] Mac 能通过 Windows App 登录正确的 Windows 账户。
- [ ] 能打开实际需要的软件，完成一次输入、点击及必要的文件操作。
- [ ] 关闭远程窗口后，能再次连接。

### 4.2 验证注销后仍能访问

- [ ] 已保存 Windows 中的工作。
- [ ] 在 Windows 中选择“注销”，停留在登录界面，不在本机重新登录。
- [ ] Mac 仍能通过 Tailscale 连接，并使用 Windows App 远程登录。

这项测试用于确认 Tailscale 无人值守确实生效。

### 4.3 验证重启后仍能访问

- [ ] 已保存工作后，重启 Windows。
- [ ] 等待系统启动和网络恢复，先不在 Windows 本机输入 PIN 或密码。
- [ ] 在 Mac 或管理后台确认 Windows 恢复在线。
- [ ] 使用 Windows App 能重新登录，并打开需要的软件。

重启时会断开当前连接，这是正常现象。重启后能否恢复访问，取决于 Tailscale 服务、无人值守、网络和启动过程是否都正常。

### 4.4 验证空闲和合盖场景

- [ ] Windows 接通电源，空闲到屏幕熄灭后仍能连接。
- [ ] 等待至少超过原先设置的自动睡眠时间，再次测试连接。
- [ ] 如需笔记本合盖运行，合盖后另做一次连接测试。

完成以上测试再依赖这套方案长期外出使用。断电、Windows 未启动、停在 BIOS/BitLocker 启动 PIN 或恢复密钥界面、网络需要人工认证时，Tailscale 尚不能提供可用连接，可能需要现场处理。

## 5. 日常使用顺序

1. Mac 正常联网。
2. 打开 Tailscale，确认已连接且 Windows 在线；如提示认证到期，先重新登录。
3. 打开 Windows App，双击保存的设备。
4. 完成操作后，如果希望 Windows 程序继续运行，选择断开远程会话或关闭远程窗口。**不要选择注销或关机。**程序能否持续运行还取决于电源设置、系统策略和软件自身行为。
5. 下次需要使用时重新连接同一个 Windows 账户。

Windows 需要保持开机、联网和不睡眠。Mac 自己休眠或切换网络可能导致远程连接中断，恢复网络后重连即可；Windows 端的程序通常不会仅因远程窗口断开而退出。

## 6. 常见问题与排查顺序

### 6.1 后台只看到一台设备，或者 Windows 离线

按顺序检查：

1. 两台是否采用同一种登录方式、同一个 Tailscale 账号，并处于同一个 Tailscale 网络。
2. Windows 是否开机、联网、未睡眠；Tailscale 是否显示已连接。
3. 设备是否等待管理员批准，或显示密钥到期。
4. 若只在注销或重启后失联，检查第 2.4 节的无人值守，以及 Tailscale 服务是否自动运行。
5. 若只在合盖或空闲后失联，检查第 2.5 节的睡眠、休眠和合盖动作。
6. 若只在某一个网络失败，可用 Mac 手机热点对比。公司、酒店等网络可能限制 VPN 类通信，或需要先完成网页上网认证。

如果 Windows 在重启后尚未登录时连不上 Wi-Fi，单纯修改远程桌面账户无法解决；先解决启动后的自动联网问题。

### 6.2 两台在线，但 Windows App 提示连接失败或 0x204

`0x204` 不是唯一原因明确的错误码，需要区分网络、端口和系统设置。

1. 核对 Windows App 填的是 **Windows 的 Tailscale IPv4**，不是 Mac 地址或 Windows 的局域网地址。
2. 核对 Windows 的远程桌面已开启，网关保持默认“无网关”。
3. 如果你修改过 Tailscale 访问策略，确认策略允许这台 Mac 访问 Windows 的 TCP 3389。UDP 3389 可用于改善远程桌面传输体验；基本排查先确认 TCP。
4. 检查 Windows Defender 防火墙及其他防护软件是否允许此连接。

**可选：在 Mac 上做一次端口诊断。**打开“终端”，将示例地址换成真实 Windows Tailscale 地址后运行：

```sh
nc -G 5 -vz 100.90.80.70 3389
```

- 显示 `succeeded`：仅证明 TCP 3389 可达，不代表 Windows 账户验证或完整桌面操作已经通过。
- 超时：优先检查设备状态、Tailscale 策略和防火墙。
- 拒绝连接：优先检查远程桌面是否开启，以及远程桌面服务是否正常；单凭这一条结果仍不能确定唯一原因。

**仅在确认被 Windows 防火墙拦截时，按需要补充规则：**

1. 在 Windows 按 `Win + R`，输入 `wf.msc`，打开高级防火墙。
2. 选择“入站规则”，先检查已有的“远程桌面 / Remote Desktop”规则是否启用及适用配置文件。
3. 若需要新增规则，点击“新建规则 → 自定义”。程序页面选择“所有程序”。
4. 在“协议和端口”页面选择 **TCP**，本地端口选择“特定端口”并填写 `3389`，远程端口保持“所有端口”。
5. 在“作用域”页面，把本地 IP 限定为 **Windows 的真实 Tailscale IPv4**，远程 IP 限定为 **Mac 的真实 Tailscale IPv4**。分别选择“下列 IP 地址”并添加，例如 Windows 为 `100.90.80.70`、Mac 为 `100.90.80.71`。
6. 选择“允许连接”；为适配 Tailscale 虚拟网络的实际分类，可以勾选域、专用、公用三个配置文件。
7. 命名为 `RDP from my Mac via Tailscale TCP`，完成创建并测试连接。如果需要 UDP，也可以用同样方法为 UDP 3389 创建一条规则，保留相同的本地及远程 IP 限制。设备删除后重新加入若导致地址变化，需更新规则中的地址。

上述操作会新增一条入站允许规则，可通过禁用或删除该条规则恢复。它不会自动收紧已有的其他宽泛规则，因此不能据此声称“电脑只允许通过 Tailscale 访问”。如果安全软件或组织策略有明确阻止规则，应处理对应策略，不要关闭整个防火墙。

### 6.3 提示用户名或密码错误

1. 确认填的是 Windows 账户密码，而非 PIN、Mac 密码或另一套登录凭据。
2. 本地账户优先使用完整形式 `Windows设备名称\用户名`；登录名与显示昵称可能不同。
3. Microsoft 账户核对完整邮箱和实际密码，按第 2.1 节在本机验证一次密码登录。
4. 检查大小写、输入法和键盘布局。连续失败时先核对信息，避免触发账户锁定。
5. 核对账户具有远程桌面权限，且未被禁用、锁定或要求先更改密码。
6. 如果保存过旧密码，在 Windows App 中编辑该设备，更新凭据或改回“需要时询问”。

保留 NLA。遇到无密码 Microsoft 账户时，按第 2.1 节选择合适的密码登录方案；不需要通过禁用身份验证或允许空密码来解决。

### 6.4 Windows App 要求工作或学校账户

你可能进入了组织资源登录入口。返回设备页面，通过 **`+` → Add PC / 添加 PC** 添加自己的电脑即可。连接自己的 PC 不要求先登录 Windows App 的组织账户。

### 6.5 用了一段时间后突然失联

1. 先检查供电、网络、睡眠和 Windows 更新重启状态。
2. 打开 Tailscale 管理后台，查看设备是否密钥到期。
3. 如果是 Mac 到期，直接在 Mac 重新登录。
4. 如果是 Windows 到期且无法现场处理，后台在部分到期状态下会提供 **Temporarily extend key / 临时延长密钥**，或 **Reauthorize machine / 重新授权设备**。按实际页面提示处理，恢复连接后及时完成认证。
5. 官方说明中的临时延期通常提供 30 分钟窗口，不应把它当作长期解决方案。

不要在唯一的远程连接里贸然退出 Windows 的 Tailscale 账号或强制重新认证；这可能立即断开连接。涉及这类调整时，应先准备现场访问或其他恢复途径。

### 6.6 可以连接，但明显卡顿

1. 先降低 Windows App 的分辨率，关闭多显示器或不必要的音视频重定向。
2. 检查 Windows 所在网络的上传能力，以及 Mac 当前网络质量。
3. 优先让 Windows 使用网线，避免两端同时使用质量不稳定的无线网络。
4. Tailscale 可能直连，也可能经过中继；是否直连、网络距离和丢包都会影响体验。
5. 若熟悉 Tailscale 命令行，可查看 `tailscale status` 或 `tailscale ping` 的结果，辅助判断实际路径。命令是否可直接调用取决于安装方式。

本方案不保证任何网络环境下都能直连或达到固定延迟。最终应以实际要使用的软件操作体验为准。

### 6.7 能看见桌面，但文件、剪贴板或声音不可用

1. 编辑 Windows App 中的设备配置，检查相应重定向选项。
2. 检查 Mac 是否授予对应文件夹、麦克风等权限，只开启你确实需要的功能。
3. 修改后断开并重新连接。
4. 如果 Windows 受到组织策略管理，相应功能可能被策略禁止。

## 7. 停用或恢复原设置

根据需要执行对应操作，不必一次全部执行：

- **停止接受远程桌面连接：**在 Windows 的“设置 → 系统 → 远程桌面”关闭开关。
- **撤销持久设备访问：**在 Tailscale 管理后台撤销/移除对应设备，之后需要重新认证才能加入。
- **恢复定期认证：**对设备选择 `Enable key expiry`。
- **撤销无人值守：**在 Windows Tailscale 的 Preferences 中取消 `Run unattended`；这会影响注销或重启后的可达性。
- **恢复电源习惯：**将睡眠、休眠和合盖设置改回原先值。
- **移除本指南新增的防火墙例外：**仅禁用或删除自己创建的、名称以 `RDP from my Mac via Tailscale` 开头的规则。
- **撤销某个账户的远程权限：**从“远程桌面用户”中移除该账户。若还要删除专用本地账户，应先备份它的文件；删除用户可能一并删除其用户数据。

如果你正在通过本方案远程连接，关闭远程桌面、撤销 Tailscale 或更改网络可能立即切断当前会话。应在可现场恢复时进行。

## 8. 最终检查清单

- [ ] Windows 是专业版，远程桌面已启用，NLA 保持开启。
- [ ] 已确认正确的 Windows 用户名和非空账户密码，并授予远程登录权限。
- [ ] 两台 Tailscale 使用同一登录方式、同一账号，设备在同一网络内在线。
- [ ] Windows 已启用 Tailscale 无人值守。
- [ ] Windows 的睡眠、休眠、供电、网络和必要的合盖设置已处理。
- [ ] 已记录 Windows 的 Tailscale IPv4，Windows App 使用该地址并设为无网关。
- [ ] 已处理 Windows 设备密钥到期策略，并了解对应取舍。
- [ ] 已在不同网络上实际登录并操作需要的软件。
- [ ] 已验证注销后、重启后、空闲后能够重新连接。
- [ ] 如有需要，剪贴板、文件传输、声音或多显示器已单独实测。
- [ ] 已了解断电、关机、启动前解锁及网络人工认证不由此方案解决。

## 9. 官方参考资料

以下为编写时核对的主要资料；界面或套餐变化时，以最新官方说明为准。

1. [Tailscale：使用 Windows RDP 访问远程桌面](https://tailscale.com/docs/solutions/access-remote-desktops-using-windows-rdp)
2. [Tailscale：Windows 安装](https://tailscale.com/docs/install/windows)
3. [Tailscale：macOS 安装](https://tailscale.com/docs/install/mac)
4. [Tailscale：未登录时保持运行 / 无人值守](https://tailscale.com/docs/how-to/run-unattended)
5. [Tailscale：设备密钥到期](https://tailscale.com/docs/features/access-control/key-expiry)
6. [Tailscale：Windows RDP 密码登录问题](https://tailscale.com/docs/reference/troubleshooting/windows/windows-rdp-login-issue)
7. [Tailscale：套餐与价格](https://tailscale.com/pricing)
8. [微软：启用远程桌面及 NLA](https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/remotepc/remote-desktop-allow-access)
9. [微软：Windows App 连接设备与远程 PC](https://learn.microsoft.com/en-us/windows-app/get-started-connect-devices-desktops-apps?tabs=macos&pivots=remote-pc)
10. [微软：Windows App 账户和保存的凭据](https://learn.microsoft.com/en-us/windows-app/user-account-settings-add-remove-manage?tabs=macos&pivots=remote-pc)
11. [Mac App Store：Windows App](https://apps.apple.com/app/windows-app/id1295203466)
