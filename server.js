var express = require('express');
var bodyParser = require('body-parser');
var mySongList = require('./songList.js');
var myUser=require('./mongoData.js');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Guid = require('Guid');
var cookieParser = require('cookie-parser');

app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static('static'));
app.use(cookieParser());


app.use(function (request, response, next) {
console.log("The request has all the following cookies:");
    console.log(request.cookies);   
    next();
});













var partyId = "party1";

app.get("/party/:partyId", function (req,res) {
    
    var pid = req.params.partyId;
    //check if the partyId in partList
    //if not show error
    
    
    
	res.render('pages/party',{partyId: pid});
});

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

app.use(function (request, response, next) {
    console.log("The request has all the following cookies:");
    console.log(request.cookies);
    next();
});

app.use(function (request, response, next) {
    
    response.locals.user  = undefined;
    var sessionId = request.cookies.currentSessionId;
    if(sessionId){
        myUser.findSessionId(sessionId).then(function(user) {
            if (user == "" || user == undefined) {
                console.log("SessionId not found in database");
                var expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 1);
 
                response.cookie("currentSessionId", "", { expires: expiresAt });
                response.clearCookie("currentSessionId");
                
                next();

            } else {
                response.locals.user = user;
                console.log("SessionId found!");
                next();
            }
        }, function (errorMessage) {
            console.log(errorMessage);
            next();
        });
    }else{
        next();
    }   

});



app.get("/login", function (request, response) {
    console.log("get/login");
    console.log(response.locals.user);
    if (response.locals.user) {
        response.redirect("/");
    } else {
        response.render("pages/home", {
            error: null
        });
    }



});
app.post("/register", function (request, response) {
    
    myUser.createUser(request.body.username, request.body.password).then(function () {
        response.redirect("/login");    
        return true;
        },
        function (errorMessage) {
            response.status(500).json({
                error: errorMessage
            });
        });
    

});


app.post("/login", function (request, response) {

    try {
        console.log("You entered login parts");
      
        myUser.findByUsername(request.body.loginname, request.body.loginpw).then(function (result) {
            console.log(result);
            if (!result) response.render("pages/home", {
                error: "Password or username not correct"
            });

            var sessionId = Guid.create().toString();
           
            myUser.addSessionId(request.body.loginname, sessionId).then(function () {
                    //  console.log("sessionId", sessionId);
                    response.cookie("currentSessionId", sessionId, {});
                    response.locals.user = request.cookies.currentSessionId;
                    response.redirect("/");
                },
                function (errorMessage) {
                    response.status(500).json({
                        error: errorMessage
                    });
                });

        });


    } catch (e) {
        response.render("pages/home", {
            error: e
        });
    }
   
});


app.post("/logout", function (request, response) {
   myUser.removeSessionId(request.cookies.currentSessionId);
    var expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
 
    response.cookie("currentSessionId", "", { expires: expiresAt });
    response.clearCookie("currentSessionId");
  
    response.render("pages/home", {
            error: ""
        });
});










///////////////////////////////////////////////////////////

app.get("/", function(request, response){
    if (response.locals.user==undefined) {
        response.redirect("/login");
    } 
  
    response.render("pages/songList");
});

app.post("/party/:partyId", function(request, response) {
    
});


app.get("/party/songList/:id", function (req,res) {
	var id = req.params.id;
	var result = mySongList.get(partyId, id);
	res.json(result);
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