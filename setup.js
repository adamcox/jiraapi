//TODO: set homeconfig directory!  maybe make windows compatible?
//TODO: refactor callback function structure. its janky right now
//TODO: create the config folder and add the config.json file from the config.json_sample. though changing your password would reset any customization.
//maybe if config exists, is just replaces the config portion of the object after reading it in, otherwise from sample.
//TODO: Reset customize back to its default. incase it gets foobared


var fs = require('fs');
var data = fs.readFileSync(__dirname+'/config.json'),
  configObj;
var colors = require("colors/safe");
var prompt = require('prompt');

try {
  configObj = JSON.parse(data);
}
catch (err) {
  console.log('There has been an error parsing the config JSON.')
  console.log(err);
}

//input configuration
 var schema = {
  properties: {
    server: {
      description: "Jira Server ",
      default: "jira.impdir.com",
      required: false
    },
      username:{
        description: "Jira Username:",
        required: true
    },
      password: {
        description: "Jira password (Hidden):",
        hidden: true
    }
  }
};
prompt.message = "";
prompt.delimiter = "";
prompt.start();
   //
   // Get two properties from the user: email, password
   //
   prompt.get(schema, function (err, result) {
     if(result.server.length){
       configObj.config.server = result.server;
     }
     // build-token
     preToken = result.username+":"+result.password;
     configObj.config.authToken = new Buffer(preToken).toString('base64');
     //write to config file
     //TODO: wrap this in the try catch and don't show the console below
     try {
        fs.writeFileSync(__dirname+'/config.json',JSON.stringify(configObj, null, 4));
     } catch (err) {
       console.log(err);
       process.exit();
     } finally {

     }


     //output results
     console.log('Setup Complete!');
     console.log('you can now alias this in your ~/.bashrc file');
     console.log(colors.cyan('alias ja="node '+__dirname+'/ja.js"'));

   });
