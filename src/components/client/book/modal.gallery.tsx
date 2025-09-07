import { Col, Flex, Image, Modal, Row } from "antd"
import { useEffect, useRef, useState } from "react"
import ReactImageGallery from "react-image-gallery"

interface IProps{
    isOpen: boolean
    setIsOpen: (v: boolean) => void
    currentIndex: number
    items: {
          original: string,
          thumbnail: string,
          originalClass: string
          thumbnailClass: string
        }[]
    title: string
}
const ModalGallery = (props: IProps) => {

    const {items,isOpen,setIsOpen,currentIndex,title} = props;
    const [activeIndex, setActiveIndex] = useState(0);
    const refGallery = useRef<ReactImageGallery>(null);
    useEffect(()=>{
        if(isOpen){
            setActiveIndex(currentIndex)
        }
    },[isOpen,currentIndex]);
    return (
        <Modal
            width={'60vw'}
            closable={false}
            open={isOpen}
            onCancel={()=>setIsOpen(false)}
            footer={null}
            
        >
        <Row gutter={[20,20]}>
                <Col span={16}>
                    <ReactImageGallery 
                        ref={refGallery}
                        items={items}
                        showPlayButton={false}
                        showFullscreenButton={false}
                        startIndex={currentIndex}
                        showThumbnails={false}
                        onSlide={(i)=> setActiveIndex(i)}
                        slideDuration={0}
                    />
                </Col>

                <Col span={8} >
                        <p style={{textAlign: "center",marginBottom: "10px"}} className="mainText">Tên quyển sách</p>
                    
                        <div style={{display: "flex",flexWrap:"wrap",justifyContent:"center", rowGap: "20px"}}>
                            {items.map((item,i)=>{
                                return(
                                    <Col key={`item-${i}`} style={{cursor: "pointer"}}>
                                        <Image
                                            className={activeIndex === i ? "active" : ""}
                                            width={100}
                                            height={100}
                                            src={item.original}
                                            preview={false}
                                            onClick={()=>{
                                                refGallery.current?.slideToIndex(i);
                                            }}
                                        />
                                        
                                    </Col>
                                )
                            })}
                        </div>
                    
                </Col>
        </Row>
    </Modal>
    )
}

export default ModalGallery;