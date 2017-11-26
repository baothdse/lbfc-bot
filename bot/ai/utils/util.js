class Util {

    constructor() {}

    static findElementInArray(element, array) {
        let result = null;
        array.some((a) => {

            if (a.key == element) {
                result = a;
                return true;
            }
        });
        return result;
    } 

}

module.exports = Util