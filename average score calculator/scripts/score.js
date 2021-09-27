//本部分完成和成绩查询、分析及显示相关的操作
document.getElementById("score").onkeyup = function(event) //绑定回车事件为点击"查询"
{
    if (event.key === "Enter")
    {
        document.getElementById("query").click();
    }
}

document.getElementById("select-all").onclick = function(event) //全选 & 全不选
{
    let checkBoxContainer = document.getElementById("semester");
    let checkBoxs = checkBoxContainer.getElementsByTagName("input");

    let checked = document.getElementById("select-all").value === "全选" ? true : false;

    for (let i = 0; i < checkBoxs.length; i++)
    {
        if (checkBoxs[i].checked ^ checked)
        {
            checkBoxs[i].click();
        }
    }
}

function onCheckedChange() //checkbox的checked属性改变事件
{
    let checkBoxContainer = document.getElementById("semester");
    let checkBoxs = checkBoxContainer.getElementsByTagName("input");

    let cnt = 0;

    for (let i = 0; i < checkBoxs.length; i++)
    {
        if (checkBoxs[i].checked)
        {
            cnt++;
        }
    }

    if (cnt === semesterArray.length)
    {
        document.getElementById("select-all").value = "全不选";
    }
    else
    {
        document.getElementById("select-all").value = "全选";
    }
}

document.getElementById("query").onclick = function() //绑定点击"查询"的事件
{
    let checkBoxContainer = document.getElementById("semester");
    let checkBoxs = checkBoxContainer.getElementsByTagName("input");
    let semester = new Array();

    for (let i = 0; i < checkBoxs.length; i++)
    {
        if (checkBoxs[i].checked)
        {
            semester.push(checkBoxs[i].value);
        }
    }

    analyzeScoreData(semester);
}

function sendSelectRoleRequest() //获得_WEU需要先选择一个身份("移动应用学生"和"学生组")
{
    //url中传参, appId表示本应用的编号, 这里为ehall中的成绩查询
    let url = "http://ehall.xjtu.edu.cn/appMultiGroupEntranceList?appId=4768574631264620";
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onloadend = function()
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
        loading.textContent = exceptionText;
        return;
    }
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onloadend = function()
    {
        getUserName();
        getScoreData();
    }
    xhr.send();
}


function getUserName() //获得用户的姓名
{
    let url = "http://ehall.xjtu.edu.cn/jsonp/userDesktopInfo.json";
    let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onloadend = function()
    {
        try
        {
            let userName = JSON.parse(xhr.responseText)["userName"];
            document.getElementById("welcome").textContent = "您好! " + userName + "同学!";
        }
        catch (e)
        {
            console.log(e);
        }
    }
    xhr.send();
}

function getScoreData() //调用成绩查询的接口获得所有成绩
{
    let url = "http://ehall.xjtu.edu.cn/jwapp/sys/cjcx/modules/cjcx/jddzpjcxcj.do";
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.onloadend = function()
    {
        try
        {
            scoreData = JSON.parse(xhr.responseText)["datas"]["jddzpjcxcj"]["rows"];
        }
        catch(e)
        {
            console.log(e);
            loading.textContent = exceptionText;
            return;
        }

        //请求成功, 显示"选择学期"和"查询"
        let main = document.getElementById("main");
        main.style.display = "flex";
        loading.textContent = "选择学期: ";

        let checkBoxContainer = document.getElementById("semester");

        //获得成绩表中所有不重复的学期
        for (let i = 0; i < scoreData.length; i++)
        {
            let currSemester = scoreData[i]["XNXQDM"];
            if (semesterArray.indexOf(currSemester) === -1)
            {
                semesterArray.push(currSemester);

                let label = document.createElement("label");
                label.className = "semester-checkbox";

                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = currSemester;
                checkbox.onclick = onCheckedChange;

                let text = document.createElement("a");
                text.textContent = currSemester;

                label.appendChild(checkbox);
                label.appendChild(text);

                checkBoxContainer.appendChild(label);
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
        if (semester.findIndex(e => e === scoreData[i]["XNXQDM"]) === -1)
        {
            continue;
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
        loading.textContent = "分析出现异常! 您所查询的学期不含任何成绩!";
        return null;
    }
    else
    {
        loading.textContent = "选择学期: ";
        return totalScore / totalCredit;
    }
}
