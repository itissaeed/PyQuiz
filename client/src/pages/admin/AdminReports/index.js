import React from "react";
import PageTitle from "../../../components/PageTitle";
import { message, Table, Input } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getAllReports } from "../../../apicalls/reports";
import { useEffect } from "react";
import moment from "moment";

function AdminReports() {
  const [reportsData, setReportsData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    examName: "",
    userName: "",
  });
  const columns = [
    {
      title: "Exam Name",
      dataIndex: "examName",
      render: (text, record) => <>{record.exam.name}</>,
    },
    {
      title: "User Name",
      dataIndex: "userName",
      render: (text, record) => <>{record.user.name}</>,
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (text, record) => (
        <>{moment(record.createdAt).format("DD-MM-YYYY hh:mm:ss")}</>
      ),
    },
    {
      title: "Total Marks",
      dataIndex: "totalQuestions",
      render: (text, record) => <>{record.exam.totalMarks}</>,
    },
    {
      title: "Passing Marks",
      dataIndex: "correctAnswers",
      render: (text, record) => <>{record.exam.passingMarks}</>,
    },
    {
      title: "Obtained Marks",
      dataIndex: "correctAnswers",
      render: (text, record) => <>{record.result.correctAnswers.length}</>,
    },
    {
      title: "Verdict",
      dataIndex: "verdict",
      render: (text, record) => <>{record.result.verdict}</>,
    },
  ];

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllReports({
        examName: "",
        userName: ""
      });
      if (response.success) {
        setReportsData(response.data);
        setFilteredData(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Filter data when filters change
  useEffect(() => {
    const filtered = reportsData.filter(report => {
      const examMatch = report.exam.name.toLowerCase().includes(filters.examName.toLowerCase());
      const userMatch = report.user.name.toLowerCase().includes(filters.userName.toLowerCase());
      return examMatch && userMatch;
    });
    setFilteredData(filtered);
  }, [filters, reportsData]);

  return (
    <div>
      <PageTitle title="Reports" />
      <div className="divider"></div>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search by exam name..."
          value={filters.examName}
          onChange={(e) => setFilters({ ...filters, examName: e.target.value })}
          style={{ width: '200px' }}
        />
        <Input
          type="text"
          placeholder="Search by user name..."
          value={filters.userName}
          onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
          style={{ width: '200px' }}
        />
        <button
          className="primary-outlined-btn"
          onClick={() => {
            setFilters({
              examName: "",
              userName: "",
            });
          }}
        >
          Clear
        </button>
      </div>
      <Table columns={columns} dataSource={filteredData} className="mt-2" />
    </div>
  );
}

export default AdminReports;
