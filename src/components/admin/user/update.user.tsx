import { updateUserAPI } from "@/services/api";
import { App, Divider, Form, Input, Modal } from "antd"
import { useEffect } from "react";

interface IProps {
    dataUser: IUserTable | null,
    isOpenModalUpdate: boolean,
    setIsOpenModalUpdate: (v: boolean) => void,
    reset: () => void;
}

const UpdateUser = (props: IProps) =>{
    const [form] = Form.useForm();
    const { message, notification } = App.useApp();
    const {isOpenModalUpdate,setIsOpenModalUpdate,dataUser,reset} = props;

    const onFinishUpdateUser = async (values: IUpdateUser) => {
        const res = await updateUserAPI(values.fullName,dataUser?._id!,values.phone);
        if(res && res.data){
            message.success("Update user success!")
        }
        else{
            notification.error(
                {
                    message:"Update user error!",
                    description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                }
            )
        }
        form.resetFields();
        reset();
    }

    useEffect(() => {
        form.setFieldsValue({
        email: dataUser?.email,
        fullName: dataUser?.fullName,
        phone: dataUser?.phone
    });
    }, [dataUser]);


    return(
        <Modal
        title="Update user"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isOpenModalUpdate}
        onOk={form.submit}
        onCancel={reset}
      >
        <Divider></Divider>
                <Form form={form} layout='vertical' onFinish={onFinishUpdateUser}>
                    
                    
                    <Form.Item<IUpdateUser>
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please input your email!' },
                            {type:"email", message: "Format email is wrong!"}
                        ]}
                    >
                        <Input disabled/>
                    </Form.Item>

                    <Form.Item<IUpdateUser>
                        label="Tên hiển thị"
                        name="fullName"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item<IUpdateUser>
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: 'Please input your phone!' },
                            { pattern: /^[0-9]{9,11}$/, message: "Phone number is wrong!" }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                </Form>
      </Modal>
    )
}
export default UpdateUser