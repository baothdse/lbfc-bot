let ClassParser = require('../utils/class-parser');
let Brain = require('../brain');
let Pattern = require('./patterns/pattern');
const EditDistance = require('../utils/edit-distance');
const Enums = require('../enum');
const ConsoleLog = require('../utils/console-log');


const GIOI_TU = 25;
const SO = 5;
const DOZEN = 26;
const HUNDRED = 27;
const MONEY_TEEN_CODE = 28;
const DAU_GACH_NGANG = 29;
class Intent {

    /**
     * 
     * @param {{DialogId: number, Exception: number, Id: number, Step: number, PatternGroup: number, Results: {}}} intent 
     */
    static analyze(intent) {
        switch (intent.Id) {
            case Enums.BEGIN_ORDER_INTENT_ID(): return { step: intent.Step, exception: intent.Exception }; break;
            case Enums.RECEIVE_FULL_ORDER_INTENT_ID(): return this.receiveFullOrderIntent(intent.Step, intent.Exception, intent.Results, intent.PatternGroup); break;
            case Enums.POSTBACK_ORDER_INTENT_ID(): return this.postbackOrderIntent(intent.Step, intent.Exception, intent.Results, intent.PatternGroup); break;
            case Enums.SEARCH_PRODUCT_NAME_INTENT_ID(): return { step: intent.Step, exception: intent.Exception }; break;
            case Enums.SELECT_PRICE_RANGE_INTENT_ID(): return this.selectPriceRangeIntent(intent.Step, intent.Exception, intent.Results, intent.PatternGroup); break;
            case Enums.SHOW_PROMOTION_INTENT_ID(): return { step: intent.Step, exception: intent.Exception }; break;

            default: return null;
        }
    }


    static receiveFullOrderIntent(step, exception, results, patternGroup) {
        switch (patternGroup) {
            case 1: case 2: case 4: case 5:
                return {
                    'productName': results[8],
                    'quantity': results[5],
                    'step': step,
                    'exception': exception
                };
                break;
            case 6:
                return {
                    'productName': results[8],
                    'quantity': 1,
                    'step': step,
                    'exception': exception
                };
                break;
            default: return null;
        }
    }

    static postbackOrderIntent(step, exception, results, patternGroup) {
        switch (patternGroup) {
            case 1:
                ConsoleLog.log(results, 'intent.js', 48);
                var info = results['8'].split("$");
                var productId = results['19'].split("$")[1];
                var productName = info[1].trim();
                var price = info[2].trim();
                var productUrl = info[3].trim();
                var productCode = info[4].trim();

                return {
                    productId: parseInt(productId),
                    productName: productName,
                    price: price,
                    productUrl: productUrl,
                    productCode: productCode,
                    step: this.step,
                    exception: this.exception,
                }
            default: return null;
        }
    }

    static selectPriceRangeIntent(step, exception, results, patternGroup) {
        switch (patternGroup) {
            case 1:
                let info = results[SO].split(";");
                let fromPrice = parseInt(info[0]) * 10000;
                let toPrice = parseInt(info[1]) * 10000;
                return {
                    step,
                    exception,
                    fromPrice,
                    toPrice,
                }
                break;
            case 2:
                info = results[SO].split(";");
                fromPrice = parseInt(info[0]) * 100000;
                toPrice = parseInt(info[1]) * 100000;
                return {
                    step,
                    exception,
                    fromPrice,
                    toPrice,
                }
                break;
            case 3:
                fromPrice = 0;
                toPrice = 0;
                if (results[GIOI_TU].match(/(trên|từ)/i)) {
                    fromPrice = results[SO] * 10000;
                    toPrice = results[SO] * 10000 + 10000;
                } else if (results[GIOI_TU].match(/(dưới|tầm|khoảng)/i)) {
                    toPrice = results[SO] * 10000
                }
                return {
                    fromPrice,
                    toPrice,
                    step,
                    exception,
                };
                break;
            case 4:
                fromPrice = 0;
                toPrice = 0;
                if (results[GIOI_TU].match(/(trên|từ)/i)) {
                    fromPrice = results[SO] * 100000;
                    toPrice = results[SO] * 100000 + 100000;
                } else if (results[GIOI_TU].match(/(dưới|tầm|khoảng)/i)) {
                    toPrice = results[SO] * 100000
                }
                return {
                    fromPrice,
                    toPrice,
                    step,
                    exception,
                };
                break;
            default: return null;
        }
    }

}

module.exports = Intent