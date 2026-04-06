# autoresearch-xhs

基于 [karpathy/autoresearch](https://github.com/karpathy/autoresearch) 框架的小红书自动化运营系统。

AI 生成内容 → 6 维度评分 → 手动发布 → 数据追踪 → 策略迭代

## 功能特性

- **AI 内容生成**：基于爆款数据分析生成高质量小红书内容
- **6 维度评分体系**：量化评估内容质量
- **实验循环迭代**：快速试错，保留有效策略
- **爆款数据分析**：提取高互动内容的共同规律
- **支持多种 AI 模型**：OpenAI / Anthropic Claude / MiniMax

## 项目结构

```
autoresearch-xhs/
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   └── ContentCard.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx      # 首页概览
│   │       ├── Generator.jsx      # 内容生成
│   │       ├── Scorer.jsx         # 内容评分
│   │       ├── History.jsx         # 实验历史
│   │       └── Trending.jsx        # 爆款分析
│   └── ...
├── api_server.py           # FastAPI 后端服务
├── scorer.py               # 6 维度评分引擎
├── content_engine.py       # AI 内容生成引擎
├── prepare.py              # 数据准备工具
├── experiment_loop.py      # 实验循环入口
├── program.md              # 运营策略协议
├── prompts/                # 提示词模板
│   ├── generator.md
│   └── analyzer.md
├── data/
│   ├── trending/           # 爆款数据
│   └── experiments/        # 实验记录
└── output/                 # 生成内容输出
```

## 快速开始

### 1. 安装依赖

```bash
# 克隆项目
git clone https://github.com/tasyskybenjamin/AutoR_XHS.git
cd AutoR_XHS

# 安装 Python 依赖
pip3 install -r requirements.txt

# 安装前端依赖
cd frontend
npm install
```

### 2. 配置 API 密钥

选择以下任一 AI 提供商：

```bash
# Minimax（推荐国内用户）
export MINIMAX_API_KEY="your-minimax-api-key"

# OpenAI
export OPENAI_API_KEY="your-openai-api-key"

# Anthropic Claude
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### 3. 启动服务

启动后端 API 服务器：
```bash
cd /path/to/AutoR_XHS
python3 api_server.py
```

启动前端（新开终端窗口）：
```bash
cd /path/to/AutoR_XHS/frontend
npm run dev
```

### 4. 访问应用

打开浏览器访问：`http://localhost:5173`

## 6 维度内容评分体系

| 维度 | 评分标准 | 分值 |
|------|----------|------|
| 1 | 第一句话有具体数字或强反差 | 0-1 |
| 2 | 有生活化比喻 | 0-1 |
| 3 | 有具体可验证的数字 | 0-1 |
| 4 | 无"效果很好"等套话 | 0-1 |
| 5 | 结尾问句具体可回答 | 0-1 |
| 6 | 字数 150-600 | 0-1 |

**总分 ≥ 4.5 分** 才建议发布

## 使用流程

### 内容生成

1. 打开"内容生成"页面
2. 输入内容主题（如"春季护肤routine"）
3. 选择账号定位和实验目标
4. 点击"开始生成"
5. AI 会生成多个内容候选
6. 选择评分最高的候选手动发布

### 内容评分

1. 打开"内容评分"页面
2. 输入标题和正文
3. 点击"开始评分"
4. 查看 6 维度雷达图和总分
5. 根据改进建议优化内容

### 爆款分析

1. 将爆款笔记数据放入 `data/trending/notes.json`
2. 运行 `python prepare.py` 分析数据
3. 在"爆款分析"页面查看规律

## 命令行使用

```bash
# 内容生成
python3 experiment_loop.py "你的主题" -n 3

# 指定账号定位
python3 experiment_loop.py "护肤教程" --niche "美妆/穿搭/生活"

# 指定模型提供商
python3 experiment_loop.py "内容主题" --provider minimax

# 内容评分（单独使用）
python3 scorer.py
```

## 数据格式

### 爆款笔记数据 (data/trending/notes.json)

```json
[
  {
    "title": "笔记标题",
    "content": "笔记正文",
    "author": "作者",
    "likes": 1234,
    "collects": 567,
    "comments": 89,
    "tags": ["标签1", "标签2"],
    "url": "笔记链接"
  }
]
```

### 生成内容输出 (output/)

```json
{
  "title": "生成标题",
  "cover_text": "封面文案",
  "content": "正文内容",
  "tags": ["标签1", "标签2"],
  "score": 5.2,
  "dimension_scores": {
    "opening_hook": 1.0,
    "life_metaphor": 0.8,
    "verifiable_numbers": 1.0,
    "no_cliches": 1.0,
    "specific_question": 0.7,
    "word_count": 1.0
  }
}
```

## 运营策略要点

### 爆款标题公式

```
公式1: [数字] + [效果] + [动作]
  例：7天淡纹，我找到了平价替代

公式2: [身份] + [反差] + [解决方案]
  例：作为一个油皮，我终于找到了不脱妆的秘诀

公式3: [疑问] + [答案]
  例：为什么你涂口红显老？问题出在这里
```

### 成功标准

- 点赞率 > 5%
- 收藏率 > 3%
- 评论率 > 1%

连续 3 次实验得分 < 4 分时，重新分析爆款数据调整策略。

## 技术栈

- **前端**: React 18 + Vite + Tailwind CSS + Recharts
- **后端**: Python 3 + FastAPI + Uvicorn
- **AI 模型**: OpenAI GPT / Anthropic Claude / MiniMax

## License

MIT
