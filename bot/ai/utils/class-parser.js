"use strict";

let DynamicClass= require('./dynamic-class');


class ClassParser {
    constructor(arrayOfClassName) {
        this.arrayOfClassName = arrayOfClassName;
    }


    /**
     * Parse mấy class về Regex
     * @param {boolean} matchBegin Có cần phải match từ đầu câu không, default = false
     * @param {boolean} matchEnd Có cần phải match vào cuối câu không, default = false
     */
    parse(matchBegin = false, matchEnd = false) {
        var arrayOfClasses = [];
        this.arrayOfClassName.forEach(function (name) {
            arrayOfClasses.push(new DynamicClass(name));
        }, this);

        var newPatterns = [];
        var oldPatterns = [];
        for (var i = 0; i < arrayOfClasses.length; i++) {
            var words = arrayOfClasses[i].words;
            for (var j = 0; j < words.length; j++) {
                if (oldPatterns.length == 0) {
                    newPatterns.push(words[j]);
                } else {
                    for (var k = 0; k < oldPatterns.length; k++) {
                        newPatterns.push(oldPatterns[k] + " " + words[j]);
                    }
                }
            }
            oldPatterns = newPatterns;
            newPatterns = [];
        }

        for (var i = 0; i < oldPatterns.length; i++) {
            if (matchBegin) {
                oldPatterns[i] = '^' + oldPatterns[i];
            }
            if (matchEnd) {
                oldPatterns[i] += '$';
            }
        }
        return oldPatterns;
    }
}

module.exports = ClassParser