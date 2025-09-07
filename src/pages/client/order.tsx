import "@/styles/order.scss";
import OrderDetail from "@/components/client/order";
import { useState } from "react";
import {Breadcrumb, Button, Result, Steps} from "antd";
import Payment from "@/components/client/order/payment";
import { Link } from "react-router-dom";
import BreadcrumbItem from "antd/es/breadcrumb/BreadcrumbItem";

const OrderPage = () => {
    const [current, setCurrent] = useState(0);
    
    
    return(
        <div style={{background: "#efefef",padding: " 20px 40px"}}>
            <div className="step-order" style={{background: "#fff",margin: "0 0 20px 0", padding: "15px", borderRadius: "7px"}}>
                <Steps
                    size="small"
                    current={current}
                    items={[
                      {
                        title: 'Đơn hàng',
                      },
                      {
                        title: 'Đặt hàng',
                      },
                      {
                        title: 'Thanh toán',
                      },
                    ]}
                />
            </div>
            {current === 0 &&
                <>
                  <Breadcrumb
                    style={{marginBottom: 15}}
                    separator=">"
                    items={[
                      {
                        title: <Link to={"/"}>Trang chủ</Link>
                      },
                      {
                        title: "Chi tiết rỏ hàng"
                      }
                    ]}
                   />
                  <OrderDetail setCurrent={setCurrent}/>
                </>
            }
            {current === 1 &&
                <>
                  <Breadcrumb
                      style={{marginBottom: 15}}
                      separator=">"
                      items={[
                        {
                          title: <Link to={"/"}>Trang chủ</Link>
                        },
                        {
                          title: "Đặt hàng"
                        }
                      ]}
                     />
                  <Payment setCurrent={setCurrent}/>
                </>
            }
            {current === 2 &&
              <Result
                status="success"
                title="Đặt hàng thành công"
                subTitle="Hệ thống đã ghi nhận thông tin đơn hàng của bạn"
                extra={[
                  <Button type="primary" key="home">
                    <Link to={"/"}>
                      Trang Chủ
                    </Link>
                  </Button>,
                  <Button key="history"><Link to={"/history"}>Lịch sử mua hàng</Link></Button>,
                ]}
              />
            }
        </div>
       
    )
}
export default OrderPage;