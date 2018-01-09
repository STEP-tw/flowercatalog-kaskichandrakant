let fs = require('fs');
const timeStamp = require('./time.js').timeStamp;
const http = require('http');
const WebApp = require('./webapp');
let toS = o => JSON.stringify(o, null, 2);
const dataBase = require('./data/dataBase.json');

let logRequest = (req, res) => {
  let text = ['------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${toS(req.headers)}`,
    `COOKIES=> ${toS(req.cookies)}`,
    `BODY=> ${toS(req.body)}`, ''
  ].join('\n');
  fs.appendFile('request.log', text, () => {});

  console.log(`${req.method} ${req.url}`);
}



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

let serveStaticFile = function(req, res) {
  let path = req.url;
  if (path == '/') {
    path = '/flowerCatalog.html'
  }
  if (fs.existsSync('./public' + path)) {
    let data = fs.readFileSync('./public' + path);
    res.statusCode = 200;
    res.setHeader('Content-Type', getHeader(path));
    res.write(data);
    res.end();
    return;
  }
}
let serveFile = function(req, res) {
  if (req.method == "GET" && !req.url.startsWith('/Gu')) {
    serveStaticFile(req, res);
  }
}
let addComment = function(commentData) {
  commentData.date = new Date().toLocaleString();
  dataBase.unshift(commentData)
  fs.writeFileSync('./data/dataBase.json', JSON.stringify(dataBase));
}

let serveComments = function(dataBase) {
  let dataToDisplay = '';
  dataBase.forEach(function(element) {
    dataToDisplay += '_' + element.date
    dataToDisplay += '_' + element.name
    dataToDisplay += '_' + element.comments + '</br>'
  })
  return dataToDisplay;
}



let app = WebApp.create();
app.use(logRequest);
app.use(serveFile);


app.post('/submitComment', (req, res) => {
  addComment(req.body);
  res.redirect('/GuestBook.html');
  res.end();
});


app.get('/GuestBook.html', (req, res) => {
  let fileContents = fs.readFileSync('./public' + req.url, 'utf8');
  let comments = serveComments(dataBase);
  res.statusCode = 200;
  res.setHeader('Content-Type', getHeader(req.url));
  res.write(fileContents.replace(/NameAndComments/, comments));
  res.end();
})


const PORT = 5000;
let server = http.createServer(app);
server.on('error', e => console.error('**error**', e.message));
server.listen(PORT, (e) => console.log(`server listening at ${PORT}`));
