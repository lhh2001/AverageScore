//本部分完成登录的操作
function encryptPwd(pwd) //本函数完成对密码的加密(西交登录平台采用AES ECB模式加密)
{
    let publicKey = '0725@pwdorgopenp';  //西交登录平台的key
    return encrypts = CryptoJS.AES.encrypt(pwd, CryptoJS.enc.Utf8.parse(publicKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
    }).toString();
}

function getLoginAppId(userName, pwd) //获得登录到ehall的appId
{
    let url = "http://ehall.xjtu.edu.cn/login?service=http://ehall.xjtu.edu.cn/new/index.html?browser=no";
    let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onloadend = function()
    {
        sendLoginRequest(userName, pwd);
    }
    xhr.send();
}

function sendLoginRequest(userName, pwd)
{
    
    let url = "http://org.xjtu.edu.cn/openplatform/g/admin/login";
    let xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onloadend = function()
    {
        try
        {
            let reData = JSON.parse(xhr.responseText);
            let code = reData["code"];
            if (code === 0) //成功登录
            {
                //记忆用户名以便下次登录
                localStorage.averageScoreUserName = userName;
                localStorage.averageScoreUserPwd = pwd;

                chrome.cookies.set({
                    url: "http://org.xjtu.edu.cn/",
                    name: "open_Platform_User",
                    value: reData["data"]["tokenKey"],
                    domain: "org.xjtu.edu.cn",
                    path: "/"
                });
                document.getElementById("login").style.display = "none";
                document.getElementById("score").style.display = "flex";
                getUserIdentity(reData["data"]["orgInfo"]["memberId"]);
            }
            else
            {
                smoke.alert(reData["message"]); //出错
                if (document.getElementById("verify-code").style.display !== "none") //此时需要验证码
                {
                    document.getElementById("verify-code-img").click();
                }
            }

            if (reData["message"] === "图形验证码不能为空(Graphic verification code cannot be empty)")
            {
                document.getElementById("verify-code").style.display = "flex";
                document.getElementById("verify-code-img").click();
            }
        }
        catch (e)
        {
            console.log(e);
        }
    }
    let sendData = {
        "loginType": 1,
        "username": userName,
        "pwd": pwd
    };
    if (document.getElementById("verify-code").style.display !== "none")
    {
        sendData["jcaptchaCode"] = document.getElementById("verify-code-text").value;
    }
    xhr.send(JSON.stringify(sendData));
}

document.getElementById("clear-cache").onclick = function() //退出登录事件
{
    let url = "http://ehall.xjtu.edu.cn/logout?service=http://ehall.xjtu.edu.cn/new/index.html?browser=no";
    let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onloadend = function()
    {
        localStorage.removeItem("averageScoreUserName");
        localStorage.removeItem("averageScoreUserPwd");
        window.close();
    }
    xhr.send();
}

document.getElementById("login").onkeypress = function(event) //绑定回车事件为点击"登录"
{
    if (event.key === "Enter")
    {
        document.getElementById("login-button").click();
    }
}

document.getElementById("login-button").onclick = function() //点击登录事件
{
    let userName = document.getElementById("username").value;
    let pwd = document.getElementById("pwd").value;
    getLoginAppId(userName, encryptPwd(pwd)); //在这里加密
}

document.getElementById("verify-code-img").onclick = function() //点击验证码事件
{
    let url = "http://org.xjtu.edu.cn/openplatform/g/admin/getJcaptchaCode";
    let xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onloadend = function()
    {
        try
        {
            let imgUrl = "data:image/png;base64," + JSON.parse(xhr.responseText)["data"];
            document.getElementById("verify-code-img").src = imgUrl; 
        }
        catch (e)
        {
            console.log(e);
        }
    }
    xhr.send();
}

function getUserIdentity(memberId) //获得身份
{
    let url = "http://org.xjtu.edu.cn/openplatform/g/admin/getUserIdentity?memberId=" + memberId;
    let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onloadend = function()
    {
        try
        {
            let reData = JSON.parse(xhr.responseText)["data"][0];
            getRedirectUrl(reData["userType"], reData["personNo"]);
        }
        catch (e)
        {
            console.log(e);
        }
    }
    xhr.send();
}

function getRedirectUrl(userType, personNo)
{
    let url = "http://org.xjtu.edu.cn/openplatform/oauth/auth/getRedirectUrl?userType=" + userType
    + "&personNo=" + personNo;
    let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onloadend = function()
    {
        try
        {
            visitEhall(JSON.parse(xhr.responseText)["data"]);
        }
        catch (e)
        {
            console.log(e);
        }
    }
    xhr.send();
}

function visitEhall(url) //访问ehall首页以获取Cookies
{
    let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onloadend = function()
    {
        try
        {
            sendSelectRoleRequest();
        }
        catch (e)
        {
            console.log(e);
        }
    }
    xhr.send();
}

function loadLocalUserInfo() //加载本地信息
{
    let userName = localStorage.averageScoreUserName;
    let pwd = localStorage.averageScoreUserPwd;
    if (userName !== undefined && pwd !== undefined)
    {
        document.getElementById("login").style.display = "none";
        getLoginAppId(userName, pwd);
    }
    else
    {
        document.getElementById("login").style.display = "flex";
    }
}

function hasLogin()
{
    let url = "http://ehall.xjtu.edu.cn/jsonp/getUserFirstLogin";
    let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onloadend = function()
    {
        let reData = null;
        try
        {
            reData = JSON.parse(xhr.responseText)["hasLogin"];
        }
        catch (e) //出现异常说明没有登录
        {
            console.log(e);
            loadLocalUserInfo();
            return;
        }
        if (reData === true)
        {
            document.getElementById("score").style.display = "flex";
            sendSelectRoleRequest();
        }
        else
        {
            loadLocalUserInfo();
        }
    }
    xhr.send();
}
