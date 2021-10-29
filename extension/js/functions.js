const endpoint = "https://ugoiita-code.deta.dev"

function getCurrentTab(){
    return new Promise(resolve=>{
        chrome.tabs.query({active:true,currentWindow:true},tabs=>{
            resolve(tabs[0])
        })
    })
}

function isset(data){
    return (data === "" || data === null || data === undefined)
        ?false:true
}

function isHanEisu(str){
    str = (str==null)?"":str;
    if(str.match(/^[A-Za-z0-9]*$/)){
      return true;
    }else{
      return false;
    }
}

async function isReport(url){
    let res = await get("/isReport", {
        token: (await chrome.storage.sync.get("token")).token,
        url
    })
    return res.json.result
}

async function isLogin(){
    let token = await chrome.storage.sync.get("token")
    if(token){
        return isset(token["token"])
    }
    return false
}

async function get(path, body){
    let res = await fetch(`${endpoint}${path}`, {
        method: "POST",
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    if(res.ok){
        return {
            ok: res.ok,
            json: await res.json(),
            status: res.status
        }
    }else{
        try{
            let r = await res.json()
            return {
                ok: res.ok,
                json: r,
                status: res.status
            }
        }catch(e){
            return {
                ok: res.ok,
                status: res.status
            }
        }
        
    }
}

async function login(data){
    if(!isset(data["email"]) || !isset(data["password"])){
        return {
            result: false,
            reason: "Eメールまたはパスワードが入力されていません"
        }
    }
    let {email, password} = data
    let res = await get("/login", {
        email,
        password
    })
    if(!res.ok){
        return {
            result:false,
            reason: res.json.reason || "ログインに失敗しました"
        }
    }
    chrome.storage.sync.set({
        token: res.json.token
    })
    return {
        result: true
    }
}

async function register(data){
    if(!isset(data["user"]) || !isset(data["email"]) || !isset(data["password"])){
        return {
            result: false,
            reason: "ユーザー名またはEメール、パスワードが入力されていません"
        }
    }
    let {user, email, password} = data
    if(user.length < 6){
        return {
            result: false,
            reason: "ユーザー名は6文字以上である必要があります。"
        }
    }
    if(!isHanEisu(user)){
        res.status(400).json({
            reason: "ユーザー名に半角英数字以外の文字が含まれています。"
        })
        return
    }
    if(!/^(?=.?[a-z])(?=.?[A-Z])(?=.*?\d)[a-zA-Z\d]{6,100}$/.test(password)){
        return {
            result: false,
            reason: "パスワードが条件を満たしていません。"
        }
    }
    let res = await get("/register", {
        user,
        email,
        password
    })
    if(!res.ok){
        return {
            result:false,
            reason: res.json.reason || "登録に失敗しました"
        }
    }
    chrome.storage.sync.set({
        token: res.json.token
    })
    return {
        result: true
    }
}

async function report(url, formData){
    if(!await isLogin()){
        return false
    }
    let environment = {}
    for(let i of formData){
        environment[i.name] = i.value
    }
    if(Object.keys(environment).includes("Virtual-environment-checkbox")) {
        if(!isset(environment["Virtual-environment-version"])){
            return false
        }
        delete environment["Virtual-environment-checkbox"]
    }else{
        delete environment["Virtual-environment-version"]
        delete environment["Virtual-environment-checkbox"]
    }
    for(let i in environment){
        if(!isset(environment[i])) return false
    }
    let res = await get("/report",{
        token: (await chrome.storage.sync.get("token")).token,
        url,
        environment
    })
    if(res.ok){
        return res.json.result
    }else{
        return false
    }
}

async function canView(){
    if(!await isLogin()){
        return false
    }
    let res = await get("/canView", {
       token: (await chrome.storage.sync.get("token")).token
    })
    if(res.ok){
        return res.json.result
    }else{
        return false
    }
}