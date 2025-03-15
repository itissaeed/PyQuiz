import { message, Checkbox, Radio } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getExamById } from "../../../apicalls/exams";
import { addReport } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import Instructions from "./Instructions";

function WriteExam() {
  const [examData, setExamData] = React.useState(null);
  const [questions = [], setQuestions] = React.useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = React.useState(0);
  const [selectedOptions, setSelectedOptions] = React.useState({});
  const [result = {}, setResult] = React.useState({});
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [view, setView] = useState("instructions");
  const [secondsLeft = 0, setSecondsLeft] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const { user } = useSelector((state) => state.users);
  const getExamData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getExamById({
        examId: params.id,
      });
      dispatch(HideLoading());
      if (response.success) {
        setQuestions(response.data.questions);
        setExamData(response.data);
        setSecondsLeft(response.data.duration);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const calculateResult = async () => {
    try {
      let correctAnswers = [];
      let wrongAnswers = [];

      questions.forEach((question, index) => {
        const userAnswers = selectedOptions[index] || [];
        const correctOptions = question.correctOptions || [];
        
        // Check if arrays have the same elements (order doesn't matter)
        const isCorrect = 
          userAnswers.length === correctOptions.length && 
          userAnswers.every(answer => correctOptions.includes(answer));

        if (isCorrect) {
          correctAnswers.push(question);
        } else {
          wrongAnswers.push(question);
        }
      });

      let verdict = "Pass";
      if (correctAnswers.length < examData.passingMarks) {
        verdict = "Fail";
      }

      const tempResult = {
        correctAnswers,
        wrongAnswers,
        verdict,
      };
      setResult(tempResult);
      dispatch(ShowLoading());
      const response = await addReport({
        exam: params.id,
        result: tempResult,
        user: user._id,
      });
      dispatch(HideLoading());
      if (response.success) {
        setView("result");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const startTimer = () => {
    let totalSeconds = examData.duration;
    const intervalId = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds = totalSeconds - 1;
        setSecondsLeft(totalSeconds);
      } else {
        setTimeUp(true);
      }
    }, 1000);
    setIntervalId(intervalId);
  };

  useEffect(() => {
    if (timeUp && view === "questions") {
      clearInterval(intervalId);
      calculateResult();
    }
  }, [timeUp]);

  useEffect(() => {
    if (params.id) {
      getExamData();
    }
  }, []);
  return (
    examData && (
      <div className="mt-2">
        <div className="divider"></div>
        <h1 className="text-center">{examData.name}</h1>
        <div className="divider"></div>

        {view === "instructions" && (
          <Instructions
            examData={examData}
            setView={setView}
            startTimer={startTimer}
          />
        )}

        {view === "questions" && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between mb-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl">
                  {selectedQuestionIndex + 1} :{" "}
                  {questions[selectedQuestionIndex].name}
                </h1>
                {questions[selectedQuestionIndex].correctOptions?.length > 1 && (
                  <div className="text-sm text-blue-600 font-medium flex items-center gap-2">
                    <i className="ri-information-line"></i>
                    <span>This question has multiple correct answers!</span>
                  </div>
                )}
              </div>

              <div className="timer">
                <span className="text-2xl">
                  {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {questions[selectedQuestionIndex].correctOptions?.length > 1 ? (
                <div className="flex flex-col gap-2">
                  {Object.keys(questions[selectedQuestionIndex].options).map(
                    (option, index) => {
                      const isSelected = selectedOptions[selectedQuestionIndex]?.includes(option);
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            const currentSelected = selectedOptions[selectedQuestionIndex] || [];
                            let newSelected;
                            if (currentSelected.includes(option)) {
                              newSelected = currentSelected.filter(opt => opt !== option);
                            } else {
                              newSelected = [...currentSelected, option];
                            }
                            setSelectedOptions({
                              ...selectedOptions,
                              [selectedQuestionIndex]: newSelected,
                            });
                          }}
                          className={`option ant-radio-wrapper cursor-pointer ${
                            isSelected ? "selected-option" : ""
                          }`}
                        >
                          <div className="ant-radio">
                            <div className={`ant-radio-inner ${isSelected ? "ant-radio-checked" : ""}`} 
                                 style={{
                                   width: "20px",
                                   height: "20px",
                                   border: `2px solid ${isSelected ? "#0f9898" : "#d9d9d9"}`,
                                   backgroundColor: isSelected ? "#0f9898" : "#fff",
                                   borderRadius: "50%",
                                   position: "relative"
                                 }}
                            />
                          </div>
                          <span className="text-xl">
                            {option} : {questions[selectedQuestionIndex].options[option]}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <Radio.Group
                  className="flex flex-col gap-2"
                  value={selectedOptions[selectedQuestionIndex]?.[0] || ''}
                  onChange={(e) => {
                    setSelectedOptions({
                      ...selectedOptions,
                      [selectedQuestionIndex]: [e.target.value],
                    });
                  }}
                >
                  {Object.keys(questions[selectedQuestionIndex].options).map(
                    (option, index) => {
                      return (
                        <Radio
                          key={index}
                          value={option}
                          className={`option ${
                            selectedOptions[selectedQuestionIndex]?.[0] === option
                              ? "selected-option"
                              : ""
                          }`}
                        >
                          <span className="text-xl">
                            {option} : {questions[selectedQuestionIndex].options[option]}
                          </span>
                        </Radio>
                      );
                    }
                  )}
                </Radio.Group>
              )}
            </div>

            <div className="flex justify-between mt-4">
              {selectedQuestionIndex > 0 && (
                <button
                  className="primary-outlined-btn"
                  onClick={() => {
                    setSelectedQuestionIndex(selectedQuestionIndex - 1);
                  }}
                >
                  Previous
                </button>
              )}

              {selectedQuestionIndex < questions.length - 1 && (
                <button
                  className="primary-contained-btn"
                  onClick={() => {
                    setSelectedQuestionIndex(selectedQuestionIndex + 1);
                  }}
                >
                  Next
                </button>
              )}

              {selectedQuestionIndex === questions.length - 1 && (
                <button
                  className="primary-contained-btn"
                  onClick={() => {
                    clearInterval(intervalId);
                    setTimeUp(true);
                  }}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}

        {view === "result" && (
          <div className="flex  items-center mt-2 justify-center result">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl">RESULT</h1>
               <div className="divider"></div>
              <div className="marks">
                <h1 className="text-md">Total Marks : {examData.totalMarks}</h1>
                <h1 className="text-md">
                  Obtained Marks :{result.correctAnswers.length}
                </h1>
                <h1 className="text-md">
                  Wrong Answers : {result.wrongAnswers.length}
                </h1>
                <h1 className="text-md">
                  Passing Marks : {examData.passingMarks}
                </h1>
                <h1 className="text-md">VERDICT :{result.verdict}</h1>

                <div className="flex gap-2 mt-2">
                  <button
                    className="primary-outlined-btn"
                    onClick={() => {
                      setView("instructions");
                      setSelectedQuestionIndex(0);
                      setSelectedOptions({});
                      setSecondsLeft(examData.duration);
                    }}
                  >
                    Retake Exam
                  </button>
                  <button
                    className="primary-contained-btn"
                    onClick={() => {
                      setView("review");
                    }}
                  >
                    Review Answers
                  </button>
                </div>
              </div>
            </div>
            <div className="lottie-animation">
              {result.verdict === "Pass" && (
                <lottie-player
                  src="https://assets2.lottiefiles.com/packages/lf20_ya4ycrti.json"
                  background="transparent"
                  speed="1"
                  loop
                  autoplay
                ></lottie-player>
              )}

              {result.verdict === "Fail" && (
                <lottie-player
                  src="https://assets4.lottiefiles.com/packages/lf20_qp1spzqv.json"
                  background="transparent"
                  speed="1"
                  loop
                  autoplay
                ></lottie-player>
              )}
            </div>
          </div>
        )}

        {view === "review" && (
          <div className="flex flex-col gap-2">
            {questions.map((question, index) => {
              const userAnswers = selectedOptions[index] || [];
              const correctOptions = question.correctOptions || [];
              const isCorrect = 
                userAnswers.length === correctOptions.length && 
                userAnswers.every(answer => correctOptions.includes(answer));

              return (
                <div
                  className={`
                    flex flex-col gap-1 p-2 ${isCorrect ? "bg-success" : "bg-error"}
                  `}
                >
                  <h1 className="text-xl">
                    {index + 1} : {question.name}
                  </h1>
                  <h1 className="text-md">
                    Submitted Answer(s): {userAnswers.map(option => (
                      <span key={option}>
                        {option} - {question.options[option]}{", "}
                      </span>
                    ))}
                  </h1>
                  <h1 className="text-md">
                    Correct Answer(s): {correctOptions.map(option => (
                      <span key={option}>
                        {option} - {question.options[option]}{", "}
                      </span>
                    ))}
                  </h1>
                </div>
              );
            })}

            <div className="flex justify-center gap-2">
              <button
                className="primary-outlined-btn"
                onClick={() => {
                  navigate("/");
                }}
              >
                Close
              </button>
              <button
                className="primary-contained-btn"
                onClick={() => {
                  setView("instructions");
                  setSelectedQuestionIndex(0);
                  setSelectedOptions({});
                  setSecondsLeft(examData.duration);
                }}
              >
                Retake Exam
              </button>
            </div>
          </div>
        )}
      </div> 
    )
  );
}

export default WriteExam;
