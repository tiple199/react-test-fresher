import History from "@/components/client/order/history";
import { Divider } from "antd";

const HistoryPage = () => {
    return (
        <div style={{padding: "20px 50px"}}>
            <span style={{fontSize:20}}>Lịch sử mua hàng</span>
            <Divider />
            <History />
        </div>
    )
}

export default HistoryPage;