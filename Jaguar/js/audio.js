/***********************************************************************************************/
// Jaguar - AUDIO MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD SCENE-SPECIFIC MUSIC - $Scene.loadMusic(JAG);
/***********************************************************************************************/
loadMusic:function(JAG){
	/////////////////////////////
	// RETRIEVE MAIN DATA [D] OBJ
	/////////////////////////////
	JAG.getDATA(JAG);	
	
	//////////////////
	// MUSIC VARIABLES
	//////////////////
	var $Scene=$(this),
		$Music=JAG.OBJ.$Music,
		$Ambient=JAG.OBJ.$Ambient;

	//////////////////
	// SCENE HAS MUSIC
	//////////////////
	if(D.sD.music){
		///////////
		// NEW SONG
		///////////
		if(D.sD.music !== JAG.Story.currentSong){
			JAG.Story.currentSong=D.sD.music;
			$Music[0].src='';
			$Music[0].src='Jaguar/audio/'+D.sD.music+'.mp3';

			//////////////////////////////////
			// WAIT FOR MP3 TO COMPLETELY LOAD
			//////////////////////////////////
			$Music.on('canplay',function(){
				////////////////////////////////////////////////////////////////////////
				// SETUP LOOPING, AFTER LOADED, LOAD THE SCENE [KEEPS CUTSCENES IN SYNC]
				// AVOID FIRING THE CANPLAYTHOUGH EVENT AGAIN WHEN LOOPING
				////////////////////////////////////////////////////////////////////////
				$Music.setVolume(D, D.sD.music_volume, D.sD.music_vol_speed)
					  .attr('loop',D.sD.loop_music ? true : false).off('canplay')[0].play();
				$Scene.loadScene(JAG);
			});

		///////////////////////////////
		// SAME MUSIC - JUST LOAD SCENE
		///////////////////////////////
		}else{
			$Music.setVolume(D, D.sD.music_volume, D.sD.music_vol_speed);
			$Scene.loadScene(JAG);			
		};
	
	///////////////////////////
	// SCENE DOESN'T HAVE MUSIC
	///////////////////////////
	}else{
		JAG.Story.currentSong=false;
		$Music[0].src='';
		$Scene.loadScene(JAG);	
	};
	
	
	

	//////////////////////////
	// SCENE HAS AMBIENT SOUND
	//////////////////////////
	if(D.sD.ambient){
		////////////////////
		// NEW AMBIENT SOUND
		////////////////////
		if(D.sD.ambient !== JAG.Story.currentAmbient){
			JAG.Story.currentAmbient=D.sD.ambient;
			//////////////////
			// LOOPING AND SRC
			//////////////////
			$Ambient.setVolume(D, D.sD.ambient_volume, D.sD.ambient_vol_speed)
     				.attr({'loop':D.sD.loop_ambient ? true : false,'src':'Jaguar/audio/'+D.sD.ambient+'.mp3'})[0].play();

		//////////////////////////////////////
		// SAME AMBIENT SONG - DIFFERENT SCENE
		//////////////////////////////////////
		}else{
			$Ambient.setVolume(D, D.sD.ambient_volume, D.sD.ambient_vol_speed);
		};
		
	///////////////////////////////////
	// SCENE DOESN'T HAVE AMBIENT SOUND
	///////////////////////////////////
	}else{
		JAG.Story.currentAmbient=false;
		$Ambient[0].src='';
	};
},


/***********************************************************************************************/
// ANIMATE OF SET THE VOLUME OF AUDIO - $Music.setVolume(D, toVolume, speed);
/***********************************************************************************************/
setVolume:function(D, toVolume, speed){
	// MUSIC, AMBIENT, ETC
	var $audio=$(this);
	
	if(speed > 0){
		var fromVol={property:$audio[0].volume.pF()},
			toVol={property:toVolume.pF()};
		$(fromVol).animate(toVol,{duration:speed.pF(),step:function(){
			$audio[0].volume=this.property;			
    	}});
	// NO ANIMATION
	}else{ 
		$audio[0].volume=toVolume.pF(); 
	};	
	return $(this);
},


/***********************************************************************************************/
// PLAY SOUND EFFECT
/***********************************************************************************************/
playSound:function(JAG, file){
	// ADD AUDIO ELEMENT
	var $Effect=JAG.OBJ.$Effect;
	$Effect[0].src='Jaguar/audio/'+file+'.mp3';
	$Effect[0].play();
}});