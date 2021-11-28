const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const path = require('path');
const session = require('express-session');
const {initOrg2, sendRequest, readResponse} = require('./operate');

const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors())
// 使用views文件夹
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html', require('ejs').__express);
// 使用public文件夹
app.use(express.static(path.join(__dirname, 'public')));

// 初始化seesion
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
}));

var contract;
var username = '';
var requestID = 1;

app.get('/', async (req, res) => {
    res.redirect('login');
})
app.get('/login', async (req, res) => {
    res.render('login');
})

app.post('/login', async (req, res) => {
    try{
        username = req.body.username;
        req.session.username = username;
        contract = await initOrg2(username);
        console.log(username);
        res.render('home');
    }catch(error){
        throw error;
    }

})

app.get('/home', async (req, res) => {
    if (req.session.username){
        res.render('home');
    }else{
        res.redirect('login');
    }
})

app.get('/buy', async (req, res) => {
    if (req.session.username){
        res.render('buy');
    }else{
        res.redirect('login');
    }
})

app.post('/sendRequest', async (req, res) => {
    if (req.session.username){
        try{
            const proposal = req.body.proposal;
            const requestStr = requestID.toString();
            const time = req.body.requestTime;
            //var output = "您的请求发送成功";
            var output = await sendRequest(contract, proposal, requestStr, time);
            // output是发送结果: expected: 您的请求发送成功！
            console.log(proposal, requestStr, time);
            res.send(output);
        }catch(error){
            throw error;
        }
    }else{
        res.redirect('login');
    }

})

app.get('/historytxn', async (req, res) => {
    if (req.session, username){
        res.render('historytxn');
    }else{
        res.redirect('login');
    }
})

app.get('/readResponse', async (req, res) => {
    if (req.session.username){
        try{
            var output = [{"编号":"1","时间":Date().toLocaleString(),"内容":"查总量","结果":"10000"}];
            output = await readResponse(contract);
            // output需要解析；expected: table(请求编号，请求时间，请求内容，结果)
            console.log(output);
            res.json(output);
        }catch(error){
            throw error;
        }
    }else{
        res.redirect('login');
    }
    
})

app.use(function(err, req, res, next){
    res.send(err.stack);
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
