'use strict'

var ss = require('slideshow');
var slideshow = new ss("powerpoint");




const WebSocket = require('ws');
//const ws = new WebSocket("ws://localhost:4000");  //����
//const ws = new WebSocket("wss://ws190115.herokuapp.com/");//����
const ws = new WebSocket("ws://54.180.21.15:15234/");//����
//const ws = new WebSocket("ws://ec2-54-180-21-15.ap-northeast-2.compute.amazonaws.com:15234/");//����




var fs = require('fs');
/*


*/
var pptfilename;
var slideshowing = 0;


ws.on('message', function (message) {
	console.log('Received: ' + message);


	if (message == 'open' && slideshowing == 0) {
		console.log('open slide');
		fs.readdir('./ppt/', function (error, filelist) {
			console.log(`파일리스트:`,filelist);
			var isok=0;
			for(var i = 0 ; i<filelist.length ; i++)
			{
				if(filelist[i].split('.')[1]=='pptx')
				{
					pptfilename ='./ppt/'+filelist[i];
					isok=1;
					break;
				}
			}
			if(isok==1){
				console.log(`고른파일:`,pptfilename);

				slideshowing = 1;
				slideshow.boot().delay(100).then(function () {
			
					slideshow.open(pptfilename);
				
				}).delay(100).then(function () {
					slideshow.start();
		
				});
				ws.send('OPEN_succeed:'+pptfilename);
			}
			else{
				ws.send('OPEN_fail');
			}
		});
	

	}

	if (message == 'close' && slideshowing == 1) {
		console.log('close slide');

		
		slideshow.close();
		slideshowing = 0;
		//slideshow.stop();//슬라이드쇼 끝
		//slideshow.close();//슬라이드쇼 끝내고 파일도 닫아버림
	}

	if (message == 'next' && slideshowing == 1) {
		console.log('next slide');
		slideshow.boot().delay(100).then(function(){
			slideshow.next();
		});

	}

	if (message == 'previous' && slideshowing == 1) {
		console.log('previous slide');

		slideshow.boot().then(function () {
			 slideshow.prev();
		});


	}
	if (message.substr(0, 5) == 'slide' && slideshowing == 1) {
		var number = message.split('=')[1];
		console.log("go to slide: " + number);

		slideshow.boot()
		.delay(100).then(function () { slideshow.goto(number) });
	}

});





ws.on('close', function (code) {
	console.log('Disconnected: ' + code);
	//slideshowing = 0;
	//slideshow.close();//슬라이드쇼 끝내고 파일도 닫아버림
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