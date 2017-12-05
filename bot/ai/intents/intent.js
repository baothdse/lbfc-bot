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
const MONEY_TEEN_CODE_2 = 39;
const POSTBACK_NUT_CHON_EXTRA = 47;
const CUM_TU = 8;
const POSTBACK_CHON_KHUYEN_MAI = 20;
const ADDRESS_USE = 49;
const ADDRESS_REFUSE = 50;
class Intent {

    /**
     * 
     * @param {{DialogId: number, Exception: number, Id: number, Step: number, PatternGroup: number, Results: {}}} intent 
     */
    static analyze(intent) {
        ConsoleLog.log(`Intent #${intent.Id} detected`, 'intent.js', 23);
        switch (intent.Id) {
            case Enums.BEGIN_ORDER_INTENT_ID(): return { step: intent.Step, exception: intent.Exception }; break;
            case Enums.RECEIVE_FULL_ORDER_INTENT_ID(): return this.receiveFullOrderIntent(intent.Step, intent.Exception, intent.Results, intent.PatternGroup); break;
            case Enums.POSTBACK_ORDER_INTENT_ID(): return this.postbackOrderIntent(intent.Step, intent.Exception, intent.Results, intent.PatternGroup); break;
            case Enums.SEARCH_PRODUCT_NAME_INTENT_ID(): return { step: intent.Step, exception: intent.Exception }; break;
            case Enums.SELECT_PRICE_RANGE_INTENT_ID(): return this.selectPriceRangeIntent(intent.Step, intent.Exception, intent.Results, intent.PatternGroup); break;
            case Enums.SHOW_PROMOTION_INTENT_ID(): return { step: intent.Step, exception: intent.Exception }; break;
            case Enums.SHOW_NEAREST_STORE_INTENT_ID(): return { step: intent.Step, exception: intent.Exception }; break;
            case Enums.SHOW_CHAIN_STORE_INTENT_ID(): return { step: intent.Step, exception: intent.Exception }; break;
            case Enums.ADD_EXTRA_INTENT_ID(): return this.postbackExtraIntent(intent.Step, intent.Exception, intent.Results, intent.PatternGroup); break;
            case Enums.POSTBACK_APPLY_PROMOTION_INTENT_ID(): return this.postbackApplyPromotion(intent.Step, intent.Exception, intent.Results, intent.PatternGroup); break;
            case Enums.POSTBACK_CONFIRM_DELIVERY_LOCATION_INTENT_ID(): return this.postbackConfirmDeliveryLocation(intent.Step, intent.Exception, intent.Results, intent.PatternGroup); break;
            default: return null;
        }
    }

    /**
     * @param {string} input
     * @param {[{DialogId: number, Exception: number, Id: number, Step: number, Patterns: [{Id: number, MatchBegin: boolean, MatchEnd: boolean, Group: number, Entities: [{Id, Words}]}]}]} intents 
     * @returns {{DialogId: number, Exception: number, Id: number, Step: number, PatternGroup: number, Results: {}}}
     */
    static getSuitableIntent(input, intents) {
        let maxElements = -1;

        /**
         * @type {{DialogId: number, Exception: number, Id: number, Step: number, Patterns: [{Id: number, MatchBegin: boolean, MatchEnd: boolean, Entities: [{Id, Words}]}]}}
         */
        let matchIntent = null;

        let matchPattern = null;

        /**
         * @type {{}}}
         */
        let matches = null;
        let specialValues = ""; //when the entity simply just want some words

        intents.forEach((intent) => {
            intent.Patterns.forEach((pattern) => {
                let hasUnknwonPhrase = false;
                let matchesTmp = {};
                let inputTmp = input.trim();
                for (var i = 0; i < pattern.Entities.length; i++) {
                    /**
                     * @type {RegExp}
                     */
                    let regex = null;
                    if (pattern.Entities[i].Words == ".*?") {
                        specialValues = inputTmp;
                    }
                    else {
                        if (pattern.MatchBegin && pattern.MatchEnd && pattern.Entities.length == 1) {
                            regex = new RegExp("(?:^|\\W)^(" + pattern.Entities[i].Words + ")$(?:$|\\W)", 'i');
                        }
                        else if (i == pattern.Entities.length - 1 && pattern.MatchEnd) {
                            regex = new RegExp("(?:^|\\W)(" + pattern.Entities[i].Words + ")$(?:$|\\W)", 'i');
                        }
                        else if (specialValues == "") {
                            regex = new RegExp("(?:^|\\W)^(" + pattern.Entities[i].Words + ")(?:$|\\W)", 'i');
                        }
                        else {
                            regex = new RegExp("(?:^|\\W)" + pattern.Entities[i].Words + "(?:$|\\W)", 'i');
                        }

                        let result = regex.exec(inputTmp);

                        if (result != null) {
                            if (matchesTmp[pattern.Entities[i].Id] != null) {
                                matchesTmp[pattern.Entities[i].Id] = matchesTmp[pattern.Entities[i].Id] + ";" + result[0];
                            } else {
                                matchesTmp[pattern.Entities[i].Id] = result[0];
                            }
                            if (specialValues != "") {
                                matchesTmp[8] = specialValues.substring(0, specialValues.length - result[0].length).trim();
                                specialValues = "";
                            }
                            if (i == pattern.Entities.length - 1) {
                                if ((!hasUnknwonPhrase && Object.keys(matchesTmp).length > maxElements) || (hasUnknwonPhrase && Object.keys(matchesTmp).length - 1 > maxElements)) {
                                    matchIntent = intent;
                                    matchPattern = pattern;
                                    maxElements = hasUnknwonPhrase ? Object.keys(matchesTmp).length - 1 : Object.keys(matchesTmp).length;
                                    matches = matchesTmp;
                                    if (result.index + result[0].trim().length + 1 < inputTmp.length) {
                                        specialValues = inputTmp.substring(result.index + result[0].trim().length + 1);
                                    }
                                    break;
                                }
                            }
                            else {
                                if (result.index + result[0].trim().length + 1 < inputTmp.length) {
                                    inputTmp = inputTmp.substring(result.index + result[0].trim().length + 1);
                                }
                            }
                        }
                        else {
                            break;
                        }
                    }

                }
                if (specialValues != "") {
                    if (matches == null && (!hasUnknwonPhrase && Object.keys(matchesTmp).length > maxElements) || (hasUnknwonPhrase && Object.keys(matchesTmp).length - 1 > maxElements)) {
                        matches = matchesTmp;
                        matchIntent = intent;
                        matchPattern = pattern;
                        matches[8] = specialValues.trim();
                        maxElements = hasUnknwonPhrase ? Object.keys(matchesTmp).length - 1 : Object.keys(matchesTmp).length;
                    } else if (matches != null && matches[8] == null && (!hasUnknwonPhrase && Object.keys(matchesTmp).length > maxElements) || (hasUnknwonPhrase && Object.keys(matchesTmp).length - 1 > maxElements)) {
                        matches[8] = specialValues.trim();
                        matchIntent = intent;
                        maxElements = hasUnknwonPhrase ? Object.keys(matchesTmp).length - 1 : Object.keys(matchesTmp).length;
                        matchPattern = pattern;
                    }
                    specialValues = "";
                }
            });
        });

        return {
            DialogId: matchIntent == null ? 0 : matchIntent.DialogId,
            Exception: matchIntent == null ? 0 : matchIntent.Exception,
            Id: matchIntent == null ? 0 : matchIntent.Id,
            Step: matchIntent == null ? 0 : matchIntent.Step,
            PatternGroup: matchPattern == null ? 0 : matchPattern.Group,
            Results: matches,
        };
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

    static postbackExtraIntent(step, exception, results, patternGroup) {
        switch (patternGroup) {
            case 1:
                ConsoleLog.log(results, 'intent.js', 48);
                var extraId = results[POSTBACK_NUT_CHON_EXTRA].split("$")[1].trim();
                var info = results[CUM_TU].split("$");
                var productName = info[1].trim();
                var price = info[2].trim();

                return {
                    productId: parseInt(extraId),
                    productName: productName,
                    price: price,
                    step: this.step,
                    exception: this.exception,
                }
            default: return null;
        }
    }

    static selectPriceRangeIntent(step, exception, results, patternGroup) {
        var fromPrice = 0;
        var toPrice = 0;
        switch (patternGroup) {
            case 1:
                let info = results[SO].split(";");
                fromPrice = parseInt(info[0]) * 10000;
                toPrice = parseInt(info[1]) * 10000;
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
            // case 7: 
            //     var priceRange = results[MONEY_TEEN_CODE_2].match(/\d+/g);
            //     fromPrice = 0;
            //     toPrice = 0;
            //     console.log(priceRange)
            //     if (priceRange.length < 2) {
            //         fromPrice = 0;
            //         toPrice = priceRange[0] * 1000;
            //     } else {
            //         fromPrice = priceRange[0] * 1000;
            //         toPrice = priceRange[1] * 1000;
            //     }
            //     return {
            //         fromPrice: fromPrice,
            //         toPrice: toPrice,
            //         step,
            //         exception,
            //     }
            default: return null;
        }
    }

    static postbackApplyPromotion(step, exception, results, patternGroup) {
        var promotionCode = results[POSTBACK_CHON_KHUYEN_MAI].substring('promotion select \$'.length, results[POSTBACK_CHON_KHUYEN_MAI].length);
        return {
            promotionCode: promotionCode,
            step,
            exception,
        }
    }

    static postbackConfirmDeliveryLocation(step, exception, results, patternGroup) {
        switch (patternGroup) {
            case 1:
                let address = results[CUM_TU];
                return {
                    address: address,
                    step,
                    exception,
                }
                break;
            case 2:
                return {
                    step,
                    exception,
                }
                break;
            default: break;
        }
    }

}

module.exports = Intent