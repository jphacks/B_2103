$(()=>{
    !(async()=>{
        if(await isLogin()){
            let tab = await getCurrentTab()
            chrome.tabs.remove(tab.id)
        }
    })
    $(".account-create-a").on("click", ()=>{
        $('.login-page').fadeOut(1)
        $('.login-blunder').fadeOut(1)
        $('.register-blunder').fadeOut(1)
        $('.register').fadeIn(5)
        
    })
    $(".register-login-button-a").on("click", ()=>{
        $('.register').fadeOut(1)
        $('.login-blunder').fadeOut(1)
        $('.register-blunder').fadeOut(1)
        $('.login-page').fadeIn(5)
        
    })

    $(".loginForm").on("submit", function(){
        let email = $(".login-email").val()
        let password = $(".loginForm [name=password]").val()
        login({
            email,
            password
        }).then(res=>{
            if(res.result){
                $('.login-page').fadeOut(1)
                $('.login-blunder').fadeOut(1)
                $('.login-success').fadeIn(5)
            }else{
                $('.login-blunder').fadeIn(5)
            }
        })
        return false
    })

    $(".registerForm").on("submit",function(){
        let user = $(".registerForm [name=user]").val()
        let password = $(".registerForm [name=password]").val()
        let email = $(".registerForm [name=email]").val()
        register({
            email,
            password,
            user
        }).then(res=>{
            if(res.result){
                $('.register-blunder').fadeOut(1)
                $('.register').fadeOut(1)
                $('.register-success').fadeIn(5)
            }
            else{
                $('.register-blunder').fadeIn(5)
            }
        })
        
        return false
    })
})