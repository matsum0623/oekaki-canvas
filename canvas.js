(function () {
    
    /* 定数設定 ***************************************************************/
    const _styleCanvasWidth = 1200;
    const _styleCanvasHeight = _styleCanvasWidth*9/16;
    const _styleBorder1pxSolid = "1px solid";
    const _stylePadding20px = "20px";
    
    const _TAGNAME_CANVAS = "canvas";
    
    const _ID_CANVAS_DIV = "OekakiCanvas";
    const _ID_CANVAS = "myCanvas";

    const _ID_PEN_STYLE = "penStyle";
    const _ID_PEN_THICK = "penThick";
    const _ID_PEN_COLOR = "penColor";
    const _ID_MOUSE_DOWN = "hiddenMouseDown";
    const _ID_MOUSE_IN = "hiddenMouseIn";
    const _ID_BACK_NUM = "backNum";

    const _ID_HIDDEN_PENX = "penX";
    const _ID_HIDDEN_PENY = "penY";

    const _PENSTYLE_ERASER = "eraser";
    
    const _CURSOR_STYLE_AUTO = "auto";
    const _CURSOR_STYLE_DEFAULT = "default";

    const _MESSAGE_CLEAR = "クリアします。よろしいですか？";

    const _eraserColor = "#ffffff";
    const _VALUE_ON = "on";
    const _VALUE_OFF = "off";
    
    /* グローバル変数 *********************************************************/
    let imageData = [];
    
    let ctx = null;
    
    let canvasElement = null;
    
    
    window.onload = function() {
        if(_getElementById(_ID_CANVAS_DIV) != null){
            init();
        }
    };
        
    function init(){
        const canvasDiv = _getElementById(_ID_CANVAS_DIV);
        canvasDiv.style.padding = _stylePadding20px;
        
        // メインキャンバスの作成
        canvasElement = 
            _createElement(
                _TAGNAME_CANVAS,
                {id : _ID_CANVAS},
                {border : _styleBorder1pxSolid},
                ""
            );
    	canvasElement.width = _styleCanvasWidth;
    	canvasElement.height = _styleCanvasHeight;
        canvasDiv.appendChild(canvasElement);
    	
    	// 制御パネルをCANVASに追加
    	canvasDiv.appendChild(createControlPanel());

    	// 非表示データ領域の作成
    	canvasDiv.appendChild(createHiddenArea());
    	
    	// コンテキストの取得
    	ctx = _getContext();

    	// マウス動作の追加
    	canvasElement.addEventListener("mousedown", mousedown);
    	canvasElement.addEventListener("mousemove", mousemove);
    	canvasElement.addEventListener("mouseup",   mouseup);
    	canvasElement.addEventListener("mouseout",  mouseout);
    }
    
    /* マウス動作処理 *********************************************************/
    /**
     * マウス押下時処理
     */
    function mousedown(e){
        // 左クリック以外では描画しない
        if(e.which != 1){
            return;
        }
    	let coor = getCoordinate(canvasElement, e);
    
        const penStyle = _getValueFromId(_ID_PEN_STYLE);

        _drawCircle(
            coor.x,
            coor.y,
            _getValueFromId(_ID_PEN_THICK)/2,
            penStyle == _PENSTYLE_ERASER ? _eraserColor : _getValueFromId(_ID_PEN_COLOR)
        );
    
        _setValueFromId(_ID_MOUSE_DOWN,_VALUE_ON);
        _setHiddenPenCoordinate(coor.x,coor.y);
    }

    /**
     * 描画
     */
    function mousemove(e){
        // click状態で描画範囲に入ってきた場合の処理
        if(_getValueFromId(_ID_MOUSE_IN) == _VALUE_OFF && e.which == 1){
            _setValueFromId(_ID_MOUSE_DOWN,_VALUE_ON); 
            const coor = getCoordinate(_getElementById(_ID_CANVAS), e);
            _setHiddenPenCoordinate(coor.x,coor.y);
            _setValueFromId(_ID_MOUSE_IN,_VALUE_ON);
        }else if(_getValueFromId(_ID_MOUSE_IN) == _VALUE_OFF && e.which != 1){
            _setValueFromId(_ID_MOUSE_DOWN,_VALUE_OFF); 
            _setValueFromId(_ID_MOUSE_IN,_VALUE_ON);
        }
        if(_getValueFromId(_ID_MOUSE_DOWN) != _VALUE_ON){
            return;
        }
        _setCursor(_CURSOR_STYLE_DEFAULT);

    	let coor = getCoordinate(canvasElement, e);
    
        ctx.beginPath();
        ctx.lineWidth = _getValueFromId(_ID_PEN_THICK);
        ctx.strokeStyle = _getValueFromId(_ID_PEN_STYLE) == _PENSTYLE_ERASER ? _eraserColor : _getValueFromId(_ID_PEN_COLOR);
        ctx.moveTo(_getHiddenGetCoordinate().x,_getHiddenGetCoordinate().y);
        ctx.lineTo(coor.x,coor.y);
        ctx.closePath();
        ctx.stroke();
        _setHiddenPenCoordinate(coor.x,coor.y);
    }
    
    /**
     * マウスクリックを挙げた時の処理
     */
    function mouseup(e){
        _setValueFromId(_ID_MOUSE_DOWN,_VALUE_OFF);
        _setCursor(_CURSOR_STYLE_AUTO);
        saveCanvas();
    }
    
    /**
     * マウスが範囲外に出た時の処理
     */ 
    function mouseout(e){
        _setValueFromId(_ID_MOUSE_IN,_VALUE_OFF);
        _setCursor(_CURSOR_STYLE_AUTO);
    }

    /**
     * 現在位置の取得
     */
    function getCoordinate(element, event){
        return {
            x:event.clientX - element.offsetLeft + window.pageXOffset,
            y:event.clientY - element.offsetTop  + window.pageYOffset
        };
    }
    
    
    /**************************************************************************/
    /**
     * キャンバスの印刷
     */
    function printCanvas(){
        let printFrame = _getElementById('printFrame');
        if(printFrame == null){
            const iframeElement =
                    _createElement(
                        "iframe",
                        {id:"printFrame"},
                        {visibility:"hidden",width:"1px",height:"1px"},
                        ""
                    );
            document.body.appendChild(iframeElement);
            const imgElement = _createElement("img",{},{},"");
            imgElement.setAttribute("id","printImg");
            iframeElement.contentWindow.document.body.appendChild(imgElement);
            printFrame = iframeElement;
        }
        const iframeWindow = printFrame.contentWindow;
        iframeWindow.document.getElementById('printImg').src =
            canvasElement.toDataURL();
        iframeWindow.print();
    }
    
    /**
     * キャンバスのクリア
     */
    function clearCanvas(){
        if(window.confirm(_MESSAGE_CLEAR)){
        	_clearCanvas();
        }
    }
    
    /* 各コントロール作成 *****************************************************/
    /**
     * コントロールパネルの作成
     */
    function createControlPanel(){
    	// 制御パネルの作成
    	const controlPanel = _createElement("div",{},{},"");
    	
    	// カラーピッカーの作成
        controlPanel.appendChild(createColorPicker());
    	
    	// 描画ブラシ設定パネルの作成
    	controlPanel.appendChild(createPenControl());
    	
    	// 印刷等のコントロールの作成
    	controlPanel.appendChild(createControl());
    	
        return controlPanel;
    }
    
    
    /**
     * カラーピッカーの作成
     */
    function createColorPicker(){
        const colorPicker = 
            _createElement(
                "div",
                {id:"colorPicker"},
                {display:"inline-block",padding:"5px",margin:"0 auto"},
                "色選択："
            );

    	colorPicker.appendChild(
    	        _createElement(
    	            "input",
    	            {type:"color",id:_ID_PEN_COLOR,value:"#000000"},
    	            {},
    	            ""
	            ));
    	return colorPicker;
    }
    
    /**
     * ペンコントロールの作成
     */
    function createPenControl(){
        const penControl = 
            _createElement(
                "div",
                {id:"penControl"},
                {display:"inline-block",padding:"5px",margin:"0 auto"},
                ""
            );

        // ペンの種類コントロールの作成
        penControl.appendChild(createPenStyleControl());

        // ペンの太さコントロールの作成
        penControl.appendChild(createPenThickControl());
        
        
        
        return penControl;
    }
    
    function createPenStyleControl(){
        // ペンの種類変更コントロールの作成
        const penStyleDiv = 
            _createElement(
                "div",
                {id:"penThickDiv"},
                {display:"inline-block",padding:"5px"},
                ""
            );

        const penStyleLabel = _createElement("label",{},{},"ペンの種類：");
        penStyleDiv.appendChild(penStyleLabel);
        
        const penStyle = 
            _createElement(
                "select",
                {id:_ID_PEN_STYLE},
                {width:"100px"},
                ""
            );

        const penStylePen = 
            _createElement(
                "option",
                {value:"pen"},
                {},
                "通常"
            );
        penStyle.appendChild(penStylePen);
        
        const penStyleEraser = 
            _createElement(
                "option",
                {value:_PENSTYLE_ERASER},
                {},
                "消しゴム"
            );
        penStyle.appendChild(penStyleEraser);
        
        penStyleDiv.appendChild(penStyle);
        return penStyleDiv;
    }
    
    
    function createPenThickControl(){
        // ペンの太さ変更コントロールの作成
        const penThickDiv = _createElement("div",{id:"penThickDiv"},{
                "padding" : "5px",
                "display" : "inline-block"
            });

        const penThickLabel = _createElement("lebel",{},{},"ペンの太さ：");
        penThickDiv.appendChild(penThickLabel);
        
        const penThick = _createElement("select",{id:_ID_PEN_THICK},{width:"100px"});

        const penThinest = _createElement("option",{value:"1"},{},"極細");
        penThick.appendChild(penThinest);

        const penThin = _createElement("option",{value:"3"},{},"細い");
        penThick.appendChild(penThin);
        
        const penBig = _createElement("option",{value:"5"},{},"太い");
        penThick.appendChild(penBig);
        
        const penBigest = _createElement("option",{value:"7"},{},"極太");
        penThick.appendChild(penBigest);
        
        
        penThickDiv.appendChild(penThick);
        return penThickDiv;
    }
    
    /**
     * 印刷設定等のコントロールの作成
     */
    function createControl(){
        const control = _createElement("div",{},{
                "padding" : "5px",
                "margin"  : "0 auto",
                "display" : "inline-block"
            });

        const clearButton = _createElement("input",{
                            "type":"button",
                            "id":"clearButton",
                            "value":"clear"
                        },{});
        clearButton.addEventListener("mousedown",clearCanvas);
        control.appendChild(clearButton);

        const printButton = _createElement("input",{
                            "type":"button",
                            "id":"printButton",
                            "value":"print"
                        },{});
        printButton.addEventListener("mousedown",printCanvas);
        control.appendChild(printButton);
        
        const backButton = _createElement("input",{
                            "type":"button",
                            "id":"backButton",
                            "value":"back"
                        },{});
        backButton.addEventListener("mousedown",restoreCanvas);
        control.appendChild(backButton);
        
        
        return control;
    }
    
    /**
     * 隠し要素の作成
     */
    function createHiddenArea(){
        const hiddenArea = _createElement("div",{},{},"");
        
        // 描画位置X
        const penX = _createElement("input",{
                            "type"  :"hidden",
                            "id"    :"penX",
                            "value" :""
                        },{});
        hiddenArea.appendChild(penX);

        // 描画位置Y
        const penY = _createElement("input",{
                            "type":"hidden",
                            "id":"penY",
                            "value":""
                        },{});
        hiddenArea.appendChild(penY);

        // マウス押下判断
        const mouseDown = _createElement("input",{
                            "type":"hidden",
                            "id":_ID_MOUSE_DOWN,
                            "value":_VALUE_OFF
                        },{});
        hiddenArea.appendChild(mouseDown);

        // マウス描画内判断
        const mouseIn = _createElement("input",{
                            "type":"hidden",
                            "id":_ID_MOUSE_IN,
                            "value":_VALUE_OFF
                        },{});
        hiddenArea.appendChild(mouseIn);
        
        // イメージデータ保存
        const backNum = _createElement("input",{
                            "type":"hidden",
                            "id":"backNum",
                            "value":"0"
                        },{});
        hiddenArea.appendChild(backNum);

        return hiddenArea;
    }
    
    /**
     * キャンバスの保存
     */
    function saveCanvas(){
        const backNum = parseInt(_getValueFromId(_ID_BACK_NUM),10) + 1;
        imageData[backNum] = 
            _getContext()
                .getImageData(0,0,_styleCanvasWidth,_styleCanvasHeight);
        _setValueFromId(_ID_BACK_NUM,backNum.toString());
    }
     
    /**
     * キャンバスのリストア
     */
    function restoreCanvas(){
        _clearCanvas();
        const backNum = parseInt(_getValueFromId(_ID_BACK_NUM),10) - 1;
        if(backNum > 0){
            _getContext().putImageData(imageData[backNum],0,0);
        }else if(backNum < 0){
            return;
        }
        _setValueFromId(_ID_BACK_NUM,backNum.toString());
    }
    
    
    /** common function ******************************************************/
        function _getElementById(id){
            return  document.getElementById(id);
        }
    
        function _createElement(tagName,attr=[] ,style=[],innerHTML=''){
            const element = document.createElement(tagName);
            for(let key in attr){
                element.setAttribute(key,attr[key]);
            }
            for(let key in style){
                element.style[key] = style[key];
            }
            if(innerHTML != 'undefined'){
                element.innerHTML = innerHTML;
            }
            return element;
        }
        
        function _drawCircle(x,y,radius,fillColor){
            const ctx = _getContext();
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.fillStyle = fillColor;
            ctx.arc(x, y, radius, 0, Math.PI*2, false);
            ctx.fill();
        }
        
        function _getContext(){
            return _getElementById(_ID_CANVAS).getContext('2d');
        }
    
        /* hidden属性のデータ処理関数 *****************************************/
    
        function _setValueFromId(id,value){
            _getElementById(id).value = value;
            return;
        }
        function _getValueFromId(id){
            return _getElementById(id).value;
        }
    
        function _setHiddenPenCoordinate(x,y){
            _getElementById(_ID_HIDDEN_PENX).value = x;
            _getElementById(_ID_HIDDEN_PENY).value = y;
            return;
        }
        function _getHiddenGetCoordinate(){
            return {
                x : _getElementById(_ID_HIDDEN_PENX).value,
                y : _getElementById(_ID_HIDDEN_PENY).value
            };
        }
    
        function _setCursor(type){
            document.body.style.cursor = type;
        }
        
        function _clearCanvas(){
            _getContext().clearRect(0,0,_styleCanvasWidth,_styleCanvasHeight);
        }
})();
