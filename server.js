var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Guid = require('Guid');
var partyData = require('./partydata.js');

app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static('static'));


//index
app.get("/", function (req,res) {
	res.render("pages/index", {Inf: "Welcome!"});
});

//redirect to partyconfig
app.get("/createparty", function(request, response){
	if(!response.locals.user||response.locals.user==undefined){ 
	response.render("pages/index", {Inf: "please log in first!"});
}else{
	response.render("pages/partyconfig", {Inf: "please input your party information"});
}

});

//create party
app.post("/createparty", function(request, response){
if(!response.locals.user||response.locals.user==undefined){ 
	response.render("pages/index", {Inf: "please log in first!"});
}else{
	var partyId = request.body.partyId;
	var partyName = request.body.partyName;
	if(!response.locals.user||response.locals.user==undefined){ 
	var createdBy = "unknown user";
}
else{
	var createdBy = response.locals.user.username;
}
	var playList = {};
	var config = {};
	partyData.getPartyById(partyId).then(function(partyList){
if(partyList.length>0){
response.render("pages/partyconfig", {Inf: "party id existed"});
}else{
	partyData.createParty(partyId, partyName, createdBy, playList, config);
	response.render("pages/party/:partyId", {partyId: partyId});
}
});
}
	
	});


app.listen(3000, function () {
	console.log('Your server is now listening on port 3000! Navigate to http://localhost:3000 to access it');
})