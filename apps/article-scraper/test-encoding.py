#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试编码问题
"""

import sys
import io
import json

# 设置UTF-8编码
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 测试包含emoji和特殊字符的JSON输出
test_data = {
    'success': True,
    'title': '测试文章 💂 🎉',
    'content': '这是一篇包含emoji的文章 😊\n\n包含各种Unicode字符：\n- 中文：你好世界\n- Emoji: 💻 📱 🚀\n- 特殊符号：™ © ® ℃',
    'url': 'https://example.com'
}

# 输出JSON
print(json.dumps(test_data, ensure_ascii=False, indent=2))

print('\n✅ 编码测试成功！')
