
function DonVi(){
    this.words = ["ly", "cái", "chén", "phần", "tô", 'dĩa', 'cốc', 'cái', 'hộp'];
}

DonVi.prototype.getWords = function () {
    return this.words;
}

module.exports = {
    DonVi : DonVi
}