class OekakiCanves {
  private _styleCanvasWidth:string;
  private _styleCanvasHeight:string;
  private _styleBorder1pxSolid:string;
  private _stylePadding20px:string;

  private _TAGNAME_CANVAS:string;

  private _ID_CANVAS_DIV:string;
  private _ID_CANVAS:string;

  private _ID_PEN_STYLE:string;
  private _ID_PEN_THICK:string;
  private _ID_PEN_COLOR:string;
  private _ID_MOUSE_DOWN:string;
  private _ID_MOUSE_IN:string;
  private _ID_BACK_NUM:string;

  private _ID_HIDDEN_PENX:string;
  private _ID_HIDDEN_PENY:string;

  private _PENSTYLE_ERASER:string;

  private _CURSOR_STYLE_AUTO:string;
  private _CURSOR_STYLE_DEFAULT:string;

  private _MESSAGE_CLEAR:string;

  private _eraserColor:string;
  private _VALUE_ON:string;
  private _VALUE_OFF:string;

  /* グローバル変数 *********************************************************/
  private imageData = [];

  private ctx = null;

  private canvasDiv:HTMLElement
  private canvasElement:HTMLElement;

  /**
   *
   * @param canvas
   */
  constructor(canvas: HTMLElement) {
    /* 定数設定 */
    this.canvasDiv = canvas;

    this._styleCanvasWidth = '1200';
    this._styleCanvasHeight = (+(this._styleCanvasWidth) * 9 / 16).toString();
    this._styleBorder1pxSolid = "1px solid";
    this._stylePadding20px = "20px";

    this._TAGNAME_CANVAS = "canvas";

    this._ID_CANVAS_DIV = "OekakiCanvas";
    this._ID_CANVAS = "myCanvas";

    this._ID_PEN_STYLE = "penStyle";
    this._ID_PEN_THICK = "penThick";
    this._ID_PEN_COLOR = "penColor";
    this._ID_MOUSE_DOWN = "hiddenMouseDown";
    this._ID_MOUSE_IN = "hiddenMouseIn";
    this._ID_BACK_NUM = "backNum";

    this._ID_HIDDEN_PENX = "penX";
    this._ID_HIDDEN_PENY = "penY";

    this._PENSTYLE_ERASER = "eraser";

    this._CURSOR_STYLE_AUTO = "auto";
    this._CURSOR_STYLE_DEFAULT = "default";

    this._MESSAGE_CLEAR = "クリアします。よろしいですか？";

    this._eraserColor = "#ffffff";
    this._VALUE_ON = "on";
    this._VALUE_OFF = "off";

    /* グローバル変数 */
    let imageData = [];

    let ctx = null;

    // メインキャンバスの作成
    this.canvasElement =
        this._createElement(
            this._TAGNAME_CANVAS,
            {id : this._ID_CANVAS},
            {border : this._styleBorder1pxSolid},
            ""
        );
    this.canvasElement.style.padding = this._stylePadding20px;
    this.canvasElement.style.width = this._styleCanvasWidth;
    this.canvasElement.style.height = this._styleCanvasHeight;
    this.canvasDiv.appendChild(this.canvasElement);

    // 制御パネルをCANVASに追加
    this.canvasDiv.appendChild(this.createControlPanel());

    // 非表示データ領域の作成
    this.canvasDiv.appendChild(this.createHiddenArea());

    // コンテキストの取得
    ctx = this._getContext();

    // マウス動作の追加
    this.canvasElement.addEventListener("mousedown", this.mousedown);
    this.canvasElement.addEventListener("mousemove", this.mousemove);
    this.canvasElement.addEventListener("mouseup",   this.mouseup);
    this.canvasElement.addEventListener("mouseout",  this.mouseout);


  }

  // DOM操作系 ///////////////////////////////////////////////////////////
  /**
   * IDを指定してエレメントを取得
   */
  _getElementById(id){
      return  document.getElementById(id);
  }
  /**
   * エレメントの作成
   * @type(String) tagName タグ名称
   * @type(array[String:String]) attributeの設定
   * @type(array[String:String]) styleの設定
   * @type(String) innerHTMLの設定
   */
  _createElement(tagName:string, attr={}, style={}, innerHTML=''){
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

      // inputタグデータの処理関数 ///////////////////////////////////////////
    /**
     * IDを指定してVALUEを設定
     */
  _setValueFromId(id,value){
      this._getElementById(id).value = value;
      return;
  }
  /**
   * IDを指定してVALUEを取得
   */
  _getValueFromId(id){
      return this._getElementById(id).value;
  }
  /**
   * HIDDEN要素に座標を登録
   */
  _setHiddenPenCoordinate(x,y){
    this._getElementById(this._ID_HIDDEN_PENX).value = x;
    this._getElementById(this._ID_HIDDEN_PENY).value = y;
    return;
  }
  /**
   * HIDDEN要素の座標を取得
   */
  _getHiddenGetCoordinate(){
    return {
      x : this._getElementById(this._ID_HIDDEN_PENX).value,
      y : this._getElementById(this._ID_HIDDEN_PENY).value
    };
  }
  /**
   * カーソルの設定
   */
  _setCursor(type){
      document.body.style.cursor = type;
  }
  /**
   * コンテキストの取得
   */
  _getContext(){
    return this._getElementById(this._ID_CANVAS).getContext('2d');
  }
  /**
   * キャンバスのクリア
   */
  _clearCanvas(){
    this._getContext().clearRect(0,0,this._styleCanvasWidth,this._styleCanvasHeight);
  }
  /* 各コントロール作成 *****************************************************/
  /**
   * コントロールパネルの作成
   */
  public createControlPanel(){
    // 制御パネルの作成
    const controlPanel = this._createElement("div",{},{},"");

    // カラーピッカーの作成
      controlPanel.appendChild(this.createColorPicker());

    // 描画ブラシ設定パネルの作成
    controlPanel.appendChild(this.createPenControl());

    // 印刷等のコントロールの作成
    controlPanel.appendChild(this.createControl());

      return controlPanel;
  }

  /**
   * カラーピッカーの作成
   */
  createColorPicker(){
    const colorPicker =
      this._createElement(
        "div",
        {id:"colorPicker"},
        {display:"inline-block",padding:"5px",margin:"0 auto"},
        "色選択："
      );

    colorPicker.appendChild(
      this._createElement(
        "input",
        {type:"color", id:this._ID_PEN_COLOR, value:"#000000"},
        {},
        ""
      ));
    return colorPicker;
  }

  /**
   * ペンコントロールの作成
   */
  createPenControl(){
    const penControl =
      this._createElement(
        "div",
        {id:"penControl"},
        {display:"inline-block",padding:"5px",margin:"0 auto"},
        "",
      );

    // ペンの種類コントロールの作成
    penControl.appendChild(this.createPenStyleControl());

    // ペンの太さコントロールの作成
    penControl.appendChild(this.createPenThickControl());

    return penControl;
  }

  /**
   * ペンスタイルコントロールの作成
   */
  createPenStyleControl(){
    // ペンの種類変更コントロールの作成
    const penStyleDiv =
        this._createElement(
            "div",
            {id:"penThickDiv"},
            {display:"inline-block",padding:"5px"},
            ""
        );

    const penStyleLabel = this._createElement("label",{},{},"ペンの種類：");
    penStyleDiv.appendChild(penStyleLabel);

    const penStyle =
      this._createElement(
            "select",
            {id:this._ID_PEN_STYLE},
            {width:"100px"},
            ""
        );

    const penStylePen =
    this._createElement(
            "option",
            {value:"pen"},
            {},
            "通常"
        );
    penStyle.appendChild(penStylePen);

    const penStyleEraser =
    this._createElement(
            "option",
            {value:this._PENSTYLE_ERASER},
            {},
            "消しゴム"
        );
    penStyle.appendChild(penStyleEraser);

    penStyleDiv.appendChild(penStyle);
    return penStyleDiv;
  }

    /**
     * ペンの太さコントロールの作成
     */
    createPenThickControl(){
      // ペンの太さ変更コントロールの作成
      const penThickDiv = this._createElement("div",{id:"penThickDiv"},{
              "padding" : "5px",
              "display" : "inline-block"
          });

      const penThickLabel = this._createElement("lebel",{},{},"ペンの太さ：");
      penThickDiv.appendChild(penThickLabel);

      const penThick = this._createElement("select",{id:this._ID_PEN_THICK},{width:"100px"});

      const penThinest = this._createElement("option",{value:"1"},{},"極細");
      penThick.appendChild(penThinest);

      const penThin = this._createElement("option",{value:"3"},{},"細い");
      penThick.appendChild(penThin);

      const penBig = this._createElement("option",{value:"5"},{},"太い");
      penThick.appendChild(penBig);

      const penBigest = this._createElement("option",{value:"7"},{},"極太");
      penThick.appendChild(penBigest);


      penThickDiv.appendChild(penThick);
      return penThickDiv;
  }

    /**
     * 印刷設定等のコントロールの作成
     */
    createControl(){
      // コントロールパネル作成
      const control = this._createElement("div",{},{
              "padding" : "5px",
              "margin"  : "0 auto",
              "display" : "inline-block"
          });

      // クリアボタン
      const clearButton = this._createElement("input",{
                          "type":"button",
                          "id":"clearButton",
                          "value":"clear"
                      },{});
      clearButton.addEventListener("mousedown",this.clearCanvas);
      control.appendChild(clearButton);

      // 画像として保存ボタン
      const saveButton = this._createElement("input",{
                          "type":"button",
                          "id":"saveButton",
                          "value":"save"
                      },{});
      saveButton.addEventListener("mousedown",this.saveCanvasAsImage);
      control.appendChild(saveButton);

      // 印刷ボタン
      const printButton = this._createElement("input",{
                          "type":"button",
                          "id":"printButton",
                          "value":"print"
                      },{});
      printButton.addEventListener("mousedown",this.printCanvas);
      control.appendChild(printButton);

      // 戻るボタン
      const backButton = this._createElement("input",{
                          "type":"button",
                          "id":"backButton",
                          "value":"back"
                      },{});
      backButton.addEventListener("mousedown",this.restoreCanvas);
      control.appendChild(backButton);


      return control;
  }

    /**
     * キャンバスの保存
     */
    saveCanvas(){
      const backNum = parseInt(this._getValueFromId(this._ID_BACK_NUM),10) + 1;
      this.imageData[backNum] =
      this._getContext()
              .getImageData(0,0,this._styleCanvasWidth,this._styleCanvasHeight);
              this._setValueFromId(this._ID_BACK_NUM,backNum.toString());
  }

  /**
   * キャンバスのリストア
   */
  restoreCanvas(){
    this._clearCanvas();
      const backNum = parseInt(this._getValueFromId(this._ID_BACK_NUM),10) - 1;
      if(backNum > 0){
        this._getContext().putImageData(this.imageData[backNum],0,0);
      }else if(backNum < 0){
          return;
      }
      this._setValueFromId(this._ID_BACK_NUM,backNum.toString());
  }

    /**
     * キャンバスの印刷
     */
    printCanvas(){
      let printFrame = this._getElementById('printFrame');
      if(printFrame == null){
          const iframeElement =
          this._createElement(
                      "iframe",
                      {id:"printFrame"},
                      {visibility:"hidden",width:"1px",height:"1px"},
                      ""
                  );
          document.body.appendChild(iframeElement);
          const imgElement = this._createElement("img",{},{},"");
          imgElement.setAttribute("id","printImg");
          iframeElement.contentWindow.document.body.appendChild(imgElement);
          printFrame = iframeElement;
      }
      const iframeWindow = printFrame.contentWindow;
      iframeWindow.document.getElementById('printImg').src =
      this.canvasElement.toDataURL();
      iframeWindow.print();
  }

  /**
   * キャンバスのクリア
   */
  clearCanvas(){
      if(window.confirm(this._MESSAGE_CLEAR)){
        this._clearCanvas();
        // 戻るボタン用配列の初期化
        this.imageData = [];
        this._setValueFromId(this._ID_BACK_NUM,"0");
      }
  }
    /**
     * キャンバスをイメージとして保存
     */
    saveCanvasAsImage(){
      const imageUrl = this._getElementById(this._ID_CANVAS).toDataURL();
      this._createElement("a",{"href":imageUrl,download:"images.png"},{},"画像リンク").click();
  }

  /* マウス動作処理 */
  /**
   * マウス押下時処理
   */
  mousedown(e){
    // 左クリック以外では描画しない
    if(e.which != 1){
        return;
    }
  let coor = this.getCoordinate(this.canvasElement, e);

    const penStyle = this._getValueFromId(this._ID_PEN_STYLE);

    this._drawCircle(
        coor.x,
        coor.y,
        this._getValueFromId(this._ID_PEN_THICK)/2,
        penStyle == this._PENSTYLE_ERASER ? this._eraserColor : this._getValueFromId(this._ID_PEN_COLOR)
    );

    this._setValueFromId(this._ID_MOUSE_DOWN,this._VALUE_ON);
    this._setHiddenPenCoordinate(coor.x,coor.y);
  }

  /**
   * 描画
   */
  mousemove(e){
      // click状態で描画範囲に入ってきた場合の処理
      if(this._getValueFromId(this._ID_MOUSE_IN) == this._VALUE_OFF && e.which == 1){
        this._setValueFromId(this._ID_MOUSE_DOWN,this._VALUE_ON);
          const coor = this.getCoordinate(this._getElementById(this._ID_CANVAS), e);
          this._setHiddenPenCoordinate(coor.x,coor.y);
          this._setValueFromId(this._ID_MOUSE_IN,this._VALUE_ON);
      }else if(this._getValueFromId(this._ID_MOUSE_IN) == this._VALUE_OFF && e.which != 1){
        this._setValueFromId(this._ID_MOUSE_DOWN,this._VALUE_OFF);
        this._setValueFromId(this._ID_MOUSE_IN,this._VALUE_ON);
      }
      if(this._getValueFromId(this._ID_MOUSE_DOWN) != this._VALUE_ON){
          return;
      }
      this._setCursor(this._CURSOR_STYLE_DEFAULT);

      const coor0 = this._getHiddenGetCoordinate();
    const coor  = this.getCoordinate(this.canvasElement, e);

    this.ctx.beginPath();
    this.ctx.lineWidth   = this._getValueFromId(this._ID_PEN_THICK);
    this.ctx.strokeStyle = this._getValueFromId(this._ID_PEN_STYLE) == this._PENSTYLE_ERASER ? this._eraserColor : this._getValueFromId(this._ID_PEN_COLOR);
    this.ctx.moveTo(coor0.x,coor0.y);
    this.ctx.lineTo(coor.x,coor.y);
    this.ctx.closePath();
    this.ctx.stroke();
    this._setHiddenPenCoordinate(coor.x,coor.y);
  }

  /**
   * マウスクリックを挙げた時の処理
   */
  mouseup(e){
    this._setValueFromId(this._ID_MOUSE_DOWN,this._VALUE_OFF);
    this._setCursor(this._CURSOR_STYLE_AUTO);
    this.saveCanvas();
  }

  /**
   * マウスが範囲外に出た時の処理
   */
  mouseout(e){
    this._setValueFromId(this._ID_MOUSE_IN,this._VALUE_OFF);
    this._setCursor(this._CURSOR_STYLE_AUTO);
  }

  /**
   * 現在位置の取得
   */
  getCoordinate(element, event){
      return {
          x:event.clientX - element.offsetLeft + window.pageXOffset,
          y:event.clientY - element.offsetTop  + window.pageYOffset
      };
  }

  // CANVAS関連 //////////////////////////////////////////////////////////
  /**
   * 円の描画
   */
  _drawCircle(x,y,radius,fillColor){
    const ctx = this._getContext();
    ctx.beginPath();
    ctx.lineWidth = 0;
    ctx.fillStyle = fillColor;
    ctx.arc(x, y, radius, 0, Math.PI*2, false);
    ctx.fill();
  }
    /**
     * 隠し要素の作成
     */
    createHiddenArea(){
      const hiddenArea = this._createElement("div",{},{},"");

      // 描画位置X
      const penX = this._createElement("input",{
                          "type"  :"hidden",
                          "id"    :"penX",
                          "value" :""
                      },{});
      hiddenArea.appendChild(penX);

      // 描画位置Y
      const penY = this._createElement("input",{
                          "type":"hidden",
                          "id":"penY",
                          "value":""
                      },{});
      hiddenArea.appendChild(penY);

      // マウス押下判断
      const mouseDown = this._createElement("input",{
                          "type":"hidden",
                          "id":this._ID_MOUSE_DOWN,
                          "value":this._VALUE_OFF
                      },{});
      hiddenArea.appendChild(mouseDown);

      // マウス描画内判断
      const mouseIn = this._createElement("input",{
                          "type":"hidden",
                          "id":this._ID_MOUSE_IN,
                          "value":this._VALUE_OFF
                      },{});
      hiddenArea.appendChild(mouseIn);

      // イメージデータ保存
      const backNum = this._createElement("input",{
                          "type":"hidden",
                          "id":"backNum",
                          "value":"0"
                      },{});
      hiddenArea.appendChild(backNum);

      return hiddenArea;
  }


}

let canvas = document.getElementById('OekakiCanvas');
const OekakiCanvas = new OekakiCanves(canvas);


