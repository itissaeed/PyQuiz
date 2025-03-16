const router = require("express").Router();
const Exam = require("../models/examModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Question = require("../models/questionModel");

// add exam

router.post("/add", authMiddleware, async (req, res) => {
  try {
    // check if exam already exists
    const examExists = await Exam.findOne({ name: req.body.name });
    if (examExists) {
      return res
        .status(200)
        .send({ message: "Exam already exists", success: false });
    }
    req.body.questions = [];
    const newExam = new Exam(req.body);
    await newExam.save();
    res.send({
      message: "Exam added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// get all exams
router.post("/get-all-exams", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * limit;

    const exams = await Exam.find({})
      .select('name category totalMarks passingMarks duration difficulty') // Added difficulty field
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JS object for better performance

    const total = await Exam.countDocuments({});

    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.send({
      message: "Exams fetched successfully",
      data: exams,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// get exam by id
router.post("/get-exam-by-id", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching exam with ID:", req.body.examId); // Debug log
    
    if (!req.body.examId) {
      return res.status(400).send({
        message: "Exam ID is required",
        success: false
      });
    }

    const exam = await Exam.findById(req.body.examId)
      .populate({
        path: "questions",
        model: "questions",
        select: "name options correctOptions correctOption"
      });

    console.log("Found exam:", exam); // Debug log

    if (!exam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }

    // Check if exam has questions
    if (!exam.questions || exam.questions.length === 0) {
      return res.status(400).send({
        message: "This exam has no questions yet",
        success: false
      });
    }

    res.send({
      message: "Exam fetched successfully",
      data: exam,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching exam:", error); // Debug log
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// edit exam by id
router.post("/edit-exam-by-id", authMiddleware, async (req, res) => {
  try {
    const { examId, ...updateData } = req.body;

    // Update the exam
    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      updateData,
      { new: true }
    ).populate("questions");

    if (!updatedExam) {
      return res.status(404).send({
        message: "Exam not found",
        success: false,
      });
    }

    res.send({
      message: "Exam edited successfully",
      success: true,
      data: updatedExam,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// delete exam by id
router.post("/delete-exam-by-id", authMiddleware, async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.body.examId);
    res.send({
      message: "Exam deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// add question to exam

router.post("/add-question-to-exam", authMiddleware, async (req, res) => {
  try {
    // add question to Questions collection
    const newQuestion = new Question(req.body);
    const question = await newQuestion.save();

    // add question to exam
    const exam = await Exam.findById(req.body.exam);
    exam.questions.push(question._id);
    await exam.save();
    res.send({
      message: "Question added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// edit question in exam
router.post("/edit-question-in-exam", authMiddleware, async (req, res) => {
  try {
    const { questionId, name, correctOptions, correctOption, options, exam } = req.body;
    
    if (!questionId) {
      return res.status(400).send({
        message: "Question ID is required",
        success: false,
      });
    }

    // Find and update the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).send({
        message: "Question not found",
        success: false,
      });
    }

    // Update the question fields
    question.name = name;
    question.correctOptions = correctOptions;
    question.correctOption = correctOptions[0] || '';
    question.options = options;

    await question.save();

    res.send({
      message: "Question edited successfully",
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error editing question:", error);
    res.status(500).send({
      message: error.message || "Error editing question",
      success: false,
    });
  }
});


// delete question in exam
router.post("/delete-question-in-exam", authMiddleware, async (req, res) => {
     try {
        // delete question in Questions collection
        await Question.findByIdAndDelete(req.body.questionId);

        // delete question in exam
        const exam = await Exam.findById(req.body.examId);
        exam.questions = exam.questions.filter(
          (question) => question._id != req.body.questionId
        );
        await exam.save();
        res.send({
          message: "Question deleted successfully",
          success: true,
        });
     } catch (error) {
      
     }
});

// update all exams to include difficulty
router.post("/update-all-exams-difficulty", authMiddleware, async (req, res) => {
  try {
    // Only update exams that don't have a difficulty set
    const result = await Exam.updateMany(
      { difficulty: { $exists: false } }, // Only update documents without difficulty
      { $set: { difficulty: 'Medium' } }
    );

    // Verify the update by fetching all exams
    const updatedExams = await Exam.find({}).select('name difficulty');
    console.log('Updated exams:', updatedExams);

    res.send({
      message: `Updated ${result.modifiedCount} exams that were missing difficulty`,
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating exams:', error);
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

module.exports = router;
