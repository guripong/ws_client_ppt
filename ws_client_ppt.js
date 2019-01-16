'use strict'

var ss = require('slideshow');
var slideshow = new ss("powerpoint");





const WebSocket = require('ws');
const ws = new WebSocket("ws://54.180.21.15:15234/");


//const ws = new WebSocket("ws://localhost:15234");  
//const ws = new WebSocket("wss://ws190115.herokuapp.com/");//
//const ws = new WebSocket("ws://ec2-54-180-21-15.ap-northeast-2.compute.amazonaws.com:15234/");//



var fs = require('fs');
var pptfilename=``;

ws.on('message', function (message) {

	if(message.indexOf('PING')==-1){
		console.log('Received: ' + message);
	}

	if (message == 'open') {
		console.log('open slide');
		fs.readdir('./ppt/', function (error, filelist) {
			console.log(`파일리스트:`, filelist);

			slideshow.boot().then(function (ok) {
				console.log(`부트 성공:` + ok);
				for (var i = 0; i < filelist.length; i++) {
					if (filelist[i].split('.')[1] == 'pptx') {
						pptfilename = './ppt/' + filelist[i];
						
						break;
					}
					
				}
				console.log(`고른파일:`, pptfilename);
				slideshow.open(pptfilename).then(function (ok) {
					console.log(`파일열기 성공:` + ok);
					slideshow.start().then(function (ok) {
						console.log(`슬라이드쇼 성공:` + ok);
						ws.send('answer_s_open:' + pptfilename.split('/')[2]);
					}, function (error) {
						console.log(`슬라이드쇼 실패:` + error);
						ws.send('answer_f_open: slide show failed.');
					});
				}, function (error) {
					console.log(`파일열기 실패:` + error);
					ws.send('answer_f_open: open failed.');
				});
			}, function (error) {
				console.log(`부트 실패:` + error);
				ws.send('answer_f_open: boot failed.');
			});


		});
	

	}

	if (message == 'close') {
		slideshow.close().then(function (ok) {
			console.log('close slide succeed:', ok);
			ws.send('answer_s_close'+ok);

		}, function (error) {
			console.log('close slide failed:', error);
			ws.send('answer_f_close:'+error);
		});
	}

	if (message == 'next') {
		slideshow.start().then(function () {
			slideshow.next().then(function (ok) {
				console.log('succeed next slide:'+ ok);
				ws.send('answer_s_next'+ok);
			}, function (error) {
				console.log('failed next slide:'+ error);
				ws.send('answer_f_next:'+error);
			});	
		},function(error){
			console.log('슬라이드쇼 시작실패:'+ error);
			ws.send('answer_f_next: ppt did not open');
		});	
	}

	if (message == 'previous') {
		slideshow.start().then(function () {
			slideshow.prev().then(function (ok) {
				console.log('previous slide:' + ok);
				ws.send('answer_s_previous' + ok);
			}, function (error) {
				console.log('previous slide' + error);
				ws.send('answer_f_previous:' + error);
			});
		},function(error){
			console.log('슬라이드쇼 시작실패:'+ error);
			ws.send('answer_f_next: ppt did not open');
		});		
	}

	if (message.substr(0, 5) == 'slide') {
		var number = message.split('=')[1];

		slideshow.start().then(function(){
			slideshow.goto(number).then(function (ok) {
				console.log("go to slide: " + number + ":" + ok);
				ws.send('answer_s_number:' + number);
			}, function (error) {
				console.log("go to slide: " + number + ":" + error);
				ws.send('answer_f_number:' + number + ':' + error);
			});
		},function(error){
			console.log('슬라이드쇼 시작실패:'+ error);
			ws.send('answer_f_next: ppt did not open');
		});
		
	}

});



ws.on('close', function (code) {

	console.log('Disconnected: ' + code);

});



ws.on('error', function (error) {

	console.log('Error: ' + error.code);

});



ws.on('open', function open() {
	setInterval(() => {
		ws.send('PING', function () {
			console.log.bind(null, 'Sent : ', 'PING')
		});
	}, 5000);
});