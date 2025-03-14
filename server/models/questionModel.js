const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  correctOptions: {
    type: [String],
    required: true,
    default: [],
  },
  correctOption: {
    type: String,
    required: function() {
      return this.correctOptions.length === 0;
    }
  },
  options: {
    type: Object,
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "exams",
  },
}, {
    timestamps: true,
});

// Pre-save middleware to handle the transition from correctOption to correctOptions
questionSchema.pre('save', function(next) {
  if (this.correctOption && (!this.correctOptions || this.correctOptions.length === 0)) {
    this.correctOptions = [this.correctOption];
  }
  next();
});

const Question = mongoose.model("questions", questionSchema);
module.exports = Question;
