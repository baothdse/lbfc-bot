let Intent = require('../intent');

class AddExtraIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['Thêm extra'],1, true, false);
    }

    getResult(input, match, which, pattern) {
        console.log('====STANDING AT GET RESULT ADD EXTRA INTENT===')
        let result = "";
        switch(which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            default: break;
        }
        return result;
    }
    matchPattern1(input, match, pattern) {
        let data = input.split('$', 10);
        console.log(data)
        let productId = data[1]
        let productName = data[2];
        let price = data[3];
        return {
            productId: productId,
            productName: productName,
            price: price,
            step: this.step,
            exception: this.exception
        }
    }
}
module.exports = AddExtraIntent;