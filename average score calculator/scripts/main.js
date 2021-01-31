var loading = document.getElementById("loading");
var scoreData = null; //存储成绩信息
var semesterArray = new Array(); //存储学期的数组
var exceptionText = "查询成绩异常! 请退出并重新登录!"; //查询成绩异常信息
var tableHead = "<tr><th>课程</th><th>学分</th><th>绩点</th><th>成绩</th></tr>"; //成绩表的表头

window.onload = function()
{
	//所有初始要设置display为none的数组
	let displayNoneEleId = ["login", "score", "verify-code", "main"];
	for (let i = 0; i <displayNoneEleId.length; i++)
	{
		document.getElementById(displayNoneEleId[i]).style.display = "none";
	}
	hasLogin(); //先判断是否登录
}
