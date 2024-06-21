//Install express server
const express = require('express');
const path = require('path');

const multer = require('multer');
const fs = require('fs');

const app = express();

const uploadsDir = __dirname + '/dist/ontology-based-modelling-environment/uploads/';

if(!fs.existsSync(uploadsDir)){
  fs.mkdir(uploadsDir, function(err){
    if(err){
      console.log('Failed to create directory ' + directory + '.');
      return;
    }
  });
}

const storage = multer.diskStorage({
  destination:function (req,file,cb){

    if(req.body === undefined || req.body.prefix === undefined){
      console.log('No prefix defined.');
      return;
    }

    const directory =uploadsDir + req.body.prefix;

    if(fs.existsSync(directory)){

      cb(null,directory);

    }else{

      fs.mkdir(directory,function (err){

        if(err){
          console.log('Failed to create directory ' + directory + '.');
          return;
        }else{
          cb(null,directory);
        }
      });

    }

  },
  filename:function (req,file,cb){

    name = req.body.fileName;
    console.log('Name: '+name);
    cb(null, name);
  }
});

upload = multer({storage:storage})

app.post('/upload', upload.single('image'), function (req, res,next){
  console.log('Uploading image');

  console.log('FileName: ' + req.body.fileName);
  console.log('Prefix: ' + req.body.prefix);

});

function getImageURLs(basePath){

  let urls = {};

  let absolutePath = __dirname + '/dist/ontology-based-modelling-environment' + basePath;

  fs.readdirSync(absolutePath, {withFileTypes:true}).filter(file=>file.isDirectory()).forEach(p=>{

    urls[p.name] = [];

    fs.readdirSync(absolutePath + '/' + p.name,{withFileTypes:true}).forEach(file=>{

      urls[p.name].push(file.name);

    });

  });

  return urls;
}

//Get all images in 'assets/images' and 'uploads'
app.get('/images',function (req,res,next){

  let urls = getImageURLs('/assets/images');

  let urls2 = getImageURLs('/uploads');

  //Combine the results from the two locations
  for(let category in urls2){
    if(urls[category]){
      urls[category] = urls[category].concat(urls2[category]);
    }else{
      urls[category] = urls2[category];
    }
  }

  res.json(urls);

});

app.get('/images/*',function(req,res,next){
  let url = req.url.replace('/images/','');

  let baseDir = __dirname+'/dist/ontology-based-modelling-environment/';

  if(fs.existsSync(path.join(baseDir, 'assets','images', url))){
    res.sendFile(path.join(baseDir, 'assets','images', url));

  }else if(fs.existsSync(path.join(baseDir, 'uploads', url))){
    res.sendFile(path.join(baseDir, 'uploads', url));

  }else{
    console.log('Could not find image: ' + url);
    next();
  }

});

//Intercept requests to '/api' and return the url of the webservice endpoint.
app.get('/api', function (req, res, next) {

  //Read the environment variable WEBSERVICE_ENDPOINT
  let url = process.env.WEBSERVICE_ENDPOINT;
  if(url){
    console.log('Using webservice endpoint of ' + url);
  }else{
    console.log('Environment variable WEBSERVICE_ENDPOINT not found.');
  }

  res.json({webserviceEndpoint: url});

});

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/ontology-based-modelling-environment'));

app.get('/*', function(req,res) {

  res.sendFile(path.join(__dirname+'/dist/ontology-based-modelling-environment/index.html'));
});

// Start the app by listening on the default Heroku port
let port = process.env.PORT || 4200;
console.log('Starting the app by listening on port ' + port);
app.listen(port);
