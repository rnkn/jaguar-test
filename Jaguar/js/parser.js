/***********************************************************************************************/
// Jaguar - ACTIONS PARSER MODULE [DESCRIPTION BAR]
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// SETUP EVENTS TO POPULATE DESCRIPTION BAR
/***********************************************************************************************/
dBar:function(JAG, D){
	////////////////////////////////////////////////
	// UPDATE DESCRIPTION BAR [OBJECTS & CHARACTERS]
	////////////////////////////////////////////////
	JAG.OBJ.$currentScene.find('div').off('mouseenter mouseleave').on('mouseenter mouseleave',function(e){
		var $El=$(this),
			elClass=$El.attr('class'),
			isAuxChar=elClass.indexOf('JAG_Aux_Char')>=0 ? true : false,
			isItem=elClass.indexOf('JAG_Item')>=0 ? true : false,
			isExit=false;
			
		// RETURN IF RIDDLE & PASSWORDS IS VISIBLE
		if($('#JAG_Riddle_Answer').is(':visible')) return;
			
		// CHECK IF TARGET IS AN EXIT
		if(isItem && $El.data('item').type.toLowerCase().removeWS()==='exit') var isExit=true;

		/////////////////////////////////
		// ITEMS AND AUXILIARY CHARACTERS
		/////////////////////////////////			
		if(isItem || isAuxChar){
			var itemType=isItem ? 'item' : 'character',
				data=$El.data(itemType);
				
			switch(e.type){			
				//////////
				// MOUSEIN
				//////////
				case 'mouseenter':
					// DON'T ALLOW USE ON CHARACTERS OR EXITS WHEN THERE'S A JOINWORD
					if((isExit && JAG.Story.joinWord) || (isAuxChar && JAG.Story.ActionWord===6) || !data.show_name) return;
					if(data.text!==false) $El.updateBar(JAG, 'enter', itemType, data.text);
					
					////////////////////////////////////
					// VERB HIGHLIGHTING [NO ITEM EXITS]
					////////////////////////////////////
					if(JAG.Story.ActionWord!==false && data.highlight_verb && !isExit){
						var $verb=$('#JAG_verb_'+data.highlight_verb);
						$verb.addClass('verb_hovered');
						// READY VERB FOR ACTION IF USE_VERB
						if(data.use_verb) $verb.trigger('click');
					};					
				break;
			
				///////////
				// MOUSEOUT
				///////////
				case 'mouseleave': 
					$El.updateBar(JAG, 'exit', false, false);
					// REMOVE ANY VERB HIGHLIGHTS
					JAG.OBJ.$Panel.find('li.JAG_Word').removeClass('verb_hovered');
					// IF USING VERB HIGHLIGHTS FOR ACTION - RESET ACTION WORD
					if(data.use_verb) JAG.Story.ActionWord=false;
				break;
			};
		};
	});
	
	//////////////
	// VERB EVENTS
	//////////////
	$('#JAG_Verbs').on('mouseenter mouseleave click', 'li', function(e){
		
		/////////////////
		// VERB VARIABLES
		/////////////////
		var $Verb=$(this),
			text=$Verb.text();
			
		switch(e.type){
			//////////
			// MOUSEIN
			//////////
			case 'mouseenter': 
				$Verb.addClass('verb_hovered');
				if(JAG.Story.ActionWord!==6 && JAG.Story.ActionWord!==0) $Verb.updateBar(JAG, 'enter', 'actionWord', text); 
			break;
			
			///////////
			// MOUSEOUT
			///////////
			case 'mouseleave': 
				$Verb.removeClass('verb_hovered').updateBar(JAG, 'exit', false, false); 
			break;
			
			////////
			// CLICK
			////////
			case 'click':
				// GET THE EXACT INDEX OF VERB
				JAG.Story.ActionWord=($Verb.parent('ul:first').index()*3)+$Verb.index();
				JAG.Story.joinWord=false;
				$Verb.updateBar(JAG, 'enter', 'actionWord', text);
			break;
		};
	});
},


/***********************************************************************************************/
// UPDATE DESCRIPTION BAR TEXT $Item.updateBar(JAG, mouseSTATUS, itemType, text);
/***********************************************************************************************/
updateBar:function(JAG, status, itemType, text){
	////////////////////////////
	// DESCRIPTION BAR VARIABLES
	////////////////////////////
	var $Item=$(this),
		$dBar=JAG.OBJ.$dBar,
		$ActionWord=$dBar.find('span.JAG_ActionWord'),
		$Item1Word=$dBar.find('span.JAG_Item1Word'),
		$JoinWord=$dBar.find('span.JAG_JoinWord'),
		$Item2Word=$dBar.find('span.JAG_Item2Word'),
		AW=JAG.Story.ActionWord,
		GIVE=AW===0 ? true : false,
		USE=AW===6 ? true : false,
		// SIGNALS USER HAS SELECTED AN ITEM TO GIVE OR USE
		isGIVE=$JoinWord.text()===' to';

	// TEST STATUS
	switch(status){
		////////
		// ENTER 
		////////
		case 'enter':
			switch (itemType){	
				///////
				// VERB
				///////
				case 'actionWord': 					
					if(!isGIVE){ 
						$ActionWord.text(text); 
					}else{
						$ActionWord.text(text);
						$Item1Word.text(''); 
						$JoinWord.text(''); 
					};
				break;
				
				////////////
				// CHARACTER
				////////////
				case 'character':
					if(GIVE || USE){ 
						$Item2Word.text(' '+text);
					}else{ 
						$Item1Word.text(' '+text); 
					};
				break;
				
				///////
				// ITEM
				///////
				case 'item':
					var	inInv=JAG.Story.Inventory.indexOf($Item.data('item').text)>=0;
				
					if($Item.data('item').type==='exit'){
						$ActionWord.text('');
						$Item1Word.text('');
						$JoinWord.text('');
					};

					// MAKE INVENTORY CHECK
					if(isGIVE) return;
					$Item2Word.text(USE ? ' '+text : text);
				break;
			};			
		break;
		
		///////
		// EXIT
		///////
		case 'exit':
			$ActionWord.text(JAG.Story.ActionWord!==false ? $($('#JAG_Verbs').find('li')[JAG.Story.ActionWord]).html() : ' ');
			if(!GIVE && !USE) $Item1Word.add($JoinWord).text(' ');
			$Item2Word.text(' ');
		break;
		
		////////
		// CLICK
		////////
		case 'click':
			$ActionWord.text($($('#JAG_Verbs').find('li')[JAG.Story.ActionWord]).html());
			$Item1Word.text(text);
			$JoinWord.text(GIVE ? ' to' : USE ? ' with ' : '');
			$Item2Word.text(' ');
		break;		
	};
}});