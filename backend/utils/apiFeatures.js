class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        if (this.queryString.keyword) {
            const keywordFilter = {
                name: {
                    $regex: this.queryString.keyword,
                    $options: "i",
                },
            };

            this.query = this.query.find(keywordFilter);
        }

        return this;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ["keyword", "page", "limit", "sortBy"];

        excludedFields.forEach((field) => delete queryObj[field]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sortBy) {
            const sortBy = this.queryString.sortBy.toLowerCase();

            if (sortBy === "ratings") {
                this.query = this.query.sort({ ratings: -1 });
            } else if (sortBy === "reviews") {
                this.query = this.query.sort({ numOfReviews: -1 });
            } else {
                this.query = this.query.sort(sortBy.replaceAll(",", " "));
            }
        }

        return this;
    }

    pagination(resPerPage) {
        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || resPerPage;
        const skip = limit * (page - 1);

        this.query = this.query.limit(limit).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;
