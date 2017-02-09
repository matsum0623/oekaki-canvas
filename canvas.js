(function () {
    
    window.onload = function() {
        if(document.getElementById("OekakiCanvas") != null){
            init();
        }
    };
        
    function init(){
        const canvasDiv = document.getElementById("OekakiCanvas");
        canvasDiv.style.padding = "20px";
        
        // メインキャンバスの作成
        const canvas = document.createElement("canvas");
        canvas.setAttribute("id","myCanvas");
        canvasDiv.appendChild(canvas);
    	canvas.width = 600;
    	canvas.height = 450;
    	canvas.style.border = "1px solid";
    	
    	// 制御パネルの作成
    	const controlPanel = document.createElement("div");
    	// カラーピッカーの作成
        controlPanel.appendChild(createColorPicker());
    	
    	// 描画ブラシ設定パネルの作成
    	controlPanel.appendChild(createPenControl());
    	
    	// 印刷等のコントロールの作成
    	controlPanel.appendChild(createControl());
    	
    	// 制御パネルをCANVASに追加
    	canvasDiv.appendChild(controlPanel);

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
    	let canvas = document.getElementById("myCanvas");
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
            const canvas = document.getElementById("myCanvas");
            const coor = getCoordinate(canvas, e);
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
    	let canvas = document.getElementById("myCanvas");
        
    	let coor = getCoordinate(canvas, e);
    
        const x0 = document.getElementById("penX").value;
        const y0 = document.getElementById("penY").value;
        
        // ペンの太さ
        const penThick = document.getElementById("penThick").value;
    	let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.lineWidth = penThick;
        ctx.strokeStyle = document.getElementById("penColor").value;
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
        const res = {
            x:event.clientX - element.offsetLeft + window.pageXOffset,
            y:event.clientY - element.offsetTop  + window.pageYOffset
        };
        return res;
    }
    
    /**
     * キャンバスの印刷
     */
    function printCanvas(){
    	const canvas = document.getElementById("myCanvas");
        const printURL = canvas.toDataURL();
        
        if(window.document.getElementById('printFrame') == null){
            const iframeElement = document.createElement("iframe");
            iframeElement.setAttribute("id","printFrame");
            iframeElement.style.visibility = "hidden";
            window.document.body.appendChild(iframeElement);
        }
        const iframe = window.document.getElementById('printFrame');
        const iframeWindow = iframe.contentWindow;
        if(iframeWindow.document.getElementById('printImg') == null){
            const imgElement = document.createElement('img');
            imgElement.setAttribute("id","printImg");
            iframeWindow.document.body.appendChild(imgElement);
        }
        const iframeImg = iframeWindow.document.getElementById('printImg');
        iframeImg.src = printURL;
        iframeWindow.print();
    }
    
    /**
     * キャンバスのクリア
     */
    function clearCanvas(){
    	const canvas = document.getElementById("myCanvas");
    	let ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,600,450);
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
        penControl.innerHTML = "ペンの太さ:";
        penControl.style.padding = "5px";
        penControl.style.margin = "0 auto";
    	penControl.style.display = "inline-block";

        const penThick = document.createElement("select");
        penThick.setAttribute("id","penThick");
        
        const penThin = document.createElement("option");
        penThin.setAttribute("value","1");
        penThin.innerHTML = "細い";
        penThick.appendChild(penThin);
        
        const penBig = document.createElement("option");
        penBig.setAttribute("value","5");
        penBig.innerHTML = "太い";
        penThick.appendChild(penBig);
        
        
        penControl.appendChild(penThick);
        
        return penControl;
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
        
        const penStyle = document.createElement("input");
        penStyle.setAttribute("type","hidden");
        penStyle.setAttribute("id","penStyle");
        penStyle.setAttribute("value","pen");
        hiddenArea.appendChild(penStyle);
        
        const penX = document.createElement("input");
        penX.setAttribute("type","hidden");
        penX.setAttribute("id","penX");
        penX.setAttribute("value","");
        hiddenArea.appendChild(penX);

        const penY = document.createElement("input");
        penY.setAttribute("type","hidden");
        penY.setAttribute("id","penY");
        penY.setAttribute("value","");
        hiddenArea.appendChild(penY);

        const mouseDown = document.createElement("input");
        mouseDown.setAttribute("type","hidden");
        mouseDown.setAttribute("id","mouseDown");
        mouseDown.setAttribute("value","off");
        hiddenArea.appendChild(mouseDown);

        const mouseIn = document.createElement("input");
        mouseIn.setAttribute("type","hidden");
        mouseIn.setAttribute("id","mouseIn");
        mouseIn.setAttribute("value","off");
        hiddenArea.appendChild(mouseIn);
        
        return hiddenArea;
    }
    
})();