import { App, Button, Divider, Form, Input, notification, Space } from 'antd';
import { useState } from 'react';
import { FormProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { loginAPI } from 'services/api';
import { useCurrentApp } from 'components/context/app.context';

type FieldType = {
  email: string;
  password: string;
};


const LoginPage = () => {
    const [isSubmit,setIsSubmit] = useState(false);
    // const [form] = Form.useForm();
     const { message, notification } = App.useApp();
     const nav = useNavigate();
     const {setIsAuthenticated,setUser} = useCurrentApp();

    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
      setIsSubmit(true);
      const res = await loginAPI(values.email,values.password);
      
      if(res && res.data){
        setIsAuthenticated(true);
        setUser(res.data.user);
        message.success("Login user success!");
        localStorage.setItem("access_token",res.data.access_token);
        nav("/");
      }
      else{
        notification.error({
            message: "Login error!",
            description: 
                res.message && Array.isArray(res.message) ? res.message[0] : res.message,
            duration: 5
        })
      }
        setIsSubmit(false);
    };
    
    return (
        
         <div style={{padding:"15px 25px",width: "450px", margin:"30px auto", boxShadow:"1px 1px 5px blue"}}>
            <h1 style={{marginBottom:"25px"}}>Đăng nhập</h1>
            <Divider></Divider>

            <Form
              name="basic"
              // form={form}
              onFinish={onFinish}
              layout='vertical'
              > 
                

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
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!'}]}
                >
                  <Input.Password style={{width:"100%"}} placeholder= "Nhập mật khẩu"/>
                </Form.Item>
                

                

                <Form.Item label={null}>
                  
                    <Button type="primary" htmlType="submit" loading={isSubmit}>
                      Đăng Nhập
                    </Button>
                  
                </Form.Item>

                <Divider>Or</Divider>

                <p style={{display: "flex",justifyContent:"center"}}>Đã có tài khoản? <Link to="/register">Đăng Ký</Link></p>
              </Form>
          </div>
        
      )
}

export default LoginPage;