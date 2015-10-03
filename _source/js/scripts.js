/** Start Google Chrome Canary with open -a Google\ Chrome\ Canary --args --enable-media-stream  OR enable the flag in about:flags **/
var _webcamController;
var App = {

	// Run if we do have camera support
	successCallback : function(stream) {
        console.log('yeah! camera support!');
        if(window.webkitURL) {
			App.video.src = window.webkitURL ? window.webkitURL.createObjectURL(stream) : stream;
        }
        else {
			App.video.src = stream;
        }
    },

	// run if we dont have camera support
	errorCallback : function(error) {
		alert('An error occurred while trying to get camera access (Your browser probably doesnt support getUserMedia() ): ' + error.code);
		return;
	},

	drawToCanvasALabs : function(video) {
		console.log('drawToCanvassss');
		App.video.src = video;
		App.start('glasses');

	},


	drawToCanvas : function(effect) {
		console.log('drawToCanvas');
		var video = App.video,
			ctx = App.ctx,
			canvas = App.canvas,
			i;

			ctx.drawImage(video, 0, 0, 520,426);

			App.pixels = ctx.getImageData(0,0,canvas.width,canvas.height);

		// Hipstergram!
		
		if (effect === 'hipster') {

			for (i = 0; i < App.pixels.data.length; i=i+4) {
				App.pixels.data[i + 0] = App.pixels.data[i + 0] * 3 ;
				App.pixels.data[i + 1] = App.pixels.data[i + 1] * 2;
				App.pixels.data[i + 2] = App.pixels.data[i + 2] - 10;
			}

			ctx.putImageData(App.pixels,0,0);

		}

		// Blur!

		else if (effect === 'blur') {
			stackBlurCanvasRGBA('output',0,0,515,426,20);
		}

		// Green Screen

		else if (effect === 'greenscreen') {
				
					/* Selectors */
					var rmin = $('#red input.min').val();
					var gmin = $('#green input.min').val();
					var bmin = $('#blue input.min').val();
					var rmax = $('#red input.max').val();
					var gmax = $('#green input.max').val();
					var bmax = $('#blue input.max').val();

					// console.log(rmin,gmin,bmin,rmax,gmax,bmax);
					
					for (i = 0; i < App.pixels.data.length; i=i+4) {
									red = App.pixels.data[i + 0];
									green = App.pixels.data[i + 1];
									blue = App.pixels.data[i + 2];
									alpha = App.pixels.data[i + 3];

									if (red >= rmin && green >= gmin && blue >= bmin && red <= rmax && green <= gmax && blue <= bmax ) {
										App.pixels.data[i + 3] = 0;
									}
					}

					ctx.putImageData(App.pixels,0,0);

		}
		else if(effect === 'glasses') {
			var comp = ccv.detect_objects({ "canvas" : (App.canvas),
											"cascade" : cascade,
											"interval" : 1,
											"min_neighbors" : 1 });

			// Draw glasses on everyone!
			for (i = 0; i < comp.length; i++) {
				ctx.drawImage(App.glasses, comp[i].x, comp[i].y,comp[i].width, comp[i].height);
			}
						
		}
		else if(effect === 'hat') {
			var comp = ccv.detect_objects({ "canvas" : (App.canvas),
											"cascade" : cascade,
											"interval" : 1,
											"min_neighbors" : 1 });

			// Draw glasses on everyone!
			for (i = 0; i < comp.length; i++) {
				ctx.drawImage(App.hat, comp[i].x, comp[i].y,comp[i].width, comp[i].height);
			}
						
		}
					
	},

	start : function(effect) {
		console.log('start');
		console.log(App.playing);
		if(App.playing) { clearInterval(App.playing); }
		App.playing = setInterval(function() {
			App.drawToCanvas(effect);
		},1);
	}
};

App.init = function() {

	// Finally Check if we can run this puppy and go!
	// if (navigator.getUserMedia) {
	// 	navigator.getUserMedia('video', App.successCallback, App.errorCallback);
	// }
	_webcamController = new WebcamController({
		size: {width: 780, height: 584},
		position: {top: 0, left: 0},
		callbacks: {
			ready: function() {
				$('.initializing-webcam').fadeOut();
				console.log('cam ready');
				App.initTwo();
			},
			initError: function() {
				console.log('cam error');
			},
			onPictureTaken: function() {
				console.log('cam taken');
			}
		}
	});
	_webcamController.initWebcam($('#webCam'));


};

App.initTwo = function() {
	// Prep the document
	App.video = document.querySelector('video');
	console.log(App.video);
	
	App.glasses = new Image();
	App.glasses.src = "i/glasses.png";

	App.hat = new Image();
	App.hat.src = "i/hat.png";

	App.canvas = document.querySelector("#output");
	App.ctx = this.canvas.getContext("2d");

	App.drawToCanvasALabs(App.video.src);

}


document.addEventListener("DOMContentLoaded", function() {
	console.log('ready!');
	App.init();
}, false);

