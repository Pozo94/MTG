import React, { useState, useEffect } from 'react';
import { Button, Typography, Modal, Form, Input ,Table} from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import './ResultsByTeamPage.css';
import { StyledTable } from '../components/StyledTable';
import { useResults } from '../context/ResultsContext';
import { useScoreFeed } from '../context/ScoreFeedContext';
import '../css/ResponsiveStyledTable.css';

const { Title } = Typography;
const ResultsByTeamPage = () => {
    const { results, groups, fetchResults, refreshResults, lastUpdated } = useResults();
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [form] = Form.useForm();
    const { startEvaluation, endEvaluation, pushScore } = useScoreFeed();

    const user = JSON.parse(localStorage.getItem('user'));
    const judgeRole = user?.role ?? null;


    const roleToScoreKey = {
        FX: 'score1',
        VT: 'score2',
        AD: 'score3',
    };

    const scoreKey = roleToScoreKey[judgeRole];

    const teamsInSelectedGroup = () => {
        if (!selectedGroup) return [];
        const groupData = results.find(group => group._id === selectedGroup);
        if (!groupData) return [];
        return [...new Set(groupData.participants.map(p => p.team))];
    };

    const filteredParticipants = () => {
        if (!selectedGroup || !selectedTeam) return [];
        const groupData = results.find(group => group._id === selectedGroup);
        if (!groupData) return [];
        return groupData.participants
            .filter(p => p.team === selectedTeam)
            .sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    };

    const parseLocaleFloat = (value) => {
        if (typeof value === 'string') {
            const parsed = parseFloat(value.replace(',', '.'));
            return isNaN(parsed) ? 0 : parsed;
        }
        return isNaN(value) ? 0 : parseFloat(value);
    };

    const roundToTwo = (num) => {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    };

    const openScoreModal = (participant) => {
        const scoreData = participant[scoreKey] ?? {};
        const base = scoreData.base ?? '';
        const errors = scoreData.errors ?? '';
        const errors2 = scoreData.hasOwnProperty('errors2') ? scoreData.errors2 : '';

        const parsedBase = parseLocaleFloat(base);
        const parsedErrors = parseLocaleFloat(errors);
        const parsedErrors2 = errors2 !== '' ? parseLocaleFloat(errors2) : null;
        const avgErrors = parsedErrors2 !== null ? (parsedErrors + parsedErrors2) / 2 : parsedErrors;
        const total = roundToTwo(parsedBase - avgErrors);

        setSelectedParticipant(participant);
        startEvaluation(participant,user.role);

        setIsModalOpen(true);

        form.setFieldsValue({
            base: base?.toString() ?? '',
            errors: errors?.toString() ?? '',
            errors2: errors2 !== '' ? errors2?.toString() : '',
            total: total.toFixed(2),
        });
    };

    const handleValueChange = (_, allValues) => {
        const base = parseLocaleFloat(allValues.base);
        const errors1 = parseLocaleFloat(allValues.errors);
        const rawErrors2 = allValues.errors2;

        let avgErrors = errors1;

        if (rawErrors2 !== undefined && rawErrors2 !== null && rawErrors2 !== '') {
            const errors2 = parseLocaleFloat(rawErrors2);
            if (!isNaN(errors2)) {
                avgErrors = (errors1 + errors2) / 2;
            }
        }

        const total = roundToTwo(base - avgErrors);
        form.setFieldsValue({ total: total.toFixed(2) });
    };


    const handleScoreSave = async () => {
        const values = form.getFieldsValue();
        const base = parseLocaleFloat(values.base);
        const errors1 = parseLocaleFloat(values.errors);
        const rawErrors2 = values.errors2;

        let errors2 = null;
        if (rawErrors2 !== undefined && rawErrors2 !== null && rawErrors2 !== '') {
            errors2 = parseLocaleFloat(rawErrors2);
        }

        const avgErrors = (errors2 !== null && !isNaN(errors2))
            ? (errors1 + errors2) / 2
            : errors1;


        const updatedScore = {
            base: roundToTwo(base),
            errors: roundToTwo(errors1),
            ...(errors2 !== null ? { errors2: roundToTwo(errors2) } : {}),
            total: roundToTwo(base - avgErrors),
        };

        try {
            await fetch(`http://localhost:5000/api/participants/${selectedParticipant._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scoreKey, score: updatedScore })
            });
            refreshResults();
        } catch (error) {
            console.error('Błąd zapisu:', error);
        }

        pushScore({
            _id: selectedParticipant._id,
            name: selectedParticipant.name,
            category: selectedParticipant.category,
            team: selectedParticipant.team,
            group: selectedParticipant.group,
            judge: user?.username,
            scoreKey,
            score: updatedScore
        });

        endEvaluation(selectedParticipant._id);
        setIsModalOpen(false);
        setSelectedParticipant(null);
    };

    const columns = [
        {
            title: 'Kategoria',
            dataIndex: 'category',
            key: 'name',
            align: 'center',
            render: (_, record) => `${record.category ?? ''} `,
        },
        {
            title: 'Imię i nazwisko',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            render: (_, record) => `${record.name ?? '–'}`,
        },
    ];

    if (scoreKey) {
        columns.push(
            {
                title: 'Trudność',
                dataIndex: scoreKey,
                key: `${scoreKey}_base`,
                align: 'center',
                render: (obj) => (obj && typeof obj.base === 'number' ? obj.base : '–'),
            },
            {
                title: 'Błędy',
                dataIndex: scoreKey,
                key: `${scoreKey}_errors`,
                align: 'center',
                render: (obj) => (obj && typeof obj.errors === 'number' ? obj.errors.toFixed(2) : '–'),
            },
            {
                title: 'Błędy 2',
                dataIndex: scoreKey,
                key: `${scoreKey}_errors2`,
                align: 'center',
                render: (obj) => {
                    return (obj && Object.prototype.hasOwnProperty.call(obj, 'errors2')) && obj.errors2 !== undefined ? obj.errors2.toFixed(2) : '–';
                },
            },
            {
                title: 'Ocena końcowa',
                dataIndex: scoreKey,
                key: `${scoreKey}_total`,
                align: 'center',
                render: (obj) => (obj && typeof obj.total === 'number' ? obj.total.toFixed(2) : '–'),
            }
        );
    }

    const dataSource = filteredParticipants().map((p, index) => ({
        ...p,
        key: p._id || index,
    }));

    return (
        <div style={{ textAlign: 'center', padding: 30 }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: 40 }}>
                Sędziowanie według zastępów
            </Title>

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
                            setSelectedTeam('');
                        }}
                        style={{ margin: '0 5px' }}
                    >
                        {group}
                    </Button>
                ))}
            </div>

            {selectedGroup && (
                <div style={{ marginBottom: 40 }}>
                    <div style={{ marginBottom: 10 }}>
                        <label><strong>Wybierz zastęp:</strong></label>
                    </div>
                    {teamsInSelectedGroup().sort().map(team => (
                        <Button
                            key={team}
                            type={selectedTeam === team ? 'primary' : 'default'}
                            onClick={() => setSelectedTeam(team)}
                            style={{ margin: '0 5px' }}
                        >
                            {team}
                        </Button>
                    ))}
                </div>
            )}

            {selectedGroup && selectedTeam && (
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        rowKey="key"
                        pagination={false}
                        bordered
                        onRow={(record) => ({
                            onClick: () => openScoreModal(record),
                            style: { cursor: 'pointer' }
                        })}
                    />
                </div>
            )}

            <Modal
                title={`Ocena zawodnika: ${selectedParticipant?.name}`}
                open={isModalOpen}
                onOk={handleScoreSave}
                onCancel={() => {
                    if (selectedParticipant) endEvaluation(selectedParticipant._id);
                    setIsModalOpen(false);
                }}
                okText="Zapisz"
                cancelText="Anuluj"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={handleValueChange}
                >
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>
                        {selectedParticipant?.name}
                    </div>
                    <Form.Item label="Trudność (D)" name="base" rules={[{ required: true }]}>
                        <Input style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Błędy (E)" name="errors" rules={[{ required: true }]}>
                        <Input style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Błędy 2 (opcjonalne)" name="errors2">
                        <Input style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Ocena końcowa" name="total">
                        <Input disabled style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ResultsByTeamPage;
