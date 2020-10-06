
import VARS from './utils/Vars.class.js';
import SOLITARE from './Solitaire.class.js';
import Tweening from './utils/Tweening.class.js';
import Drag from './card-movements/Drag.class.js';
(function(){


        const app = new PIXI.Application({
            width: VARS.canvasWidth, height: VARS.canvasWidth, transparent: true, resolution: window.devicePixelRatio || 1,
        });
        document.getElementById("home-canvas").appendChild(app.view);
        app.ticker.add(ticker);


        const solitaire = new SOLITARE(app);
        app.stage.addChild(solitaire.gameBoard);


    function ticker (delta) {
        Tweening.animate();
        Drag.animate();
    }

})()