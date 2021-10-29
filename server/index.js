const express = require('express')
const bcrypt = require("bcrypt")
const uuid = require("uuid")
const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    res.removeHeader("x-powered-by")
    next()
})
const { Deta } = require('deta')
const deta = Deta()
const db = deta.Base('users')
const tokendb = deta.Base('token')
const { Client } = require('pg')

async function connect(){
    let client = new Client({
        database: 'database',
        host: 'host',
        port: 5432,
        user: 'user',
        password: 'password'
    })
    await client.connect()
    return client
}
function isset(data){
    return (data === "" || data === null || data === undefined)
        ?false:true
}
async function newSession(user, email){
    token = uuid.v4()
    await tokendb.put({
        user: user,
        email: email
    }, key=token)
    return token
}

function isHanEisu(str){
    str = (str==null)?"":str;
    if(str.match(/^[A-Za-z0-9]*$/)){
      return true;
    }else{
      return false;
    }
}

app.get('/', (req, res) => res.status(200).json({}))

app.post("/register", async(req, res)=>{
    try{
        res.removeHeader("Access-Control-Allow-Headers")
        res.removeHeader("Access-Control-Allow-Origin")
        let { email, user, password } = req.body
        if(!isset(email) || !isset(user) || !isset(password)) {
            res.status(400).json({reason: "不正なリクエスト"})
            return
        }
        if(user.length < 6){
            res.status(400).json({
                reason: "ユーザー名は6文字以上である必要があります。"
            })
            return
        }
        if(!/^(?=.?[a-z])(?=.?[A-Z])(?=.*?\d)[a-zA-Z\d]{6,100}$/.test(password)){
            res.status(400).json({
                reason: "パスワードが条件を満たしていません。"
            })
            return
        }
        if(!isHanEisu(user)){
            res.status(400).json({
                reason: "ユーザー名に半角英数字以外の文字が含まれています。"
            })
            return
        }
        let result = await db.get(email)
        let {items} = await db.fetch({user: user})
        if (result || items.length) {
            res.status(409).json({
                reason: "This user already exist"
            })
            return
        } else {
            await db.put({
                user: user,
                email: email,
                password: bcrypt.hashSync(password, 10),
                pro: false,
                report: 0,
                ban: false,
                can_view: 0
            }, key=email)
            res.status(201).json({
                token: await newSession(user, email)
            })
        }
    }catch(e){
        console.log(e)
        res.status(500).json({
            reason: "Internal Server Error"
        })
    }
})

app.post("/login", async(req, res)=>{
    try{
        res.removeHeader("Access-Control-Allow-Headers")
        res.removeHeader("Access-Control-Allow-Origin")
        let {email, password} = req.body
        if(!isset(email) || !isset(password)){
            res.status(400).json({reason: "不正なリクエスト"})
            return
        }
        let result = await db.get(email)
        if(!result){
            res.status(400).json({reason: "invalid email or password"})
            return
        }
        if(!bcrypt.compareSync(password, result.password)){
            res.status(400).json({reason: "invalid email or password"})
            return
        }
        res.json({
            token: await newSession(result.user, result.email)
        })
    }catch(e){
        res.status(500).json({reason: "Internal Server Error"})
    }

})

app.post("/isReport", async(req, res)=>{
    try{
        let {token, url} = req.body
        if(!isset(token) || !isset(url)){
            res.status(400).json({
                reason: "不正なリクエスト"
            })
            return
        }
        let result = await tokendb.get(token)
        if(!result){
            res.status(401).json({
                reason: "Unauthorized"
            })
            return
        }
        let {user} = result
        let userDB = deta.Base(user)
        result = await userDB.get(url)
        if(result){
            res.json({
                result: true
            })
        }else{
            res.json({
                result: false
            })
        }
    }catch(e){
        console.log(e)
        res.status(500).json({
            reason: "Internal Server Error"
        })
    }
})

app.post("/report", async(req, res)=>{
    try{
        let {token, url, environment} = req.body
        if(!isset(token) || !isset(url) || !isset(environment)){
            res.status(400).json({
                reason: "不正なリクエスト"
            })
            return
        }
        let result = await tokendb.get(token)
        if(!result){
            res.status(401).json({
                reason: "Unauthorized"
            })
            return
        }
        let {user, email} = result
        let userDB = deta.Base(user)
        result = await userDB.get(url)
        if(result){
            res.status(400).json({
                reason:"既にこの記事の動作報告をしています。"
            })
            return
        }
        let {ban} = await db.get(email)
        if(ban){
            res.status(400).json({
                reason: "あなたのアカウントは報告を禁止されています"
            })
            return
        }
        let client = await connect()
        let sql = `INSERT INTO "ugoiita-code/ugoiita-code"."ugoiita" VALUES($1,$2,current_timestamp,$3);`
        result = await client.query(sql,[url, user, environment])
        client.end()
        result = await db.get(email)
        result.report++
        if(result.report % 5 == 0) result.can_view++
        await db.put(result, key=email)
        let now = new Date()
        now = parseInt(now.getTime()/1000)
        await userDB.put({url:url, time: now}, url)
        res.status(200).json({
            "result": true
        })
    }catch(e){
        console.log(e)
        res.status(500).json({
            reason: "Internal Server Error"
        })
    }
})

app.post("/get", async(req, res)=>{
    try{
        let client = await connect()
        let url = req.body.url
        if(!isset(url)){
            res.status(400).json({
                reason: "URL is not set"
            })
            return
        }
        let sql = `SELECT extract(EPOCH FROM time) AS time FROM "ugoiita-code/ugoiita-code"."ugoiita" WHERE url = $1 ORDER BY time DESC;`
        let result = await client.query(sql, [url])
        client.end()
        if(result.rowCount){
            res.status(200).json({
                time:result.rows[0].time,
                count: result.rowCount
            })
        }else{
            res.status(200).json({
                count: result.rowCount
            })
        }
    }catch(e){
        console.log(e)
        res.status(500).json({
            reason: "Internal SServer Error"
        })
    }
})

app.post("/get/detail", async(req, res)=>{
    try{
        let client = await connect()
        let {token, url} = req.body
        if(!isset(token) || !isset(url)){
            res.status(400).json({
                reason: "不正なリクエスト"
            })
            return
        }
        let result = await tokendb.get(token)
        if(!result){
            res.status(401).json({
                reason: "Unauthorized"
            })
            return
        }
        result = await db.get(result.email)
        if(!result.pro && !result.can_view){
            res.status(403).json({
                reason: "cannot view"
            })
            return
        }else{
            if(!result.pro){
                result.can_view--
                await db.put(result, result.email)
            }
        }
        let sql = `SELECT environment, extract(EPOCH FROM time) AS time FROM "ugoiita-code/ugoiita-code"."ugoiita" WHERE url = $1 ORDER BY time DESC LIMIT 30;`
        result = await client.query(sql, [url])
        client.end()
        res.status(200).json({
            deta:result.rows
        })
    }catch(e){
        console.log(e)
        res.status(500).json({
            reason: "Internal SServer Error"
        })
    }
})

app.post("/canView", async(req, res)=>{
    try{
        let {token} = req.body
        if(!isset(token)){
            res.status(400).json({
                reason: "不正なリクエスト"
            })
            return
        }
        let result = await tokendb.get(token)
        if(!result){
            res.status(401).json({
                reason: "Unauthorized"
            })
            return
        }
        result = await db.get(result.email)
        if(!result.pro && !result.can_view){
            res.json({
                result: false
            })
            return
        }else{
            res.status(200).json({
                result: true
            })
        }
    }catch(e){
        console.log(e)
        res.status(500).json({
            reason: "Internal SServer Error"
        })
    }
})

module.exports = app