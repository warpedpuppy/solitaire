
export default class Marker extends PIXI.Container {
    constructor () {
        super();
        let marker = new PIXI.Sprite(PIXI.Texture.from('/bmps/marker.png'));
        this.marker = true;
        this.addChild(marker)
    }
}