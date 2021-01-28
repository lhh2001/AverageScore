var main = document.getElementById("main");
var loading = document.getElementById("loading");
var scoreData = null;
var semesterArray = new Array();

main.style.display = "none";
getScoreData();

document.getElementById("query").onclick = function()
{
	let selectObj = document.getElementById("semester");
	let semesterIndex = selectObj.selectedIndex;
	let semester = selectObj.options[semesterIndex].text;
	analyzeScoreData(scoreData, semester);
}

function getScoreData()
{
	let url = "http://ehall.xjtu.edu.cn/jwapp/sys/cjcx/modules/cjcx/jddzpjcxcj.do";
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.onreadystatechange = function()
	{
		if (xhr.responseText[0] != '{')
		{
			loading.textContent = "查询成绩异常! 请检查是否登录并打开成绩查询页面, 重启本程序";
			return;
		}
		main.style.display = "flex";
		loading.textContent = "选择学期";

		try
		{
			scoreData = JSON.parse(xhr.responseText)["datas"]["jddzpjcxcj"]["rows"];
		}
		catch
		{
			return;
		}

		for (let i = 0; i < scoreData.length; i++)
		{
			let currSemester = scoreData[i]["XNXQDM"];
			if (semesterArray.indexOf(currSemester) == -1)
			{
				semesterArray.push(currSemester);
				let option = document.createElement("option");
				option.value = currSemester;
				option.textContent = currSemester;
				document.getElementById("semester").appendChild(option);
			}
		}
	}
	xhr.send();
}

function analyzeScoreData(scoreData, semester)
{
	
	let majScore = calAverageScore(scoreData, true, semester);
	let totScore = calAverageScore(scoreData, false, semester);
	document.getElementById("major-score").textContent = majScore.toFixed(6);
	document.getElementById("total-score").textContent = totScore.toFixed(6);
}

function calAverageScore(scoreData, isMajorOnly, semester)
{
	let totalScore = 0.0;
	let totalCredit = 0.0;
	
	for (let i = 0; i < scoreData.length; i++)
	{
		if (isMajorOnly)
		{
			if (scoreData[i]["KCH"].indexOf("CORE") != -1 || scoreData[i]["KCH"].indexOf("GNED") != -1)
			{
				continue;
			}
		}
		if (semester != "all")
		{
			if (scoreData[i]["XNXQDM"] != semester)
			{
				continue;
			}
		}
		totalScore += scoreData[i]["ZCJ"] * parseFloat(scoreData[i]["XF"]);
        totalCredit += parseFloat(scoreData[i]["XF"]);
	}

	if (totalCredit == 0)
    {
		console.log("您所查询的学期不含任何成绩!请检查Cookie和学期是否输入正确!");
        return null;
	}
    return totalScore / totalCredit;
}
