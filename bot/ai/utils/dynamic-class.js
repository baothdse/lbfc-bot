"use strict";

let DaiTu = require('../entities/dai-tu');
let YeuCau = require('../entities/yeu-cau');
let DatHang = require('../entities/dat-hang');
let DonVi = require('../entities/don-vi');
let Number = require('../entities/number');
let End = require('../entities/end');
let Tim = require('../entities/tim');
let DongTu = require('../entities/dong-tu');

class DynamicClass {
    constructor(name) {
        switch(name) {
            case "DaiTu": return new DaiTu.DaiTu(); break;
            case "YeuCau": return new YeuCau.YeuCau(); break;
            case "DatHang": return new DatHang.DatHang(); break;
            case "DonVi": return new DonVi.DonVi(); break;
            case "Number": return new Number.Number(); break;
            case "End": return new End(); break;
            case "Tim": return new Tim(); break;
            case "DongTu": return new DongTu(); break;
            case "Adverb": return new Adverb(); break;
            default: break;
        }
    }
}

module.exports  = {
    DynamicClass : DynamicClass
}