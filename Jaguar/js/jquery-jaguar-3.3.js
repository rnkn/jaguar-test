/*********************************************************************************************/
// $Jaguar v3.3 || Crusader 12 || Exclusive to CodeCanyon
/*********************************************************************************************/	
;(function($){
var Jaguar={
	/*********************************************************************************************/
	/*  COMMON REFERENCES:
	*	gD = GAME DATA
	*	sD = SCENE DATA
	*	cD = CHARACTER DATA
	*	D  = MASTER DATA OBJECT 
	/*********************************************************************************************/
	// REFERENCE TO HTML ELEMENTS
	OBJ:{
		$Game:false,			// MAIN GAME CONTAINER
		$Char:false,			// MAIN CHARACTER ELEMENT
		$currentScene:false,	// CURRENT SCENE LIST ITEM
		$currentChapter:false,	// CURRENT CHAPTER UL ITEM
		$currentItem:false,		// REFERENCE TO LAST CLICKED ITEM
		$selectedItem:false,	// REFERENCE TO ITEM IN ACTION [GIVE/USE]
		$selectedExit:false,	// REFERENCE TO CLICKED EXIT
		$canvas:false,			// CURRENT CANVAS / PATH ELEMENT
		$foreground:false,		// CURRENT SCENE FOREGROUND
		$dBar:false,			// DESCRIPTION BAR
		$Inv:false,				// INVENTORY
		$Panel:false,			// LOWER GAME PANEL
		$Debug:false,			// DEBUG POPUP WINDOW
		$EXP:false,				// DEBUG EXP POINTS
		$Music:false,			// MUSIC AUDIO TAG
		$Ambient:false,			// AMBIENT SOUNDS TAG
		$Effect:false,			// EFFECT AUDIO TAG
		$DayNight:false,		// DAY & NIGHT CYCLE LAYER
		$Weather:false,			// WEATHER EFFECTS CANVAS
		$Fog:false,				// FOG EFFECTS CANVAS
		$SaveMenu:false,		// SAVE/LOAD MENU
		exitItems:[]			// ARRAY OF EXIT ITEMS WITHIN THE SCENE
	},
	// SAVEGAME REFERENCE OBJECT
	Load:{
		saveORload:false,	    // CURRENTLY SAVING OR LOADING A GAME [MENU]
		loading:false,			// USED TO FLAG LOADING SAVE GAMES [MENU]
		saving:false,			// USED TO FLAG SAVING SAVE GAMES [MENU]
		deleting:false,			// USED TO FLAG DELETING SAVE GAMES [MENU]		
		$slot:false,			// SELECTED GAME SLOT [MENU]
		slot_name:false,		// NAME OF SAVE GAME [USED TO SEE IF PLAYERS CHANGE THE SAVEGAME NAME - MENU]
		game_name:false,		// NAME OF SAVE GAME [USED THROUGHOUT JAGUAR]
		CharX:false,			// X POSITION FOR CHAR TO RETURN TO ['LEFT']
		CharY:false,			// Y POSITION FOR CHAR TO RETURN TO ['TOP']
		CharDirection:false,	// DIRECTION FOR CHAR TO RETUN FACING
		DayNightOpacity:false,	// SETS THE OPACITY OF THE DAY/NIGHT CYCLE LAYER
		pan_pos:false,			// GETS THE PAN POS IN PX
		play_entrance:true,		// DON'T PLAY ENTRANCES WHEN LOADING A SCENE
		loadInvItems:false,		// FLAG TO LOAD INVENTORY ITEMS
		loadpuzzleTimers:{}		// [ADDON: TIMERS] STORES ORIGINAL VALUE STRING TO RESTART TIMERS
	},
	// STORYLINE EVENT SWITCHES	AND CONDITIONS
	Story:{
		currentTime:0,			// RAF IS USED TO CONSTANTLY UPDATE THIS AS A MASTER TIME REFERENCE
		DayNightTimer:0,		// REFERENCE TO SETINTERVAL TIMER FOR DAY/NIGHT TRANSITIONS
		WeatherTimer:0,			// REFERENCE TO SETINTERVAL TIMER FOR WEATHER EFFECTS
		cutSceneTimer:0,		// REFERENCE TO SETINTERVAL TIMER FOR CUTSCENE DISPLAY
		riddleTimer:0,			// REFERENCE TO SETINTERVAL TIMER FOR RIDDLE ANSWER BOX DISPLAY
		fullyLoadedTimer:0,		// REFERENCE TO SETINTERVAL TIMER FOR LOADING ALL ELEMENTS IN A SCENE		
		NotAllowedTimer:0,		// REFERENCE TO SETINTERVAL TIMER FOR NOT-ALLOWED CURSOR
		ActionTimer:0,			// REFERENCE TO SETINTERVAL TIMER FOR SWAPPING ACTION SPRITES
		TalkTimer:0,			// REFERENCE TO SETINTERVAL TIMER FOR CHARACTER TALKING
		subtitleTimer:0, 		// REFERENCE TO SETTIMEOUT TIMER FOR SUBTITLE TEXT
		Day:true,				// INDICATES IF DAY
		ActionWord:false,		// CURRENT ACTION WORD IN DESCRIPTION BAR [INDEX OF VERB 0-8]
		joinWord:false,			// INDICATES THE JOINER WORD 'TO' OR 'WITH' IS ON
		currentSong:false,		// INDICATES NAME OF CURRENT MUSIC TRACK
		currentAmbient:false,	// INDICATES NAME OF CURRENT AMBIENT SOUND TRACK
		Inventory:[],			// ARRAY OF ALL INVENTORY ITEMS
		DeadItems:[],			// ARRAY OF ITEMS THAT HAVE BEEN USED [ LOADING ]
		currentMarker:false,	// USED TO REFERENCE THE CURRENT ACTIVE MAP MARKER [MAPS ADDON]
		puzzleTimers:{}			// [ ADDON ] ARRAY CONTAINING CURRENT PUZZLE-BASED TIMERS		
	},	
	// HOLDS USER-CREATED STATS [ GENERATED IN BUILDSTATS METHOD > CHARACTERS.JS MODULE ]
	Stats:{},
	/*********************************************************************************************/
	// PLUGIN SETTINGS -- USER CONFIGURABLE
	/*********************************************************************************************/	
	// GENERIC DIAGLOGUE LINES [MERGE WITH ITEMS]	
	Speech:{
		give_text:	   "I don't think that will work.",
		open_text: 	   "I can't open that.",
		close_text:    "I can't close that.",
		pick_up_text:  "I can't pick that up.",
		look_at_text:  "I don't see anything special.",
		talk_to_text:  "Hmm, no response.",
		use_text: 	   "That won't work.",
		push_text: 	   "It won't budge.",
		pull_text: 	   "It isn't moving.",
		// INVENTORY GIVE TEXT IS USED WHEN AN ITEM CANNOT BE GIVEN
		inv_give_text: "That isn't working.", 
		inv_open_text:    "It isn't opening.",
		inv_close_text:   "It isn't closing.",
		inv_pick_up_text: "I already have that.",
		inv_look_at_text: "I don't see anything special.",
		inv_talk_to_text: "It doesn't want to talk to me.",
		inv_use_text: 	  "That doesn't seem to work.",
		inv_push_text: 	  "It doesn't seem like that would work.",
		inv_pull_text: 	  "I don't see anything to pull.",
		// MISC
		too_far: "You're not close enough.",
		talk_no_more: "They don't seem to want to talk anymore.",
		not_ready_text: "It isn't quite ready.",
		riddle_correct_text: "That is correct.",
		riddle_incorrect_text: "That is incorrect.",
	},
	// GENERIC ACTIONS OBJECT (MERGES WITH CHARACTERS AND ITEMS)
	Actions:{
		// NOTE: THERE IS NO INV_GIVE:
		give:	 	 false,		
		open:    	 false,
		inv_open:	 false,		
		close:   	 false,
		inv_close:	 false,
		pick_up: 	 false,
		inv_pick_up: false,
		look_at: 	 true,
		inv_look_at: true,
		talk_to: 	 false,
		inv_talk_to: false,
		use:     	 false,
		inv_use:	 false,
		push:    	 false,
		inv_push:	 false,
		pull:    	 false,
		inv_pull:	 false	
	},
	Character:{
		// INTERNAL SETTINGS
		callback:false,			// FUNCTION TO CALL WHEN DONE WALKING
		action:false,			// CHARACTER IS PERFORMNING AN ACTION
		lastValidX:0,			// LAST VALID IN-BOUNDARY X COORDINATES (BOUNDARY DETECTION)
		lastValidY:0,			// LAST VALID IN-BOUNDARY Y COORDINATES (BOUNDARY DETECTION)
		loaded:false,			// COMPLETED IMAGE LOADING
		conversation:false,		// INDICATES CHARACTER IS HAVING A PLAY_CONVERSATION
		solvedRiddle:false,		// INDICATE CHARACTER'S RIDDLE HAS BEEN SOLVED		
		// GENERAL SETTINGS
		layer:true,				// DISABLE LAYERING OF AUX CHARACTERS 
		scale:'0.25,0.75',		// MINIMUM/MAXIMUM SCALABLE CHARACTER SIZE
		pos:'0,0',				// INITIAL STARTING POSITION FOR CHARACTER
		entrance:false,			// PERFORM SECONDARY ACTIONS WHEN CHARACTER ENTERS SCENE
		speed:2500,				// CHARACTER TRAVEL SPEED
		text_color:'#FFF',		// DIALOGUE COLOR
		proximity:150,			// CLOSEST PIXEL DISTANCE FROM CHARACTER TO AUX CHARACTER BEFORE ACTION HAPPENS
		hidden:false,			// DETERMINES VISIBILITY OF CHARACTER
		done_talking:false,		// ARRAY OF SECONDARY ACTIONS TO PERFORM WHEN DONE TALKING TO CHARACTER (ALL QUESTIONS)
		play_conversation:false,// PLAYS COMPLETE CONVERSATION THROUGH WHEN TALKING TO CHARACTER
		direction:'right',		// CHARACTER DIRECTION
		show_name:true,			// WHEN SET TO FALE WILL NOT SHOW THE TEXT
		action_time:350,		// DEFAULT TIME IT TAKES TO EXECUTE VERB ACTION
		// CHARACTER SPRITES
		image:false, up:false,	down:false,	right:false, left:false, 										// MAIN SPRITES
		give_image:false, give_up:false, give_down:false, give_right:false, give_left:false,				// GIVE SPRITES
		open_image:false, open_up:false, open_down:false, open_right:false, open_left:false,				// OPEN SPRITES
		close_image:false, close_up:false, close_down:false, close_right:false, close_left:false,			// CLOSE SPRITES
		pick_up_image:false, pick_up_up:false, pick_up_left:false, pick_up_right:false, pick_up_down:false,	// PICK UP SPRITES
		look_image:false, look_right:false, look_up:false, look_left:false, look_down:false,				// LOOK SPRITES
		talk_image:false, talk_up:false, talk_left:false, talk_right:false, talk_down:false,				// TALKING SPRITES
		use_image:false, use_up:false, use_down:false, use_left:false, use_right:false,						// USE SPRITES
		push_image:false, push_up:false, push_down:false, push_left:false, push_right:false,				// PUSH SPRITES
		pull_image:false, pull_up:false, pull_down:false, pull_right:false,	pull_left:false					// PULL SPRITES		
	},
	Scene:{
		// INTERNAL SETTINGS
		pathData:false,			// ARRAY CONTAINING BLACK/WHITE PIXELS
		ENT:false,				// INTERNAL REFERENCE FOR NEXT_POS SETTING
		ENT_IMG:false,			// INTERNAL REFERENCE FOR NEXT_IMG SETTING
		ENT_PAN:false,			// INTERNAL REFERENCE FOR NEXT_PAN SETTING
		ENT_WALK:false,			// INTERNAL REFERENCE FOR NEXT_WALK_TO SETTING
		talking:false,			// INDICATES THAT A CHARACTER IS TALKING		
		beenHere:false,			// INDICATES THE CHARACTER HAS BEEN IN THIS SCENE
		sceneItems:false,		// CONTAINS ALL ITEMS WITHIN THIS SCENE
		numItems:false,			// NUMBER OF ITEMS WITHIN THIS SCENE
		sceneChars:false,		// CONTAINS ALL CHARACTERS WITHIN THIS SCENE
		numChars:false,			// NUMBER OF CHARS WITHIN THIS SCENE
		fogLoaded:false,		// INTERNAL REFERENCE IF FOG IMAGE IS ENTIRELY LOADED
		// GENERAL SCENE SETTINGS
		background:false, 		// THE BACKGROUND ARTWORK FOR A SCENE
		foreground:false,		// FILE PATH TO SCENE FOREGROUND IMAGE
		speed:'300,200',		// TRANSITION SPEED FOR SCENES
		pan:false,				// PANNING SCENES [TRUE/FALSE]
		pan_pos:0,				// PANNING SCENES - SETS PANNING POSITION [SUPPLY A % TO PAN TO]
		horizon:'50,90',		// DEFINES THE HORIZON LINE AND FOREGROUND LINE (WHICH DEFINES THE SCALING AREA OF THE CHARACTER)
		text_time:60,			// CONTROLS THE SPEED THAT TEXT IS AVAILABLE TO READ (PER CHARACTER)
		death_speed:'250,250',	// ANIMATION TIMING TO FADE OUT/IN SCENE AND DEATH OVERLAY
		// SCENE SUBTITLE SETTINGS
		subtitle:false,			// SPECIAL SUBTITLE SCENE DESCRIPTION
		subtitle_speed:'1500,1500',// FADEOUT SPEED AND DELAY - HOW LONG TO SHOW THE SCENE SUBTITLE (0=INFINITY)
		subtitle_repeat:false,	// REPEAT SUBTITLES WHEN CHARACTER RETURNS TO SCENE?
		subtitle_color:'#FFF',	// SUBTITLE COLOR
		subtitle_pos:50,		// SUBTITLE POSITION PERCENTAGE FROM TOP
		subtitle_size:22,		// PIXEL SIZE ON SUBTITLE FONT
		// SCENE AUDIO SETTINGS		
		music:false,			// LOAD SCENE-SPECIFIC MUSIC
		music_volume:1,			// CONTROLS THE VOLUME OF MUSIC IN THIS SCENE [0-1]
		music_vol_speed:1000,	// ANIMATION SPEED FOR VOLUME ADJUSTMENT - MUSIC
		loop_music:true,		// LOOP SCENE MUSIC		
		ambient:false,			// LOAD SCENE-SPECIFIC AMBIENT SOUND
		ambient_volume:1,		// CONTROLS THE VOLUME OF AMBIENT SOUND IN THIS SCENE [0-1]
		ambient_vol_speed:1000,	// ANIMATION SPEED FOR VOLUME ADJUSTMENT - AMBIENT
		loop_ambient:true,		// LOOP AMBIENT SOUND
		// CUTSCENE SETTINGS
		skip_to:false,			// 'SCENE_ID' TO ADVANCE TO WHEN USER PRESSES ESC (27)		
		skip_key:27,			// KEY TO PRESS TO SKIP CUTSCENE
		skip_text:'true,press ESC to skip', // SKIP CUTSCENE TEXT
		cutscene:false,			// DETERMINS IS SCENE IS A CUTSCENE
		show_inv:false,			// DETERMINES IF CUTSCENE IS FULLSCREEN
		allow_click:false,		// CLICK TO MOVE PAST CUTSCENE [ACCEPTS THE ID OF SCENE TO JUMP TO]
		display_time:0,			// TIME TO DISPLAY CUTSCENE, OR 0 FOR DISABLED
		// CREDITS SETTINGS
		roll_credits:false,		// ROLL CREDITS IN THIS SCENE
		credits_speed:35000, 	// SPEED OF CREDITS
		repeat_credits:false,	// REPEAT CREDITS WHEN RETURNING TO SCENE
		// DAY/NIGHT CYCLE EFFECTS
		day_night:false, 		// ENABLES DAY/NIGHT CYCLING [DAY LENGTH, NIGHT LENGTH, TRANSITION TIME]
		indoor:false,			// INDICATES THAT THE SCENE IS INDOORS AND DAY/NIGHT CYCLES SHOULDN'T BE IN EFFECT
		day_night_image:false,	// TILE TO LOAD FOR DAY/NIGHT CYCLING LAYER
		night_color:'#000829',	// COLOR TO ANIMATE LAYER TO 'DAY,NIGHT'
		day_night_opacity:'0,0.5',// OPACITY TO ANIMATE LAYER TO 'DAY,NIGHT'
		// WEATHER EFFECTS CANVAS
		weather:false,			// WEATHER TYPE [RAIN OR SNOW]
		weather_speed:15,		// WEATHER SPEED
		weather_density:700,	// SEVERITY OF WEATHER
		weather_opacity:0.7,	// OPACITY OF WEATHER EFFECTS CANVAS
		weather_color:["#FFFFFF","#ccccff","#ccffff"], // ARRAY OF COLORS FOR WEATHER EFFECTS PARTICLES	
		weather_size:'0.75,20',	// WEATHER PARTICLE SIZE [RANDOM*FACTOR, MAXIMUM SIZE]
		// FOG EFFECTS CANVAS
		fog:false,				// FOG EFFECTS
		fog_image:114,			// FOG IMAGE FROM JAGUAR TILES [111-117]
		fog_density:100,		// DENSITY OF FOG
		fog_speed:2,			// FOG MOVEMENT SPEED
		fog_opacity:0.75,		// OPACITY OF FOG LAYER
		// TWINKLE EFFECTS
		stars:false,			// TWINKLING STAR EFFECTS
		sync_stars:true,		// SYNCS TWINKLING STARS WITH DAY/NIGHT CYCLING
		star_color:['#00fcff','#FFFFFF'], // TWINKLE STAR COLORS CAN BE ADDED USING ARRAY
		star_density:200,		// NUMBER OF TWINKLING STARS
		star_speed:0,			// SPEED OF TWINKLING STARS
		star_size:'2,15',		// SIZE OF TWINKLING STARS [MINIMUM, MAXIMUM]
		star_direction:'both',	// TWINKLING STAR DIRECTION
		star_range:'1,1',		// RANGE OF CANVAS WHERE STARS ARE PERMITTED [X,Y]
		// VERBS ACTION PANEL [ FOR USE WITH VERBS ADDON ]
		verb_give: 'Give,true',		verb_pick_up: 'Pick up,true',	verb_use: 'Use,true',
		verb_open: 'Open,true',		verb_look_at: 'Look at,true', 	verb_push: 'Push,true',
		verb_close: 'Close,true',	verb_talk_to: 'Talk to,true',	verb_pull: 'Pull,true',
		// MAP SETTINGS [ MAP ADDON ]
		map:false				// INDICATES IF SCENE IS A MAP SCENE
	},
	Item:{
		solvedRiddle:false,		// INDICATE ITEM'S RIDDLE HAS BEEN SOLVED
		play_conversation:false,// PLAYS COMPLETE CONVERSATION THROUGH WHEN TALKING TO ITEM
		loaded:false, 			// COMPLETED ITEM LOADING
		layer:true,				// DISABLE LAYERING OF LAYER ITEMS
		scale:1,				// ITEM SCALING
		type:false,				// REFERS TO TYPE OF SCENE ITEM - CHARACTER, OBJECT, EXIT
		exit_style:'true,true', // DETERMINES WHETHER AN EXIT ITEM (EXITS ON COLLISION, EXITS ON DOUBLE-CLICK)
		goto:false,				// EXIT ITEMS - SIGNALS WHAT SCENE TO EXIT TO
		pos:'0,0',				// INITIAL STARTING POSITION FOR ITEM 
		next_walk_to:false,		// ASSIGNED TO EXIT ITEMS FOR SPECIAL NEXT-SCENE WALK_TO ENTRANCE ANIMATIONS		
		next_pos:false,			// ASSIGNED TO EXIT ITEMS FOR SPECIAL NEXT-SCENE ENTRANCE POSITIONS
		image:false,			// ASSIGNED ITEM IMAGE [FILENAME OF ITEM IN ITEMS FOLDER]
		inv_image:false,		// SPECIAL ITEM IMAGE WHEN IN INVENTORY [FILENAME OF ITEM IN ITEMS FOLDER]
		next_image:false,		// IMAGE TO ASSIGN CHARACTER WHEN USING THIS EXIT ITEM TO ENTER NEXT SCENE
		next_pan:false,			// ASSIGN A SPECIAL PAN_TO % VALUE FOR NEXT SCENE
		hidden:false,			// VISIBILITY OF ITEM
		text:false,				// TEXT TO DISPLAY WHEN ITEM IS HOVERED (ITEM NAME)
		proximity:150,			// CLOSEST PIXEL DISTANCE FROM CHARACTER TO ITEM BEFORE ACTION HAPPENS		
		from_scene:false,		// THE NAME OF THE SCENE THAT THIS ITEM STARTED IN
		highlight_verb:false,	// HIGHLIGHTS A SPECIFIC VERB WHEN HOVERING AN ITEM
		use_verb:false,			// WILL ACT ON HIGHLIGHTED VERBS
		travel_time:500,		// USED WITH MAPS ADDON [DELAY AFTER CLICKING DESTINATION]
		current_marker:false,	// USED WITH MAPS ADDON [INDICATES CURRENT MAP POSITION]
		show_name:true			// WHEN SET TO FALE WILL NOT SHOW THE TEXT
	},

	
/***********************************************************************************************/
// INITIALIZE
/***********************************************************************************************/
init:function(options){
	var JAG=Jaguar,
		$teaser=$('#JAG_Teaser'),
		$GAME=JAG.OBJ.$Game=$(this), 
		$Chapters=$GAME.find('ul'), 
		$Scenes=$Chapters.find('li'),
		numScenes=$Scenes.length,
		gD=$GAME.data(),
		o=options,
		$head=$('head'),
		href=window.location.href;

	//////////////////////////////////////////////////////////
	// SETUP LUCASARTS GAME SKIN, CLASSES AND ANIMATED CURSORS
	//////////////////////////////////////////////////////////
	$GAME.addClass('JAG_Adventure'); $Chapters.addClass('JAG_Chapter'); $Scenes.addClass('JAG_Scene');
	$head.append('<link rel="stylesheet" type="text/css" href="Jaguar/css/'+o.skin+'.css"/>');
	$teaser.css('display','block').animate({opacity:1},{duration:400,queue:false});	


	////////////////////////////////////////////////////////////
	// APPLY MASTER SETTINGS [PASSED IN THROUGH THE PLUGIN CALL]
	////////////////////////////////////////////////////////////
	gD.title=hasVal(o.title) ? o.title : false;
	gD.debugkey=hasVal(o.debug_key) ? o.debug_key.pF() : 113;
	gD.menuKey=hasVal(o.menu_key) ? o.menu_key.pF() : 119;
	gD.objectivesKey=hasVal(o.objectives_key) ? o.objectives_key.pF() : 79;
	gD.startScene=hasVal(o.start_scene) && $('#'+o.start_scene.removeWS()).length ? $('#'+o.start_scene.removeWS()) : false;
	gD.load_text=hasVal(o.preloader_text) ? o.preloader_text : 'loading...';
	gD.preload_time=hasVal(o.preloader_time) ? o.preloader_time.pF() : 500;
	gD.text_follow=hasVal(o.text_follow) ? o.text_follow.isB() : true;
	gD.experience=0;
	gD.viewportW=$GAME.outerWidth(); gD.viewportH=$GAME.outerHeight(); 
	gD.canvasOffset=$GAME.offset();
	gD.scroll_sound=hasVal(o.scroll_sound) ? o.scroll_sound : 'scroll';
	// ANIMATE CURSORS	
	gD.ani_cursor=hasVal(o.ani_cursor) ? o.ani_cursor.isB() : true;
	if(gD.ani_cursor) JAG.aniCursor($GAME);
	// SETUP PLAYER STATS
	gD.player_name=hasVal(o.player_name) ? o.player_name : 'Player';
	gD.player_stats=hasVal(o.player_stats) ? o.player_stats : false;
	// START MAIN GAME TIMER	
	JAG.startTime(JAG);
	
	
	//////////////////////////////////////
	// [ LOADING A GAME ] NEED THIS AT TOP
	//////////////////////////////////////
	if(href.indexOf('?save_game') >= 0){
		var index=href.indexOf('?save_game='),
			gameName=href.substr(index+1).replace('save_game=',''),
			gameID=JAG.OBJ.$Game.attr('id');
		JAG.Load.game_name=gameName.replace(/\+/g,' ');
		// UPDATE DEAD [USED] ITEMS ARRAY [ BEFORE SETTING ITEM VISIBILITY ]
		JAG.Story.DeadItems=localStorage.getItem(gameID+'~'+JAG.Load.game_name+'~'+'JAG_DeadItems').split(',');
	};

				
	///////////////////////////////////////////////////////
	// ASSIGN START_SCENES AND UNIQUE IDS TO ALL GAME ITEMS
	///////////////////////////////////////////////////////
	for(var i=0; i<numScenes; i++){
		var $thisScene=$($Scenes[i]),
			$Items=$thisScene.find('div.JAG_Item'),
			$Chars=$thisScene.find('div.JAG_Char').add($thisScene.find('div.JAG_Aux_Char')),
			numItems=$Items.length,
			numChars=$Chars.length;
		// STORE THE ITEMS AND NUMBER OF ITEMS TO THIS SCENE
		$thisScene.data('scene').sceneItems=$Items;
		$thisScene.data('scene').numItems=numItems;
		$thisScene.data('scene').sceneChars=$Chars;
		$thisScene.data('scene').numChars=$Chars.length;
		$thisScene.data('scene').allItems=$Items.add($Chars);

		// LOOP THROUGH SCENE ITEMS
		for(var i2=0; i2<numItems; i2++){
			// MERGE AND UPDATE ITEM DATA
			var $Item=$($Items[i2]),
				iD=$Item.data('item'),
				itemD=$.extend({}, JAG.Item, !iD ? {} : iD || {}),
				visibility=itemD.hidden ? 'hidden' : 'visible';

			// ASSIGN UNIQUE ID [ FOR SAVING/LOADING ] TO ITEM
			if(iD.text){ $Item[0].id='JAG_ID_'+iD.text.toLowerCase().removeWS();
			}else{ console.log("Text settings not set for: "+$Item[0].className); };

			// INDICATE WHERE ITEM ORIGINATED
			itemD.from_scene=$Scenes[i].id; 
			$Item.data('item',itemD);

			// SET THE ITEM VISIBILITY
			// ALSO HANDLES MAP DESTINATION VISIBILITY
			if(JAG.Load.game_name){
				var itemName=$Item[0].id.toLowerCase().removeWS(),
					savedVis=localStorage.getItem(gameID+'~'+JAG.Load.game_name+'~'+itemName+'_item_visibility');
				if(savedVis) var visibility=savedVis;

				// IF AN ITEM HAS ALREADY BEEN USED [ REMOVED FROM INVENTORY ] IT IS DEAD
				if($.inArray(itemName, JAG.Story.DeadItems) > -1){
					var visibility='hidden';
				};
			};
			$Item.css('visibility',visibility);
		};

		
		// LOOP THROUGH SCENE CHARACTERS
		for(var i3=0; i3<numChars; i3++){
			// TEXT NAME BECOMES ID OF CHARARACTER			
			if($($Chars[i3]).hasClass('JAG_Aux_Char')){
				var $AuxChar=$($Chars[i3]),
					AcD=$AuxChar.data('character');
				// SCENE NAMES ARE INCLUDED IN THE CHARACTER IDS TO ALLOW FOR THE SAME
				// CHARACTER TO APPEAR IN MULTIPLE SCENES [ USING THE SAME TEXT NAME ]
				$AuxChar[0].id='JAG_ID_'+$Scenes[i].id+'_'+AcD.text.toLowerCase().removeWS();
			}};
	};
	
	
	//////////////////////////////////////////////////////
	// BUILD INVENTORY PANELS + SOUND_EFFECTS + MUSIC TAGS
	//////////////////////////////////////////////////////
	$GAME.buildStats(JAG, gD).buildInv(JAG)
		.append('<audio id="JAG_Music" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>\
		<audio id="JAG_Ambient" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>\
		<audio id="JAG_Effect" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>\
		<audio id="JAG_Scroll" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>')
		.prepend('<p id="JAG_Scene_Dialogue"></p>')
	
		// CLICK TEASER TO START GAME
		.one('click.Jaguar',function(){
			// PLAYS BLANK.MP3 WHEN TEASER IS CLICKED [ HACK FOR AUTOPLAYING ON IPADS ]
			JAG.OBJ.$Music[0].play(); 
			JAG.OBJ.$Ambient[0].play();
			JAG.OBJ.$Effect[0].play();

			//////////////////////////////////////////////////////
			// START MASTER GAME TIMER [RAF TIMING] & PRELOAD GAME
			//////////////////////////////////////////////////////
			$teaser.stop(true,false).animate({'opacity':0},{duration:400,queue:false,complete:function(){ 
				$teaser.remove(); 
				JAG.preloadGame(JAG, $Scenes, numScenes);
			}});
		})

		// DISABLE DRAGGING + CONTEXT MENU
		.on('dragstart contextmenu',function(e){ return false; });
	
	
	//////////////////////////
	// SAVE JAG.OBJ REFERENCES		
	//////////////////////////
	JAG.OBJ.$currentChapter=$($Chapters[0]);
	JAG.OBJ.$currentScene=gD.startScene ? gD.startScene[0] : $Scenes[0];
	JAG.OBJ.$Music=$('#JAG_Music');
	JAG.OBJ.$Ambient=$('#JAG_Ambient');
	JAG.OBJ.$Effect=$('#JAG_Effect');	

	
	/////////////
	// KEY EVENTS
	/////////////
	$(window).on('keyup.Jaguar', function(e){
		if(typeof D==='undefined') return;
 		var code=e.keyCode||e.which;
			
		switch(code){
			// DEBUG WINDOW [ F2 BY DEFAULT ]
			case D.gD.debugkey: JAG.OBJ.$currentScene.debug(JAG); break;
			// SAVE/LOAD WINDOW [ F8 BY DEFAULT ]
			case D.gD.menuKey:  JAG.OBJ.$Game.openMenu(JAG); break;
			// OPEN STATS || SKIP CUTSCENE [ ESC BY DEFAULT ]
			case D.sD.skip_key.pF():
				// SKIP CUTSCENE
				if(D.sD.cutscene){
					var skipText=D.sD.skip_text.split(',');
					if(D.sD.skip_to && skipText[0].removeWS().isB()){
						JAG.OBJ.$currentScene.prepend('<p id="JAG_Scene_Skip">'+skipText[1]+'</p>').jumpToScene(JAG, D, D.sD.skip_to); };
				// OPEN/CLOSE STATS WINDOW
				}else{ $GAME.openStats(JAG); };
			break;
		};

		// CLOSE LOAD/SAVE MENU [ ESC ]
		if(code===27 && JAG.OBJ.$SaveMenu && JAG.OBJ.$SaveMenu.is(':visible')) JAG.OBJ.$SaveMenu.find('div.JAG_Cancel').trigger('click');
	});
	
	
	//////////////////////////
	// [ LOADING GAME ] LAUNCH
	//////////////////////////	
	if(JAG.Load.game_name){
		// REMOVE CLICK TO INITIALIZE JAGUAR
		$GAME.off('click.Jaguar').loadGame(JAG, gameName);
		JAG.Load.saveORload=false;

		// UPDATE THE URL TO REMOVE THE LOADING AND SAVEGAME NAME
		window.history.pushState('', '', href.replace(href.substr(index),''));		
	// RESTARTING A GAME > JUMP TO TITLESCREEN
	}else if(href.indexOf('?restart') >= 0){
		// REMOVE CLICK TO INITIALIZE JAGUAR
		$GAME.off('click.Jaguar').restartGame(JAG);
	};
},







/***********************************************************************************************/
// SCENE RESETS [BETWEEN TRANSITIONS]
/***********************************************************************************************/
resetScene:function(JAG, scene){
	JAG.OBJ.$foreground=false;
	JAG.OBJ.$canvas=false;
	JAG.OBJ.$currentItem=false;
	JAG.OBJ.$selectedItem=false;
	JAG.Story.joinWord=false;
	JAG.OBJ.$currentScene=$(scene);
	JAG.OBJ.$currentChapter=$(scene).parents('ul.JAG_Chapter:first');
	JAG.OBJ.$Char=$(scene).find('div.JAG_Char').length ? $(scene).find('div.JAG_Char') : false;
	JAG.OBJ.exitItems=[];
	clearInterval(JAG.Story.WeatherTimer);
	clearInterval(JAG.Story.fullyLoadedTimer);
	clearInterval(JAG.Story.NotAllowedTimer);
	clearInterval(JAG.Story.ActionTimer);
	clearInterval(JAG.Story.TalkTimer);
	clearInterval(JAG.Story.riddleTimer);
	clearTimeout(JAG.Story.subtitleTimer);
	clearTimeout(JAG.Story.cutSceneTimer);

	////////////////////
	// REFERENCE OBJECTS
	////////////////////
	var cD=JAG.OBJ.$Char ? JAG.OBJ.$Char.data('character') : false,
		sD=JAG.OBJ.$currentScene.data('scene'),
		gD=JAG.OBJ.$Game.data();

	///////////////////
	// GAME INFORMATION
	///////////////////
	gD.switchingScenes=false;	// TRANSITIONING SCENES
	JAG.OBJ.$Effect[0].src='';	// STOPS SOUND EFFECTS
	$('#JAG_Cursor').removeClass('JAG_Wait_Cursor'); // DEFAULT CURSOR
	
	////////////////////
	// SCENE INFORMATION
	////////////////////
	sD.pathData=false;			// THE ARRAY OF BLACK/WHITE PIXELS TO CHECK PATH AGAINST
	sD.talking=false;			// REFERENCE TO CHARACTERS TALKING
	sD.fogLoaded=false;			// DETERMINES IF FOG IMAGE HAS BEEN FULLY LOADED
	sD.sceneW=0;				// REFERENCE TO SCENE WIDTH
	sD.sceneH=0;				// REFERENCE TO SCENE HEIGHT
	sD.panPos=0;				// REFERENCE TO SCENE PAN POSITION
	sD.text_time=60;			// CONTROLS THE SPEED THAT TEXT IS AVAILABLE TO READ (PER CHARACTER)
	
	////////////////////////
	// CHARACTER INFORMATION
	////////////////////////
	if(cD){
		cD.walking=false;		// REFERENCE TO WALKING STATE OF CHARACTER
		cD.action=false;		// ACTION IS BEING PERFORMED
		cD.callback=false;		// CANCEL ANY CALLBACK ACTIONS
		cD.loaded=false;		// REFERENCE TO IMAGE BEING COMPLETELY LOADED
		cD.conversation=false;  // REFERENCE TO PLAY_CONVERSATION
	};
		
	///////////////////
	// ITEM INFORMATION
	///////////////////
	if(sD.numItems>0) for(var i=0; i<sD.numItems; i++) $(sD.sceneItems[i]).data('item').loaded=false;
	
	////////////////////////////////////////
	// LOAD SCENE MUSIC [WHICHS LOADS SCENE]
	////////////////////////////////////////
	$(scene).loadMusic(JAG);
},





/***********************************************************************************************/
// PULL AND MERGE DATA FOR ALL OBJECTS
/***********************************************************************************************/
getDATA:function(JAG){
	//////////////////////////////////////////////////////////////////////////////////////////
	// FOR EASIER GAME DEV, SOME SETTINGS CAN BE AT HIGHER LEVELS AND AFFECT ALL LEVELS BELOW. 
	// EXAMPLE: IMAGE CAN BE APPLIED TO A CHAPTER AND AUTOMATICALLY BE APPLIED TO ALL SCENES 
	// IN THE CHAPTER. OBJECTS ARE MERGED TO ACCOMPLISH THIS:
	//////////////////////////////////////////////////////////////////////////////////////////

	// SETUP DATA
	var	$Char=JAG.OBJ.$Char,
		chptD=JAG.OBJ.$currentChapter.data('chapter'),
		gD=JAG.OBJ.$Game.data(),
		temp_cD=$Char ? $Char.data('character') : false,
		cD=$.extend({}, JAG.Character, !chptD?{}:chptD||{}, !temp_cD?{}:temp_cD||{} ),
		$Scene=JAG.OBJ.$currentScene,
		temp_sD=$Scene.data('scene'),
		sD=$.extend({}, JAG.Scene, !chptD?{}:chptD||{}, !temp_sD?{}:temp_sD||{} );

	/////////////////////
	// UPDATE MERGED DATA
	/////////////////////
	if($Char) $Char.data('character',cD);
	JAG.OBJ.$currentScene.data('scene',sD);
	
	////////////////////////////////////////////
	// RETURN DATA OBJECT USED THROUGHOUT JAGUAR
	////////////////////////////////////////////
	return D={gD:gD, sD:sD, cD:cD};
},




/***********************************************************************************************/
// PRELOAD GAME - LOAD ALL SCENE IMAGES INITIALLY
/***********************************************************************************************/
preloadGame:function(JAG, $Scenes, numScenes){
	var $Game=JAG.OBJ.$Game,
		imgsArray=[],
		preL=new Image(),
		src='Jaguar/images/preloader.gif';
		
	/////////////////////
	// LOAD THE PRELOADER
	/////////////////////
	$(preL).one('load',function(){
		// ADD PRELOADER TO GAME VIEWPORT
		$Game.prepend('<div class="JAG_Preloader"><img src="'+src+'"><p>'+$Game.data().load_text+'</p></div>');
		
		/////////////////
		// PRELOAD ASSETS
		/////////////////
		for(var i=0; i<numScenes; i++){
			var sD=$($Scenes[i]).data('scene');
			// ADD BACKGROUND+FOREGROUND IMAGES
			if(sD.background) imgsArray.push('Jaguar/scenes/'+sD.background);
			if(sD.foreground) imgsArray.push('Jaguar/scenes/'+sD.foreground);
			
			// ADD ITEM IMAGES
			for(var i2=0, l2=sD.numItems; i2<l2; i2++){
				var $Item=$(sD.sceneItems[i2]),
					iD=$Item.data('item');
				if(iD.image) imgsArray.push('Jaguar/items/'+iD.image+'.png');
			};
		};
		
		////////////////////////////
		// ADD ALL CHARACTER SPRITES
		////////////////////////////
		var spriteFiles=['up','left','down','right','image','open_image','open_up','open_down','open_left','open_right',
		'give_image','give_up','give_down','give_left','give_right','close_image','close_up','close_down','close_left','close_right',
		'pick_up_image','pick_up_up','pick_up_down','pick_up_left','pick_up_right','look_image','look_up','look_down','look_right','look_left',
		'talk_image','talk_up','talk_down','talk_left','talk_right','use_image','use_up','use_down','use_left','use_right',
		'push_image','push_up','push_down','push_left','push_right','pull_image','pull_up','pull_down','pull_left','pull_right'],
			chapD=$(JAG.OBJ.$currentChapter).data('chapter'), 
			charD=$('div.JAG_Char:first').data('character'),
			numSprites=spriteFiles.length;
		for(var i3=0; i3<numSprites; i3++) JAG.preloadSprite(chapD, charD, imgsArray, spriteFiles[i3]);

		
		///////////////////////////////////////////////////
		// SAVE STARTING TIME AND LOOP THROUGH IMAGES ARRAY
		///////////////////////////////////////////////////
    	var startTime=JAG.Story.currentTime,
			loaded=0, totalAssets=imgsArray.length;

    	$(imgsArray).each(function(){
			// LOAD IMAGE
        	$('<img>').attr('src', this).one('load',function(){
	            loaded++;

				///////////////////////////////////////
				// LAUNCH GAME IF ALL ASSETS ARE LOADED
				///////////////////////////////////////
        	    if(loaded===totalAssets){
					// MAKE SURE THE MINIMAL PRELOADER SCREEN TIME HAS ELAPSED
					var preloaderTimer=setInterval(function(){
						var currentTime=JAG.Story.currentTime,
							elapsed=currentTime-startTime;

							// LOAD GAME
							if(elapsed >= $Game.data().preload_time.pF()/1000){
								clearInterval(preloaderTimer);								
								var $preloader=$('div.JAG_Preloader');
								$preloader.stop(true,false).animate({opacity:0},{duration:500,queue:false,complete:function(){
									$preloader.remove();
									$([$('#JAG_Verbs')[0],$('ul.JAG_Chapter')[0],JAG.OBJ.$Inv[0]]).css('display','block');

									////////////////////////////
									// RESET AND LOAD NEXT SCENE
									////////////////////////////
									JAG.resetScene(JAG, JAG.OBJ.$currentScene);
								}});
							};
					},150);
				};
			});
	    });
	})[0].src=src;
},




/***********************************************************************************************/
// HELPER FUNCTION FOR PRELOADING SPRITES - JAG.preloadSprite(chapD, charD, imgsArray, sprite);
/***********************************************************************************************/
preloadSprite:function(chapD, charD, imgsArray, sprite){
	if(chapD[sprite]){
		if(chapD[sprite].indexOf(',') >= 0){		
			var chapDSprite=chapD[sprite].removeWS().split(',');
			imgsArray.push('Jaguar/chars/'+chapDSprite[0]+'.gif');
			imgsArray.push('Jaguar/chars/'+chapDSprite[1]+'.gif');				
		}else{
			imgsArray.push('Jaguar/chars/'+chapD[sprite].removeWS()+'.gif');				
		};
	}else if(charD[sprite]){
		if(charD[sprite].indexOf(',') >= 0){
			var charDSprite=charD[sprite].removeWS().split(',');
			imgsArray.push('Jaguar/chars/'+charDSprite[0]+'.gif');
			imgsArray.push('Jaguar/chars/'+charDSprite[1]+'.gif');				
		}else{
			imgsArray.push('Jaguar/chars/'+charD[sprite].removeWS()+'.gif');				
		};
	};
	
	return imgsArray;
},




/***********************************************************************************************/
// TIMER FOR GAME SESSION [RECORDS REAL-TIME MILLISECONDS TO JAG.STORY.currentTime]
/***********************************************************************************************/
startTime:function(JAG){
	//////
	// RAF
	//////
	window.requestAnimationFrame=function(){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame   || function(f){ window.setTimeout(f,1e3/60); };
	}();
	
	///////////////////
	// TIMING VARIABLES
	///////////////////
	var fps=30, 
		now, 
		then=Date.now(), 
		interval=1000/fps, 
		delta,
		first=then;
  
	function timeIt(){
	    requestAnimationFrame(timeIt);
        now=Date.now();
	    delta=now-then;
     
	    if(delta > interval){
	        then=now-(delta%interval);
			JAG.Story.currentTime=now;
	    };
	};
 	timeIt();
},



/***********************************************************************************************/
// ANIMATED MOUSE CURSOR: KEEPS IT AUTHENTIC - JAG.aniCursor($GAME);
/***********************************************************************************************/
aniCursor:function($GAME){
	if(!$('#JAG_Cursor').length) $GAME.prepend('<div id="JAG_Cursor"></div>');

	$GAME.on('mousemove', function(e){
		// USER SETS TOP/LEFT MARGINS IN SKIN CSS FOR OFFSETTING CURSOR		
		var $cur=$('#JAG_Cursor'),
			curX=e.pageX-$cur.css('margin-left').pF(),
			curY=e.pageY-$cur.css('margin-top').pF();		
		$cur.offset({left:curX, top:curY});
	});	
},



/***********************************************************************************************/
// SWAPS TO WAITING CURSOR - JAG.swapCursor(JAG);
/***********************************************************************************************/
swapCursor:function(JAG){
	var $cursor=$('#JAG_Cursor');
		$cursor.addClass('JAG_Wait_Cursor'),
		startTime=JAG.Story.currentTime;

	JAG.Story.NotAllowedTimer=setInterval(function(){ 
		var currentTime=JAG.Story.currentTime,
			elapsed=currentTime-startTime;
		if(elapsed >= 300){
			clearInterval(JAG.Story.NotAllowedTimer);
			$cursor.removeClass('JAG_Wait_Cursor'); 
		};
	},50);
}};


/***********************************************************************************************/
// PLUGIN DEFINITION
/***********************************************************************************************/
$.fn.Jaguar=function(method,options){
	if(Jaguar[method]){ return Jaguar[method].apply(this,Array.prototype.slice.call(arguments,1));
	}else if(typeof method==='object'||!method){ return Jaguar.init.apply(this,arguments);
	}else{ $.error('Method '+method+' does not exist'); }
}})(jQuery);

// EXTEND NATIVE CLASSES
String.prototype.removeWS=function(){return this.toString().replace(/\s/g, '');};
String.prototype.pF=function(){return parseFloat(this);};
Number.prototype.pF=function(){return parseFloat(this);};
String.prototype.isB=function(){return this.toString()=="true"?true:false;};
Boolean.prototype.isB=function(){return (this==true)?true:false;};
function hasVal(value){ return (value!=null && value!=undefined); };