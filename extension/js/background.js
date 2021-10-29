importScripts("./functions.js")
chrome.runtime.onInstalled.addListener(async function(details){
    if(details.reason == "install"){
        chrome.tabs.create({
            url: 'html/login.html'
        })
    }else if(details.reason == "update" && !await isLogin()){
        chrome.tabs.create({
            url: 'html/login.html'
        })
    }
})

chrome.runtime.onMessage.addListener((msg, sender, res)=>{
    switch(msg.type){
        case "login":
            chrome.tabs.create({
                url: 'html/login.html'
            })
            break;
    }
})