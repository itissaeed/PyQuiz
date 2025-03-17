import { Form, message, Modal, Checkbox } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addQuestionToExam, editQuestionById } from "../../../apicalls/exams";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";

function AddEditQuestion({
  showAddEditQuestionModal,
  setShowAddEditQuestionModal,
  refreshData,
  examId,
  selectedQuestion,
  setSelectedQuestion
}) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [questionCount, setQuestionCount] = React.useState(0);

  useEffect(() => {
    if (selectedQuestion) {
      form.setFieldsValue({
        name: selectedQuestion.name,
        A: selectedQuestion.options.A,
        B: selectedQuestion.options.B,
        C: selectedQuestion.options.C,
        D: selectedQuestion.options.D,
        correctOptions: selectedQuestion.correctOptions || [selectedQuestion.correctOption],
      });
    }
  }, [selectedQuestion, form]);

  const onFinish = async (values, addAnother = false) => {
    try {
      dispatch(ShowLoading());
      const requiredPayload = {
        name: values.name,
        correctOptions: values.correctOptions,
        correctOption: values.correctOptions[0] || '',
        options: {
          A: values.A,
          B: values.B,
          C: values.C,
          D: values.D,
        },
        exam: examId,
      };

      let response;
      if (selectedQuestion) {
        response = await editQuestionById({
          ...requiredPayload,
          questionId: selectedQuestion._id,
        });
      } else {
        response = await addQuestionToExam(requiredPayload);
      }

      if (response.success) {
        message.success(response.message);
        setQuestionCount(prev => prev + 1);
        refreshData();
        
        if (addAnother) {
          // Clear form for next question
          form.resetFields();
          message.success(`Question ${questionCount + 1} added successfully. Add another question.`);
        } else {
          // Close modal and reset everything
          setShowAddEditQuestionModal(false);
          setSelectedQuestion(null);
          form.resetFields();
          setQuestionCount(0);
        }
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <Modal
      title={selectedQuestion ? "Edit Question" : `Add Question ${questionCount + 1}`}
      visible={showAddEditQuestionModal}
      footer={false}
      maskClosable={false}
      onCancel={() => {
        form.resetFields();
        setSelectedQuestion(null);
        setShowAddEditQuestionModal(false);
        setQuestionCount(0);
      }}
      width={800}
    >
      <Form 
        form={form}
        onFinish={(values) => onFinish(values, false)}
        layout="vertical"
        preserve={false}
      >
        <Form.Item 
          name="name" 
          label="Question"
          rules={[{ required: true, message: 'Please input the question!' }]}
        >
          <input type="text" className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors" />
        </Form.Item>

        <div>
          <Form.Item 
            name="A" 
            label="Option A"
            rules={[{ required: true, message: 'Please input option A!' }]}
          >
            <input type="text" className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors" />
          </Form.Item>
          <Form.Item 
            name="B" 
            label="Option B"
            rules={[{ required: true, message: 'Please input option B!' }]}
          >
            <input type="text" className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors" />
          </Form.Item>
          <Form.Item 
            name="C" 
            label="Option C"
            rules={[{ required: true, message: 'Please input option C!' }]}
          >
            <input type="text" className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors" />
          </Form.Item>
          <Form.Item 
            name="D" 
            label="Option D"
            rules={[{ required: true, message: 'Please input option D!' }]}
          >
            <input type="text" className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors" />
          </Form.Item>
        </div>

        <Form.Item 
          name="correctOptions" 
          label={<span className="text-lg font-semibold text-gray-700">Select Correct Answer(s)</span>}
          rules={[{ required: true, message: 'Please select at least one correct option!' }]}
        >
          <Checkbox.Group className="flex flex-col gap-3">
            {[
              { option: 'A', color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
              { option: 'B', color: 'bg-green-100 text-green-600 hover:bg-green-200' },
              { option: 'C', color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' },
              { option: 'D', color: 'bg-red-100 text-red-600 hover:bg-red-200' }
            ].map(({ option, color }) => (
              <div key={option} className="checkbox-wrapper">
                <Checkbox 
                  value={option}
                  className="custom-checkbox"
                >
                  <div className="flex items-center cursor-pointer transition-all duration-200 hover:opacity-80">
                    <span className={`w-8 h-8 flex items-center justify-center ${color} rounded-full font-semibold`}>
                      {option}
                    </span>
                  </div>
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        </Form.Item>

        <div className="flex justify-end mt-4 gap-3">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors border-2 border-gray-200"
            type="button"
            onClick={() => {
              form.resetFields();
              setSelectedQuestion(null);
              setShowAddEditQuestionModal(false);
              setQuestionCount(0);
            }}
          >
            Cancel
          </button>
          {!selectedQuestion && (
            <button 
              className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors border-2 border-emerald-200"
              type="button"
              onClick={() => {
                form.validateFields().then(values => {
                  onFinish(values, true);
                });
              }}
            >
              Save & Add Another
            </button>
          )}
          <button 
            className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors border-2 border-purple-200"
            type="submit"
          >
            {selectedQuestion ? "Save" : "Save & Close"}
          </button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddEditQuestion;
