var main = document.getElementById("main");
var loading = document.getElementById("loading");
var scoreData = null;
var semesterArray = new Array();
var exceptionText = "查询成绩异常! 请检查是否登录ehall, 重启本程序";
var tableHead = "<tr><th>课程</th><th>学分</th><th>绩点</th><th>成绩</th></tr>";

// 程序所需的cookie
var mod = null;

main.style.display = "none";
getMod(); //先读取cookie中的MOD_AMP_AUTH, 获得服务端的身份认证

document.getElementById("query").onclick = function() //绑定点击"查询"的事件
{
	let selectObj = document.getElementById("semester");
	let semesterIndex = selectObj.selectedIndex;
	let semester = selectObj.options[semesterIndex].text;
	analyzeScoreData(semester);
}

function getMod()
{
	chrome.cookies.get({url: "http://ehall.xjtu.edu.cn/", name: "MOD_AMP_AUTH"},
	function(modCookie)
	{
		if (modCookie === null)
		{
			mod = localStorage.averageScoreMod;
			if (mod === undefined) //localStorage中没有存储mod, 浏览器中也没有mod, 说明是第一次登陆
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
			localStorage.averageScoreMod = mod; //更新localStorage中的mod
		}
		sendSelectRoleRequest(); //调用成绩查询的接口必须要有cookie中的_WEU
	});
	
}

function sendSelectRoleRequest() //获得_WEU需要先选择一个身份("移动应用学生"和"学生组")
{
	//url中传参, appId表示本应用的编号, 这里为ehall中的成绩查询
	let url = "http://ehall.xjtu.edu.cn/appMultiGroupEntranceList?appId=4768574631264620";
	let xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function()
	{
		let weuRequestUrl = null;
		try
		{
			weuRequestUrl = JSON.parse(xhr.responseText)["data"]["groupList"][1]["targetUrl"]; //选择"学生组"
		}
		catch(e)
		{
			console.log(e);
		}
		sendWeuRequest(weuRequestUrl);
	}
	xhr.send();
}

function sendWeuRequest(url) //发送打开成绩查询页面请求获得_WEU
{
	if (url === null)
	{
		return;
	}
	let xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function()
	{
		getScoreData();
	}
	xhr.send();
}

function getScoreData() //调用成绩查询的接口获得所有成绩
{
	let url = "http://ehall.xjtu.edu.cn/jwapp/sys/cjcx/modules/cjcx/jddzpjcxcj.do";
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.onreadystatechange = function()
	{
		if (xhr.responseText[0] !== '{')
		{
			loading.textContent = exceptionText;
			//请求失败, 删除已设置的Cookie防止污染
			chrome.cookies.remove({url: "http://ehall.xjtu.edu.cn/", name: "MOD_AMP_AUTH"}, function(){});
			return;
		}

		//请求成功, 显示"选择学期"和"查询"
		main.style.display = "flex";
		loading.textContent = "选择学期";

		try
		{
			scoreData = JSON.parse(xhr.responseText)["datas"]["jddzpjcxcj"]["rows"];
		}
		catch(e)
		{
			console.log(e);
			return;
		}

		//获得成绩表中所有不重复的学期
		for (let i = 0; i < scoreData.length; i++)
		{
			let currSemester = scoreData[i]["XNXQDM"];
			if (semesterArray.indexOf(currSemester) === -1)
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

function analyzeScoreData(semester) //分析得出平均分并显示
{
	
	let majScore = calAverageScore(true, semester);
	let totScore = calAverageScore(false, semester);
	document.getElementById("major-score").textContent = majScore.toFixed(6);
	document.getElementById("total-score").textContent = totScore.toFixed(6);
}

function calAverageScore(isMajorOnly, semester) //计算平均分的具体操作
{
	let totalScore = 0.0;
	let totalCredit = 0.0;

	if (isMajorOnly === false) //添加成绩显示的表头
	{
		document.getElementById("score-table-body").innerHTML = tableHead;
	}

	for (let i = 0; i < scoreData.length; i++)
	{
		if (semester !== "all")
		{
			if (scoreData[i]["XNXQDM"] !== semester)
			{
				continue;
			}
		}
		
		if (isMajorOnly === true)
		{
			if (scoreData[i]["KCH"].indexOf("CORE") !== -1 || scoreData[i]["KCH"].indexOf("GNED") !== -1)
			{
				continue;
			}
		}
		else //由于本函数执行两遍, 添加表格内容只在isMajorOnly为False时执行, 防止重复添加元素和漏添加核心通识课
		{
			//新建一行表格
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

	if (totalCredit === 0)
	{
		loading.textContent = "您所查询的学期不含任何成绩!请检查Cookie和学期是否输入正确!";
		return null;
	}
	return totalScore / totalCredit;
}
