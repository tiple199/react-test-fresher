import { useCurrentApp } from "@/components/context/app.context";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Empty, InputNumber, message, Row, Steps } from "antd";

interface IProps{
    setCurrent: (v: number) => void;
}

const OrderDetail = (props : IProps) => {
    const {setCurrent} = props;
    let totalPrice = 0;
    const {carts,setCarts} = useCurrentApp();

    

    const handleQtyChange = (index: number , value: number | null) => {
        let arr : ICart[] =[];
        carts.forEach((item,i)=>{
            if(i === index){
                item.quantity = value!;
            }
            arr.push(item);
        })
        setCarts(arr);
    }

    const handleDeleteItem = (index : number) => {
        const newCarts = carts.filter((_,i) => i !== index);
        localStorage.setItem("cart",JSON.stringify(newCarts));
        setCarts(newCarts);
        
    }
    const handleBuyClick = () => {
        if(carts.length <= 0){
            message.error("Không có sản phẩm nào trong order!");
            return;
        }
        setCurrent(1);
    }
    return (
        
            <div className="page-order">
                <Row gutter={20}>
                    <Col md={17}>
                        {carts.length > 0 ?
                            carts.map((e,index)=>(
                                <div className="item-order" key={`item-order-${index}`}>
                                    <div style={{display: "flex",alignItems: "center"}}>
                                    <img className="item-order__image" src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${e.detail.thumbnail}`} alt="" />
                                    <p className="mainText">{e.detail.mainText}</p>
                                    <span className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(+e.detail.price)}</span>
                                    <div><InputNumber value={e.quantity} min={1} onChange={(v)=>{handleQtyChange(index,v)}}/></div>
                                    </div>
                                    <span className="total-item">Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(e.quantity*+e.detail.price)}</span>
                                    <DeleteOutlined style={{color: "red", cursor: "pointer"}} onClick={()=>handleDeleteItem(index)}/>
                                    <div hidden>{totalPrice = totalPrice + e.quantity*+e.detail.price}</div>
                                </div>
                            ))
                        :
                        <Empty
                            description="Không có order nào hiện tại!"
                        />
                        }
                        
                    </Col>
                    <Col md={7}>
                        <div className="total-price">
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

                            <Button type="primary" danger style={{width: "100%"}} onClick={handleBuyClick}>Mua Hàng ({carts.length ?? 0})</Button>

                        </div>
                    </Col>
                </Row>
            </div>
        
    )
}

export default OrderDetail;