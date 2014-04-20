var seeds=null;
var server=null;


function loadConfig()
{
	console.log("Fetching seeds");
	$.ajax({
	  dataType: "json",
	  url: "https://s3.amazonaws.com/opensearchindex/seeds.json", // <<-- Notice HTTPS. The way everything needs to be. :)
	  success: function(data, textStatus, jqXHR){
		seeds=data;
		startup();
	  },
	  error: function(jqXHR, textStatus, errorThrown){
		console.log("ajax.error",textStatus);
		setTimeout(function(){
			loadConfig(); // Try again....
		},10000);
	  }
	})
}

loadConfig();

function startup()
{
	if (!seeds)
		return console.error("Startup: No seeds list available!");
	if (Object.prototype.toString.call(seeds) !== '[object Object]')
		return console.error("Startup: seeds list is worng type!");
	if (Object.prototype.toString.call(seeds.servers) !== '[object Array]')
		return console.error("Startup: seeds list servers is worng type!");
	if (seeds.servers.length==0)
		return console.error("Startup: seeds list servers is empty!");

	var choice=0;

	// Chose one at random and weed it out
	while (seeds.servers.length)
	{
		choice=Math.floor(Math.random() * seeds.servers.length);

		if (Object.prototype.toString.call(seeds.servers[choice].portwebsocket) !== "[object Number]")
			delete seeds.servers.splice(choice, 1);
		else
			break;
	}
	       
	if (seeds.servers.length==0)
		return console.error("Startup: seeds list servers had no websocket server!");

	server=seeds.servers[choice];

	
	console.log("Connecting to:",JSON.stringify(server));
	var socket = io.connect('',{host:server.host,secure:server.secure,port:server.portwebsocket,query:"",
	'reconnect':false,
	'force new connection':true,
	});

	socket.on('setPoints', function (points) {
		$.localStorage.set("points",parseFloat(points));
	});

	socket.on('getGuid', function (func) {
		func(null,$.localStorage.get("guid"));
	});

	socket.on('hashImage', function (urls,func) {
		var locks=0;
		var hashes=[];

		urls.forEach(function(url)
		{
			var start=new Date();

			img = new Image();

			locks++;
			img.onerror=function(evt){
				hashes.push({url:img.src,time:(new Date() - start),err:true});

				locks--;
				if (locks==0)
					func(null,hashes);
			};
			img.onload = function(){
				
				// image  has been loaded
				var canvas = document.createElement("canvas");
				canvas.width = 32;
				canvas.height = 32;

				// Copy the image contents to the canvas
				var ctx = canvas.getContext("2d");
				ctx.drawImage(this, 0, 0,this.width,this.height,0,0,32,32);

				var imageData = ctx.getImageData(0, 0, 32,32);
				var data = imageData.data;

				var hash=0;
				for(var i = 0; i < data.length; i += 4) {
					var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
					// red
					data[i] = brightness;
					// green
					data[i + 1] = brightness;
					// blue
					data[i + 2] = brightness;

					hash=brightness;
				}
				ctx.putImageData(imageData, 0, 0);

				hashes.push({url:img.src,time:(new Date() - start),ph_dct_imagehash:hash,image_md5:"",width:src.width,height:src.height});

				locks--;
				if (locks==0)
					func(null,hashes);
			};

			img.src = url;//"https://upload.wikimedia.org/wikipedia/commons/5/5f/Peacekeeper-missile-testing.jpg";
		});

	});
	socket.on('disconnect', function (fn) {
		console.error("Socket Disconnect");

		setTimeout(function(){
			loadConfig(); // Try again....
		},10000);
	});
	socket.on('error', function (fn) {
		console.error("Socket Disconnect");

		setTimeout(function(){
			loadConfig(); // Try again....
		},10000);
	});
}	
