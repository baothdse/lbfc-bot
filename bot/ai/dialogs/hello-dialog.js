"use strict";

let Dialog = require('./dialog');
let Pattern = require('./entities/pattern');

class HelloDialog extends Dialog() {
    constructor() {
        super();
        this.push();
    }

    push() {
        this.patterns.push(new Pattern.Pattern("hello", 1));
        this.patterns.push(new Pattern.Pattern("xin chào", 1));
        this.patterns.push(new Pattern.Pattern("chao xìn", 1));
        this.patterns.push(new Pattern.Pattern("halo", 1));
        this.patterns.push(new Pattern.Pattern("hé lô", 1));
        this.patterns.push(new Pattern.Pattern("hé nhô", 1));
        this.patterns.push(new Pattern.Pattern("hi", 1));
        this.patterns.push(new Pattern.Pattern("alo", 1));
        this.patterns.push(new Pattern.Pattern("ê", 1));
        this.patterns.push(new Pattern.Pattern("ê mày", 1));
        this.patterns.push(new Pattern.Pattern("chào", 1));
        this.patterns.push(new Pattern.Pattern("hey", 1));
        this.patterns.push(new Pattern.Pattern("a ey", 1));
    }
}