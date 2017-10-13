"use strict";

let DaiTu = require('../entities/dai-tu');
let YeuCau = require('../entities/yeu-cau');
let DatHang = require('../entities/dat-hang');
let DonVi = require('../entities/don-vi');
let Number = require('../entities/number');
let End = require('../entities/end');


class DynamicClass {
    constructor(name) {
        switch(name) {
            case "DaiTu": return new DaiTu.DaiTu(); break;
            case "YeuCau": return new YeuCau.YeuCau(); break;
            case "DatHang": return new DatHang.DatHang(); break;
            case "DonVi": return new DonVi.DonVi(); break;
            case "Number": return new Number.Number(); break;
            case "End": return new End(); break;
            default: break;
        }
    }
}

module.exports  = {
    DynamicClass : DynamicClass
}