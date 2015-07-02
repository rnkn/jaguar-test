/***********************************************************************************************/
// Jaguar - SECONDARY ACTIONS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOOP THROUGH ALL SECONDARY ACTIONS
/***********************************************************************************************/
actionLoop:function(JAG, Actions, primAction){
	///////////////////
	// ACTION VARIABLES
	///////////////////
	var $Char=JAG.OBJ.$Char,
		$Item=$(this),
		itemType=$Item.hasClass('JAG_Aux_Char') || $Item.hasClass('JAG_Char') ? 'character' : 'item',
		iD=$Item.data(itemType),
		numofActions=Actions.length,
		inInv=false,
		beenThere=false;
	
	/////////////////////////////////////////////////
	// PERFORM SECONDARY ACTIONS AFTER PRIMARY ACTION
	/////////////////////////////////////////////////
	for(var i=0; i<numofActions; i++){
		//////////////////////////////////////////////
		// MODIFY SETTING IF IT IS SENT IN AS AN ARRAY
		//////////////////////////////////////////////
		if(typeof Actions[i][0]==='object'){
			var mod=Actions[i][0].indexOf('modify');			
			$Char.modData(JAG, Actions[i]);
			
		/////////////////////////////////
		// ALL OTHER SETTINGS ARE STRINGS
		/////////////////////////////////
		}else{
			var string=Actions[i][0].toLowerCase().removeWS(), // CACHE FOR STRING THAT SPACES DON'T MATTER
				property=string.split(':')[0],
				show=property.indexOf('show'),			
				hide=property.indexOf('hide'),
				walk_to=property.indexOf('walk_to'),
				rem_Inv=property.indexOf('inv_remove'),
				add_Inv=property.indexOf('inv_add'),
				say=property.indexOf('say'),
				say_after=property.indexOf('say_after'),
				sound=property.indexOf('play_sound'),
				sound_volume=property.indexOf('sound_volume'),
				goto=property.indexOf('goto'),
				die=property.indexOf('die'),
				value=Actions[i][0].split(':')[1];

			/////////////////////////////////////////////////////
			// PERFORM SECONDARY ACTIONS IF STRING MATCH IS FOUND
			/////////////////////////////////////////////////////
			if(sound >=0)	  $Item.playSound(JAG, value);
			if(show >=0) 	  $Char.s_Show(JAG, value.toLowerCase().removeWS(), itemType);
			if(hide >=0) 	  $Char.s_Hide(JAG, value.toLowerCase().removeWS(), itemType);
			if(walk_to >=0)   $Char.s_Walk_to(JAG, D, value.split(','));
			if(rem_Inv >=0)   $Char.s_rem_Inv(JAG, value.toLowerCase().removeWS());
			if(add_Inv >=0)	  $Char.s_add_Inv(JAG, value.toLowerCase().removeWS());
			if(say >=0 && say_after ===-1) $Item.s_Say(JAG, value, false);
			if(say_after >=0) $Item.s_Say(JAG, value, true);
			if(die >=0)		  $Char.die(JAG, D, value);
			if(goto >=0){
				var goVal=value.split(','),
					jumpTimer=setTimeout(function(){
						clearTimeout(jumpTimer);
						$Char.jumpToScene(JAG, D, goVal[0]);
					},goVal[1].pF());
			};

			/////////////////////
			// CHANGE ITEM SPRITE
			/////////////////////
			if(string.indexOf('change_sprite') >=0){
				// IF ITEM IS IN INVENTORY
				if($Item.parents('span.JAG_Inv_Set').length){
					$Item.attr('src','Jaguar/items/'+value+'.png').data('item').inv_image=value;
					$Item.data('item').image=value;
				// ITEM IS IN SCENE
				}else{
					$Item.find('img').attr('src','Jaguar/items/'+value+'.png').end().data('item').image=value;
					$Item.data('item').inv_image=value;
				};
			};
			
			
			/////////////////////////////
			// CHARACTER STATS +/- POINTS
			/////////////////////////////
			if(property.indexOf('stat_') >=0){
				// GET THE STAT AND +/- VALUE TO UPDATE
				var stat=property.replace('stat_','');
				if(JAG.Stats[stat]!==undefined){
					// MAKE SURE NEW VALUE ISN'T BELOW 0 OR ABOVE _MAX VALUE
					var newStatVal=JAG.Stats[stat]+value.pF(),
						maxStatVal=JAG.Stats[stat+'_max'];
					JAG.Stats[stat]=newStatVal > maxStatVal ? maxStatVal : Math.max(0, newStatVal);
				};
			};
			
			////////////////////////
			// [ADDON] PUZZLE TIMERS
			////////////////////////
			if(property.indexOf('start_timer') >=0) $Item.startPuzzleTimer(JAG, value, false);
		};
	};

	return $Item;
},


/***********************************************************************************************/
// CHECK ACHIEVEMENTS - $Item.Achievements(JAG, Actions, JAG.OBJ.$selectedItem, verb);
/***********************************************************************************************/
Achievements:function(JAG, Actions, $invItem, verb){
	// ONLY CONTINUE FOR SECONDARY ACTIONS
	if(typeof Actions!=='object' && typeof Actions!=='boolean') return false;

	////////////////////////
	// ACHIEVEMENT VARIABLES
	////////////////////////
	var $Item=$(this),
		iD=$Item.hasClass('JAG_Item') ? $Item.data('item') : $Item.data('character'),
		inInv=false,
		beenThere=false,
		hasReqSprite=false,
		set_Inv=false,
		set_beenThere=false,
		set_req_sprite=false,
		riddle=false,
		puzzleTimer=false,
		beatTimer=false,
		solvedRiddle=false,
		riddleText=false,
		// SET TO TRUE IN CASES LIKE "pick_up":true TO ALLOW ACHIEVEMENTS TO BE MET
		canRepeat=typeof Actions==='boolean' ? true : false,
		haveStats=true,
		l=Actions.length;
	
	/////////////////////////
	// LOOP SECONDARY ACTIONS
	/////////////////////////
	for(var i=0; i<l; i++){
		var actionStr=Actions[i][0].split(':'),
			action=actionStr[0].toLowerCase().removeWS(),
			value=actionStr[1];
		
		/////////////////
		// MUST HAVE ITEM
		/////////////////
		if(action==='must_have'){
			var set_Inv=true, 
				inInv=JAG.Story.Inventory.indexOf(value.removeWS()) >=0;
		};

		///////////////////////////////////////////////////////////////
		// REQUIRED SPRITE [COMBINING INVENTORY ITEMS TO CHANGE SPRITE]
		///////////////////////////////////////////////////////////////
		if(action==='req_sprite' && $invItem){
			var set_req_sprite=true,
				hasReqSprite=$invItem.data('item').image.toLowerCase().removeWS()===value;		
		};
		
		////////////////
		// BEEN TO SCENE
		////////////////
		if(action==='been_to'){
			var set_beenThere=true,
				$Scenes=JAG.OBJ.$Game.find('ul.JAG_Chapter').find('li'),
				numScenes=$Scenes.length;
			//////////////
			// LOOP SCENES
			//////////////
			for(var iS=0; iS<numScenes; iS++){
				// MATCH SCENE NAME TO SCENE ID
				if($Scenes[iS].id.toLowerCase().removeWS()===value){
					if($($Scenes[iS]).data('scene').beenHere) var beenThere=true;
				};
			};
		};
		
		////////////////////////
		// [ADDON] SOLVED RIDDLE
		////////////////////////
		if(action==='riddle'){
			var riddle=true,
				riddleText=Actions[i][0].split(':')[1];
			if(iD.solvedRiddle) var solvedRiddle=true;
		};
		
		////////////////////////////
		// [ADDON] BEAT PUZZLE TIMER
		////////////////////////////
		if(action==='stop_timer'){
			var puzzleTimer=true,
				timerName=Actions[i][0].split(':')[1].toLowerCase().removeWS();

			// TIMER HAS BEEN STARTED BEFORE 
			if(JAG.Story.puzzleTimers.hasOwnProperty(timerName)){
				/////////////////////////
				// TIMER IS STILL RUNNING
				/////////////////////////
				if(JAG.Story.puzzleTimers[timerName]!==false){
					$('div.JAG_PuzzleTimer_'+timerName).stopPuzzleTimer(JAG, timerName, true);
					
					var beatTimer=true;
				};				
			};
		};
			
		////////////////////////////////////////////////////////////////
		// REPEAT SECONDARY ACTIONS X NUMBER OF TIMES [EXIT IS COMPLETE]
		////////////////////////////////////////////////////////////////
		// SET INITIAL 0 _FIRED VALUE
		if(iD[verb+'_fired']=='undefined' || iD[verb+'_fired']==null) iD[verb+'_fired']=0;
		if(action==='repeat_count' && (iD.solvedRiddle || !riddle)){
			// CAN FIRE SECONDARY ACTIONS
			if(iD[verb+'_fired'] < value.pF()){
				var canRepeat=true;
				iD[verb+'_fired']++;				
			// DON'T FIRE SECONDARY ACTIONS AGAIN!
			}else{
				$Item.saySomething(JAG, JAG.OBJ.$Char, iD[verb+'_text'], JAG.OBJ.$currentScene, false);
				return false;
			};
		// REPEAT COUNT NOT PROVIDED - RUN INDEFINITELY
		}else{
			var canRepeat=true;
		};
		
		
		///////////////
		// PLAYER STATS
		///////////////
		if(action.indexOf('req_stat_') >=0){
			// FLAG ANY STAT THAT DOESN'T MEET THE REQ POINTS
			if(JAG.Stats[action.replace('req_stat_','')] < value.pF()) var haveStats=false;
		};		
	};
	
	
	///////////////////////
	// ALL ACHIEVEMENTS MET
	///////////////////////
	if(canRepeat && haveStats && 							// CAN STILL FIRE SECONDARY ACTIONS AND HAVE STAT POINTS
	  (!puzzleTimer || (puzzleTimer && beatTimer)) &&		// IF TIMER EXISTS AND CHARACTER BEAT TIMER
	  (!set_Inv || (set_Inv && inInv)) && 					// HAS THE REQUIRED INVENTORY ITEM
	  (!riddle || (riddle && solvedRiddle)) &&				// SOLVED RIDDLE IF EXISTS
	  (!set_beenThere || (set_beenThere && beenThere)) &&	// HAS BEEN TO SPECIFIC SCENE
	  (!set_req_sprite || (set_req_sprite && hasReqSprite)) // INVENTORY ITEM IS A SPECIFIC SPRITE
	){ 
		return true;
		
	///////////////////////////
	// NOT ALL ACHIEVEMENTS MET
	///////////////////////////
	}else{
		/////////////////////////////////////////////////////////
		// RIDDLE HAS NOT BEEN SOLVED
		// SECONDARY ACTIONS ARE NOT FIRED UNTIL RIDDLE IS SOLVED
		/////////////////////////////////////////////////////////
		if(riddle && !solvedRiddle){
			$Item.riddle(JAG, D, iD, riddleText, verb);
		}else{
			// RESET THE FIRED COUNT TO INDICATE PUZZLE IS NOT SOLVED
			iD[verb+'_fired']=0;
			$Item.saySomething(JAG, JAG.OBJ.$Char, iD.not_ready_text, JAG.OBJ.$currentScene, false);
		};
		
		return false;		
	};
},



/***********************************************************************************************/
// WALK CHARACTER TO COORDINATES
/***********************************************************************************************/
s_Walk_to:function(JAG, D, walk_to){
	var $Char=$(this);
	
	////////////////////////////////
	// CREATE A SCENE ENTRANCE DELAY
	////////////////////////////////
	var waitForIt=setTimeout(function(){	
		// BY DEFAULT, THE DESTINATION COORDINATES FOR WALK_TO
		// SECONDARY ENTRANCE ACTIONS ARE ON THE CHARACTER.
		// OVERRIDEN BY PLACING THEM ON EXITS [SAVED TO D.SD.ENT_WALK]
		if(!D.sD.ENT_WALK){
			var toX=(walk_to[0].pF()/100)*D.gD.viewportW.pF(),
				toY=(walk_to[1].pF()/100)*D.gD.viewportH.pF();
		}else{
			var newWalk=D.sD.ENT_WALK.split(','),
				toX=(newWalk[0].pF()/100)*D.gD.viewportW.pF(),
				toY=(newWalk[1].pF()/100)*D.gD.viewportH.pF();
		};

		$Char.walk(JAG, toX, toY, false);
		clearTimeout(waitForIt);
	},walk_to[2].pF()||100);
},



/***********************************************************************************************/
// SHOW/HIDE OTHER OBJECTS
/***********************************************************************************************/
s_Show:function(JAG, show){ 
	var $El=$('#JAG_ID_'+show.toLowerCase().removeWS()),
		itemType=$El.hasClass('JAG_Item') ? 'item' : 'character';
	$El.css('visibility','visible').data(itemType).hidden=false; 
},
s_Hide:function(JAG, hide){
	var $El=$('#JAG_ID_'+hide.toLowerCase().removeWS()),
		itemType=$El.hasClass('JAG_Item') ? 'item' : 'character';
	$El.css('visibility','hidden').data(itemType).hidden=true; 
},



/***********************************************************************************************/
// SECONDARY SAY
/***********************************************************************************************/
s_Say:function(JAG, say, callback){ 
	var $Char=JAG.OBJ.$Char,
		$Scene=JAG.OBJ.$currentScene;

	// HIDE ANY EXISTING TEXT FIRST TO INSURE SAYSOMETHING FIRES
	D.sD.talking=false;
	$('p.JAG_Char_Dialogue')[0].style.display='none';

	// SAY SOMETHING WHILE WALKING OR AFTER
	if(callback){
		D.cD.action=true;
		D.cD.callback=function(){ $Char.saySomething(JAG, $Char, say, $Scene, false); };
	}else{
		$Char.saySomething(JAG, $Char, say, $Scene, false);
	};
},


/***********************************************************************************************/
// ADD/REMOVE ITEM TO INVENTORY
/***********************************************************************************************/
s_add_Inv:function(JAG, addInv){ 
	var $Item=$('#JAG_ID_'+addInv);
	$Item.addToInv(JAG, $Item.data('item')); 
},
s_rem_Inv:function(JAG, rem_Inv){ 
	var $Item=$('#JAG_ID_'+rem_Inv),
		iD=$Item.data('item');
	if(JAG.OBJ.$Inv.find($Item).length) $Item.remFromInv(JAG, iD.text);
},


/***********************************************************************************************/
// CHARACTER DIES - $Char.die(JAG, D);
/***********************************************************************************************/
die:function(JAG, D, text){
	JAG.OBJ.$Game.prepend('<div id="JAG_Die_Overlay"><p>'+text+'</p><div class="JAG_Die_Restart">Click to Continue</div></div>');
	var $DieOver=$('#JAG_Die_Overlay'),
		speed=D.sD.death_speed.split(',');
	
	// FADE OUT SCENE
	JAG.OBJ.$currentScene.stop(true,false).animate({opacity:0},{duration:speed[0].pF(),queue:false});
	
	// FADEIN DEATH OVERLAY
	$DieOver.css({display:'block', opacity:0}).animate({opacity:1},{duration:speed[0].pF(),queue:false,complete:function(){
		JAG.OBJ.$Panel[0].style.display='none';	
	
	// CLICKING OVERLAY RESTARTS THE GAME
	}}).one('click',function(){
		// FADEOUT DEATH OVERLAY
		$DieOver.stop(true,false).animate({opacity:0},{duration:speed[1].pF(),queue:false,complete:function(){
			$DieOver.restartGame(JAG);
		}});
	});
}});