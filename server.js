var express = require('express');
var bodyParser = require('body-parser');
var mySongList = require('./songList.js');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static('static'));
var partyId = "party1";

// app.get("/party/:partyId", function (req,res) {
    
//     var pid = req.params.partyId;
//     //check if the partyId in partList
//     //if not show error
    
    
    
// 	res.render('pages/party',{partyId: pid});
// });

//socket.io start

io.on('connection', function(socket){
     socket.on('room', function(room) {
         socket.join(room);
         console.log("user joined room: " + room);
              // now, it's easy to send a message to just the clients in a given room
         socket.in(room).on('chat message', function(data){
            console.log(room , data);
            io.in(room).emit('chat message', data);
        });
     });
  });

//socket.io end



app.get("/", function(request, response){
    
    
    
    mySongList.getAllComments().then(function (commentList) {
        response.render("pages/home", { error: null, comments: commentList });
    }, function (errorMessage) {
        response.status(500).json({ error: errorMessage });
    });
    respond.render("pages/songList");
});

app.get("/party/:partyId", function(request, response) {
   response.render("pages/songList",{partyId: request.params.partyId});
});

app.post("/party/:partyId", function(request, response) {
    //console.log(request.params.partyId);
   mySongList.addSongbyUrl(request.params.partyId,request.body.Url).then(function() {
       //console.log(request.body.Url);
    	response.render("pages/songList", {partyId: request.params.partyId});
    });
});
app.get("/party/:partyId/playList", function(request, response) {
   
   mySongList.findPartyByPartyID(request.params.partyId).then(function(party) {
       try{
       
       var songs = [];
       for(var i=0; i<party.playList.length; i++){
           var url = party.playList[i].url;
           if( url.indexOf("youtu.be/") != -1){
            songs.push(url.substr(url.indexOf("youtu.be/")+"youtu.be/".length,11 ));   
           }
           if(url.indexOf("v=") != -1)
            songs.push(url.substr(url.indexOf("v=")+2,11 ));
           
       }}catch(err){
         console.log(err);
       }
       response.jsonp({songs: songs });
   });
});

app.get("/party/songList/:id", function (req,res) {
	 mySongList.addSongbyUrl(request.params.partyId,request.body.Url).then(function() {
    	response.render("pages/songList", {pageTitle: "Song is added."});
	}, function() {
		var party = mySongList.findPartyByPartyID(request.params.partyId);
        console.log(party);
		response.redirect("pages/songList")
	});
});

app.post("/party", function(req,res) {
	var result = mySongList.createParty(req.body.partyId);
    partyId = req.body.partyId;//todo remember to remove this later no way to write like this
	res.json(result);
});


app.post("/party/songList", function(req,res) {
	var  songName = req.body.songName,
		 url = req.body.url,
		 owner = 'Sunny';
	var result = mySongList.create(partyId,songName,url,owner);
    io.in(partyId).emit('chat message', result);
	res.json(result);
});

app.delete("/party/songList/:id", function (req,res) {
	var id = req.params.id;
	var result = mySongList.delete(partyId, id);
	res.json(result);
});

http.listen(3000, function () {
	console.log('Your server is now listening on port 3000! Navigate to http://localhost:3000 to access it');
})