/***********************************************************************************************/
// Jaguar - ITEMS & INVENTORY MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD ITEMS - $scene.loadItems(JAG, D);
/***********************************************************************************************/
loadItems:function(JAG, D){
	/////////////
	// LOOP ITEMS
	/////////////
	for(var i=0; i<D.sD.numItems; i++){
		var $Item=$(D.sD.sceneItems[i]),
			iD=$Item.data('item');
			pos=iD.pos.split(',');
			
		///////////////////////////
		// RECORD DATA & STYLE ITEM
		///////////////////////////
		$Item.css({left:pos[0].pF()+'%', display:'block', top:pos[1].pF()+'%'});

		///////////////////////////////////////
		// PASS EVENTS THROUGH DECORATIVE ITEMS
		///////////////////////////////////////
		if(!iD.show_name && iD.type==='layer') $Item.css('pointer-events','none');

		/////////////
		// EXIT ITEMS
		/////////////
		if(iD.type==='exit'){
			$Item[0].style.zIndex=7;
			// STORE ALL VISIBLE EXIT ITEMS FOR THIS SCENE
			if($Item.css('visibility')==='visible') JAG.OBJ.exitItems.push($Item);
		};
		
		/////////////////////////////////
		// LOAD SCENE OBJECTS [NOT EXITS]
		/////////////////////////////////
		if($.inArray(iD.text.toLowerCase().removeWS(), JAG.Story.Inventory) < 0 && iD.image !== undefined && iD.image){
			$Item.loadObject(JAG, iD);
		}else{
			iD.loaded=true;
		};
		
		///////////////////////////////////////////////
		// [MAPS ADDON] SET CURRENT MARKER IF AVAILABLE 
		///////////////////////////////////////////////
		if(iD.current_marker) JAG.Story.currentMarker=iD.current_marker.toLowerCase().removeWS();
	};

	return $(this);	
},




/***********************************************************************************************/
// LOAD SCENE OBJECTS [NOT EXITS] - $Item.loadObject(JAG, iD);
/***********************************************************************************************/
loadObject:function(JAG, iD){
	////////////////////
	// OBJECT VARIABLES
	///////////////////	
	var $Object=$(this),
		sceneObj=new Image(),
		src='Jaguar/items/'+iD.image+'.png';

	// LOADING A GAME WHERE THE SCENE OBJECT HAS BEEN UPDATED WITH CHANGE_SPRITE SECONDARY ACTION		
	if(JAG.Load.game_name){
		var gameID=JAG.OBJ.$Game.attr('id')+'~'+JAG.Load.game_name+'~'+$Object[0].id.toLowerCase().removeWS(),
			savedSRC=localStorage.getItem(gameID+'_item_sprite');
		if(savedSRC) var src='Jaguar/items/'+savedSRC+'.png';
	};

	// LOAD SCENE OBJECT
	$(sceneObj).one('load', function(){
		//////////////////////////
		// OBJECT IMAGE DIMENSIONS
		//////////////////////////		
		var oW=this.width*iD.scale.pF(),
			oH=this.height*iD.scale.pF();
		
		/////////////////////////////////////////////////////
		// STYLE OBJECT, SET IMAGE AND SETUP INVENTORY ARROWS
		/////////////////////////////////////////////////////
		$Object.css({width:oW, height:oH, zIndex:3}).html('<img class="JAG_Item_Img" src='+src+' width="'+oW+'" height="'+oH+'">').checkArrows(JAG);
		
		/////////////////
		// FLAG AS LOADED
		/////////////////
		iD.loaded=true;
	})[0].src=src;	
},



/***********************************************************************************************/
// ADD ITEM TO INVENTORY - $Item.addToInv(JAG, iD);
/***********************************************************************************************/
addToInv:function(JAG, iD){
	//////////////////////
	// INVENTORY VARIABLES
	//////////////////////
	var $Item=$(this),
		$Inv=JAG.OBJ.$Inv.find('ul'),
		itemsinRow=$Inv.find('span.JAG_Inv_Set').find('li').length,
		$firstAvailable=$Inv.find('li:empty').first(),
		set='';
	
	//////////////////////
	// INVENTORY ROWS FULL
	//////////////////////
	if($firstAvailable[0]===undefined){
		////////////////////////
		// ADD A NEW SET OF ROWS
		////////////////////////
		for(var i=0; i<itemsinRow; i++) set+='<li></li>';			
		$Inv.append('<span class="JAG_Inv_Set">'+set+'</span>');
		$firstAvailable=$Inv.find('span.JAG_Inv_Set:last').find('li:first');
		
		////////////////////////////////////////////
		// REBIND INVENTORY EVENTS AND UPDATE ARROWS
		////////////////////////////////////////////
		JAG.OBJ.$Inv.find('li').off('mouseenter.JAG_Inv mouseleave.JAG_Inv click.JAG_Inv').end().checkArrows(JAG);
		JAG.OBJ.$Game.bindInv(JAG);
	};

	////////////////////////////////////////////////////////
	// SLOT AVAILABE - ADD TO INVENTORY, PASS DATA & FADE IN
	////////////////////////////////////////////////////////
	var src=iD.inv_image ? iD.inv_image : iD.image;
	// LOADING A GAME WHERE THE INV OBJECT HAS BEEN UPDATED WITH CHANGE_SPRITE SECONDARY ACTION		
	if(JAG.Load.game_name){
		var gameID=JAG.OBJ.$Game.attr('id')+'~'+JAG.Load.game_name+'~'+$Item[0].id.toLowerCase().removeWS(),
			savedSRC=localStorage.getItem(gameID+'_item_sprite');
		if(savedSRC) var src=savedSRC;
	};	
	
	$firstAvailable.html('<img id="'+$Item.attr('id')+'" class="JAG_Item" src="Jaguar/items/'+src+'.png">')
	.find('img').animate({opacity:1},{duration:350,queue:false}).data('item',iD);

	/////////////////////////////////////////////
	// REMOVE FROM SCENE & UPDATE INVENTORY ARRAY
	/////////////////////////////////////////////
	$Item.remove();
	if($.inArray(iD.text.toLowerCase().removeWS(), JAG.Story.Inventory) ===-1){
		JAG.Story.Inventory.push(iD.text.toLowerCase().removeWS());
	};
},



/***********************************************************************************************/
// REMOVE ITEM FROM INVENTORY - $Item.remFromInv(JAG, itemName);
/***********************************************************************************************/
remFromInv:function(JAG, itemName){
	var $Item=$(this),
		iD=$Item.data('item');
	
	////////////////////////
	// REMOVE FROM INVENTORY
	////////////////////////
	$Item.stop(true,false).animate({opacity:0},{duration:350,queue:false,complete:function(){
		// PUSH ITEM TO DEAD ITEMS ARRAY
		JAG.Story.DeadItems.push($Item[0].id.toLowerCase().removeWS());
		
		// REMOVE FROM INVENTORY AND SHUFFLE
		$Item.remove().shuffleInv(JAG);

		// REMOVE ITEM FROM INVENTORY ARRAY
		JAG.Story.Inventory.splice(JAG.Story.Inventory.indexOf(itemName.toLowerCase().removeWS()), 1);
	}});
},



/***********************************************************************************************/
// RESHUFFLE INVENTORY [WHEN COMBINING OR REMOVING OBJECTS] - $Item.shuffleInv(JAG);
/***********************************************************************************************/
shuffleInv:function(JAG){
	//////////////////////
	// INVENTORY VARIABLES
	//////////////////////
	var $Inv=JAG.OBJ.$Inv.find('li'),
		totalSpaces=$Inv.length,
		$InvBlocks=JAG.OBJ.$Inv.find('span.JAG_Inv_Set'),
		totalBlocks=$InvBlocks.length;
		
	/////////////////////
	// INVENTORY IS EMPTY
	/////////////////////
	if(!$Inv.find('img').length) return;

	//////////////////////////////////////////
	// REMOVE AN EMPTY CONTAINER IN THE MIDDLE
	//////////////////////////////////////////
	for(var i=0; i<totalSpaces; i++) if($($Inv[i]).is(':empty')) $($Inv[i]).remove();
	
	/////////////////////////////////////////////////////////
	// REMOVE ALL SPAN ELEMENTS [THEY DEFINE SETS OF 8 ITEMS]
	/////////////////////////////////////////////////////////
	for(var i2=0; i2<totalBlocks; i2++) $($($InvBlocks[i2])).replaceWith($($($InvBlocks[i2])).contents());

	/////////////////////////////////////////////////////
	// REMOVE EMPTY SETS - LEFT WITH JUST A LIST OF ITEMS
	/////////////////////////////////////////////////////
	JAG.OBJ.$Inv.find('span.JAG_Inv_Set:empty').remove();
	
	//////////////////////////////////////
	// LOOP ITEMS - REBUILD SETS [8 ITEMS]
	//////////////////////////////////////
	var $newInv=JAG.OBJ.$Inv.find('li'),
		numSets=$newInv.length;
	for(var i=0; i<numSets; i+=8){
	    var $span=$("<span/>",{class: 'JAG_Inv_Set'});
   		$newInv.slice(i, i+8).wrapAll($span);
	};
	
	////////////////////////////////////////////
	// CHECK LAST SET IF THERE ARE 8 EMPTY ITEMS
	////////////////////////////////////////////
	var $lastBlock=JAG.OBJ.$Inv.find('span.JAG_Inv_Set:last');
	for(var i3=0; i3<8; i3++) if($lastBlock.find('li').length < 8) $lastBlock.append('<li/>');

	///////////////////////////////////////////////
	// MOVE INVENTORY TO FIRST SET AND RESET MARGIN
	///////////////////////////////////////////////
	JAG.OBJ.$Inv.find('ul').css('margin-top',0).find('span.JAG_Inv_Set:first').addClass('JAG_currentSet');

	////////////////////////////////////////////
	// REBIND INVENTORY EVENTS AND UPDATE ARROWS
	////////////////////////////////////////////
	$('#JAG_Inventory li').off('mouseenter.JAG_Inv mouseleave.JAG_Inv click.JAG_Inv').checkArrows(JAG);	
	JAG.OBJ.$Game.bindInv(JAG);
	
	return $(this);
},



/***********************************************************************************************/
// BUILD DESC BAR, VERBS AND INVENTORY PANEL + INV SCROLLING
/***********************************************************************************************/
buildInv:function(JAG){
	//////////////////////
	// INVENTORY VARIABLES
	//////////////////////
	var itemCount=8, 
		InvItems='';
		
	////////////////////////////////////////
	// BUILD LIST ELEMENTS & INVENTORY PANEL
	////////////////////////////////////////
	for(var i=0; i<itemCount; i++) InvItems+='<li></li>';
	JAG.OBJ.$Game.append('<div id="JAG_Desc"><p>\
		<span class="JAG_ActionWord"></span>\
		<span class="JAG_Item1Word"></span>\
		<span class="JAG_JoinWord"></span>\
		<span class="JAG_Item2Word"></span></p></div>\
		<div id="JAG_Panel">\
		<div id="JAG_Verbs">\
		<ul class="JAG_Column1">\
		<li class="JAG_Word" id="JAG_verb_give">Give</li>\
		<li class="JAG_Word" id="JAG_verb_open">Open</li>\
		<li class="JAG_Word" id="JAG_verb_close">Close</li>\
		</ul><ul class="JAG_Column2">\
		<li class="JAG_Word" id="JAG_verb_pick_up">Pick up</li>\
		<li class="JAG_Word" id="JAG_verb_look_at">Look at</li>\
		<li class="JAG_Word" id="JAG_verb_talk_to">Talk to</li>\
		</ul><ul class="JAG_Column3">\
		<li class="JAG_Word" id="JAG_verb_use">Use</li>\
		<li class="JAG_Word" id="JAG_verb_push">Push</li>\
		<li class="JAG_Word" id="JAG_verb_pull">Pull</li>\
		</ul></div>\
		<div id="JAG_Inventory">\
		<div id="JAG_Inv_Arrows"><div class="JAG_Arrow_Up"></div><div class="JAG_Arrow_Down"></div></div>\
		<ul><span class="JAG_Inv_Set JAG_currentSet">'+InvItems+'</span></ul></div></div></div>').bindInv(JAG);
	
	////////////////////
	// UPDATE REFERENCES
	////////////////////
	JAG.OBJ.$Panel=$('#JAG_Panel');
	JAG.OBJ.$Inv=$('#JAG_Inventory');	
	JAG.OBJ.$dBar=$('#JAG_Desc');
	
	//////////////////////
	// INVENTORY SCROLLING
	//////////////////////
	$('#JAG_Inv_Arrows').on('click',function(e){
		var $Arrow=$(e.target),
			$Inv=JAG.OBJ.$Inv.find('ul'),
			numSets=$Inv.find('span.JAG_Inv_Set').length,
			$currentSet=$Inv.find('span.JAG_currentSet'),
			currentIndex=$currentSet.index(),
			H=$currentSet.find('li:first').outerHeight(true)*2;

		//////////////////////
		// CANNOT BE NAVIGATED
		//////////////////////
		if(numSets <= 1) return;		

		/////
		// UP
		/////
		if($Arrow.hasClass('JAG_Arrow_Up')){
			if(!$currentSet.prev('span.JAG_Inv_Set').length) return;
			
			////////////////////////////////////////
			// UPDATE CURRENT SET & SCROLL INVENTORY
			////////////////////////////////////////
			$('#JAG_Scroll').attr('src','Jaguar/audio/'+D.gD.scroll_sound+'.mp3')[0].play();			
			$currentSet.removeClass('JAG_currentSet').prev('span.JAG_Inv_Set').addClass('JAG_currentSet');
			$Inv.css({'margin-top':-(H*(currentIndex-1))+'px'});
			
		///////
		// DOWN
		///////
		}else if($Arrow.hasClass('JAG_Arrow_Down')){
			if(!$currentSet.next('span.JAG_Inv_Set').length) return;
			
			//////////////////////////////////////////
			// UPDATE CURRENT SET AND SCROLL INVENTORY
			//////////////////////////////////////////
			$currentSet.removeClass('JAG_currentSet').next('span.JAG_Inv_Set').addClass('JAG_currentSet');
			$Inv.css({'margin-top':-(H*(currentIndex+1))+'px'});
			$('#JAG_Scroll').attr('src','Jaguar/audio/'+D.gD.scroll_sound+'.mp3')[0].play();
		};
		
		////////////////
		// UPDATE ARROWS
		////////////////
		$Inv.checkArrows(JAG);
	});
	
	return $(this);
},



/***********************************************************************************************/
// BIND INVENTORY OBJECT EVENTS
/***********************************************************************************************/
bindInv:function(JAG){
	///////////////////
	// INVENTORY EVENTS
	///////////////////
	$('#JAG_Inventory').find('li').on('mouseenter.JAG_Inv mouseleave.JAG_Inv click.JAG_Inv',function(e){
		// EMPTY SLOT
		if(!$(this).find('img').length) return;

		//////////////////////
		// INVENTORY VARIABLES
		//////////////////////
		var $li=$(this),
			$Item=$li.find('img'),
			iD=$Item.data('item');

		switch(e.type){
			//////////////////
			// CLICK INVENTORY
			//////////////////			
			case 'click':
				if(JAG.Story.ActionWord!==false){
					// THE JOINWORD INDICATES THE PRESENCE OF 'TO' OR 'WITH' - SET AS SELECTED ITEM [FIRST INV CLICK]
					if(!JAG.Story.joinWord) JAG.OBJ.$selectedItem=$Item;
					$Item.Action(JAG, 'item', false, true);
				};
			break;
			
			//////////
			// MOUSEIN
			//////////
			case 'mouseenter': $Item.updateBar(JAG, 'enter', 'item', ' '+iD.text); break;				
			
			///////////
			// MOUSEOUT
			///////////
			case 'mouseleave': $Item.updateBar(JAG, 'exit', false, false); break;
		};
	});	
},



/***********************************************************************************************/
// INVENTORY ARROW VISIBILITY
/***********************************************************************************************/
checkArrows:function(JAG){
	//////////////////////
	// INVENTORY VARIABLES
	//////////////////////
	var $Inv=JAG.OBJ.$Inv,
		$Up=$Inv.find('div.JAG_Arrow_Up'),
		$Down=$Inv.find('div.JAG_Arrow_Down'),
		numSets=$Inv.find('span.JAG_Inv_Set').length,
		$currentSet=$Inv.find('span.JAG_currentSet'),
		currentIndex=$currentSet.index()+1;

	////////////////////
	// UPDATE VISIBILITY
	////////////////////
	$Up[0].style.visibility=currentIndex > 1 ? 'visible' : 'hidden';
	$Down[0].style.visibility=currentIndex < numSets ? 'visible' : 'hidden';		
}});