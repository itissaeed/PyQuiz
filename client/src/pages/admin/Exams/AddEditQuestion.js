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

  useEffect(() => {
    if (selectedQuestion) {
      form.setFieldsValue({
        name: selectedQuestion.name,
        A: selectedQuestion.options.A,
        B: selectedQuestion.options.B,
        C: selectedQuestion.options.C,
        D: selectedQuestion.options.D,
        difficulty: selectedQuestion.difficulty || 'Medium',
        correctOptions: selectedQuestion.correctOptions || [selectedQuestion.correctOption],
      });
    }
  }, [selectedQuestion, form]);

  const onFinish = async (values) => {
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
        difficulty: values.difficulty,
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
        refreshData();
        setShowAddEditQuestionModal(false);
        setSelectedQuestion(null);
        form.resetFields();
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
      title={selectedQuestion ? "Edit Question" : "Add Question"}
      visible={showAddEditQuestionModal}
      footer={false}
      maskClosable={false}
      onCancel={() => {
        form.resetFields();
        setSelectedQuestion(null);
        setShowAddEditQuestionModal(false);
      }}
      width={800}
    >
      <Form 
        form={form}
        onFinish={onFinish} 
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

        <Form.Item
          name="difficulty"
          label={<span className="text-lg font-semibold text-gray-700">Difficulty Level</span>}
          rules={[{ required: true, message: 'Please select difficulty level!' }]}
          initialValue="Medium"
        >
          <select className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
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

          <div className="bg-gray-50 p-4 rounded-lg">
            <Form.Item 
              name="correctOptions" 
              label={<span className="text-lg font-semibold text-gray-700">Select Correct Answer(s)</span>}
              rules={[{ required: true, message: 'Please select at least one correct option!' }]}
            >
              <Checkbox.Group className="flex flex-col gap-3">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div key={option} className="checkbox-wrapper">
                    <Checkbox 
                      value={option}
                      className="custom-checkbox"
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full font-semibold">
                          {option}
                        </span>
                        <span className="ml-3 text-gray-700">Option {option}</span>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            type="button"
            onClick={() => {
              form.resetFields();
              setSelectedQuestion(null);
              setShowAddEditQuestionModal(false);
            }}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            type="submit"
          >
            Save
          </button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddEditQuestion;
