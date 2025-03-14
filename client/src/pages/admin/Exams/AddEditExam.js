import { Col, Form, message, Row, Select, Table } from "antd";
import React, { useEffect } from "react";
import {
  addExam,
  deleteQuestionById,
  editExamById,
  getExamById,
} from "../../../apicalls/exams";
import PageTitle from "../../../components/PageTitle";
import { useNavigate, useParams } from "react-router-dom";

import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { Tabs } from "antd";
import AddEditQuestion from "./AddEditQuestion";
const { TabPane } = Tabs;

function AddEditExam() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [examData, setExamData] = React.useState(null);
  const [showAddEditQuestionModal, setShowAddEditQuestionModal] =
    React.useState(false);
  const [selectedQuestion, setSelectedQuestion] = React.useState(null);
  const params = useParams();
  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      // Convert minutes to seconds before saving
      const durationInSeconds = values.duration * 60;
      const payload = { ...values, duration: durationInSeconds };
      
      let response;
      if (params.id) {
        response = await editExamById({
          ...payload,
          examId: params.id,
        });
      } else {
        response = await addExam(payload);
      }
      if (response.success) {
        message.success(response.message);
        navigate("/admin/exams");
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const getExamData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getExamById({
        examId: params.id,
      });
      dispatch(HideLoading());
      if (response.success) {
        // Convert seconds to minutes for display
        const examWithMinutes = {
          ...response.data,
          duration: Math.floor(response.data.duration / 60)
        };
        setExamData(examWithMinutes);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (params.id) {
      getExamData();
    }
  }, []);

  const deleteQuestion = async (questionId) => {
    try {
      dispatch(ShowLoading());
      const response = await deleteQuestionById({
        questionId,
        examId : params.id
      });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getExamData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const questionsColumns = [
    {
      title: "Question",
      dataIndex: "name",
    },
    {
      title: "Options",
      dataIndex: "options",
      render: (text, record) => {
        return Object.keys(record.options).map((key) => {
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full">
                {key}
              </span>
              <span>{record.options[key]}</span>
            </div>
          );
        });
      },
    },
    {
      title: "Correct Options",
      dataIndex: "correctOptions",
      render: (text, record) => {
        return record.correctOptions?.map((option) => (
          <div key={option} className="flex items-center gap-2 text-green-600">
            <span className="w-6 h-6 flex items-center justify-center bg-green-100 rounded-full font-semibold">
              {option}
            </span>
            <span>{record.options[option]}</span>
          </div>
        ));
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedQuestion(record);
              setShowAddEditQuestionModal(true);
            }}
          >
            <i className="ri-pencil-line"></i>
          </button>
          <button
            type="button"
            className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            onClick={(e) => {
              e.stopPropagation();
              deleteQuestion(record._id);
            }}
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageTitle title={params.id ? "Edit Exam" : "Add Exam"} />
      <div className="divider"></div>

      {(examData || !params.id) && (
        <Form layout="vertical" onFinish={onFinish} initialValues={examData}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Exam Details" key="1">
              <Row gutter={[10, 10]}>
                <Col span={8}>
                  <Form.Item label="Exam Name" name="name">
                    <input type="text" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item 
                    label="Exam Duration (Minutes)" 
                    name="duration"
                    rules={[
                      { required: true, message: 'Please input exam duration!' },
                      { type: 'number', min: 1, message: 'Duration must be at least 1 minute!' }
                    ]}
                  >
                    <input 
                      type="number" 
                      min="1"
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Category" name="category">
                    <select name="" id="">
                      <option value="">Select Category</option>
                      <option value="Javascript">Javascript</option>
                      <option value="React">React</option>
                      <option value="Node">Node</option>
                      <option value="MongoDB">MongoDB</option>
                      <option value="GK">GK</option>
                      <option value="ML">Machine Learning</option>
                      <option value="ebusiness">E-business</option>

                    </select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Total Marks" name="totalMarks">
                    <input type="number" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Passing Marks" name="passingMarks">
                    <input type="number" />
                  </Form.Item>
                </Col>
              </Row>
              <div className="flex justify-end gap-2">
                <button
                  className="primary-outlined-btn"
                  type="button"
                  onClick={() => navigate("/admin/exams")}
                >
                  Cancel
                </button>
                <button className="primary-contained-btn" type="submit">
                  Save
                </button>
              </div>
            </TabPane>
            {params.id && (
              <TabPane tab="Questions" key="2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="primary-outlined-btn"
                    onClick={() => {
                      setSelectedQuestion(null);
                      setShowAddEditQuestionModal(true);
                    }}
                  >
                    Add Question
                  </button>
                </div>

                <Table
                  columns={questionsColumns}
                  dataSource={examData?.questions || []}
                  pagination={false}
                  className="mt-4"
                />
              </TabPane>
            )}
          </Tabs>
        </Form>
      )}

      {showAddEditQuestionModal && (
        <AddEditQuestion
          showAddEditQuestionModal={showAddEditQuestionModal}
          setShowAddEditQuestionModal={setShowAddEditQuestionModal}
          refreshData={getExamData}
          examId={params.id}
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
        />
      )}
    </div>
  );
}

export default AddEditExam;
