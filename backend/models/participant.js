const mongoose = require('mongoose');

// Model uczestnika
const participantSchema = new mongoose.Schema({

    name: String,
    group: String,
    team: String,
    category:String,
    score1: {
        base: Number,
        errors: Number,
        errors2:Number,
        total: Number,
    },
    score2: {
        base: Number,
        errors: Number,
        errors2:Number,
        total: Number,
    },
    score3: {
        base: Number,
        errors: Number,
        errors2:Number,
        total: Number,
    },
    totalScore: Number,

});

module.exports = mongoose.model('Participant', participantSchema);