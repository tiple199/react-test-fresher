import { useEffect, useState } from 'react';
import { FaReact } from 'react-icons/fa'
import { FiShoppingCart } from 'react-icons/fi';
import { VscSearchFuzzy } from 'react-icons/vsc';
import { Divider, Badge, Drawer, Avatar, Popover, Empty, Modal, Tabs, Row, Col, GetProp, UploadProps, message, Upload, UploadFile, Image, Button, Form, Input, notification } from 'antd';
import { Dropdown, Space } from 'antd';
import { useNavigate } from 'react-router';
import './app.header.scss';
import { Link } from 'react-router-dom';
import { useCurrentApp } from 'components/context/app.context';
import { changePasswordAPI, logoutAPI, updateInfoAPI, uploadFileAPI } from '@/services/api';
import { TabsProps } from 'antd/lib';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from "uuid";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
type ChangePasswrodType = {
    email: string,
    currentPassword: string,
    newPassword: string
}

const AppHeader = (props: any) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [form] = Form.useForm();
    const [tab,setTab] = useState(1);
    
    const { isAuthenticated, user,setUser,setIsAppLoading,carts } = useCurrentApp();
    const [previewImage, setPreviewImage] = useState(`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user?.avatar}`);
    const [avatar,setAvatar] = useState<string>("");
    const navigate = useNavigate();


    const onChange = (key: string) => {
        if(+key === 1){
            setTab(1);
        }
        else if(+key === 2){
            setTab(2);
        }
    };

    const itemTabs: TabsProps['items'] = [
      {
        key: '1',
        label: 'Cập nhật thông tin',
        children: <></>,
      },
      {
        key: '2',
        label: 'Đổi mật khẩu',
        children: <></>,
      },
    ];

    const handleLogout = async () => {
        const res = await logoutAPI();
        if(res) {
            setIsAppLoading(false);
            setUser(null);
            localStorage.removeItem("access_token");
            message.info("You are logout system")
            
        }

    }
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
      setIsModalOpen(true);
    };

    const handleOk = () => {
      setIsModalOpen(false);
    };

    const handleCancel = () => {
      setIsModalOpen(false);
    };

    let items = [
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => showModal()}
            >Quản lý tài khoản</label>,
            key: 'account',
        },
        {
            label: <Link to="/history">Lịch sử mua hàng</Link>,
            key: 'history',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },

    ];
    if (user?.role === 'ADMIN') {
        items.unshift({
            label: <Link to='/admin'>Trang quản trị</Link>,
            key: 'admin',
        })
    }

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user?.avatar}`;

    const contentPopover = () => {
        return (
            <div className='pop-cart-body'>
                <div className='pop-cart-content'>
                    {carts?.map((book, index) => {
                        return (
                            <div className='book' key={`book-${index}`}>
                                <img src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${book?.detail?.thumbnail}`} />
                                <div>{book?.detail?.mainText}</div>
                                <div className='price'>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(book?.detail?.price) ?? 0)}
                                </div>
                            </div>
                        )
                    })}
                </div>
                {carts.length > 0 ?
                    <div className='pop-cart-footer'>
                        <button onClick={() => navigate('/order')} style={{cursor: "pointer"}}>Xem giỏ hàng</button>
                    </div>
                    :
                    <Empty
                        description="Không có sản phẩm trong giỏ hàng"
                    />
                }
            </div>
        )
    }



    const beforeUpload = (file: FileType) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
      }
      return isJpgOrPng && isLt2M;
    };
    
    const handleUploadFile = async (options: RcCustomRequestOptions) => {
        const raw = options.file as File; // RcFile extends File
        const res = await uploadFileAPI(raw, "avatar");

        const { onSuccess, onError } = options;
        if (!res || !res.data) {
          onError?.(new Error("Upload failed"));
          return;
        }

        setPreviewImage(`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${res.data.fileUploaded}`);
        setAvatar(res.data.fileUploaded);


        setTimeout(() => onSuccess?.("ok" as any), 200);
    };

    const onFinish = async (values: IUserTable) => {
        let nameAvatar ="";
        if(avatar){
            nameAvatar=avatar;
        }
        else{
            nameAvatar=user?.avatar!;
        }
        const res = await updateInfoAPI(values.fullName,values.phone,nameAvatar,user?.id!);
        if(res && res.data){
            message.success("Update user success, please login again!");
            const newUser: IUser = {
                email: user?.email!,
                phone: user?.phone!,
                fullName: user?.fullName!,
                role: user?.role!,
                avatar: nameAvatar,
                id: user?.id!
            }
            setUser(newUser);
            handleLogout();
            navigate("/login");
            
        }
    };

    const onFinishFormChangePass = async (values : ChangePasswrodType) =>{
        const res = await changePasswordAPI(values.email,values.currentPassword,values.newPassword);
        if(res && res.data){
            message.success("Update user success, please login again!");
            handleLogout();
        }
        else{
            notification.error({
                message: "Có lỗi xảy ra",
                description: res.message
            })
        }
    }
    useEffect(()=>{
        form.setFieldsValue({ email: user?.email,fullName: user?.fullName,phone: user?.phone });
    },[])


    return (
        <>
            <div className='header-container'>
                <header className="page-header">
                    <div className="page-header__top">
                        <div className="page-header__toggle" onClick={() => {
                            setOpenDrawer(true)
                        }}>☰</div>
                        <div className='page-header__logo'>
                            <span className='logo'>
                                <span onClick={() => navigate('/')}> <FaReact className='rotate icon-react' />Hỏi Dân !T</span>

                                <VscSearchFuzzy className='icon-search' />
                            </span>
                            <input
                                className="input-search" type={'text'}
                                placeholder="Bạn tìm gì hôm nay"
                                value={props.searchTerm}
                                onChange={(e) => props.setSearchTerm(e.target.value)}
                            />
                        </div>

                    </div>
                    <nav className="page-header__bottom">
                        <ul id="navigation" className="navigation">
                            <li className="navigation__item">
                                <Popover
                                    className="popover-carts"
                                    placement="topRight"
                                    rootClassName="popover-carts"
                                    title={"Sản phẩm mới thêm"}
                                    content={contentPopover}
                                    arrow={true}>
                                    <Badge
                                        count={carts?.length ?? 0}
                                        size={"small"}
                                        showZero
                                    >
                                        <FiShoppingCart className='icon-cart' />
                                    </Badge>
                                </Popover>
                            </li>
                            <li className="navigation__item mobile"><Divider type='vertical' /></li>
                            <li className="navigation__item mobile">
                                {!isAuthenticated ?
                                    <span onClick={() => navigate('/login')}> Tài Khoản</span>
                                    :
                                    <Dropdown menu={{ items }} trigger={['click']}>
                                        <Space >
                                            <Avatar src={urlAvatar} />
                                            {user?.fullName}
                                        </Space>
                                    </Dropdown>
                                }
                            </li>
                        </ul>
                    </nav>
                </header>
            </div>
            <Drawer
                title="Menu chức năng"
                placement="left"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
            >
                <p>Quản lý tài khoản</p>
                <Divider />

                <p>Đăng xuất</p>
                <Divider />
            </Drawer>
            <Modal
                title="Quản lý tài khoản"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={720}
                footer={null}
            >
                <Tabs defaultActiveKey="1"  items={itemTabs} onChange={onChange} />
                {tab === 1 ?
                    <Row>
                        <Col span={12} style={{display: "flex",flexDirection:"column"}}>
                            <Avatar
                                size={120}
                                src={previewImage}
                                style={{marginBottom: "20px"}}
                            />
                            
                            <Upload beforeUpload={beforeUpload}
                                showUploadList={false}
                                maxCount={1}
                                customRequest={(options) => handleUploadFile(options)}
                                >
                                <Button icon={<UploadOutlined />}>Upload Avatar</Button>
                            </Upload>
                        </Col>
                        <Col span={12}>
                            <Form
                                form={form}
                                name="basic"
                                labelCol={{ span: 16 }}
                                wrapperCol={{ span: 24 }}
                                // style={{ maxWidth: "100%" }}
                                initialValues={{ remember: true }}
                                onFinish={onFinish}
                                autoComplete="off"
                                layout="vertical"
                            >
                                <Form.Item<IUserTable>
    
                                    label="Email"
                                    name="email"
                                    rules={[{ required: true, message: 'Please input your email!' }]}
                                >
                                    <Input disabled  style={{width: "100%"}}/>
                                </Form.Item>

                                <Form.Item<IUserTable>
    
                                    label="Tên hiển thị"
                                    name="fullName"
                                    rules={[{ required: true, message: 'Please input your fullName!' }]}
                                >
                                    <Input style={{width: "100%"}}/>
                                </Form.Item>

                                <Form.Item<IUserTable>
    
                                    label="Số điện thoại"
                                    name="phone"
                                    rules={[{ required: true, message: 'Please input your phone!' }]}
                                >
                                    <Input style={{width: "100%"}}/>
                                </Form.Item>
                                <Button onClick={()=>form.submit()}>Cập nhật</Button>
                            </Form>
                        </Col>
                    </Row>
                :
                    <Form
                                form={form}
                                name="changePassword"
                                labelCol={{ span: 16 }}
                                wrapperCol={{ span: 24 }}
                                style={{ maxWidth: "50%" }}
                                initialValues={{ remember: true }}
                                onFinish={onFinishFormChangePass}
                                autoComplete="off"
                                layout="vertical"
                            >
                                <Form.Item
    
                                    label="Email"
                                    name="email"
                                    rules={[{ required: true, message: 'Please input your email!' }]}
                                >
                                    <Input disabled  style={{width: "100%"}}/>
                                </Form.Item>

                                <Form.Item
    
                                    label="Mật khẩu hiện tại"
                                    name="currentPassword"
                                    rules={[{ required: true, message: 'Please input your fullName!' }]}
                                >
                                    <Input.Password style={{width: "100%"}}/>
                                </Form.Item>

                                <Form.Item
    
                                    label="Mật khẩu mới"
                                    name="newPassword"
                                    rules={[{ required: true, message: 'Please input your phone!' }]}
                                >
                                    <Input.Password style={{width: "100%"}}/>
                                </Form.Item>
                                <Button onClick={()=>form.submit()}>Cập nhật</Button>
                    </Form>
                }
            </Modal>

        </>
    )
};

export default AppHeader;
