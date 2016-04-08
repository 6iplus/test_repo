'use strict';

var MongoClient = require('mongodb').MongoClient,
	settings = require('./config.js'),
	Guid = require('Guid');
	


var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};


var data=[];//partid : { playlist}
//var data= {partyId:[], partyId2:[]};  return showSucc(data[partyId])
//datq=[][{}] 
var newId = 1;
var stamp = function () {
	return newId++;
};

function showSucc(data){
    return {status: "success", msg: "ok" , "data": data};
}
function showError(msg){
    return {status: "error", "msg": msg};
}

// {"_id":"81fbbb11-2b10-1457-933b-6af2487d7122", "partyId":"zxco23", "partyName":"Christmas Party", "createdBy":"Sunny", "playList":[{"videoName":"Merry Christmas Every Body,"url":"https://www.youtube.com/watch?v=jx6DzaiV66Y","createdBy":"Sunny","watched":true}] "config":{"allowAnonymous": true "maxLimit": 100,"allowComment": true}



MongoClient.connect(fullMongoUrl)
    .then(function(db) {
        var partyCollection = db.collection("party");
        
        exports.createUser = function(username, encryptedPassword) {
        	emptyProfile = {firstName: "", lastName: "", hobby: "", petName: ""};
        	//console.log("good");
        	return userCollection.insertOne({ _id: Guid.create().toString(), username: username, 
                encryptedPassword: encryptedPassword, currentSessionId: "", profile: emptyProfile });
        };
        
        
        exports.addParty = function(){
            return partyCollection.insertOne({"_id":"0001", "partyId":"Party1", "partyName":"Christmas Party", "createdBy":"Sunny", "playList":[{"videoName":"Merry Christmas Every Body","url":"https://www.youtube.com/watch?v=jx6DzaiV66Y","createdBy":"Sunny","watched":true}], "config":{"allowAnonymous": true, "maxLimit": 100,"allowComment": true}});
        }
        
        exports.addSongbyUrl = function(partyID, Url){
            
            var playList = [{"videoName":"Merry Christmas Every Body",
                            "url":Url,
                            "createdBy":"Sunny",
                            "watched":true}];
            
            return partyCollection.updateOne({ _id: partyID}, 
                    { $set: {playList: playList} }).then(function() {
        	return exports.findPartyByPartyID(partyID);
        	});
        }
        
        
        exports.findPartyByPartyID = function(partyId){ 
            return partyCollection.find({partyId: partyId}).limit(1).toArray().then(function(listOfParty) {
        		if(listOfParty.length === 0) {
        			return Promise.reject("Party doesn't exist!");
        		} else {
        			return listOfParty[0];
        		}
        	});
        }
        
        
    });


exports.exports = {
	get: function (partyId, id) {
        if(!partyId || !id || data[partyId] == undefined){
            throw Error("error get id :"+ id+ "or partyid:"+ partyId);
        }
        
		for (var i = 0, l = data[partyId].length; i < l; i++) {
			if (data[partyId][i].id == id) {
				return data[partyId][i];
			}
		}
        
        return showError("not found");
	},

	create: function (partyId,songName,url,owner) {
		if(!partyId || !songName || !url || !owner){
            throw Error("one of ur param is null partyId: "+ partyId +"songName:"+songName +"url:"+url+"owner:"+owner);
        } 
            
            var myData = {
				'id':stamp(),
				'partyId': partyId,
				'songName': songName, 
				'url': url,
				'owner': owner
			};
            
			data[partyId].push(myData);
            console.log(data);
			return showSucc(myData);
		
	},

	delete: function (partyId, id) {
        if(!partyId || !id || data[partyId] == undefined){
            throw Error("error get id :"+ id+ "or partyid:"+ partyId);
        }
		for (var i = 0, l = data[partyId].length; i < l; i++) {
			if (data[partyId][i].id == id) {
                var tmp = data[partyId][i];
				data[partyId].splice(i,1);
                console.log(data);
				return showSucc(tmp);
			}			
		}
        
        return showError("not found");
	},
    getAllByPartyId: function(partyId){
        //todo
        return showSucc(data[partyId]); 
    }
    ,createParty:function (partyId) {
        //todo
        data[partyId] = [];
        return showSucc(partyId);
    }
}
