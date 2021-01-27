# -*- coding:utf-8 -*-  
import requests

def cal(scoreData, isMajorOnly, semester):
    totalScore = 0
    totalCredit = 0

    for ele in scoreData:
        if isMajorOnly: # 如果只计算主修, 课程号"CORE"(核心)和"GNED"(通识)不计算
            if ele["KCH"].find("CORE") != -1 or ele["KCH"].find("GNED") != -1:
                continue
        if semester != "all":
            if ele["XNXQDM"] != semester:
                continue
        totalScore += ele["ZCJ"] * float(ele["XF"])
        totalCredit += float(ele["XF"])

    if totalCredit == 0:
        print("您所查询的学期不含任何成绩!请检查Cookie和学期是否输入正确!")
        return None
    return totalScore / totalCredit


if __name__ == '__main__':

    # 发送请求获得所有成绩
    url = "http://ehall.xjtu.edu.cn/jwapp/sys/cjcx/modules/cjcx/jddzpjcxcj.do"
    headers = {"Cookie": input("请粘贴Cookie: ")}
    try:
        r = requests.post(url, headers=headers)
        scoreData = r.json()
    except:
        print("网络连接异常, 请检查Cookie是否正确")
    else:
        scoreData = scoreData["datas"]["jddzpjcxcj"]["rows"]

        semester = input("请输入查询学期(如\"2020-2021-1\", 如果查询全部请输入\"all\"): ")

        # 计算含选修的均分
        print("包含核心与通识的均分为: ", cal(scoreData, False, semester))

        # 计算主修均分
        print("不含核心与通识的均分为: ", cal(scoreData, True, semester))
