const http = require('http');
const { exec } = require('child_process');
const server = http.createServer((req, res) => {
    const express = require('express');
    const multer = require('multer');
    const app = express();
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            exec(body, (error, stdout, stderr) => {
                if (error) {
                    res.writeHead(500);
                    res.end(error.message);
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(stdout);
            });
        });
    } else {
        const auth = req.headers['authorization'];
        if (!auth || auth.indexOf('Basic ') !== 0) {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Command Runner"' });
            res.end();
            return;
        }
        const credentials = Buffer.from(auth.slice(6), 'base64').toString().split(':');
        const username = credentials[0];
        const password = credentials[1];
        if (username !== 'admin' || password !== 'password') {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Command Runner"' });
            res.end();
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
       <form method="post">
       <style>
        body{
            background-color: #ffffff;

        }


        input{
            background: transparent;
            color: #000000;
            padding: 1% 2%;
            outline: none;
            border-radius: 8px;
            margin-right:1%;
        }
        
        form{
            margin-top: 2%;
            border: 2px solid #000000;
            background: transparent;
            text-transform: uppercase;
            color: #000000;
            padding: 1% 2%;
            outline: none;
            border-radius: 8px;
            margin-right:1%;
        }
        label{
            margin-top: 2%;
            border: 2px solid #000000;
            background: transparent;
            color: #000000;
            padding: 1% 2%;
            outline: none;
            border-radius: 8px;
            margin-right:1%;
        }
        textarea{
            margin-top: 2%;
            border: 2px solid #000000;
            background: transparent;
            text-transform: uppercase;
            color: #000000;
            padding: 1% 2%;
            outline: none;
            border-radius: 8px;
            margin-left:30%;
            width: 40%;
            height: 200px; 
        }
    </style>
        <label for="command">Command:</label><br>
        <textarea id="command" name="command" rows="4" cols="50"></textarea><br>
        <input type="submit" value="Submit">
      </form>
      <script>
        alert('Server started!');
        const form = document.querySelector('form');
        form.addEventListener('submit', event => {
          event.preventDefault();
          const command = document.querySelector('#command').value;
          fetch(form.action, {
            method: 'POST',
            body: command,
          })
            .then(response => response.text())
            .then(text => {
              const output = document.createElement('pre');
              output.textContent = text;
              document.body.appendChild(output);
            })
            .catch(error => {
              alert(error.message);
            });
        });
      </script>
    `);
    }
});

server.listen(3000, () => {
    console.log('Server started!3001');
});
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
let counter = 1; // 初始化计数器为1

const app = express();


// 解析表单数据
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// 处理POST请求并写入文件
app.post('/submit', (req, res) => {
    const formData = req.body;
    const data = Object.keys(formData).map(key => `${key}: ${formData[key]}`).join('\n');
    const fileName = `userdata/${counter}.txt`; // 生成文件名，使用计数器值
    const filePath = path.join(__dirname, fileName);

    fs.writeFile(filePath, data, (err) => {
        if (err) {
            console.error('抱歉我们无法保存您的文件:', err);
            res.status(500).send('Error writing data to file');
        } else {
            console.log(`某个用户文件已经保存到 ${fileName}`);
            res.send(`表格已经提交，感谢您的反馈`);
        }
        counter++; // 每次成功写入后，计数器自增1
    });
});

// 启动服务器并监听端口
app.listen(3001, () => {
    console.log('服务器运行在端口3000');
});




const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // 设置上传文件保存的目录

// 列出文件
app.get('/', (req, res) => {
    fs.readdir('userdata', (err, files) => {
        if (err) {
            return res.status(500).send('Error reading directory');
        }
        res.send('<html><body><h1>Files in userdata directory:</h1><ul>');
        files.forEach(file => {
            res.send(`<li>${file}</li>`);
        });
        res.send('</ul></body></html>');
    });
});

// 上传文件
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    fs.rename(req.file.path, `userdata/${req.file.originalname}`, (err) => {
        if (err) {
            return res.status(500).send('Error moving file');
        }
        res.send('File uploaded and saved in userdata directory');
    });
});

// 删除文件
app.delete('/:filename', (req, res) => {
    const fileName = req.params.filename;
    fs.unlink(`userdata/${fileName}`, (err) => {
        if (err) {
            return res.status(500).send('Error deleting file');
        }
        res.send(`File ${fileName} deleted`);
    });
});

app.listen(3002, () => console.log('Server started on port 3002'));