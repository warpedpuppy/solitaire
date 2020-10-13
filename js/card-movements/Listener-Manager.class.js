import DrawPileListeners from './DrawPileListeners.class.js';
import Drag from './Drag.class.js';

export default class ListenerManager {


    static root = undefined;

    static setRoot(root) {
        this.root = root;
        Drag.setRoot(root);
        DrawPileListeners.setRoot(root);
    }

    static removeAllListeners(item) {
        item.makeInteractive(false);
        item.removeAllListeners();
    }
    static addDrag(card) {

        if (card._eventsCount > 1) return;
        card.makeInteractive(true)
        card
            .on('pointerdown', Drag.onDragStart.bind(Drag))
            .on('pointerup', Drag.onDragEnd.bind(Drag))
            .on('pointerupoutside', Drag.onDragEnd.bind(Drag))
            .on('pointermove', Drag.onDragMove.bind(Drag))

    }
    static addFlip(card) {
        card.makeInteractive(true)
        card.on("pointerup", DrawPileListeners.drawPileClickHandler.bind(DrawPileListeners));

    }
    static addResetFlip(button) {
        button.visible = true;
        button.interactive = button.buttonMode = true;
        button.on("pointerup", DrawPileListeners.resetDrawPileHandler.bind(DrawPileListeners))

    }
    static removeResetFlip(button) {
        button.visible = false;
        button.interactive = false;
        button.buttonMode = false;
        button.removeAllListeners();
    }



}