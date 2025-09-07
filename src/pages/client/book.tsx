
import { useParams } from "react-router-dom";

import BookDetail from "@/components/client/book/book.detail";
import { useEffect, useState } from "react";
import { getBookDetailAPI } from "@/services/api";
import BookLoader from "@/components/client/book/book.loader";


const BookPage = () => {
    let {id} = useParams();
    const [dataBook,setDataBook] = useState<IBookTable | null>(null);
    const [isLoadingBook,setIsLoadingBook] = useState<boolean>(true)
    const fetchDataBookDetail = async(id: string) => {
        setIsLoadingBook(true);
        const res = await getBookDetailAPI(id);
        if(res.data){
            setDataBook(res.data);
        }
        setIsLoadingBook(false);
        
    }
    
    useEffect(()=>{
        if(id){
           fetchDataBookDetail(id);
        }
    },[id])

    
    console.log(dataBook);
    
    return (
        <div>
            {isLoadingBook ? 
                    <BookLoader />
                    :
                    <BookDetail dataBook={dataBook}/>
            }
        </div>
    )
}

export default BookPage;