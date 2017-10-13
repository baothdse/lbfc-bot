"use strict";

let DaiTu = require('../entities/dai-tu');
let YeuCau = require('../entities/yeu-cau');
let DatHang = require('../entities/dat-hang');
let DynamicClass= require('./dynamic-class');


class ClassParser {
    constructor(arrayOfClassName) {
        this.arrayOfClassName = arrayOfClassName;
    }

    parse() {


        var arrayOfClasses = [];
        this.arrayOfClassName.forEach(function (name) {
            arrayOfClasses.push(new DynamicClass.DynamicClass(name));
        }, this);

        var newPatterns = [];
        var oldPatterns = [];
        for (var i = 0; i < arrayOfClasses.length; i++) {
            var words = arrayOfClasses[i].getWords();
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

        return oldPatterns;
    }
}

module.exports = {
    ClassParser : ClassParser
}