/***********************************************************************************************/
// Jaguar - CUTSCENES MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD CUTSCENE - $Scene.loadCutScene(JAG);
/***********************************************************************************************/
loadCutScene:function(JAG){
	/////////////////////
	// CUTSCENE VARIABLES
	/////////////////////
	var	$Scene=JAG.OBJ.$currentScene,
		src='Jaguar/scenes/'+D.sD.background,
		foreG=D.sD.foreground ? 'url(Jaguar/scenes/'+D.sD.foreground+')' : false,
		img=new Image();

	////////////////
	// LOAD CUTSCENE
	////////////////
	$(img).one('load',function(){
		///////////////////////////
		// SAVE CUTSCENE DIMENSIONS
		///////////////////////////
		D.sD.sceneW=this.width; 
		D.sD.sceneH=this.height;
		
		///////////////
		// ADD ELEMENTS
		///////////////
		// BACKGROUND
		if(!$Scene.find('img.JAG_Background').length) $('<img src="'+src+'" class="JAG_Background"/>').appendTo($Scene);
				
		// FOREGROUND
		if(foreG){
			if(!$Scene.find('div.JAG_Foreground').length) $('<div class="JAG_Foreground" style="background:'+foreG+'"></div>').appendTo($Scene);
			JAG.OBJ.$foreground=$Scene.find('div.JAG_Foreground');
		};
		
		////////////
		// SUBTITLES
		////////////
		if(D.sD.subtitle && (!D.sD.beenHere || (D.sD.beenHere && D.sD.subtitle_repeat.isB()))) $Scene.subTitle(JAG, D, D.sD.subtitle);
		
		/////////////////////////////////////////
		// SETUP DISPLAY TIMER BEFORE PROGRESSING
		/////////////////////////////////////////
		if(!D.sD.map && D.sD.display_time.pF() > 0){
			var startTime=JAG.Story.currentTime;
			// CHECK GAME TIME
			JAG.Story.cutSceneTimer=setInterval(function(){					
				////////////////////////
				// ADVANCE TO NEXT SCENE
				////////////////////////
				if((JAG.Story.currentTime-startTime) >= D.sD.display_time.pF()){
					clearInterval(JAG.Story.cutSceneTimer);
					$Scene.transSceneOut(JAG, $Scene.next('li'), false);
				};
			},50);
		};
		
		////////////////////////////////////////////////////
		// LOAD ITEMS [ TYPICALLY EXITS FOR CUTSCENES/MAPS ]
		////////////////////////////////////////////////////
		$Scene.loadItems(JAG, D);
		
		//////////////////////
		// FULLSCREEN CUTSCENE
		//////////////////////
		$([$(JAG.OBJ.$currentChapter)[0], $Scene[0]]).css('height',D.sD.sceneH+'px');
		$([JAG.OBJ.$Panel[0], JAG.OBJ.$dBar[0]]).css('display',!D.sD.show_inv ? 'none' : 'block');
		
		//////////////////////////////////////////
		// TRANSITION CUTSCENE IN AND SETUP EVENTS
		//////////////////////////////////////////
		$Scene.transSceneIn(JAG).on('click',function(e){
			e.preventDefault(); 
			e.stopPropagation();

			// IF ON CREDITS SCENE CLICKING DOES A FLUSH RESTART
			if($Scene[0].id==='credits'){
				$(this).restartGame(JAG);
			}else{
				// ADVANCE TO NEXT SCENE IF PERMITTED
				if(!D.sD.map && D.sD.allow_click) $Scene.jumpToScene(JAG, D, D.sD.allow_click);
			};
		});
		
		////////////////////////
		// TEXT TO SKIP CUTSCENE
		////////////////////////
		if(D.sD.skip_to && D.sD.skip_text.split(',')[0].removeWS().isB()) $Scene.prepend('<p id="JAG_Scene_Skip">'+D.sD.skip_text.split(',')[1]+'</p>');
		
		////////////////
		// MAP CUTSCENES
		////////////////
		if(D.sD.map) $Scene.map_Scene(JAG);				
	})[0].src=src;	
	
	return $(this);	
},



/***********************************************************************************************/
// ROLL CREDITS - $Scene.rollCredits(JAG, D);
/***********************************************************************************************/
rollCredits:function(JAG, D){
	if((!D.sD.beenHere || (D.sD.repeat_credits && D.sD.beenHere)) && !JAG.OBJ.$currentScene.find('div.JAG_Credits').length){
		
		////////////////////////////////
		// BUILD AND INSERT CREDITS HTML		
		////////////////////////////////
		var credits=D.sD.roll_credits,
			numCredits=credits.length,
			creditsHTML='<div class="JAG_Credits"><ul>';
		for(var i=0; i<numCredits; i++) creditsHTML+='<li><span class="JAG_Credits_Title">'+credits[i][0].split(':')[0]+'</span><br/><span class="JAG_Credits_Names">'+credits[i][0].split(':')[1]+'</span></li>';
		JAG.OBJ.$currentScene.prepend(creditsHTML+='</ul></div>');
	};	

	var $credits=JAG.OBJ.$currentScene.find('div.JAG_Credits'),
		creditsH=$credits.outerHeight(true);
		
	// ROLL THE CREDITS
	$credits.css('display','block').stop(true,false).animate({'top':-creditsH+'px'},
		{duration:D.sD.credits_speed.pF(),queue:false,specialEasing:{top:'linear'}});	
}});