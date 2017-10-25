"use strict";

(function () {

    /* 定数設定 ***************************************************************/
    var _styleCanvasWidth = 1200;
    var _styleCanvasHeight = _styleCanvasWidth * 9 / 16;
    var _styleBorder1pxSolid = "1px solid";
    var _stylePadding20px = "20px";

    var _TAGNAME_CANVAS = "canvas";

    var _ID_CANVAS_DIV = "OekakiCanvas";
    var _ID_CANVAS = "myCanvas";

    var _ID_PEN_STYLE = "penStyle";
    var _ID_PEN_THICK = "penThick";
    var _ID_PEN_COLOR = "penColor";
    var _ID_MOUSE_DOWN = "hiddenMouseDown";
    var _ID_MOUSE_IN = "hiddenMouseIn";
    var _ID_BACK_NUM = "backNum";

    var _ID_HIDDEN_PENX = "penX";
    var _ID_HIDDEN_PENY = "penY";

    var _PENSTYLE_ERASER = "eraser";

    var _CURSOR_STYLE_AUTO = "auto";
    var _CURSOR_STYLE_DEFAULT = "default";

    var _MESSAGE_CLEAR = "クリアします。よろしいですか？";

    var _eraserColor = "#ffffff";
    var _VALUE_ON = "on";
    var _VALUE_OFF = "off";

    /* グローバル変数 *********************************************************/
    var imageData = [];

    var ctx = null;

    var canvasElement = null;

    window.onload = function () {
        if (_getElementById(_ID_CANVAS_DIV) != null) {
            init();
        }
    };

    function init() {
        var canvasDiv = _getElementById(_ID_CANVAS_DIV);
        canvasDiv.style.padding = _stylePadding20px;

        // メインキャンバスの作成
        canvasElement = _createElement(_TAGNAME_CANVAS, { id: _ID_CANVAS }, { border: _styleBorder1pxSolid }, "");
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
        canvasElement.addEventListener("mouseup", mouseup);
        canvasElement.addEventListener("mouseout", mouseout);
    }

    /* マウス動作処理 *********************************************************/
    /**
     * マウス押下時処理
     */
    function mousedown(e) {
        // 左クリック以外では描画しない
        if (e.which != 1) {
            return;
        }
        var coor = getCoordinate(canvasElement, e);

        var penStyle = _getValueFromId(_ID_PEN_STYLE);

        _drawCircle(coor.x, coor.y, _getValueFromId(_ID_PEN_THICK) / 2, penStyle == _PENSTYLE_ERASER ? _eraserColor : _getValueFromId(_ID_PEN_COLOR));

        _setValueFromId(_ID_MOUSE_DOWN, _VALUE_ON);
        _setHiddenPenCoordinate(coor.x, coor.y);
    }

    /**
     * 描画
     */
    function mousemove(e) {
        // click状態で描画範囲に入ってきた場合の処理
        if (_getValueFromId(_ID_MOUSE_IN) == _VALUE_OFF && e.which == 1) {
            _setValueFromId(_ID_MOUSE_DOWN, _VALUE_ON);
            var _coor = getCoordinate(_getElementById(_ID_CANVAS), e);
            _setHiddenPenCoordinate(_coor.x, _coor.y);
            _setValueFromId(_ID_MOUSE_IN, _VALUE_ON);
        } else if (_getValueFromId(_ID_MOUSE_IN) == _VALUE_OFF && e.which != 1) {
            _setValueFromId(_ID_MOUSE_DOWN, _VALUE_OFF);
            _setValueFromId(_ID_MOUSE_IN, _VALUE_ON);
        }
        if (_getValueFromId(_ID_MOUSE_DOWN) != _VALUE_ON) {
            return;
        }
        _setCursor(_CURSOR_STYLE_DEFAULT);

        var coor0 = _getHiddenGetCoordinate();
        var coor = getCoordinate(canvasElement, e);

        ctx.beginPath();
        ctx.lineWidth = _getValueFromId(_ID_PEN_THICK);
        ctx.strokeStyle = _getValueFromId(_ID_PEN_STYLE) == _PENSTYLE_ERASER ? _eraserColor : _getValueFromId(_ID_PEN_COLOR);
        ctx.moveTo(coor0.x, coor0.y);
        ctx.lineTo(coor.x, coor.y);
        ctx.closePath();
        ctx.stroke();
        _setHiddenPenCoordinate(coor.x, coor.y);
    }

    /**
     * マウスクリックを挙げた時の処理
     */
    function mouseup(e) {
        _setValueFromId(_ID_MOUSE_DOWN, _VALUE_OFF);
        _setCursor(_CURSOR_STYLE_AUTO);
        saveCanvas();
    }

    /**
     * マウスが範囲外に出た時の処理
     */
    function mouseout(e) {
        _setValueFromId(_ID_MOUSE_IN, _VALUE_OFF);
        _setCursor(_CURSOR_STYLE_AUTO);
    }

    /**
     * 現在位置の取得
     */
    function getCoordinate(element, event) {
        return {
            x: event.clientX - element.offsetLeft + window.pageXOffset,
            y: event.clientY - element.offsetTop + window.pageYOffset
        };
    }

    /**************************************************************************/
    /**
     * キャンバスの印刷
     */
    function printCanvas() {
        var printFrame = _getElementById('printFrame');
        if (printFrame == null) {
            var iframeElement = _createElement("iframe", { id: "printFrame" }, { visibility: "hidden", width: "1px", height: "1px" }, "");
            document.body.appendChild(iframeElement);
            var imgElement = _createElement("img", {}, {}, "");
            imgElement.setAttribute("id", "printImg");
            iframeElement.contentWindow.document.body.appendChild(imgElement);
            printFrame = iframeElement;
        }
        var iframeWindow = printFrame.contentWindow;
        iframeWindow.document.getElementById('printImg').src = canvasElement.toDataURL();
        iframeWindow.print();
    }

    /**
     * キャンバスのクリア
     */
    function clearCanvas() {
        if (window.confirm(_MESSAGE_CLEAR)) {
            _clearCanvas();
            // 戻るボタン用配列の初期化
            imageData = [];
            _setValueFromId(_ID_BACK_NUM, "0");
        }
    }

    /**
     * キャンバスをイメージとして保存
     */
    function saveCanvasAsImage() {
        var imageUrl = _getElementById(_ID_CANVAS).toDataURL();
        _createElement("a", { "href": imageUrl, download: "images.png" }, {}, "画像リンク").click();
    }

    /* 各コントロール作成 *****************************************************/
    /**
     * コントロールパネルの作成
     */
    function createControlPanel() {
        // 制御パネルの作成
        var controlPanel = _createElement("div", {}, {}, "");

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
    function createColorPicker() {
        var colorPicker = _createElement("div", { id: "colorPicker" }, { display: "inline-block", padding: "5px", margin: "0 auto" }, "色選択：");

        colorPicker.appendChild(_createElement("input", { type: "color", id: _ID_PEN_COLOR, value: "#000000" }, {}, ""));
        return colorPicker;
    }

    /**
     * ペンコントロールの作成
     */
    function createPenControl() {
        var penControl = _createElement("div", { id: "penControl" }, { display: "inline-block", padding: "5px", margin: "0 auto" }, "");

        // ペンの種類コントロールの作成
        penControl.appendChild(createPenStyleControl());

        // ペンの太さコントロールの作成
        penControl.appendChild(createPenThickControl());

        return penControl;
    }

    /**
     * ペンスタイルコントロールの作成
     */
    function createPenStyleControl() {
        // ペンの種類変更コントロールの作成
        var penStyleDiv = _createElement("div", { id: "penThickDiv" }, { display: "inline-block", padding: "5px" }, "");

        var penStyleLabel = _createElement("label", {}, {}, "ペンの種類：");
        penStyleDiv.appendChild(penStyleLabel);

        var penStyle = _createElement("select", { id: _ID_PEN_STYLE }, { width: "100px" }, "");

        var penStylePen = _createElement("option", { value: "pen" }, {}, "通常");
        penStyle.appendChild(penStylePen);

        var penStyleEraser = _createElement("option", { value: _PENSTYLE_ERASER }, {}, "消しゴム");
        penStyle.appendChild(penStyleEraser);

        penStyleDiv.appendChild(penStyle);
        return penStyleDiv;
    }

    /**
     * ペンの太さコントロールの作成
     */
    function createPenThickControl() {
        // ペンの太さ変更コントロールの作成
        var penThickDiv = _createElement("div", { id: "penThickDiv" }, {
            "padding": "5px",
            "display": "inline-block"
        });

        var penThickLabel = _createElement("lebel", {}, {}, "ペンの太さ：");
        penThickDiv.appendChild(penThickLabel);

        var penThick = _createElement("select", { id: _ID_PEN_THICK }, { width: "100px" });

        var penThinest = _createElement("option", { value: "1" }, {}, "極細");
        penThick.appendChild(penThinest);

        var penThin = _createElement("option", { value: "3" }, {}, "細い");
        penThick.appendChild(penThin);

        var penBig = _createElement("option", { value: "5" }, {}, "太い");
        penThick.appendChild(penBig);

        var penBigest = _createElement("option", { value: "7" }, {}, "極太");
        penThick.appendChild(penBigest);

        penThickDiv.appendChild(penThick);
        return penThickDiv;
    }

    /**
     * 印刷設定等のコントロールの作成
     */
    function createControl() {
        // コントロールパネル作成
        var control = _createElement("div", {}, {
            "padding": "5px",
            "margin": "0 auto",
            "display": "inline-block"
        });

        // クリアボタン
        var clearButton = _createElement("input", {
            "type": "button",
            "id": "clearButton",
            "value": "clear"
        }, {});
        clearButton.addEventListener("mousedown", clearCanvas);
        control.appendChild(clearButton);

        // 画像として保存ボタン
        var saveButton = _createElement("input", {
            "type": "button",
            "id": "saveButton",
            "value": "save"
        }, {});
        saveButton.addEventListener("mousedown", saveCanvasAsImage);
        control.appendChild(saveButton);

        // 印刷ボタン
        var printButton = _createElement("input", {
            "type": "button",
            "id": "printButton",
            "value": "print"
        }, {});
        printButton.addEventListener("mousedown", printCanvas);
        control.appendChild(printButton);

        // 戻るボタン
        var backButton = _createElement("input", {
            "type": "button",
            "id": "backButton",
            "value": "back"
        }, {});
        backButton.addEventListener("mousedown", restoreCanvas);
        control.appendChild(backButton);

        return control;
    }

    /**
     * 隠し要素の作成
     */
    function createHiddenArea() {
        var hiddenArea = _createElement("div", {}, {}, "");

        // 描画位置X
        var penX = _createElement("input", {
            "type": "hidden",
            "id": "penX",
            "value": ""
        }, {});
        hiddenArea.appendChild(penX);

        // 描画位置Y
        var penY = _createElement("input", {
            "type": "hidden",
            "id": "penY",
            "value": ""
        }, {});
        hiddenArea.appendChild(penY);

        // マウス押下判断
        var mouseDown = _createElement("input", {
            "type": "hidden",
            "id": _ID_MOUSE_DOWN,
            "value": _VALUE_OFF
        }, {});
        hiddenArea.appendChild(mouseDown);

        // マウス描画内判断
        var mouseIn = _createElement("input", {
            "type": "hidden",
            "id": _ID_MOUSE_IN,
            "value": _VALUE_OFF
        }, {});
        hiddenArea.appendChild(mouseIn);

        // イメージデータ保存
        var backNum = _createElement("input", {
            "type": "hidden",
            "id": "backNum",
            "value": "0"
        }, {});
        hiddenArea.appendChild(backNum);

        return hiddenArea;
    }

    /**
     * キャンバスの保存
     */
    function saveCanvas() {
        var backNum = parseInt(_getValueFromId(_ID_BACK_NUM), 10) + 1;
        imageData[backNum] = _getContext().getImageData(0, 0, _styleCanvasWidth, _styleCanvasHeight);
        _setValueFromId(_ID_BACK_NUM, backNum.toString());
    }

    /**
     * キャンバスのリストア
     */
    function restoreCanvas() {
        _clearCanvas();
        var backNum = parseInt(_getValueFromId(_ID_BACK_NUM), 10) - 1;
        if (backNum > 0) {
            _getContext().putImageData(imageData[backNum], 0, 0);
        } else if (backNum < 0) {
            return;
        }
        _setValueFromId(_ID_BACK_NUM, backNum.toString());
    }

    /** common function *******************************************************/

    // DOM操作系 ///////////////////////////////////////////////////////////
    /**
     * IDを指定してエレメントを取得
     */
    function _getElementById(id) {
        return document.getElementById(id);
    }

    /**
     * エレメントの作成
     * @type(String) tagName タグ名称
     * @type(array[String:String]) attributeの設定
     * @type(array[String:String]) styleの設定
     * @type(String) innerHTMLの設定
     */
    function _createElement(tagName) {
        var attr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var style = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var innerHTML = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

        var element = document.createElement(tagName);
        for (var key in attr) {
            element.setAttribute(key, attr[key]);
        }
        for (var _key in style) {
            element.style[_key] = style[_key];
        }
        if (innerHTML != 'undefined') {
            element.innerHTML = innerHTML;
        }
        return element;
    }

    // inputタグデータの処理関数 ///////////////////////////////////////////
    /**
     * IDを指定してVALUEを設定
     */
    function _setValueFromId(id, value) {
        _getElementById(id).value = value;
        return;
    }
    /**
     * IDを指定してVALUEを取得
     */
    function _getValueFromId(id) {
        return _getElementById(id).value;
    }
    /**
     * HIDDEN要素に座標を登録
     */
    function _setHiddenPenCoordinate(x, y) {
        _getElementById(_ID_HIDDEN_PENX).value = x;
        _getElementById(_ID_HIDDEN_PENY).value = y;
        return;
    }
    /**
     * HIDDEN要素の座標を取得
     */
    function _getHiddenGetCoordinate() {
        return {
            x: _getElementById(_ID_HIDDEN_PENX).value,
            y: _getElementById(_ID_HIDDEN_PENY).value
        };
    }
    /**
     * カーソルの設定
     */
    function _setCursor(type) {
        document.body.style.cursor = type;
    }

    // CANVAS関連 //////////////////////////////////////////////////////////
    /**
     * 円の描画
     */
    function _drawCircle(x, y, radius, fillColor) {
        var ctx = _getContext();
        ctx.beginPath();
        ctx.lineWidth = 0;
        ctx.fillStyle = fillColor;
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fill();
    }
    /**
     * コンテキストの取得
     */
    function _getContext() {
        return _getElementById(_ID_CANVAS).getContext('2d');
    }
    /**
     * キャンバスのクリア
     */
    function _clearCanvas() {
        _getContext().clearRect(0, 0, _styleCanvasWidth, _styleCanvasHeight);
    }

    /***************************************************************************/
})();
