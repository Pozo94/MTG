import React, { useState, useEffect } from 'react';
import { Button, Table, Typography } from 'antd';
import '../css/ResponsiveStyledTable.css';
import { TrophyOutlined } from '@ant-design/icons';
import { useResults } from '../context/ResultsContext';
import { io } from 'socket.io-client';


const { Title } = Typography;

const socket = io('http://localhost:5000'); // <- dostosuj adres jeśli inny

const ResultsPage = () => {
    const { results, groups, categories, lastUpdated, fetchResults } = useResults();
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        socket.on('scoresUpdated', () => {
            fetchResults();
        });
        return () => {
            socket.off('scoresUpdated');
        };
    }, []);

    const placeToEmoji = {
        1: '🥇',
        2: '🥈',
        3: '🥉',
    };

    const assignPodiumPlaces = (participants) => {
        if (!participants || participants.length === 0) return [];

        const sorted = [...participants].sort((a, b) => {
            const scoreA = a.totalScore ?? 0;
            const scoreB = b.totalScore ?? 0;
            return scoreB - scoreA;
        });

        const total = sorted.length;

        if (total <= 3) {
            return sorted.map((participant, index) => ({
                ...participant,
                place: index + 1,
                key: index,
            }));
        }

        const base = Math.floor(total / 3);
        const remainder = total % 3;
        const counts = [
            base,
            base + (remainder >= 2 ? 1 : 0),
            base + (remainder >= 1 ? 1 : 0),
        ];
        const places = [
            ...Array(counts[0]).fill(1),
            ...Array(counts[1]).fill(2),
            ...Array(counts[2]).fill(3),
        ];

        return sorted.map((participant, index) => ({
            ...participant,
            place: places[index],
            key: index,
        }));
    };

    const categoriesInSelectedGroup = () => {
        if (!selectedGroup) return [];
        const groupData = results.find(group => group._id === selectedGroup);
        if (!groupData) return [];
        return [...new Set(groupData.participants.map(p => p.category))];
    };

    const filteredParticipants = () => {
        if (!selectedGroup || !selectedCategory) return [];

        const groupData = results.find(group => group._id === selectedGroup);
        if (!groupData) return [];
        return groupData.participants.filter(p =>
            p.category === selectedCategory
        );
    };

    const columns = [
        {
            title: 'Miejsce',
            dataIndex: 'place',
            key: 'place',
            align: 'center',
            render: (place) => `${placeToEmoji[place] || ''} `,
        },
        {
            title: 'Imię i nazwisko',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            render: (value) => value ?? '–',
        },
        {
            title: 'Ćw. Wolne',
            dataIndex: 'score1',
            key: 'score1',
            align: 'center',
            render: (obj) => (obj && typeof obj.total === 'number') ? obj.total : '–',
        },
        {
            title: 'Skok',
            dataIndex: 'score2',
            key: 'score2',
            align: 'center',
            render: (obj) => (obj && typeof obj.total === 'number') ? obj.total : '–',
        },
        {
            title: 'Dodatkowy Przyrząd',
            dataIndex: 'score3',
            key: 'score3',
            align: 'center',
            render: (obj) => (obj && typeof obj.total === 'number') ? obj.total : '–',
        },
        {
            title: 'Suma punktów',
            dataIndex: 'totalScore',
            key: 'totalScore',
            align: 'center',
            render: (value) => value ?? '–',
        },
    ];

    const podiumResults = assignPodiumPlaces(filteredParticipants());
    return (
        <div style={{ textAlign: 'center', padding: 30 }}>
            <Title level={2} style={{ textAlign: 'center', color: '#faad14', marginBottom: 40 }}>
                <TrophyOutlined style={{ marginRight: 10 }} />
                Wyniki Zawodów
            </Title>

            {/* Filtr: Rzut */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 10 }}>
                    <label><strong>Wybierz rzut:</strong></label>
                </div>
                {[...groups].sort().map(group => (
                    <Button
                        key={group}
                        type={selectedGroup === group ? 'primary' : 'default'}
                        onClick={() => {
                            setSelectedGroup(group);
                            setSelectedCategory('');
                        }}
                        style={{ margin: '0 5px' }}
                    >
                        {group}
                    </Button>
                ))}
            </div>

            {/* Filtr: Kategoria */}
            {selectedGroup && (
                <div style={{ marginBottom: 40 }}>
                    <div style={{ marginBottom: 10 }}>
                        <label><strong>Wybierz kategorię:</strong></label>
                    </div>
                    {categoriesInSelectedGroup().sort().map(category => (
                        <Button
                            key={category}
                            type={selectedCategory === category ? 'primary' : 'default'}
                            onClick={() => setSelectedCategory(category)}
                            style={{ margin: '0 5px' }}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            )}

            {/* Tabela wyników */}
            {selectedGroup && selectedCategory && (
                <div className="table-container">
                    <div className="table-wrapper">
                        <Table
                            dataSource={podiumResults}
                            columns={columns}
                            rowKey={(record) => record._id || record.key}
                            pagination={false}
                            bordered
                        />
                    </div>

                </div>
            )}
        </div>
    );
};

export default ResultsPage;
