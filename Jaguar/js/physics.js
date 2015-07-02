/***********************************************************************************************/
// Jaguar - PHYSICS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// BOUNDARY DETECTION - $Char.inBounds(JAG, pos, cD);
/***********************************************************************************************/
inBounds:function(JAG, pos, cD){
	//////////////////
	// SETUP VARIABLES
	//////////////////
	var	$Char=$(this),
		CH=$Char.outerHeight(true),
		CW=$Char.outerWidth(true),
		X=Math.round(pos.left+(CW/2)),
		Y=Math.round(pos.top+CH),
		isWhite=(D.sD.pathData[(Y * D.sD.sceneW.pF() + X) * 4] > 200);

	///////////////////////////////////////
	// CHECK BOUNDARIES [WHITE = IN BOUNDS]
	//////////////////////////////////////
    if(isWhite){ 
		// SAVE LAST VALID POSITION [ALSO USED FOR SAVE/LOAD]
		cD.lastValidX=X; cD.lastValidY=Y;
    }else{
		// RETURN TO LAST VALID POSITION
		cD.walking=false; 
		
		// CHECK UNDEFINED [CIRCUMVENTS ERROR ON FIRST RUN]
		if(typeof cD.lastValidX != undefined || typeof cD.lastValidY != undefined){ 
			X=cD.lastValidX; 
			Y=cD.lastValidY; 
		};

		// STOP WALKING AND MOVE CHARACTER BACK IN BOUNDS
		$Char.stop(true,false).stopWalking(JAG, cD).css({top:Y-CH, left:X-(CW/2)});
		cD.currentX=Y-CH;
		cD.currentY=X-(CW/2);
	};

	return $(this);
},


/***********************************************************************************************/
// EXIT COLLISIONS - $obj1.collision(JAG, $sceneObjects);
/***********************************************************************************************/
collision:function(JAG, $objs){
	if(D.gD.switchingScenes || D.cD.action) return;
	
	///////////////////////////
	// SETUP REQUIRED VARIABLES
	///////////////////////////
    var $win=$(window),
		$obj1=$(this),
		OFF=$obj1.offset(),				
		x1=OFF.left+$win.scrollLeft(),	// CHARACTER LEFT
    	y1=OFF.top+$win.scrollTop(),	// CHARACTER TOP
    	h1=$obj1.outerHeight(),			// CHARACTER HEIGHT
    	w1=$obj1.outerWidth(),			// CHARACTER WIDTH
    	b1=y1+h1, 						// CHARACTER BOTTOM
		r1=x1+w1,						// CHARACTER RIGHT
		l=$objs.length;

	///////////////////////////////////////////////
	// LOOP SCENE ELEMENTS & DETECT EXIT COLLISIONS	
	///////////////////////////////////////////////
	for(var i=0; i<l; i++){
		// DETERMINE IF OBJ1 TOUCHES OBJ2
    	var $obj2=$($objs[i]),
			oD2=$obj2.data('item'),
			OFF2=$obj2.offset(),
			x2=OFF2.left+$win.scrollLeft(),	// OBJ LEFT
			y2=OFF2.top+$win.scrollTop(),	// OBJ TOP
    		h2=$obj2.outerHeight(),			// OBJ HEIGHT
			w2=$obj2.outerWidth(),			// OBJ WIDTH
			b2=y2+h2, 						// OBJ BOTTOM
			r2=x2+w2,						// OBJ RIGHT
			// CHAR BOTTOM < OBJ TOP  
			// CHAR TOP    > OBJ BOTTOM
			// CHAR RIGHT  < OBJ LEFT
			// CHAR LEFT   > OBJ RIGHT
			result=((r1 > x2 && x1 < r2) && (b1 > y2 && y1 < b2)) ? true : false;
	
		////////////
		// COLLISION
		////////////
		if(result){
			// OBJ2 IS NOT AN ITEM			
			if(!$obj2.hasClass('JAG_Item')) return;

			// OBJ2 IS AN EXIT ITEM THAT CAN BE COLLIDED WITH
			if(oD2.type==='exit' && oD2.exit_style.split(',')[0].removeWS().isB()){
				// STOP CHARACTER WALKING TO PREVENT MULTIPLE TRANSITIONS OUT
				JAG.OBJ.$Char.stop(true,false);
				$(JAG.OBJ.$currentScene).transSceneOut(JAG, $('#'+oD2.goto)[0], $obj2);
				break;				
			};
		};
	};
},


/***********************************************************************************************/
// MIDDLEGROUND ITEM LAYERING (TYPE=LAYER) - $Char.layerItem(JAG, $sceneItems, l); 
/***********************************************************************************************/
layerItem:function(JAG, $sceneItems, l){
	///////////////////////////////
	// LOOP THROUGH ALL SCENE ITEMS
	///////////////////////////////	
	for(var i=0; i<l; i++){
		// FIND MIDDLEGROUND ITEMS & AUX CHARACTERS
		var $El=$($sceneItems[i]),
			AuxChar=$El.hasClass('JAG_Aux_Char'),
			eD=AuxChar ? $El.data('character') : $El.data('item');

		///////////////////////////////////
		// ADJUST zINDEX [FRONT=6] [BACK=3]
		///////////////////////////////////
		if(eD!==undefined && eD.type==='layer' || AuxChar){
			var $Char=JAG.OBJ.$Char,
				Char_Height=$Char.outerHeight(),
				Char_MarginTop=$Char.css('margin-top').pF(),
				Char_Top=$Char.css('top').pF(),
				Char_Feet=Char_Top+Char_Height+Char_MarginTop,
				Char_Head=Char_Top+Char_MarginTop,
				
				// SPECS FOR LAYERING ELEMENT
				El_Height=$El.outerHeight(),
				El_MarginTop=$El.css('margin-top').pF(),
				El_TopPosition=$El.css('top').pF(),
				El_Bottom=AuxChar ? El_TopPosition + El_MarginTop + El_Height : El_TopPosition + El_Height,
				El_Top=AuxChar ? El_TopPosition + El_MarginTop : El_TopPosition;

			// IF ITEM IS SET TO LAYER
			if(eD.layer){
				// CHARACTER IN FRONT
				if(Char_Feet > El_Bottom){
					$El[0].style.zIndex=3;
				// CHARACTER IS BEHIND
				}else if(Char_Feet < El_Bottom){
					$El[0].style.zIndex=6;
				};
			// ALLOWS FOR PLACING SCENE ITEMS ON TOP OF
			// SCENE ITEMS THAT LAYER
			}else{
				$El[0].style.zIndex=7;
			};
		};
	};
	
	return $(this);
},



/***********************************************************************************************/
// CHARACTER PERSPECTIVE SCALING - $Char.scale(JAG, cD);
/***********************************************************************************************/
scale:function(JAG, cD){
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// SCALING VARIABLES [CAREFULL - MEMOIZATION IS NOT RELEASING SOME VARIABLES, DON'T MICROOPTIMIZE HERE
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	var $Char=$(this), //
		VH=D.gD.viewportH.pF(), 
		OffY=D.gD.offsetY.pF(), 
		From=Math.round(((D.sD.horizonLine.pF()/100)*VH)+OffY),
		To=Math.round(((D.sD.groundLine.pF()/100)*VH)+OffY),
		scaleTo=Math.abs((($Char.css('top').pF()+OffY-From)/(To-From))),
		scale=cD.scale.split(',');

	// CHECK MIN/MAX SCALING
	if(scaleTo < scale[0].pF() || scaleTo < 0) var scaleTo=scale[0].pF();
	if(scaleTo > scale[1].pF()) var scaleTo=scale[1].pF();

	var SW=(cD.CharW * scaleTo)+'px', 
		SH=(cD.CharH * scaleTo)+'px';	
		
	// IMPORTANT - OFFSET CHARACTER USING MARGINS DUE TO SCALING. 
	// REFERENCE POINT IS TOP/LEFT CORNER WHICH DOES NOT AFFECT POSITION WHEN WALKING AND SCALING
	// PAY ATTENTION TO OUTERWIDTH/OUTERHEIGHTS OF CHARACTER 
	$Char.css({width:SW, height:SH, 'margin-top':-SH.pF()+'px', 'margin-left':-(SW.pF()/2)+'px'}).find('img').attr({width:SW, height:SH});
	return $Char;
},


/***********************************************************************************************/
// RETURN DISTANCE BETWEEN 2 OBJECTS - $obj1.returnDist($obj2);
/***********************************************************************************************/
returnDist:function($obj2){
	// PYTHAGOREAN THEOREM USED TO MEASURE BETWEEN OBJECT CENTERPOINTS
	var $obj1=$(this).find('img'),
		AcD=$obj2.hasClass('JAG_Aux_Char') ? $obj2.data('character') : $obj2.data('item'),		
		obj1Data=$obj1[0].getBoundingClientRect(),
		obj1Left=obj1Data.left + obj1Data.width/2,
		obj1Top=obj1Data.top + obj1Data.height/2,
		obj2Data=$obj2[0].getBoundingClientRect(),
		obj2Left=obj2Data.left + obj2Data.width/2,
		obj2Top=obj2Data.top + obj2Data.height/2,
		distance=Math.sqrt(Math.pow(obj1Left-obj2Left,2) + Math.pow(obj1Top-obj2Top,2));
		
	return Diff={
		AcD:AcD,
		Left:obj1Left < obj2Left ? true : false,
		Higher:obj1Top < obj2Top ? true : false,
		X:obj2Left,
		Y:obj2Top,
		distance:distance
	};
}});