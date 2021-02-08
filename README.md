# AverageScore
西安交通大学平均分计算器

### 引用声明

1. https://github.com/hxgf/smoke.js
2. https://github.com/brix/crypto-js

### 使用方法

#### 如果您使用的是`Chrome`浏览器

1. 请下载`average score calculator.zip`并解压；
2. 请打开`Chrome`设置，选择左侧"扩展程序"，选择"加载已解压的扩展程序"，选择解压后的文件夹`average score calculator`并点击"选择文件夹"；
4. 在`Chrome`浏览器右上角点击拼图样图标，打开`average score calculator`扩展程序，按提示操作。

#### 如果您使用的是`Edge`浏览器

请打开`Edge`浏览器，直接在[Edge扩展程序商店](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home/)中搜索"西交均分计算器"并安装即可。

#### 使用`Python`脚本

语言：`Python 3.7`

1. 请使用`Chrome`或`Edge`浏览器登陆[ehall](http://ehall.xjtu.edu.cn/)；

2. 进入"成绩查询"服务，按`F12`打开开发者工具，上方工具栏中选中"网络"(`Network`)，在左侧列表中找到`jddzpjcxcj.do`(在最下面)并选中(如果列表中无内容请刷新)，在右侧“标头”(`Headers`)中找到"请求标头"(`Request Headers`)，将该部分中的`Cookie`冒号右边的内容复制；

![eg](https://github.com/lhh2001/AverageScore/raw/master/eg.png)

3. 打开`AverageScore.py`并运行，按提示粘贴`Cookie`，之后按提示输入学期(比如`2020-2021-1`表示`2020-2021`学年第一学期，如果需要计算所有学期请输入`all`)，程序即可计算出包含以及不包含核心通识课的均分。

### 更新日志

#### 2021.1.28 v1.0

1. 增加`Chrome`扩展程序操作

#### 2021.1.29 v1.1

1. 增加记忆`Cookie`功能

#### 2021.1.29 v1.2

1. 添加显示对应学期成绩的表格
2. 修复更改`Cookie`时可能的`BUG`

#### 2021.1.31 v2.0

1. 添加登录功能
2. 采用`smoke.js`优化`alert`效果
3. 记忆登录的方式由更改`Cookie`变为模拟发送登录请求，时效更长更稳定

### 坑之总结

1. `XMLHttpRequest`中的`onstatechange`事件每当`state`改变就会执行一次，因此在请求结束前可能执行多次；

2. `XMLHttpRequest`发送`POST`请求时请求头默认的`Content-Type`是`Text`，如果服务器会对这一字段进行校验，那么返回结果可能会异常，如果请求的`payload`为`json`格式应设置为

   ```js
   xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
   ```



