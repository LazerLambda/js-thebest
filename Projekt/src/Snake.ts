export default class Snake {
    constructor() {
        console.log('Constructing Snake.');

        this.addInteger(44);
    }

    addInteger(number: number) {
        return 4 + number;
    }
}