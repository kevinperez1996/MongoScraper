
const mongoose = require ("mongoose");

const Schema = mongoose.Schema;

//Mongoose Model Used to Store Data 

const NewsSchema = new Schema ({

    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    byLine: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Notes"
    }

}); 

const News = mongoose.model("News", NewsSchema);

module.exports = News;