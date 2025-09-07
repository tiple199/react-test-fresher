import { getDashboardAPI } from "@/services/api";
import { Card, Col, Row, Statistic } from "antd";
import { StatisticProps } from "antd/lib";
import { useEffect, useState } from "react";
import CountUp from 'react-countup';

const DashBoardPage = () => {

    const formatter: StatisticProps['formatter'] = (value) => (
        <CountUp end={value as number} separator="," />
    );

    const [data,setData] = useState<IDashBoard>()

    const fetchData = async () => {
        const res = await getDashboardAPI();
        if(res && res.data){
            setData(res.data);
        }
    }

    useEffect(()=>{
        fetchData();
    },[])

    return (
        <div>
            <Row gutter={16}>
                <Col span={8}>
                  <Card title="Tổng users">
                    <Statistic title="Tổng Users" value={data?.countUser} formatter={formatter} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Tổng đơn hàng">
                    <Statistic title="Tổng đơn hàng" value={data?.countOrder} formatter={formatter} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Tổng Books">
                    <Statistic title="Tổng Books" value={data?.countBook} formatter={formatter} />
                  </Card>
                </Col>
            </Row>
        </div>
    )
}

export default DashBoardPage;
