# DeepWatch

[English](README.md) | [简体中文](README.zh-CN.md)

把每个视频变成一份可以深入学习的资料。DeepWatch 把字幕、双语翻译、AI 概览、内容讲解、时间戳笔记，以及一个懂视频内容的聊天功能，全部放进同一个 Chrome 侧边栏，让你可以持续学习视频中的知识和语言，同时不丢失原视频上下文。

- 直接从视频所在网页免费抓取字幕，做成可阅读、可搜索的学习资料，不依赖任何第三方字幕服务，也不需要字幕 API 密钥。
- 通过原文字幕、简体中文翻译，或对齐的双语视图学习语言。
- 借助 AI 概览、章节、金句摘录和划词解释加深理解。
- 在 Chat 标签页里选中字幕中的任意词句提问，或直接自由提问；支持点词跳转视频位置，并随播放实时高亮当前朗读的词。
- 通过点击 Transcript、Overview、Notes 或 Chat 里的时间戳，在长视频中快速跳转。
- 保存整理好的时间戳笔记留待复习，也可以按视频导出聊天记录。
- 使用你自己的 Gemini API 密钥和本地 Chrome 存储掌控数据，没有分析或遥测。

Gemini API 密钥是可选的，不是必须条件：字幕和笔记功能不需要任何密钥就能完整使用。只有 AI 相关功能（概览、翻译、划词解释、Chat）才需要密钥，没配置的话，这几个功能会各自提示你去设置页面添加，不会影响其他功能。

DeepWatch 是一个从 GitHub 本地安装、使用你自己 API 密钥的项目。它不在 Chrome 网上应用店上架，不附带 API 额度，也不运行开发者自己的服务器。

DeepWatch 是 [zarazhangrui/youtube-digest](https://github.com/zarazhangrui/youtube-digest) 的一个 fork 改造项目，大部分功能都来自这个原始项目。改了哪些地方见下方的[致谢](#致谢)部分。

## 用编程 Agent 安装

你不需要懂代码或使用命令行。把下面这段话发给你的编程 Agent 即可：

> 请把这个项目下载或克隆到我选择的一个长期保留的文件夹里，告诉我准确的完整路径，之后 Chrome「加载已解压的扩展程序」也要用这同一个文件夹。如果我在第一次安装时需要位置建议，可以在 macOS 或 Linux 上提议 `~/Documents/deep-watch`，在 Windows 上提议 `%USERPROFILE%\Documents\deep-watch`，但不要假设我一定使用这些路径。用简单易懂的方式带我完成安装和配置。

你的 Agent 应该做到：

1. 询问你想把项目放在哪里，下载或克隆到那里，并告诉你准确的完整路径。如果你需要建议，可以在 macOS 或 Linux 上提议 `~/Documents/deep-watch`，在 Windows 上提议 `%USERPROFILE%\Documents\deep-watch`。
2. 打开下面的 Google AI Studio 官方页面，帮你创建自己的 Gemini API 密钥。
3. 带你在 Chrome 里用「加载已解压的扩展程序」选择你刚才确定的那个准确项目文件夹。
4. 告诉你该在扩展的「设置」页面里的哪个位置填写 API 密钥。
5. 打开一个带字幕的视频，确认字幕和翻译功能正常。

安装完成后，请把这个文件夹留在原地。如果移动或删除源代码文件夹，Chrome 中加载的扩展会失效，需要从新的位置重新加载。

不要把 API 密钥粘贴进 AI 聊天、源代码文件、截图或公开消息里。请自己直接在 DeepWatch 的设置页面里填写密钥。你的编程 Agent 可以帮你指出正确的填写位置，但不需要看到密钥本身。

## 手动安装

如果你想自己动手：

1. 打开本项目的 GitHub 页面。
2. 选择 **Code**，然后 **Download ZIP**。
3. 选择一个长期保留的文件夹并在那里解压。可选建议是 macOS 或 Linux 上的 `~/Documents/deep-watch`，或 Windows 上的 `%USERPROFILE%\Documents\deep-watch`。你也可以使用其他文件夹。
4. 在 Chrome 中打开 `chrome://extensions`。
5. 打开右上角的「开发者模式」。
6. 点击「加载已解压的扩展程序」。
7. 选择你刚才确定的那个准确项目文件夹，其中必须包含 `manifest.json`。
8. 如果想要快速访问，可以从 Chrome 的扩展菜单里固定 DeepWatch。

因为这是一个未打包的扩展，它不会自动更新。每次下载更新或修改本地文件后，请在 `chrome://extensions` 的 DeepWatch 卡片上点击「重新加载」，然后刷新已打开的视频标签页。移动或删除源代码文件夹，会导致已加载的扩展失效，需要从新的位置重新加载。

## 配置你的 Gemini API 密钥（可选）

这一步是可选的，字幕和笔记功能不需要任何密钥就能完整使用。DeepWatch 只在使用 AI 相关功能（生成概览、解释内容、翻译字幕、润色笔记、聊天）时，才需要一个属于你自己 Google 账号的密钥。

1. 打开官方的 [Google AI Studio API 密钥页面](https://aistudio.google.com/apikey)。
2. 用你的 Google 账号登录并创建一个 API 密钥。
3. 复制密钥，粘贴到 DeepWatch 设置页面的「Gemini API key」里。
4. 如果不想用默认的快速低成本模型，可以在设置页面里修改「Gemini model」；可参考[可用的 Gemini 模型列表](https://ai.google.dev/gemini-api/docs/models)。
5. 如果 Google 提示配额或账单问题，请到 Google AI Studio 检查你的用量和限额后再试。

从侧边栏打开「设置」。你也可以在 `chrome://extensions` 的 DeepWatch 卡片上，或右键点击工具栏图标，打开 DeepWatch 的「选项」页面。只在这个设置字段里粘贴密钥。不要把密钥粘贴进 AI 聊天、仓库文件、截图或公开消息里。

密钥和设置都保存在你设备上 Chrome 的本地扩展存储中。

## 使用 DeepWatch

1. 打开一个带字幕的标准视频页面。
2. 点击 DeepWatch 扩展图标，或视频自带的分享/收藏按钮旁边的「Digest」按钮，打开侧边栏。
3. 阅读带时间戳的字幕，或者切换到「原文」「中文」「双语」。
4. 打开「Overview」查看 AI 生成的章节和金句摘录。
5. 选中字幕文本可以获得 AI 解释。
6. 把鼠标移到视频上点击「Note」，或在视频获得焦点时按下 **n** 键，保存一条带时间戳的笔记；之后可以在「Notes」里查看。
7. 打开「Chat」，选中字幕中的一个词或一句话快速提问，或直接自由提问关于这个视频的任何问题。点击任意单词即可跳转到对应视频位置，播放时当前朗读的词也会实时高亮。想保留对话时，可以在 Chat 标签页里把它导出为 JSON。

## 目前支持的范围

- Google Chrome 116 及以上版本，使用 Side Panel API。
- 标准的 YouTube `youtube.com/watch` 视频页面。
- 视频播放器自己列出的原生字幕轨道。DeepWatch 会优先选择英文（如果有），否则可能显示其他原生语言。
- 原文、简体中文，以及对齐的双语字幕视图。
- AI 概览、划词解释、翻译、自动笔记润色，以及懂视频内容的聊天功能。
- 本地笔记、按视频保存的本地聊天记录，以及最近字幕和摘要结果的本地缓存。
- 所有 AI 功能统一使用 Google Gemini，模型可在设置页面里配置。

Shorts 短视频、直播、私享或受限访问的视频，以及没有原生字幕的视频可能无法使用。目前未测试或不支持 Firefox、Safari、移动端浏览器和其他 Chromium 浏览器。

## 字幕抓取原理

DeepWatch 直接从视频所在网页读取字幕：视频播放器一加载完成，就已经列出了它所有可用的字幕轨道（语言，以及去哪里获取），无论你有没有打开字幕显示。DeepWatch 读取这份列表，然后自己去抓取对应的字幕轨道，全程免费，不需要字幕 API 密钥，也不经过任何第三方字幕服务。具体实现见 `transcript/youtube.js`，其中的注释也说明了这种方式和「被动等播放器自己发出字幕请求」的旧方式有什么区别。

每个支持的网站都有自己独立的一个适配器文件，返回同样的数据格式，因此以后要支持新的视频网站，只需要新增一个文件，不需要改动其余部分如何使用字幕数据的逻辑。

## Gemini 计费说明

DeepWatch 不收取任何费用，也不转售访问权限；你的 Gemini 用量由 Google 直接根据你自己的账号计费。请查看官方的 [Gemini API 价格页面](https://ai.google.dev/gemini-api/docs/pricing)，了解你在设置里选择的模型当前的价格，如果需要，也可以在 Google AI Studio 里设置消费限额。

## 用编程 Agent 改造它

这是一个个人改造项目。不接受上游 Issue 或 Pull Request。如果遇到问题或想要新功能，请下载或 fork 一份自己的副本，让你的编程 Agent 帮你修复、改造或个性化定制。

DeepWatch 使用纯 HTML、CSS 和 JavaScript，没有构建步骤，很适合作为 Agent 协作项目的起点。可以尝试的方向：

- 在 `transcript/youtube.js` 旁边新增另一个视频网站的字幕适配器。
- 增加更多翻译语言，让每个人可以选择自己想学习的语言。
- 为讲座、访谈、教程、评测或研究分享创建定制化的摘要模板。
- 做一个生词本，保存单词、所在句子、含义和视频时间戳。
- 把笔记和生词导出成 Markdown、CSV、Anki 或其他学习工具的格式。
- 增加个人主题过滤器，突出显示与某个学习目标最相关的章节。
- 增加可选的本地模型支持，获得不同的隐私和成本权衡。
- 增加键盘导航、字体控制和更高对比度的主题，提升可访问性。

如果你想换成另一个 AI 服务或模型，请先在编程 Agent 中打开 Chrome 通过「加载已解压的扩展程序」使用的那个准确的 DeepWatch 项目文件夹。然后打开 DeepWatch 设置，在「本地改造」里使用「复制编辑后的提示词」。发送前请把 `[PROVIDER]` 替换掉。不要在提示词或聊天中包含任何 API 密钥。等 Agent 更新完你的本地副本后，再按它指出的位置自己填写密钥。

## 致谢

DeepWatch 是 [zarazhangrui/youtube-digest](https://github.com/zarazhangrui/youtube-digest) 的一个 fork 改造项目，原项目由 Zara Zhang 以 MIT 协议开源（见 [LICENSE](LICENSE)）。DeepWatch 的大部分功能、界面和整体结构都直接来自这个项目：Digest 按钮、Note 按钮和它的 "n" 键快捷方式、Transcript / Overview / Notes 三个标签页、原文 / 中文 / 双语这几种显示模式，以及这个 fork 继续沿用的发布工具和测试用例。

这个 fork 主要改了三件事：

- 字幕抓取不再依赖 Supadata API，改成直接从视频所在网页读取字幕，完全免费，也不需要字幕 API 密钥（见 `transcript/youtube.js`）。
- 所有 AI 功能（概览、解释、翻译、笔记润色）从 DeepSeek 换成了 Google Gemini，模型可以在设置页面里配置。
- 新增了 Chat 标签页：可以逐词点击的字幕视图、点词跳转、实时高亮，按视频保存的 Gemini 对话，以及导出为 JSON。

上游（youtube-digest）不接受针对这个 fork 的 Issue 或 Pull Request；如果这里出了问题，请按 youtube-digest 自己 README 里建议的方式，下载自己的副本，让编程 Agent 帮你修复。

## 隐私与数据流向

DeepWatch 直接从扩展本身发起请求：

1. 它从你标签页里已经打开的视频播放器读取字幕轨道列表，并直接从视频所在网站抓取字幕。
2. 当你使用 AI 功能时，它会把字幕和相关视频元数据发送给 Gemini。
3. 各个功能只发送它需要的内容，比如带上下文的选中文本、用于翻译的小批量字幕，或者你的聊天消息。
4. 它把你的密钥、设置、笔记、聊天记录和最近的缓存内容都保存在本地 Chrome 中。

DeepWatch 没有账号系统、广告、分析或遥测。Google 仍会按照它自己的条款和隐私政策处理这些数据。详见 [PRIVACY.md](PRIVACY.md)。

## 疑难排查

### 视频页面没有显示 Digest 按钮

- 在 `chrome://extensions` 中找到 DeepWatch，点击「重新加载」，然后刷新视频标签页。
- 确认你所在的是标准的 `https://www.youtube.com/watch?...` 页面，而不是 Shorts、内嵌播放器或直播页面。
- 当前版本会自动跟随 YouTube 响应式操作栏的变化，页面加载完成后请稍等片刻。
- 如果按钮仍然缺失，请让你的编程 Agent 检查该视频页面上的 content script。

### 侧边栏无法打开

- 确认你所在的是标准的 `https://www.youtube.com/watch?...` 页面。
- 在 `chrome://extensions` 中确认 DeepWatch 已启用，并点击「重新加载」。
- 重新加载扩展后，请刷新视频标签页。
- 如果问题仍然存在，请让你的编程 Agent 检查这个扩展。

### 找不到字幕

- 先点一下 YouTube 自己的「显示文字记录」按钮（在视频简介下方，或"更多"菜单里），确认这个视频本身有没有文字记录。DeepWatch 读取的就是这个面板显示的内容，如果它自己也一直转圈或者显示为空，说明是 YouTube 的文字记录功能在你的浏览器里对这个视频本身就失败了，不是 DeepWatch 能绕过的问题。通常不是所有视频都会这样，可以换几个视频对比看看。
- 重新加载视频标签页，再重新打开侧边栏，因为字幕是根据页面当前状态读取的。
- Shorts、直播和受限访问的视频可能没办法用这种方式获取文字记录。
