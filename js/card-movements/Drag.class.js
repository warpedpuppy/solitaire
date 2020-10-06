import Vars from '../utils/Vars.class.js';
import PileToPile from './Pile-to-Pile.class.js';
import PileToSlot from './Pile-to-Slot.class.js';
import Testing from '../utils/Testing.class.js';
import Tweening from '../utils/Tweening.class.js';
import Utils from '../utils/Utils.class.js';
export default class Drag {
    static activeCard = undefined;
    static dragCont = new PIXI.Container();
    tempGraphics =  new PIXI.Graphics();
    stage = undefined;
    parent = undefined;
    drawPile = undefined;
    root = undefined;
    static e = undefined;
    static setRoot(root) {
        this.root = root;
        PileToSlot.setRoot(root);
        PileToPile.setRoot(root);
    }
    static onDragStart (e) {

        this.activeCard = e.target;



        let arr = (!this.activeCard.drawPile) ? this.root.piles[this.activeCard.index] : this.root.flipPile,
            globalPoint = this.activeCard.getGlobalPosition(new PIXI.Point(this.activeCard.x, this.activeCard.y)),
            activeCardIndex = arr.indexOf(this.activeCard), 
            yOffset = 0;

        if (Vars.animate) {
            let lp = e.data.getLocalPosition(this.activeCard)
            this.activeCard.pivot.x = lp.x;
            this.activeCard.pivot.y = lp.y;
            this.dragCont.x = this.dragCont.y =  0;
        } else {
            this.dragCont.x = globalPoint.x;
            this.dragCont.y = globalPoint.y;
            this.dragCont.adjustX = Math.abs(e.data.global.x - globalPoint.x);
            this.dragCont.adjustY = Math.abs(e.data.global.y - globalPoint.y);
        }

       
        this.activeCard.storePos = {x: this.activeCard.x, y: this.activeCard.y};
        
        for (let i = activeCardIndex; i < arr.length; i++) {
                arr[i].storePos = {x: arr[i].x, y: arr[i].y};
                if (!Vars.animate) arr[i].x = 0;
                arr[i].rotation = 0;
                arr[i].y = yOffset * 40;
                this.dragCont.addChild(arr[i]);
                yOffset++;
        }


        this.root.app.stage.addChild(this.dragCont)

        Testing.beingCarried(this.dragCont.children)

    }
    static onDragEnd (e) {

        if (!this.activeCard) return;

        let activeCardObj = Vars.globalObject(this.activeCard),
            slotHitObject = PileToSlot.slotHitListener(activeCardObj, this),
            pileHitObject = PileToPile.movePileListener(activeCardObj, this.activeCard);
            
         if (this.dragCont.children.length === 1 && slotHitObject.hit) {
                let slot = slotHitObject.slot;
                PileToSlot.addCardToSlot(slot, this);
         } else if (pileHitObject.hit) {
                PileToPile.movePiles(pileHitObject.topCard, pileHitObject.key, this);
         } else {
                let tempArray = [...this.dragCont.children];
                if (!Vars.animate) {
                    tempArray.forEach( card => {
                        card.x = card.storePos.x;
                        card.y = card.storePos.y;
                        this.root.gameBoard.addChild(card)
                    })
                } else {
                    this.sendCardsBackWithAnimation(e, tempArray);
                }
            
         }

        this.dragCont.removeChildren();
        this.activeCard = undefined;
        this.root.app.stage.removeChild(this.dragCont);

        Testing.howManyListeners(this.root.deck)
    }
    static sendCardsBackWithAnimation (e, tempArray) {
        tempArray.forEach( card => {
            card.pivot.x = card.pivot.y = 0;
            let tempX = e.data.global.x - this.root.gameBoard.x,
                tempY = e.data.global.y - this.root.gameBoard.y;
            card.makeInteractive(false)
            Tweening.tween(card, Utils.randomNumberBetween(0.5, 0.95), 
                {
                    x: [tempX, card.storePos.x], 
                    y: [tempY, card.storePos.y],
                     rotation: [card.rotation, 0]
                }, this.onTweenComplete.bind(this, card), 'bouncePast')
            this.root.gameBoard.addChild(card)
        })
    }
    static onTweenComplete (card) {

        card.makeInteractive(true)
        card.x = card.storePos.x;
        card.y = card.storePos.y;
        card.rotation = 0;
        
    }
    static onDragMove (e) {
        if (this.activeCard && !Vars.animate) {
            const newPosition = e.data.getLocalPosition(this.dragCont.parent);
            this.dragCont.x = newPosition.x - this.dragCont.adjustX;
            this.dragCont.y = newPosition.y - this.dragCont.adjustY;
        } else {
            this.e = e;
        }
    }
    static addDrag (item) {

        if (item._eventsCount > 1) return;
        item.makeInteractive(true)
        item
        .on('pointerdown', this.onDragStart.bind(this))
        .on('pointerup', this.onDragEnd.bind(this))
        .on('pointerupoutside', this.onDragEnd.bind(this))
        .on('pointermove', this.onDragMove.bind(this))

        item.hasDrag = true;
    }
    static animate () {
        let e = this.e;
        if (this.activeCard) {
            const newPosition = e.data.getLocalPosition(this.root.app.stage);
            this.dragCont.x = this.dragCont.y = 0;
            let arr = this.dragCont.children;
            
            let posObject = {
                x: newPosition.x, 
                y: newPosition.y
            }

            this.moveCard(arr[0], posObject, 0);
            let i, cardA, cardB;
            arr[0].x = newPosition.x;
            arr[0].y = newPosition.y;
           // console.log(newPosition.x, arr[0].storePos.x)
            let yOffset = 1;
            for (i = 1; i < arr.length; i++) {
                cardA = arr[i-1];
                cardB = arr[i];
                cardB.pivot.x = cardA.pivot.x;
                let yVal = yOffset * 10;
                this.moveCard(cardB, cardA, yVal);
                yOffset ++;
            };
        }
    }
    static moveCard (card, priorCard, yValAdjust) {
        var tempBallBody = card;
        card.vx += (priorCard.x - tempBallBody.x) * 0.1;
        card.vy += (priorCard.y - tempBallBody.y) * 0.1;
        card.vy += 2.5;
        card.vx *= 0.8;
        card.vy *= 0.8;
        tempBallBody.x += card.vx;
        tempBallBody.y += (card.vy + yValAdjust);
        let deg = Utils.deg2rad(card.vx);
        console.log(deg, priorCard.x, tempBallBody.x)
        if (Math.abs(priorCard.x - tempBallBody.x) < 10) card.rotation = (deg * 2);
    }
}