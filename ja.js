// Stats. How long in current status
// maybe user stats?

// after I do a push, I want to be taken to github create a pull request.
// what I would really like to do is create a pull request from the CLI (but now I'm in github land instead of jira)
function main(){
  var patt = new RegExp("[A-Za-z]+-[0-9]+");
  if (process.argv[2]) {
   //try to use the input could be a config or a ticket
   if (process.argv[2] == "init"){
    //take username and password and baseencode
    console.log('use the setup.js file to initialize the config file.');

   } else if(process.argv[2] == "--help" ||process.argv[2] == "-H" ){
      console.log("Usage: ja [options...] <ticket>");
      console.log("Specifica Ticket Example: ja IDS-1234");
      console.log("Current branch Example: ja ");
      console.log("Options:");
      console.log("init\t configure your Authorization Token and Jira Server ");
      console.log("-H \t --help\t this screen");

   } else if(patt.test(process.argv[2])) {
      //the input matches issue number
      callJira(process.argv[2]);

    } else{
      // the input is not valid
      console.log('I do not understand what you are telling me!');
   }

  } else{
    //no issueNumber provided, get a number
   issue = getBranch();
    // function(){
    //   callJira(issueNumber, 'YWRhbWNveDoxQ2FsbGEzTnlsYWg=');
    // }
  }
}

function getBranch( ){
  const spawn = require('child_process').spawn;
  const ls = spawn('git', ['symbolic-ref','--short','HEAD']);
  //standard out
  ls.stdout.on('data', (data) => {
    issueNumber = `${data}`;
    issueNumber = issueNumber.trim();
    patt = new RegExp("[A-Za-z]+-[0-9]+");

    if (!patt.test(issueNumber)) {
      console.log("ERROR: current branch does not match jira issue pattern. (e.g. IDS-1234)");
  	  process.exit(1);
    }else {
      //console.log("found issue number: "+issueNumber);
      //I am now fully down the rabbits hole
      callJira(issueNumber);
    }
  });

  //error
  ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  //close connection
  ls.on('close', (code) => {
   // console.log(`child process exited with code ${code}`);
  });
}

function callJira(issueNumber){
  var https = require('https');
  var options = {
    host : configObj.config.server,
    port : 443,
    path : '/rest/api/2/issue/'+issueNumber,
    headers: {Authorization: 'Basic '+configObj.config.authToken, 'Content-Type': 'application/json' }
  }
  https.request(options,function(resp){
    var str = '';
   //console.log(resp);
   if (resp.statusCode === 200){
    //another chunk of data has been recieved, so append it to `str`
    resp.on('data', function (chunk) {
      str += chunk;
    });

    //the whole resp has been recieved, so we just print it out here
    resp.on('end', function () {
      try {
        jsonResponse = JSON.parse(str);
      } catch (err) {
        console.log(err);
        console.log(str);
        process.exit();
      }

      for (var i = 0; i < configObj.customize.length; i++) {
        currentName = configObj.customize[i].name;
        currentLocation = "jsonResponse.fields."+configObj.customize[i].location;
        currentValue = "";
        try {
         currentValue = eval(currentLocation);
        } catch (e) {
         currentValue = "not Found";
        }
          console.log(currentName+": " + currentValue)
      }

    });
  }else{
    console.log("failed login. check credentials and network connection");
    console.log(response);
  }
  }).end();

}
var fs = require('fs');
var data = fs.readFileSync(__dirname+'/config.json'),
    configObj;
try {
  configObj = JSON.parse(data);
  //console.dir(myObj);
}
catch (err) {
  console.log('There has been an error parsing the config JSON.')
  console.log(err);
}

main();
