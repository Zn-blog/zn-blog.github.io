// 课程数据
const courses = [
    {
        id: 1,
        title: "编程基础入门",
        description: "学习编程的基本概念和思维方式",
        completed: false,
        content: {
            sections: [
                {
                    title: "什么是编程？",
                    type: "text",
                    content: `
                        <p>编程（Programming）是编写计算机程序的过程，通过特定的编程语言告诉计算机如何执行任务。</p>
                        <p><strong>编程的核心概念：</strong></p>
                        <ul>
                            <li><strong>算法</strong>：解决问题的步骤和方法</li>
                            <li><strong>数据结构</strong>：组织和存储数据的方式</li>
                            <li><strong>语法</strong>：编程语言的规则和格式</li>
                            <li><strong>逻辑</strong>：程序的执行流程和判断</li>
                        </ul>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>编程是一种解决问题的思维方式，不仅仅是写代码。
                        </div>
                    `
                },
                {
                    title: "编程语言的选择",
                    type: "text",
                    content: `
                        <p>不同的编程语言适用于不同的场景：</p>
                        <ul>
                            <li><strong>Python</strong>：易学易用，适合初学者和AI开发</li>
                            <li><strong>JavaScript</strong>：Web开发必备，前后端通用</li>
                            <li><strong>Java</strong>：企业级应用，跨平台</li>
                            <li><strong>C/C++</strong>：系统编程，性能要求高的场景</li>
                            <li><strong>Go</strong>：现代语言，并发编程优秀</li>
                        </ul>
                        <p>对于AI编程，我们推荐从<strong>Python</strong>开始，因为它语法简单，库丰富。</p>
                    `
                },
                {
                    title: "第一个程序：Hello World",
                    type: "code",
                    content: `
                        <p>让我们从最简单的程序开始：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># Python版本
print("Hello, World!")

# 运行这个程序，你会在屏幕上看到输出
# Hello, World!</pre>
                        </div>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>javascript</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>// JavaScript版本
console.log("Hello, World!");

// 在浏览器控制台或Node.js中运行</pre>
                        </div>
                        <div class="success-box">
                            <strong>🎉 恭喜！</strong>你已经写出了第一个程序！这是编程的第一步。
                        </div>
                    `
                },
                {
                    title: "变量和数据类型",
                    type: "code",
                    content: `
                        <p>变量是存储数据的容器，不同的数据有不同的类型：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 基本数据类型
name = "张三"          # 字符串 (str)
age = 25              # 整数 (int)
height = 175.5        # 浮点数 (float)
is_student = True     # 布尔值 (bool)

# 打印变量
print(f"姓名: {name}, 年龄: {age}, 身高: {height}cm")
print(f"是学生: {is_student}")

# 类型检查
print(type(name))     # <class 'str'>
print(type(age))      # <class 'int'></pre>
                        </div>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>理解数据类型是编程的基础，不同的类型有不同的操作方式。
                        </div>
                    `
                },
                {
                    title: "控制流：条件语句和循环",
                    type: "code",
                    content: `
                        <p>程序需要根据条件执行不同的操作，或者重复执行某些操作：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 条件语句 (if-else)
score = 85

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")

# for循环
for i in range(5):
    print(f"第 {i+1} 次循环")

# while循环
count = 0
while count < 3:
    print(f"计数: {count}")
    count += 1

# 遍历列表
fruits = ["苹果", "香蕉", "橙子"]
for fruit in fruits:
    print(f"我喜欢{fruit}")</pre>
                        </div>
                    `
                },
                {
                    title: "函数：代码复用",
                    type: "code",
                    content: `
                        <p>函数可以将代码组织成可重用的块：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 定义函数
def greet(name):
    """问候函数"""
    return f"你好, {name}!"

# 调用函数
message = greet("世界")
print(message)  # 输出: 你好, 世界!

# 带参数的函数
def calculate_area(length, width):
    """计算矩形面积"""
    area = length * width
    return area

result = calculate_area(5, 3)
print(f"面积: {result}")  # 输出: 面积: 15

# 带默认参数的函数
def introduce(name, age=18):
    return f"我是{name}, 今年{age}岁"

print(introduce("小明"))        # 使用默认年龄
print(introduce("小红", 20))    # 指定年龄</pre>
                        </div>
                    `
                },
                {
                    title: "Python字符串操作详解",
                    type: "code",
                    content: `
                        <p>字符串是Python中最常用的数据类型，掌握字符串操作非常重要：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 字符串创建和格式化
name = "Python"
version = 3.9

# 字符串拼接
greeting = "Hello, " + name
print(greeting)  # Hello, Python

# f-string格式化（推荐）
message = f"欢迎使用{name} {version}"
print(message)  # 欢迎使用Python 3.9

# 字符串方法
text = "  Python Programming  "
print(text.strip())           # 去除首尾空格
print(text.upper())            # 转大写
print(text.lower())            # 转小写
print(text.replace("Python", "Java"))  # 替换

# 字符串查找和分割
sentence = "Python is great"
print(sentence.find("is"))     # 查找位置: 7
print(sentence.split())        # 分割: ['Python', 'is', 'great']
print(sentence.startswith("Python"))  # True

# 字符串切片
text = "Hello World"
print(text[0:5])    # Hello
print(text[6:])      # World
print(text[::-1])   # dlroW olleH (反转)</pre>
                        </div>
                    `
                },
                {
                    title: "Python列表操作详解",
                    type: "code",
                    content: `
                        <p>列表是Python中最灵活的数据结构，可以存储不同类型的数据：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 创建列表
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]
empty = []

# 访问元素
print(numbers[0])      # 第一个元素: 1
print(numbers[-1])     # 最后一个元素: 5
print(numbers[1:3])    # 切片: [2, 3]

# 添加元素
numbers.append(6)           # 末尾添加
numbers.insert(0, 0)        # 指定位置插入
numbers.extend([7, 8])      # 扩展列表
print(numbers)  # [0, 1, 2, 3, 4, 5, 6, 7, 8]

# 删除元素
numbers.remove(0)           # 删除值为0的元素
popped = numbers.pop()       # 删除并返回最后一个元素
del numbers[0]              # 删除指定索引的元素
print(numbers)

# 列表方法
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print(len(numbers))         # 长度: 8
print(numbers.count(1))     # 计数: 2
print(numbers.index(4))     # 索引: 2
numbers.sort()              # 排序（原地）
print(numbers)  # [1, 1, 2, 3, 4, 5, 6, 9]

# 列表推导式（强大特性）
squares = [x**2 for x in range(10)]
print(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

evens = [x for x in range(20) if x % 2 == 0]
print(evens)  # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]</pre>
                        </div>
                    `
                },
                {
                    title: "Python字典操作详解",
                    type: "code",
                    content: `
                        <p>字典是键值对的数据结构，非常适合存储关联数据：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 创建字典
student = {
    "name": "张三",
    "age": 20,
    "major": "计算机科学",
    "grades": [85, 90, 88]
}

# 访问值
print(student["name"])           # 张三
print(student.get("age"))       # 20
print(student.get("email", "无"))  # 无（默认值）

# 修改和添加
student["age"] = 21              # 修改
student["email"] = "zhang@example.com"  # 添加
print(student)

# 字典方法
print(student.keys())    # 所有键
print(student.values())  # 所有值
print(student.items())   # 所有键值对

# 遍历字典
for key, value in student.items():
    print(f"{key}: {value}")

# 字典推导式
squares_dict = {x: x**2 for x in range(5)}
print(squares_dict)  # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# 嵌套字典
students = {
    "001": {"name": "张三", "score": 85},
    "002": {"name": "李四", "score": 92}
}
print(students["001"]["name"])  # 张三</pre>
                        </div>
                    `
                },
                {
                    title: "Python集合和元组",
                    type: "code",
                    content: `
                        <p>集合用于存储不重复的元素，元组是不可变的序列：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 集合（Set）- 不重复元素
fruits = {"苹果", "香蕉", "橙子", "苹果"}
print(fruits)  # {'苹果', '香蕉', '橙子'} - 自动去重

# 集合操作
set1 = {1, 2, 3, 4}
set2 = {3, 4, 5, 6}
print(set1 | set2)   # 并集: {1, 2, 3, 4, 5, 6}
print(set1 & set2)   # 交集: {3, 4}
print(set1 - set2)   # 差集: {1, 2}

# 集合方法
fruits.add("葡萄")
fruits.remove("苹果")
print(fruits)

# 元组（Tuple）- 不可变序列
coordinates = (10, 20)
point = (3.5, 4.2, 5.1)  # 三维坐标

# 元组解包
x, y = coordinates
print(f"x={x}, y={y}")  # x=10, y=20

# 元组作为字典键（因为不可变）
locations = {
    (0, 0): "原点",
    (1, 1): "点(1,1)"
}
print(locations[(0, 0)])  # 原点

# 命名元组（更高级用法）
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)  # 10 20</pre>
                        </div>
                    `
                },
                {
                    title: "Python文件操作",
                    type: "code",
                    content: `
                        <p>文件操作是编程中的重要技能，Python提供了简洁的文件处理方式：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 写入文件
with open("example.txt", "w", encoding="utf-8") as f:
    f.write("Hello, Python!\\n")
    f.write("这是第二行\\n")
    f.writelines(["第三行\\n", "第四行\\n"])

# 读取文件
with open("example.txt", "r", encoding="utf-8") as f:
    content = f.read()        # 读取全部内容
    print(content)

# 逐行读取
with open("example.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.strip())  # strip()去除换行符

# 读取所有行到列表
with open("example.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()
    print(lines)

# 追加内容
with open("example.txt", "a", encoding="utf-8") as f:
    f.write("追加的内容\\n")

# 使用with语句的好处：自动关闭文件，即使出错也会关闭</pre>
                        </div>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>使用 <code>with</code> 语句可以确保文件正确关闭，这是Python的最佳实践。
                        </div>
                    `
                },
                {
                    title: "Python异常处理",
                    type: "code",
                    content: `
                        <p>异常处理让程序更加健壮，能够优雅地处理错误：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 基本异常处理
try:
    number = int(input("请输入一个数字: "))
    result = 10 / number
    print(f"结果是: {result}")
except ValueError:
    print("错误：请输入有效的数字！")
except ZeroDivisionError:
    print("错误：不能除以零！")
except Exception as e:
    print(f"发生错误: {e}")
else:
    print("计算成功完成！")
finally:
    print("无论是否出错，这里都会执行")

# 抛出异常
def check_age(age):
    if age < 0:
        raise ValueError("年龄不能为负数")
    if age > 150:
        raise ValueError("年龄不能超过150")
    return f"年龄是: {age}"

try:
    print(check_age(-5))
except ValueError as e:
    print(f"错误: {e}")

# 自定义异常
class MyCustomError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

try:
    raise MyCustomError("这是自定义错误")
except MyCustomError as e:
    print(f"捕获自定义错误: {e}")</pre>
                        </div>
                    `
                },
                {
                    title: "Python模块和包",
                    type: "code",
                    content: `
                        <p>模块让代码可以复用，Python有丰富的标准库和第三方库：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 导入标准库模块
import math
import random
import datetime

# 使用模块
print(math.pi)                    # 3.141592653589793
print(math.sqrt(16))              # 4.0
print(random.randint(1, 10))      # 随机数
print(datetime.datetime.now())     # 当前时间

# 导入特定函数
from math import sqrt, pow
print(sqrt(25))                    # 5.0
print(pow(2, 3))                   # 8.0

# 导入并重命名
import datetime as dt
now = dt.datetime.now()
print(now.strftime("%Y-%m-%d %H:%M:%S"))

# 导入所有（不推荐）
# from math import *

# 常用标准库示例
import os
import json

# 文件路径操作
current_dir = os.getcwd()
print(f"当前目录: {current_dir}")

# JSON处理
data = {"name": "Python", "version": 3.9}
json_str = json.dumps(data)        # 转为JSON字符串
print(json_str)
parsed = json.loads(json_str)      # 解析JSON
print(parsed["name"])</pre>
                        </div>
                    `
                },
                {
                    title: "Python面向对象编程基础",
                    type: "code",
                    content: `
                        <p>面向对象编程（OOP）是Python的重要特性：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 定义类
class Student:
    # 类属性
    school = "Python大学"
    
    # 初始化方法
    def __init__(self, name, age):
        self.name = name      # 实例属性
        self.age = age
        self.grades = []
    
    # 实例方法
    def add_grade(self, grade):
        self.grades.append(grade)
    
    def get_average(self):
        if self.grades:
            return sum(self.grades) / len(self.grades)
        return 0
    
    def introduce(self):
        return f"我是{self.name}，{self.age}岁，来自{self.school}"

# 创建对象
student1 = Student("张三", 20)
student1.add_grade(85)
student1.add_grade(90)
student1.add_grade(88)

print(student1.introduce())
print(f"平均分: {student1.get_average()}")

# 继承
class GraduateStudent(Student):
    def __init__(self, name, age, research_area):
        super().__init__(name, age)  # 调用父类初始化
        self.research_area = research_area
    
    def introduce(self):  # 重写方法
        return f"{super().introduce()}，研究方向：{self.research_area}"

grad_student = GraduateStudent("李四", 25, "机器学习")
print(grad_student.introduce())</pre>
                        </div>
                    `
                },
                {
                    title: "Python实际应用示例",
                    type: "code",
                    content: `
                        <p>让我们通过实际例子来巩固所学知识：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 示例1：学生成绩管理系统
class GradeManager:
    def __init__(self):
        self.students = {}
    
    def add_student(self, name, grades):
        self.students[name] = grades
    
    def get_student_average(self, name):
        if name in self.students:
            return sum(self.students[name]) / len(self.students[name])
        return None
    
    def get_class_average(self):
        all_grades = []
        for grades in self.students.values():
            all_grades.extend(grades)
        return sum(all_grades) / len(all_grades) if all_grades else 0

manager = GradeManager()
manager.add_student("张三", [85, 90, 88])
manager.add_student("李四", [92, 88, 95])
print(f"张三平均分: {manager.get_student_average('张三')}")
print(f"班级平均分: {manager.get_class_average()}")

# 示例2：文本处理工具
def word_count(text):
    """统计文本中的单词"""
    words = text.lower().split()
    word_dict = {}
    for word in words:
        word_dict[word] = word_dict.get(word, 0) + 1
    return word_dict

text = "Python is great Python is easy"
result = word_count(text)
print(result)  # {'python': 2, 'is': 2, 'great': 1, 'easy': 1}

# 示例3：数据筛选和转换
students = [
    {"name": "张三", "age": 20, "score": 85},
    {"name": "李四", "age": 21, "score": 92},
    {"name": "王五", "age": 19, "score": 78}
]

# 筛选高分学生
high_scores = [s for s in students if s["score"] >= 85]
print(high_scores)

# 计算平均年龄
avg_age = sum(s["age"] for s in students) / len(students)
print(f"平均年龄: {avg_age}")

# 按分数排序
sorted_students = sorted(students, key=lambda x: x["score"], reverse=True)
print(sorted_students)</pre>
                        </div>
                    `
                },
                {
                    title: "Python高级特性",
                    type: "code",
                    content: `
                        <p>Python的一些高级特性让编程更加优雅：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># Lambda函数（匿名函数）
square = lambda x: x ** 2
print(square(5))  # 25

# 与map、filter配合使用
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
print(squared)  # [1, 4, 9, 16, 25]

evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4]

# 装饰器（Decorator）
def timer(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 执行时间: {end - start:.4f}秒")
        return result
    return wrapper

@timer
def slow_function():
    import time
    time.sleep(0.1)
    return "完成"

slow_function()

# 生成器（Generator）- 节省内存
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

for num in fibonacci(10):
    print(num, end=" ")  # 0 1 1 2 3 5 8 13 21 34

# 上下文管理器
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
    
    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.file.close()

with FileManager("test.txt", "w") as f:
    f.write("Hello")</pre>
                        </div>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>这些高级特性让Python代码更简洁、更Pythonic。掌握它们能大大提高编程效率。
                        </div>
                    `
                },
                {
                    title: "Python编程最佳实践",
                    type: "text",
                    content: `
                        <p><strong>编写高质量Python代码的建议：</strong></p>
                        <ul>
                            <li><strong>命名规范</strong>：使用有意义的变量名，遵循PEP 8规范</li>
                            <li><strong>代码注释</strong>：为复杂逻辑添加注释，使用docstring说明函数功能</li>
                            <li><strong>函数设计</strong>：保持函数简短，一个函数只做一件事</li>
                            <li><strong>异常处理</strong>：合理使用try-except，不要忽略错误</li>
                            <li><strong>代码复用</strong>：避免重复代码，提取公共逻辑为函数</li>
                            <li><strong>测试代码</strong>：编写测试确保代码正确性</li>
                        </ul>
                        <div class="success-box">
                            <strong>✅ 恭喜！</strong>你已经掌握了Python编程的基础知识。继续练习和实践，你会越来越熟练！
                        </div>
                    `
                }
            ]
        }
    },
    {
        id: 2,
        title: "数据结构与算法基础",
        description: "学习常用的数据结构和基本算法",
        completed: false,
        content: {
            sections: [
                {
                    title: "什么是数据结构？",
                    type: "text",
                    content: `
                        <p>数据结构是计算机存储、组织数据的方式。选择合适的数据结构可以提高程序的效率。</p>
                        <p><strong>常用的数据结构：</strong></p>
                        <ul>
                            <li><strong>列表/数组</strong>：有序的元素集合</li>
                            <li><strong>字典/映射</strong>：键值对存储</li>
                            <li><strong>集合</strong>：不重复的元素集合</li>
                            <li><strong>栈</strong>：后进先出（LIFO）</li>
                            <li><strong>队列</strong>：先进先出（FIFO）</li>
                            <li><strong>树</strong>：层次结构</li>
                        </ul>
                    `
                },
                {
                    title: "列表和字典操作",
                    type: "code",
                    content: `
                        <p>列表和字典是Python中最常用的数据结构：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 列表操作
numbers = [1, 2, 3, 4, 5]

# 添加元素
numbers.append(6)           # 末尾添加
numbers.insert(0, 0)        # 指定位置插入
print(numbers)              # [0, 1, 2, 3, 4, 5, 6]

# 删除元素
numbers.remove(3)           # 删除值为3的元素
del numbers[0]              # 删除索引0的元素
print(numbers)              # [1, 2, 4, 5, 6]

# 列表切片
print(numbers[1:3])         # [2, 4]
print(numbers[:3])          # [1, 2, 4]
print(numbers[2:])         # [4, 5, 6]

# 列表推导式
squares = [x**2 for x in range(1, 6)]
print(squares)              # [1, 4, 9, 16, 25]

# 字典操作
student = {
    "name": "张三",
    "age": 20,
    "major": "计算机科学"
}

# 访问和修改
print(student["name"])      # 张三
student["age"] = 21
student["grade"] = "A"      # 添加新键值对

# 遍历字典
for key, value in student.items():
    print(f"{key}: {value}")</pre>
                        </div>
                    `
                },
                {
                    title: "基本算法：排序和搜索",
                    type: "code",
                    content: `
                        <p>算法是解决问题的步骤。让我们学习两个基本算法：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 冒泡排序
def bubble_sort(arr):
    """冒泡排序算法"""
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers.copy())
print(f"原数组: {numbers}")
print(f"排序后: {sorted_numbers}")

# 线性搜索
def linear_search(arr, target):
    """线性搜索算法"""
    for i, value in enumerate(arr):
        if value == target:
            return i
    return -1

index = linear_search(numbers, 25)
print(f"25在数组中的索引: {index}")

# Python内置方法（更高效）
numbers.sort()              # 原地排序
print(f"排序后: {numbers}")

index = numbers.index(25)   # 查找索引
print(f"25的索引: {index}")</pre>
                        </div>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>理解算法原理很重要，但在实际开发中，优先使用语言内置的高效方法。
                        </div>
                    `
                },
                {
                    title: "时间和空间复杂度",
                    type: "text",
                    content: `
                        <p>算法复杂度用于衡量算法的效率：</p>
                        <ul>
                            <li><strong>时间复杂度</strong>：算法执行所需的时间</li>
                            <li><strong>空间复杂度</strong>：算法执行所需的内存空间</li>
                        </ul>
                        <p><strong>常见复杂度：</strong></p>
                        <ul>
                            <li><strong>O(1)</strong>：常数时间，最快</li>
                            <li><strong>O(log n)</strong>：对数时间，很快</li>
                            <li><strong>O(n)</strong>：线性时间，随数据量增长</li>
                            <li><strong>O(n²)</strong>：平方时间，较慢</li>
                        </ul>
                        <div class="warning-box">
                            <strong>⚠️ 注意：</strong>对于大数据，选择合适的算法非常重要，可以显著提高程序性能。
                        </div>
                    `
                }
            ]
        }
    },
    {
        id: 3,
        title: "开发工具与环境配置",
        description: "配置开发环境，掌握常用开发工具",
        completed: false,
        content: {
            sections: [
                {
                    title: "代码编辑器选择",
                    type: "text",
                    content: `
                        <p>一个好的代码编辑器可以大大提高开发效率：</p>
                        <ul>
                            <li><strong>VS Code</strong>：免费、轻量、插件丰富（推荐）</li>
                            <li><strong>PyCharm</strong>：Python专用IDE，功能强大</li>
                            <li><strong>Sublime Text</strong>：轻量快速</li>
                            <li><strong>Vim/Neovim</strong>：终端编辑器，适合高级用户</li>
                        </ul>
                        <div class="tip-box">
                            <strong>💡 推荐：</strong>对于初学者，VS Code是最佳选择，它支持几乎所有编程语言。
                        </div>
                    `
                },
                {
                    title: "Python环境安装",
                    type: "code",
                    content: `
                        <p>安装Python开发环境：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>bash</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># Windows系统
# 1. 访问 https://www.python.org/downloads/
# 2. 下载Python 3.8或更高版本
# 3. 安装时勾选"Add Python to PATH"

# 验证安装
python --version

# 安装pip（Python包管理器）
python -m ensurepip --upgrade

# 使用pip安装包
pip install package_name

# 查看已安装的包
pip list

# 升级pip
python -m pip install --upgrade pip</pre>
                        </div>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>bash</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># macOS/Linux系统
# 使用Homebrew (macOS)
brew install python3

# 或使用系统包管理器 (Linux)
sudo apt-get update
sudo apt-get install python3 python3-pip

# 验证安装
python3 --version
pip3 --version</pre>
                        </div>
                    `
                },
                {
                    title: "虚拟环境（Virtual Environment）",
                    type: "code",
                    content: `
                        <p>虚拟环境可以隔离不同项目的依赖，避免版本冲突：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>bash</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 创建虚拟环境
python -m venv myenv

# Windows激活虚拟环境
myenv\\Scripts\\activate

# macOS/Linux激活虚拟环境
source myenv/bin/activate

# 激活后，命令行前面会显示 (myenv)
# 在虚拟环境中安装包
pip install numpy pandas

# 导出依赖列表
pip freeze > requirements.txt

# 从requirements.txt安装依赖
pip install -r requirements.txt

# 退出虚拟环境
deactivate</pre>
                        </div>
                        <div class="success-box">
                            <strong>✅ 最佳实践：</strong>每个项目都应该使用独立的虚拟环境，这样可以避免依赖冲突。
                        </div>
                    `
                },
                {
                    title: "Jupyter Notebook",
                    type: "code",
                    content: `
                        <p>Jupyter Notebook是数据科学和AI开发的重要工具：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>bash</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 安装Jupyter
pip install jupyter

# 启动Jupyter Notebook
jupyter notebook

# 或使用JupyterLab（更现代的界面）
pip install jupyterlab
jupyter lab

# 在浏览器中会自动打开Jupyter界面
# 可以创建新的notebook文件，编写和运行代码</pre>
                        </div>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>Jupyter非常适合数据探索、实验和教学，可以边写代码边看结果。
                        </div>
                    `
                },
                {
                    title: "常用开发工具",
                    type: "text",
                    content: `
                        <p><strong>推荐安装的工具：</strong></p>
                        <ul>
                            <li><strong>Git</strong>：版本控制系统（下一课详细介绍）</li>
                            <li><strong>Postman</strong>：API测试工具</li>
                            <li><strong>Docker</strong>：容器化工具（高级）</li>
                            <li><strong>Anaconda</strong>：Python数据科学发行版（包含很多预装库）</li>
                        </ul>
                    `
                }
            ]
        }
    },
    {
        id: 4,
        title: "版本控制：Git基础",
        description: "学习使用Git管理代码版本",
        completed: false,
        content: {
            sections: [
                {
                    title: "什么是版本控制？",
                    type: "text",
                    content: `
                        <p>版本控制系统可以记录文件的修改历史，让你能够：</p>
                        <ul>
                            <li>追踪代码的变更</li>
                            <li>回退到之前的版本</li>
                            <li>多人协作开发</li>
                            <li>创建分支进行实验</li>
                        </ul>
                        <p><strong>Git</strong>是最流行的分布式版本控制系统。</p>
                    `
                },
                {
                    title: "Git安装和配置",
                    type: "code",
                    content: `
                        <p>安装和配置Git：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>bash</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># Windows: 下载安装 https://git-scm.com/download/win
# macOS: brew install git
# Linux: sudo apt-get install git

# 配置用户信息（首次使用）
git config --global user.name "你的名字"
git config --global user.email "your.email@example.com"

# 查看配置
git config --list

# 查看Git版本
git --version</pre>
                        </div>
                    `
                },
                {
                    title: "Git基本操作",
                    type: "code",
                    content: `
                        <p>Git的基本工作流程：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>bash</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 初始化仓库
git init

# 查看文件状态
git status

# 添加文件到暂存区
git add filename.py
git add .                    # 添加所有文件

# 提交更改
git commit -m "提交说明"

# 查看提交历史
git log
git log --oneline           # 简洁模式

# 查看文件差异
git diff
git diff filename.py

# 撤销更改
git checkout -- filename.py  # 撤销工作区的修改
git reset HEAD filename.py   # 取消暂存</pre>
                        </div>
                    `
                },
                {
                    title: "GitHub使用",
                    type: "code",
                    content: `
                        <p>GitHub是代码托管平台，可以备份代码并与他人协作：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>bash</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 在GitHub上创建新仓库后，连接本地仓库

# 添加远程仓库
git remote add origin https://github.com/username/repo.git

# 推送代码到GitHub
git push -u origin main

# 从GitHub拉取代码
git pull origin main

# 克隆远程仓库
git clone https://github.com/username/repo.git

# 查看远程仓库
git remote -v</pre>
                        </div>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>定期将代码推送到GitHub，可以防止代码丢失，也方便与他人分享。
                        </div>
                    `
                },
                {
                    title: "分支管理",
                    type: "code",
                    content: `
                        <p>分支允许你在不影响主代码的情况下进行开发：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>bash</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 创建新分支
git branch feature-branch

# 切换分支
git checkout feature-branch
# 或使用新语法
git switch feature-branch

# 创建并切换分支
git checkout -b feature-branch

# 查看所有分支
git branch

# 合并分支
git checkout main
git merge feature-branch

# 删除分支
git branch -d feature-branch</pre>
                        </div>
                    `
                }
            ]
        }
    },
    {
        id: 5,
        title: "AI编程基础入门",
        description: "了解AI编程的基本概念和发展历程",
        completed: false,
        content: {
            sections: [
                {
                    title: "什么是人工智能？",
                    type: "text",
                    content: `
                        <p>人工智能（Artificial Intelligence，简称AI）是计算机科学的一个分支，旨在创建能够执行通常需要人类智能的任务的系统。</p>
                        <p>AI的主要目标包括：</p>
                        <ul>
                            <li><strong>学习</strong>：从数据中获取知识和模式</li>
                            <li><strong>推理</strong>：使用逻辑来得出结论</li>
                            <li><strong>感知</strong>：理解视觉、听觉等感官输入</li>
                            <li><strong>自然语言处理</strong>：理解和生成人类语言</li>
                        </ul>
                    `
                },
                {
                    title: "AI的发展历程",
                    type: "text",
                    content: `
                        <p>AI的发展经历了几个重要阶段：</p>
                        <ol>
                            <li><strong>1950年代</strong>：图灵测试提出，AI概念诞生</li>
                            <li><strong>1956年</strong>：达特茅斯会议，AI正式成为学科</li>
                            <li><strong>1980-1990年代</strong>：专家系统和机器学习兴起</li>
                            <li><strong>2000年代</strong>：深度学习和大数据推动AI快速发展</li>
                            <li><strong>2010年代至今</strong>：神经网络、GPT等大模型革命</li>
                        </ol>
                    `
                },
                {
                    title: "AI编程语言",
                    type: "text",
                    content: `
                        <p>常用的AI编程语言包括：</p>
                        <ul>
                            <li><strong>Python</strong>：最流行的AI开发语言，拥有丰富的库（TensorFlow, PyTorch, scikit-learn）</li>
                            <li><strong>R</strong>：主要用于数据分析和统计学习</li>
                            <li><strong>Java</strong>：企业级AI应用开发</li>
                            <li><strong>C++</strong>：高性能AI系统开发</li>
                            <li><strong>JavaScript</strong>：Web端AI应用开发</li>
                        </ul>
                        <div class="tip-box">
                            <strong>💡 建议：</strong>对于初学者，Python是最佳选择，因为它语法简单，库丰富，社区活跃。
                        </div>
                    `
                }
            ]
        }
    },
    {
        id: 6,
        title: "Python基础回顾",
        description: "掌握Python编程基础，为AI开发做准备",
        completed: false,
        content: {
            sections: [
                {
                    title: "Python环境搭建",
                    type: "text",
                    content: `
                        <p>开始AI编程前，需要先安装Python环境：</p>
                        <ol>
                            <li>访问 <a href="https://www.python.org/downloads/" target="_blank">python.org</a> 下载Python 3.8+</li>
                            <li>安装时勾选"Add Python to PATH"</li>
                            <li>验证安装：在命令行运行 <code>python --version</code></li>
                        </ol>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>bash</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 检查Python版本
python --version

# 安装pip（Python包管理器）
python -m ensurepip --upgrade

# 安装常用AI库
pip install numpy pandas matplotlib</pre>
                        </div>
                    `
                },
                {
                    title: "Python基础语法",
                    type: "code",
                    content: `
                        <p>让我们回顾Python的核心概念：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre># 变量和数据类型
name = "AI学习者"
age = 25
height = 175.5
is_student = True

# 列表和字典
numbers = [1, 2, 3, 4, 5]
student = {
    "name": "张三",
    "age": 20,
    "major": "计算机科学"
}

# 循环和条件
for i in range(5):
    if i % 2 == 0:
        print(f"{i} 是偶数")
    else:
        print(f"{i} 是奇数")

# 函数定义
def greet(name):
    return f"你好, {name}!"

print(greet("世界"))</pre>
                        </div>
                    `
                },
                {
                    title: "NumPy基础",
                    type: "code",
                    content: `
                        <p>NumPy是Python中用于数值计算的基础库，AI编程中经常使用：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>import numpy as np

# 创建数组
arr = np.array([1, 2, 3, 4, 5])
print("数组:", arr)

# 创建多维数组
matrix = np.array([[1, 2, 3], [4, 5, 6]])
print("矩阵:\\n", matrix)

# 数组运算
arr1 = np.array([1, 2, 3])
arr2 = np.array([4, 5, 6])
print("加法:", arr1 + arr2)
print("乘法:", arr1 * 2)

# 常用函数
print("平均值:", np.mean(arr))
print("最大值:", np.max(arr))
print("形状:", matrix.shape)</pre>
                        </div>
                    `
                }
            ]
        }
    },
    {
        id: 7,
        title: "机器学习基础",
        description: "学习机器学习的基本概念和算法",
        completed: false,
        content: {
            sections: [
                {
                    title: "什么是机器学习？",
                    type: "text",
                    content: `
                        <p>机器学习（Machine Learning）是AI的一个子领域，它使计算机能够从数据中学习，而无需明确编程。</p>
                        <p><strong>机器学习的三种类型：</strong></p>
                        <ul>
                            <li><strong>监督学习</strong>：使用标记数据训练模型（如分类、回归）</li>
                            <li><strong>无监督学习</strong>：从未标记数据中发现模式（如聚类）</li>
                            <li><strong>强化学习</strong>：通过与环境交互学习最优策略</li>
                        </ul>
                    `
                },
                {
                    title: "第一个机器学习模型",
                    type: "code",
                    content: `
                        <p>使用scikit-learn创建一个简单的线性回归模型：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import numpy as np

# 生成示例数据
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])  # y = 2x

# 分割训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 创建并训练模型
model = LinearRegression()
model.fit(X_train, y_train)

# 预测
predictions = model.predict(X_test)
print("预测结果:", predictions)
print("实际值:", y_test)
print("模型准确度:", model.score(X_test, y_test))</pre>
                        </div>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>这个例子展示了机器学习的基本流程：准备数据 → 训练模型 → 评估性能。
                        </div>
                    `
                },
                {
                    title: "分类问题示例",
                    type: "code",
                    content: `
                        <p>使用K-近邻算法进行数据分类：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>from sklearn.neighbors import KNeighborsClassifier
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

# 加载鸢尾花数据集
iris = load_iris()
X, y = iris.data, iris.target

# 分割数据
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# 创建KNN分类器
knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)

# 评估模型
accuracy = knn.score(X_test, y_test)
print(f"模型准确率: {accuracy:.2%}")

# 预测新样本
new_sample = [[5.1, 3.5, 1.4, 0.2]]
prediction = knn.predict(new_sample)
print(f"预测类别: {iris.target_names[prediction[0]]}")</pre>
                        </div>
                    `
                }
            ]
        }
    },
    {
        id: 8,
        title: "深度学习入门",
        description: "了解神经网络和深度学习的基本原理",
        completed: false,
        content: {
            sections: [
                {
                    title: "什么是深度学习？",
                    type: "text",
                    content: `
                        <p>深度学习是机器学习的一个子集，使用多层神经网络来学习数据的复杂模式。</p>
                        <p><strong>深度学习的关键概念：</strong></p>
                        <ul>
                            <li><strong>神经网络</strong>：模拟人脑神经元连接的计算模型</li>
                            <li><strong>层（Layers）</strong>：网络的基本构建块</li>
                            <li><strong>激活函数</strong>：引入非线性，使网络能够学习复杂模式</li>
                            <li><strong>反向传播</strong>：训练神经网络的核心算法</li>
                        </ul>
                    `
                },
                {
                    title: "使用TensorFlow/Keras创建神经网络",
                    type: "code",
                    content: `
                        <p>创建一个简单的神经网络用于手写数字识别：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# 加载MNIST数据集
(x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

# 数据预处理
x_train = x_train.reshape(60000, 784).astype('float32') / 255.0
x_test = x_test.reshape(10000, 784).astype('float32') / 255.0

# 创建模型
model = keras.Sequential([
    layers.Dense(128, activation='relu', input_shape=(784,)),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])

# 编译模型
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# 训练模型
model.fit(x_train, y_train, epochs=5, batch_size=32)

# 评估模型
test_loss, test_accuracy = model.evaluate(x_test, y_test)
print(f"测试准确率: {test_accuracy:.2%}")</pre>
                        </div>
                        <div class="warning-box">
                            <strong>⚠️ 注意：</strong>运行此代码需要安装TensorFlow：<code>pip install tensorflow</code>
                        </div>
                    `
                },
                {
                    title: "卷积神经网络（CNN）",
                    type: "text",
                    content: `
                        <p>CNN特别适合处理图像数据：</p>
                        <ul>
                            <li><strong>卷积层</strong>：提取图像特征</li>
                            <li><strong>池化层</strong>：降低数据维度</li>
                            <li><strong>全连接层</strong>：进行分类或回归</li>
                        </ul>
                        <p>CNN在图像识别、目标检测等领域表现优异。</p>
                    `
                }
            ]
        }
    },
    {
        id: 9,
        title: "自然语言处理（NLP）",
        description: "学习如何处理和理解人类语言",
        completed: false,
        content: {
            sections: [
                {
                    title: "NLP基础概念",
                    type: "text",
                    content: `
                        <p>自然语言处理（NLP）是AI的一个重要分支，专注于让计算机理解和生成人类语言。</p>
                        <p><strong>NLP的主要任务：</strong></p>
                        <ul>
                            <li><strong>文本分类</strong>：将文本分为不同类别</li>
                            <li><strong>情感分析</strong>：判断文本的情感倾向</li>
                            <li><strong>机器翻译</strong>：将一种语言翻译成另一种</li>
                            <li><strong>问答系统</strong>：回答用户的问题</li>
                            <li><strong>文本生成</strong>：生成连贯的文本</li>
                        </ul>
                    `
                },
                {
                    title: "文本预处理",
                    type: "code",
                    content: `
                        <p>文本处理的基本步骤：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>import re
from collections import Counter

# 示例文本
text = "Hello World! This is a sample text. AI is amazing!"

# 1. 转换为小写
text = text.lower()
print("小写:", text)

# 2. 移除标点符号
text = re.sub(r'[^\w\s]', '', text)
print("移除标点:", text)

# 3. 分词
words = text.split()
print("分词:", words)

# 4. 词频统计
word_count = Counter(words)
print("词频:", word_count)

# 使用NLTK进行更高级的处理
# pip install nltk
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# 下载必要的数据（首次运行需要）
# nltk.download('punkt')
# nltk.download('stopwords')

# 分词
tokens = word_tokenize(text)
print("NLTK分词:", tokens)

# 移除停用词
stop_words = set(stopwords.words('english'))
filtered_words = [w for w in tokens if w not in stop_words]
print("移除停用词:", filtered_words)</pre>
                        </div>
                    `
                },
                {
                    title: "使用预训练模型",
                    type: "code",
                    content: `
                        <p>使用Hugging Face的transformers库进行文本分类：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>from transformers import pipeline

# 安装: pip install transformers torch

# 情感分析
classifier = pipeline("sentiment-analysis")
result = classifier("I love AI programming!")
print("情感分析结果:", result)

# 文本生成
generator = pipeline("text-generation", model="gpt2")
text = generator("AI is", max_length=50, num_return_sequences=1)
print("生成的文本:", text)

# 问答系统
qa_pipeline = pipeline("question-answering")
context = "人工智能是计算机科学的一个分支，旨在创建智能系统。"
question = "什么是人工智能？"
answer = qa_pipeline(question=question, context=context)
print("答案:", answer['answer'])</pre>
                        </div>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>预训练模型可以大大简化NLP任务的开发，无需从零开始训练。
                        </div>
                    `
                }
            ]
        }
    },
    {
        id: 10,
        title: "计算机视觉",
        description: "学习如何让计算机\"看见\"和理解图像",
        completed: false,
        content: {
            sections: [
                {
                    title: "计算机视觉基础",
                    type: "text",
                    content: `
                        <p>计算机视觉（Computer Vision）使计算机能够从图像和视频中提取信息。</p>
                        <p><strong>主要应用：</strong></p>
                        <ul>
                            <li><strong>图像分类</strong>：识别图像中的对象</li>
                            <li><strong>目标检测</strong>：定位图像中的多个对象</li>
                            <li><strong>图像分割</strong>：将图像分成不同区域</li>
                            <li><strong>人脸识别</strong>：识别和验证人脸</li>
                            <li><strong>OCR</strong>：从图像中提取文字</li>
                        </ul>
                    `
                },
                {
                    title: "使用OpenCV处理图像",
                    type: "code",
                    content: `
                        <p>OpenCV是计算机视觉的常用库：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>import cv2
import numpy as np
from matplotlib import pyplot as plt

# 安装: pip install opencv-python matplotlib

# 读取图像
img = cv2.imread('image.jpg')

# 转换为灰度图
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 图像滤波
blurred = cv2.GaussianBlur(gray, (5, 5), 0)

# 边缘检测
edges = cv2.Canny(blurred, 50, 150)

# 显示图像
plt.figure(figsize=(12, 4))
plt.subplot(1, 3, 1)
plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
plt.title('原图')
plt.axis('off')

plt.subplot(1, 3, 2)
plt.imshow(gray, cmap='gray')
plt.title('灰度图')
plt.axis('off')

plt.subplot(1, 3, 3)
plt.imshow(edges, cmap='gray')
plt.title('边缘检测')
plt.axis('off')

plt.show()</pre>
                        </div>
                    `
                },
                {
                    title: "使用预训练模型进行图像分类",
                    type: "code",
                    content: `
                        <p>使用预训练的ResNet模型进行图像分类：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50
from PIL import Image

# 加载预训练模型
model = resnet50(pretrained=True)
model.eval()

# 图像预处理
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225])
])

# 加载和预处理图像
img = Image.open('image.jpg')
img_tensor = transform(img).unsqueeze(0)

# 预测
with torch.no_grad():
    outputs = model(img_tensor)
    _, predicted = torch.max(outputs, 1)
    
print(f"预测类别索引: {predicted.item()}")</pre>
                        </div>
                    `
                }
            ]
        }
    },
    {
        id: 11,
        title: "Python网络爬虫实战",
        description: "从想法、思路、技术到实现的完整爬虫学习路径",
        completed: false,
        content: {
            sections: [
                {
                    title: "Python网络爬虫：从想法到实现",
                    type: "text",
                    content: `
                        <p><strong>什么是网络爬虫？</strong></p>
                        <p>网络爬虫（Web Scraper）是一种自动获取网页信息的程序。它可以模拟浏览器访问网页，提取我们需要的数据。</p>
                        <p><strong>爬虫的应用场景：</strong></p>
                        <ul>
                            <li>数据采集：收集商品价格、新闻资讯、社交媒体数据</li>
                            <li>数据分析：为机器学习提供训练数据</li>
                            <li>监控变化：监控网站内容更新</li>
                            <li>信息聚合：整合多个网站的信息</li>
                        </ul>
                        <div class="warning-box">
                            <strong>⚠️ 重要提示：</strong>爬虫使用需遵守网站的robots.txt协议和法律法规，不要对网站造成过大负担。
                        </div>
                    `
                },
                {
                    title: "爬虫的基本思路和技术栈",
                    type: "text",
                    content: `
                        <p><strong>爬虫的基本工作流程：</strong></p>
                        <ol>
                            <li><strong>发送请求</strong>：向目标网站发送HTTP请求，获取网页内容</li>
                            <li><strong>解析内容</strong>：从HTML中提取需要的数据</li>
                            <li><strong>存储数据</strong>：将提取的数据保存到文件或数据库</li>
                            <li><strong>处理异常</strong>：处理网络错误、页面变化等情况</li>
                        </ol>
                        <p><strong>Python爬虫技术栈：</strong></p>
                        <ul>
                            <li><strong>requests</strong>：发送HTTP请求，获取网页内容</li>
                            <li><strong>BeautifulSoup</strong>：解析HTML，提取数据</li>
                            <li><strong>lxml</strong>：快速解析XML和HTML</li>
                            <li><strong>selenium</strong>：处理JavaScript渲染的页面</li>
                            <li><strong>scrapy</strong>：专业的爬虫框架</li>
                        </ul>
                        <div class="tip-box">
                            <strong>💡 安装库：</strong>使用 <code>pip install requests beautifulsoup4 lxml</code> 安装常用爬虫库。
                        </div>
                    `
                },
                {
                    title: "第一步：发送HTTP请求获取网页",
                    type: "code",
                    content: `
                        <p>使用requests库发送HTTP请求，这是爬虫的第一步：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>import requests

# 基本GET请求
url = "https://httpbin.org/get"
response = requests.get(url)

# 查看响应状态码
print(f"状态码: {response.status_code}")  # 200表示成功

# 获取响应内容
print(f"响应内容: {response.text[:200]}")  # 前200个字符

# 带参数的请求
params = {"key1": "value1", "key2": "value2"}
response = requests.get(url, params=params)
print(f"完整URL: {response.url}")

# 设置请求头（模拟浏览器）
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}
response = requests.get(url, headers=headers)

# 处理超时
try:
    response = requests.get(url, timeout=5)  # 5秒超时
except requests.Timeout:
    print("请求超时")
except requests.RequestException as e:
    print(f"请求错误: {e}")

# POST请求（提交表单数据）
post_url = "https://httpbin.org/post"
data = {"username": "test", "password": "123456"}
response = requests.post(post_url, data=data)
print(response.json())</pre>
                        </div>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>设置User-Agent很重要，可以避免被网站拒绝访问。httpbin.org是一个用于测试HTTP请求的网站。
                        </div>
                    `
                },
                {
                    title: "第二步：解析HTML提取数据",
                    type: "code",
                    content: `
                        <p>使用BeautifulSoup解析HTML，提取我们需要的数据：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>from bs4 import BeautifulSoup
import requests

# 获取网页内容
url = "https://example.com"
response = requests.get(url)
html_content = response.text

# 创建BeautifulSoup对象
soup = BeautifulSoup(html_content, 'lxml')  # 或使用'html.parser'

# 查找元素
# 1. 通过标签名
title = soup.find('title')
print(f"网页标题: {title.text}")

# 2. 通过class查找
divs = soup.find_all('div', class_='content')
for div in divs:
    print(div.text)

# 3. 通过id查找
element = soup.find(id='main-content')
print(element.text if element else "未找到")

# 4. 通过属性查找
links = soup.find_all('a', href=True)
for link in links:
    print(f"链接: {link['href']}, 文本: {link.text}")

# 5. CSS选择器（更强大）
articles = soup.select('article.title')
for article in articles:
    print(article.text)

# 6. 提取属性
img_tags = soup.find_all('img')
for img in img_tags:
    print(f"图片URL: {img.get('src', '无')}")
    print(f"图片alt: {img.get('alt', '无')}")

# 7. 处理嵌套结构
for article in soup.find_all('article'):
    title = article.find('h2')
    content = article.find('p')
    if title and content:
        print(f"标题: {title.text}")
        print(f"内容: {content.text}")
        print("---")</pre>
                        </div>
                    `
                },
                {
                    title: "完整示例：爬取新闻标题",
                    type: "code",
                    content: `
                        <p>让我们通过一个完整的例子来理解爬虫的实现过程：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def scrape_news(url):
    """
    爬取新闻网站标题的函数
    
    思路：
    1. 发送请求获取网页
    2. 解析HTML找到新闻标题
    3. 提取并整理数据
    4. 返回结构化数据
    """
    try:
        # 第一步：发送请求
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # 如果状态码不是200，抛出异常
        
        # 第二步：解析HTML
        soup = BeautifulSoup(response.text, 'lxml')
        
        # 第三步：提取数据（根据实际网站结构调整选择器）
        news_list = []
        
        # 假设新闻标题在<h2 class="news-title">标签中
        # 实际使用时需要根据目标网站调整
        titles = soup.find_all('h2', class_='news-title')
        
        for title in titles:
            news_item = {
                "title": title.text.strip(),
                "link": title.find('a')['href'] if title.find('a') else "",
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            news_list.append(news_item)
        
        return news_list
        
    except requests.RequestException as e:
        print(f"请求错误: {e}")
        return []
    except Exception as e:
        print(f"解析错误: {e}")
        return []

# 使用示例
if __name__ == "__main__":
    # 示例：爬取示例网站（实际使用时替换为真实URL）
    url = "https://example.com/news"
    news = scrape_news(url)
    
    # 打印结果
    for item in news:
        print(f"标题: {item['title']}")
        print(f"链接: {item['link']}")
        print("---")
    
    # 保存为JSON
    with open('news.json', 'w', encoding='utf-8') as f:
        json.dump(news, f, ensure_ascii=False, indent=2)
    print("数据已保存到news.json")</pre>
                        </div>
                        <div class="tip-box">
                            <strong>💡 提示：</strong>在实际使用中，需要先查看目标网站的HTML结构，然后调整选择器。可以使用浏览器的开发者工具（F12）查看元素。
                        </div>
                    `
                },
                {
                    title: "处理动态内容：使用Selenium",
                    type: "code",
                    content: `
                        <p>有些网站使用JavaScript动态加载内容，需要使用Selenium模拟浏览器：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def scrape_dynamic_content(url):
    """
    爬取JavaScript动态加载的网页
    
    思路：
    1. 启动浏览器（可以是无头模式）
    2. 访问网页，等待JavaScript执行
    3. 提取动态加载的内容
    4. 关闭浏览器
    """
    # 配置浏览器选项（无头模式，不显示浏览器窗口）
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # 无头模式
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    driver = None
    try:
        # 启动浏览器（需要安装ChromeDriver）
        driver = webdriver.Chrome(options=options)
        driver.get(url)
        
        # 等待页面加载完成
        wait = WebDriverWait(driver, 10)
        
        # 等待特定元素出现
        element = wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "content"))
        )
        
        # 滚动页面加载更多内容（如果需要）
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)  # 等待内容加载
        
        # 提取数据
        titles = driver.find_elements(By.CLASS_NAME, "title")
        results = []
        for title in titles:
            results.append(title.text)
        
        return results
        
    except Exception as e:
        print(f"错误: {e}")
        return []
    finally:
        if driver:
            driver.quit()  # 关闭浏览器

# 使用示例
# results = scrape_dynamic_content("https://example.com")
# print(results)</pre>
                        </div>
                        <div class="warning-box">
                            <strong>⚠️ 注意：</strong>Selenium需要安装浏览器驱动（如ChromeDriver），并且运行较慢。优先考虑使用requests+BeautifulSoup，如果不行再使用Selenium。
                        </div>
                    `
                },
                {
                    title: "实战案例：爬取图书信息",
                    type: "code",
                    content: `
                        <p>完整的实战案例：爬取图书网站的信息并保存：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>import requests
from bs4 import BeautifulSoup
import csv
import time
import random

class BookScraper:
    """
    图书爬虫类
    
    设计思路：
    1. 封装爬虫逻辑到类中，便于复用
    2. 添加请求间隔，避免被封
    3. 异常处理，提高稳定性
    4. 支持多种保存格式
    """
    
    def __init__(self, base_url):
        self.base_url = base_url
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
        self.books = []
    
    def get_page(self, url):
        """获取单个页面"""
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"获取页面失败 {url}: {e}")
            return None
    
    def parse_book_info(self, html):
        """解析图书信息"""
        soup = BeautifulSoup(html, 'lxml')
        books = []
        
        # 根据实际网站结构调整选择器
        # 这里使用示例结构
        book_items = soup.find_all('div', class_='book-item')
        
        for item in book_items:
            try:
                title = item.find('h3', class_='title')
                author = item.find('span', class_='author')
                price = item.find('span', class_='price')
                
                book = {
                    "title": title.text.strip() if title else "未知",
                    "author": author.text.strip() if author else "未知",
                    "price": price.text.strip() if price else "未知"
                }
                books.append(book)
            except Exception as e:
                print(f"解析图书信息失败: {e}")
                continue
        
        return books
    
    def scrape_pages(self, num_pages=5):
        """爬取多页数据"""
        for page in range(1, num_pages + 1):
            print(f"正在爬取第 {page} 页...")
            
            # 构建URL（根据实际网站调整）
            url = f"{self.base_url}?page={page}"
            
            html = self.get_page(url)
            if html:
                books = self.parse_book_info(html)
                self.books.extend(books)
                print(f"第 {page} 页获取到 {len(books)} 本图书")
            
            # 随机延迟，避免请求过快
            time.sleep(random.uniform(1, 3))
        
        print(f"总共获取到 {len(self.books)} 本图书")
        return self.books
    
    def save_to_csv(self, filename='books.csv'):
        """保存为CSV文件"""
        if not self.books:
            print("没有数据可保存")
            return
        
        with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=['title', 'author', 'price'])
            writer.writeheader()
            writer.writerows(self.books)
        
        print(f"数据已保存到 {filename}")
    
    def save_to_json(self, filename='books.json'):
        """保存为JSON文件"""
        import json
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.books, f, ensure_ascii=False, indent=2)
        print(f"数据已保存到 {filename}")

# 使用示例
if __name__ == "__main__":
    # 创建爬虫实例
    scraper = BookScraper("https://example.com/books")
    
    # 爬取数据
    books = scraper.scrape_pages(num_pages=3)
    
    # 保存数据
    scraper.save_to_csv('books.csv')
    scraper.save_to_json('books.json')
    
    # 查看结果
    for book in books[:5]:  # 显示前5本
        print(f"《{book['title']}》 - {book['author']} - {book['price']}")</pre>
                        </div>
                    `
                },
                {
                    title: "爬虫进阶技巧和注意事项",
                    type: "text",
                    content: `
                        <p><strong>爬虫进阶技巧：</strong></p>
                        <ul>
                            <li><strong>使用代理IP</strong>：避免IP被封，可以使用代理池</li>
                            <li><strong>设置请求间隔</strong>：使用time.sleep()避免请求过快</li>
                            <li><strong>处理Cookie和Session</strong>：保持登录状态</li>
                            <li><strong>使用Scrapy框架</strong>：处理大规模爬虫项目</li>
                            <li><strong>数据去重</strong>：使用集合或数据库避免重复数据</li>
                            <li><strong>增量爬取</strong>：只爬取新增或更新的内容</li>
                        </ul>
                        <p><strong>重要注意事项：</strong></p>
                        <ul>
                            <li>遵守robots.txt协议，尊重网站的爬虫规则</li>
                            <li>不要对网站造成过大负担，设置合理的请求频率</li>
                            <li>遵守相关法律法规，不要爬取隐私数据</li>
                            <li>注意数据的使用目的，不要用于商业用途（除非获得授权）</li>
                            <li>处理反爬虫机制（验证码、IP限制等）时要合法合规</li>
                        </ul>
                        <div class="success-box">
                            <strong>✅ 总结：</strong>爬虫是一个强大的工具，但使用时要负责任。从简单的requests+BeautifulSoup开始，逐步学习更高级的技术。
                        </div>
                    `
                }
            ]
        }
    },
    {
        id: 12,
        title: "实践项目：构建AI应用",
        description: "综合运用所学知识，构建一个完整的AI应用",
        completed: false,
        content: {
            sections: [
                {
                    title: "项目规划",
                    type: "text",
                    content: `
                        <p>让我们构建一个简单的图像分类Web应用：</p>
                        <p><strong>项目结构：</strong></p>
                        <ul>
                            <li>后端：使用Flask创建API</li>
                            <li>模型：使用预训练的CNN模型</li>
                            <li>前端：简单的HTML界面</li>
                        </ul>
                    `
                },
                {
                    title: "创建Flask API",
                    type: "code",
                    content: `
                        <p>创建一个简单的图像分类API：</p>
                        <div class="code-block">
                            <div class="code-block-header">
                                <span>python</span>
                                <button class="copy-btn" onclick="copyCode(this)">复制</button>
                            </div>
                            <pre>from flask import Flask, request, jsonify
from PIL import Image
import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50
import io

app = Flask(__name__)

# 加载模型
model = resnet50(pretrained=True)
model.eval()

# 图像预处理
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225])
])

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    img = Image.open(io.BytesIO(file.read()))
    img_tensor = transform(img).unsqueeze(0)
    
    with torch.no_grad():
        outputs = model(img_tensor)
        _, predicted = torch.max(outputs, 1)
    
    return jsonify({'class_id': predicted.item()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)</pre>
                        </div>
                    `
                },
                {
                    title: "下一步学习建议",
                    type: "text",
                    content: `
                        <div class="success-box">
                            <strong>🎉 恭喜！</strong>你已经完成了AI编程的基础学习！
                        </div>
                        <p><strong>继续学习的建议：</strong></p>
                        <ol>
                            <li><strong>深入学习</strong>：选择感兴趣的领域深入研究（NLP、CV、强化学习等）</li>
                            <li><strong>实践项目</strong>：完成更多实际项目，积累经验</li>
                            <li><strong>阅读论文</strong>：关注最新的AI研究进展</li>
                            <li><strong>参与社区</strong>：加入AI社区，与其他开发者交流</li>
                            <li><strong>持续学习</strong>：AI领域发展迅速，保持学习热情</li>
                        </ol>
                        <p><strong>推荐资源：</strong></p>
                        <ul>
                            <li>Coursera、edX等在线课程平台</li>
                            <li>GitHub上的开源项目</li>
                            <li>Kaggle竞赛平台</li>
                            <li>ArXiv论文库</li>
                        </ul>
                    `
                }
            ]
        }
    }
];

