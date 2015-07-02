/***********************************************************************************************/
// Jaguar - DIALOGUE TEXT MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// POSITION AND SHOW SPEECH TEXT  $item.saySomething(JAG, $Char, speech, question_to_trigger_onstart);
/***********************************************************************************************/
saySomething:function(JAG, $Char, speech, currentScene, startQuestion){
	if(speech === undefined) return;

	///////////////////
	// SPEECH VARIABLES
	///////////////////
	var $Item=$(this), 
		cD=$Char.data('character'),
		$CharImg=$Char.find('img'),
		totalQuestions=speech.length;

	///////////////////////////////////////////
	// MAKE SURE ALL PREVIOUS TEXT IS DONE-DONE
	///////////////////////////////////////////
	if(!$Char.next('p.JAG_Char_Dialogue').length) $('<p class="JAG_Char_Dialogue"/>').insertAfter($Char);
	var $Text=$Char.next('p.JAG_Char_Dialogue');
	$Text.html('');

	////////////////////
	// FULL CONVERSATION
	////////////////////
	if($.isArray(speech) && speech[0]!==undefined){

		/////////////////////
		// ADD DIALOGUE PANEL
		/////////////////////
		if(!$('#JAG_dialogue').length) $('<div id="JAG_dialogue"/>').insertBefore($('#JAG_Panel'));
		var $DiagPanel=$('#JAG_dialogue'), questions='';

		///////////////////////////////////////////////////////////////////////
		// INSERT QUESTIONS: speech[question block][question || answer][string]
		///////////////////////////////////////////////////////////////////////
		for(var i=0; i<totalQuestions; i++) questions+='<div class="JAG_question">'+speech[i][0][0].split('||')[0]+'</div>'; 
		$DiagPanel.html(questions);
		
		///////////////////////////////////////////////////////////////
		// ANIMATE QUESTIONS INTO VIEW IF NOT AUTO-PLAYING CONVERSATION
		///////////////////////////////////////////////////////////////
		if(!cD.conversation) $DiagPanel.css('display','block').stop(true,false).animate({opacity:1},{duration:500,queue:false})
		
		////////////////////////
		// SETUP QUESTION EVENTS
		////////////////////////
		$DiagPanel.find('div.JAG_question').on('click',function(){
			var $allText=JAG.OBJ.$currentScene.find('p.JAG_Char_Dialogue');
			// RETURN IF SOMEONE IS ALREADY TALKING			
			for(var i=0; i<$allText.length; i++){ if($($allText[i]).css('opacity').pF()>0) return; };
	
			// START CONVERSATION
			JAG.OBJ.$Char.converse(JAG, $Item, $(this), speech);
		});
		
		///////////////////////////////////////////////
		// AUTO-INITIATE CONVERSATION BY QUESTION INDEX
		///////////////////////////////////////////////
		if(startQuestion!==false) $DiagPanel.find('div.JAG_question').eq(startQuestion.pF()).click();

	///////////////////////////////////////////
	// SINGLE LINE RESPONSE FROM MAIN CHARACTER
	///////////////////////////////////////////
	}else{
		//////////////////////////////////////////////////
		// DIALOGUE WITH THIS CHARACTER HAS BEEN EXHAUSTED
		//////////////////////////////////////////////////		
		if($.isArray(speech)) var speech=JAG.Speech.talk_no_more;
		D.sD.talking=true;
		D.cD.conversation=false;
				
		// MULTIPLE SENTENCES (LINES) WITHIN A SINGLE SPEECH VALUE
		// ARE SEPARATED USING THE || CHARACTER
		var multiLines=speech.indexOf('||') ? true : false,
			text=multiLines ? speech.split('||')[0] : speech;
			
		// SWITCH TO TALKING SPRITE
		if(!D.cD.walking) $Char.switchSprite(JAG, cD, 'talk');

		//////////////////////////////////
		// STYLE, INSERT AND POSITION TEXT
		//////////////////////////////////
		$Text.css({color:cD.text_color, display:'block', opacity:1}).html(text).textDims(JAG, $Char, cD);
			
		//////////////////////////////
		// SETUP ACCURATE SPEECH TIMER
		//////////////////////////////		
		var startTime=JAG.Story.currentTime,
			displayTime=Math.max(text.length * D.sD.text_time.pF(), 1500);

		JAG.Story.TalkTimer=setInterval(function(){
			var currentTime=JAG.Story.currentTime,
				elapsed=currentTime-startTime;

			if(elapsed >= displayTime){
				clearInterval(JAG.Story.TalkTimer);
				
				////////////
				// HIDE TEXT
				////////////
				$Text.stop(true,false).animate({opacity:0},{duration:500, queue:true, complete:function(){
					D.sD.talking=false;
					$Text[0].style.display='none';
					
					// SWITCH BACK TO STOPPED SPRITE
					if(!D.cD.walking) $Char.switchSprite(JAG, cD, 'stopping');
					
					// IF CHARACTER HAS MULTIPLE LINES, 
					// REMOVE LINE THAT WAS JUST SAID AND CONTINUE
					if(multiLines){
						var newSpeech=speech.split('||');
							newSpeech.shift(); // REMOVE FIRST TEXT
							
						for(var i=0, l=newSpeech.length; i<l; i++){
							// REMOVE WHITESPACE AT BEGINNING OF TEXT AND TRAILING COMMAS
							newSpeech[i]=newSpeech[i].replace(/^\s+|\s+$/g,'');
							// ADD || AS A SEPARATOR ON ALL EXCEPT LAST TEXT
							if(i!==newSpeech.length-1) newSpeech[i]+=' ||';
						};

						// MERGE THE ARRAY WITHOUT ANY CHARACTERS
						var nextLine=newSpeech.join(' ');

						// CONTINUE WITH NEXT LINE
						if(nextLine && currentScene===JAG.OBJ.$currentScene){
							$Char.saySomething(JAG, $Char, nextLine, JAG.OBJ.$currentScene);
						}else{
							$Text.css({display:'none', opacity:0});
							D.sD.talking=false;
						};
					};
				}});
			};
		},50);
	};
},


/***********************************************************************************************/
// CONVERSATIONS - $Char.converse(JAG, $AuxChar, $question, speed);
/***********************************************************************************************/
converse:function(JAG, $AuxChar, $question, speech){
	D.sD.talking=true;
	
	/////////////////////////
	// CONVERSATION VARIABLES
	/////////////////////////
	var $Char=$(this),
		$CharImg=$Char.find('img'),
		cD=$Char.data('character'),
		$DiagPanel=$('#JAG_dialogue'),
		$Text=$Char.next('p.JAG_Char_Dialogue'),
		AcD=$AuxChar.data('character'),
		$AuxText=$AuxChar.next('p.JAG_Char_Dialogue'),
		question=$question.text().split('||')[0],
		textTime=D.sD.text_time.pF(),
		// INDEX OF QUESTION CLICKED
		Q_Index=$question.index();

	///////////////////////////
	// SWITCH TO TALK_TO SPRITE
	///////////////////////////
	$Char.switchSprite(JAG, cD, 'talk');

	/////////////////////////////////////////////////////////////////////////////
	// POSE QUESTION - POSITION TEXT [MAKE SURE IN VIEWPORT] & SET TALKING SPRITE
	/////////////////////////////////////////////////////////////////////////////
	$Text.css({color:cD.text_color, display:'block', opacity:1}).html(question).textDims(JAG, $Char, cD)

	//////////////////////////////////////////////
	// FADEOUT QUESTION - HIDE TEXT & STOP TALKING
	//////////////////////////////////////////////
	.delay(Math.max(question.length.pF() * textTime, 1500)).animate({opacity:0},{duration:500, queue:true, complete:function(){		
		// HIDE TEXT
		D.sD.talking=false;
		$Text[0].style.display='none';

		// SWITCH BACK TO STOPPED SPRITE
		if(!D.cD.walking) $Char.switchSprite(JAG, cD, 'stopping');

		//////////////////////
		// FOLLOW-UP QUESTIONS
		//////////////////////	
		var relatedQs=AcD.talk_to_text[Q_Index],
			numQs=relatedQs.length;
			
		// LOOP FOLLOW-UP QUESTIONS
		for(var i=0; i<numQs; i++){
			var response=AcD.talk_to_text[Q_Index][i][0].split('||')[1];

			// UPDATE QUESTION - POSITION WITHIN VIEWPORT
			$AuxText.css({color:AcD.text_color, display:'block', opacity:1}).html(response).textDims(JAG, $AuxChar, AcD);
			
			// SWITCH TO TALKING SPRITE
			D.sD.talking=true;			
			$AuxChar.switchSprite(JAG, AcD, 'talk');

			var timeToShowResponse=Math.max(response.length*textTime, 1500);

			// UPDATE OR REMOVE QUESTION
			if(i!==numQs-1){
				$question.html(AcD.talk_to_text[Q_Index][i+1][0].split('||')[0]); 
			}else{
				// NO MORE FOLLOW-UP QUESTIONS
				$question.remove();
			};

			// REMOVE FOLLOW-UP QUESTION FROM ARRAY
		    AcD.talk_to_text[Q_Index].splice(i, 1);

			// REMOVE WRAPPER ARRAY IF NO MORE FOLLOW-UP QUESTIONS
			if(AcD.talk_to_text[Q_Index].length===0) AcD.talk_to_text.splice(Q_Index, 1);
			break;
		};
		
		///////////////////////////////
		// STOP TALKING - AUX CHARACTER
		///////////////////////////////
		$AuxText.stop(true,false).delay(timeToShowResponse).animate({opacity:0},{duration:500, queue:true, complete:function(){
			D.sD.talking=false;
			$AuxText[0].style.display='none';
			
			// SWITCH TO STOPPED SPRITE
			$AuxChar.switchSprite(JAG, AcD, 'stopping');

			////////////////////
			// NO QUESTIONS LEFT
			////////////////////
			if(!$DiagPanel.find('div.JAG_question').length){
				// CLOSE DIALOG PANEL AND PERFORM ANY SECONDARY ACTIONS
				$DiagPanel.closeDiag(JAG);
				cD.conversation=false;				
				if(AcD.done_talking) $AuxChar.actionLoop(JAG, AcD.done_talking, 'done_talking');

			////////////////////
			// PLAY-CONVERSATION
			////////////////////
			}else if(AcD.play_conversation.isB()){				
				$DiagPanel.find('div.JAG_question').eq(0).click();
			};
		}});
	}});
},


/***********************************************************************************************/
// POSITIONS TEXT WITHIN VIEWPORT AND CENTERED OVER CHARACTER
/***********************************************************************************************/
textDims:function(JAG, $Char, cD){
	/////////////////
	// TEXT VARIABLES
	/////////////////
	var	$Text=$(this),
		txtW=$Text.outerWidth(true), 
		txtH=$Text.outerHeight(true),
		H=$Char.outerHeight(),
		left=$Char.css('left').pF(),
		top=$Char.css('top').pF(),
		mT=$Char.css('margin-top').pF(),
		vW=D.sD.sceneW.pF(),
		vH=D.gD.viewportH.pF(),
		buffer=50;
		
	//////////////////////////////////////////////////////
	// ADJUST WIDTH OF TEXT IF LARGER THAN 70% OF VIEWPORT
	//////////////////////////////////////////////////////
	if(txtW > vW*.7){
		$Text[0].style.width=vW*.7;
		var txtW=vW*.7, txtH=$Text.outerHeight(true);
	};
	
	/////////////
	// TOP / LEFT
	/////////////
	var Qtop=Math.max(top + mT - txtH - 20, buffer),
		Qleft=Math.max(left - (txtW/2), buffer);
	
	/////////////////
	// BOTTOM / RIGHT
	/////////////////
	if(Qtop > (vH-txtH-buffer)) var Qtop=vH-txtH-buffer;
	if(Qleft > (vW-txtW-buffer)) var Qleft=vW-txtW-buffer;
	
	////////////////
	// POSITION TEXT
	////////////////	
	$Text.css({top:Qtop+'px', left:Qleft+'px'});
	
	return $Text;
},


/***********************************************************************************************/
// CLOSE DIALOG PANEL - $DiagPanel.closeDiag(JAG);
/***********************************************************************************************/
closeDiag:function(JAG){
	var $DiagPanel=$(this);
	$DiagPanel.stop(true,false).animate({opacity:0},{duration:500,queue:false,complete:function(){
		D.sD.talking=false;
		$DiagPanel[0].style.display='none';
	}});			
}});