/***********************************************************************************************/
// Jaguar - BUILD ASSIST / DEBUG MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD DEBUG ASSIST TOOLS - $scene.debug(oD);
/***********************************************************************************************/
debug:function(JAG){
	// IF DEBUG WINDOW DOESN'T EXIST ADD IT
	if(!D.gD.showingDebug && !$('#JAG_Debug_Window').length){

		////////////////////////
		// SETUP BUILD VARIABLES
		////////////////////////
		var $win=$(window),
			showPath='<input type="checkbox" name="Show_Path" value="0"> Show Path <br/>',
			charLines='<input type="checkbox" name="Char_Lines" value="0"> Show Character Boundaries <br/>',
			itemLines='<input type="checkbox" name="Item_Lines" value="0"> Show Item Outlines <br/>',
			horizonLine='<input type="checkbox" name="horizon_Line" value="0"> Show Horizon and Ground Lines <br/>',
			hideFG='<input type="checkbox" name="hide_FG" value="0"> Hide Foreground <br/>',
			showClip='<input type="checkbox" name="show_Clip" value="0"> Show Clipping on Panning Scenes <br/>',
			itemOpacity='<input type="checkbox" name="opacity" value="1"> Hide Scene Items<br/>',
			jumpToScene='<div style="float:left;width:450px;">Jump to Scene [ID] <input type="text" name="jumpTo"><div id="JAG_jumpToScene">GO</div></div>';

		///////////////////////////
		// ADD DEBUG WINDOW TO PAGE
		///////////////////////////
		$('<div id="JAG_Debug_Window">\
			<h2>Jaguar Console - Experience:\
			<span id="JAG_EXP">'+D.gD.experience+'</span> - Scene: \
			<span id="JAG_Debug_currentScene">'+JAG.OBJ.$currentScene.attr('id')+'</span></h2>\
			<br/>'+showPath+charLines+itemLines+horizonLine+hideFG+showClip+itemOpacity+jumpToScene+'</div>')
		.insertBefore(JAG.OBJ.$Game);
	
		JAG.OBJ.$Debug=$('#JAG_Debug_Window'); 
		JAG.OBJ.$EXP=$('#JAG_EXP');
		
		///////////////////////////////////////////////////////////////////
		// POSITION THE DEBUG WINDOW, SETUP DEBUG EVENTS AND MAKE DRAGGABLE
		///////////////////////////////////////////////////////////////////
		var DebugW=JAG.OBJ.$Debug.outerWidth(), 
			DebugH=JAG.OBJ.$Debug.outerHeight();
		JAG.OBJ.$Debug.dragDebug()
			.css({left:(D.gD.viewportW/2)+$win.scrollLeft()-(DebugW/2)+'px', 
			top:(D.gD.viewportH/2) + $win.scrollTop()-(DebugH/2)+'px'})
			.find('input[name="Show_Path"]').on('change',function(){ $(this).debugPath(JAG); }).end()
			.find('input[name="Item_Lines"]').on('change',function(){ $(this).debugItemLines(JAG); }).end()
			.find('input[name="hide_FG"]').on('change',function(){ $(this).debugForeground(JAG); }).end()
			.find('input[name="horizon_Line"]').on('change',function(){ $(this).debugHorizon(JAG, D); }).end()
			.find('input[name="Char_Lines"]').on('change',function(){ $(this).debugCharLines(JAG); }).end()
			.find('input[name="show_Clip"]').on('change',function(){ $(this).debugSceneClipping(JAG, D); }).end()
			.find('input[name="opacity"]').on('change',function(){ $(this).debugOpacity(JAG); }).end()		
			.find('input[name="jumpTo"]').on('keypress',function(e){ 
				var code=e.keyCode||e.which; 
				if(code===13) $(this).jumpToScene(JAG, D, JAG.OBJ.$Debug.find('input[name="jumpTo"]').val()); 
			});

		// JUMP TO SCENE
		$('#JAG_jumpToScene').on('click',function(){ $(this).jumpToScene(JAG, D, JAG.OBJ.$Debug.find('input[name="jumpTo"]').val()); });
	};

	// SHOW/HIDE DEBUG WINDOW	
	JAG.OBJ.$Debug[0].style.display=D.gD.showingDebug ? 'none' : 'block';
	D.gD.showingDebug=D.gD.showingDebug ? false : true;
	return $(this);
},




/***********************************************************************************************/
// DEBUG - HORIZON LINES
/***********************************************************************************************/
debugHorizon:function(JAG, D){
	var $Chap=JAG.OBJ.$currentChapter;		

	// DEBUGGING HORIZON AND FOREGROUND LINES
	if($(this)[0].checked){			
		var HOR=D.sD.horizon.split(','),
			HLTop=((HOR[0].pF()/100) * D.gD.viewportH.pF()),
			FLTop=((HOR[1].pF()/100) * D.gD.viewportH.pF());

		// ADD LINES IF THEY DON'T EXIST
		if(!$Chap.find('div.JAG_horizonLine').length) $('<div class="JAG_horizonLine"><div class="JAG_Circle"/></div><div class="JAG_GroundLine"><div class="JAG_Circle"/></div></div>').prependTo($Chap);

		// STYLE LINES
		$Chap.find('div.JAG_horizonLine').css({width:D.gD.viewportW+'px', left:'0px', top:HLTop+'px'})
			.end().find('div.JAG_GroundLine').css({width:D.gD.viewportW+'px', left:'0px', top:FLTop+'px'});
	}else{
		// REMOVE LINES
		if($Chap.find('div.JAG_horizonLine').length){ 
			$Chap.find('div.JAG_horizonLine').add($Chap.find('div.JAG_GroundLine')).remove(); };
	};
},




/***********************************************************************************************/
// DEBUG - FOREGROUND SHOW/HIDE
/***********************************************************************************************/
debugForeground:function(JAG){
	if(JAG.OBJ.$foreground) JAG.OBJ.$foreground[0].style.display=$(this)[0].checked ? 'none' : 'block';
},


/***********************************************************************************************/
// DEBUG - PATH SHOW/HIDE
/***********************************************************************************************/
debugPath:function(JAG){
	JAG.OBJ.$canvas.style.display=$(this)[0].checked ? 'block' : 'none';	
},


/***********************************************************************************************/
// DEBUG - ITEM BOUNDARY LINES
/***********************************************************************************************/
debugItemLines:function(JAG){
	if($(this)[0].checked){ 
		JAG.OBJ.$currentScene.find('div.JAG_Item').addClass('JAG_itemLines');
	}else{ 
		JAG.OBJ.$currentScene.find('div.JAG_Item').removeClass('JAG_itemLines'); 
	};
},


/***********************************************************************************************/
// DEBUG - CHARACTER BOUNDARY LINES
/***********************************************************************************************/
debugCharLines:function(JAG){
	var $Scene=JAG.OBJ.$currentScene,
		$Char=JAG.OBJ.$Char;
	if($Scene.find('div.JAG_Char').length){	
		if($(this)[0].checked){ 
			$Char.addClass('JAG_charLines');
			if(!$Char.find('.JAG_charSpot').length) $Char.append('<div class="JAG_charSpot"/>');	
		}else{
			$Char.removeClass('JAG_charLines').find('div.JAG_charSpot').remove();
		};
	};
},


/***********************************************************************************************/
// DEBUG - SCENE PANNING (SHOW CLIPPING)
/***********************************************************************************************/
debugSceneClipping:function(JAG, D){
	var $Chap=JAG.OBJ.$currentChapter;
	if($(this)[0].checked && D.sD.pan){
		// ADD MIDLINE
		if(!$Chap.find('div.JAG_midLine').length) $('<div class="JAG_midLine"/>').prependTo($Chap);
		
		// SHOW CLIPPING + STYLE MIDLINE
		$Chap.css('overflow','visible').find('div.JAG_midLine').css({height:D.gD.viewportH+'px', left:(D.gD.viewportW/2)+'px', top:'0px'});
	}else{
		// REMOVE MIDLINE AND HIDE CLIPPING
		$Chap.css('overflow','hidden').find('div.JAG_midLine').remove();
	};			
},


/***********************************************************************************************/
// DEBUG - TOGGLE ITEM VISIBILITY (HELPS WITH POSITIONING ITEMS)
/***********************************************************************************************/
debugOpacity:function(JAG){
	JAG.OBJ.$currentChapter.find('div.JAG_Item').css('opacity',$(this)[0].checked ? 0 : 1);
},


/***********************************************************************************************/
// DEBUG - JUMP TO SCENE
/***********************************************************************************************/
jumpToScene:function(JAG, D, $goto){
	// RETURN IF SCENE VALUE LENGTH IS TOO SMALL OR EMPTY
	if(!$goto.length || $goto==undefined || D.gD.switchingScenes){ 
		if($(JAG.OBJ.$Debug).is(':visible')) alert("Invalid Scene"); 
		return; 
	};
	
	// CHECK IF SCENE EXISTS
	if(!$('#'+$goto.removeWS()).length){ alert("Scene does not exist"); return; };

	// TRANSITION TO NEXT SCENE
	$(JAG.OBJ.$currentScene).transSceneOut(JAG, $('#'+$goto.removeWS())[0], false);
}});


/***********************************************************************************************/
// DRAG FUNCTIONALITY FOR DEBUG WINDOW
/***********************************************************************************************/
(function($) {
    $.fn.dragDebug=function(opt){
        opt=$.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle===""){ var $el=this;
        }else{ var $el=this.find(opt.handle); };

        return $el.css('cursor', opt.cursor).on("mousedown", function(e){
			// ALLOW TYPING IN TEXT FIELD
			if(e.target===$('#JAG_Debug_Window').find('input[name=jumpTo]')[0]) return;

            if(opt.handle===""){
                var $drag=$(this).addClass('draggable');
            }else{
                var $drag=$(this).addClass('active-handle').parent().addClass('draggable');
            };
			
            var z_idx=$drag.css('z-index'),
                drg_h=$drag.outerHeight(),
                drg_w=$drag.outerWidth(),
                pos_y=$drag.offset().top+drg_h-e.pageY,
                pos_x=$drag.offset().left+drg_w-e.pageX;
				
            $drag.css('z-index', 1000).parents().on("mousemove", function(e){
                $('.draggable').offset({
                    top:e.pageY+pos_y-drg_h,
                    left:e.pageX+pos_x-drg_w

                }).on("mouseup", function(){
					$(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); 
			
        }).on("mouseup", function(){
            if(opt.handle===""){ $(this).removeClass('draggable');
            }else{ $(this).removeClass('active-handle').parent().removeClass('draggable'); };
        });
    };
})(jQuery);