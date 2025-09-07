import {FilterTwoTone, ReloadOutlined } from "@ant-design/icons";
import "@/styles/home.scss";
import { Button, Checkbox, Col, Divider, Flex, Form, FormProps, InputNumber, Pagination, PaginationProps, Rate, Row, Spin, Tabs, TabsProps } from "antd";
import { fetchOptionCategoryAPI, getBookAPI } from "@/services/api";
import { useEffect, useState } from "react";
import { log } from "console";
import { GetProp } from "antd/lib";
import { useNavigate, useOutletContext } from "react-router-dom";

type FieldType = {
  category?: string[];
  range?: {from: number, to: number};
};

const HomePage = () => {
    const [searchTerm] = useOutletContext() as any
    const [current,setCurrent] = useState<number>(1);
    const [pageSize,setPageSize] = useState<number>(10);
    const [optionCategory, setOptionCategory] = useState<string[]>([]);
    const [dataBook,setDataBook] = useState<IBookTable[]>([]);
    const [totalBook,setTotalBook] = useState<number>(0);
    const [filter,setFilter] = useState<string>("");
    const [sortQuery, setSortQuery] = useState<string>("sort=-sold")
    const [form] = Form.useForm();
    const [loading,setLoading] = useState<boolean>(false);
    const nav = useNavigate();
    const fetchDataBook = async () => {
        setLoading(true);
        let query = `current=${current}&pageSize=${pageSize}`;
        if(filter){
            query += `&${filter}`;
        }
        if(sortQuery){
            query += `&${sortQuery}`;
        }
        if(searchTerm){
            query += `&mainText=/${searchTerm}/i`;
        }
        const res = await getBookAPI(query);
        if(res && res.data){
            setDataBook(res.data.result);
            setTotalBook(res.data.meta.total);
        }
        setLoading(false);

    }
    const fetchCategory = async () => {
        const res = await fetchOptionCategoryAPI();
        if(res && res.data){
            setOptionCategory(res.data);
        }
        
    }
    useEffect(()=>{
        fetchCategory();
        
    },[])
    useEffect(()=>{
        fetchDataBook();
        
    },[current,pageSize,filter,sortQuery,searchTerm]);

    const onChangeCheckBox: GetProp<typeof Checkbox.Group, 'onChange'> = (checkedValues) => {
        const queryFilter = checkedValues.toString();        
        setFilter(`category=${queryFilter}`);
    };

    const handlePageChange= (pagination:{current:  number, pageSize: number}) => {    
            
        if(pagination && pagination.current !== current){
            setCurrent(pagination.current);
        }
        if(pagination && pagination.pageSize !== pageSize){
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }


    };
    const onChangeTab = (key: string) => {
        if(key == "1"){
            setSortQuery("sort=-sold");
        }
        else if(key == "2"){
            setSortQuery("sort=-createdAt");
        }
        else if(key == "3"){
            setSortQuery("sort=price");
        }
        else{
            setSortQuery("sort=-price");
        }
    };
    const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
        let queryFilter = "";
        if(values.category){
            queryFilter += `category=${values.category.toString()}`;
        }
        if(values.category && values.range?.from && values.range.to){
            queryFilter += `&price>=${values.range.from}&price<=${values.range.to}`;
        }
        else if(values.range?.from && values.range.to){
            queryFilter += `price>=${values.range.from}&price<=${values.range.to}`;
        }
        setFilter(queryFilter);
        
    };
    const items: TabsProps['items'] = [
        {
          key: '1',
          label: 'Phổ biến',
          children: <></>,
        },
        {
          key: '2',
          label: 'Hàng mới',
          children: <></>,
        },
        {
          key: '3',
          label: 'Giá thấp đến cao',
          children: <></>,
        },
        {
          key: '4',
          label: 'Giá cao đến thấp',
          children: <></>,
        },
    ];

    const handleChangeCategory = (changedValues: FieldType,values: FieldType) => {
        console.log("check test",changedValues,values);
        if(changedValues.category){
            const queryFilter = changedValues.category.toString();        
        setFilter(`category=${queryFilter}`);
        }
        
    }

    return (
        <div style={{background: "#efefef",padding: "20px 0"}}>
            <div className="homepage-container" style={{maxWidth: 1440, margin: "0 auto"}}>
                <Row gutter={20}>
                    <Col md={4} sm={0} xs={0}>
                        <div style={{background: "#fff",padding: "20px", borderRadius: "7px"}}>
                            <div style={{display: "flex", justifyContent: "space-between"}}>
                                <span><FilterTwoTone /> Bộ lọc tìm kiếm</span>
                                <ReloadOutlined title="Reset" onClick={()=> {form.resetFields(),setFilter("")}} style={{cursor: "pointer"}}/>
                            </div>
                            <Form
                                onFinish={onFinish}
                                form={form}
                                onValuesChange={(changedValues,values) => handleChangeCategory(changedValues,values)}
                                
                            >
                                <Form.Item
                                    name="category"
                                    label="Danh mục sản phẩm"
                                    labelCol={{span: 24}}
                                >
                                    <Checkbox.Group onChange={onChangeCheckBox}>
                                        <Row>
                                            {
                                                optionCategory.map(
                                                    (e,index)=>(
                                                        <Col span={24} key={`index-${index}`}>
                                                            <Checkbox value={e} >
                                                                {e}
                                                            </Checkbox>
                                                        </Col>
                                                    )
                                                )
                                            }
                                            
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>
        
                                <Divider/>
                                <Form.Item
                                    label="Khoảng giá"
                                    labelCol={{span: 24}}
                                >
                                    <div style={{display: "flex", justifyContent: "space-between"}}>
                                        <Form.Item name={["range", 'from']}>
                                            <InputNumber
                                                name="from"
                                                min={0}
                                                placeholder="đ Từ"
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            />
                                        </Form.Item>
                                        <span> - </span>
                                        <Form.Item name={["range", "to"]}>
                                            <InputNumber
                                                name="to"
                                                min={0}
                                                placeholder="đ Đến"
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                />
                                        </Form.Item>
                                    </div>
                                    <div>
                                        <Button onClick={()=> form.submit()}
                                            style={{width: "100%"}} type="primary"
                                            >Áp dụng</Button>
                                    </div>
                                </Form.Item>
                                <Divider/>
                                <Form.Item
                                    label= "Đánh giá"
                                    labelCol={{span: 24}}
                                >
                                    <div>
                                        <Rate value={5} disabled style={{color: "#ffce3d"}}/>
                                        <span></span>
                                        
                                    </div>
                                    <div>
                                        <Rate value={4} disabled style={{color: "#ffce3d"}}/>
                                        <span>trở lên</span>
                                        
                                    </div>
                                    <div>
                                        <Rate value={3} disabled style={{color: "#ffce3d"}}/>
                                        <span>trở lên</span>
                                        
                                    </div>
                                    <div>
                                        <Rate value={2} disabled style={{color: "#ffce3d"}}/>
                                        <span>trở lên</span>
                                        
                                    </div>
                                    <div>
                                        <Rate value={1} disabled style={{color: "#ffce3d"}}/>
                                        <span>trở lên</span>
                                        
                                    </div>
                                    
                                </Form.Item>
                            </Form>
                        </div>
                    </Col>
                    <Col md={20} xs={24}>
                        <Spin tip="Loading" spinning={loading}>
                            <div style={{background: "#fff", padding: "20px 0",borderRadius: "7px"}}>
                                <Row>
                                    <Tabs defaultActiveKey="1" items={items} onChange={onChangeTab} style={{paddingLeft: "10px"}}/>
                                </Row>
                                <Row className="customize-row">
                                    <div className="list-product">
                                        {dataBook.map((e,index)=>(
                                            <div className="column" key={`index-product-${index}`} onClick={()=>{nav(`/book/${e._id}`)}} style={{cursor: "pointer"}}>
                                                <div className="wrapper">
                                                    <div className="thumnail" style={{width: "100%", display: "flex", justifyContent: "center"}}>
                                                        <img src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${e.thumbnail}`} alt="" className="img"/>
                                                    </div>
                                                    <div className="text">{e.mainText}</div>
                                                    <div className="price">
                                                        {new Intl.NumberFormat("vi-VI", { style: "currency", currency: "VND" }).format(+e.price)},
                                                    </div>
                                                    <div className="rating">
                                                        <Rate value={5} disabled style={{color: "#ffce3d",fontSize: 10}}></Rate>
                                                        <span> Đã bán {e.sold}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                </Row>
                                <Divider />
                                <Row style={{display: "flex",justifyContent: "center"}}>
                                    <Pagination
                                        showSizeChanger={false}
                                        onChange={(p,s) => handlePageChange({current: p,pageSize:s})}
                                        defaultCurrent={1}
                                        total={totalBook}
                                        pageSize={pageSize}
                                        responsive
                                    />
                                </Row>
                            </div>
                        </Spin>
                    </Col>
                </Row>
    
            </div>
        </div>
    )
}

export default HomePage;