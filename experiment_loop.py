"""
实验循环入口
执行完整的内容生成 → 评分 → 输出流程
"""

import os
import sys
from datetime import datetime
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from content_engine import ContentEngine
from scorer import ContentScorer


def run_experiment(
    topic: str,
    niche: str = "美妆/穿搭/生活",
    num_candidates: int = 3,
    target_goal: str = "提升点赞和收藏",
    model_provider: str = None
):
    """
    运行单次内容生成实验

    Args:
        topic: 内容主题
        niche: 账号定位
        num_candidates: 生成候选数量
        target_goal: 实验目标
        model_provider: 模型提供商 ("openai" | "anthropic")
    """
    print("\n" + "=" * 60)
    print(f"🚀 开始实验: {topic}")
    print("=" * 60)

    # 自动检测模型提供商
    if model_provider is None:
        if os.environ.get("ANTHROPIC_API_KEY"):
            model_provider = "anthropic"
        elif os.environ.get("OPENAI_API_KEY"):
            model_provider = "openai"
        else:
            print("❌ 未设置 API 密钥")
            print("请设置 OPENAI_API_KEY 或 ANTHROPIC_API_KEY 环境变量")
            return None

    # 选择模型
    model = "claude-sonnet-4-20250514" if model_provider == "anthropic" else "gpt-4o"

    print(f"使用模型: {model} ({model_provider})")

    # 初始化引擎
    try:
        engine = ContentEngine(
            model=model,
            model_provider=model_provider
        )
    except ImportError as e:
        print(f"❌ 缺少依赖: {e}")
        print("请运行: pip install openai anthropic")
        return None

    # 生成内容
    print("\n📝 正在生成内容...")
    try:
        result = engine.generate(
            topic=topic,
            niche=niche,
            num_candidates=num_candidates,
            target_goal=target_goal
        )
    except Exception as e:
        print(f"❌ 生成失败: {e}")
        return None

    # 打印结果
    engine.print_result(result)

    # 保存输出
    safe_topic = topic.replace("/", "_").replace(" ", "_")[:20]
    engine.save_output(result, safe_topic)
    print(f"\n💾 结果已保存到 output/ 目录")

    # 记录到 results.tsv
    record_experiment(topic, result)

    return result


def record_experiment(topic: str, result):
    """
    记录实验结果到 results.tsv
    """
    results_dir = Path("data") / "experiments"
    results_dir.mkdir(parents=True, exist_ok=True)

    tsv_file = results_dir / "results.tsv"

    # 获取当前时间
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    # 写入 TSV
    with open(tsv_file, "a", encoding="utf-8") as f:
        for candidate in result.candidates:
            row = [
                timestamp,
                topic,
                candidate.title.replace("\t", " "),
                str(candidate.score_result.total_score),
                "",  # viral_score (待补充)
                "",  # likes (待补充)
                "",  # collects (待补充)
                "",  # comments (待补充)
                ""   # verdict (待补充)
            ]
            f.write("\t".join(row) + "\n")


def main():
    """主入口"""
    import argparse

    parser = argparse.ArgumentParser(description="小红书内容生成实验")
    parser.add_argument("topic", nargs="?", default="春季护肤routine分享",
                        help="内容主题")
    parser.add_argument("--niche", default="美妆/穿搭/生活",
                        help="账号定位")
    parser.add_argument("-n", "--num", type=int, default=3,
                        help="生成候选数量")
    parser.add_argument("--goal", default="提升点赞和收藏",
                        help="实验目标")
    parser.add_argument("--provider", choices=["openai", "anthropic"],
                        help="模型提供商")

    args = parser.parse_args()

    run_experiment(
        topic=args.topic,
        niche=args.niche,
        num_candidates=args.num,
        target_goal=args.goal,
        model_provider=args.provider
    )


if __name__ == "__main__":
    main()
