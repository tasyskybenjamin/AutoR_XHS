"""
小红书内容评分器
基于 6 维度评分体系评估内容质量
"""

import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class ScoreResult:
    """评分结果"""
    total_score: float      # 总分 (0-6)
    dimension_scores: dict  # 各维度得分
    dimension_details: dict # 各维度详细分析
    feedback: str           # 改进建议


class ContentScorer:
    """
    6 维度评分体系：

    1. 第一句话有没有具体数字或强反差？
    2. 有没有用日常生活的比喻解释技术概念？
    3. 有没有具体可验证的数字（不是"效果很好"这类空话）？
    4. 有没有出现"在当今AI飞速发展""改变游戏规则"这类套话？
    5. 结尾的互动问句够不够具体，用户能直接回答吗？
    6. 字数在 150-600 字之间吗？
    """

    # 套话黑名单
    CLICHES = [
        "在当今", "飞速发展", "改变游戏规则", "重磅来袭", "震撼发布",
        "不得不看", "不看后悔", "绝了", "太牛了", "YYDS",
        "绝绝子", "救命", "哭死", "笑死", "姐妹们冲",
        "家人们谁懂啊", "作为一个", "相信我", "真的绝",
        "效果很好", "非常好", "特别棒", "超级有用",
    ]

    # 强反差词
    CONTRAST_WORDS = [
        "但是", "然而", "居然", "竟然", "万万没想到",
        "从xx到xx", "从0到1", "从无到有",
        "别人xx，我却xx", "不像", "不像表面",
    ]

    def __init__(self):
        self.dimension_names = [
            "opening_hook",      # 维度1: 开场钩子
            "life_metaphor",     # 维度2: 生活比喻
            "verifiable_numbers", # 维度3: 可验证数字
            "no_cliches",        # 维度4: 无套话
            "specific_question", # 维度5: 具体问句
            "word_count",        # 维度6: 字数范围
        ]

    def score(self, title: str, content: str) -> ScoreResult:
        """
        评估内容质量

        Args:
            title: 标题
            content: 正文

        Returns:
            ScoreResult: 评分结果
        """
        full_text = f"{title}\n{content}"

        scores = {}
        details = {}

        # 维度1: 第一句话有没有具体数字或强反差
        scores["opening_hook"], details["opening_hook"] = self._score_opening_hook(full_text)

        # 维度2: 有没有用日常生活的比喻
        scores["life_metaphor"], details["life_metaphor"] = self._score_life_metaphor(content)

        # 维度3: 有没有具体可验证的数字
        scores["verifiable_numbers"], details["verifiable_numbers"] = self._score_verifiable_numbers(content)

        # 维度4: 有没有出现套话
        scores["no_cliches"], details["no_cliches"] = self._score_no_cliches(full_text)

        # 维度5: 结尾问句是否具体
        scores["specific_question"], details["specific_question"] = self._score_specific_question(content)

        # 维度6: 字数是否在 150-600 之间
        scores["word_count"], details["word_count"] = self._score_word_count(content)

        total = sum(scores.values())
        feedback = self._generate_feedback(scores, details)

        return ScoreResult(
            total_score=total,
            dimension_scores=scores,
            dimension_details=details,
            feedback=feedback
        )

    def _score_opening_hook(self, text: str) -> tuple[float, str]:
        """维度1: 第一句话有没有具体数字或强反差"""
        first_sentence = text.split("。")[0].split("\n")[0]

        # 检查具体数字
        has_number = bool(re.search(r'\d+', first_sentence))

        # 检查强反差
        has_contrast = any(word in first_sentence for word in self.CONTRAST_WORDS)

        if has_number and has_contrast:
            return 1.0, "✓ 有数字 + 有强反差"
        elif has_number:
            return 0.7, "✓ 有具体数字"
        elif has_contrast:
            return 0.6, "✓ 有强反差"
        else:
            return 0.0, "✗ 第一句话缺乏数字或强反差"

    def _score_life_metaphor(self, content: str) -> tuple[float, str]:
        """维度2: 有没有用日常生活的比喻"""
        # 常见生活比喻关键词
        metaphor_patterns = [
            r'像.*一样', r'就像', r'跟.*似的', r'相当于',
            r'和.*一样', r'.*的感觉', r'仿佛', r'好似',
        ]

        metaphor_count = 0
        for pattern in metaphor_patterns:
            metaphor_count += len(re.findall(pattern, content))

        if metaphor_count >= 2:
            return 1.0, f"✓ 有{metaphor_count}处生活比喻"
        elif metaphor_count == 1:
            return 0.6, "✓ 有1处生活比喻"
        else:
            return 0.0, "✗ 缺乏生活比喻"

    def _score_verifiable_numbers(self, content: str) -> tuple[float, str]:
        """维度3: 有没有具体可验证的数字"""
        # 找具体数字（不是百分比、不是"几十"、"几百"这种模糊词）
        vague_number_patterns = [
            r'几十', r'几百', r'几千', r'很多', r'一些',
            r'大概', r'大约', r'左右', r'上下',
        ]

        # 精确数字
        precise_numbers = re.findall(r'\d+\.?\d*[万/亿/个/月/天/年/人]', content)

        # 排除模糊词
        clean_numbers = []
        for num in precise_numbers:
            is_vague = any(vague in num for vague in vague_number_patterns)
            if not is_vague:
                clean_numbers.append(num)

        # 检查是否有具体单位
        specific_units = ['小时', '天', '周', '月', '年', '分钟', '秒',
                         'cm', 'mm', '米', '斤', 'kg', '度', '元', '块']
        has_unit = any(unit in content for unit in specific_units)

        if len(clean_numbers) >= 2 and has_unit:
            return 1.0, f"✓ 有{len(clean_numbers)}个可验证数字"
        elif len(clean_numbers) >= 1:
            return 0.5, f"✓ 有{len(clean_numbers)}个可验证数字"
        else:
            return 0.0, "✗ 缺乏具体可验证的数字"

    def _score_no_cliches(self, text: str) -> tuple[float, str]:
        """维度4: 有没有出现套话"""
        found_cliches = []
        text_lower = text.lower()

        for cliche in self.CLICHES:
            if cliche in text_lower:
                found_cliches.append(cliche)

        if not found_cliches:
            return 1.0, "✓ 无套话"
        else:
            cliche_str = ", ".join(found_cliches[:3])
            return 0.0, f"✗ 包含套话: {cliche_str}"

    def _score_specific_question(self, content: str) -> tuple[float, str]:
        """维度5: 结尾问句是否具体"""
        # 获取最后一句话
        sentences = re.split(r'[。!?]', content)
        last_sentence = sentences[-2] if len(sentences) > 1 else sentences[-1]

        # 检查是否以问号结尾
        is_question = '?' in content or '？' in content

        if not is_question:
            return 0.0, "✗ 结尾不是问句"

        # 检查问句是否具体（不是泛泛而问）
        vague_questions = [
            "你们觉得呢", "你们同意吗", "是不是", "有没有",
            "好不好", "可以吗", "行不行", "怎么样",
        ]

        is_vague = any(vq in last_sentence for vq in vague_questions)

        # 具体问题的特征：有明确选项、有具体场景、可直接回答
        specific_patterns = [
            r'还是.*',  # A还是B
            r'会.*还是.*',  # 会...还是...
            r'.*吗.*',  # 带场景的问句
        ]

        has_specific = any(re.search(p, last_sentence) for p in specific_patterns)

        if is_vague:
            return 0.3, "△ 问句较泛泛"
        elif has_specific:
            return 1.0, "✓ 问句具体"
        else:
            return 0.5, "△ 问句有一定具体性"

    def _score_word_count(self, content: str) -> tuple[float, str]:
        """维度6: 字数是否在 150-600 之间"""
        char_count = len(content.replace(" ", "").replace("\n", ""))

        if 150 <= char_count <= 600:
            return 1.0, f"✓ 字数适中 ({char_count}字)"
        elif char_count < 150:
            ratio = char_count / 150
            return max(0, ratio), f"△ 字数偏少 ({char_count}字)"
        else:
            ratio = 600 / char_count
            return max(0, ratio), f"△ 字数偏多 ({char_count}字)"

    def _generate_feedback(self, scores: dict, details: dict) -> str:
        """生成改进建议"""
        feedbacks = []

        if scores["opening_hook"] < 0.5:
            feedbacks.append("💡 建议在开头加入具体数字或强反差词")

        if scores["life_metaphor"] < 0.5:
            feedbacks.append("💡 建议加入生活化比喻，让内容更亲切")

        if scores["verifiable_numbers"] < 0.5:
            feedbacks.append("💡 添加具体可验证的数字增强说服力")

        if scores["no_cliches"] < 0.5:
            feedbacks.append("💡 避免套话，用真实体验代替")

        if scores["specific_question"] < 0.5:
            feedbacks.append("💡 结尾问句要具体，给用户明确的回答选项")

        if scores["word_count"] < 0.8:
            feedbacks.append("💡 调整字数到 150-600 字范围内")

        if not feedbacks:
            return "✨ 内容质量良好！"

        return "\n".join(feedbacks)

    def print_report(self, result: ScoreResult):
        """打印评分报告"""
        print("=" * 50)
        print("📊 小红书内容评分报告")
        print("=" * 50)
        print(f"\n总分: {result.total_score}/6")

        print("\n各维度得分:")
        for dim, score in result.dimension_scores.items():
            dim_name = {
                "opening_hook": "1. 开场钩子",
                "life_metaphor": "2. 生活比喻",
                "verifiable_numbers": "3. 可验证数字",
                "no_cliches": "4. 无套话",
                "specific_question": "5. 具体问句",
                "word_count": "6. 字数范围",
            }[dim]
            bar = "█" * int(score * 5) + "░" * (5 - int(score * 5))
            print(f"  {dim_name}: {bar} ({score:.1f})")
            print(f"    {result.dimension_details[dim]}")

        print(f"\n改进建议:\n{result.feedback}")
        print("=" * 50)


def demo():
    """演示评分"""
    scorer = ContentScorer()

    # 示例内容
    sample_title = "从120斤到90斤，我做了这三件事"
    sample_content = """
减肥这件事，我走了太多弯路。直到我发现了这三个方法，30天瘦了20斤！

1. 早起喝温水（相当于给肠胃做个SPA）
2. 饭后站15分钟（就像给消化装了个加速器）
3. 把米饭换成糙米（口感像沙子但真的掉秤）

具体数据：每天摄入热量减少500大卡，蛋白质增加到每公斤体重1.2克，配合每周3次跑步，每次30分钟。

姐妹们，你们减肥踩过哪些坑？有没有和我一样试过这个方法的？评论区告诉我你的情况，是平台期还是刚开始减？
"""

    result = scorer.score(sample_title, sample_content)
    scorer.print_report(result)


if __name__ == "__main__":
    demo()
