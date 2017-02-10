(function () {
    
    const _styleCanvasWidth = 1200;
    const _styleCanvasHeight = _styleCanvasWidth*9/16;
    const _styleBorder1pxSolid = "1px solid";
    const _stylePadding20px = "20px";
    const _canvasDivId = "OekakiCanvas";
    const _canvasId = "myCanvas";
    
    window.onload = function() {
        if(document.getElementById(_canvasDivId) != null){
            init();
        }
    };
        
    function init(){
        const canvasDiv = document.getElementById(_canvasDivId);
        canvasDiv.style.padding = _stylePadding20px;
        
        // メインキャンバスの作成
        const canvas = document.createElement("canvas");
        canvas.setAttribute("id",_canvasId);
    	canvas.width = _styleCanvasWidth;
    	canvas.height = _styleCanvasHeight;
    	canvas.style.border = _styleBorder1pxSolid;
        canvasDiv.appendChild(canvas);
    	
    	// 制御パネルをCANVASに追加
    	canvasDiv.appendChild(createControlPanel());

    	// 非表示データ領域の作成
    	canvasDiv.appendChild(createHiddenArea());
    	

    	// マウス動作の追加
    	canvasDiv.addEventListener("mousedown", mousedown);
    	canvasDiv.addEventListener("mousemove", mousemove);
    	canvasDiv.addEventListener("mouseup",   mouseup);
    	canvasDiv.addEventListener("mouseout",  mouseout);
    }
    
    
    /**
     * 描画開始
     */
    function mousedown(e){
        // 左クリック以外では描画しない
        if(e.which != 1){
            return;
        }
    	let canvas = document.getElementById(_canvasId);
    	let coor = getCoordinate(canvas, e);
    
        document.getElementById("mouseDown").value = "on";
        document.getElementById("penX").value = coor.x;
        document.getElementById("penY").value = coor.y;
    }
    
    /**
     * 描画
     */
    function mousemove(e){
        // click状態で描画範囲に入ってきた場合の処理
        if(document.getElementById("mouseIn").value == "off" && e.which == 1){
            document.getElementById("mouseDown").value = "on"; 
            const coor = getCoordinate(document.getElementById(_canvasId), e);
            document.getElementById("penX").value = coor.x;
            document.getElementById("penY").value = coor.y;
            document.getElementById("mouseIn").value = "on";
        }else if(document.getElementById("mouseIn").value == "off" && e.which != 1){
            document.getElementById("mouseDown").value = "off"; 
            document.getElementById("mouseIn").value = "on";
        }
        if(document.getElementById("mouseDown").value != "on"){
            return;
        }
        document.body.style.cursor = "default";
    	let canvas = document.getElementById(_canvasId);
        
    	let coor = getCoordinate(canvas, e);
    
        const x0 = document.getElementById("penX").value;
        const y0 = document.getElementById("penY").value;
        
        const penStyle = document.getElementById("penStyle").value;
        
        let penColor = "";
        if(penStyle == "eraser"){
            penColor = "#ffffff";
        }else{
            penColor = document.getElementById("penColor").value;
        }    
        
        const penThick = document.getElementById("penThick").value;
        
    	let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.lineWidth = penThick;
        ctx.strokeStyle = penColor;
        ctx.moveTo(x0,y0);
        ctx.lineTo(coor.x,coor.y);
        ctx.closePath();
        ctx.stroke();
        document.getElementById("penX").value = coor.x;
        document.getElementById("penY").value = coor.y;
    }
    
    /**
     * マウスクリックを挙げた時の処理
     */
    function mouseup(e){
        document.getElementById("mouseDown").value = "off";
        document.body.style.cursor = "auto";
    }
    
    /**
     * マウスが範囲外に出た時の処理
     */ 
    function mouseout(e){
        document.getElementById("mouseIn").value = "off";
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
    
    /**
     * キャンバスの印刷
     */
    function printCanvas(){
        if(window.document.getElementById('printFrame') == null){
            const iframeElement = document.createElement("iframe");
            iframeElement.setAttribute("id","printFrame");
            iframeElement.style.visibility = "hidden";
            iframeElement.style.width = "1px";
            iframeElement.style.height = "1px";
            window.document.body.appendChild(iframeElement);
        }
        const iframeWindow = window.document.getElementById('printFrame').contentWindow;
        if(iframeWindow.document.getElementById('printImg') == null){
            const imgElement = document.createElement('img');
            imgElement.setAttribute("id","printImg");
            iframeWindow.document.body.appendChild(imgElement);
        }
        iframeWindow.document.getElementById('printImg').src = document.getElementById(_canvasId).toDataURL();
        iframeWindow.print();
    }
    
    /**
     * キャンバスのクリア
     */
    function clearCanvas(){
        if(window.confirm('クリアします。よろしいですか？')){
        	document.getElementById(_canvasId).getContext('2d').clearRect(0,0,_styleCanvasWidth,_styleCanvasHeight);
        }
    }
    
    /**
     * コントロールパネルの作成
     */
    function createControlPanel(){
    	// 制御パネルの作成
    	const controlPanel = document.createElement("div");
    	
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
    	const colorPicker = document.createElement("div");
    	colorPicker.setAttribute("id","colorPicker");
    	colorPicker.innerHTML = "色選択：";
    	colorPicker.style.padding = "5px";
        colorPicker.style.margin = "0 auto";
    	colorPicker.style.display = "inline-block";
    	
    	const colorPallet = document.createElement("input");
    	colorPallet.setAttribute("type","color");
    	colorPallet.setAttribute("id","penColor");
    	colorPallet.setAttribute("value","#000000");
    	colorPicker.appendChild(colorPallet);
    	return colorPicker;
    }
    
    /**
     * ペンコントロールの作成
     */
    function createPenControl(){
        const penControl = document.createElement("div");
        penControl.setAttribute("id","penControl");
        penControl.style.padding = "5px";
        penControl.style.margin = "0 auto";
    	penControl.style.display = "inline-block";

        // ペンの種類コントロールの作成
        penControl.appendChild(createPenStyleControl());

        // ペンの太さコントロールの作成
        penControl.appendChild(createPenThickControl());
        
        
        
        return penControl;
    }
    
    function createPenStyleControl(){
        // ペンの太さ変更コントロールの作成
        const penStyleDiv = document.createElement("div");
        penStyleDiv.setAttribute("id","penThickDiv");
        penStyleDiv.style.display = "inline-block";
        penStyleDiv.style.padding = "5px";
        
        const penStyleLabel = document.createElement("label");
        penStyleLabel.innerHTML = "ペンの種類：";
        penStyleDiv.appendChild(penStyleLabel);
        
        const penStyle = document.createElement("select");
        penStyle.setAttribute("id","penStyle");
        penStyle.style.width = "100px";
        
        const penStylePen = document.createElement("option");
        penStylePen.setAttribute("value","pen");
        penStylePen.innerHTML = "通常";
        penStyle.appendChild(penStylePen);
        
        const penStyleEraser = document.createElement("option");
        penStyleEraser.setAttribute("value","eraser");
        penStyleEraser.innerHTML = "消しゴム";
        penStyle.appendChild(penStyleEraser);
        
        penStyleDiv.appendChild(penStyle);
        return penStyleDiv;
    }
    
    
    function createPenThickControl(){
        // ペンの太さ変更コントロールの作成
        const penThickDiv = document.createElement("div");
        penThickDiv.setAttribute("id","penThickDiv");
        penThickDiv.style.display = "inline-block";
        penThickDiv.style.padding = "5px";
        
        const penThickLabel = document.createElement("label");
        penThickLabel.innerHTML = "ペンの太さ：";
        penThickDiv.appendChild(penThickLabel);
        
        const penThick = document.createElement("select");
        penThick.setAttribute("id","penThick");
        penThick.style.width = "100px";
        
        const penThinest = document.createElement("option");
        penThinest.setAttribute("value","1");
        penThinest.innerHTML = "極細";
        penThick.appendChild(penThinest);

        const penThin = document.createElement("option");
        penThin.setAttribute("value","3");
        penThin.innerHTML = "細い";
        penThick.appendChild(penThin);
        
        const penBig = document.createElement("option");
        penBig.setAttribute("value","5");
        penBig.innerHTML = "太い";
        penThick.appendChild(penBig);
        
        const penBigest = document.createElement("option");
        penBigest.setAttribute("value","7");
        penBigest.innerHTML = "極太";
        penThick.appendChild(penBigest);
        
        
        penThickDiv.appendChild(penThick);
        return penThickDiv;
    }
    
    /**
     * 印刷設定等のコントロールの作成
     */
    function createControl(){
        const control = document.createElement("div");
        control.style.padding = "5px";
        control.style.margin = "0 auto";
    	control.style.display = "inline-block";
        
        const clearButton = document.createElement("input");
        clearButton.setAttribute("type","button");
        clearButton.setAttribute("id","clearButton");
        clearButton.setAttribute("value","clear");
        clearButton.addEventListener("mousedown",clearCanvas);
        control.appendChild(clearButton);

        const printButton = document.createElement("input");
        printButton.setAttribute("type","button");
        printButton.setAttribute("id","printButton");
        printButton.setAttribute("value","print");
        printButton.addEventListener("mousedown",printCanvas);
        control.appendChild(printButton);
        
        return control;
    }
    
    /**
     * 隠し要素の作成
     */
    function createHiddenArea(){
        const hiddenArea = document.createElement("div");
        
        // 描画位置X
        const penX = document.createElement("input");
        penX.setAttribute("type","hidden");
        penX.setAttribute("id","penX");
        penX.setAttribute("value","");
        hiddenArea.appendChild(penX);

        // 描画位置Y
        const penY = document.createElement("input");
        penY.setAttribute("type","hidden");
        penY.setAttribute("id","penY");
        penY.setAttribute("value","");
        hiddenArea.appendChild(penY);

        // マウス押下判断
        const mouseDown = document.createElement("input");
        mouseDown.setAttribute("type","hidden");
        mouseDown.setAttribute("id","mouseDown");
        mouseDown.setAttribute("value","off");
        hiddenArea.appendChild(mouseDown);

        // マウス描画内判断
        const mouseIn = document.createElement("input");
        mouseIn.setAttribute("type","hidden");
        mouseIn.setAttribute("id","mouseIn");
        mouseIn.setAttribute("value","off");
        hiddenArea.appendChild(mouseIn);
        
        return hiddenArea;
    }
    
})();
