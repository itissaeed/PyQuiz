import { message } from "antd";
import React, { useEffect, useState } from "react";
import { getUserInfo } from "../apicalls/users";
import { useDispatch, useSelector } from "react-redux";
import { SetUser } from "../redux/usersSlice.js";
import { useNavigate, useLocation } from "react-router-dom";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.users);
  const [menu, setMenu] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userMenu = [
    {
      title: "Home",
      paths: ["/", "/user/write-exam"],
      icon: <i className="ri-home-line"></i>,
      onClick: () => navigate("/"),
    },
    {
      title: "Reports",
      paths: ["/user/reports"],
      icon: <i className="ri-bar-chart-line"></i>,
      onClick: () => navigate("/user/reports"),
    },
    // {
    //   title: "Profile",
    //   paths: ["/profile"],
    //   icon: <i className="ri-user-line"></i>,
    //   onClick: () => navigate("/profile"),
    // },
    {
      title: "Logout",
      paths: ["/logout"],
      icon: <i className="ri-logout-box-line"></i>,
      onClick: () => {
        localStorage.removeItem("token");
        dispatch(SetUser(null));
        navigate("/login");
      },
    },
  ];

  const adminMenu = [
    {
      title: "Home",
      paths: ["/", "/user/write-exam"],
      icon: <i className="ri-home-line"></i>,
      onClick: () => navigate("/"),
    },
    {
      title: "Exams",
      paths: ["/admin/exams", "/admin/exams/add"],
      icon: <i className="ri-file-list-line"></i>,
      onClick: () => navigate("/admin/exams"),
    },
    {
      title: "Reports",
      paths: ["/admin/reports"],
      icon: <i className="ri-bar-chart-line"></i>,
      onClick: () => navigate("/admin/reports"),
    },
    // {
    //   title: "Profile",
    //   paths: ["/profile"],
    //   icon: <i className="ri-user-line"></i>,
    //   onClick: () => navigate("/profile"),
    // },
    {
      title: "Logout",
      paths: ["/logout"],
      icon: <i className="ri-logout-box-line"></i>,
      onClick: () => {
        localStorage.removeItem("token");
        dispatch(SetUser(null));
        navigate("/login");
      },
    },
  ];

  const getUserData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getUserInfo();
      dispatch(HideLoading());
      if (response.success) {
        dispatch(SetUser(response.data));
        if (response.data.isAdmin) {
          setMenu(adminMenu);
        } else {
          setMenu(userMenu);
        }
      } else {
        localStorage.removeItem("token");
        dispatch(SetUser(null));
        message.error(response.message);
        navigate("/login");
      }
    } catch (error) {
      localStorage.removeItem("token");
      dispatch(SetUser(null));
      navigate("/login");
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getUserData();
    } else {
      navigate("/login");
    }
  }, []);

  const activeRoute = window.location.pathname;

  const getIsActiveOrNot = (paths) => {
    if (paths.includes(activeRoute)) {
      return true;
    } else {
      if (
        activeRoute.includes("/admin/exams/edit") &&
        paths.includes("/admin/exams")
      ) {
        return true;
      }
      if (
        activeRoute.includes("/user/write-exam") &&
        paths.includes("/user/write-exam")
      ) {
        return true;
      }
    }
    return false;
  };

  const isExamInProgress = () => {
    const examPath = location.pathname.includes("/user/write-exam/");
    const examView = localStorage.getItem("examView");
    const timeUp = localStorage.getItem("timeUp") === "true";
    
    // Allow navigation if:
    // 1. Not in exam path
    // 2. Exam view is not 'questions' (i.e., instructions, result, or review)
    // 3. Time is up
    // 4. No exam view stored (exam not started)
    return examPath && examView === "questions" && !timeUp;
  };

  const handleMenuClick = (menuItem) => (e) => {
    if (isExamInProgress()) {
      e.preventDefault();
      message.error("Please complete or submit the exam before navigating away!");
      return;
    }
    menuItem.onClick();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="layout">
      <div className="flex gap-2 w-full h-full h-100">
        <div className="sidebar">
          <div className="menu">
            {menu.map((item, index) => {
              return (
                <div
                  className={`menu-item ${
                    getIsActiveOrNot(item.paths) && "active-menu-item"
                  }`}
                  key={index}
                  onClick={handleMenuClick(item)}
                >
                  {item.icon}
                  {!collapsed && <span>{item.title}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="body">
          <div className="header flex justify-between">
            {!collapsed && (
              <i
                className="ri-close-line"
                onClick={() => setCollapsed(true)}
              ></i>
            )}
            {collapsed && (
              <i
                className="ri-menu-line"
                onClick={() => setCollapsed(false)}
              ></i>
            )}
            <h1 className="text-2xl text-white">Hi {user?.name}, Welcome to PyQuiz</h1>
            <div>
              <div className="flex gap-1 items-center">
                <h1 className="text-md text-white">{user?.name}</h1>
              </div>
              <span>Role : {user?.isAdmin ? "Admin" : "User"}</span>
            </div>
          </div>
          <div className="content">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute;
