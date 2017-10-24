var OekakiCanves = /** @class */ (function () {
    /**
     *
     * @param canvas
     */
    function OekakiCanves(canvas) {
        /* グローバル変数 *********************************************************/
        this.imageData = [];
        this.ctx = null;
        this.canvasElement = null;
        /* 定数設定 */
        this._styleCanvasWidth = 1200;
        this._styleCanvasHeight = this._styleCanvasWidth * 9 / 16;
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
        /* グローバル変数 *********************************************************/
        var imageData = [];
        var ctx = null;
        var canvasElement = null;
    }
    return OekakiCanves;
}());
var canvas = document.getElementById('OekakiCanvas');
var OekakiCanvas = new OekakiCanves(canvas);
