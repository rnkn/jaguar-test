/***********************************************************************************************/
// Jaguar - SAVE/LOAD GAMES
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// OPENS LOAD/SAVE MENU
/***********************************************************************************************/
openMenu:function(JAG){
	// DON'T ALLOW ON CUTSCENES, WHEN SWITCHING SCENES OR IN IFRAMES
	if(D.sD.cutscene || D.sD.map || D.gD.switchingScenes || window!=window.top) return;
	
	// IF MENU IS ALREADY OPEN, CLOSE IT
	if($('#JAG_SaveMenu_Overlay').length){ JAG.OBJ.$Game.closeMenu(JAG); return; };

	///////////////////////////////////////////////
	// FOR DEBUGGING PURPOSES [CLEARS LOCALSTORAGE]
	///////////////////////////////////////////////
	//localStorage.clear();
	//console.log(localStorage);	
	
	var title=D.gD.title ? D.gD.title : 'Save or Load a Game',
		gameID=JAG.OBJ.$Game.attr('id');
	JAG.Load.loading=false;
	JAG.Load.deleting=false;		
	JAG.Load.saving=false;
	// RESETS REFERENCE TO CURRENT SAVE SLOT
	JAG.Load.$slot=false;  
			
	
	///////////////////////
	// CREATE MENU ELEMENTS
	///////////////////////
	JAG.OBJ.$Game.prepend('<div id="JAG_SaveMenu_Overlay"></div>\
		<div class="JAG_SaveMenu">\
			<p class="save_text">'+title+'</p>\
			<div class="JAG_SaveMenu_Left">\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
			</div>\
			<div class="JAG_SaveMenu_Right">\
				<div class="JAG_Save">Save Game</div>\
				<div class="JAG_Load">Load Game</div>\
				<div class="JAG_Delete">Delete Game</div>\
				<div class="JAG_Restart">Restart</div>\
				<div class="JAG_Quit">Quit</div>\
				<div class="JAG_Cancel">Cancel</div>\
			</div>\
		</div>');

	// CACHE SAVEMENU ELEMENTS
	var $saveMenu=JAG.OBJ.$SaveMenu=JAG.OBJ.$Game.find('div.JAG_SaveMenu'),
		$overlay=$('#JAG_SaveMenu_Overlay'),
		$left=$saveMenu.find('div.JAG_SaveMenu_Left'),
		$right=$saveMenu.find('div.JAG_SaveMenu_Right'),
		$title=$saveMenu.find('p.save_text');
		
	/////////////////////////
	// POSITION MENU - FADEIN
	/////////////////////////
	$saveMenu.css('left',((D.gD.viewportW-$saveMenu.outerWidth(true))/2)+$(window).scrollLeft()+'px');	
	$overlay.stop(true,false).fadeTo(300, 0.85, function(){ $saveMenu.stop(true,false).fadeTo(300, 1); });

	//////////////////////////////////////////////////////////
	// LOOP LOCALSTORAGE AND FIND SAVED GAMES FOR THIS GAMEID	
	// GAMES ARE SAVED USING THE FORMAT:
	// myAdventure~	   [ FIRST PART OF STRING IS THE GAME ID ]
	// save_name~	   [ SECOND PART IS THE SAVE GAME NAME   ]
	// pan_pos		   [ LAST PART IS THE SETTING NAME       ]
	//////////////////////////////////////////////////////////
	for(var i=0, l=localStorage.length; i<l; i++){
		// ENTRY CONTAINS GAMEID [LOAD ONLY LOCALSTORAGE FOR THIS JAGUAR GAME]
		if(localStorage.key(i).indexOf(gameID) >- 1){
			// SAVEGAME VARIABLES
			var gameStr=localStorage.key(i).replace(gameID+'~',''),
				lastChar=gameStr.lastIndexOf('~'),
				gameName=gameStr.substring(0, lastChar);

			////////////////////////////////////
			// LOOP TO FIND FIRST AVAILABLE SLOT
			////////////////////////////////////
			for(var i2=0; i2<10; i2++){
				var $inp=$left.find('input').eq(i2);
					value=$inp.val();

				// DON'T ALLOW POPULATING MULTIPLE INPUTS WITH THE SAME GAME
				if(gameName===value) break;

				// POPULATE SAVEGAME NAME IN LIST					
				if(value.removeWS()==='empty'){ $inp.val(gameName); break; };
			};
		};			
	};


	///////////////////
	// GAME SLOT EVENTS
	///////////////////
	$left.find('input').on('click',function(){
		// MUST INITIATE A BUTTON ACTION FIRST
		if(!JAG.Load.deleting && !JAG.Load.saving && !JAG.Load.loading){ $(this).blur(); return; };
		var $input=$(this),
			val=$input.val();

		// LOADING
		if(JAG.Load.loading){ 
			if(val.indexOf('empty') > -1){
				$title.html('No save game data found');
			}else{
				// DISABLE BUTTON CLICKING WHILE LOADING
				$right.find('div').add($left.find('div')).off('click');
				JAG.OBJ.$Game.loadGame(JAG, val); 
			};
		
		// DELETING
		}else if(JAG.Load.deleting){
			JAG.Load.loading=false;
			JAG.Load.deleting=false;
			JAG.Load.saving=false;
			
			// TRYING TO DELETE AN EMPTY SAVE SLOT
			if(val.indexOf('empty') > -1){
				$input.blur();
				$title.html('No save game data found');

			// DELETE SLOT INFORMATION
			}else{
				/////////////////////////////////////////////////////////
				// LOOP LOCALSTORAGE AND FIND SAVED GAMES FOR THIS GAMEID		
				/////////////////////////////////////////////////////////		
				var	prefix=gameID+'~'+val+'~',
					myLength=prefix.length;

				Object.keys(localStorage).forEach(function(key){ 
					if(key.substring(0,myLength)==prefix) localStorage.removeItem(key); 
				}); 

				$input.val('empty').blur();
				$title.html('Save game has been deleted');
			};

		// SAVING
		}else if(JAG.Load.saving){
			JAG.Load.loading=false;
			JAG.Load.deleting=false;

			// SAVE SLOT REFERENCE
			JAG.Load.$slot=$input;
			JAG.Load.slot_name=val;
		
			// ALLOW FOR EDITING THIS INPUT ONLY
			$left.find('input').addClass('JAG_disabledInput').attr('readonly',true);
			$input.removeClass('JAG_disabledInput').attr('readonly',false);
		
			// CLEAR INPUT ONLY IF DEFAULT VALUE
			if(val.indexOf('empty') > -1) $input.val('');
			
			// UPDATE TITLE TEXT
			$title.html('Name your save game and click Save Game');
		};
	})
		
		
	////////////////////////////////////
	// NAVIGATING AWAY FROM EMPTY INPUTS
	////////////////////////////////////
	.on('blur',function(){
		var $input=$(this), val=$input.val().removeWS();
		if(val==' ' || !val) $input.val('empty');

		// DEACTIVATE INPUTS AND UPDATE TITLE
		$left.find('input').addClass('JAG_disabledInput');
		$title.html(title);
	})
	

	////////////////////////////////////////
	// SAVE GAME WHEN PRESSING ENTER IN SLOT
	////////////////////////////////////////
	.on('keyup.Jaguar',function(e){
 		var code=e.keyCode||e.which;
		if(code===13) $right.find('div.JAG_Save').trigger('click');
	});


	///////////////////////
	// RIGHT COLUMN BUTTONS
	///////////////////////
	$right.find('div').on('click',function(e){
		$button=e.currentTarget;
		JAG.Load.saving=JAG.Load.loading=JAG.Load.deleting=false;

		switch ($button){
			///////
			// SAVE
			///////
			case $right.find('div.JAG_Save')[0]:
				JAG.Load.saving=true;
				var $slot=JAG.Load.$slot ? JAG.Load.$slot : false;

				// SECOND CLICK SAVES THE GAME 
				if($slot){
					// USER NEEDS TO GIVE SAVEGAME A NAME!
					if($slot.val()==='empty' || $slot.val()===''){
						$title.html('Please use descriptive titles for save games'); 
						return;

					// USER RENAMED EXISTING SAVEGAME [OVERWRITE]
					}else if($slot.val()!==JAG.Load.slot_name){
						// FIRST DELETE ALL EXISTING INFO FOR THIS SAVEGAME
						var	prefix=gameID+'~'+JAG.Load.slot_name+'~',
							myLength=prefix.length;
						Object.keys(localStorage).forEach(function(key){ 
							if(key.substring(0,myLength)==prefix) localStorage.removeItem(key); 
						}); 
					};

					// SAVE THE GAME!
					JAG.OBJ.$Game.saveGame(JAG, $slot.val()); 	
			
				// FIRST CLICK TITLES SAVEGAMES
				}else{
					// ACTIVATE INPUTS AND UPDATE TEXT
					$left.find('input').removeClass('JAG_disabledInput')
					$title.html('Select a save slot');
				};
			break;
			
			
			///////			
			// LOAD
			///////
			case $right.find('div.JAG_Load')[0]:
				JAG.Load.loading=true;		

				// ACTIVATE INPUTS AND UPDATE TEXT
				$left.find('input').removeClass('JAG_disabledInput')
				$title.html('Select a game slot to load');
			break;
			
			
			/////////
			// DELETE
			/////////
			case $right.find('div.JAG_Delete')[0]:
				// ACTIVATE INPUTS AND UPDATE TEXT
				JAG.Load.deleting=true;			
				$left.find('input').removeClass('JAG_disabledInput')
				$title.html('Select a game slot to delete'); 
			break;
			
			
			/////////
			// CANCEL
			/////////
			case $right.find('div.JAG_Cancel')[0]:
				if(JAG.Load.saveORload) return;	
				JAG.OBJ.$Game.closeMenu(JAG); 
			break;
			
			///////
			// QUIT
			///////
			case $right.find('div.JAG_Quit')[0]:
				window.location.href=window.location.href;
			break;
			
			//////////
			// RESTART
			//////////
			case $right.find('div.JAG_Restart')[0]:
				$(this).restartGame(JAG);
			break;			
		};		
	});
},


/***********************************************************************************************/
// CLOSE LOAD/SAVE MENU
/***********************************************************************************************/
closeMenu:function(JAG){
	// RESET
	JAG.Load.deleting=JAG.Load.saving=JAG.Load.loading=JAG.Load.saveORload=false;
	clearTimeout(D.sD.menuTimer);

	// MENU VARIABLES
	var $saveMenu=JAG.OBJ.$Game.find('div.JAG_SaveMenu'),
		$overlay=$('#JAG_SaveMenu_Overlay');
		
	// FADEOUT MENU & OVERLAY, THEN REMOVE
	$saveMenu.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
		$overlay.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
			$saveMenu.add($overlay).remove();
		}});
	}});	
},
	
	
/***********************************************************************************************/
// CHECK LOCALSTORAGE SUPPORT
/***********************************************************************************************/
supportsSave:function(){
  try{ return 'localStorage' in window && window['localStorage'] !== null;
  }catch(e){ return false; }
},


/***********************************************************************************************/
// SAVE GAME
/***********************************************************************************************/
saveGame:function(JAG, gameName){
	// CHECK SUPPORT & IF CURRENTLY SAVING/LOADING
	if(!$(this).supportsSave() || JAG.Load.saveORload) return;
	JAG.Load.saveORload=true;
	
	///////////////////////////////////////////////////////////////////////////////
	// THE GAMEID [MAIN ADVENTURE HTML ELEMENT] ALONG WITH THE NAME OF THE SAVEGAME
	// ARE PREFIXED TO ALL STRINGS THAT ARE SAVED TO LOCALSTORAGE. FOR EXAMPLE:
	// MYADVENTURE~NAMEOFSAVEPOINT~LOCALSTORAGEPROPERTY.VALUE
	///////////////////////////////////////////////////////////////////////////////
	var	gameID=JAG.OBJ.$Game.attr('id'),
		prefix=gameID+'~'+gameName+'~',
		$Char=JAG.OBJ.$Char,
		$Scene=JAG.OBJ.$currentScene,
		lS=localStorage;
	
	///////////////////
	// I. GAME SETTINGS
	///////////////////
	lS.setItem(prefix+'JAG_Exp', D.gD.experience);	
	// [ADDON: MAPS] CURRENT MARKER POSITION
	lS.setItem(prefix+'JAG_currentMarker', JAG.Story.currentMarker);
	// [ADDON: TIMERS] CURRENT RUNNING TIMERS
	lS.setItem(prefix+'JAG_Timers', JSON.stringify(JAG.Story.puzzleTimers));
	lS.setItem(prefix+'JAG_TimerValues', JSON.stringify(JAG.Load.loadpuzzleTimers));
	// PLAYER STATS
	lS.setItem(prefix+'JAG_Stats', JSON.stringify(JAG.Stats));
	
	/////////////////////////
	// II. CHARACTER SETTINGS
	/////////////////////////
	// CHARACTER'S POSITION AND DIRECTION
	if($Char){
		lS.setItem(prefix+'JAG_CharX', $Char.css('left'));
		lS.setItem(prefix+'JAG_CharY', $Char.css('top'));
		lS.setItem(prefix+'JAG_CharDirection', $Char.data('character').direction);
	};

	//////////////////////
	// III. SCENE SETTINGS
	//////////////////////
	// SAVE CURRENT SCENE
	lS.setItem(prefix+'JAG_CurrentScene', $Scene.attr('id'));
	// SAVE CURRENT PAN POSITION
	lS.setItem(prefix+'pan_pos', $Scene.css('margin-left'));
	// SAVE CURRENT DAY/NIGHT POSITION
	lS.setItem(prefix+'day_night_time', JAG.OBJ.$DayNight ? JAG.OBJ.$DayNight.css('opacity') : 0);
	
	// LOOP SCENES & SAVE IF CHARACTER HAS BEEN THERE
	var $Scenes=JAG.OBJ.$Game.find('li.JAG_Scene');
		numScenes=$Scenes.length;	
	for(var i=0; i<numScenes; i++){
		var sceneID=$Scenes[i].id.toLowerCase().removeWS(),
			$Scene=$($Scenes[i]),
			$SceneChar=$Scene.find('div.JAG_Char');
		lS.setItem(prefix+sceneID+'_beenHere', $Scene.data('scene').beenHere ? $Scene.data('scene').beenHere : false);		

		// SAVE ALL SCENE ENTRANCE SECONDARY ACTIONS [ MARKS HOW MANY TIMES SECONDARY ACTIONS HAVE FIRED ]
		if($SceneChar.length) lS.setItem(prefix+sceneID+'_entrance_fired', $SceneChar.data('character').entrance_fired);
		
		///////////////////////////////////
		// LOOP THROUGH ITEMS IN THIS SCENE
		///////////////////////////////////
		var $SceneItems=$Scene.find('div.JAG_Item'),
			l2=$SceneItems.length;
		for(var i2=0; i2<l2; i2++){
			var $Item=$($SceneItems[i2]),
				itemID=$Item[0].id.toLowerCase().removeWS();
				// SAVE ITEM INFORMATION
				$Item.saveItem(prefix+itemID, $Item.data('item'));
		};
		
		////////////////////////////////////////
		// LOOP THROUGH CHARACTERS IN THIS SCENE
		////////////////////////////////////////
		var $AuxChars=$Scene.find('div.JAG_Aux_Char'),
			l3=$AuxChars.length;
		for(var i3=0; i3<l3; i3++){
			var $AuxChar=$($AuxChars[i3]),
				charID=$AuxChar[0].id.toLowerCase().removeWS(),
				AcD=$AuxChar.data('character');
				
			// SAVE CURRENT CHARACTER VISIBILITY [ FROM THE HIDE SECONDARY ACTION ]
			lS.setItem(prefix+charID+'_char_visibility', $AuxChar.css('visibility'));
			
			// [ADDON: RIDDLE] SAVE IF THE CHARACTER HAS SOLVED RIDDLE
			lS.setItem(prefix+charID+'_solvedRiddle', AcD.solvedRiddle);
		};		
	};
	
	/////////////////////////
	// IV. INVENTORY SETTINGS
	/////////////////////////
	// ARRAY OF ALL INVENTORY ITEMS
	lS.setItem(prefix+'JAG_Inventory', JAG.Story.Inventory);
	// ARRAY OF ALL DEAD [USED] ITEMS
	lS.setItem(prefix+'JAG_DeadItems', JAG.Story.DeadItems);
	
	// LOOP THROUGH INVENTORY ITEMS AND SAVE ITEM DATA
	var $ItemsinInv=JAG.OBJ.$Inv.find('img.JAG_Item'),
		l4=$ItemsinInv.length;
	for(var i4=0; i4<l4; i4++){
		var $Item=$($ItemsinInv[i4]),
			itemID=$Item[0].id.toLowerCase().removeWS();

			// SAVE ITEM INFORMATION
			$Item.saveItem(prefix+itemID, $Item.data('item'));
	};	
	
	
	/////////////////////////
	// SAVE GAME & CLOSE MENU
	/////////////////////////
	$('div.JAG_SaveMenu').find('p').text('Saving Game...');
	D.sD.menuTimer=setTimeout(function(){
		JAG.OBJ.$Game.closeMenu(JAG);
		clearTimeout(D.sD.menuTimer);
	}, 800);
},




/***********************************************************************************************/
// SAVE ITEMS HELPER FUNCTION [ BOTH FROM SCENES AND INVENTORY ] - $Item.saveItem(prefix, itemID, iD);
/***********************************************************************************************/
saveItem:function(prefix, iD){
	var $Item=$(this),
		lS=localStorage;

	//////////////////////////////////////////////////////////////////////
	// SAVE ITEM SECONDARY ACTIONS INFORMATION #OF TIMES SECONDARY ACTIONS 
	// HAVE FIRED AND COMPLETE SECONDARY ACTIONS ARRAY
	//////////////////////////////////////////////////////////////////////
	// GIVE
	if(iD.give){
		lS.setItem(prefix+'give_actions', JSON.stringify(iD.give));
		lS.setItem(prefix+'_give_fired', iD.give_fired); };
	if(iD.inv_give){
		lS.setItem(prefix+'inv_give_actions', JSON.stringify(iD.inv_give));
		lS.setItem(prefix+'_inv_give_fired', iD.inv_give_fired); };
	// OPEN
	if(iD.open){			
		lS.setItem(prefix+'open_actions', JSON.stringify(iD.open));			
		lS.setItem(prefix+'_open_fired', iD.open_fired); };
	if(iD.inv_open){
		lS.setItem(prefix+'inv_open_actions', JSON.stringify(iD.inv_open));
		lS.setItem(prefix+'_inv_open_fired', iD.inv_open_fired);};
	// CLOSE
	if(iD.close){
		lS.setItem(prefix+'close_actions', JSON.stringify(iD.close));
		lS.setItem(prefix+'_close_fired', iD.close_fired); };
	if(iD.inv_close){
		lS.setItem(prefix+'_inv_close_actions', JSON.stringify(iD.inv_close));
		lS.setItem(prefix+'_inv_close_fired', iD.inv_close_fired); };
	// LOOK AT
	if(iD.look_at){
		localStorage.setItem(prefix+'_look_at_actions', JSON.stringify(iD.look_at));				
		localStorage.setItem(prefix+'_look_at_fired', iD.look_at_fired); };
	if(iD.inv_look_at){
		lS.setItem(prefix+'_inv_look_at_actions', JSON.stringify(iD.inv_look_at));	
		lS.setItem(prefix+'_inv_look_at_fired', iD.inv_look_at_fired); };
	// TALK TO
	if(iD.talk_to){
		lS.setItem(prefix+'_talk_to_actions', JSON.stringify(iD.talk_to));
		lS.setItem(prefix+'_talk_to_fired', iD.talk_to_fired); };
	if(iD.inv_talk_to){
		lS.setItem(prefix+'_inv_talk_to_action', JSON.stringify(iD.inv_talk_to)); 
		lS.setItem(prefix+'_inv_talk_to_fired', iD.inv_talk_to_fired); };
	// USE
	if(iD.use){
		lS.setItem(prefix+'_use_actions', JSON.stringify(iD.use));				
		lS.setItem(prefix+'_use_fired', iD.use_fired); };
	if(iD.inv_use){
		lS.setItem(prefix+'_inv_use_actions', JSON.stringify(iD.inv_use));				
		lS.setItem(prefix+'_inv_use_fired', iD.inv_use_fired); };
	// PUSH
	if(iD.push){
		lS.setItem(prefix+'_push_actions', JSON.stringify(iD.push));							
		lS.setItem(prefix+'_push_fired', iD.push_fired); };
	if(iD.inv_push){
		lS.setItem(prefix+'_inv_push_actions', JSON.stringify(iD.inv_push));							
		lS.setItem(prefix+'_inv_push_fired', iD.inv_push_fired); };
	// PULL
	if(iD.pull){
		lS.setItem(prefix+'_pull_actions', JSON.stringify(iD.pull));			
		lS.setItem(prefix+'_pull_fired', iD.pull_fired); };
	if(iD.inv_pull){
		lS.setItem(prefix+'_inv_pull_actions', JSON.stringify(iD.inv_pull));
		lS.setItem(prefix+'_inv_pull_fired', iD.inv_pull_fired); };

	// SAVE CURRENT ITEM VISIBILITY [ FROM HIDE SECONDARY ACTION ]
	lS.setItem(prefix+'_item_visibility', $Item.css('visibility'));
			
	// SAVE CURRENT SPRITE FOR THIS ITEM [ FROM CHANGE_SPRITE SECONDARY ACTION ]
	if($Item.find('img').length){
		var imgPath=$Item.find('img')[0].src;
		lS.setItem(prefix+'_item_sprite', imgPath.substring(imgPath.lastIndexOf('/items/'), imgPath.length).replace('/items/','').replace('.png',''));
	};
			
	// [ADDON: RIDDLE] SAVE IF THE CHARACTER HAS SOLVED RIDDLE
	lS.setItem(prefix+'_solvedRiddle', iD.solvedRiddle);
},



/***********************************************************************************************/
// LOAD GAME - LOGGING - for(var key in localStorage){ console.log(key + ':' + localStorage[key]); };
/***********************************************************************************************/
loadGame:function(JAG, gameName){
	// CHECK LOCALSTORAGE SUPPORT & IF CURRENTLY SAVING/LOADING
	if(!$(this).supportsSave() || JAG.Load.saveORload) return; 
	JAG.Load.saveORload=true;
	var href=window.location.href;

	//////////////////////////////////////////////////////////////
	// RESTART THE PAGE TO FLUSH ALL ITEMS/INVENTORY, CLASSES, ETC
	//////////////////////////////////////////////////////////////
	if(href.indexOf('?save_game') <= 0){
		$('div.JAG_SaveMenu').find('p.save_text').text('Loading Game...');
		D.sD.menuTimer=setTimeout(function(){
			window.location.href+='?save_game='+gameName.replace(/ /g,'+');
		}, 1000);
		

	//////////////////////////
	// LOAD GAME AFTER FLUSHED
	//////////////////////////
	}else{
		// THE GAMEID [MAIN ADVENTURE HTML ELEMENT] ALONG WITH THE NAME OF THE SAVEGAME
		// ARE PREFIXED TO ALL STRINGS THAT ARE SAVED TO LOCALSTORAGE. FOR EXAMPLE:
		// MYADVENTURE~NAMEOFSAVEPOINT~LOCALSTORAGEPROPERTY.VALUE
		var	gameID=JAG.OBJ.$Game.attr('id'),
			lS=localStorage,
			prefix=gameID+'~'+gameName.replace(/\+/g,' ')+'~',
			$currentScene=$('#'+lS.getItem(prefix+'JAG_CurrentScene')),
			$Scenes=JAG.OBJ.$Game.find('li.JAG_Scene');
			numScenes=$Scenes.length,
			$teaser=$('#JAG_Teaser'),
			$Char=$currentScene.find('div.JAG_Char'),
			cD=$Char.data('character');			

		///////////////////////////////////////////////////////////////////////
		// I. UPDATE SETTINGS THAT NEED TO TAKE AFFECT BEFORE LOADING THE SCENE
		///////////////////////////////////////////////////////////////////////
		// CHARACTER'S POSITION AND DIRECTION ON SCREEN 
		JAG.Load.CharX=lS.getItem(prefix+'JAG_CharX').pF();
		JAG.Load.CharY=lS.getItem(prefix+'JAG_CharY').pF();
		JAG.Load.CharDirection=lS.getItem(prefix+'JAG_CharDirection');
		// GET SCENE PAN POSITION AND DAY/NIGHT OPACITY
		JAG.Load.pan_pos=lS.getItem(prefix+'pan_pos');
		JAG.Load.DayNightOpacity=lS.getItem(prefix+'day_night_time');
		// [ADDON: MAPS] CURRENT MARKER POSITION
		JAG.Story.currentMarker=lS.getItem(prefix+'JAG_currentMarker');
		// PLAYER STATS
		JAG.Stats=JSON.parse(lS.getItem(prefix+'JAG_Stats'));


		////////////////////////////////////////////
		// II. LOOP SCENES, ITEMS AND AUX CHARACTERS
		////////////////////////////////////////////
		for(var i=0; i<numScenes; i++){
			var sceneID=$Scenes[i].id.toLowerCase().removeWS(),
				visited=lS.getItem(prefix+sceneID+'_beenHere').isB(),
				$thisScene=$($Scenes[i]);
			
			// CHARACTER HAS BEEN TO SCENE
			$thisScene.data('scene').beenHere=visited;
			
			// UPDATE ALL SCENE ENTRANCE SECONDARY ACTIONS [ MARKS NUMBER OF TIMES THEY'VE FIRED ]
			var $thisSceneChar=$thisScene.find('div.JAG_Char');
			if($thisSceneChar.length) $thisSceneChar.data('character').entrance_fired=lS.getItem(prefix+sceneID+'_entrance_fired');
			
			//////////////////////////////////////////////////////////////
			// LOOP THROUGH ITEMS
			// ON PAGE RELOAD - THE ITEM DATA GETS MERGED WITH MAIN OBJECT
			//////////////////////////////////////////////////////////////
			var l2=$thisScene.find('div.JAG_Item').length;
			for(var i2=0; i2<l2; i2++){
				var $Item=$($thisScene.find('div.JAG_Item')[i2]),
					itemID=$Item[0].id.toLowerCase().removeWS();
				$Item.loadItem(prefix+itemID, $Item.data('item'));
			};
			
			////////////////////////////////////////
			// LOOP THROUGH CHARACTERS IN THIS SCENE
			////////////////////////////////////////
			var l3=$thisScene.find('div.JAG_Aux_Char').length;
			for(var i3=0; i3<l3; i3++){
				var $AuxChar=$($thisScene.find('div.JAG_Aux_Char')[i3]),
					charID=$AuxChar[0].id.toLowerCase().removeWS();
				
				// [ADDON: RIDDLE] LOAD IF THE CHARACTER HAS SOLVED RIDDLE
				$AuxChar.data('character').solvedRiddle=lS.getItem(prefix+charID+'_solvedRiddle');				
			};	
		};


		/////////////////////////////////////////////
		// III. LOAG GAME > TRANSITION TO SAVED SCENE
		/////////////////////////////////////////////
		// REMOVE TEASER SCREEN
		if($teaser.length){
			$teaser.animate({'opacity':0},{duration:400,queue:false,complete:function(){ 
				JAG.startTime(JAG);
				$teaser.remove(); 
				// UPDATE REFERENCES [ .RESETSCENE HAPPENS AT END OF PRELOADGAME(); ]
				JAG.OBJ.$currentScene=$currentScene;
				JAG.OBJ.$currentChapter=JAG.OBJ.$currentScene.parents('ul:first');
				// UPDATE INVENTORY ARRAY
				JAG.Story.Inventory=lS.getItem(prefix+'JAG_Inventory').split(',');				
				
				//////////////////////////////////////////////////////////////////////////
				// LOOP THROUGH SCENE'S SEC ACTIONS TO CHECK IF INV_ADD EXISTS
				// CREATE AN ARRAY HOLDING ITEMS AUTO-ADDED TO THIS SCENE FROM SEC ACTIONS
				// STARTINGINV=ITEMS THAT ARE ADDED TO SCENE THROUGH SECONDARY ACTIONS
				// THESE ARE ALSO REMOVED FROM SECONDARY ACTIONS TO PREVENT DUPLICATE INV
				//////////////////////////////////////////////////////////////////////////
				if(cD.entrance){
					var Actions=cD.entrance, 
						numActions=Actions.length, 
						startingInv=[],
						deleteActions=[];
					
					// LOOP THROUGH SECONDARY ACTIONS
					for(var i=0; i<numActions; i++){ 
						if(Actions[i][0].indexOf('inv_add') > -1){
							// PUSH INV_ADD ITEMS TO STARTING INVENTORY ARRAY							
							startingInv.push(Actions[i][0].split(':')[1].removeWS()); 
							// REMOVE THESE ITEMS FROM SEC ACTIONS TO PREVENT DUPLICATES
							deleteActions.push(Actions.indexOf(Actions[i]));
						};
					};
					
					// DELETE INV_ADD FROM ENTRANCE SECONDARY ACTION
					// ALSO NEED TO DELETE THE ITEM FROM JAG.STORY.INVENTORY
					for(var i=deleteActions.length-1; i>=0; i--) cD.entrance.splice(deleteActions[i], 1);
				};
				
				
				///////////////
				// PRELOAD GAME
				///////////////
				JAG.Load.play_entrance=false;
				JAG.Load.loadInvItems=true;
				JAG.preloadGame(JAG);
				
		/////////////////////////////////////////
		// [ADDON: TIMERS] CURRENT RUNNING TIMERS
		/////////////////////////////////////////
		if($.isFunction($.fn.startPuzzleTimer)){
			var orgTimerSettings=JSON.parse(lS.getItem(prefix+'JAG_TimerValues')),
				remainingTime=JSON.parse(lS.getItem(prefix+'JAG_Timers'));
			/////////////////////////////
			// LOOP THROUGH TIMERS OBJECT
			/////////////////////////////
			for(var key in orgTimerSettings){
 				if(orgTimerSettings.hasOwnProperty(key)){
					// GET THE TIMER NAME
					var timerName=orgTimerSettings[key].split('||')[0].toLowerCase().removeWS(),
						// REFERENCE remaingTime FOR TIME REMAINING
						// PASS IT IN AS 00/00/00/00 FORMAT
						timeLeft=remainingTime[timerName].split(':').reverse(),
						days=timeLeft[3] || '00', hours=timeLeft[2] || '00',
						minutes=timeLeft[1] || '00', seconds=timeLeft[0] || '00';
					$(this).startPuzzleTimer(JAG, orgTimerSettings[key], days+'/'+hours+'/'+minutes+'/'+seconds);
				};
			};
		};					
				
			}});
		};
	};
},


/***********************************************************************************************/
// LOAD ITEMS HELPER FUNCTION [ BOTH FROM SCENES AND INVENTORY ] - $Item.loadItem(prefix, iD);
/***********************************************************************************************/
loadItem:function(prefix, iD){
	var $Item=$(this),
		lS=localStorage;
		
	//////////////////////////////////////////////////
	// LOAD AND SET ITEM SECONDARY ACTIONS INFORMATION
	// #OF TIMES SECONDARY ACTIONS FIRED
	// AND COMPLETE SECONDARY ACTIONS ARRAY
	//////////////////////////////////////////////////
	// GIVE
	if(iD.give){
		$Item.data('item').give=JSON.parse(lS.getItem(prefix+'give_actions'));
		$Item.data('item').give_fired=lS.getItem(prefix+'_give_fired'); };
	if(iD.inv_give){
		$Item.data('item').inv_give=JSON.parse(lS.getItem(prefix+'inv_give_actions'));
		$Item.data('item').inv_give_fired=lS.getItem(prefix+'_inv_give_fired'); };
	// OPEN
	if(iD.open){	
		$Item.data('item').open=JSON.parse(lS.getItem(prefix+'open_actions'));
		$Item.data('item').open_fired=lS.getItem(prefix+'_open_fired'); };
	if(iD.inv_open){
		$Item.data('item').inv_open=JSON.parse(lS.getItem(prefix+'inv_open_actions'));
		$Item.data('item').inv_open_fired=lS.getItem(prefix+'_inv_open_fired'); };
	// CLOSE
	if(iD.close){
		$Item.data('item').close=JSON.parse(lS.getItem(prefix+'close_actions'));
		$Item.data('item').close_fired=lS.getItem(prefix+'_close_fired'); };
	if(iD.inv_close){
		$Item.data('item').inv_close=JSON.parse(lS.getItem(prefix+'_inv_close_actions'));
		$Item.data('item').inv_close_fired=lS.getItem(prefix+'_inv_close_fired'); };
	// LOOK AT
	if(iD.look_at){
		$Item.data('item').look_at=JSON.parse(lS.getItem(prefix+'_look_at_actions'));
		$Item.data('item').look_at_fired=lS.getItem(prefix+'_look_at_fired'); };
	if(iD.inv_look_at){
		$Item.data('item').inv_look_at=JSON.parse(lS.getItem(prefix+'_inv_look_at_actions'));	
		$Item.data('item').inv_look_at_fired=lS.getItem(prefix+'_inv_look_at_fired'); };
	// TALK TO
	if(iD.talk_to){
		$Item.data('item').talk_to=JSON.parse(lS.getItem(prefix+'_talk_to_actions'));
		$Item.data('item').talk_to_fired=lS.getItem(prefix+'_talk_to_fired'); };
	if(iD.inv_talk_to){
		$Item.data('item').inv_talk_to=JSON.parse(lS.getItem(prefix+'_inv_talk_to_actions'));
		$Item.data('item').inv_talk_to_fired=lS.getItem(prefix+'_inv_talk_to_fired'); };
	// USE
	if(iD.use){
		$Item.data('item').use=JSON.parse(lS.getItem(prefix+'_use_actions'));
		$Item.data('item').use_fired=lS.getItem(prefix+'_use_fired'); };
	if(iD.inv_use){
		$Item.data('item').inv_use=JSON.parse(lS.getItem(prefix+'_inv_use_actions'));
		$Item.data('item').inv_use_fired=lS.getItem(prefix+'_inv_use_fired'); };
	// PUSH
	if(iD.push){
		$Item.data('item').push=JSON.parse(lS.getItem(prefix+'_push_actions'));
		$Item.data('item').push_fired=lS.getItem(prefix+'_push_fired'); };
	if(iD.inv_push){
		$Item.data('item').inv_push=JSON.parse(lS.getItem(prefix+'_inv_push_actions'));
		$Item.data('item').inv_push_fired=lS.getItem(prefix+'_inv_push_fired'); };
	// PULL
	if(iD.pull){
		$Item.data('item').pull=JSON.parse(lS.getItem(prefix+'_pull_actions'));			
		$Item.data('item').pull_fired=lS.getItem(prefix+'_pull_fired'); };
	if(iD.inv_pull){
		$Item.data('item').inv_pull=JSON.parse(lS.getItem(prefix+'_inv_pull_actions'));
		$Item.data('item').inv_pull_fired=lS.getItem(prefix+'_inv_pull_fired'); };

	// [ADDON: RIDDLE] SAVE IF THE CHARACTER HAS SOLVED RIDDLE
	$Item.data('item').solvedRiddle=lS.getItem(prefix+'_solvedRiddle');	
},




/***********************************************************************************************/
// RESTART GAME TO TITLESCREEN
/***********************************************************************************************/
restartGame:function(JAG){
	var href=window.location.href;

	//////////////////////////////////////////////////////////////
	// RESTART THE PAGE TO FLUSH ALL ITEMS/INVENTORY, CLASSES, ETC
	//////////////////////////////////////////////////////////////
	if(href.indexOf('?restart')<=0){
		$('div.JAG_SaveMenu').find('p.save_text').text('Restarting...');
		D.sD.menuTimer=setTimeout(function(){
			window.location.href=window.location.href+'?restart';
		}, 700);

	/////////////////////////////
	// RESTART GAME AFTER FLUSHED
	/////////////////////////////
	}else{
		// REMOVE RESTART FROM URL
		var trim=href.substr(href.indexOf('?restart')),
			$teaser=$('#JAG_Teaser');
		window.history.pushState('', '', href.replace(trim,''));		
		
		// REMOVE TEASER SCREEN
		if($teaser.length){
			$teaser.animate({'opacity':0},{duration:400,queue:false,complete:function(){ 
				JAG.startTime(JAG);
				$teaser.remove(); 		
		
				// JUMP TO APPROPRIATE SCENE
				JAG.OBJ.$currentScene=$('#titlescreen');		
				JAG.preloadGame(JAG);
			}})
		};
	};	
}});