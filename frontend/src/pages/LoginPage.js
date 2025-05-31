import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Typography, message } from 'antd';

const { Title } = Typography;

const LoginPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        const { identifier, password } = values;

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                identifier,
                password
            });

            const { token, user } = response.data;

            // Zapisz token i dane użytkownika do localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            message.success('Zalogowano pomyślnie!');
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Błąd logowania';
            message.error(msg);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div style={{ width: 400 }}>
                <Title level={2} style={{ textAlign: 'center' }}>Logowanie</Title>
                <Form form={form} onFinish={handleLogin} layout="vertical">
                    <Form.Item
                        label="Email lub nazwa użytkownika"
                        name="identifier"
                        rules={[{ required: true, message: 'Proszę podać email lub nazwę użytkownika' }]}
                    >
                        <Input size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Hasło"
                        name="password"
                        rules={[{ required: true, message: 'Proszę podać hasło' }]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large">
                            Zaloguj się
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default LoginPage;
