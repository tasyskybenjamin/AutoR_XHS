"""
数据准备工具
用于爬取和分析小红书爆款数据
"""

import json
import os
import re
import time
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("请安装依赖: pip install requests beautifulsoup4")
    requests = None
    BeautifulSoup = None


@dataclass
class NoteData:
    """笔记数据"""
    title: str
    content: str
    author: str
    likes: int
    collects: int
    comments: int
    tags: list[str]
    url: str
    timestamp: str


class XHS_scraper:
    """
    小红书爆款数据爬虫

    注意：此爬虫仅用于学习和研究目的
    请遵守小红书 robots.txt 和使用条款
    """

    def __init__(self, cookie: Optional[str] = None):
        """
        初始化爬虫

        Args:
            cookie: 小红书 Cookie（可选，用于获取更完整数据）
        """
        self.session = requests.Session() if requests else None
        self.cookie = cookie

        if self.session and cookie:
            self.session.cookies.set("cookie", cookie)

        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "application/json",
            "Accept-Language": "zh-CN,zh;q=0.9",
        }

    def search(
        self,
        keyword: str,
        num_results: int = 20,
        sort: str = "popular"
    ) -> list[NoteData]:
        """
        搜索爆款笔记

        Args:
            keyword: 搜索关键词
            num_results: 返回数量
            sort: 排序方式 ("popular" | "latest")

        Returns:
            list[NoteData]: 笔记数据列表
        """
        if not requests:
            print("requests 库未安装")
            return []

        notes = []
        page = 1

        while len(notes) < num_results:
            url = f"https://www.xiaohongshu.com/explore"
            params = {
                "keyword": keyword,
                "type": "51",
                "page": page,
                "sort": sort if sort == "popular" else "default",
            }

            try:
                response = self.session.get(
                    url,
                    headers=self.headers,
                    params=params,
                    timeout=10
                )

                if response.status_code == 200:
                    # 解析响应（实际需要根据真实API调整）
                    parsed = self._parse_search_response(response.text)
                    notes.extend(parsed)

                page += 1
                time.sleep(1)  # 避免请求过快

            except Exception as e:
                print(f"请求失败: {e}")
                break

        return notes[:num_results]

    def _parse_search_response(self, html: str) -> list[NoteData]:
        """解析搜索响应"""
        notes = []

        if not BeautifulSoup:
            return notes

        soup = BeautifulSoup(html, "html.parser")

        # 注意：实际解析需要根据小红书页面结构调整
        # 这里仅做示范
        try:
            cards = soup.select(".note-item")

            for card in cards:
                title_elem = card.select_one(".title")
                content_elem = card.select_one(".desc")
                author_elem = card.select_one(".author")
                liked_elem = card.select_one(".liked-count")

                if title_elem:
                    notes.append(NoteData(
                        title=title_elem.text.strip(),
                        content=content_elem.text.strip() if content_elem else "",
                        author=author_elem.text.strip() if author_elem else "",
                        likes=int(liked_elem.text.strip()) if liked_elem else 0,
                        collects=0,
                        comments=0,
                        tags=[],
                        url="",
                        timestamp=""
                    ))
        except Exception as e:
            print(f"解析失败: {e}")

        return notes


class TrendingAnalyzer:
    """
    爆款数据分析器
    从笔记数据中提取规律
    """

    def __init__(self):
        self.data_dir = Path("data") / "trending"
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def load_notes(self, filename: str = "notes.json") -> list[NoteData]:
        """加载笔记数据"""
        filepath = self.data_dir / filename

        if not filepath.exists():
            return []

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        return [NoteData(**note) for note in data]

    def save_notes(self, notes: list[NoteData], filename: str = "notes.json"):
        """保存笔记数据"""
        filepath = self.data_dir / filename

        with open(filepath, "w", encoding="utf-8") as f:
            data = [note.__dict__ for note in notes]
            json.dump(data, f, ensure_ascii=False, indent=2)

    def analyze(self, notes: list[NoteData]) -> dict:
        """
        分析爆款数据，提取规律

        Returns:
            dict: 分析结果
        """
        if not notes:
            return {
                "top_patterns": [],
                "top_words": [],
                "avg_likes": 0,
                "avg_collects": 0,
                "top_tags": [],
            }

        # 提取高频词汇
        all_text = " ".join([n.title + " " + n.content for n in notes])
        words = self._extract_keywords(all_text, top_k=20)

        # 提取高互动内容模式
        top_notes = sorted(notes, key=lambda x: x.likes, reverse=True)[:10]
        patterns = self._extract_patterns(top_notes)

        # 统计
        avg_likes = sum(n.likes for n in notes) / len(notes)
        avg_collects = sum(n.collects for n in notes) / len(notes)

        # 高频标签
        all_tags = []
        for note in notes:
            all_tags.extend(note.tags)
        tag_freq = {}
        for tag in all_tags:
            tag_freq[tag] = tag_freq.get(tag, 0) + 1
        top_tags = sorted(tag_freq.items(), key=lambda x: x[1], reverse=True)[:10]

        analysis = {
            "top_patterns": patterns,
            "top_words": words,
            "avg_likes": round(avg_likes, 2),
            "avg_collects": round(avg_collects, 2),
            "top_tags": [t[0] for t in top_tags],
            "sample_notes": [
                {
                    "title": n.title,
                    "likes": n.likes,
                    "collects": n.collects
                }
                for n in top_notes[:5]
            ]
        }

        # 保存分析结果
        with open(self.data_dir / "analysis.json", "w", encoding="utf-8") as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)

        return analysis

    def _extract_keywords(self, text: str, top_k: int = 20) -> list[str]:
        """提取关键词"""
        # 简单实现，实际可用 jieba 等分词库
        stopwords = {"的", "了", "是", "在", "我", "有", "和", "就", "不", "人",
                    "都", "一", "一个", "上", "也", "很", "到", "说", "要", "去",
                    "你", "会", "着", "没有", "看", "好", "自己", "这", "吗", "呢"}

        # 提取连续的中文字符序列
        words = re.findall(r'[\u4e00-\u9fa5]{2,}', text)

        # 统计词频
        word_freq = {}
        for word in words:
            if word not in stopwords and len(word) <= 6:
                word_freq[word] = word_freq.get(word, 0) + 1

        # 排序
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)

        return [w[0] for w in sorted_words[:top_k]]

    def _extract_patterns(self, top_notes: list[NoteData]) -> list[str]:
        """提取爆款模式"""
        patterns = []

        for note in top_notes:
            title = note.title

            # 数字开头
            if re.match(r'^\d+', title):
                patterns.append("数字开头")

            # 疑问句
            if '?' in title or '？' in title:
                patterns.append("疑问句标题")

            # 强反差词
            contrast_words = ["从", "到", "vs", "VS", "vs", "还是", "但", "却"]
            if any(w in title for w in contrast_words):
                patterns.append("强反差对比")

        # 统计出现次数
        pattern_freq = {}
        for p in patterns:
            pattern_freq[p] = pattern_freq.get(p, 0) + 1

        # 返回最常见的模式
        sorted_patterns = sorted(pattern_freq.items(), key=lambda x: x[1], reverse=True)

        return [p[0] for p in sorted_patterns[:5]]

    def print_analysis(self, analysis: dict):
        """打印分析结果"""
        print("\n" + "=" * 50)
        print("📊 爆款数据分析报告")
        print("=" * 50)

        print(f"\n平均点赞: {analysis['avg_likes']}")
        print(f"平均收藏: {analysis['avg_collects']}")

        print("\n🔥 高频模式:")
        for p in analysis.get("top_patterns", []):
            print(f"  - {p}")

        print("\n💬 高频词汇:")
        for w in analysis.get("top_words", [])[:10]:
            print(f"  - {w}")

        print("\n🏷️ 高频标签:")
        for t in analysis.get("top_tags", [])[:10]:
            print(f"  - {t}")

        print("\n📝 爆款示例:")
        for note in analysis.get("sample_notes", [])[:5]:
            print(f"  [{note['likes']}👍] {note['title']}")

        print("=" * 50)


def demo():
    """演示数据准备流程"""
    print("=" * 50)
    print("小红书数据准备工具")
    print("=" * 50)

    # 演示：加载已有数据分析
    analyzer = TrendingAnalyzer()

    # 尝试加载现有数据
    notes = analyzer.load_notes()

    if notes:
        print(f"\n已加载 {len(notes)} 条笔记")
        analysis = analyzer.analyze(notes)
        analyzer.print_analysis(analysis)
    else:
        print("\n暂无数据，请先运行爬虫收集数据")
        print("\n使用方法:")
        print("  1. 手动收集爆款笔记数据到 data/trending/notes.json")
        print("  2. 运行 python prepare.py 分析数据")


if __name__ == "__main__":
    demo()
