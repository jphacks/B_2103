let detail, ugoita, port, reportStatus = false
let url = window.location.toString()
url = url.split("?")[0]
url = url.split("#")[0]

function showLatestReport(){
    if(ugoita.json.count){
        $(".ugoiita-report-btn").append(`<a class="ugoiita-count">${ugoita.json.count}</a>`)
        let date = new Date(parseInt(ugoita.json.time) * 1000)
        $(".ugoiita-day").append(`<span>${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日に動いた報告があります</span>`);
    }else{
        $(".ugoiita-report").append("<a>0</a>")
        $(".ugoiita-day").append("<span>まだ、動いた報告がありません</span>");
    }
}

function showReport(){
    if($(".ugoiita-report-form").css("display") == "block"){
        $(".ugoiita-report-form").css("display", "none")
    }else{
        $(".ugoiita-report-form").css("display", "block")
    }
}

function showReportButton(isReport){
    if(isReport){
        $(".ugoiita-report-btn").prepend(`
            <img src="${chrome.runtime.getURL("img/check.png")}">
        `)
    }else{
        $(".ugoiita-report-btn").prepend(`
            <img src="${chrome.runtime.getURL("img/icon.png")}">
        `)
        fetch(chrome.runtime.getURL("html/report.html"))
            .then(r=>r.text())
            .then(html=>{
            $(".ugoiita-report").append(html)
            
            //オートコンプリートに設定する値
            let langs = ["A","A +","ABAP","ABC","ABCL","ActionScript","ActiveBasic","Ada","Advanced Boolean Expression Language（ABEL）","Agena","AHDL","ALGOL","Alice","ash","APL","Apex","AppleScript","Arc","as","Atom","AutoIt","AutoLISP","AWK","B","Ballerina","Bash","BASIC","BCPL","Befunge","BF - BASIC","Bioera","BLISSBluespec","Boo","BrainCrash","Brainfuck","C","C#","C++","CAL","Caml","Cantata","CAP-X","CASL","Cecil","CFScript","Cg","Chapel","CHILL","Clipper","Clojure","CLU","Co-array","Fortran","COBOL","CoffeeScript","Common Lisp","Component Pascal","Concurrent Clean","Concurrent Prolog","Constraint Handling Rules","COW","CPL","csh","CUDA C","CUDA C++","Curl","Curry","Cω","D","Dart","dBase","Delphi","Dylan","ECMAScript","Eiffel","Elixir","Emacs Lisp","Enterprise Generation Language","Erlang","Escapade","Esterel","Euclid","Euphoria","E","F*","F#","Factor","Falcon","False","Fantom","Ferite","Ficl","Flavors","FlowDesigner","Forth","FORTRAN（Fortran)","Fortress","FoxPro","GLSL","Go","Google Apps Script","Groovy","Guarded","Horn Clauses","Hack","HAL / S","Hardware Join Java","Haskell","Haxe","HDCaml","HLASM","HLSL","HML","HOLON","HSP","HQ9+","Hydra","HyperTalk","Icon","ID","IDL(interactive data language)","Inform","InScript","INTERCAL","Io","IPL","IronPython","ISWIM","J","Java","Jancy","Java FX Script","JavaScript","JHDL","JScript.NET","JSFuck","J#","JSX","Jolie","Julia","Jython","KEMURI","Kent Recursive Calculator","Kuin","KL1","KornShell","Kotlin","LabVIEW","Lazy K","Lava","LFE","Limbo","Linda","Linden Scripting Language","Lingo","Lisaac","LISP","LOGO","Lola","LotusScript","Lua","Lucid","Lush","Lustre","M言語","m4","Malbolge","Mana","Maple","MASM","MATLAB","Mathematica","Max","Mercury","Mesa","MIL / W","Mind","Mindscript","Miranda","Misa","MixJuice","ML","Modula - 2","Modula - 3","MONAmona","Mops","MQL4","MQL5","MSIL","MyHDL","Napier88","NASM","Nemerle","Nim","Noop","NScripter","O","Oberon","Oberon - 2","Object Pascal","Object REXX","Object Tcl","Objective - C","Objective Caml","Occam","Ook!","OpenOffice.org Basic","OPS","Oz","P′′","Pacbase","PALASM","PARLOG","Pascal","PBASIC","PCN(program composition notation)","Perl","PHP","Pic","Piet","Pike","pine","PL / 0","PL / I","Planner","pnuts","Pony","PostScript","PowerBuilder","PowerShell","Processing","Prograph CPX","Prolog","Pure Data","PureScript","PWCT(en: PWCT_(software))","Pxem","Python","QtScript","Quorum","R","Racket","REALbasic","REBOL","REXX","RHDL","Ring","RPG","RPL","Ruby","Rust","SAL","SAS","Sather","Scala","Scheme","Scratch","Seed7","Self","SFL","sh","Shakespeare","Short Code","SiMPLE","Simula","Simulink","SISAL","SKILL","SLIP","Smalltalk","SMILEBASIC","SNOBOL","SPARK","Squeak","Squirrel","SPSS","Standard ML","Stata","superC","Swift","SystemC","SystemVerilog","t3x","TAL","Telescript","TeX","Text Executive Programming Language","Tcl","tcsh","Tenems","TL / I","Tonyu System","TTS","TTSneo","Turing","TypeScript","Unified Parallel C","Unlambda","UnrealScript","VBScript","velato","Visual Basic","Visual Basic.NET","Visual C.NET","Visual C++ .NET","Visual C#.NET","Verilog HDL","VHDL","Viscuit","Vala","V","Whirl","Whitespace","WICS","WMLScript","Wyvern","X10","XQuery","XSLT","zsh","Zoem","ドリトル","なでしこ","ひまわり","秀丸マクロ","プロデル","プログレスII"]
                
            //オートコンプリート値を設定する
            for(let lang of langs){
                let op = document.createElement("option");
                op.value = lang;
                document.getElementById("dt1").appendChild(op);
            }
            
            $("#Virtual-environment-checkbox").on("click", function(){
                $(".ugoiita-report-form").css("height", $(this).prop("checked") ? "470px": "405px")
            })
            
            $(".report-submit-btn").on("click", ()=>{
                if(reportStatus) return
                reportStatus = true
                let formData = $("#ugoiita-report-form").serializeArray()
                report(url, formData).then(r=>{
                    if(r){
                        $(".ugoiita-report-btn").children("img").attr("src", chrome.runtime.getURL("img/check.png"))
                        $(".ugoiita-report-form").remove()
                        get("/get", {
                            url:url
                        }).then(r=>{
                            ugoita = r
                            $(".ugoiita-count").html(ugoita.json.count)
                            let date = new Date(parseInt(ugoita.json.time) * 1000)
                            $(".ugoiita-day").children("span").html(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日に動いた報告があります`);
                        })
                    }else{
                        reportStatus = false
                    }
                })
            })

        })
        $(".ugoiita-report-btn").on("click", async()=>{
            if(!await isLogin()){
                chrome.runtime.sendMessage({
                    type: "login"
                })
            }else{
                showReport()
            }
        })
    }
}

chrome.runtime.onConnect.addListener(port=>{
    port.onMessage.addListener(async req=>{
        switch(req.type){
            case "ugoita":
                port.postMessage({
                    ...req,
                    data: ugoita
                })
                break;
        }
    })
})

window.onload = ()=>{
    fetch(chrome.runtime.getURL("html/ugoita.html"))
        .then(r=>r.text())
        .then(html=>{
        $(".css-8w2a1m").append(html)
        let imgURL = chrome.runtime.getURL("img/icon.png");
        $(".ugoiita-name").prepend($("<img>", {
            src: imgURL
        }))
    })
    $(".css-11t2ec1").prepend(`
        <div class="ugoiita-report">
            <div class="ugoiita-report-btn"></div>
        </div>
    `)
    isReport(url).then(r=>{
        showReportButton(r)
    })
    get("/get", {
        url:url
    }).then(r=>{
        ugoita = r
        showLatestReport()
    })
}
