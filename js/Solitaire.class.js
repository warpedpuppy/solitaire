import Slot from './visual-assets/Slot.class.js';
import Deck from './visual-assets/Deck.class.js';
import Marker from './visual-assets/Marker.class.js';
import ListenerManager from './card-movements/Listener-Manager.class.js';
import VARS from './utils/Vars.class.js';
import TESTING from './utils/Testing.class.js';

export default class Solitare {
    buffer = 10;
    buffer_larger = 40;
    slot_spacer = 100;
    deck = [];
    piles = {};
    pileMarkers = [];
    resetDrawPileButton = undefined;
    drawPile = [];
    topDrawPileCard = undefined;
    slotCont = new PIXI.Container();
    flipPile = [];
    topFlipPileCard = undefined;
    gameBoard = new PIXI.Container();
    app = undefined;
    slots = [];
    startX = 0;
    startY = 0;
    loopingQ = 7;
    rows = 7;
    totalColumns = 7;
    constructor(app) {
        this.deck = new Deck();
        this.startY = VARS.cardWidth + this.buffer_larger;
        this.startY = VARS.cardHeight + this.buffer_larger;
        this.deal();
        this.app = app;

        ListenerManager.setRoot(this);
    }
    deal() {

        this.gameBoard.removeChildren();

        this.shuffle();

        // CARD PILES
        let numberOfCardsDealt = this.createCardPiles();

        this.createDrawPileResetButton();

        // DRAW PILE
        let remainingCards = this.deck.slice(numberOfCardsDealt, 52)
        this.createDrawPile(remainingCards, true);

        // SLOTS 
        this.createSlots();

        // PLACEMENT
        this.gameBoard.x = (VARS.canvasWidth - this.gameBoard.width) / 2;
        this.gameBoard.y = 20;

    }

    shuffle() {
        this.deck = _.shuffle(this.deck);
    }

    createSlots() {
        for (let i = 0; i < 4; i++) {
            let slot = new Slot(VARS.suits[i]);
            slot.x = (VARS.cardWidth + this.slot_spacer) * i;
            this.slots.push(slot)
            this.slotCont.addChild(slot);
        }
        this.slotCont.x = (this.gameBoard.width - this.slotCont.width) / 2;
        this.gameBoard.addChild(this.slotCont)
    }

    createCardPiles(obj) {
        let cardCounter = 0;

        for (let i = 0; i < this.loopingQ; i++) {
            let marker = new Marker();
            marker.index = i;
            marker.x = this.startX + (VARS.cardWidth + this.buffer) * i;
            marker.y = this.startY;
            this.gameBoard.addChild(marker);
            this.piles[i] = [marker]
        }
        let card;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.loopingQ; j++) {

                card = this.deck[cardCounter];
                card.x = this.startX + (VARS.cardWidth + this.buffer) * j;
                card.y = this.startY + (this.buffer * i);
                this.gameBoard.addChild(card);
                cardCounter++;

                //index is the key in the object for the piles of cards.  the values will be arrays of the cards in that pile
                let index = (this.totalColumns - this.loopingQ) + j;
                card.index = index;

                card.drawPile = false;

                this.piles[index].push(card)

                if (j === 0) {
                    card.reveal(true);
                    card.makeInteractive(true)
                    ListenerManager.addDrag(card);
                }
            }

            this.loopingQ--;

            this.startX += VARS.cardWidth + this.buffer;
        }

        return cardCounter;
    }

    createDrawPileResetButton(startY) {
        this.resetDrawPileButton = new Marker();
        this.resetDrawPileButton.x = 0;
        this.resetDrawPileButton.y = startY;
        this.resetDrawPileButton.visible = false;
        this.gameBoard.addChild(this.resetDrawPileButton);
    };
    createDrawPile(arr, init) {

        let c, tempStartY = this.startY;
        arr.forEach(card => {
            card.x = 0;
            card.y = tempStartY;
            card.reveal(false);
            this.gameBoard.addChild(card);
            tempStartY += 0.25;
            card.isDrawPile(true);
            if (init) this.drawPile.push(card);
            c = card;
        })

        TESTING.printDeck(this.drawPile)
        this.topDrawPileCard = c;
        ListenerManager.addFlip(this.topDrawPileCard);

    }
    revealNextCard(arr) {
        if (arr.length) {
            let finalIndex = arr.length - 1;
            let newTopCard = arr[finalIndex];
            //console.log("add listener to ", newTopCard.suit, newTopCard.rank)
            if (!newTopCard.marker) {
                newTopCard.reveal(true);

                ListenerManager.addDrag(newTopCard);
            }
        }
    };
}