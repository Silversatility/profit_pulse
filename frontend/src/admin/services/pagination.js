export default class Pagination {
    constructor () {
        this.count = 0;
        this.page = 1;
        this.limit = 10;
        this.maxSize = 5; // uib-pagination
        this.numPages = 1; // uib-pagination
        this.results = [];
    }

    static decode(encoded) {
        let obj = new Pagination();
        Object.assign(obj, encoded);

        return obj;
    }
}