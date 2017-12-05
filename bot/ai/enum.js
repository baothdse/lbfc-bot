
class Enums {

    constructor() { }

    static REDIS_KEY() {
        return 'BotIntents';
    }

    static ORDER_DIALOG_ID() { return 2; }
    static APPLY_PROMOTION_DIALOG_ID() { return 6; }
    static ASK_DELIVERY_DIALOG_ID() { return 7; }
    static ASK_FOR_MEMBERSHIP_DIALOG_ID() { return 8; }
    static CHANGE_ORDER_DIALOG_ID() { return 9; }
    static HELLO_DIALOG_ID() { return 4; }
    static ONE_STEP_DIALOG_ID() { return 10; }
    static SEARCH_PRODUCT_NAME_DIALOG_ID() { return 11; }
    static SHOW_MEMBERSHIP_EVENT_DIALOG_ID() { return 5; }
    static SHOW_MENU_DIALOG_ID() { return 12; }
    static SHOW_ORDER_DETAIL_DIALOG_ID() { return 13; }
    static SHOW_ORDER_HISTORY_DIALOG_ID() { return 14; }
    static SHOW_PROMOTION_DIALOG_ID() { return 15; }
    static SHOW_STORE_DIALOG_ID() { return 3; }
    static ASK_OPEN_CLOSE_TIME_DIALOG_ID() { return -1; }
    static SHOW_POPULAR_PRODUCT_DIALOG_ID() { return -1; }
    static SHOW_NEAREST_STORE_DIALOG_ID() { return 16; }


    static ADD_EXTRA_INTENT_ID() { return 18; }
    static ASK_FOR_DELIVERY_TIME_INTENT_ID() { return -1; }
    static BEGIN_ORDER_INTENT_ID() { return 1; }
    static POSTBACK_ORDER_INTENT_ID() { return 8; }
    static POSTBACK_SHOW_ORDER_DETAIL_INTENT_ID() { return -1; }
    static RECEIVE_FULL_CHANGE_ORDER_INTENT_ID() { return -1; }
    static RECEIVE_FULL_ORDER_INTENT_ID() { return 6; }
    static RECEIVE_PRODUCT_NAME_INTENT_ID() { return -1; }
    static RECEIVE_STORE_NAME_ID() { return -1; }
    static REQUEST_FINISH_ORDER_INTENT_ID() { return -1; }
    static SHOW_MY_ORDER_HISTORY_INTENT_ID() { return -1; }
    static SEARCH_PRODUCT_NAME_INTENT_ID() { return 9; }
    static SELECT_PRICE_RANGE_INTENT_ID() { return 10; }
    static SHOW_PROMOTION_INTENT_ID() { return 11; }
    static SHOW_NEAREST_STORE_INTENT_ID() { return 14; }
    static SHOW_CHAIN_STORE_INTENT_ID() { return 17; }
    static POSTBACK_APPLY_PROMOTION_INTENT_ID() { return 19; }
    
    static LIKE_ICON_URL() {return 'https://www.shareicon.net/data/128x128/2016/07/09/119075_thumb_512x512.png';}
    static DISLIKE_ICON_URL() {return 'https://www.shareicon.net/data/128x128/2015/11/05/667168_hand_512x512.png';}
}

module.exports = Enums