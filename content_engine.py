"""
小红书内容生成引擎
基于爆款数据分析生成高质量内容
"""

import json
import os
from dataclasses import dataclass
from typing import Optional
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    import anthropic
except ImportError:
    anthropic = None

from scorer import ContentScorer, ScoreResult


@dataclass
class ContentCandidate:
    """内容候选"""
    title: str
    cover_text: str
    content: str
    score_result: ScoreResult
    tags: list[str]


@dataclass
class GenerationResult:
    """生成结果"""
    candidates: list[ContentCandidate]
    best_candidate: ContentCandidate
    analysis_summary: str


class ContentEngine:
    """
    内容生成引擎

    工作流程：
    1. 读取爆款数据分析结果
    2. 生成多个内容候选
    3. 评分排序
    4. 输出最优内容
    """

    def __init__(
        self,
        model: str = "gpt-4o",
        api_key: Optional[str] = None,
        model_provider: str = "openai"
    ):
        """
        初始化内容引擎

        Args:
            model: 模型名称
            api_key: API密钥（如果为None则从环境变量读取）
            model_provider: 模型提供商 ("openai" | "anthropic")
        """
        self.model = model
        self.model_provider = model_provider

        if model_provider == "openai":
            if OpenAI is None:
                raise ImportError("openai package not installed")
            self.client = OpenAI(api_key=api_key)
        elif model_provider == "anthropic":
            if anthropic is None:
                raise ImportError("anthropic package not installed")
            self.client = anthropic.Anthropic(api_key=api_key)
        else:
            raise ValueError(f"Unknown model provider: {model_provider}")

        self.scorer = ContentScorer()
        self.data_dir = Path("data")
        self.trending_dir = self.data_dir / "trending"

    def load_trending_analysis(self) -> dict:
        """加载爆款数据分析结果"""
        analysis_file = self.trending_dir / "analysis.json"

        if not analysis_file.exists():
            return {}

        with open(analysis_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def generate(
        self,
        topic: str,
        niche: str = "美妆/穿搭/生活",
        num_candidates: int = 3,
        target_goal: str = "提升点赞和收藏"
    ) -> GenerationResult:
        """
        生成内容候选

        Args:
            topic: 内容主题
            niche: 账号定位
            num_candidates: 生成候选数量
            target_goal: 本次实验目标

        Returns:
            GenerationResult: 生成结果
        """
        # 加载爆款分析
        trending = self.load_trending_analysis()

        # 构建提示词
        system_prompt = self._build_system_prompt(niche, target_goal)
        user_prompt = self._build_user_prompt(topic, trending, num_candidates)

        # 调用AI生成
        response = self._call_llm(system_prompt, user_prompt)

        # 解析结果
        candidates = self._parse_response(response, num_candidates)

        # 找出最优候选
        best = max(candidates, key=lambda x: x.score_result.total_score)

        # 生成分析摘要
        analysis = self._generate_analysis(trending, topic, best)

        return GenerationResult(
            candidates=candidates,
            best_candidate=best,
            analysis_summary=analysis
        )

    def _build_system_prompt(self, niche: str, target_goal: str) -> str:
        """构建系统提示词"""
        return f"""你是一个专业的小红书内容创作者，擅长写出高互动的爆款笔记。

账号定位：{niche}
本次目标：{target_goal}

内容要求：
1. 标题要有冲击力：包含具体数字或强反差
2. 善用生活化比喻解释概念
3. 添加具体可验证的数字
4. 避免套话：用真实体验代替
5. 结尾问句要具体，给用户明确回答选项
6. 字数控制在 150-600 字

输出格式（JSON）：
{{
    "candidates": [
        {{
            "title": "标题",
            "cover_text": "封面文案（10字以内）",
            "content": "正文内容",
            "tags": ["标签1", "标签2", "标签3"]
        }}
    ]
}}

注意：只输出JSON，不要有其他文字。"""

    def _build_user_prompt(
        self,
        topic: str,
        trending: dict,
        num_candidates: int
    ) -> str:
        """构建用户提示词"""
        prompt = f"请为以下主题生成 {num_candidates} 个不同风格的内容候选：\n\n主题：{topic}\n\n"

        if trending:
            prompt += "爆款数据分析：\n"
            if "top_patterns" in trending:
                prompt += f"常见模式：{', '.join(trending['top_patterns'][:5])}\n"
            if "top_words" in trending:
                prompt += f"高频词汇：{', '.join(trending['top_words'][:10])}\n"
            if "avg_likes" in trending:
                prompt += f"平均点赞：{trending['avg_likes']}\n"

        prompt += """
要求：
- 每个候选要有不同的切入点或风格
- 标题要吸引眼球但不夸张
- 正文要有干货价值
- 标签要精准（3-5个）
"""

        return prompt

    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        """调用LLM"""
        if self.model_provider == "openai":
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,
                max_tokens=4000
            )
            return response.choices[0].message.content

        elif self.model_provider == "anthropic":
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4000,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.content[0].text

    def _parse_response(
        self,
        response: str,
        num_candidates: int
    ) -> list[ContentCandidate]:
        """解析LLM响应"""
        # 尝试提取JSON
        json_str = self._extract_json(response)

        try:
            data = json.loads(json_str)
            candidates_data = data.get("candidates", [])
        except json.JSONDecodeError:
            # 如果解析失败，生成一个默认候选
            candidates_data = [{"title": response[:50], "cover_text": "", "content": response, "tags": []}]

        candidates = []
        for cd in candidates_data[:num_candidates]:
            title = cd.get("title", "")
            content = cd.get("content", "")
            cover_text = cd.get("cover_text", "")
            tags = cd.get("tags", [])

            # 评分
            score_result = self.scorer.score(title, content)

            candidates.append(ContentCandidate(
                title=title,
                cover_text=cover_text,
                content=content,
                score_result=score_result,
                tags=tags
            ))

        return candidates

    def _extract_json(self, text: str) -> str:
        """从文本中提取JSON"""
        # 尝试找 ```json ... ``` 包裹的内容
        import re

        # 匹配 ```json ... ```
        match = re.search(r'```json\s*([\s\S]*?)\s*```', text)
        if match:
            return match.group(1)

        # 匹配 ``` ... ```
        match = re.search(r'```\s*([\s\S]*?)\s*```', text)
        if match:
            return match.group(1)

        # 尝试直接解析整个文本
        return text

    def _generate_analysis(
        self,
        trending: dict,
        topic: str,
        best: ContentCandidate
    ) -> str:
        """生成分析摘要"""
        analysis = f"""
📊 内容生成分析报告
{'=' * 40}

主题: {topic}

最优候选评分: {best.score_result.total_score}/6

各维度得分:
"""
        for dim, score in best.score_result.dimension_scores.items():
            analysis += f"  - {dim}: {score:.1f}\n"

        if trending:
            analysis += f"\n参考爆款数据:\n"
            if "avg_likes" in trending:
                analysis += f"  - 平均点赞: {trending['avg_likes']}\n"
            if "top_patterns" in trending:
                analysis += f"  - 热门模式: {', '.join(trending['top_patterns'][:3])}\n"

        return analysis

    def save_output(self, result: GenerationResult, topic: str):
        """保存输出到文件"""
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)

        # 保存每个候选
        for i, candidate in enumerate(result.candidates):
            output = {
                "rank": i + 1,
                "title": candidate.title,
                "cover_text": candidate.cover_text,
                "content": candidate.content,
                "tags": candidate.tags,
                "score": candidate.score_result.total_score,
                "dimension_scores": candidate.score_result.dimension_scores,
                "feedback": candidate.score_result.feedback
            }

            filename = output_dir / f"{topic}_{i+1}.json"
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(output, f, ensure_ascii=False, indent=2)

        # 保存最优候选
        best_output = {
            "title": result.best_candidate.title,
            "cover_text": result.best_candidate.cover_text,
            "content": result.best_candidate.content,
            "tags": result.best_candidate.tags,
            "score": result.best_candidate.score_result.total_score,
            "analysis": result.analysis_summary
        }

        with open(output_dir / f"{topic}_best.json", "w", encoding="utf-8") as f:
            json.dump(best_output, f, ensure_ascii=False, indent=2)

    def print_result(self, result: GenerationResult):
        """打印结果"""
        print("\n" + "=" * 60)
        print("📝 内容生成结果")
        print("=" * 60)

        for i, candidate in enumerate(result.candidates):
            rank = "🥇" if i == 0 else "🥈" if i == 1 else "🥉"
            print(f"\n{rank} 候选 {i+1} (评分: {candidate.score_result.total_score}/6)")
            print("-" * 40)
            print(f"标题: {candidate.title}")
            print(f"封面: {candidate.cover_text}")
            print(f"正文:\n{candidate.content}")
            print(f"标签: {', '.join(candidate.tags)}")
            print(f"\n改进建议: {candidate.score_result.feedback}")

        print("\n" + "=" * 60)
        print("🏆 最优推荐")
        print("=" * 60)
        best = result.best_candidate
        print(f"\n标题: {best.title}")
        print(f"封面: {best.cover_text}")
        print(f"\n正文:\n{best.content}")
        print(f"\n标签: {', '.join(best.tags)}")
        print(f"\n评分详情:")
        best.score_result.print_report()


def demo():
    """演示内容生成"""
    # 检查是否有API密钥
    api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        print("⚠️ 未设置 API 密钥，使用模拟模式演示")
        print("请设置 OPENAI_API_KEY 或 ANTHROPIC_API_KEY 环境变量")
        return

    # 初始化引擎
    provider = "anthropic" if os.environ.get("ANTHROPIC_API_KEY") else "openai"
    engine = ContentEngine(model_provider=provider)

    # 生成内容
    result = engine.generate(
        topic="春季护肤routine分享",
        niche="美妆/穿搭/生活",
        num_candidates=3,
        target_goal="提升点赞和收藏"
    )

    # 打印结果
    engine.print_result(result)

    # 保存输出
    engine.save_output(result, "春季护肤routine")


if __name__ == "__main__":
    demo()
