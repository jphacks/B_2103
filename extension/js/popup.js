let tabPort, backgroundPort
window.onload = async function(){
    let {url, title, id} = await getCurrentTab()
    if(!/^https?:\/\/(www.)?qiita.com\/.+\/items\/.+/g.test(url)){
        $(".latest").html(`
            <p>このページはQiitaの記事ではありません</p>
        `)
    }else{
        let port = chrome.tabs.connect(id)
        port.postMessage({type:"ugoita"})
        port.onMessage.addListener(res=>{
            console.log(res)
            let {type, data} = res
            switch(type){
                case "ugoita":
                    data = data.json
                    if(data.count){
                        let date = new Date(parseInt(data.time)*1000)
                        $(".latest-p2").text(`${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`)
                    }else{
                        $(".latest-p2").text(`まだ、動いた報告がありません。`)
                    }
                    break;
            }
        })
    }
}