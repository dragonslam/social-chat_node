/**
DrawBoard 객체 정의
*/
function DrawBoard( oCanvas, oEventHandler ){

    // 생성자에서 canvas의 참조와 GraphicPen생성
    var This	= this;
    var canvas	= (oCanvas || {});
    var handler = (oEventHandler || {});
    
    // 그래픽 보드 시작 함수 
    this.initBoard = function(){
        canvas.addEventListener( "mousedown", onMouseDown_Canvas, false );
    }
    
    // 마우스 좌표를 브라우저에 따라 반환
    this.getMousePoint = function( e ){
        var x,y,e=e?e:event;
        if( e.layerX || e.layerY == 0 ){ // fireFox
        	x	= e.layerX;
        	y	= e.layerY;
        } else if( e.offsetX || e.offsetY == 0 ){ // opera
        	x	= e.offsetX;
        	y	= e.offsetY;
        }
        return {x:x, y:y};
    };
    
    // Canvas의 내용 모두 지우기.
    this.cleanCanvas = function() {
    	// context
	    var ctx = canvas.getContext('2d');
	    // 픽셀 정리
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	    // 컨텍스트 리셋
	    ctx.beginPath();
    };
    
    // 마우스 무브/업 이벤트 등록
    function registMouseInteraction(){
        window.removeEventListener( "mouseup", onMouseUp_Canvas, false );
        canvas.removeEventListener( "mousemove", onMouseMove_Canvas, false );
    }
    // 마우스 무브/업 이벤트 해지
    function clearMouseInteraction(){
        window.removeEventListener( "mouseup", onMouseUp_Canvas, false );
        canvas.removeEventListener( "mousemove", onMouseMove_Canvas, false );
    }
    
    // 마우스 이벤트 등록 및 pen의 위치를 마우스 좌표로 이동
    function onMouseDown_Canvas( e ){ 
        var point = This.getMousePoint( e );
        if (typeof handler.onDrowStart == "function") {
        	handler.onDrowStart(point);
        }
        canvas.addEventListener( "mousemove", onMouseMove_Canvas, false );
        window.addEventListener( "mouseup", onMouseUp_Canvas, false );
    }
    
    // 마우스 업시 등록한 마우스 이벤트 해지 
    function onMouseUp_Canvas( e ){
        window.removeEventListener( "mouseup", onMouseUp_Canvas, false );
        canvas.removeEventListener( "mousemove", onMouseMove_Canvas, false );
    }
    
    // pen에 draw요청
    function onMouseMove_Canvas( e ){
        var point = This.getMousePoint( e );
        if (typeof handler.onDrowing == "function") {
        	handler.onDrowing(point);
        }
    }
}
