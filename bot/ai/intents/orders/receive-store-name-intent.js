let Intent = require('../intent');
var Request = require('../../utils/request')
var await = require('asyncawait/await')

class ReceiveStoreNameIntent extends Intent {
    constructor(step, exception, session) {
        super(step, exception, session);
        this.addPatterns(["Chọn cửa hàng"], 1, true, false)
        this.addPatterns(['Highlands'], 2, true, false)
        this.addPatterns(['Trung Nguyên'], 2, true, false)
    }

    getResult(input, match, which, pattern) {
        var result = null;
        console.log("Receive Store Name Intent")
        console.log(match)
        console.log(which)
        console.log(pattern)
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            case 2: result = this.matchPattern2(input, match, pattern); break;
            default: break;
        }
        return result
    }

    matchPattern1(input, match, pattern) {
        var info = (input.slice(15, input.length)).split("$", 2);
        var storeId = info[0];
        var storeName = info[1];
        return {
            storeId: storeId,
            storeName: storeName,
            step: this.step,
            exception: this.exception
        };
    }

    matchPattern2(input, match, pattern) {
        return {
            step: this.step,
            exception: this.exception
        }
    }

    levenshteinDistance(a, b) {
        console.log(a)
        console.log(b)
        var string1 = a.toLowerCase()
        var string2 = b.toLowerCase()
        var length1 = string1.length;
        var length2 = string2.length;
        if (length1 == 0) return length2;
        if (length2 == 0) return length1;
        var d = []
        var i, j;
        //i là cột
        for (i = 0; i <= length2; i++) {
            d[i] = [i];
        }
        //j là dòng
        for (j = 0; j <= length1; j++) {
            d[0][j] = j
        }
        for (i = 1; i <= length2; i++) {
            for (j = 1; j <= length1; j++) {
                if (string2.charAt(i - 1) == string1.charAt(j - 1)) {
                    d[i][j] = d[i - 1][j - 1]
                } else {
                    d[i][j] = Math.min(d[i - 1][j - 1] + 1, // substitution
                        Math.min(d[i][j - 1] + 1, // insertion
                            d[i - 1][j] + 1));
                }
            }
        }
        console.log(d[length2][length1])
        return d[length2][length1];
    }
}

module.exports = ReceiveStoreNameIntent;