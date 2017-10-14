
function DonVi(){
    this.words = ["ly", "cái", "chén", "phần", "tô"];
}

DonVi.prototype.getWords = function () {
    return this.words;
}

module.exports = {
    DonVi : DonVi
}