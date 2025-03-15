import { Col, message, Row, Spin, Pagination, Empty } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllExams } from "../../../apicalls/exams";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import PageTitle from "../../../components/PageTitle";
import { useNavigate } from "react-router-dom";

function Home() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 8;
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  const getExams = async (page = 1) => {
    try {
      setLoading(true);
      
      // Then fetch the updated exams
      const response = await getAllExams({
        page,
        limit: pageSize
      });
      
      if (response.success) {
        const examsWithMinutes = response.data.map(exam => ({
          ...exam,
          displayDuration: Math.floor(exam.duration / 60)
        }));
        setExams(examsWithMinutes);
        setTotal(response.total);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getExams(currentPage);
    }
  }, [currentPage, user]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <PageTitle title={`Available Exams`} />
        <div className="text-gray-600 text-center mt-2">
          Choose from our selection of quizzes and test your knowledge
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : exams.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Empty
            description={
              <span className="text-lg text-gray-500">
                No exams available at the moment
              </span>
            }
          />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {exams.map((exam) => (
              <Col key={exam._id} xs={24} sm={12} md={8} lg={6}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <i className="ri-file-list-3-line text-2xl text-primary mr-2"></i>
                      <h2 className="text-xl font-semibold text-gray-800">{exam?.name}</h2>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-gray-600">
                        <i className="ri-folder-line mr-2"></i>
                        <span>{exam.category}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <i className="ri-award-line mr-2"></i>
                        <span>Total Marks: {exam.totalMarks}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <i className="ri-check-line mr-2"></i>
                        <span>Passing: {exam.passingMarks}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <i className="ri-time-line mr-2"></i>
                        <span>Duration: {exam.displayDuration} mins</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-600">Difficulty Level:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${exam.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                              exam.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {exam.difficulty || 'Medium'} Level
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-full bg-primary text-white py-2 rounded-lg hover:opacity-90 transition-all flex items-center justify-center"
                      onClick={() => navigate(`/user/write-exam/${exam._id}`)}
                    >
                      <i className="ri-play-circle-line mr-2"></i>
                      Start Exam
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
          {total > pageSize && (
            <div className="flex justify-center mt-8 mb-4">
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                className="custom-pagination"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
