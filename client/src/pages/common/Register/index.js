import { Form, message } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../../apicalls/users";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await registerUser(values);

      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        navigate("/login");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-primary">
      <div className="card w-400 p-5 bg-white">
        <div className="flex flex-col">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl flex items-center">
              <i className="ri-user-add-line text-3xl mr-2"></i>
              Create Account
            </h1>
          </div>
          <div className="divider"></div>
          <div className="text-center mb-3 text-gray-500">
            Join PyQuiz to start your learning journey
          </div>
          <Form layout="vertical" className="mt-2" onFinish={onFinish}>
            <Form.Item 
              name="name" 
              label="Full Name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <input 
                type="text"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter your full name"
              />
            </Form.Item>
            <Form.Item 
              name="email" 
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <input 
                type="email"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter your email"
              />
            </Form.Item>
            <Form.Item 
              name="password" 
              label="Password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <input 
                type="password"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Create a password"
              />
            </Form.Item>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="primary-contained-btn mt-2 w-100 py-2 rounded-lg hover:opacity-90 transition-all"
              >
                Create Account
              </button>
              <Link to="/login" className="text-center text-gray-700 hover:text-black hover:underline">
                Already have an account? Sign in
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Register;
