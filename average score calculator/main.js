var main = document.getElementById("main");
var loading = document.getElementById("loading");
var scoreData = null;
var semesterArray = new Array();
var exceptionText = "查询成绩异常! 请检查是否登录并打开成绩查询页面, 重启本程序";
var tableHead = "<tr><th>课程</th><th>学分</th><th>绩点</th><th>成绩</th></tr>";

// 程序所需的cookie
var weu = null;
var mod = null;

main.style.display = "none";
getWeu(getScoreData);

function getWeu(callback)
{
	chrome.cookies.get({url: "http://ehall.xjtu.edu.cn/jwapp/", name: "_WEU"},
	function(weuCookie)
	{
		if (weuCookie == null)
		{
			weu = localStorage.averageScoreWeu;
			if (!weu)
			{
				loading.textContent = exceptionText;
				return;
			}
			chrome.cookies.set({
				url: "http://ehall.xjtu.edu.cn/jwapp/",
				name: "_WEU",
				value: weu,
				domain: "ehall.xjtu.edu.cn",
				path: "/jwapp/"
			});
		}
		else
		{
			weu = weuCookie.value;
			localStorage.averageScoreWeu = weu;
		}
		getMod(callback)
	});
}

function getMod(callback)
{
	chrome.cookies.get({url: "http://ehall.xjtu.edu.cn/", name: "MOD_AMP_AUTH"},
	function(modCookie)
	{
		if (modCookie == null)
		{
			mod = localStorage.averageScoreMod;
			if (!mod)
			{
				loading.textContent = exceptionText;
				return;
			}
			chrome.cookies.set({
				url: "http://ehall.xjtu.edu.cn/",
				name: "MOD_AMP_AUTH",
				value: mod,
				domain: "ehall.xjtu.edu.cn",
				path: "/"
			});
		}
		else
		{
			mod = modCookie.value;
			localStorage.averageScoreMod = mod;
		}
		callback();
	});
	
}

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
			loading.textContent = exceptionText;
			//请求失败, 删除已设置的Cookie防止污染
			chrome.cookies.remove({url: "http://ehall.xjtu.edu.cn/jwapp/", name: "_WEU"}, function(){});
			chrome.cookies.remove({url: "http://ehall.xjtu.edu.cn/", name: "MOD_AMP_AUTH"}, function(){});
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

	if (!isMajorOnly)
	{
		document.getElementById("score-table-body").innerHTML = tableHead;
	}

	for (let i = 0; i < scoreData.length; i++)
	{
		if (semester != "all")
		{
			if (scoreData[i]["XNXQDM"] != semester)
			{
				continue;
			}
		}
		
		if (isMajorOnly)
		{
			if (scoreData[i]["KCH"].indexOf("CORE") != -1 || scoreData[i]["KCH"].indexOf("GNED") != -1)
			{
				continue;
			}
		}
		else //由于本函数执行两遍, 防止重复添加元素
		{
			//新建表格的一行
			let textData = [scoreData[i]["KCM"], scoreData[i]["XF"], scoreData[i]["XFJD"], scoreData[i]["ZCJ"]];
			let tr = document.createElement("tr");
			for (let j = 0; j < textData.length; j++)
			{
				let td = document.createElement("td");
				td.textContent = textData[j];
				tr.appendChild(td);
			}
			document.getElementById("score-table-body").appendChild(tr);
		}

		totalScore += scoreData[i]["ZCJ"] * parseFloat(scoreData[i]["XF"]);
		totalCredit += parseFloat(scoreData[i]["XF"]);
	}

	if (totalCredit == 0)
    {
		loading.textContent = "您所查询的学期不含任何成绩!请检查Cookie和学期是否输入正确!";
        return null;
	}
    return totalScore / totalCredit;
}
