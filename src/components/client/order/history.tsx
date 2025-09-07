import { fetchDataHistory } from "@/services/api";
import { Divider, Drawer, message, notification, Space, Table, TableProps, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";



const History = () => {
    const [open, setOpen] = useState(false);
    const [listHistory,setListHistory] = useState<IHistory[]>([]);
    const [order,setOrder] = useState<{bookName: string,quantity:number,_id: string}[]>()
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

    const fetchHistory = async () => {
        const res = await fetchDataHistory();
        if(res && res.data){
           const arr: IHistory[] = Array.isArray(res.data)
        ? res.data
        : [res.data];
      setListHistory(arr);
        }
        else{
            notification.error(
                {
                    message:"Có lỗi xảy ra",
                    description:res.message
                }

            )
        }
    }
    const hanldClickDetail = (record : IHistory) => {
        setOrder(record.detail);
        showDrawer();

    }

    useEffect(()=>{
        fetchHistory();
    },[])
 
    const columns: TableProps<IHistory>['columns'] = [
  {
    title: 'STT',
    render: (_,text,index) => index,
  },
  {
    title: 'Thời gian',
    dataIndex: 'createdAt',
    render: (_,record) => dayjs(record?.createdAt).format("YYYY-MM-DD")
  },
  {
    title: 'Tổng số tiền',
    dataIndex: '',
    render: (_,record) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.totalPrice)
  },
  {
    title: 'Trạng thái',
    render: (_) => (
      <>
            <Tag color={"green"}>
              {"Thành công"}
            </Tag>
      </>
    ),
  },
  {
    title: 'Chi tiết',
    render: (_, record) => (
        <a onClick={()=>hanldClickDetail(record)}>Xem chi tiết</a>
    ),
  },
];


    return (
        <>
            <Table<IHistory> columns={columns} dataSource={listHistory} />
            <Drawer
            title="Chi tiết đơn hàng"
            closable={{ 'aria-label': 'Close Button' }}
            onClose={onClose}
            open={open}
          >
            {
                order?.map((e)=>(
                    <>
                        <li>Tên sách: {e.bookName}</li>
                        <li>Số lượng: {e.quantity}</li>
                        <Divider />
                    </>
                ))
            }
          </Drawer>
        </>
    )
}

export default History;