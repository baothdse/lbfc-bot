let ClassParser = require('../utils/class-parser');
let Brain = require('../brain');
let Pattern = require('./patterns/pattern');
const EditDistance = require('../utils/edit-distance');
const Enums = require('../enum');
class Intent {

    /**
     * 
     * @param {{DialogId: number, Exception: number, Id: number, Step: number, PatternGroup: number, Results: {}}} intent 
     */
    static analyze(intent) {
        switch (intent.Id) {
            case Enums.BEGIN_ORDER_INTENT_ID(): return { step: intent.Step, exception: intent.Exception }; break;
            case Enums.RECEIVE_FULL_ORDER_INTENT_ID(): return this.receiveFullOrderIntent(intent.Step, intent.Exception, intent.Results, intent.PatternGroup)
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
            default: return null; 
        }
    }


}

module.exports = Intent