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
    static xPositions = [];
    static setRoot(root) {
        this.root = root;
        PileToSlot.setRoot(root);
        PileToPile.setRoot(root);
    }
    static onDragStart (e) {

        this.activeCard = e.target;

        const newPosition = e.data.getLocalPosition(this.root.app.stage);
       

        let arr = (!this.activeCard.drawPile) ? this.root.piles[this.activeCard.index] : this.root.flipPile,
            globalPoint = this.activeCard.getGlobalPosition(new PIXI.Point(this.activeCard.x, this.activeCard.y)),
            activeCardIndex = arr.indexOf(this.activeCard), 
            yOffset = 0;

        if (Vars.animate) {
            let lp = e.data.getLocalPosition(this.activeCard)
            this.activeCard.pivot.x = lp.x;
            this.activeCard.pivot.y = lp.y;
            this.dragCont.x = this.dragCont.y = 0;
        } else {
            this.dragCont.x = globalPoint.x;
            this.dragCont.y = globalPoint.y;
            this.dragCont.adjustX = Math.abs(e.data.global.x - globalPoint.x);
            this.dragCont.adjustY = Math.abs(e.data.global.y - globalPoint.y);
        }
            this.activeCard.x = newPosition.x;
            this.activeCard.y = newPosition.y;
       
        this.activeCard.storePos = {x: this.activeCard.x, y: this.activeCard.y};
        
        for (let i = activeCardIndex; i < arr.length; i++) {
                let card = arr[i];
                card.pivot.x = this.activeCard.pivot.x;
                card.storePos = {x: card.x, y: card.y};

                if (!Vars.animate) {
                    card.x = 0;
                }
                card.rotation = 0;
                card.y = yOffset * 40;
                this.dragCont.addChild(card);
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
                    console.log("here")
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
    
            let tempX = e.data.global.x - this.root.gameBoard.x,
                tempY = e.data.global.y - this.root.gameBoard.y;
            card.makeInteractive(false)
            Tweening.tween(card, Utils.randomNumberBetween(0.5, 0.95), 
                {
                    x: [tempX, card.storePos.x], 
                    y: [tempY, card.storePos.y],
                     rotation: [card.rotation, 0]
                }, this.onTweenComplete.bind(this, card), 'bouncePast')
            Tweening.tween(card.pivot, Utils.randomNumberBetween(0.5, 0.95), 
            {
                x: [card.pivot.x, 0], 
                y: [card.pivot.y, 0]
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
        } else if (this.activeCard) {
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
        
        if (this.activeCard && this.e) {
            let e = this.e;
            const newPosition = e.data.getLocalPosition(this.root.app.stage);

            let arr = this.dragCont.children;
            
            let i, cardB;

            this.xPositions.push(newPosition.x);

            arr[0].x = newPosition.x;
            arr[0].y = newPosition.y;
            arr[0]
           this.rotateCard(, 0);
            let yOffset = 1;
            for (i = 1; i < arr.length; i++) {
                cardB = arr[i];
                cardB.x = newPosition.x;
                cardB.y = newPosition.y + (i * 40);
                this.rotateCard(cardB, i);
                yOffset ++;
            };
        }
    }
    static rotateCard (card,arrayOffset) {
        let lastIndex = this.xPositions.length - 1;
        let startIndex = lastIndex - arrayOffset;
        let nextIndex = startIndex - 5;

        let lastX = this.xPositions[startIndex];
        let nextX = 
            (this.xPositions.length > 10) ? 
            this.xPositions[nextIndex] : 
            this.xPositions[startIndex];

        if(this.xPositions.length > 20) {
            this.xPositions = this.xPositions.slice(-15);
            this.yPositions = this.yPositions.slice(-15);
        }
        let adjust = 0.1 + (arrayOffset * 0.1);
        let deg = Utils.deg2rad((lastX - nextX) * adjust ) 
        card.rotation = deg;

    }
}