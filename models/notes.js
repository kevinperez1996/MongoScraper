const mongoose = require ("mongoose");

const schema = mongoose.Schema;

const notesSchema = new schema ({
    title: {
        type: String
    },
    body: {
        type: String
    }
})

const Notes = mongoose.model("Notes", notesSchema);

module.exports = Notes;