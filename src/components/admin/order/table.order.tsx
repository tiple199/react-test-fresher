import { deleteBookAPI, getBookAPI, getOrderAPI } from "@/services/api";
import { DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, message, notification, Popconfirm} from "antd";
import { useRef, useState } from "react";
import { CSVLink } from "react-csv";

type TSearch = {
  name: string,
  address: string

}


const OrderTable = () => {
  const [meta,setMeta] = useState({
          current:1,
          pageSize:5,
          pages:0,
          total:0,
      });

    const columns: ProColumns<IHistory>[] = [
    {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 48,
    },
  {
    title: "Id",
    hideInSearch:true,
    render: (_,record) => (
      <a href="#" onClick={()=>{

        
      }}>{record._id}</a>
    )
  },
  {
    title: "Full Name",
    dataIndex: 'name',
  },
  {
    title: "Address",
    dataIndex: 'address',
  },
  {
    title: "Giá tiền",
    dataIndex: 'totalPrice',
    sorter: true,
    hideInSearch:true,
    render: (_,record) => {
      const price = Number(record.totalPrice);
      // Format the number as VND currency
      return (
        <>
          {new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price)}
        </>
      )
    },
  },
  {
    title: "Create At",
    dataIndex: 'createdAt',
    valueType:"date",
    sorter: true,
    hideInSearch:true
  },
  
  
];

    
    const actionRef = useRef<ActionType>();
  return (
    <>
      <ProTable<IHistory,TSearch>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          // console.log(sort, filter);
          let query ="";
          query += `current=${params.current}&pageSize=${params.pageSize}`;
          if(params.name){
            query += `&name=/${params.name}/i`;
          }
          if(params.address){
            query += `&address=/${params.address}/i`;
          }

          else if(sort.totalPrice){
            sort.totalPrice === "ascend" ? query += `&sort=totalPrice` : query += `&sort=-totalPrice`;

          }
          else if(sort.createdAt){
            sort.createdAt === "ascend" ? query += `&sort=createdAt` : query += `&sort=-createdAt`;

          }

          const res = await getOrderAPI(query);
          if(res.data){
            setMeta(res.data.meta);
            
          }
          return {
            data: res.data?.result,
            page: res.data?.meta.current,
            success: true,
            total: res.data?.meta.total
                      }
        }}


        rowKey="_id"

        pagination={{
          current:meta.current,
          pageSize: meta.pageSize,
          showSizeChanger: true,
          total:meta.total,
          showTotal: (total, range)=> (
            <div>{range[0]} - {range[1]} trên {total} rows</div>
          )
        }}

        headerTitle="Table Order"
      />

    </>
  );
    
}

export default OrderTable;