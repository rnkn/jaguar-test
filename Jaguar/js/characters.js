/***********************************************************************************************/
// Jaguar - CHARACTERS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// MAIN CHARACTER LOADING - $scene.loadChar(JAG, D);
/***********************************************************************************************/
loadChar:function(JAG, D){
	var $Char=JAG.OBJ.$Char,
		scale=D.cD.scale.split(','),
		CharImg=new Image();

	/////////////////////
	// LOAD CHARACTER SRC
	/////////////////////
	var	src=D.sD.ENT_IMG ? 'Jaguar/chars/'+D.sD.ENT_IMG.removeWS()+'.gif' : $(CharImg).loadSprite(JAG, D.cD, 'stopping');		
	if(JAG.Load.loading) var src=$(CharImg).loadSprite(JAG, D.cD, 'stopping');


	//////////////
	// LOAD SPRITE
	//////////////
	$(CharImg).one('load',function(){

		///////////////////
		// IMAGE DIMENSIONS
		///////////////////
		var W=this.width+'px', H=this.height+'px';
		
		////////////////
		// CHAR POSITION
		////////////////	
		// POSITION EXIT ITEMS USING NEXT_POS - ACCOUNT FOR REPEAT WALK_INS
		var ENT=D.sD.ENT ? D.sD.ENT.split(',') : D.cD.pos.split(','),
			X=ENT[0].pF(), Y=ENT[1].pF(),
			// CONVERT USER-SUPPLIED % TO PX VALUE
			newX=D.gD.viewportW*(X/100)+'px',
			newY=D.gD.viewportH*(Y/100)+'px';
		
		// LOAD SAVED GAME CHARACTER POSITION		
		if(JAG.Load.CharX){
			var newX=JAG.Load.CharX+'px', 
				newY=JAG.Load.CharY+'px'; 
			JAG.Load.CharX=false;
			JAG.Load.CharY=false;
		};

		/////////////////////////////////
		// INSERT CHARACTER AND SAVE DATA
		/////////////////////////////////
		$Char.css({width:W, height:H, left:newX, top:newY}).html('<img src='+src+' class="JAG_Char_Img" width="'+W+'" height="'+H+'">');
		D.cD.CharW=$Char.outerWidth(); 
		D.cD.CharH=$Char.outerHeight();

		///////////////////////////////////////////////////
		// INSERT DIALOGUE ELEMENT DIRECTLY AFTER CHARACTER
		///////////////////////////////////////////////////
		if(!$Char.next('p').length) $('<p class="JAG_Char_Dialogue"></p>').insertAfter($Char);

		///////////////
		// DONE LOADING
		///////////////
		JAG.Load.loading=false;
		D.sD.ENT=false;	
		D.sD.ENT_IMG=false;
		D.cD.loaded=true;
	})[0].src=src;
	
	return $(this);
},



/***********************************************************************************************/
// AUXILLIARY CHARACTER LOADING - $scene.loadAuxChars(JAG, D);
/***********************************************************************************************/
loadAuxChars:function(JAG, D){
	// REMOVE MAIN CHARACTER FROM ARRAY
	var AuxChars=JAG.OBJ.$currentScene.find('div.JAG_Aux_Char');
	
	///////////////////////////
	// SCENE CONTAINS AUX CHARS
	///////////////////////////
	if(D.sD.numChars > 1){
		// USE .EACH TO KEEP EACH ITERATION WITHIN SCOPE
		AuxChars.each(function(i){
			//////////////////////////
			// SETUP CHARACTER SPRITES
			//////////////////////////
			var $AuxChar=$(AuxChars[i]),
				AuxCharImg=new Image(),
				temp_AcD=$AuxChar.data('character'),
				AcD=$.extend({}, JAG.Character, !temp_AcD?{}:temp_AcD||{} ),
				src='Jaguar/chars/'+AcD.image+'.gif';

			// UPDATE NEW AUX CHARACTER DATA
			$AuxChar.data('character',AcD);

			//////////////
			// LOAD SPRITE
			//////////////


			$(AuxCharImg).one('load',function(){
				// POSITION EXIT ITEMS USING NEXT_POS - ACCOUNT FOR WALK-IN REPEATS
				var $AuxChar=$(AuxChars[i]),
					AcDpos=AcD.pos.split(','),
					X=AcDpos[0].pF(), Y=AcDpos[1].pF(),
					W=this.width+'px', H=this.height+'px';

				////////////////////////////////////////////
				// IF RUNNING A LOADED GAME, LOAD CHAR 
				// VISIBILITY BASED ON SAVE_GAME INFORMATION
				////////////////////////////////////////////
				var visibility=AcD.hidden.isB() ? 'hidden' : 'visible';
				if(JAG.Load.game_name){
					var gameID=JAG.OBJ.$Game[0].id,
						auxCharVis=localStorage.getItem(JAG.OBJ.$Game[0].id+'~'+JAG.Load.game_name+'~'+$AuxChar[0].id.toLowerCase().removeWS()+'_char_visibility');
					if(auxCharVis) var visibility=auxCharVis;		
				};

				///////////////////////////
				// STYLE & INSERT CHARACTER
				///////////////////////////
				$AuxChar.css({width:W, height:H, left:X+'%', top:Y+'%', visibility:visibility})
				.html('<img src='+src+' class="JAG_Aux_Char_Img" width="'+W+'" height="'+H+'">');

				//////////////////////////
				// SAVE AUX CHARACTER DATA
				//////////////////////////
				AcD.CharW=$AuxChar.outerWidth(); 
				AcD.CharH=$AuxChar.outerHeight();
		
				/////////////////////////////////////
				// PERFORM SECONDARY ENTRANCE ACTIONS
				/////////////////////////////////////
				if(AcD.entrance) $AuxChar.actionLoop(JAG, AcD.entrance, 'entrance');	

				///////////////////////////////////////////////////
				// INSERT DIALOGUE ELEMENT DIRECTLY AFTER CHARACTER
				///////////////////////////////////////////////////				
				if(!$AuxChar.next('p').length) $('<p class="JAG_Char_Dialogue"></p>').insertAfter($AuxChar);

				/////////////////
				// FLAG AS LOADED
				/////////////////
				AcD.loaded=true;
			})[0].src=src;			
		});		
	};
	return $(this);
},



/***********************************************************************************************/
// CHARACTER WALKING - $Char.walk(JAG, toX, toY);
/***********************************************************************************************/
walk:function(JAG, toX, toY, isAuxChar){
	////////////////////
	// WALKING VARIABLES
	////////////////////
	var $Char=$(this),
		cD=$Char.data('character'),
		// CALCULATING NEW CHARACTER POSITION 
		oldX=$Char.css('left').pF(), 
		oldY=$Char.css('top').pF(),			
		X=Math.round(toX + (D.sD.pan ? Math.abs(D.sD.panPos.pF()) : 0)), 
		distX=Math.max(X, oldX) - Math.min(X, oldX), 
		distY=Math.max(toY, oldY) - Math.min(toY, oldY),
		avgSpeed=(Math.max(distX,distY) / (1000/(cD.speed.pF()/1000) ).toFixed(2).pF())*1000;
	// NOW WALKING
	cD.walking=true;

	
	////////////////////////////////////////////////////////////
	// SET DIRECTION OF MOVEMENT AND RETRIEVE DIRECTIONAL SPRITE
	////////////////////////////////////////////////////////////
	if(distY > distX){ cD.direction=toY > oldY ? 'down' : 'up';
	}else if(distY < distX){ cD.direction=X > oldX ? 'right' : 'left'; };


	////////////////////////////////////////////////////////
	// SET SPRITE [IF DIFFERENT] AND BEGIN WALKING ANIMATION
	////////////////////////////////////////////////////////
	$Char.switchSprite(JAG, cD, 'walk_to')
		.stop(true,false).animate({left:X+'px', top:toY+'px'},{duration:avgSpeed, queue:false, easing:'linear',
		///////////////////////////
		// CHARACTER WALKING EVENTS
		///////////////////////////
		progress:function(a, p, c){
			var $Item=JAG.OBJ.$currentItem,
				pos=$Char.position();

			/////////////////////////////////////////////
			// SCALE, KEEP CHARACTER LAYERED AND INBOUNDS
			/////////////////////////////////////////////
			$Char.scale(JAG, cD).layerItem(JAG, D.sD.allItems, D.sD.allItems.length).inBounds(JAG, pos, cD);

			//////////////////
			// DIALOGUE FOLLOW
			//////////////////
			if(D.gD.text_follow && $Char.next('p.JAG_Char_Dialogue').is(':visible')) $Char.next('p.JAG_Char_Dialogue').textDims(JAG, $Char, cD);

			////////////////////////
			// MAIN CHARACTER EVENTS
			////////////////////////
			if(!isAuxChar){
				// EXIT ITEM COLLISION [ DO NOT CALL WITHIN FIRST 100PX MAY BE STANDING ON EXIT ]				
				if(JAG.OBJ.exitItems.length && (p*Math.max(distX, distY)>100)) $Char.collision(JAG, JAG.OBJ.exitItems);
					
				// PANNING 
				if(D.sD.pan){
					// CURRENT AMOUNT PANNED
					var panPos=D.sD.panPos,
						// CHARACTER POSITION [PERCENTAGE OF VIEWPORT]
						CharLeft=$Char.css('left').pF(),
						MidLine=D.gD.viewportW/2,
						CrossedMidLine=(CharLeft+panPos) >= MidLine,
						// THE INITIAL STARTING LEFT POSITION OF THE CHARACTER
						CharStartX=D.gD.viewportW/cD.pos.split(',')[0].pF();
							
					// PAN LEFT OR RIGHT [FOR WITHOUT MIDLINE CROSSING: panPos=-CharLeft+CharStartX;]
					if(!CrossedMidLine && cD.direction==='left' || CrossedMidLine && cD.direction==='right') panPos=-(CharLeft-MidLine); 

					// CHECK FULL LEFT PAN (0) AND FULL RIGHT PAN (TOTALPAN)
					if(panPos > 0) panPos=0;
					if(Math.abs(panPos) > (D.sD.sceneW-D.gD.viewportW)) panPos=-(D.sD.sceneW-D.gD.viewportW);

					// APPLY NEW PAN POSITION
					D.sD.panPos=panPos; 
					JAG.OBJ.$currentScene.css('margin-left', panPos);
				};
			};

		///////////////
		// STOP WALKING
		///////////////
		},complete:function(){
			cD.walking=false;
			$Char.stopWalking(JAG, cD);
	}});
	
	return $(this);	
},




/***********************************************************************************************/
// CHARACTER STOPPING - $Char.stopWalking(JAG, cD);
/***********************************************************************************************/
stopWalking:function(JAG, cD){
	/////////////////////
	// STOPPING VARIABLES
	/////////////////////
	var	$Char=$(this),
		src=$Char.loadSprite(JAG, cD, 'stopping'),
		stopImg=new Image(),		
		$Item=JAG.OBJ.$currentItem,
		$exit=JAG.OBJ.$selectedExit;
		
	///////////////////////////////	
	// LOAD STOPPED MOVEMENT SPRITE
	///////////////////////////////
	$(stopImg).one('load',function(){
		if(!D.cD.walking && !$Char.is(':animated')){
			/////////////////////////////////////////////
			// ACTION CALLBACK [ACTIONS], RESET WHEN DONE
			/////////////////////////////////////////////
			if(cD.action && typeof cD.callback==='function'){
				if($Item){
					/////////////////
					// FIND PROXIMITY
					/////////////////
					var itemType=$Item.hasClass('JAG_Aux_Char') ? 'character' : 'item',
						iD=$Item.data(itemType),
						proximity=iD.proximity.pF();

					///////////////////////
					// GET CURRENT DISTANCE
					///////////////////////
					$Char.returnDist($Item);
			
					////////////
					// FACE ITEM
					////////////
					cD.direction=Diff.Left ? 'right' : 'left';
	
					//////////////////////////
					// LOAD DIRECTIONAL SPRITE
					//////////////////////////
					$Char.switchSprite(JAG, cD, 'stopping');
					
					/////////////////////////////////
					// PERFORM ACTION IF CLOSE ENOUGH
					/////////////////////////////////
					if(proximity > Diff.distance){
						cD.callback.apply();
					}else{
						// NOT CLOSE ENOUGH
						$Char.saySomething(JAG, $Char, JAG.Speech.too_far, JAG.OBJ.$currentScene, false)
					};

				// ENTRANCES DON'T USE ITEMS	
				}else{
					// STOP WALK_TO ENTRANCES
					$Char.switchSprite(JAG, cD, 'stopping');
					cD.callback.apply();
				};
				
			//////////////////////////////////////
			// APPLY STOPPING SPRITE TO ALL OTHERS
			//////////////////////////////////////
			}else{
				$Char.switchSprite(JAG, cD, 'stopping');
			};
		
			// SET STOPPING FLAGS
			D.cD.callback=false;	
			D.cD.action=false;
		};
	})[0].src=src;
	
	return $Char;
},



/***********************************************************************************************/
// SPRITE SWAPPING - $Char.loadSprite(JAG, cD, type);
/***********************************************************************************************/
loadSprite:function(JAG, cD, type){
	////////////////
	// SPRITE ACTION
	////////////////
	if(type==='walk_to'){
		var initSprite=cD.image, 
			right=cD.right ? cD.right.split(',')[0] : false, 
			left=cD.left ? cD.left.split(',')[0] : false, 
			up=cD.up ? cD.up.split(',')[0] : false, 
			down=cD.down ? cD.down.split(',')[0] : false;
	}else if(type==='stopping'){
		var initSprite=cD.image,
			right=cD.right ? cD.right.split(',')[1] : false, 
			left=cD.left ? cD.left.split(',')[1] : false,
			up=cD.up ? cD.up.split(',')[1] : false, 
			down=cD.down ? cD.down.split(',')[1] : false;
	}else{
		var initSprite=cD[type+'_image'], 
			right=cD[type+'_right'],
			left=cD[type+'_left'], 
			up=cD[type+'_up'], 
			down=cD[type+'_down'];
	};
	

	///////////////////////////////////////
	// DIRECTIONAL SPRITE [ USE FALLBACKS ]
	///////////////////////////////////////
	if(JAG.Load.CharDirection){ cD.direction=JAG.Load.CharDirection; JAG.Load.CharDirection=false; };
	switch(cD.direction){
		case 'right': var newSprite=right ? right : initSprite;  break;
		case 'left' : var newSprite=left  ? left  : initSprite;  break;
		case 'up'   : var newSprite=up    ? up    : initSprite;  break;
		case 'down' : var newSprite=down  ? down  : initSprite;  break; 
	};


	// SOME [DEFAULT] SETTINGS MAY NOT BE SET
	if(!newSprite || (type==='stopping' && cD.walking)){
		return false;
	}else{
		// RETURN NEW SRC
		return 'Jaguar/chars/'+newSprite.removeWS()+'.gif';			
	};
},



/***********************************************************************************************/
// HELPER FUNCTION FOR CHECKING IF A SPRITE SHOULD BE CHANGED - $Char.switchSprite(JAG);
/***********************************************************************************************/
switchSprite:function(JAG, data, sprite){
	var $Char=$(this),
		$CharImg=$Char.find('img'),
		src=$Char.loadSprite(JAG, data, sprite),
		current=$CharImg[0].src,
		current_src=current.substring(current.indexOf('/Jaguar/')+1);	
	if(src && src!==current_src) $CharImg[0].src=src;

	return $Char;
},


/***********************************************************************************************/
// BUILDS THE CHARACTER STATS WINDOW [ OPEN WITH ESC ]
/***********************************************************************************************/
buildStats:function(JAG, gD){
	var $GAME=$(this),
		playerStats=gD.player_stats[0].split(','),
		numStats=playerStats.length,
		insertLeft='', insertRight='';
		
	//////////////////////////////////////////////////////////
	// LOOP THROUGH USER-DEFINED STATS AND POPULATE THE WINDOW
	//////////////////////////////////////////////////////////
	for(var i=0; i<numStats; i++){
		var stat=playerStats[i].split('='),
			points=stat[1].split('/'),
			insert='<div class="JAG_Stat_Line"><p class="JAG_Stat">'+stat[0]+':</p>\
			<span class="JAG_Score">'+points[0]+'/'+points[1]+'</span><p class="JAG_Progress"><span></span></p></div>';

		/////////////////////////////////////////////////////////			
		// EVEN NUMBER GOES ON LEFT SIDE OF WINDOW / ODD ON RIGHT
		/////////////////////////////////////////////////////////
		if(i%2==0){ insertLeft+=insert; }else{ insertRight+=insert; };
		
		//////////////////////////
		// ADD TO JAG.STATS OBJECT
		//////////////////////////
		JAG.Stats[stat[0].toLowerCase().removeWS()]=points[0].pF();
		JAG.Stats[stat[0].toLowerCase().removeWS()+'_max']=points[1].pF();
		JAG.Stats['num_stats']=numStats;
	};
	

	///////////////////////////////////
	// BUILD THE CHARACTER STATS WINDOW
	///////////////////////////////////
	$GAME.prepend('<div id="JAG_Stats_Overlay"></div><div id="JAG_ID_Stats">\
    	<p class="game_title">'+gD.title+'</p><h2>'+gD.player_name+'</h2>\
		<div class="JAG_Player_Points"><div class="JAG_Stats_Left">'+insertLeft+'</div><div class="JAG_Stats_Right">'+insertRight+'</div>\
   	    <div class="JAG_clear"></div></div></div>');

	return $GAME;
},


/***********************************************************************************************/
// OPENS STAT WINDOW [ ESC ]
/***********************************************************************************************/
openStats:function(JAG){
	var $GAME=$(this),
		$Overlay=$('#JAG_Stats_Overlay'),
		$Stats=$('#JAG_ID_Stats'),
		$win=$(window),
		$Statlines=$Stats.find('div.JAG_Player_Points').find('div.JAG_Stat_Line'),
		numStats=$Statlines.length;
		
	// CLOSE THE WINDOW IF OPEN
	if($Overlay.is(':visible')){ $GAME.closeStats(JAG); return; };

	/////////////////////////
	// ANIMATE THE OVERLAY IN
	/////////////////////////
	$Overlay.css('display','block').stop(true,false).animate({opacity:1},{duration:200,queue:false,complete:function(){
		var left=((D.gD.viewportW-$Stats.outerWidth(true))/2)+$win.scrollLeft()+'px',
			top=(($GAME.outerHeight()-$Stats.outerHeight(true))/2)+$win.scrollTop()+'px';

		////////////////////////
		// ANIMATE THE WINDOW IN
		////////////////////////
		$Stats.css({display:'block',top:top,left:left}).stop(true,false)
			.animate({opacity:1},{duration:200,queue:false,complete:function(){

				//////////////////////////////////////////////////
				// LOOP THROUGH STATS AND SET THEIR CURRENT VALUES
				//////////////////////////////////////////////////
				for(var i=0; i<numStats; i++){
					var $thisStat=$($Statlines[i]),
						statName=$thisStat.find('p.JAG_Stat').text().toLowerCase().removeWS().replace(':',''),
						currentPoints=JAG.Stats[statName],
						MaxPoints=JAG.Stats[statName+'_max'];
					$thisStat.find('span.JAG_Score').text(currentPoints+'/'+MaxPoints).end()
						.find('p.JAG_Progress').find('span')[0].style.width=(currentPoints/MaxPoints)*100+'%';
				};
				
				// ALLOW CLICKING THE OVERLAY TO CLOSE STATS WINDOW
				$Overlay.on('click',function(){ $GAME.closeStats(JAG); });
		}});		
	}});
},


/***********************************************************************************************/
// CLOSES STAT WINDOW [ ESC ]
/***********************************************************************************************/
closeStats:function(JAG){
	var $Overlay=$('#JAG_Stats_Overlay'),
		$Stats=$('#JAG_ID_Stats');
		
	// UNBIND THE CLICK EVENT ON THE OVERLAY
	$Overlay.off('click');
	
	/////////////////////////
	// CLOSE THE STATS WINDOW
	/////////////////////////
	$Stats.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
		
		//////////////////////////
		// ANIMATE THE OVERLAY OUT
		//////////////////////////
		$Overlay.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
			$Stats[0].style.display='none';
			$Overlay[0].style.display='none';
			$Stats.find('div.JAG_Player_Points').find('p.JAG_Progress').find('span').css('width','0%');			
		}});
	}});		
}});