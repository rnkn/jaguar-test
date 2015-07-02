/***********************************************************************************************/
// Jaguar - SCENE MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// SCENE LOADING - $(scene).loadScene(JAG);
/***********************************************************************************************/
loadScene:function(JAG){
	// CUTSCENES
	if(D.sD.cutscene || D.sD.map){ JAG.OBJ.$currentScene.loadCutScene(JAG); return; };
	
	var	$Chap=JAG.OBJ.$currentChapter,
		$Scene=JAG.OBJ.$currentScene,
		src='Jaguar/scenes/'+D.sD.background,
		foreG=D.sD.foreground ? 'Jaguar/scenes/'+D.sD.foreground : false,
		img=new Image(),
		pathImg=new Image(),
		HOR=D.sD.horizon.split(',');
		// SET HORIZON/GROUND LINES
		D.sD.horizonLine=HOR[0].pF(); 
		D.sD.groundLine=HOR[1].pF();


	/////////////	
	// LOAD SCENE
	/////////////
	$(img).one('load',function(){
		/////////////////////////////////////////////
		// SAVE SETTINGS [SCENE DIMENSIONS & PANNING]
		/////////////////////////////////////////////
		D.sD.sceneW=this.width; 
		D.sD.sceneH=this.height;
		D.sD.pan=D.sD.sceneW > D.gD.viewportW;
		var setW=D.sD.pan ? D.sD.sceneW : D.gD.viewportW;
		
		// UPDATE DIMENSIONS [ FROM FULLSCREEN CUTSCENES ]
		$([JAG.OBJ.$currentScene[0],$Chap[0]]).css('height',D.sD.sceneH+'px');
		D.gD.viewportW=$Chap.outerWidth(); 
		D.gD.viewportH=$Chap.outerHeight();

		// ANIMATE DESCRIPTION BAR AND PANEL INTO VIEW
		if(JAG.OBJ.$Panel.is(':hidden')){
			$([JAG.OBJ.$Panel[0],JAG.OBJ.$dBar[0]]).css('display','block').stop(true,false)
			.animate({'opacity':1},{duration:D.sD.speed.split(',')[0].pF(),queue:false});
		};


		//////////////////
		// INSERT ELEMENTS
		//////////////////
		// FOREGROUND + BACKGROUND
		if(foreG){
			if(!$Scene.find('div.JAG_Foreground').length) $('<div class="JAG_Foreground"><img src="'+foreG+'"></div>').appendTo($Scene);
			JAG.OBJ.$foreground=$Scene.find('div.JAG_Foreground'); };
		if(!$Scene.find('img.JAG_Background').length) $('<img src="'+src+'" class="JAG_Background"/>').appendTo($Scene);
				
				
		/////////////////////////////////////////////////////////////////////
		// DRAW SCENE PATH IMAGE TO CANVAS FOR BOUNDARY DETECTION [_PATH.JPG]
		/////////////////////////////////////////////////////////////////////
		$(pathImg).one('load',function(){
			if(!$Scene.find('canvas.JAG_Canvas').length) $('<canvas class="JAG_Canvas" width="'+setW+'" height="'+D.sD.sceneH+'"></canvas>').appendTo($Scene);
			var canvas=JAG.OBJ.$canvas=$Scene.find('canvas.JAG_Canvas')[0],
				ctx=canvas.getContext('2d'),
				offsetX=D.gD.offsetX=D.gD.canvasOffset.left,
				offsetY=D.gD.offsetY=D.gD.canvasOffset.top,
				cW=canvas.width, cH=canvas.height;
		
			// DRAW IMAGE AND SAVE PATH PIXELS TO D.sD.pathData
			ctx.drawImage(pathImg, 0, 0);
    		D.sD.pathData=ctx.getImageData(0, 0, cW, cH).data;
		})[0].src=src.slice(0, src.length-4)+'_path.png';				
				
				
		///////////////////////////////////////////////////////////
		// LOAD CHARACTER, ITEM ASSETS, DESCRIPTION BAR & AUX CHARS
		///////////////////////////////////////////////////////////
		$Scene.loadChar(JAG, D).loadItems(JAG, D).dBar(JAG, D);
		if(D.sD.numChars>1) $Scene.loadAuxChars(JAG, D);


		//////////////////////////////////////////////////////////////////////////////		
		// LOOP THROUGH ALL SCENE ITEMS AND CHARACTERS TO SEE IF SCENE IS FULLY LOADED
		//////////////////////////////////////////////////////////////////////////////
		// CLEAN ARRAYS - REMOVE NULL/UNDEFINED
		D.sD.sceneChars=$.grep(D.sD.sceneChars,function(n){ return(n) });
		D.sD.sceneItems=$.grep(D.sD.sceneItems,function(n){ return(n) });


		/////////////////////////////////////////////////////
		// DAY & NIGHT CYCLING, WEATHER, FOG AND STAR EFFECTS
		/////////////////////////////////////////////////////
		if(D.sD.day_night) $Scene.DayNightCycle(JAG, D);					
		if(D.sD.weather && !D.sD.indoor) $Scene.weatherEffects(JAG, D);
		if(D.sD.fog) $Scene.fogEffects(JAG, D);
		if(D.sD.stars) $Scene.stars(JAG, D);

			
		/////////////////////////////////////////////////////////////////////
		// REPEATEDLY CHECK TO SEE IF EVERYTHING IS LOADED
		// GETTING CHARACTER H TOO SOON RESULTS IN MIS-POSITIONING/SCALING...
		/////////////////////////////////////////////////////////////////////
		JAG.Story.fullyLoadedTimer=setInterval(function(){			
			var	allChars=[], allItems=[];
			/////////////////////////////
			// CHECK CHARACTERS AND ITEMS
			/////////////////////////////
			for(var i=0; i<D.sD.numChars; i++){ 
				if(hasVal(D.sD.sceneChars[i])){ 
					if($(D.sD.sceneChars[i]).data('character').loaded) allChars.push('loaded'); 
				};
			};
			
			for(var i=0; i<D.sD.numItems; i++){ 
				if(D.sD.sceneItems[i]!=undefined){
					var iD=$(D.sD.sceneItems[i]).data('item'); 
					if(iD.loaded || iD.hidden) allItems.push('loaded'); 
				};
			};

			// MAKE SURE ALL SCENE IMAGES ARE LOADED [ INCLUDING FOG IMAGES ]
			if(allItems.length===D.sD.numItems && allChars.length===D.sD.numChars && JAG.OBJ.$canvas &&
              ((D.sD.fog && D.sD.fogLoaded) || !D.sD.fog)){
				$Scene.fullyLoaded(JAG, D);
				clearInterval(JAG.Story.fullyLoadedTimer);
			};	
		},100); 
	})[0].src=src;	

	return $(this);	
},




/***********************************************************************************************/
// MAKE SURE EVERYTHING IN THE SCENE IS COMPLETELY LOADED [AVOIDS TIMERS]
/***********************************************************************************************/
fullyLoaded:function(JAG, D){
	var $Scene=JAG.OBJ.$currentScene;
	
	/////////////////////////////////////
	// PANNING [SET PAN % OF BG POSITION]
	/////////////////////////////////////
	if(D.sD.pan){
		// USE ENT_PAN SETTING WHEN PRESENT
		var ENT_PAN=D.sD.ENT_PAN!==false && D.sD.ENT_PAN!=='false' ? D.sD.ENT_PAN.pF()/100 : D.sD.pan_pos.pF()/100,
			panPos=D.sD.panPos=-(ENT_PAN * (D.sD.sceneW-D.gD.viewportW));
		// IF LOADING A GAME, RETRIEVE PAN POSITION FOR THIS SCENE
		if(JAG.Load.pan_pos){ var panPos=JAG.Load.pan_pos.pF(); D.sD.panPos=panPos; };
		// SETUP WIDTH/POS FOR ALL RELATED SCENE ELEMENTS
		$Scene.css({width:D.sD.sceneW, 'margin-left':panPos});
		
		JAG.OBJ.$canvas.style.width=D.sD.sceneW;
		if(D.sD.foreground) $([JAG.OBJ.$foreground[0], JAG.OBJ.$foreground.find('img')[0]]).css('width',D.sD.sceneW);
		if(D.sD.weather && JAG.OBJ.$Weather) JAG.OBJ.$Weather[0].style.width=D.sD.sceneW;
		if(D.sD.fog && JAG.OBJ.$Fog) JAG.OBJ.$Fog[0].style.width=D.sD.sceneW;
		if(D.sD.stars && JAG.OBJ.$Stars) JAG.OBJ.$Stars.find('canvas.sparkle-canvas').css('width',D.sD.sceneW);
	}else{ $Scene.css('margin-left','0px'); };

	// RESET SAVE PAN INDICATOR
	JAG.Load.pan_pos=false;	

	////////////
	// SUBTITLES
	////////////
	if(D.sD.subtitle && (!D.sD.beenHere || (D.sD.beenHere && D.sD.subtitle_repeat.isB()))) $Scene.subTitle(JAG, D, D.sD.subtitle);
	
	
	//////////////////
	// CUSTOMIZE VERBS
	//////////////////
	if($.isFunction($.fn.verbs)) $Scene.verbs(JAG, D.sD);
		
	
	///////////////////////////////////////////////////////////////
	// SCALE CHARACTER - [MAKES SURE THEY HAVE BEEN RENDERED FIRST] 
	// CANNOT USE OUTERWIDTH(TRUE) SINCE MARGINS ARE NEGATIVE!
	// ENTRANCE SECONDARY ACTIONS HERE [TO AVOID DISAPPEARING CHARACTERS]
	///////////////////////////////////////////////////////////////
	if(D.sD.numChars>1) for(var i=0; i<D.sD.numChars; i++) $(D.sD.sceneChars[i]).scale(JAG, $(D.sD.sceneChars[i]).data('character'));
	JAG.OBJ.$Char.scale(JAG, D.cD).layerItem(JAG, D.sD.allItems, D.sD.allItems.length);


	///////////////////////////////////////
	// LOAD GAME ENTRANCE SECONDARY ACTIONS
	///////////////////////////////////////
	if(JAG.Load.play_entrance && D.cD.entrance && JAG.OBJ.$Char.Achievements(JAG, D.cD.entrance, false, 'entrance')){
		JAG.OBJ.$Char.actionLoop(JAG, D.cD.entrance, 'entrance');	
	};
	JAG.Load.play_entrance=true;


	///////////////////////////////////////////////////////////////////
	// LOAD GAME - UPDATE INVENTORY
	// THIS IS WHERE TO CHECK TO MAKE SURE ALL LOADGAME DATA IS CORRECT
	///////////////////////////////////////////////////////////////////
	if(JAG.Load.loadInvItems){
		var numInv=JAG.Story.Inventory.length,
			lS=localStorage,
			gameID=JAG.OBJ.$Game.attr('id');

		for(var i=0; i<numInv; i++){
			var $Item=$('#JAG_ID_'+JAG.Story.Inventory[i]),
				iD=$Item.data('item'),
				gameID=JAG.OBJ.$Game.attr('id');
			if($Item.length) $Item.addToInv(JAG, $Item.data('item'));
		};
	};
	JAG.Load.loadInvItems=false;

	//////////////////////
	// TRANSITION SCENE IN
	//////////////////////
	$Scene.transSceneIn(JAG);			
},




/***********************************************************************************************/
// SCENE IN TRANSITIONS $newScene.transSceneIn(JAG) 
/***********************************************************************************************/
transSceneIn:function(JAG){ 
	var	$Scene=JAG.OBJ.$currentScene,
		$newScene=$(this),
		$els=$([$newScene[0]]),
		speed_In=D.sD.speed.split(',')[0].pF();

	///////////////////////////////////
	// CREATE ARRAY OF ELEMENTS TO FADE
	///////////////////////////////////
	if(D.sD.day_night) $els.push(JAG.OBJ.$DayNight[0]);
	if(D.sD.weather && !D.sD.indoor) $els.push(JAG.OBJ.$Weather[0]);
	if(D.sD.fog) JAG.OBJ.$Fog.css({opacity:D.sD.fog_opacity.pF(), visibility:D.sD.fog ? 'visible' : 'hidden' });
	if(D.sD.stars) $els.push($Scene.find('div.JAG_Stars')[0]);

	///////////////////
	// FADEIN NEW SCENE
	///////////////////
	$els.css('display','block').stop(true,false).animate({opacity:1},{duration:speed_In,queue:false,complete:function(){
		D.gD.switchingScenes=false; 

		///////////////////////////////////////////////////////////////////
		// SETUP SCENE EVENTS ONLY AFTER THE SCENE IS READY [NOT CUTSCENES]
		///////////////////////////////////////////////////////////////////
		if(!D.sD.cutscene && !D.sD.map){ 
			$Scene.off('click dblclick').on('click dblclick',function(e){
				e.preventDefault(); 
				e.stopPropagation();
			
				//////////////////
				// EVENT VARIABLES
				//////////////////
				var $tar=$(e.target),
					$win=$(window),
					tarClass=$tar.attr('class'),
					// RESOLVE TARGET [CAN CLICK INNER IMAGES]			
					$target=(tarClass.indexOf('Img') >= 0) ? $tar.parent('div:first') : $tar,					
					mouseX=(e.clientX-D.gD.offsetX + $win.scrollLeft()).pF(),
					mouseY=(e.clientY-D.gD.offsetY + $win.scrollTop()).pF(),
					$Dialogue=$('#JAG_dialogue'),
					isAuxChar=tarClass.indexOf('JAG_Aux_Char') >= 0,
					isItem=tarClass.indexOf('JAG_Item') >= 0,
					isExit=isItem && $target.data('item').type.toLowerCase().removeWS()==='exit' ? true : false,
					isRiddle=$('#JAG_Riddle_Answer').is(':visible');
				
				// SOME USER ACTIONS PREVENT EVENTS FROM FIRING - RETURN THOSE HERE
				if(D.gD.switchingScenes || D.cD.action || $target.hasClass('JAG_Char') || D.cD.conversation  || isRiddle
				  || ($('#JAG_dialogue').is(':visible') && $Scene.find('p.JAG_Char_Dialogue').filter(':visible').length > 0)){
					// SWAP TO NOT_ALLOWED CURSOR - INDICATES ACTION CANNOT BE PERFORMED					
					if(D.gD.ani_cursor) JAG.swapCursor(JAG);
					if(isRiddle) $('#JAG_Riddle_Answer').find('input').focus();
					return;
				};


				// HANDLE EVENT TYPES		
				switch(e.type){
					///////////////
					// SINGLE CLICK
					///////////////
					case 'click':
						// SET TARGET AS CURRENT ITEM & REMOVE ANY CLICKED EXIT REFERENCES
						JAG.OBJ.$currentItem=$target;
						JAG.OBJ.$selectedExit=false;
						
						// CLOSE DIALOGUE
						if($Dialogue.length) $('#JAG_dialogue').closeDiag(JAG);					


						/////////////////////////////////////////////////////////////////
						// CLICKING AUX CHARACTER OR OBJECTS - ALLOW FOR LOOKING AT EXITS
						/////////////////////////////////////////////////////////////////
						if(JAG.Story.ActionWord!==false && (!isExit || (isExit && JAG.Story.ActionWord===4))
						   && (isAuxChar || (isItem && $target.data('item').text!==false))){

							// PERFORM ACTION
							$target.Action(JAG, isAuxChar ? 'character' : 'item', true, false);
					
							// SETUP TARGET VARIABLES
							var Tpos=$target.offset(),
								TW=$target.width(),
								TH=$target.height(),
								mL=Math.abs($target.css('margin-left').pF()),
								mouseY=Tpos.top-D.gD.offsetY+TH,
								mouseX=Tpos.left-D.gD.offsetX+TW;
							
							// GET CHARACTER'S DIRECTION [FOR FACE-TO-FACE]
							JAG.OBJ.$Char.returnDist($target);
							if(Diff.AcD){
								// DIRECTION THAT AUX CHARACTER IS FACING
								switch(Diff.AcD.direction){
									case 'left':
										var mouseX=(Tpos.left+mL)-D.gD.offsetX-JAG.OBJ.$Char.width(),
											mouseY=$target.position().top; break;
									case 'right':
										var mouseX=(Tpos.left+mL)-D.gD.offsetX+JAG.OBJ.$Char.width()+$target.outerWidth(true),
											mouseY=$target.position().top;
									break;
									case 'down':
										var mouseX=(Tpos.left+mL)-D.gD.offsetX+(JAG.OBJ.$Char.width()/2),
											mouseY=$target.position().top+(JAG.OBJ.$Char.height()/2); break;
									case 'up':
										var mouseX=(Tpos.left+mL)-D.gD.offsetX+(JAG.OBJ.$Char.width()/2),
											mouseY=$target.position().top-(JAG.OBJ.$Char.height()/2); break;						
								};
							};


						//////////////////////////////////
						// NOT CLICKING AUX CHAR OR OBJECT
						//////////////////////////////////
						}else{
							JAG.OBJ.$selectedItem=false;						
							if(isExit){
								// SAVE REFERENCE TO CLICKED EXIT ITEM								
								JAG.OBJ.$selectedExit=$target;
																
								// SWAP TO NOT_ALLOWED CURSOR - INDICATES ACTION CANNOT BE PERFORMED
								if(D.sD.talking && $Dialogue.length >= 0){
									if(D.gD.ani_cursor) JAG.swapCursor(JAG);
									return;
								};
							};
						};
						
						
						/////////////////////////////////////////////////////////
						// DISABLE DESC BAR ACTION WORD AND WALK TO CLICKED POINT
						/////////////////////////////////////////////////////////
						JAG.Story.ActionWord=false;
						JAG.Story.joinWord=false;
						$target.updateBar(JAG, 'exit', false, ' ');
						JAG.OBJ.$Char.walk(JAG, mouseX, mouseY, false); 
					break;
				
				
					////////////////////////////////////////////
					// DOUBLE CLICK - FAST-ADVANCE TO NEXT SCENE
					////////////////////////////////////////////
					case 'dblclick':
						if(isExit){
							// SWAP TO NOT_ALLOWED CURSOR - INDICATES ACTION CANNOT BE PERFORMED
							if(D.sD.talking && $Dialogue.length >= 0){
								if(D.gD.ani_cursor) JAG.swapCursor(JAG);
								return;
							};
							
							if($target.data('item').exit_style.split(',')[1].removeWS().isB()){
								$Scene.transSceneOut(JAG, $('#'+$target.data('item').goto)[0], $target);
							};
						};
					break;
				};
			});
		};
		
		
		///////////////
		// ROLL CREDITS
		///////////////
		if(D.sD.roll_credits) $Scene.rollCredits(JAG, D);
		
		// NOTE CHARACTER WAS HERE		
		D.sD.beenHere=true;
	}}); 


	//////////////////
	// UPDATE DEBUGGER
	//////////////////
	if(JAG.OBJ.$Debug && JAG.OBJ.$Debug.is(':visible')){
		if($Scene.find('div.JAG_Char').length) JAG.OBJ.$Debug.find('input[name="Char_Lines"]').debugCharLines(JAG);
		JAG.OBJ.$Debug.find('input[name="horizon_Line"]').debugHorizon(JAG, D);
		JAG.OBJ.$Debug.find('input[name="Show_Path"]').debugPath(JAG);
		JAG.OBJ.$Debug.find('input[name="Item_Lines"]').debugItemLines(JAG);
		JAG.OBJ.$Debug.find('input[name="hide_FG"]').debugForeground(JAG);
		JAG.OBJ.$Debug.find('input[name="show_Clip"]').debugSceneClipping(JAG,D);
		JAG.OBJ.$EXP.html(D.gD.experience);
		$('#JAG_Debug_currentScene').html($Scene[0].id);
	};
	
	return $(this);	
},



/***********************************************************************************************/
// SCENE OUT TRANSITIONS - $oldScene.transSceneOut(JAG, newScene, $ExitItem);
/***********************************************************************************************/
transSceneOut:function(JAG, newScene, $Item){
	D.gD.switchingScenes=true;
	var speed_Out=D.sD.speed.split(',')[1].pF(),
		$oldScene=$(this),
		$els=$([$oldScene[0]]);

	// ORGANIZE INVENTORY
	$oldScene.shuffleInv(JAG);
	
	// STOP WALKING TO PREVENT SCALING ISSUES IN THE NEXT SCENE
	if($oldScene.find('div.JAG_Char').length) JAG.OBJ.$Char.stop(true,false);
	

	//////////////////////////////////////////////
	// HANDLE SPECIAL SCENE ENTRANCES [NEXT_ VARS]
	//////////////////////////////////////////////
	if($Item){
		var iD=$Item.data('item'),
			nD=$(newScene).data('scene');
		// NEXT ATTRIBUTES [NEXT_POS, NEXT_IMAGE, NEXT_PAN]
		if(iD.next_pos) nD.ENT=''+iD.next_pos.split(',')[0].pF()+','+iD.next_pos.split(',')[1].pF()+'';
		nD.ENT_IMG=iD.next_image ? iD.next_image : false;
		nD.ENT_PAN=iD.next_pan!==false && iD.next_pan!=='false' ? iD.next_pan : false;
		nD.ENT_WALK=iD.next_walk_to!==false && iD.next_walk_to!=='false' ? iD.next_walk_to : false;
	};
	
	
	///////////////////////
	// HIDE ROLLING CREDITS
	///////////////////////
	if(D.sD.roll_credits) $oldScene.find('div.JAG_Credits').css({display:'none', top:D.gD.viewportH+'px'});
	
	
	////////////////////////////////////////////
	// REMOVE DIALOGUE ELEMENTS AND CLEAR TIMERS
	////////////////////////////////////////////
	$('#JAG_Aux_Char_Dialogue').remove();
	$oldScene.find('p.JAG_Char_Dialogue').add($('#JAG_Scene_Dialogue')).css({display:'none', opacity:0});
	clearTimeout(D.sD.subtitleTimer);


	////////////////////
	// FADEOUT OLD SCENE
	////////////////////
	$els.stop(true,false).animate({opacity:0},{duration:speed_Out, queue:false,complete:function(){
		////////////////////////////////////////////
		// HIDE SPECIAL EFFECTS AND DAY/NIGHT LAYERS
		////////////////////////////////////////////
		if(JAG.OBJ.$Weather) JAG.OBJ.$Weather[0].style.visibility='hidden';
		if(JAG.OBJ.$Fog) JAG.OBJ.$Fog.remove();
		if(JAG.OBJ.$DayNight){ JAG.OBJ.$DayNight.stop(true,false); clearInterval(JAG.Story.DayNightTimer); };
		if(JAG.OBJ.$Stars) JAG.OBJ.$Stars.remove();
		
		// RESET SCENE TO DEFAULTS
		$oldScene[0].style.display='none';		
		JAG.resetScene(JAG, newScene);
	}}); 
	
	return $(this);	
},




/***********************************************************************************************/
// SCENE SUBTITLES - JAG.OBJ.$currentScene.subTitle(JAG, D);
/***********************************************************************************************/
subTitle:function(JAG, D, subText){
	///////////////////////
	// GET DELAY & POSITION
	///////////////////////
	var $subtitle=$('#JAG_Scene_Dialogue'),
		sub_options=D.sD.subtitle_speed.split(','),
		subDelay=sub_options[1].pF(),
		subSpeed=sub_options[0].pF(),	
		multiSub=subText.indexOf('||') ? true : false,
		text=multiSub ? subText.split('||')[0] : subText;

	//////////////////////////////////
	// STYLE SUBTITLE AND GET POSITION
	//////////////////////////////////
	$subtitle.css({'font-size':D.sD.subtitle_size.pF()+'px', color:D.sD.subtitle_color, top:D.sD.subtitle_pos.pF()+'%', opacity:0, display:'block'})
		.html(text).stop(true,false).animate({opacity:1},{duration:subSpeed, queue:false});
			
	/////////////////
	// CREATE A DELAY
	/////////////////
	if(subDelay>0){
		JAG.Story.subtitleTimer=setTimeout(function(){ 
			clearTimeout(JAG.Story.subtitleTimer);				

			///////////////////////////////
			// FADEOUT SINGLE LINE SUBTITLE
			///////////////////////////////
			if(!multiSub){
				$subtitle.stop(true,false).animate({opacity:0},{duration:subSpeed,queue:false});

			/////////////////////////////////////////////////////
			// FADEOUT SINGLE SUBTITLE WITHIN MULTI-LINE SUBTITLE
			/////////////////////////////////////////////////////
			}else{

				// REMOVE FIRST SUBTITLE
				var newSub=subText.split('||');
					newSub.shift(); 
							
				for(var i=0, l=newSub.length; i<l; i++){
					// REMOVE WHITESPACE AT BEGINNING OF TEXT AND TRAILING COMMAS
					newSub[i]=newSub[i].replace(/^\s+|\s+$/g,'');
					// ADD || AS A SEPARATOR ON ALL EXCEPT LAST TEXT
					if(i!==newSub.length-1) newSub[i]+=' ||';
				};

				// MERGE THE ARRAY WITHOUT ANY CHARACTERS
				var nextSub=newSub.join(' ');
				$subtitle.stop(true,false).animate({opacity:0},{duration:subSpeed,queue:false,complete:function(){
					// CONTINUE WITH NEXT LINE
					if(nextSub) JAG.OBJ.$currentScene.subTitle(JAG, D, nextSub);
				}});
			};
		}, subDelay); 
	};
}});