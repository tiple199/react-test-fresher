import { Col, Row, Skeleton } from "antd";


const BookLoader = () => {
    
    return(
        <div style={{ background: "#efefef", padding: "20px 0 60px" }}>
      <div className="bookPage-container" style={{ background: "#fff", padding: "15px 20px", maxWidth: 1440, margin: "0 auto", borderRadius: 10 }}>
        <Row gutter={20}>
          <Col md={8} sm={24}>
            <Skeleton.Node active style={{ width: 450, height: 300 }}/>
            <div style={{marginTop: "15px",display: "flex", gap: 15, justifyContent: "center"}}>
                <Skeleton.Image active/>
                <Skeleton.Image active/>
                <Skeleton.Image active/>
            </div>

            
          </Col >
          
            
            <Col md={16} sm={24}>
                <Skeleton active style={{marginBottom: "30px"}}/>
                <Skeleton active />
                <div style={{marginTop: "30px",display: "flex",gap: 20}}>
                    <Skeleton.Button active style={{width: 80}}/>
                    <Skeleton.Button active style={{width: 80}}/>
                </div>
          </Col>
        </Row>
      </div>

      
    </div>
    )
}

export default BookLoader