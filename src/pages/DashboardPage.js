import React from 'react';
import { Typography } from 'antd';
import LiveScoreboard from "../components/LiveScoreBoard";
const { Title } = Typography;

const DashboardPage = () => {
    return (
        <div
            style={{

                minHeight: '100vh',
                padding: '60px 20px 20px 20px',
                textAlign: 'center'
            }}
        >
            <Title
                level={1}
                style={{
                    fontSize: '42px',
                    color: '#1890ff',
                    fontWeight: 'bold',
                    marginBottom: '40px',
                }}
            >
                <img alt={"Logo"} src={"banner MTG.png"}style={{width: '80%', height: 'auto',maxWidth:'1000px'}}/>
            </Title>
            <LiveScoreboard/>
        </div>
    );
};

export default DashboardPage;
