var fs = require('fs');
var lm = require('./LM');
var Graph = require('./graph');

class VietNameseConverter {
    constructor() {
        this.graph = new Graph();
        this.readFile();
    }

    readFile() {
        var array = [];
        var that = this;
        fs.readFile("completed.txt", 'utf8', function (err, data) {
            if (err) {
                console.log("Error: " + err);
            }
            array = data.split('\n').filter(Boolean);
            for (var i = 0; i < array.length; i++) {
                var strArray = array[i].split(';');
                var original = strArray[0].trim().split(' ');
                var translated = strArray[1].trim().split(' ');
                var P = strArray[2].trim() * 1;
                if (original.length > 1) {
                    var first = new lm.LM(original[0], translated[0]);
                    var second = new lm.LM(original[1], translated[1]);
                    that.graph.add(first, second, P, i);
                }
            }
        });
    }

    convert(input) {
        var s = "";
        var strArray = input.split(' ');
        s = this.graph.find(input);
        return s == "" ? "Toi khong hieu" : s;
    }
}

module.exports = VietNameseConverter