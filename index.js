const express = require('express')
const api = require('./api')
const {createJob} = require('./cron');
const app = express()
const http = require('http');

const server = http.createServer(app);
const { Server } = require("socket.io");
const {oidCommentMap} = require("./commentSet");
const {getCommentList} = require("./api");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
});//启动io服务器



io.on('connection', (socket) => {
    console.log('a user connected');
    createJob(socket);//将socket作为参数传递
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });//对socket进行监听
});

server.listen(3001, () => {

    console.log('listening on *:3001');
});


express防止跨域
app.use((req, res, next)=> {
    res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Max-Age': 1728000,
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'Content-Type': 'application/json; charset=utf-8'
    })
    req.method === 'OPTIONS' ? res.status(204).end() : next()
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/get_comment_list/:pageNum', async (req, res) => {
    const commentList = await api.getCommentList(req.params.pageNum)//获取请求参数
    console.log(commentList);
    res.send('Hello World!')
})

app.get('/add_monitor/:oid', async (req, res) => {
    const oid = req.params.oid;
    //oid不存在或已经被监听
    if (!oid || oidCommentMap[oid]) {
        res.send('-1');
        return;
    }
    const data = await getCommentList(1, oid);
    if (!data){
        res.send('-2');
        return;
    }
    oidCommentMap[oid] = {}
});