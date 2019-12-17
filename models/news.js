
const mongoose = require ("mongoose");

const schema = mongoose.Schema;

//Mongoose Model Used to Store Data 

const newsSchema = new schema ({

    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        type: schema.Types.ObjectId,
        ref: "Notes"
    }

}); 

const News = mongoose.model("News", newsSchema);

module.exports = News;