#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文章抓取工具 - Python后端
将网页文章转换为Markdown格式
"""

import sys
import io

# 设置默认编码为UTF-8（Windows兼容）
if sys.platform == 'win32':
    # 设置标准输出为UTF-8
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
import html2text
import os
from datetime import datetime
import warnings

# 禁用SSL警告
warnings.filterwarnings('ignore', message='Unverified HTTPS request')
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class ArticleScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.h2t = html2text.HTML2Text()
        self.h2t.ignore_links = False
        self.h2t.ignore_images = False
        self.h2t.ignore_emphasis = False
        self.h2t.body_width = 0  # 不自动换行
        
    def fetch_article(self, url):
        """获取网页内容"""
        try:
            # 添加更多的请求头，模拟真实浏览器
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
            
            # 禁用SSL验证，增加超时时间
            response = requests.get(
                url, 
                headers=headers, 
                timeout=30,
                verify=False,  # 禁用SSL验证
                allow_redirects=True
            )
            response.raise_for_status()
            response.encoding = response.apparent_encoding
            return response.text
        except requests.exceptions.SSLError as e:
            raise Exception(f"SSL证书验证失败: {str(e)}")
        except requests.exceptions.ConnectionError as e:
            raise Exception(f"网络连接失败，请检查网络或URL是否正确: {str(e)}")
        except requests.exceptions.Timeout as e:
            raise Exception(f"请求超时，网站响应太慢: {str(e)}")
        except requests.exceptions.HTTPError as e:
            raise Exception(f"HTTP错误 {e.response.status_code}: {str(e)}")
        except Exception as e:
            raise Exception(f"获取网页失败: {str(e)}")
    
    def extract_article_content(self, html, base_url):
        """提取文章主要内容"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # 移除不需要的标签
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'iframe']):
            tag.decompose()
        
        # 尝试多种方式提取标题
        title = self._extract_title(soup)
        
        # 尝试多种方式提取正文
        content = self._extract_content(soup)
        
        if not content:
            raise Exception("无法提取文章内容")
        
        # 处理图片URL
        self._process_images(content, base_url)
        
        return title, content
    
    def _extract_title(self, soup):
        """提取文章标题"""
        # 尝试多种选择器
        selectors = [
            'h1',
            'article h1',
            '.article-title',
            '.post-title',
            '#article-title',
            'meta[property="og:title"]',
            'title'
        ]
        
        for selector in selectors:
            if selector.startswith('meta'):
                element = soup.select_one(selector)
                if element and element.get('content'):
                    return element.get('content').strip()
            else:
                element = soup.select_one(selector)
                if element:
                    return element.get_text().strip()
        
        return "未命名文章"
    
    def _extract_content(self, soup):
        """提取文章正文"""
        # 尝试多种常见的文章容器选择器
        selectors = [
            'article',
            '.article-content',
            '.post-content',
            '.entry-content',
            '#article-content',
            '#content',
            'main article',
            '[role="main"]',
            '.markdown-body',
            '.content'
        ]
        
        for selector in selectors:
            content = soup.select_one(selector)
            if content and len(content.get_text().strip()) > 100:
                return content
        
        # 如果没找到，尝试找最大的div
        divs = soup.find_all('div')
        max_div = None
        max_length = 0
        
        for div in divs:
            text_length = len(div.get_text().strip())
            if text_length > max_length:
                max_length = text_length
                max_div = div
        
        return max_div
    
    def _process_images(self, content, base_url):
        """处理图片URL，转换为绝对路径"""
        if not content:
            return
        
        for img in content.find_all('img'):
            src = img.get('src')
            if src:
                # 转换为绝对URL
                absolute_url = urljoin(base_url, src)
                img['src'] = absolute_url
    
    def html_to_markdown(self, html_content):
        """将HTML转换为Markdown"""
        try:
            markdown = self.h2t.handle(str(html_content))
            # 清理多余的空行
            markdown = re.sub(r'\n{3,}', '\n\n', markdown)
            return markdown.strip()
        except Exception as e:
            raise Exception(f"转换Markdown失败: {str(e)}")
    
    def scrape(self, url):
        """主抓取函数"""
        try:
            # 获取网页内容
            html = self.fetch_article(url)
            
            # 提取文章内容
            title, content = self.extract_article_content(html, url)
            
            # 转换为Markdown
            markdown = self.html_to_markdown(content)
            
            # 添加元数据
            metadata = f"""---
title: {title}
source: {url}
scraped_at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
---

# {title}

"""
            
            full_markdown = metadata + markdown
            
            return {
                'success': True,
                'title': title,
                'markdown': full_markdown,
                'url': url
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }

def main():
    """命令行入口"""
    import json
    
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'message': '用法: python scraper.py <URL>'
        }, ensure_ascii=False))
        sys.exit(1)
    
    url = sys.argv[1]
    scraper = ArticleScraper()
    result = scraper.scrape(url)
    
    # 输出JSON格式结果（供Node.js调用）
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()
