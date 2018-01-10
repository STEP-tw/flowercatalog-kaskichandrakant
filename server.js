let fs = require('fs');
const timeStamp = require('./time.js').timeStamp;
const http = require('http');
const WebApp = require('./webapp');
let toS = o => JSON.stringify(o, null, 2);
const dataBase = require('./data/dataBase.json');
let validUsers=[{name:'santosh',place:'karad'},{name:'sulagna',place:'kolkata'},{name:'vivek',place:'karad'}];

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

let redirectLoggedInUserToHome = (req, res) => {
  if (req.urlIsOneOf(['/', '/login']) && req.user) res.redirect('/GuestBook.html');
}

let serveFile = function(req, res) {
  if (req.method == "GET" && !req.url.startsWith('/Gu')) {
    serveStaticFile(req, res);
  }
}

let addComment = function(commentData,user) {
  commentData.date = new Date().toLocaleString();
  commentData.name=user.name;
  dataBase.unshift(commentData)
  fs.writeFileSync('./data/dataBase.json', JSON.stringify(dataBase));
}

let loadUser = (req, res) => {
  let sessionid = req.cookies.sessionid;
  let user = validUsers.find(u => u.sessionid == sessionid);
  if (sessionid && user) {
    req.user = user;
  }
};

let serveComments = function(dataBase) {
  let dataToDisplay = '';
  dataBase.forEach(function(element) {
    dataToDisplay +=element.date
    dataToDisplay += '_' + element.name
    dataToDisplay += '_' + element.comments + '</br>'
  })
  return dataToDisplay;
}

let app = WebApp.create();
app.use(logRequest);
app.use(serveFile);
app.use(loadUser);
app.use(redirectLoggedInUserToHome);

app.post('/submitComment', (req, res) => {
  addComment(req.body,req.user);
  res.redirect('/login');
  res.end();
});

app.get('/GuestBook.html', (req, res) => {
  let fileContents = fs.readFileSync('./public' + req.url, 'utf8');
  let comments = serveComments(dataBase);
  let user=req.user
  if(!user){
    res.redirect('/login')
    return;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', getHeader(req.url));
  res.write(fileContents.replace(/NameAndComments/, comments));
  res.end();
})

app.get('/login', (req, res) => {
  res.setHeader('Content-type', 'text/html');
  let comments = serveComments(dataBase);
  let fileData=fs.readFileSync('./public/GuestBookForAll.html','utf8')
  res.write(fileData.replace(/NameAndComments/, comments));
  res.end();
});

app.post('/login', (req, res) => {
  let user = validUsers.find(u => u.name == req.body.userName);
  req.user=req.body.userName;
  if (!user) {
    res.setHeader('Set-Cookie', `logInFailed=true`);
    res.redirect('/login');
    return;
  }
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie', `sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.redirect('/GuestBook.html');
});
app.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', [`loginFailed=false,Expires=${new Date(1).toUTCString()}`, `sessionid=0,Expires=${new Date(1).toUTCString()}`]);
  delete req.user.sessionid;
  res.redirect('/login');
});

const PORT = 5000;
let server = http.createServer(app);
server.on('error', e => console.error('**error**', e.message));
server.listen(PORT, (e) => console.log(`server listening at ${PORT}`));
