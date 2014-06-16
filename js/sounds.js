var loop = new SeamlessLoop();
loop.addUri('sounds/siren.wav', 1200, 'siren');
loop.addUri('sounds/power.wav', 700, 'power');

var audio = {

	dies: new Audio('sounds/dies.wav'),
	eatGhost: new Audio('sounds/eatGhost.wav'),
	fruit: new Audio('sounds/fruit.wav'),
	opening: new Audio('sounds/opening.wav'),
	siren: new Audio('sounds/siren.wav')
}

var bars = document.getElementsByClassName('bar');

var volume = {

	setting: 4,

	init: function(){

		// Get previous volume setting from local storage
		if(localStorage.volume){
			volume.setting = parseInt(localStorage.volume);
		}

		volume.update();
	},

	up: function(){

		if(volume.setting < 8){
			
			volume.setting += 1;
			volume.update();
		}
	},

	down: function(){
		
		if(volume.setting > 0){
			
			volume.setting -= 1;
			volume.update();
		}
	},

	update: function(){

		// Store volume setting in local storage
		localStorage.volume = volume.setting;

		// Update html5 audio 
		for(var key in audio){
			audio[key].volume = volume.setting/8;
		};

		// Update seemless loop audio
		loop.audios.siren._1.volume = volume.setting/8;
		loop.audios.siren._2.volume = volume.setting/8;
		loop.audios.power._1.volume = volume.setting/8;
		loop.audios.power._2.volume = volume.setting/8;

		// Update Sound bars on page
		for (var i = 0; i < bars.length; i++) {
			
			if( i < volume.setting)
				bars[i].style.opacity=1;
			else
				bars[i].style.opacity=0.3;
		}
	}
}

volume.init();

// Click events
document.getElementById('up').addEventListener('click', function(){
	volume.up();
});

document.getElementById('down').addEventListener('click', function(){
	volume.down();
});