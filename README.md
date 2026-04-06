# autoresearch-xhs

基于 [karpathy/autoresearch](https://github.com/karpathy/autoresearch) 框架的小红书自动化运营系统。

AI 生成内容 → 6 维度评分 → 手动发布 → 数据追踪 → 策略迭代

## 项目结构

```
autoresearch-xhs/
├── scorer.py              # 6 维度内容评分器
├── content_engine.py     # AI 内容生成引擎
├── prepare.py             # 数据准备：爬虫 + 分析
├── experiment_loop.py     # 实验循环入口
├── program.md             # 运营策略协议
├── prompts/               # 提示词模板
│   ├── generator.md
│   └── analyzer.md
├── data/
│   ├── trending/          # 爆款笔记数据
│   └── experiments/        # 实验记录
└── output/                # 生成的内容输出
```

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 设置 API 密钥

```bash
export OPENAI_API_KEY="sk-..."  # 或
export ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. 准备数据（可选）

```bash
# 手动将爆款笔记数据放入 data/trending/notes.json
# 然后运行分析
python prepare.py
```

### 4. 生成内容

```bash
# 交互模式
python experiment_loop.py "春季护肤routine分享"

# 指定参数
python experiment_loop.py "显瘦穿搭技巧" -n 5 --goal "提升收藏"
```

## 内容评分体系

| 维度 | 评分标准 | 分值 |
|------|----------|------|
| 1 | 第一句话有具体数字或强反差 | 0-1 |
| 2 | 有生活化比喻 | 0-1 |
| 3 | 有具体可验证的数字 | 0-1 |
| 4 | 无套话 | 0-1 |
| 5 | 结尾问句具体 | 0-1 |
| 6 | 字数 150-600 | 0-1 |

**总分 ≥ 4.5 分** 才建议发布

## 工作流程

```
爆款数据 → 分析规律 → 生成候选 → 评分排序 → 用户审核 → 手动发布 → 追踪结果 → 迭代优化
```

## License

MIT
