
(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
							  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById('canvas').getContext("2d");

canvas.scale(2, 2)
canvas.width = "224";
canvas.height = "252";	

canvas.pt = new Date().getTime();	// Previous Time
canvas.dt = 0;						// Delta Time
canvas.ct = 0;						// Current Time
canvas.updateTime = 0;

canvas.frames = 0;
canvas.sum_frames = 0;
canvas.fps = 0;

// Selector Cache
$el = {

	play: document.getElementById('play'),
	overlay: document.getElementById('overlay'),
	hiscore: document.getElementById('hiscore'),
	score: document.getElementById('score'),
	lives: document.getElementById('lives')
}

// Get hi score if exists
if(localStorage.hiscore)
	$el.hiscore.innerHTML = localStorage.hiscore;

// Start Button
$el.play.addEventListener('mouseup', function(){

	$el.overlay.style.display="none";
	game.start();
});


// =========================
// Game data and functions
// =========================

var game = {
	
	state: 'ready',
	score: 0,
	key: {},
	level: 0,
	lives: 3,
	tick: 1,
	timer: [],

	start: function(){
		
		audio.opening.play();

		setTimeout(function(){
			game.reset(); 
		},4000);
	},

	reset: function(){

		game.state = 'active';
		loop.start('siren');

		player.x = 103;
		player.y = 180;
		player.vel = 0;
		player.f = 3;
		player.state = 'active';

		$el.score.innerHTML = game.score;

		ghosts.forEach(function(ghost){
			ghost.state = 'inactive';
		});

		game.timer = [];

		fruit.init();
		fruit.display = false;
		fruitScore.active = false;

		game.timer.push( 
			newTimer('ghost 1 spawn', 0, function(){ ghosts[0].spawn() }),
			newTimer('ghost 2 spawn', 4, function(){ ghosts[1].spawn() }),
			newTimer('ghost 3 spawn', 8, function(){ ghosts[2].spawn() }),
			newTimer('ghost 4 spawn', 12, function(){ ghosts[3].spawn() }),
			newTimer('ghost 5 spawn', 16, function(){  })
		);
	},

	resetLevel: function(){

		if(game.state == 'over'){
			
			game.lives = 3;
			game.level = 0;
			game.score = 0;
		}

		game.reset();
		
		pellets.forEach(function(pellet){
			pellet.active = true;
		});

		superPellets.forEach(function(superPellet){
			superPellet.active = true;
		});
	},

	next: function(){

		player.vel = 0;
		player.state = 'inactive';
		loop.stop();

		ghosts.forEach(function(ghost){
			ghost.state = 'inactive';
		});

		game.timer.push(newTimer( 'next level', 2, function(){		
					
			game.state = 'next';
			game.resetLevel();
			game.level += 1;
		}));
	},

	over: function(){

		if(localStorage.hiscore < game.score || !localStorage.hiscore){
			localStorage.hiscore = game.score;
			$el.hiscore.innerHTML = localStorage.hiscore;
		}
		
		game.score = 0;

		game.state = 'over';
	}
};

// Timer
function newTimer(name,totalTime,task){

	var timer = {

		name: name,
		time: 0,
		totalTime: totalTime,
		update: function(){

			if(game.state=='active') this.time += canvas.dt;

			if(this.time >= totalTime){
				task();
				game.timer.splice( game.timer.indexOf(this), 1);
			}
		}
	}

	return timer;
}

// Key Presses

window.onkeydown = function(e){

	// Prevent scrolling whilst pressing arrows
	if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40){
		e.preventDefault();
	}

	if (e.keyCode == 37) game.key.left = true;
	else if (e.keyCode == 38) game.key.up = true;
	else if (e.keyCode == 39) game.key.right = true;
	else if (e.keyCode == 40) game.key.down = true;

	// Pause Key
	if (e.keyCode == 13){ 

		if(game.state=='active'){
			loop.stop();
			game.state = 'paused';
		} 

		else if (game.state=='paused'){
			loop.start('siren');
			game.state = 'active';
		} 

		else if (game.state=='over'){ 
			game.state = 'ready'; 
			game.resetLevel();
		}
	}
}

window.onkeyup = function(e){

	e.preventDefault();
	
	if (e.keyCode == 37) game.key.left  = false;
	else if (e.keyCode == 38) game.key.up = false;
	else if (e.keyCode == 39) game.key.right = false;
	else if (e.keyCode == 40) game.key.down = false;
}

// Collision detection
function collides(a, b) {
	
	return a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.y + a.height > b.y;
}

// =============
// Update Loop
// =============

var FPS = 60;

setInterval(function(){
	update();
}, 1000/FPS)


function update(){

	// Game Updates
	if(game.state=='active'){

		// Update Ghosts
		ghosts.forEach( function(ghost){
			if(ghost.state=='active' || ghost.state=='vunerable') ghost.update(canvas);
		});
		
		// Update Player
		if(player.state=='active') player.update(canvas);

		// Check remaining pellets
		for(i=0; i<pellets.length; i++){

			if(pellets[i].active) break;
			
			if(i+1 == pellets.length){

				game.next();
			}
		}

		game.tick++;
	}
}

// ===============
// Animation Loop
// ===============

function draw(){

	canvas.clearRect(0, 0, canvas.width, canvas.height);

	// Set delta time
	
	canvas.ct = new Date().getTime();
	canvas.dt = (canvas.ct - canvas.pt) * 0.001;

	game.timer.forEach( function(time){
		time.update();
	});


	//FPS
	
	canvas.frames ++;
	canvas.sum_frames += canvas.dt;

	if(canvas.frames == 60){

		canvas.fps = Math.round( canvas.frames/canvas.sum_frames );
		canvas.frames = 0;
		canvas.sum_frames = 0;
	}

	// Draw Game Objects

	background.draw(canvas);

	pellets.forEach(function(pellet){
		pellet.draw();
	});

	superPellets.forEach(function(pellet){
		pellet.draw();
	});

	fruit.draw(canvas);
	fruitScore.draw(canvas);

	ghosts.forEach( function(ghost){
		ghost.draw(canvas);
	});

	ready.draw();
	gameOver.draw();

	player.draw(canvas);

	scores.forEach(function(score){
		score.draw(canvas);
	});

	// debugs
	
	//canvas.fillStyle = "#fff";
	//canvas.fillText( "FPS:"+canvas.fps , 180, 240);

	// New Delta Time
	canvas.pt = new Date().getTime();

	requestAnimationFrame(draw);			

}

requestAnimationFrame(draw);