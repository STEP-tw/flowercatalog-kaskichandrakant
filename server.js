let fs = require('fs');
const timeStamp = require('./time.js').timeStamp;
const http = require('http');
const WebApp = require('./webapp');

let getHeader = function(fileName) {
  let ext = fileName.slice(fileName.lastIndexOf('.') + 1)
  let extObj = {
    'css': 'text/css',
    'jpg': 'img/jpg',
    'gif': 'img/gif',
    'pdf': 'text/pdf',
    'js': 'text/javascript',
    'html': 'text/html'
  }
  return extObj[ext]
}

let serveStaticFile=function(req,res){
  let path =req.url;
  if (fs.existsSync('./public' + path)) {
    let data = fs.readFileSync('./public' + path);
    res.statusCode = 200;
    res.setHeader('Content-Type', getHeader(path));
    res.write(data);
    res.end();
    return;
  }
}

let serveFile=function(req,res) {
  if(req.method=="GET")
    serveStaticFile(req,res);
}

let app = WebApp.create();
app.use(serveFile);


const PORT = 5000;
let server = http.createServer(app);
server.on('error', e => console.error('**error**', e.message));
server.listen(PORT, (e) => console.log(`server listening at ${PORT}`));
