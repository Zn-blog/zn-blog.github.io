#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试网络连接
"""

import sys
import requests
import warnings

# 禁用SSL警告
warnings.filterwarnings('ignore')
import urllib3
urllib3.disable_warnings()

def test_url(url):
    """测试URL是否可访问"""
    print(f"\n测试URL: {url}")
    print("-" * 50)
    
    try:
        # 测试基本连接
        print("1. 测试基本连接...")
        response = requests.get(
            url,
            timeout=10,
            verify=False,
            allow_redirects=True
        )
        print(f"✅ 状态码: {response.status_code}")
        print(f"✅ 编码: {response.encoding}")
        print(f"✅ 内容长度: {len(response.text)} 字符")
        
        # 测试内容类型
        content_type = response.headers.get('Content-Type', '')
        print(f"✅ 内容类型: {content_type}")
        
        if 'text/html' in content_type:
            print("✅ 这是一个HTML页面")
        else:
            print("⚠️ 这不是HTML页面，可能无法正确解析")
        
        return True
        
    except requests.exceptions.SSLError as e:
        print(f"❌ SSL错误: {e}")
        print("💡 建议: 网站的SSL证书可能有问题")
        return False
        
    except requests.exceptions.ConnectionError as e:
        print(f"❌ 连接错误: {e}")
        print("💡 建议: 检查网络连接或URL是否正确")
        return False
        
    except requests.exceptions.Timeout as e:
        print(f"❌ 超时错误: {e}")
        print("💡 建议: 网站响应太慢，尝试增加超时时间")
        return False
        
    except Exception as e:
        print(f"❌ 未知错误: {e}")
        return False

def main():
    """主函数"""
    if len(sys.argv) < 2:
        # 默认测试URL
        test_urls = [
            "https://www.example.com",
            "https://www.baidu.com",
        ]
        
        print("=" * 50)
        print("网络连接测试")
        print("=" * 50)
        
        for url in test_urls:
            test_url(url)
        
        print("\n" + "=" * 50)
        print("测试完成")
        print("=" * 50)
        
        if len(sys.argv) >= 2:
            print(f"\n使用方法: python test-network.py <URL>")
    else:
        url = sys.argv[1]
        test_url(url)

if __name__ == '__main__':
    main()
