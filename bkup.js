const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const PORT = 9999;
const dataBase = require('./data/dataBase.json');

let parseData = function(url) {
  let time = new Date();
  let parsedInfo = querystring.parse(url.split('?')[1]);
  parsedInfo.date = time.toLocaleString();
  dataBase.unshift(parsedInfo);
  fs.writeFileSync('./data/dataBase.json', JSON.stringify(dataBase));
  return;
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

getComments = function() {
  let dataToDisplay = '';
  dataBase.forEach(function(element) {
    dataToDisplay += '<br>' + element.date
    dataToDisplay += '_' + element.name
    dataToDisplay += '_' + element.comments + '<br>----------------------------';
  })
  return dataToDisplay;
}

let requestHandler = function(req, res) {
  let path = req.url;
  if(req.url=='/') {
    path='/flowerCatalog.html'
  }
  console.log(path);

  if (path == 'favicon.ico') {
    res.end();
    return;
  }

  if (req.url.startsWith('/GuestBook.html?')) {
    parseData(req.url);
    res.writeHead(302, {
      'Location': 'GuestBook.html'
    })
    res.end();
    return;
  }
  if (path == '/GuestBook.html') {
    let fileContents = fs.readFileSync('./public' + path, 'utf8');
    let comments = getComments();
    res.statusCode =   200;
    res.setHeader('Content-Type', getHeader(path));
    res.write(fileContents.replace(/NameAndComments/, comments));
    res.end();
    return;
  }

  if (fs.existsSync('./public' + path)) {
    let data = fs.readFileSync('./public' + path);
    res.statusCode = 200;
    res.setHeader('Content-Type', getHeader(path));
    res.write(data);
    res.end();
    return;
  }

  res.statusCode = 404;
  res.write('page not found');
  res.end();
  return;
}

let server = http.createServer(requestHandler);
server.listen(PORT);

console.log(PORT + '  listening');
