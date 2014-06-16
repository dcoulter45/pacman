
// ==========
// Player
// ==========

var pacman = new Image();
	pacman.src = "img/pacman.png";

var pacman_die = new Image();
	pacman_die.src = "img/pacman_death.png";

var player = {

	state: 'active',
	vel: 0,
	maxVel: 1,
	x: 103,
	y: 180,
	width: 16,
	height: 16,
	f: 3,
	f2: null,
	f3: false,
	count: 1,
	count_x: 0,
	count_y: 0,
	combo: 0,

	col: [
		{ x: 0, y: 0, width: 16, height: 1, b: false, obj: null},
		{ x: 0, y: 0, width: 1, height: 16, b: false, obj: null},
		{ x: 0, y: 0, width: 16, height: 1, b: false, obj: null},
		{ x: 0, y: 0, width: 1, height: 16, b: false, obj: null}
	],

	col_inner: { x: 0, y: 0, width:10, height: 10},

	update_col: function(){

		this.col[0].x = this.x;
		this.col[0].y = this.y-1;

		this.col[1].x = this.x+16;
		this.col[1].y = this.y;

		this.col[2].x = this.x;
		this.col[2].y = this.y+16;

		this.col[3].x = this.x-1;
		this.col[3].y = this.y;

		this.col_inner.x = this.x+3;
		this.col_inner.y = this.y+3;

		for(i=0; i<4; i++) player.col[i].b = false;

		for(i=0; i<4; i++){

			walls.forEach( function(wall){

				if( collides( wall, player.col[i] )){

					player.col[i].b = true;
				}
			});
		}
	},

	update: function(canvas){

		// ================
		// Player Movement
		// ================

		if( player.f3 == true ){

			if(player.f2==0) player.f = 0;
			else if(player.f2==1) player.f = 1;
			else if(player.f2==2) player.f = 2;
			else if(player.f2==3) player.f = 3;

			player.f2 = null;
			player.f3 = false;
		}

		if(player.f==0) player.y -= player.vel ;
		else if(player.f==1) player.x += player.vel ;
		else if(player.f==2) player.y += player.vel ;
		else if(player.f==3) player.x -= player.vel ;

		// If player leaves boundaries
		
		if(player.x < -16 ) player.x = canvas.width;
		if(player.x > canvas.width ) player.x = -16;

		// =====================
		// Update bounding box
		// =====================
		this.update_col();

		// =============
		// Collisions
		// =============


		// Wall Collision
		if( player.col[player.f].b ){

			player.vel = 0;
		}

		if(player.f2 !== null){

			if( !player.col[player.f2].b ){
				
				player.vel = player.maxVel;
				player.f3 = true;	
			}
			else{

				player.f3 = false;
			}
		}

		// Ghost Collisions
		ghosts.forEach(function(ghost){
			
			if( collides(player.col_inner, ghost.col_inner)){
				
				if(ghost.state == 'active') player.die();
				else if(ghost.state == 'vunerable') ghost.die();
			}
		});

		// Fruit Collision
		if( collides( fruit, player.col_inner ) && fruit.active && fruit.display){

			fruit.active = false;
			fruit.display = false;
			audio.fruit.play();

			fruitScore.init();

			if(game.level == 0) game.score += 100;
			else if(game.level == 1) game.score += 300;
			else if(game.level == 2) game.score += 500;
			else if(game.level == 3) game.score += 700;
			else if(game.level == 4) game.score += 1000;
			else if(game.level == 5) game.score += 2000;
			else if(game.level == 6) game.score += 3000;
			$el.score.innerHTML = game.score;
		}

		// Pellet Collisions
		pellets.forEach(function(pellet){

			if( collides( pellet, player.col_inner ) && pellet.active==true ){

				game.score += 10;
				$el.score.innerHTML = game.score;
				pellet.active = false;
			}
		});

		// Super Pellet Collisions
		superPellets.forEach(function(superPellet){

			if( collides( superPellet, player.col_inner ) && superPellet.active==true ){

				superPellet.active = false;
				player.combo = 0;
				game.score += 50;
				$el.score.innerHTML = game.score;

				loop.update('power');

				ghosts.forEach(function(ghost){

					if(ghost.state == 'active'){
						ghost.state = 'vunerable';
						ghost.vel = 0.5;
					}
					ghost.frames = 2;
				});

				for(var i = 0; i<game.timer.length; i++){
					if( game.timer[i].name =='vun1' ){
						game.timer.splice(i,1);
						break;
					}
				}

				for(var i = 0; i<game.timer.length; i++){
					if( game.timer[i].name =='vun2' ){
						game.timer.splice(i,1);
						break;
					}
				}

				game.timer.push(newTimer( 'vun1', 8, function(){

					ghosts.forEach(function(ghost){

						if(ghost.state == 'vunerable'){
						
							ghost.state = 'active';
							ghost.vel = 1;
							ghost.frames = 2;
							ghost.x = Math.round(ghost.x);
							ghost.y = Math.round(ghost.y);
							player.combo = 0;
						}
					});

					loop.update('siren');
				}));

				game.timer.push(newTimer( 'vun2', 6, function(){

					ghosts.forEach(function(ghost){

						if(ghost.state == 'vunerable'){

							ghost.frames = 4;
						}
					});
				}));
			}
		});

		// =============
		// Key Strokes
		// =============

		if(game.key.up){
			
			if(player.col[0].b) {

				player.f2 = 0;
			}
			else{

				player.f = 0;
				player.f2 = null;
				player.vel = player.maxVel;
			}	
		}		
		else if(game.key.right){ 
			
			if(player.col[1].b) {

				player.f2 = 1;
			}
			else{

				player.f = 1;
				player.f2 = null;
				player.vel = player.maxVel;
			}	
		}
		else if(game.key.down){ 

			if(player.col[2].b) {

				player.f2 = 2;
			}
			else{

				player.f = 2;
				player.f2 = null;
				player.vel = player.maxVel;
			}	
		}
		else if(game.key.left){
			
			if(player.col[3].b) {

				player.f2 = 3;
			}
			else{

				player.f = 3;
				player.f2 = null;
				player.vel = player.maxVel;
			}	
		}
	},

	die: function () {

		player.state = 'die';
		player.count = 0;
		loop.stop();
		audio.dies.play();

		ghosts.forEach(function(ghost){
			ghost.state = 'inactive';
		});
		
		game.timer.push(newTimer( 'player respawn', 2, function(){

			if(game.lives > 1){
				
				game.reset();
				game.lives -= 1;
				$el.lives.innerHTML = game.lives;
			} 
			else{

				game.over();
			}

		}));
	},

	draw: function(canvas){

		// Default Animation
		if( this.state == 'active'){
			
			this.count_y = player.f;
			if( game.state == 'active'){
				if(game.tick % 4 == 0) this.count++;						
				if(this.count >= 4)	this.count = 0;
			}

			canvas.drawImage( pacman, this.count*16, this.count_y*16, this.width, this.height, this.x, this.y, this.width, this.height );
		}

		// Pause Animation
		else if( this.state == 'inactive'){

			canvas.drawImage( pacman, this.count*16, this.count_y*16, this.width, this.height, this.x, this.y, this.width, this.height );
		}

		// Death Animation
		else if( this.state == 'die'){

			if(game.tick % 5 == 0 && player.count < 11) this.count++;

			canvas.drawImage( pacman_die, player.count*16, 0, this.width, this.height, this.x, this.y, this.width, this.height );
		}
	}
}


// ======= 
// Ghosts 
// =======

var blinky = new Image();
blinky.src = "img/blinky.png";

var pinky = new Image();
pinky.src = "img/pinky.png";

var inky = new Image();
inky.src = "img/inky.png";

var clyde = new Image();
clyde.src = "img/clyde.png";

var ghostV = new Image();
ghostV.src = "img/ghostV.png";

var ghosts = [];

function ghost(x,y,img){

	var ghost = {

		state: 'inactive',
		f: 3,
		vel: 1,
		x: x, 
		y: y, 
		width: 16,
		height: 16,
		count: 0,
		count_y: 0,
		frames: 2,

		col: [
			{ x: 0, y: 0, width: 16, height: 1, b: false},
			{ x: 0, y: 0, width: 1, height: 16, b: false},
			{ x: 0, y: 0, width: 16, height: 1, b: false},
			{ x: 0, y: 0, width: 1, height: 16, b: false}
		],

		col_inner: { x: 0, y: 0, width: 10, height: 10 },

		update_col: function(){

			this.col[0].x = this.x;
			this.col[0].y = this.y-1;

			this.col[1].x = this.x+16;
			this.col[1].y = this.y;

			this.col[2].x = this.x;
			this.col[2].y = this.y+16;

			this.col[3].x = this.x-1;
			this.col[3].y = this.y;

			this.col_inner.x = this.x+3;
			this.col_inner.y = this.y+3;
		
			for(i=0; i<4; i++) this.col[i].b = false;

			for(i=0; i<4; i++){

				walls.forEach( function(wall){

					if( collides( wall, ghost.col[i] )){

						ghost.col[i].b = true;
					}
				});
			}
			
		},

		update: function(canvas){

			// Update Movement

			if(this.f==0){
				this.y -= this.vel //Math.round( this.vel * canvas.dt );
			}
			else if(this.f==1){
				this.x += this.vel //Math.round( this.vel * canvas.dt );
			}
			else if(this.f==2){
				this.y += this.vel //Math.round( this.vel * canvas.dt );
			}
			else if(this.f==3){
				this.x -= this.vel //Math.round( this.vel * canvas.dt );
			}

			// Update collision bounding boxes
			if(this.x % 1 ==0 && this.y % 1 ==0){

				this.update_col();

				// If ghost leaves boundaries
				
				if(this.x < -16 ) this.x = canvas.width;
				if(this.x > canvas.width ) this.x = -16;

				// Check for collisions

				var pf = [0,1,2,3];

				if( ghost.f%2 == 0 ){ // if facing up for down

					pf = [1,3];
					
					if( !ghost.col[ghost.f].b) pf.push(ghost.f, ghost.f);

					if( ghost.col[1].b ) pf.splice(pf.indexOf(1), 1);

					if( ghost.col[3].b ) pf.splice(pf.indexOf(3), 1);
				}
				else { // if facing left or right

					pf = [0,2];

					if( !ghost.col[ghost.f].b) pf.push(ghost.f, ghost.f);

					if( ghost.col[0].b ) pf.splice(pf.indexOf(0), 1);

					if( ghost.col[2].b ) pf.splice(pf.indexOf(2), 1);			
				}

				ghost.f = pf[ Math.floor( Math.random()*pf.length ) ];

				if(ghost.f == undefined){
					console.log(ghost);
				}
			}

			
		},


		spawn: function(){

			ghost.state = 'active';
			ghost.vel = 1;
			ghost.x = 105;
			ghost.y = 84;
			ghost.f = 3;
		},

		die: function(){

			player.combo += 1;
			game.score += 200*player.combo;
			$el.score.innerHTML = game.score;
			audio.eatGhost.play();

			scores.push( newScore(player.x, player.y+3, player.combo) );

			ghost.vel = 0;
			ghost.state = 'inactive';

			game.timer.push( newTimer('ghost respawn', 6, function(){
				
				ghost.spawn();
			}));
		},

		draw: function(canvas){

			if(ghost.state == 'active'){
			
				this.count_y = this.f;
				if( game.state == 'active'){
					if(game.tick % 5 == 0)	this.count++;
					if(this.count >= 2) this.count = 0;
				}

				canvas.drawImage( img, this.count*16, this.count_y*16, this.width, this.height, this.x, this.y, this.width, this.height );
			}

			if(ghost.state == 'vunerable'){

				if(game.tick % 5 == 0)	this.count++;
				if(this.count >= this.frames) this.count = 0;

				canvas.drawImage( ghostV, this.count*16, 0, this.width, this.height, this.x, this.y, this.width, this.height );
			}
		}
	}

	return ghost;
}

// Init Ghosts

ghosts.push(
	ghost(105,84,blinky),
	ghost(105,84,pinky),
	ghost(105,84,inky),
	ghost(105,84,clyde)
);

// =======
// BG
// =======

var level1 = new Image();
	level1.src = "img/background.png";

var background = {

	x: 0,
	y: 0,
	width: 220,
	height: 216,

	draw: function(canvas){

		canvas.drawImage( level1, 0,0,canvas.width, canvas.height );
	}
}

// =======
// Score
// =======

var scoreImg = new Image();
	scoreImg.src = "img/points.png";

var scores = [];

function newScore(x,y,combo){
	
	var score = {

		x: x,
		y: y,
		width: 16,
		height: 9,

		destroy: function(){

			game.timer.push( newTimer( 'score', 1.5, function(){

				scores.splice( scores.indexOf(this), 1 );
			}));

			this.destroy = Function();
		},

		draw: function(canvas){

			this.destroy();
			canvas.drawImage( scoreImg, (combo-1)*16, 0, score.width, score.height, score.x, score.y, score.width, score.height );
		}
	}

	return score;
}

// =======
// Fruit
// =======

var fruitImg = new Image();
	fruitImg.src = "img/fruit.png";

var fruit = {

	active: true,
	display: false,
	x: 105,
	y: 132,
	width: 16,
	height: 16,
	frameX: 0,

	toggle: function(){

		if(fruit.active){

			fruit.display = (fruit.display) ? false:true;

			game.timer.push( newTimer('toggle fruit', 8, function(){
				fruit.toggle();
			}));
		}
	},

	init: function(){
		
		fruit.active = true;

		game.timer.push( newTimer('toggle fruit', 8, function(){ 	
			fruit.toggle();
		}));
	},

	draw: function(){

		this.frameX = fruit.width * game.level;

		if(fruit.active && fruit.display) canvas.drawImage( fruitImg, this.frameX, 0, this.width, this.height, this.x, this.y, this.width, this.height );
	}
}

var fruitScoresImg = new Image();
	fruitScoresImg.src = "img/fruitScores.png";

var fruitScore = {

	active: false,
	x: 103,
	y: 137,
	width: 20,
	height: 7,
	frameX: 0,

	init: function(){

		fruitScore.frameX = game.level * fruitScore.width;
		fruitScore.active = true;
		
		game.timer.push( newTimer('hide fruit score', 2, function(){ 

			fruitScore.active = false;
		}));

	},

	draw: function(){

		if(this.active) canvas.drawImage( fruitScoresImg, this.frameX, 0, this.width, this.height, this.x, this.y, this.width, this.height );
	}
}


// ============
// Game State
// ============

var readyImg = new Image();
	readyImg.src = "img/ready.png";

var ready = {

	x: 88,
	y: 132,
	width: 50,
	height: 16,

	draw: function(){

		if(game.state == 'ready') canvas.drawImage( readyImg, this.x, this.y, this.width, this.height );
	}
}

var gameOverImg = new Image();
	gameOverImg.src = "img/gameOver.png";

var gameOver = {

	x: 71,
	y: 132,
	width: 84,
	height: 16,

	draw: function(){
		
		if(game.state == 'over') canvas.drawImage( gameOverImg, this.x, this.y, this.width, this.height );
	}
}


// ==========
// Pellets
// ==========

var pellets = [];

function pellet(I) {

	I.active = true;

	I.width = 2;
	I.height = 2;

	I.draw = function() {

		if(this.active){
			
			canvas.fillStyle = "#fff";
			canvas.beginPath();
			canvas.fillRect(this.x, this.y, this.width, this.height);
			canvas.fill();
		}
	};

	return I;
}

var superPelletImg = new Image();
	superPelletImg.src = 'img/superPellet.png';

var superPellets = [];

function superPellet(I) {

	I.active = true;

	I.width = 8;
	I.height = 8;

	I.draw = function() {

		if(this.active){
			
			canvas.drawImage( superPelletImg, this.x, this.y, this.width, this.height );
		}
	};

	return I;
}