"use strict";

let DaiTu = require('../entities/dai-tu');
let YeuCau = require('../entities/yeu-cau');
let DongTuDatHang = require('../entities/dong-tu-dat-hang');
let DonVi = require('../entities/don-vi');
let Number = require('../entities/number');
let End = require('../entities/end');
let DanhTuKhuyenMai = require('../entities/danh-tu-khuyen-mai');
let DanhTuChiNoiChon = require('../entities/danh-tu-chi-noi-chon');
let DongTuTinhthai = require('../entities/dong-tu-tinh-thai');
let DongTu = require('../entities/dong-tu');
let DongTuYChi = require('../entities/dong-tu-y-chi');
let GioiTu = require('../entities/gioi-tu');
let PhoTu = require('../entities/pho-tu');
let QuanHeTu = require('../entities/quan-he-tu');
let ThanTu = require('../entities/than-tu');
let TinhThaiTu = require('../entities/tinh-thai-tu');
let TinhTu = require('../entities/tinh-tu');
let DanhTuCuaHang = require('../entities/danh-tu-cua-hang');
let DongTuTimKiem = require('../entities/dong-tu-tim-kiem');
let DanhTuDonHang = require('../entities/danh-tu-don-hang');
let Dozen = require('../entities/don-vi-tien/dozen')
let Hundred = require('../entities/don-vi-tien/hundred')
let MoneyTeenCode = require('../entities/money-teen-code')
let DongTuGiaoHang = require('../entities/dong-tu-giao-hang');
let DanhTuChiKhachHang = require('../entities/danh-tu-chi-khach-hang');
let ChiTuGiNao = require('../entities/chi-tu-gi-nao');
let NumberByWords = require('../entities/number-by-words');

class DynamicClass {
    constructor(name) {
        switch (name) {
            case "DaiTu": return new DaiTu(); break;
            case "YeuCau": return new YeuCau(); break;
            case "DongTuDatHang": return new DongTuDatHang(); break;
            case "DonVi": return new DonVi(); break;
            case "Number": return new Number(); break;
            case "End": return new End(); break;
            case 'DanhTuKhuyenMai': return new DanhTuKhuyenMai(); break;
            case 'DanhTuChiNoiChon': return new DanhTuChiNoiChon(); break;
            case 'DongTuTinhthai': return new DongTuTinhthai(); break;
            case 'DongTu': return new DongTu(); break;
            case 'DongTuYChi': return new DongTuYChi(); break;
            case 'GioiTu': return new GioiTu(); break;
            case 'PhoTu': return new PhoTu(); break;
            case 'QuanHeTu': return new QuanHeTu(); break;
            case 'ThanTu': return new ThanTu(); break;
            case 'TinhThaiTu': return new TinhThaiTu(); break;
            case 'TinhTu': return new TinhTu(); break;
            case 'DanhTuCuaHang': return new DanhTuCuaHang(); break;
            case 'DongTuTimKiem': return new DongTuTimKiem(); break;
            case 'DanhTuDonHang': return new DanhTuDonHang(); break;
            case 'Dozen': return new Dozen(); break;
            case 'Hundred': return new Hundred(); break;
            case 'MoneyTeenCode': return new MoneyTeenCode(); break;
            case 'DongTuGiaoHang': return new DongTuGiaoHang(); break;
            case 'DanhTuChiKhachHang': return new DanhTuChiKhachHang(); break;
            case 'ChiTuGiNao': return new ChiTuGiNao(); break;
            case 'NumberByWords': return new NumberByWords(); break;
            c
            default: 

                return new class C {
                    constructor() {
                        this.words = [name];
                    }
                }
                break;
        }
    }
}

module.exports = DynamicClass