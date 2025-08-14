import { createUserAPI, deleteUserAPI, getUserAPI } from '@/services/api';
import { CloudDownloadOutlined, CloudUploadOutlined, DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { App, Avatar, Badge, Button, Descriptions, Divider, Drawer, Form, Input, message, Modal, Popconfirm, Space, Tag } from 'antd';
import { ReactNode, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { dateRangeValidate } from '@/services/helper';
import ImportUser from './import.user';
import { CSVLink } from 'react-csv';
import UpdateUser from './update.user';
import { PopconfirmProps } from 'antd/lib';


type TSearch = {
    fullName: string;
    email: string;
    createdAt: string;
    createAtRange: string;
}




const TableUser = () => {
    const actionRef = useRef<ActionType>();
    const [meta,setMeta] = useState({
        current:1,
        pageSize:5,
        pages:0,
        total:0,
    })
    const [isOpenViewDetail,setIsOpenViewDetail] = useState(false);
    const [dataUser,setDataUser] = useState<IUserTable | null>(null);
    const [isOpenModal,setIsOpenModal] = useState(false);
    const [isOpenModalImport,setIsOpenModalImport] = useState(false);
    const [form] = Form.useForm();
    const { message, notification } = App.useApp();
    const [isAutoLoad,setIsAutoLoad] = useState(false);
    const [dataExport,setDataExport] = useState<IUserTable[] | null>(null);
    const [isOpenModalUpdate,setIsOpenModalUpdate] = useState<boolean>(false);

    const confirm: PopconfirmProps['onConfirm'] = async (e) => {
        const res = await deleteUserAPI(dataUser?._id!);
        if(res && res.data){
            message.success('Delete User success!');
            reset();
        }
        else{
            notification.error({
                message:"Delete User Error",
                description: res.message
            })
        }
    };


    const columns: ProColumns<IUserTable>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,

        },
        {
            title: '_id',
            dataIndex: '_id',
            search: false,
            render:(_,record)=> (
                <a href="#" onClick={()=>{setIsOpenViewDetail(true),
                    setDataUser(record);
                }}>{record._id}</a>
                
            )

        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',


        },
        {
            title: 'Email',
            dataIndex: 'email',
            copyable: true

        },
        {
            title: 'Created At',
            dataIndex: 'createdAtRange',
            hideInTable: true,
            valueType:'dateRange'

        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            hideInSearch:true,
            valueType:'date',
            sorter: true

        },
        {
            title: 'Action',
            // dataIndex: 'title',
            search:false,

            render: (_,record) => (
                <>
                    <EditOutlined style={{color: "orange", cursor: "pointer", marginRight: "10px"}} onClick={()=>{
                        
                        setIsOpenModalUpdate(true);
                        setDataUser(record);
                    }}/>
                    <Popconfirm
                    placement="left"
                    title="Delete the task"
                    description="Are you sure to delete this task?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={confirm}
                    // onCancel={cancel}
                    >
                        <DeleteOutlined style={{color: "red", cursor: "pointer"}} onClick={()=>{
                            setDataUser(record);
                        }}/>
                    </Popconfirm>
                </>
            ) 
        },
    
    ];
    const reset = () => {
        setIsOpenModalUpdate(false);
        setIsOpenViewDetail(false);
        setDataUser(null);
        setIsOpenModal(false);
        setIsOpenModalImport(false);
        reloadData();
    }
    const avatarURL = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${dataUser?.avatar}`;

    const onFinishCreateUser = async (v: ICreateUser) => {
        const {fullName,email,password,phone} = v;
        const res = await createUserAPI(fullName,email,password,phone);
        if(res && res.data){
            message.success("Create User success");
        }
        else{
            notification.error({
                message: "Create User Error!",
                description:res.message && Array.isArray(res.message) ? res.message[0] : res.message,
            })
        }
        reset();
        form.resetFields();
        actionRef.current?.reload();
    }
    const reloadData = () => {
        setIsAutoLoad(true);
        actionRef.current?.reload();
    }
    const ArrayDataExport = () =>{
        let result: (string[] | any[])[] = [];
        let count = 1;
        dataExport?.map((e)=>{     
            if(count === 1){
                result.push(Object.keys(e));
                count++;
            }
            result.push(Object.values(e));

        })
        return result;
    }

    return (
        <>
            <ProTable<IUserTable, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    
                    // console.log(params,sort, filter);
                    let query = "";
                    if(params){
                        query += `current=${params.current}&pageSize=${params.pageSize}`;
                        if(params.email){
                            query += `&email=/${params.email}/i`;
                        }
                        if(params.fullName){
                            query += `&fullName=/${params.fullName}/i`;
                        }
                        const createDateRange = dateRangeValidate(params.createdAt);
                        if(createDateRange){

                            
                            query += `&createdAt>=${createDateRange[0]}&createdAt<=${createDateRange[1]}`;
                        }
                    }
                    if(sort){
                        
                        if(sort.createdAt === "ascend"){
                            query += `&sort=createdAt`;
                        }
                        else if(sort.createdAt === "descend"){
                            query += `&sort=-createdAt`;
                        }
                    }
                    if(isAutoLoad){
                        query += `&sort=-createdAt`;
                    }
                    const res = await getUserAPI(query);
                    
                    if(res.data){
                        setMeta(res.data.meta);
                        setDataExport(res.data.result);
                    }
                    
                    return {
                        data: res.data?.result,
                        page: 1,
                        success: true,
                        total: res.data?.meta.total
                    }

                }}
     
                rowKey="_id"

                pagination={
                {
                current: meta.current,
                pageSize: meta.pageSize,
                showSizeChanger: true,
                total:meta.total,
                showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) },

                } }
                headerTitle="Table user"
                toolBarRender={() => [
                    <>
                
                        <CSVLink
                            data={ArrayDataExport()}
                            filename="users_export.csv"
                            target="_blank"
                            key="export"
                        >
                            <Button icon={<ExportOutlined />} type="primary">
                                Export
                            </Button>
                        </CSVLink>
    

                        <Button
                        icon={<CloudUploadOutlined />}
                        type="primary"
                        onClick={()=>{
                            setIsOpenModalImport(true);
                        }}
                        >
                            Import
                        </Button>

                        <Button
                            key="button"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setIsOpenModal(true);
                            }}
                            type="primary"
                        >
                            Add new
                        </Button>
                    </>

                ]}
            />
            <Drawer
                width={"50%"}
                title="Chức năng xem chi tiết"
                closable={{ 'aria-label': 'Close Button' }}
                onClose={reset}
                open={isOpenViewDetail}
            >
                <Descriptions bordered title="User Info" >
                    <Descriptions.Item label="Id">{dataUser?._id}</Descriptions.Item>
                    <Descriptions.Item span={2} label="Tên hiển thị">{dataUser?.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{dataUser?.email}</Descriptions.Item>
                    <Descriptions.Item span={2} label="Số điện thoại">{dataUser?.phone}</Descriptions.Item>
                    <Descriptions.Item label="Role"> <Badge status="processing"></Badge> {dataUser?.role}</Descriptions.Item>
                    <Descriptions.Item span={2} label="Avatar"> <Avatar size={40} src={avatarURL}></Avatar></Descriptions.Item>
                    <Descriptions.Item label="Created At">{dayjs(dataUser?.createdAt).format("YYYY-MM-DD")}</Descriptions.Item>
                    <Descriptions.Item label="Updated At">{dayjs(dataUser?.updatedAt).format("YYYY-MM-DD")}</Descriptions.Item>
                    
                </Descriptions>
            </Drawer>

            <Modal
                title="Create User"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isOpenModal}
                onOk={form.submit}
                onCancel={reset}
            >
                <Divider></Divider>
                <Form form={form} layout='vertical' onFinish={onFinishCreateUser}>
                    <Form.Item<ICreateUser>
                        label="Tên hiển thị"
                        name="fullName"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item<ICreateUser>
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item<ICreateUser>
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please input your email!' },
                            {type:"email", message: "Format email is wrong!"}
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item<ICreateUser>
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

            <ImportUser
            isOpenModalImport={isOpenModalImport} 
            setIsOpenModalImport={setIsOpenModalImport}
            reloadData={reloadData}
            />

            <UpdateUser 
            isOpenModalUpdate={isOpenModalUpdate}
            setIsOpenModalUpdate={setIsOpenModalUpdate}
            dataUser={dataUser}
            reset={reset}
            />

            
                
            


            
        </>
        
    );
};

export default TableUser;