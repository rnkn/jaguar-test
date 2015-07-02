/***********************************************************************************************/
// Jaguar - ENVIRONMENT MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// WEATHER EFFECTS - $Game.weatherEffects(JAG, D);
/***********************************************************************************************/
weatherEffects:function(JAG, D){
	/////////////////////////////
	// ADD WEATHER EFFECTS CANVAS
	/////////////////////////////
	if(!$('#JAG_Weather').length){
		$(this).prepend('<canvas id="JAG_Weather" width="'+D.gD.viewportW+'" height="'+D.gD.viewportH+'"></canvas>');	
		JAG.OBJ.$Weather=$('#JAG_Weather');
	};

	///////////////////
	// CANVAS VARIABLES
	///////////////////
	var canvas=JAG.OBJ.$Weather[0],
		ctx=canvas.getContext('2d'),
		w=canvas.width, h=canvas.height,
		effectType=D.sD.weather.toLowerCase().removeWS(),
		particles, x=0, y=0,
		noOfParticles=D.sD.weather_density.pF(),
		size=D.sD.weather_size.split(','),
		particleWidth=size[0].pF(),
		particleLength=size[1].pF(),
		particleSpeed=D.sD.weather_speed.pF(),
		particleColors=D.sD.weather_color,
		fallingParticles=[];
	JAG.OBJ.$Weather.css({opacity: D.sD.weather_opacity.pF(), 'visibility':'visible'});

	/////////////////
	// DRAW PARTICLES
	/////////////////
   	function drawParticles(){
		ctx.clearRect(0,0,w,h);
        for(var i=0; i<noOfParticles; i++){
			ctx.beginPath();
			if(effectType==='rain'){
				// DRAW THE LINE
		 		ctx.moveTo(fallingParticles[i].x, fallingParticles[i].y);
			    ctx.lineTo(fallingParticles[i].x, fallingParticles[i].y+(Math.random() * particleLength));
				ctx.lineWidth=Math.random()*particleWidth;				
			}else if(effectType==='snow'){
				// DRAW THE ARC
		      	ctx.arc(fallingParticles[i].x, fallingParticles[i].y, Math.random()*particleWidth, 0, 2*Math.PI, false);
			};
			
			// SET THE COLOR				
			ctx.fillStyle=particleColors[Math.floor(Math.random()*particleColors.length)];
			ctx.strokeStyle=particleColors[Math.floor(Math.random()*particleColors.length)];
			ctx.stroke();				
			ctx.fill();

			// SET SPEED
		    fallingParticles[i].y+=3+Math.random()*particleSpeed; 
			// REPEAT WHEN FALLS OUT OF VIEW
			if(fallingParticles[i].y > h){
				// ACCOUNT FOR IMAGE SIZE
		        fallingParticles[i].y=-25 
				//APPEAR RANDOMLY ALONG WIDTH
	    	    fallingParticles[i].x=Math.random()*w;    
	        };
   	    };
    };

	//////////////////
	// SETUP PARTICLES
	//////////////////
    function ParticleSetup(){
	    JAG.Story.WeatherTimer=setInterval(drawParticles, 36);
		for(var i=0; i<noOfParticles; i++){ 
           	var fallPart=new Object();
            fallPart["x"]=Math.random()*w;
		    fallPart["y"]=Math.random()*h;
    		fallingParticles.push(fallPart);
        };
   	};
	
	ParticleSetup();
},



/***********************************************************************************************/
// DAY & NIGHT CYCLING - $Scene.DayNightCycle(JAG, D);
/***********************************************************************************************/
DayNightCycle:function(JAG, D){

	//////////////////////
	// DAY & NIGHT CYCLING
	//////////////////////
	var $Scene=$(this),
		startTime=false,
		animating=false,
		dayLength=D.sD.day_night ? D.sD.day_night.split(',')[0].pF() : false,
		nightLength=D.sD.day_night ? D.sD.day_night.split(',')[1].pF() : false,
		transitionSpeed=D.sD.day_night ? D.sD.day_night.split(',')[2].pF() : false;
		
	/////////////////////////////////////////////////////////////////////////
	// ADD DAY/NIGHT CYCLE LAYER [MUST BE EVERY SCENE TO STAY BELOW DIALOGUE]
	/////////////////////////////////////////////////////////////////////////
	if(!JAG.OBJ.$currentScene.find('div.JAG_DayNightCycle').length) JAG.OBJ.$currentScene.prepend('<div class="JAG_DayNightCycle"></div>');
	JAG.OBJ.$DayNight=JAG.OBJ.$currentScene.find('div.JAG_DayNightCycle');

	///////////////////////////////////
	// HIDE ANIMATION FOR INDOOR SCENES
	///////////////////////////////////
	if(D.sD.indoor){ JAG.OBJ.$DayNight.css('visibility','hidden'); return; };

	//////////////////////////////////////////
	// CUSTOMIZE DAY/NIGHT LAYER TO THIS SCENE
	//////////////////////////////////////////
	if(JAG.Load.DayNightOpacity){ var opacity=JAG.Load.DayNightOpacity.pF();
	}else{ var opacity=JAG.Story.Day ? D.sD.day_night_opacity.split(',')[0].pF() : D.sD.day_night_opacity.split(',')[1].pF(); };
	
	JAG.OBJ.$DayNight.css({
		// SET DAY/NIGHT LAYER TILE		
		'background-image':D.sD.day_night_image ? ' url(Jaguar/tiles/bg_'+D.sD.day_night_image+'.png)' : 'none',
		// SET DAY/NIGHT LAYER INITIAL COLOR/OPACITY
		'background-color':D.sD.night_color,
		'opacity':opacity,
		'visibility':'visible'});
		
	////////////////////////////
	// START DAY/NIGHT ANIMATION
	////////////////////////////
	JAG.Story.DayNightTimer=setInterval(function(){
		// GET CURRENT TIME AND COMPARE TO START TIME
		var elapsed=startTime ? JAG.Story.currentTime-startTime : JAG.Story.currentTime;
		
		if(!animating && elapsed > (JAG.Story.Day ? dayLength : nightLength)){
			animating=true;
			var opacity=JAG.Story.Day ? D.sD.day_night_opacity.split(',')[1].pF() : D.sD.day_night_opacity.split(',')[0].pF();
			
			// DROP OPACITY OF FOG AND WEATHER LAYERS DURING NIGHTTIME
			if(D.sD.weather) JAG.OBJ.$Weather.stop(true,false).animate({'opacity':JAG.Story.Day ? D.sD.weather_opacity.pF() : 0.5},{queue:false});
			if(D.sD.fog) JAG.OBJ.$Fog.stop(true,false).animate({'opacity':JAG.Story.Day ? D.sD.fog_opacity.pF() : 0.5},{queue:false});

			JAG.OBJ.$DayNight.stop(true,false).animate({'opacity':opacity},{duration : transitionSpeed, queue:false, 
				step:function(now){	JAG.Load.DayNightOpacity=now; },complete:function(){
				// FLAG THAT ANIMATION IS DONE AND RESET TIMER
				animating=false;
				startTime=JAG.Story.currentTime;
				JAG.Story.Day=JAG.Story.Day ? false : true; 
			}});
		};
	},150);
},





/***********************************************************************************************/
// FOG LAYER - JAG.OBJ.$currentScene.fogEffects(JAG, D);
/***********************************************************************************************/
fogEffects:function(JAG, D){
	/////////////////////////
	// ADD FOG EFFECTS CANVAS
	/////////////////////////
	if($('#JAG_Fog').length) $('#JAG_Fog').remove();	
	JAG.OBJ.$currentScene.prepend('<canvas id="JAG_Fog" width="'+D.gD.viewportW+'" height="'+D.gD.viewportH+'"></canvas>');	
	JAG.OBJ.$Fog=$('#JAG_Fog');
	
	/////////////////////
	// PARTICLE VARIABLES
	/////////////////////
	var particles=[],
		particleCount=D.sD.fog_density.pF(),
		maxVelocity=D.sD.fog_speed.pF(),
		targetFPS=33,
		canvas=JAG.OBJ.$Fog[0],
		ctx=canvas.getContext('2d'),
		w=canvas.width,
		h=canvas.height,
		img=new Image();

	// SET IMAGE FOR EACH PARTICLE
	img.onload=function(){
		D.sD.fogLoaded=true;
		particles.forEach(function(particle){ particle.setImage(img); 
	})};
	img.src='Jaguar/tiles/bg_'+D.sD.fog_image+'.png';

	// CREATE PARTICLE
	function Particle(ctx){
		this.x=0; this.y=0;
	    this.xVelocity=0; this.yVelocity=0;
	    this.radius=60;
	    this.ctx=ctx;
	    this.draw=function(){
        	if(this.image){
            	this.ctx.drawImage(this.image, this.x-128, this.y-128);         
	            return;
    	    };
	    };

	    // UPDATE PARTICLE
    	this.update=function(){
        	// UPDATE PARTICLE POSITION BASED ON VELOCITY
	        this.x+=this.xVelocity; this.y+=this.yVelocity;
			// BOUNDARIES
	        if(this.x >= w){ this.xVelocity=-this.xVelocity; this.x=w; 
			}else if(this.x <= 0){ this.xVelocity=-this.xVelocity; this.x=0; };
    	    if(this.y >= h){ this.yVelocity=-this.yVelocity; this.y=h;
	        }else if(this.y <= 0){ this.yVelocity=-this.yVelocity; this.y=0; };
    	};

	    // SET PARTICLE POSITION
	    this.setPosition=function(x, y){ this.x=x; this.y=y; };
    	// SET PARTICLE VELOCITY
	    this.setVelocity=function(x, y){ this.xVelocity=x; this.yVelocity=y; };
    	this.setImage=function(image){ this.image=image; };
	};

	// GENERATE RANDOM NUMBER BETWEEN 2 VALUES
	function generateRandom(min, max){ return Math.random()*(max-min)+min; };

	// INITIALIZE
	function init(){
	    var canvas=JAG.OBJ.$Fog[0],
	       	ctx=canvas.getContext('2d');
        // CREATE PARTICLES AND SET THEIR INITIAL POSITIONS+VELOCITIES
 	    for(var i=0; i<particleCount; ++i){
            var particle=new Particle(ctx);
            particle.setPosition(generateRandom(0, w), generateRandom(0, h));
            particle.setVelocity(generateRandom(-maxVelocity, maxVelocity), generateRandom(-maxVelocity, maxVelocity));
   	        particles.push(particle);            
       	};
	};

	// DRAW SCENE
	function draw(){
	    // CLEAR
    	ctx.fillStyle="rgba(0, 0, 0, 0)";
	    ctx.clearRect(0, 0, w, h);		

		// DRAW PARTICLES
    	particles.forEach(function(particle){ particle.draw(); });
	};

	// UPDATE
	function update(){ particles.forEach(function(particle){ particle.update(); })};
	init();

    var fogTimer=setInterval(function(){ update(); draw(); },1000/targetFPS);
},



/***********************************************************************************************/
// TWINKLING STARS LAYER - JAG.OBJ.$currentScene.stars(JAG, D);
/***********************************************************************************************/
stars:function(JAG, D){
	
	////////////////////
	// CREATE STAR LAYER
	////////////////////
	if(!JAG.OBJ.$currentScene.find('div.JAG_Stars').length){
		JAG.OBJ.$currentScene.prepend('<div class="JAG_Stars"></div>');
		JAG.OBJ.$Stars=JAG.OBJ.$currentScene.find('div.JAG_Stars');
	
		//////////////////////////////////////////////
		// SYNC TWINKLING STARS WITH DAY/NIGHT CYCLING
		//////////////////////////////////////////////
		var $el=(D.sD.sync_stars && D.sD.day_night) ? JAG.OBJ.$DayNight : JAG.OBJ.$Stars;

		$el.sparkle({
			color:D.sD.star_color,
			count:D.sD.star_density.pF(),
			overlap:0,
			speed:D.sD.star_speed.pF(),
			minSize:D.sD.star_size.split(',')[0].pF(),
			maxSize:D.sD.star_size.split(',')[1].pF(),
			direction:D.sD.star_direction
		});
	}else{
		JAG.OBJ.$currentScene.find('div.JAG_Stars')[0].style.visibility="visible";
		JAG.OBJ.$Stars=JAG.OBJ.$currentScene.find('div.JAG_Stars');				
	};
}});

$(function(){
	$.fn.sparkle=function(options){
	    return this.each(function(k, v){
			var $this=$(v);
            var settings=$.extend({
                color:"rainbow",
                count:30,
                overlap:10,
                speed:1,
                minSize:4,
                maxSize:7,
				starX:1,
				starY:1,
                direction:"both"
            },options);

            var sparkle=new Sparkle($this, settings);
            sparkle.over($this);
        });
    };

    // Constructor method for sparkles,
    // we call init on the class and all other
    // methods on the the Sparkle class are prototyped
    function Sparkle($parent, options){
        this.options=options;
        this.init($parent);
    };

    Sparkle.prototype={
        "init": function($parent){
            var cssOpts={
                position:"absolute",
                top:"-"+this.options.overlap+"px",
                left:"-"+this.options.overlap+"px",
                "pointer-events":"none"};

            // we need to give the element position if it doesn't
            // already have it, so that we can put the canvas right over the top.
            if($parent.css("position")==="static") $parent.css("position", "relative");

            // set up the canvas element as a document fragment
            // and give it a class and some css amd append it to our parent element.
            this.$canvas=$("<canvas>").addClass("sparkle-canvas").css(cssOpts).hide();

            // check if the parent has a z-index, if it does then make the canvas 1 place higher than it!
            if($parent.css("z-index")!=="auto"){
                var zdex=parseInt($parent.css("z-index"),10);
                this.$canvas.css("z-index", zdex+1);
            };

            // check if the DOM element is a singleton, ie it
            // doesnt have a closing tag... we can't put the canvas inside an <img> for example.
            var singletons = "IMG|BR|HR|INPUT";
            var regexp = "\\b"+ $parent[0].nodeName +"\\b";
            this.isSingleton = new RegExp(regexp).test(singletons);

            if(this.isSingleton){ this.$canvas.insertAfter( $parent );
            }else{ this.$canvas.appendTo( $parent ); };

            // create our canvas context and save it for future use with this.canvas
            this.canvas=this.$canvas[0];
            this.context=this.canvas.getContext("2d");

            // create our sparkle sprite using the datauri supplied at end of prototype
            this.sprite=new Image();
            this.sprite.src=this.datauri;
            this.spriteCoords=[0, 6, 13, 20];

            // set the canvas width and height using the parent with and height set in the options
            this.canvas.width=$parent.parents('li.JAG_Scene:first').outerWidth()*1.2;
            this.canvas.height=$parent.parents('li.JAG_Scene:first').outerHeight()*1.2;
			
            // store our particles into an object for future use
            this.particles=this.createSparkles(this.canvas.width, this.canvas.height);
            this.anim=null;
            this.fade=false;
        },

        "randomParticleSize":function(){ return Math.floor(Math.random()*(this.options.maxSize-this.options.minSize+1)+this.options.minSize);},
        "randomHexColor":function(){ return '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6); },
        "createSparkles":function(w, h){
            // temporarily store our created particles
            var tempicles = [];

            // loop through and add a new particles on each loop for the count provided
            for(var i=0; i<this.options.count; i++){
                var color;
                if(this.options.color==="rainbow"){
                    // if we chose rainbow, give us much random so color very blergh
                    color=this.randomHexColor();
                }else if($.type(this.options.color)==="array"){
                    // if we supplied an array, choose a random color from array.
                    color=this.options.color[Math.floor(Math.random() * this.options.color.length)];
                }else{
                    color=this.options.color;
                };

                var yDelta=Math.floor(Math.random()*1000)-500;
                if(this.options.direction==="down" ){ yDelta=Math.floor(Math.random()*500)-550;
                }else if(this.options.direction==="up"){ yDelta=Math.floor(Math.random()*500)+50; };

                // create a particle with random position, random sprite start point, delta, size and a defined color.
                tempicles[i]={
                    position:{ 
						x:Math.floor(Math.random()*(w/this.options.starX)), 
						y:Math.floor(Math.random()*(h/this.options.starY))
					},
                    style:this.spriteCoords[Math.floor(Math.random() * this.spriteCoords.length)],
                    delta:{ x:Math.floor(Math.random()*1000)-500, y:yDelta },
                    size:this.randomParticleSize(),
                    color:color
                };
            };
            return tempicles;
        },

        "draw":function(){
            // draw is where we draw our particles to the stage. first we clear the entire context for updating.
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // for every particle
            for(var i=0; i<this.particles.length; i++){
                // save the context so we can restore teh default settings.
                this.context.save();
                this.context.globalAlpha=this.particles[i].opacity;
                this.context.drawImage(this.sprite, this.particles[i].style, 0, 7, 7, this.particles[i].position.x, this.particles[i].position.y, this.particles[i].size, this.particles[i].size);
                // if we set a color we want to tint the sprite with it
                if(this.options.color){
                    this.context.globalCompositeOperation="source-atop";
                    this.context.globalAlpha=0.6;
                    this.context.fillStyle=this.particles[i].color;
                    this.context.fillRect(this.particles[i].position.x, this.particles[i].position.y, 7, 7);
                };
                this.context.restore();
            };
        },
        "update": function(){
            // update is our particle alteration and animation frame render loop, calling draw on each update.
            var _this=this;
            this.anim=window.requestAnimationFrame(function(time){
                // store a floored version of the time passed
                var flatTime=Math.floor(time);
                for(var i=0; i<_this.particles.length; i++){
                    var p=_this.particles[i];
                    var resizeParticle=false;
                    // randomly move particles in the x/y direction we weight x heavier than y allowing some random
                    // decelleration giving an ethereal floating feeling
                    var randX=(Math.random()>Math.random()*2);
                    var randY=(Math.random()<Math.random()*5);
                    // arbitrary position change/speed based on what felt good.
                    if(randX) p.position.x+=((p.delta.x*_this.options.speed)/1500);
                    // arbitrary position change/speed based on what felt good.
                    if(randY) p.position.y-=((p.delta.y*_this.options.speed)/800);
                    // if particle fell off of canvas, then position it
                    // back at the opposite side... minus 7 pixels which is the
                    // largest size a particle can be.
                    if(p.position.x>_this.canvas.width){
                        p.position.x=-(_this.options.maxSize);
                        resizeParticle=true;
                    }else if(p.position.x <-(_this.options.maxSize)){
                        p.position.x=_this.canvas.width;
                        resizeParticle=true;
                    };

                    // if it fell off top or bottom, give it a random x position
                    if(p.position.y > _this.canvas.height) {
                        p.position.y=-(_this.options.maxSize);
                        p.position.x=Math.floor(Math.random()*_this.canvas.width);
                        resizeParticle=true;
                    }else if(p.position.y < -(_this.options.maxSize)){
                        p.position.y=_this.canvas.height;
                        p.position.x=Math.floor(Math.random()*_this.canvas.width);
                        resizeParticle=true;
                    };

                    // if the particle left the canvas, let's resize it
                    if(resizeParticle){
                        p.size=_this.randomParticleSize();
                        p.opacity=0.4;
                    };

                    // if we're trying to fade out fast because
                    // of a _out_ event, increase opacity delta
                    if(_this.fade){ p.opacity-=0.035;
                    }else{ p.opacity-=0.005; };

                    // if the opacity went below 0, then
                    // set it back to 1.2 (this gives slightly longer brightness)
                    if(p.opacity<=0.15) p.opacity=_this.fade?0:1.2;
                    // basically we want to randomly change the sparkles
                    // sprite position, this arbitrary number _felt_ right.
                    if(flatTime%Math.floor((Math.random()*7)+1)===0) p.style=_this.spriteCoords[Math.floor(Math.random()*_this.spriteCoords.length)];
                };
                // draw all the particles.
                _this.draw(time);
                // only _stop_ the animation after we've finished fading out and we also hide the canvas.
                if(_this.fade){
                    _this.fadeCount-=1;
                    if(_this.fadeCount < 0){
                        window.cancelAnimationFrame(_this.anim);
                        _this.$canvas.hide();
                    }else{ _this.update(); };
                }else{ _this.update(); };
            });
        },

        "over": function($parent){
            // We set the width/height of the canvas upon mouseover because of document-load issues with fonts and images and 
            // other things changing dimentions of elements.
            this.canvas.width=$parent.parents('li.JAG_Scene:first').outerWidth()+(this.options.overlap*2);
            this.canvas.height=$parent.parents('li.JAG_Scene:first').outerHeight()+(this.options.overlap*2);
            // also if the base element is a singleton then we re-position the
            // canvas. we don't want the canvas to be in the wrong position if something has moved.
            if(this.isSingleton) this.$canvas.css({top:$parent.position().top-this.options.overlap, left:$parent.position().left-this.options.overlap});
	        // we hide/show the canvas element on hover just to make sure it has it's garbage collected
            this.$canvas.show();
            // make sure the animation frame was cancelled, or we
            // get multiple update/draw loops happening (BAD) .. this
            // can happen because we let the animation loop continue while it fades out.
            window.cancelAnimationFrame(this.anim);
            // randomize the opacity every time we over the animation
            // this stops our particles all being at same opacity after the fadeout happens.
            for(var i=0; i<this.options.count; i++){ this.particles[i].opacity=Math.random(); };
            // run our update loop.
            this.fade=false;
            this.update();
        },

        "out": function() {
            // here we just tell the update loop that
            // we want to fade out, and that we want to take 100 frames to fade out
            this.fade=true;
            this.fadeCount=100;
        },

        // datauri is our sparkle sprite. Don't touch this.
        "datauri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAHCAYAAAD5wDa1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozNDNFMzM5REEyMkUxMUUzOEE3NEI3Q0U1QUIzMTc4NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozNDNFMzM5RUEyMkUxMUUzOEE3NEI3Q0U1QUIzMTc4NiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjM0M0UzMzlCQTIyRTExRTM4QTc0QjdDRTVBQjMxNzg2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjM0M0UzMzlDQTIyRTExRTM4QTc0QjdDRTVBQjMxNzg2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jzOsUQAAANhJREFUeNqsks0KhCAUhW/Sz6pFSc1AD9HL+OBFbdsVOKWLajH9EE7GFBEjOMxcUNHD8dxPBCEE/DKyLGMqraoqcd4j0ChpUmlBEGCFRBzH2dbj5JycJAn90CEpy1J2SK4apVSM4yiKonhePYwxMU2TaJrm8BpykpWmKQ3D8FbX9SOO4/tOhDEG0zRhGAZo2xaiKDLyPGeSyPM8sCxr868+WC/mvu9j13XBtm1ACME8z7AsC/R9r0fGOf+arOu6jUwS7l6tT/B+xo+aDFRo5BykHfav3/gSYAAtIdQ1IT0puAAAAABJRU5ErkJggg=="
    };
});