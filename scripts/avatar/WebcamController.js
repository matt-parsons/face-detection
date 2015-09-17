//////////////////////
// WebcamController //
//////////////////////
/**
 * [config description]
 * @param  {[type]} size              [width and height of webcam, default value is 640 and 480 and it needs to be 4:3 width/height ratio]
 * @param  {[type]} position          [absolute position of the camera]
 * @param  {[type]} swfBasePath:      [path for the flash fallback, default value is 'files/swf/']
 * @param  {[type]} swfName:          [filename for the flash fallback, default value is 'webcam.swf']
 * @param  {[type]} swfVersion:       [swf version for the flash fallback, default value is '10.3']
 * @param  {[type]} swfId:            [swf id for the flash fallback, default value is 'alFlashWebcam']
 * @param  {[type]} delegate:         [description]
 * @param  {[type]} callbacks:        [function callbacks for the webcam, initError, ready, onPictureTaken and onCountdown]
 * @param  {[type]} countdownSeconds: [countdown seconds for webcam, default value is '0']
 */
var WebcamController = Class.extend({
	init: function(config) {
		var initConfig = {
			size: {width:640, height:480},
			position: {top:0, left:0},
			swfBasePath: 'files/swf/',
			swfName: 'webcam.swf',
			swfVersion: '10.3',
			swfId: 'alFlashWebcam',
			delegate: null,
			callbacks: {
				initError: null,
				ready: null,
				onPictureTaken: null,
				onCountdown: null
			},
			countdownSeconds: 0
		}
		
		var that = this;
		
		this._config = $.extend(initConfig, config);
		this._callbacks = {
			ready: null,
			initError: null,
			onPictureTaken: null
		}
		
		var date = new Date();
		this._uniquePrefix = this._config.uniquePrefix+date.getTime();
		
		this._container;
		this._htmlWebcam = false;
		this._canvas = null;
		this._canvasContext;
		this._countdownInterval;
		
		window['setImage'] = function(imageUrl) {
			//console.log('ALWebcam_imageSaved '+imageUrl);
			
			var img = new Image();
			// var that = this;
			$(img).load(function(event) {
				console.log('image loaded');
				console.log('img.width '+img.width);
				// that._canvas.show();
				// that._webcamContainer.hide();
				that._canvasContext.drawImage(img, 0, 0, that._config.size.width, that._config.size.height);
				
				that._onPictureTaken();
			});
			img.src = 'data:image/jpg;base64,'+imageUrl;
		};
		window['ALWebcam_cameraFound'] = function() {
			console.log('camera found');
			that._handleWebcamReady();
		};
		window['ALWebcam_cameraNotFound'] = function() {
			console.log('camera not found');
			that._handleWebcamError();
		};
	},
	setDelegate: function(value) {
		this._config.delegate = value;
	},
	initWebcam: function(container, prefix) {
		this._container = container;
		
		if( this._container == null || this._container == undefined ) {
			if( typeof this._config.callbacks.initError === 'function' ) {
				this._config.callbacks.initError.apply(this._config.delegate, arguments);
			}
			
			return;
		}
		
		if( Modernizr.getusermedia ) {
			this._htmlWebcam = true;
			this._webcamContainer = $('<div id="alHtmlWebcamContainer">');
			this._webcamContainer.append('<video id="alHtmlWebcamVideo" width="'+this._config.size.width+'" height="'+this._config.size.height+'" autoplay></video>');
			this._webcamContainer.find('video').css({
				transform: 'scaleX(-1)',
				'-webkit-transform': 'scaleX(-1)',
				'-ms-transform': 'scaleX(-1)',
				'-moz-transform': 'scaleX(-1)',
				'-o-transform': 'scaleX(-1)'
			});
			this._webcamContainer.css({
				position: 'absolute',
				top: this._config.position.top,
				left: this._config.position.left
			});
			this._webcam = this._webcamContainer.find('video')[0];
			
			if( this._config.countdownSeconds > 0 ) {
				this._countdownContainer = $('<div class="countdown-container" style="position:absolute; font-size: 50px; top:'+Math.round(this._config.size.height/2)+'px; left:'+Math.round(this._config.size.width/2)+'px;">');
				this._webcamContainer.append(this._countdownContainer);
			}
			
			container.append(this._webcamContainer);
			
			var videoObj = {'video':true}, that = this;
			
			if( navigator.getUserMedia ) {
				navigator.getUserMedia(videoObj, function(stream) {
					that._webcamStream = stream;
					that._webcam.src = stream;
					that._webcam.play();
					that._handleWebcamReady();
				}, function(code) {
					// debug('webkitGetUserMedia error '+code);
					that._handleWebcamError();
				});
			} else if( navigator.webkitGetUserMedia ) {
				navigator.webkitGetUserMedia(videoObj, function(stream) {
					that._webcamStream = stream;
					that._webcam.src = window.webkitURL.createObjectURL(stream);
					that._webcam.play();
					that._handleWebcamReady();
				}, function(code) {
					// debug('webkitGetUserMedia error '+code);
					that._handleWebcamError();
				});
			} else if( navigator.mozGetUserMedia ) {
				navigator.mozGetUserMedia(videoObj, function(stream) {
					that._webcamStream = stream;
					that._webcam.src = window.URL.createObjectURL(stream);
					that._webcam.play();
					that._handleWebcamReady();
				}, function(code) {
					// debug('webkitGetUserMedia error '+code);
					that._handleWebcamError();
				});
			}
			
		} else if( swfobject.hasFlashPlayerVersion(this._config.swfVersion) ) {
			this._htmlWebcam = false;
			
			this._webcamContainer = $('<div class="al-webcam-container">');
			this._webcamContainer.css({
				position: 'absolute',
				top: this._config.position.top,
				left: this._config.position.left
			});
			var flashContainer = $('<div id="'+this._config.swfId+'">');
			container.append(this._webcamContainer);
			this._webcamContainer.append(flashContainer);
			
			var flashvars = {countdownSeconds: this._config.countdownSeconds}, parameters = {bgcolor:'#000000', wmode:'transparent'}, attributes = {};
			
			// debug(this._config);
			swfobject.embedSWF(this._config.swfBasePath+this._config.swfName, this._config.swfId, this._config.size.width, this._config.size.height, this._config.swfVersion, 'files/swf/expressInstall.swf', flashvars, parameters, attributes);
			
		} else {
			if( typeof this._config.callbacks.initError === 'function' ) {
				this._config.callbacks.initError.apply(this._config.delegate, [this._imageData]);
			}
		}
	},
	takePicture: function() {
		if( Modernizr.canvas ) {
			if( this._canvas == null ) {
				this._canvas = $('<canvas id="alWebcamCanvas" class="picture-canvas" width="'+this._config.size.width+'" height="'+this._config.size.height+'">');
				this._canvas.css({
					position: 'absolute',
					top: 0,
					left: 0
				});
				this._container.append(this._canvas);
				this._canvasContext = this._canvas[0].getContext('2d');
				this._canvas.hide();
			} else {
				this._canvasContext.clearRect(0, 0, this._config.size.width, this._config.size.height);
			}
			
			if( this._htmlWebcam ) {
				console.log('html webcam');
				
				var that = this;
				
				if( this._config.countdownSeconds > 0 ) {
					this._countdown = 0;
					this._onCountdown();
					this._countdownContainer.show();
					this._countdownInterval = setInterval(function() {
						that._countdown++;
						
						debug('countdown '+that._countdown);
						
						if( that._countdown >= that._config.countdownSeconds ) {
							that._countdownContainer.hide();
							clearInterval(that._countdownInterval);
							// that._canvasContext.save();
							// that._canvasContext.setTransform(-1, 0, 0, 1, that._config.size.width, 0);
							// // that._canvasContext.translate(that._config.size.width, 0);
							// // that._canvasContext.scale(-1, 1);
							// that._canvasContext.drawImage(that._webcam, 0 , 0, that._config.size.width, that._config.size.height);
							// that._canvasContext.restore();
							// // that._canvas.show();
							// // that._webcamContainer.hide();
							
							that._takeHtmlPicture();
							
							that._onPictureTaken();
						} else {
							that._onCountdown();
						}
					}, 1000);
				} else {
					this._takeHtmlPicture();
					this._onPictureTaken();
				}
				
			} else {
				console.log('flash webcam');
				// debug($('#'+this._config.swfId)[0].snapPicture);
				$('#'+this._config.swfId)[0].snapPicture();
			}
			
		} else {
			
		}
	},
	_takeHtmlPicture: function() {
		this._canvasContext.save();
		this._canvasContext.setTransform(-1, 0, 0, 1, this._config.size.width, 0);
		// this._canvasContext.translate(this._config.size.width, 0);
		// this._canvasContext.scale(-1, 1);
		this._canvasContext.drawImage(this._webcam, 0 , 0, this._config.size.width, this._config.size.height);
		this._canvasContext.restore();
	},
	stopWebcam: function() {
		if( this._htmlWebcam ) {
			this._webcamStream.stop();
			this._webcam.pause();
		} else {
			
		}
	},
	_onPictureTaken: function() {
		// this._imageData = this._canvasContext.getImageData(0, 0, this._config.size.width, this._config.size.height);
		
		// return this._imageData;
		
		if( typeof this._config.callbacks.onPictureTaken === 'function' ) {
			this._config.callbacks.onPictureTaken.apply(this._config.delegate);
		}
	},
	_onCountdown: function() {
		this._countdownContainer.html(this._config.countdownSeconds-this._countdown);
		if( typeof this._config.callbacks.onCountdown === 'function' ) {
			this._config.callbacks.onCountdown.apply(this._config.delegate);
		}
	},
	getImageData: function() {
		return this._canvasContext.getImageData(0, 0, this._config.size.width, this._config.size.height);
	},
	getImageDataURL: function() {
		return this._canvas[0].toDataURL();
	},
	
	// Webcam callbacks
	_handleWebcamError: function(error) {
		// console.log(error);
		//debug('handleWebcamError');
		$('.select-photo-error').show();
		if( typeof this._config.callbacks.initError === 'function' ) {
			this._config.callbacks.initError.apply(this._config.delegate);
		}
	},
	_handleWebcamReady: function() {
		if( typeof this._config.callbacks.ready === 'function' ) {
			this._config.callbacks.ready.apply(this._config.delegate);
		}
	}
	// End Webcam callbacks
});