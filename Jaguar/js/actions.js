/***********************************************************************************************/
// Jaguar - PRIMARY ACTIONS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// ITEM ACTIONS [ CHARACTERS AND ITEMS ] - $obj.Action(JAG, itemType, callback, inInv);
// D.cD.action is checked and set to false inside the stopWalking callback
/***********************************************************************************************/
Action:function(JAG, itemType, callback, inInv){
	// EXIT IF ACTION IS OCCURING
	if(D.cD.action || D.gD.switchingScenes || D.sD.talking){
		// SWAP NOT_ALLOW CURSOR INDICATES ACTION CANNOT BE PERFORMED
		if(D.gD.ani_cursor) JAG.swapCursor(JAG);
		return;
	};

	///////////////////
	// ACTION VARIABLES
	///////////////////
	var $Char=JAG.OBJ.$Char,
		$Item=$(this),
		iD_Tmp=$Item.data(itemType);
	$Item.data(itemType, $.extend({}, JAG.Speech, JAG.Actions, !iD_Tmp?{}:iD_Tmp||{} ));
	var iD=$Item.data(itemType);

	// SET ACTION STATE IF USING CALLBACK
	if(callback) D.cD.action=true;


	//////////////////////
	// CALL CORRECT ACTION
	//////////////////////
	switch(JAG.Story.ActionWord){

		// GIVE
		case 0:
			// TEST FOR JOINER WORD [3-CLICK VERB]
			if(JAG.Story.joinWord){
				// PERFORM ACTION AFTER WALKING
				if(callback){ D.cD.callback=function(){ $Char.give(JAG, $Item); };
				// PERFORM ACTION IMMEDIATELY
				}else{ $Char.give(JAG, $Item); };
			}else{
				// UPDATE DESCRIPTION BAR
				$Item.updateBar(JAG, 'click', 'item', ' '+iD.text);
				JAG.Story.joinWord=true;
			};
		break;

		// OPEN
		case 1:
			// PERFORM ACTION AFTER WALKING
			if(callback){ D.cD.callback=function(){ $Char.open(JAG, $Item, iD, inInv); };
			// PERFORM ACTION IMMEDIATELY
			}else{ $Char.open(JAG, $Item, iD, inInv); };
		break;

		// CLOSE
		case 2:
			// PERFORM ACTION AFTER WALKING
			if(callback){ D.cD.callback=function(){ $Char.close(JAG, $Item, iD, inInv); };
			// PERFORM ACTION IMMEDIATELY
			}else{ $Char.close(JAG, $Item, iD, inInv); };
		break;

		// PICK UP
		case 3:
			// PERFORM ACTION AFTER WALKING
			if(callback){ D.cD.callback=function(){ $Char.pick_up(JAG, $Item, iD, inInv); };
			// PERFORM ACTION IMMEDIATELY
			}else{ $Char.pick_up(JAG, $Item, iD, inInv); };
		break;

		// LOOK AT
		case 4:
			// PERFORM ACTION AFTER WALKING
			if(callback){ D.cD.callback=function(){ $Char.look_at(JAG, $Item, iD, inInv); };
			// PERFORM ACTION IMMEDIATELY
			}else{ $Char.look_at(JAG, $Item, iD, inInv); };
		break;

		// TALK TO
		case 5:
			// PERFORM ACTION AFTER WALKING
			if(callback){ D.cD.callback=function(){ $Char.talk_to(JAG, $Item, iD, inInv); };
			// PERFORM ACTION IMMEDIATELY
			}else{ $Char.talk_to(JAG, $Item, iD, inInv); };
		break;

		// USE
		case 6:
			// ITEM VARIABLES
			var $AuxItem=JAG.OBJ.$currentItem,
				itemName=iD.text.toLowerCase().removeWS();

			// USE A SCENE ITEM DIRECTLY
			if(!inInv && !JAG.OBJ.$selectedItem){
				// PERFORM ACTION AFTER WALKING
				D.cD.callback=function(){ $Char.useScene(JAG, $Item, iD); };

			// USE INVENTORY ITEM WITH...
			}else{
				// TEST FOR JOINER WORD [3-CLICK VERB]
				if(JAG.Story.joinWord){
					$Char.useInv(JAG, $Item, iD, inInv);
				// UPDATE DESCRIPTION BAR
				}else{
					$Item.updateBar(JAG, 'click', 'item', ' '+iD.text);
					JAG.Story.joinWord=true;
				};
			};
		break;

		// PUSH
		case 7:
			// PERFORM ACTION AFTER WALKING
			if(callback){ D.cD.callback=function(){ $Char.pushAction(JAG, $Item, iD, inInv); };
			// PERFORM ACTION IMMEDIATELY
			}else{ $Char.pushAction(JAG, $Item, iD, inInv); };
		break;

		// PULL
		case 8:
			// PERFORM ACTION AFTER WALKING
			if(callback){ D.cD.callback=function(){ $Char.pull(JAG, $Item, iD, inInv); };
			// PERFORM ACTION IMMEDIATELY
			}else{ $Char.pull(JAG, $Item, iD, inInv); };
		break;
	};

	return $(this);
},



/***********************************************************************************************/
// GIVE - $Char.give(JAG, $Item, iD, inInv);
/***********************************************************************************************/
give:function(JAG, $Item){
	/////////////////
	// GIVE VARIABLES
	/////////////////
	var $target=JAG.OBJ.$currentItem ? JAG.OBJ.$currentItem : $Item,
		$CharImg=JAG.OBJ.$Char.find('img'),
		invItemName=JAG.OBJ.$selectedItem[0].id.toLowerCase().removeWS().replace('jag_id_',''),
		iD=JAG.OBJ.$selectedItem.data('item'),
		// CAN'T GIVE ITEMS TO OTHER ITEMS
		inInv=$target.hasClass('JAG_Item') ? false : JAG.Story.Inventory.indexOf(invItemName) >= 0;

	/////////////////////////
	// GIVE ITEM IN INVENTORY
	/////////////////////////
	if(inInv){
		//////////////////////////////////////////////////////
		// LOOP GIVE COMMANDS AND FIND WHO TO GIVE THE ITEM TO
		//////////////////////////////////////////////////////
		var l=iD.give.length, canGive=false;

		for(var i=0; i<l; i++){
			// TO: ACTION
			if(iD.give[i][0].split(':')[0].toLowerCase().removeWS()==='to'){
				// CURRENT CHARACTER IS SAME AS "GIVE ITEM TO" CHARACTER
				var toChar=iD.give[i][0].split(':')[1].toLowerCase().removeWS();
				if($('#JAG_ID_'+toChar)[0]===$target[0]) var canGive=true;
			};
		};

		//////////////////////////
		// CAN GIVE INVENTORY ITEM
		//////////////////////////
		if(canGive && iD.give!=false && iD.give!=='_'){
			// SWAP SPRITES AND CHECK ACHIEVEMENTS
			$Item.actionTimer(JAG, D, iD.give, 'give');

			// REMOVE FROM INVENTORY
			JAG.OBJ.$selectedItem.remFromInv(JAG, iD.text);

			// MERGE INVENTORY_GIVE TEXT WITH AUX CHARACTER SPEECH ARRAY
			if($target.hasClass('JAG_Aux_Char')){
				var charData=$target.data('character');
				charData.talk_to_text=$.merge( $.merge([], iD.give_text), charData.talk_to_text);

				// BEGIN DIALOGUE AND AUTOMATICALLY SAY FIRST LINE
				if(charData.play_conversation) D.cD.conversation=true;

				// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
				$target.checkSay(JAG, charData.talk_to, D, charData.talk_to_text, 0);
			};

		////////////////////////////
		// CAN'T GIVE INVENTORY ITEM
		////////////////////////////
		}else{
			// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
			$Item.checkSay(JAG, iD.give, D, iD.inv_give_text, false);
		};
	};

	// ACTION COMPLETE
	$Item.actionComplete(JAG, D);
},



/***********************************************************************************************/
// OPEN - $Char.open(JAG, $Item, iD, inInv);
/***********************************************************************************************/
open:function(JAG, $Item, iD, inInv){

	//////////////////////
	// OPEN INVENTORY ITEM
	//////////////////////
	if(inInv){
		//////////////////////////
		// CAN OPEN INVENTORY ITEM
		//////////////////////////
		if(iD.inv_open!=false && iD.inv_open!=='_') $Item.actionTimer(JAG, D, iD.inv_open, 'inv_open');

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.inv_open, D, iD.inv_open_text, false);

	//////////////////
	// OPEN SCENE ITEM
	//////////////////
	}else{
		//////////////////////
		// CAN OPEN SCENE ITEM
		//////////////////////
		if(iD.open!=false && iD.open!=='_') $Item.actionTimer(JAG, D, iD.open, 'open');

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.open, D, iD.open_text, false);
	};

	// ACTION COMPLETE
	$Item.actionComplete(JAG, D);
},


/***********************************************************************************************/
// CLOSE - $Char.close(JAG, $Item, iD, inInv);
/***********************************************************************************************/
close:function(JAG, $Item, iD, inInv){
	///////////////////////
	// CLOSE INVENTORY ITEM
	///////////////////////
	if(inInv){
		///////////////////////////
		// CAN CLOSE INVENTORY ITEM
		///////////////////////////
		if(iD.inv_close!=false && iD.inv_close!=='_') $Item.actionTimer(JAG, D, iD.inv_close, 'inv_close');

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.inv_close, D, iD.inv_close_text, false);

	///////////////////
	// CLOSE SCENE ITEM
	///////////////////
	}else{
		///////////////////////
		// CAN CLOSE SCENE ITEM
		///////////////////////
		if(iD.close!=false && iD.close!=='_') $Item.actionTimer(JAG, D, iD.close, 'close');

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.close, D, iD.close_text, false);
	};

	// ACTION COMPLETE
	$Item.actionComplete(JAG, D);
},



/***********************************************************************************************/
// PICK UP - $Char.pick_up(JAG, $Item, iD, inInv);
/***********************************************************************************************/
pick_up:function(JAG, $Item, iD, inInv){
	//////////////////////////
	// CAN'T PICK UP INVENTORY
	//////////////////////////
	if(inInv){
		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.inv_pick_up, D, iD.inv_pick_up_text, false);

	////////////////////////////
	// ONLY PICKUP SCENE OBJECTS
	////////////////////////////
	}else{
		/////////////
		// CAN PICKUP
		/////////////
		if(iD.pick_up!=false && iD.pick_up!=='_'){
			// SWAP SPRITES AND CHECK ACHIEVEMENTS
			$Item.actionTimer(JAG, D, iD.pick_up, 'pick_up');

		////////////////////
		// CAN'T PICKUP ITEM
		////////////////////
		}else{
			// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
			$Item.checkSay(JAG, iD.pick_up, D, iD.pick_up_text, false);
		};
	};

	// ACTION COMPLETE
	$Item.actionComplete(JAG, D);
},



/***********************************************************************************************/
// LOOK AT - $Char.look_at(JAG, $Item, iD, inInv);
/***********************************************************************************************/
look_at:function(JAG, $Item, iD, inInv){
	///////////////////////////
	// LOOKAT INVENTORY OBJECTS
	///////////////////////////
	if(inInv){
		///////////////////////
		// CAN LOOKAT INVENTORY
		///////////////////////
		if(iD.inv_look_at!=false && iD.inv_look_at!=='_') $Item.actionTimer(JAG, D, iD.inv_look_at, 'inv_look_at');

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.inv_look_at, D, iD.inv_look_at_text, false);

	///////////////////////
	// LOOKAT SCENE OBJECTS
	///////////////////////
	}else{
		//////////////////////////
		// CAN LOOKAT SCENE OBJECT
		//////////////////////////
		if(iD.look_at!=false && iD.look_at!=='_') $Item.actionTimer(JAG, D, iD.look_at, 'look');

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.look_at, D, iD.look_at_text, false);
	};

	// ACTION COMPLETE
	$Item.actionComplete(JAG, D);
},



/***********************************************************************************************/
// TALK TO - $Char.talk_to(JAG, $Item, iD, inInv);
/***********************************************************************************************/
talk_to:function(JAG, $Item, iD, inInv){
	/////////////////////////
	// TALK TO INVENTORY ITEM
	/////////////////////////
	if(inInv){
		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.inv_talk_to, D, iD.inv_talk_to_text, false);

	/////////////////////
	// TALK TO SCENE ITEM
	/////////////////////
	}else{
		/////////////////////////
		// CAN TALK TO SCENE ITEM
		/////////////////////////
		if(iD.talk_to!=false && iD.talk_to!=='_') $Item.actionTimer(JAG, D, iD.talk_to, 'talk');

		var startQuestion=iD.play_conversation.isB() ? 0 : false;
		if(iD.play_conversation) D.cD.conversation=true;

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.talk_to, D, iD.talk_to_text, startQuestion);
	};

	// ACTION COMPLETE
	$Item.actionComplete(JAG, D);
},


/***********************************************************************************************/
// USE SCENE ITEM - $Char.useScene(JAG, $Item, iD, inInv);
/***********************************************************************************************/
useScene:function(JAG, $Item, iD){
	////////////////////////
	// CAN USE ITEM IN SCENE
	////////////////////////
	if(iD.use!=false && iD.use!=='_'){
		// SWAP SPRITES AND CHECK ACHIEVEMENTS
		$Item.actionTimer(JAG, D, iD.use, 'use');

	//////////////////////////
	// CAN'T USE ITEM IN SCENE
	//////////////////////////
	}else{
		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.use, D, iD.use_text, false);
	};

	// ACTION COMPLETE
	$Item.actionComplete(JAG, D);
},


/***********************************************************************************************/
// USE ITEM WITH - $Char.useInv(JAG, $Item, iD, inInv); - JAG.OBJ.$selectedItem=Item1, $Item=Item 2
/***********************************************************************************************/
useInv:function(JAG, $Item, iD, inInv){
	//////////////////////////////////////
	// DON'T ALLOW USE WITH AUX CHARACTERS
	//////////////////////////////////////
	if(!$Item.hasClass('JAG_Aux_Char')){
		var $invItem=JAG.OBJ.$selectedItem,
			iD=$invItem.data('item');

		/////////////////////////////////////////////////
		// LOOP USE COMMANDS & FIND WHAT TO USE ITEM WITH
		/////////////////////////////////////////////////
		var l=iD.inv_use.length, canUse=false;
		for(var i=0; i<l; i++){
			if(iD.inv_use[i][0].split(':')[0].removeWS().toLowerCase()==='with'){
				// IF TARGET OBJECT IS THE SAME AS "USE WITH" OBJECT
				if($('#JAG_ID_'+iD.inv_use[i][0].split(':')[1].removeWS().toLowerCase())[0]===$Item[0]){
					var canUse=true;
				};
			};
		};

		//////////////////////////////
		// USE INVENTORY ITEM ON SCENE
		//////////////////////////////
		if(!inInv){
			if(iD.inv_use!=false && iD.inv_use!=='_' && canUse){
				// CHECK ACHIEVEMENTS => PERFORM SECONDARY USE ACTIONS
				D.cD.action=true;
				D.cD.callback=function(){ $invItem.actionTimer(JAG, D, iD.inv_use, 'use'); };

			///////////////////////////////////////////
			// CAN'T USE INVENTORY ITEM WITH SCENE ITEM
			///////////////////////////////////////////
			}else{
				D.cD.action=false;
				// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
				$invItem.checkSay(JAG, iD.inv_use, D, iD.inv_use_text, false);
			};

		/////////////////////////////////////////////
		// USE INVENTORY ITEM ON OTHER INVENTORY ITEM
		/////////////////////////////////////////////
		}else{
			///////////////
			// CAN USE ITEM
			///////////////
			if(iD.inv_use!=false && iD.inv_use!=='_' && canUse){
				$Item.actionTimer(JAG, D, iD.inv_use, 'inv_use');

			/////////////////
			// CAN'T USE ITEM
			/////////////////
			}else{
				// CAN'T USE INVENTORY ITEM, DON'T JUMP TO CHECKSAY HERE BECAUSE
				// IT WILL CHECK FOR EXISTANCE OF SECONDARY SAY SETTINGS
				$invItem.saySomething(JAG, JAG.OBJ.$Char, iD.inv_use_text, JAG.OBJ.$currentScene, false);
			};

			D.cD.action=false;
		};
	};

	// ACTION COMPLETE
	JAG.OBJ.$selectedItem=false;
	JAG.Story.ActionWord=false;
	JAG.Story.joinWord=false;
	JAG.OBJ.$dBar.find('span').text(' ');
},



/***********************************************************************************************/
// PUSH - $Char.pushAction(JAG, $Item, iD, inInv);
/***********************************************************************************************/
pushAction:function(JAG, $Item, iD, inInv){
	//////////////////////
	// PUSH INVENTORY ITEM
	//////////////////////
	if(inInv){
		//////////////////////////
		// CAN PUSH INVENTORY ITEM
		//////////////////////////
		if(iD.inv_push!=false && iD.inv_push!=='_') $Item.actionTimer(JAG, D, iD.inv_push, 'inv_push');

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.inv_push, D, iD.inv_push_text, false);

	//////////////////
	// PUSH SCENE ITEM
	//////////////////
	}else{
		//////////////////////
		// CAN PUSH SCENE ITEM
		//////////////////////
		if(iD.push!=false && iD.push!=='_') $Item.actionTimer(JAG, D, iD.push, 'push');

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.push, D, iD.push_text, false);
	};

	// ACTION COMPLETE
	$Item.actionComplete(JAG, D);
},



/***********************************************************************************************/
// PULL - $Char.pull(JAG, $Item, iD, inInv);
/***********************************************************************************************/
pull:function(JAG, $Item, iD, inInv){
	//////////////////////
	// PULL INVENTORY ITEM
	//////////////////////
	if(inInv){
		//////////////////////////
		// CAN PULL INVENTORY ITEM
		//////////////////////////
		if(iD.inv_pull!=false && iD.inv_pull!=='_') $Item.actionTimer(JAG, D, iD.inv_pull, 'inv_pull');

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.inv_pull, D, iD.inv_pull_text, false);

	//////////////////
	// PULL SCENE ITEM
	//////////////////
	}else{
		//////////////////////
		// CAN PULL SCENE ITEM
		//////////////////////
		if(iD.pull!=false && iD.pull!=='_') $Item.actionTimer(JAG, D, iD.pull, 'pull');

		// MAKE SURE A RESPONSE CAN BE SAID AT THIS POINT
		$Item.checkSay(JAG, iD.pull, D, iD.pull_text, false);
	};

	// ACTION COMPLETE
	$Item.actionComplete(JAG, D);
},


/***********************************************************************************************/
// HELPER FUNCTION - CHECKS CHARACTER CAN RESPOND - $Item.checkSay(JAG, action, D, say, startQuestion);
/***********************************************************************************************/
checkSay:function(JAG, action, D, say, startQuestion){
	var toSpeak=true,
		$Item=$(this),
		itemType=$Item.hasClass('JAG_Item') ? 'item' : 'character',
		iD=$Item.data(itemType),
		hasSay=hasRiddle=false;

	// LOOP SECONDARY ACTIONS
	for(var i=0; i<action.length; i++){
		var actionX=action[i][0].toLowerCase().removeWS();
		// CHECK IF A SECONDARY SAY, SAY_AFTER OR RIDDLE ACTION EXISTS
		if(actionX.indexOf('say') <0) var hasSay=true;
		if(actionX.indexOf('riddle') <0) var hasRiddle=true;
	};

	// HANDLE TEXT IN SECONDARY ACTION
	if(hasSay || hasRiddle) var toSpeak=false;
	// IF A RIDDLE HAS BEEN SOLVED, HANDLE TEXT HERE
	if(iD.solvedRiddle && itemType==='character') var toSpeak=true;

	// TALK
	if(toSpeak) $Item.saySomething(JAG, JAG.OBJ.$Char, say, JAG.OBJ.$currentScene, startQuestion);
},



/***********************************************************************************************/
// HELPER FUNCTION - TIMER FOR ACTION SPRITE - $Item.actionTimer(JAG, D, action, actionText);
/***********************************************************************************************/
actionTimer:function(JAG, D, action, actionText){
	clearTimeout(JAG.Story.ActionTimer);

	//////////////////////////
	// SWITCH TO ACTION SPRITE
	//////////////////////////
	var $Item=$(this),
	  	startTime=JAG.Story.currentTime,
		action_time=D.cD.action_time;
	if(actionText!=='talk_to') JAG.OBJ.$Char.switchSprite(JAG, D.cD, actionText);


	////////////////////////////////////////////////////////////////////////////////////////////////
	// ALLOW USERS TO SET TIMES FOR VERBS USING THE ACTION_TIMER SETTING // CONTRIBUTED BY PVISINTIN
	////////////////////////////////////////////////////////////////////////////////////////////////
	if($.isArray(action_time)){
		var l=action_time.length;
		for(var i=0; i<l; i++){
			var value=action_time[i][0].toLowerCase().removeWS().split(':');
			if(value[0]===actionText) action_time=value[1];
		};
	};


	////////////////////////////////
	// SWITCH BACK TO STOPPED SPRITE
	////////////////////////////////
	JAG.Story.ActionTimer=setInterval(function(){
		var currentTime=JAG.Story.currentTime,
			elapsed=currentTime-startTime;
		
		////////////////////////////
		// TRIGGER ACTION WHEN READY
		////////////////////////////
		if(elapsed >= action_time.pF()){
			clearInterval(JAG.Story.ActionTimer);			
			if(!D.cD.walking) JAG.OBJ.$Char.switchSprite(JAG, D.cD, 'stopping');
	
			//////////////////////////////////////////////////
			// CHECK ACHIEVEMENTS => PERFORM SECONDARY ACTIONS
			//////////////////////////////////////////////////
			if($Item.Achievements(JAG, action, false, actionText)){
				$Item.actionLoop(JAG, action, actionText);
				if(actionText==='pick_up') $Item.addToInv(JAG, $Item.data('item'));
			};
		};
	}, 50);
},


/***********************************************************************************************/
// HELPER FUNCTION - CLEARS ACTION VARIABLES - $Item.actionComplete(JAG, D);
/***********************************************************************************************/
actionComplete:function(JAG, D){
	D.cD.action=false;
	JAG.Story.ActionWord=false;
	JAG.Story.joinWord=false;
	$(this).updateBar(JAG, 'exit', false, ' ');
}});
