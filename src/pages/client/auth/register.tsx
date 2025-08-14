import { App, Button, Divider, Form, Input, Space } from 'antd';
import { useState } from 'react';
import { FormProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { loginAPI, registerAPI } from 'services/api';

type FieldType = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
};

const RegisterPage = () => {
  const [isSubmit,setIsSubmit] = useState(false);
    // const [form] = Form.useForm();
     const { message } = App.useApp();
     const nav = useNavigate();

    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
      setIsSubmit(true);
      const res = await registerAPI(values.fullName,values.email,values.password,values.phone);
      if(res && res.data){
        message.success("Create user success!");
        nav("/login");
      }
      else{
        message.error(res.message);
      }
        setIsSubmit(false);
  };
    return (
        <div style={{padding:"15px 25px",width: "500px", margin:"30px auto", boxShadow:"1px 1px 5px blue"}}>
            <h1 style={{marginBottom:"25px"}}>Đăng ký tài khoản</h1>
            <Divider></Divider>

            <Form
              name="basic"
              // form={form}
              onFinish={onFinish}
              layout='vertical'
              > 
                <Form.Item<FieldType>
                  label="Họ tên"
                  name="fullName"
                  rules={[{ required: true, message: 'Please input your username!'}]}
                >
                  <Input style={{width:"100%"}} placeholder= "Nhập tên đầy đủ"/>
                </Form.Item>

                <Form.Item<FieldType>
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: 'Please input your Email!'},
                    {type:"email", message: "Format Email is wrong!"}
                  ]}
                >
                  <Input placeholder= "Nhập Email"/>
                </Form.Item>
                <Form.Item<FieldType>
                  label="Mật khẩu"
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password placeholder= "Nhập Password"/>
                </Form.Item>
                <Form.Item<FieldType>
                  label="Số điện thoại"
                  name="phone"
                  rules={[{ required: true, message: 'Please input your phone number!' },
                    { pattern: /^[0-9]{9,11}$/, message: "Phone number is wrong!" }
                  ]}
                >
                  <Input placeholder= "Nhập số điện thoại"/>
                </Form.Item>

                

                <Form.Item label={null}>
                  
                    <Button type="primary" htmlType="submit" loading={isSubmit}>
                      Đăng ký
                    </Button>
                  
                </Form.Item>

                <Divider>Or</Divider>

                <p style={{display: "flex",justifyContent:"center"}}>Đã có tài khoản? <Link to="/login">Đăng Nhập</Link></p>
              </Form>
          </div>
      )
}

export default RegisterPage;