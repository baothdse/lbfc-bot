let Intent = require('../intent');

class ConfirmExtraQuantityIntent extends Intent {
    constructor(step, exception) {
        super(step, exception)
        this.addPatterns(['mỗi', 'DonVi', 'Number', 'DonVi'], 1, true, true);
        this.addPatterns(['Number', 'DonVi', 'Number', 'DonVi'], 2 , true, true);
        this.addPatterns(['mỗi', 'DonVi', 'NumberByWords', 'DonVi'], 3, true, true);
        this.addPatterns(['mỗi', 'DonVi', 'thêm', 'NumberByWords', 'DonVi'], 4, true, true);
        this.addPatterns(['Number', 'DonVi', 'thôi'], 5, true, true);
        this.addPatterns(['NumberByWords', 'DonVi', 'thôi'], 6, true, true);
    }

    getResult(input, match, which, pattern) {
        console.log('====STANDING AT ConfirmExtraQuantityIntent INTENT=====')
        console.log('MATCH PATTERN = ' + which)
        console.log(input)
        console.log(match)
        console.log(pattern)
        let result = null;
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            case 2: result = this.matchPattern2(input, match, pattern); break;
            case 3: result = this.matchPattern3(input, match, pattern); break;
            case 4: result = this.matchPattern4(input, match, pattern); break;
            case 5: result = this.matchPattern5(input, match, pattern); break;
            case 6: result = this.matchPattern6(input, match, pattern); break;
            default: break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        let quantityArray = input.match(/\d+/i);
        console.log("QUANTITY Array = ")
        console.log(quantityArray)
        return {
            confirmExtraQuantity : quantityArray[0],
            step: this.step,
            exception: this.exception
        }

    }
    matchPattern2(input, match, pattern) {
        let quantityArray = input.match(/\d+/i);
        console.log("QUANTITY Array = ")
        console.log(quantityArray)
        return {
            confirmExtraQuantity : quantityArray[1],
            step: this.step,
            exception: this.exception
        }
    }
    matchPattern3(input, match, pattern) {
        let extraQuantityByWord =  input.split(' ');
        console.log("EXTRA QUANTIY BY WORD = ")
        console.log(extraQuantityByWord)
        return {
            confirmExtraQuantityByWord : extraQuantityByWord[2],
            step: this.step,
            exception: this.exception
        }
    }
    matchPattern4(input, match, pattern) {
        let extraQuantityByWord =  input.split(' ');
        console.log("EXTRA QUANTIY BY WORD = ")
        console.log(extraQuantityByWord)
        return {
            confirmExtraQuantityByWord : extraQuantityByWord[3],
            step: this.step,
            exception: this.exception
        }
    }
    matchPattern5(input, match, pattern) {
        let inputArray =  input.split(' ');
        let confirmProductHaveExtra = parseInt(inputArray[0]);
        console.log("CONFIRM PRODUCT HAVE EXTRA = ")
        console.log(confirmProductHaveExtra)
        return {
            confirmProductHaveExtra : confirmProductHaveExtra,
            step: this.step,
            exception: this.exception
        }
    }
    matchPattern6(input, match, pattern) {
        let inputArray =  input.split(' ');
        let confirmProductHaveExtra = inputArray[0];
        console.log("CONFIRM PRODUCT HAVE EXTRA = ")
        console.log(confirmProductHaveExtra)
        return {
            confirmProductHaveExtra : confirmProductHaveExtra,
            step: this.step,
            exception: this.exception
        }
    }
}

module.exports = ConfirmExtraQuantityIntent;