import React from 'react';
import {Card, Typography, Divider, Table} from 'antd';
import {useScoreFeed} from '../context/ScoreFeedContext';
import '../css/ResponsiveStyledTable.css';

const {Title, Text} = Typography;

const LiveScoreboard = () => {
    const {activeEvaluations, latestScores} = useScoreFeed();

    // Kolumny do tabeli
    const columns = [
        {
            title: 'Zawodnik',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
        },
        {
            title: 'Kategoria',
            dataIndex: 'category',
            key: 'category',
            align: 'center',
        },
        {
            title: 'Przyrząd',
            dataIndex: 'scoreKey',
            key: 'scoreKey',
            align: 'center',
        },
        {
            title: 'Ocena Baza',
            dataIndex: ['score', 'base'],
            key: 'base',
            align: 'center',
        },
        {
            title: 'Błędy',
            key: 'errors',
            align: 'center',
            render: (_, record) => {
                const {errors, errors2} = record.score;
                if (errors2 != null) {
                    return ((errors + errors2) / 2).toFixed(2);
                }
                return errors?.toFixed(2);
            },
        },
        {
            title: 'Ocena końcowa',
            dataIndex: ['score', 'total'],
            key: 'total',
            align: 'center',
        },
    ];
    const columns2 = [
        {
            title: 'Zawodnik',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
        },
        {
            title: 'Kategoria',
            dataIndex: 'category',
            key: 'category',
            align: 'center',
        },
        {
            title: 'Zastęp',
            dataIndex: 'team',
            key: 'team',
            align: 'center',
        },
        {
            title: 'Przyrząd',
            dataIndex: 'app',
            key: 'app',
            align: 'center',
        },
        {
            title: '',
            key: 'status',
            align: 'center',
            render: () => (
                <span className="blinking">Ocenianie</span>
            ),
        }
    ];

    return (
        <div style={{maxWidth: 1000, margin: '0 auto', padding: 24}}>
            <Title level={3} style={{textAlign: 'center'}}>Aktualnie oceniani zawodnicy</Title>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center'}}>
                {activeEvaluations.length === 0 ? (
                    <Text type="secondary">Brak aktywnych ocen.</Text>
                ) : (

                        <div className="table-container">
                            <div className="table-wrapper">
                                <Table
                                    dataSource={activeEvaluations}
                                    columns={columns2}
                                    pagination={false}
                                />
                            </div>
                        </div>

                )}
            </div>

            <Divider style={{margin: '40px 0'}}/>

            <Title level={3} style={{textAlign: 'center'}}>Ostatnie oceny</Title>
            {latestScores.length === 0 ? (
                <Text type="secondary" style={{display: 'block', textAlign: 'center'}}>Brak ocen.</Text>
            ) : (
                <div className="table-container">
                    <div className="table-wrapper">
                        <Table
                            dataSource={latestScores.map((item, index) => ({key: index, ...item}))}
                            columns={columns}
                            pagination={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveScoreboard;
