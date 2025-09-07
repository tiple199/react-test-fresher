import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Empty, InputNumber, message, Row, Steps,Radio, Form, Input } from "antd";
import type { RadioChangeEvent } from 'antd';
import { useState,useEffect } from "react";
import {useNavigate} from "react-router-dom";
import {useCurrentApp} from "@/components/context/app.context";
import { createOrderAPI } from "@/services/api";
import { log } from "console";
interface IProps{
    setCurrent: (v: number) => void;
}

type FieldType = {
    typePayment: string,
    name: string,
    phone: string,
    address: string

}

const Payment = (props: IProps) => {
    const {setCurrent} = props;
    let totalPrice = 0;
    const {carts,setCarts,user} = useCurrentApp();
    const nav = useNavigate();
    const { TextArea } = Input;
    const [form] = Form.useForm();
    const [loading,setLoading] = useState(false);


    const handleDeleteItem = (index : number) => {
        const newCarts = carts.filter((_,i) => i !== index);
        localStorage.setItem("cart",JSON.stringify(newCarts));
        setCarts(newCarts);
        
    }
    const handleBuyClick = () => {
        if(carts.length <= 0){
            message.error("Không có sản phẩm nào trong order!");
            nav("/");
            return;
        }
        form.submit();
        
    }

    const handleBackPage = () => {
        setCurrent(0);
    }

    useEffect(()=>{
        form.setFieldsValue({ name:  user?.fullName, phone: user?.phone,typePayment: "COD"});


    })
    const onFinish = async (values: FieldType) => {
        setLoading(true);
        let arrDetail:{
            bookName: string,
            quantity: number,
            _id: string
        }[] = [];
        carts.forEach((e)=>{
            const newObject = {bookName: e.detail.mainText,quantity: e.quantity,_id: e._id}
            arrDetail.push(newObject)
        })
        
        const res = await createOrderAPI(values.name,values.address,values.phone,totalPrice,values.typePayment,arrDetail);
        if(res && res.data){
            setCurrent(2);
            setCarts([]);
            localStorage.removeItem("cart");
        }
        setLoading(false);

    };

    return (
        <div className="page-order">
                <Row gutter={20}>
                    <Col md={17}>
                        {
                            carts.map((e,index)=>(
                                <div className="item-order" key={`item-order-${index}`}>
                                    <div style={{display: "flex",alignItems: "center"}}>
                                    <img className="item-order__image" src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${e.detail.thumbnail}`} alt="" />
                                    <p className="mainText">{e.detail.mainText}</p>
                                    <span className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(+e.detail.price)}</span>
                                    <div className="quantity">Số lượng: {e.quantity}</div>
                                    </div>
                                    <span className="total-item">Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(e.quantity*+e.detail.price)}</span>
                                    <DeleteOutlined style={{color: "red", cursor: "pointer"}} onClick={()=>handleDeleteItem(index)}/>
                                    <div hidden>{totalPrice = totalPrice + e.quantity*+e.detail.price}</div>
                                </div>
                            ))
                            
                        
                        
                        }
                        <span style={{cursor: "pointer", marginTop: "10px",display: "block"}} onClick={handleBackPage}>Quay trở lại</span>
                        
                    </Col>
                    <Col md={7}>
                        <div className="total-price">
                            <Form 
                                form={form}
                                name="Payment"
                                layout={"vertical"}
                                onFinish={onFinish}
                            >
                                <Form.Item name="typePayment" label="Hình thức thanh toán">
                                    
                                    <Radio.Group
                                    style={{marginBottom: "30px"}}
                                    // value={value}
                                    options={[
                                      { value: "COD", label: 'Thanh toán khi nhận hàng'},
                                      { value: "BANKING", label: 'Chuyển khoản ngân hàng' },    
                                    ]}
                                     />
                                </Form.Item>

                                <Form.Item
                                    label="Họ tên"
                                    name="name"
                                    rules={[{ required: true, message: 'Please input your name!' }]}
                                >
                                 <Input/>
                                </Form.Item>

                                <Form.Item
                                    label="Phone"
                                    name="phone"
                                    rules={[{ required: true, message: 'Please input your phone!' }]}
                                >
                                 <Input/>
                                </Form.Item>

                                <Form.Item
                                    label="Địa chỉ nhận hàng"
                                    name="address"
                                    rules={[{ required: true, message: 'Please input your address!' }]}
                                >
                                 <TextArea rows={4} />
                                </Form.Item>

                            

                            <div style={{display: "flex", justifyContent: "space-between"}}>
                                <span>Tạm tính</span>
                                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
                            </div>
                            <Divider />
                            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <span>Tổng tiền</span>
                                <span style={{fontSize: "20px", color: "#f04a4d"}}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
                            </div>
                            <Divider />

                            <Button type="primary" loading={loading} danger style={{width: "100%"}} onClick={handleBuyClick}>Mua Hàng ({carts.length ?? 0})</Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </div>
    )
}

export default Payment;