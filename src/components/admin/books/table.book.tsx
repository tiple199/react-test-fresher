import { deleteBookAPI, getBookAPI } from "@/services/api";
import { DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, message, notification, Popconfirm} from "antd";
import { useRef, useState } from "react";
import { CSVLink } from "react-csv";
import BookDetail from "./detail.book";
import CreateBook from "./create.book";
import UpdateBook from "./update.book";

type TSearch = {
  mainText: string,
  author: string

}


const BookTable = () => {
  const [meta,setMeta] = useState({
          current:1,
          pageSize:5,
          pages:0,
          total:0,
      });
    const [dataExport,setDataExport] = useState<IBookTable[] | null>(null);
    const [isOpenModalDetail,setIsOpenModalDetail] = useState<boolean>(false);
    const [dataBook,setDataBook] = useState<IBookTable | null>(null);
    const [isOpenModalAddBook,setIsOpenModalAddBook] = useState<boolean>(false);
    const [isReloadTable, setIsReloadTable] = useState(false);
    const [isOpenModalUpdate, setIsOpenModalUpdate] = useState(false);

    const columns: ProColumns<IBookTable>[] = [
  {
    title: "Id",
    hideInSearch:true,
    render: (_,record) => (
      <a href="#" onClick={()=>{
        setIsOpenModalDetail(true);
        setDataBook(record)

        
      }}>{record._id}</a>
    )
  },
  {
    title: "Tên sách",
    dataIndex: 'mainText',
    sorter: true
  },
  {
    title: "Thể loại",
    dataIndex: 'category',
    hideInSearch:true
  },
  {
    title: "Tác giả",
    dataIndex: 'author',
    sorter: true
  },
  {
    title: "Giá tiền",
    dataIndex: 'price',
    sorter: true,
    hideInSearch:true,
    render: (_,record) => {
      const price = Number(record.price);
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
    title: "Ngày cập nhật",
    dataIndex: 'updatedAt',
    valueType:"date",
    sorter: true,
    hideInSearch:true
  },
  {
    title:"Action",
    hideInSearch:true,
    render: (_,record) => (
      <>
        <a onClick={()=>{
          setIsOpenModalUpdate(true);
          setDataBook(record);
        }}><EditOutlined style={{color:"orange", marginRight:"10px",cursor:"pointer"}}/></a>
        <a onClick={()=>{
          
        }}><Popconfirm
            placement="left"
            title={"Xác nhận xóa Book"}
            onConfirm={confirm}
            description={"Bạn có chắc chắn muốn xóa book này?"}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined style={{color:"red"}} onClick={()=>{setDataBook(record)}}/>
          </Popconfirm></a>
      </>

    )
  }
  
  
];
  const confirm = async () => {
    const res = await deleteBookAPI(dataBook?._id!);
    if(res && res.data){
      message.success("Delete book success!");
    }
    else{
      notification.error(
        {
          message:"Delete book error!",
          description: res.message,
        }

      )
    }
    actionRef.current?.reload();
  };
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

    const reloadTable = () => {
      setIsReloadTable(true);
      actionRef.current?.reload(true);
    }
    
    const actionRef = useRef<ActionType>();
  return (
    <>
      <ProTable<IBookTable,TSearch>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          // console.log(sort, filter);
          let query ="";
          query += `current=${params.current}&pageSize=${params.pageSize}`;
          if(params.mainText){
            query += `&mainText=/${params.mainText}/i`;
          }
          if(params.author){
            query += `&author=/${params.author}/i`;
          }
          if(sort.mainText){
            sort.mainText === "ascend" ? query += `&sort=mainText` : query += `&sort=-mainText`;

          }
          else if(sort.author){
            sort.author === "ascend" ? query += `&sort=author` : query += `&sort=-author`;

          }
          else if(sort.price){
            sort.price === "ascend" ? query += `&sort=price` : query += `&sort=-price`;

          }
          else if(sort.updatedAt || isReloadTable){
            sort.updatedAt === "ascend" ? query += `&sort=updatedAt` : query += `&sort=-updatedAt`;

          }

          const res = await getBookAPI(query);
          if(res.data){
            setMeta(res.data.meta);
            setDataExport(res.data.result);
            
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

        headerTitle="Book Table"
        toolBarRender={() => [
          <CSVLink
                data={ArrayDataExport()}
                filename="book_export.csv"
                target="_blank"
                key="export"
            >
                <Button icon={<ExportOutlined />} type="primary">
                    Export
                </Button>
            </CSVLink>,
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsOpenModalAddBook(true);
              actionRef.current?.reload();
            }}
            type="primary"
          >
            Add New
          </Button>,

        ]}
      />


      <BookDetail 
      isOpenModalDetail={isOpenModalDetail}
      setIsOpenModalDetail={setIsOpenModalDetail}
      dataBook={dataBook}
      setDataBook={setDataBook}
      />

      <CreateBook
      setIsOpenModalAddBook={setIsOpenModalAddBook}
      isOpenModalAddBook={isOpenModalAddBook}
      reloadTable={reloadTable}
      />

      <UpdateBook 
      setIsOpenModalUpdate={setIsOpenModalUpdate}
      isOpenModalUpdate={isOpenModalUpdate}
      reloadTable={reloadTable}
      dataBook={dataBook}
      setDataBook={setDataBook}
      />
    </>
  );
    
}

export default BookTable;