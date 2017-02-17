(function () {
    
    /* 定数設定 ***************************************************************/
    const _styleCanvasWidth = 1200;
    const _styleCanvasHeight = _styleCanvasWidth*9/16;
    const _styleBorder1pxSolid = "1px solid";
    const _stylePadding20px = "20px";
    
    const _ID_CANVAS_DIV = "OekakiCanvas";
    const _ID_CANVAS = "myCanvas";

    const _eraserColor = "#ffffff";
    
    /* グローバル変数 *********************************************************/
    let imageData = [];
    
    window.onload = function() {
        if(_getElementById(_ID_CANVAS_DIV) != null){
            init();
        }
    };
        
    function init(){
        const canvasDiv = _getElementById(_ID_CANVAS_DIV);
        canvasDiv.style.padding = _stylePadding20px;
        
        // メインキャンバスの作成
        const canvas = 
            _createElement(
                "canvas",
                {id:_ID_CANVAS},
                {border:_styleBorder1pxSolid},
                ""
            );
    	canvas.width = _styleCanvasWidth;
    	canvas.height = _styleCanvasHeight;
        canvasDiv.appendChild(canvas);
    	
    	// 制御パネルをCANVASに追加
    	canvasDiv.appendChild(createControlPanel());

    	// 非表示データ領域の作成
    	canvasDiv.appendChild(createHiddenArea());
    	

    	// マウス動作の追加
    	canvas.addEventListener("mousedown", mousedown);
    	canvas.addEventListener("mousemove", mousemove);
    	canvas.addEventListener("mouseup",   mouseup);
    	canvas.addEventListener("mouseout",  mouseout);
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
    	let canvas = _getElementById(_ID_CANVAS);
    	let coor = getCoordinate(canvas, e);
    
        _getElementById("mouseDown").value = "on";
        _getElementById("penX").value = coor.x;
        _getElementById("penY").value = coor.y;
    }

    /**
     * 描画
     */
    function mousemove(e){
        // click状態で描画範囲に入ってきた場合の処理
        if(_getElementById("mouseIn").value == "off" && e.which == 1){
            _getElementById("mouseDown").value = "on"; 
            const coor = getCoordinate(_getElementById(_ID_CANVAS), e);
            _getElementById("penX").value = coor.x;
            _getElementById("penY").value = coor.y;
            _getElementById("mouseIn").value = "on";
        }else if(_getElementById("mouseIn").value == "off" && e.which != 1){
            _getElementById("mouseDown").value = "off"; 
            _getElementById("mouseIn").value = "on";
        }
        if(_getElementById("mouseDown").value != "on"){
            return;
        }
        document.body.style.cursor = "default";
    	let canvas = _getElementById(_ID_CANVAS);
        
    	let coor = getCoordinate(canvas, e);
    
        const x0 = _getElementById("penX").value;
        const y0 = _getElementById("penY").value;
        
        const penStyle = _getElementById("penStyle").value;
        
        let penColor = "";
        if(penStyle == "eraser"){
            penColor = _eraserColor;
        }else{
            penColor = _getElementById("penColor").value;
        }    
        
        const penThick = _getElementById("penThick").value;
        
    	let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.lineWidth = penThick;
        ctx.strokeStyle = penColor;
        ctx.moveTo(x0,y0);
        ctx.lineTo(coor.x,coor.y);
        ctx.closePath();
        ctx.stroke();
        _getElementById("penX").value = coor.x;
        _getElementById("penY").value = coor.y;
    }
    
    /**
     * マウスクリックを挙げた時の処理
     */
    function mouseup(e){
        _getElementById("mouseDown").value = "off";
        document.body.style.cursor = "auto";
        saveCanvas();
    }
    
    /**
     * マウスが範囲外に出た時の処理
     */ 
    function mouseout(e){
        _getElementById("mouseIn").value = "off";
        document.body.style.cursor = "auto";
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
        let printFrame = document.getElementById('printFrame');
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
            _getElementById(_ID_CANVAS).toDataURL();
        iframeWindow.print();
    }
    
    /**
     * キャンバスのクリア
     */
    function clearCanvas(){
        if(window.confirm('クリアします。よろしいですか？')){
        	_getElementById(_ID_CANVAS).getContext('2d')
        	    .clearRect(0,0,_styleCanvasWidth,_styleCanvasHeight);
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
    	            {type:"color",id:"penColor",value:"#000000"},
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
                {id:"penStyle"},
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
                {value:"eraser"},
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
        
        const penThick = _createElement("select",{id:"penThick"},{width:"100px"});

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
        const hiddenArea = document.createElement("div");
        
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
                            "id":"mouseDown",
                            "value":"off"
                        },{});
        hiddenArea.appendChild(mouseDown);

        // マウス描画内判断
        const mouseIn = _createElement("input",{
                            "type":"hidden",
                            "id":"mouseIn",
                            "value":"off"
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
        const backNum = parseInt(_getElementById("backNum").value,10) + 1;
        imageData[backNum] = 
            _getElementById(_ID_CANVAS).getContext('2d')
                .getImageData(0,0,_styleCanvasWidth,_styleCanvasHeight);
        _getElementById("backNum").value = backNum.toString();
    }
     
    /**
     * キャンバスのリストア
     */
    function restoreCanvas(){
        _getElementById(_ID_CANVAS).getContext('2d')
            .clearRect(0,0,_styleCanvasWidth,_styleCanvasHeight);
        const backNum = parseInt(_getElementById("backNum").value,10) - 1;
        if(backNum > 0){
            _getElementById(_ID_CANVAS).getContext('2d')
                .putImageData(imageData[backNum],0,0);
        }else if(backNum < 0){
            return;
        }
        _getElementById("backNum").value = backNum.toString();
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
    
})();
