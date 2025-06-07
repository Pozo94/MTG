import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Typography, message, Select } from 'antd';

const { Title } = Typography;

const RegisterPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleRegister = async (values) => {
        console.log('Dane do rejestracji:', values);
        const { username, email, password,role } = values;

        try {
            const response = await axios.post(process.env.REACT_APP_API_URL+'/api/auth/register', {
                username,
                email,
                password,
                role
            });

            console.log('Sukces:', response.data);
            message.success('Rejestracja zakończona sukcesem!');
            navigate('/login');
        } catch (err) {
            console.error('Błąd rejestracji:', err.response);
            const msg = err.response?.data?.message || 'Błąd rejestracji';
            message.error(msg);
        }
    };


    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div style={{ width: 400 }}>
                <Title level={2} style={{ textAlign: 'center' }}>Rejestracja</Title>
                <Form form={form} onFinish={handleRegister} layout="vertical">
                    <Form.Item
                        label="Nazwa użytkownika"
                        name="username"
                        rules={[{ required: true, message: 'Proszę podać nazwę użytkownika' }]}
                    >
                        <Input size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Proszę podać email' },
                            { type: 'email', message: 'Nieprawidłowy email' }
                        ]}
                    >
                        <Input size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Hasło"
                        name="password"
                        rules={[
                            { required: true, message: 'Proszę podać hasło' },
                            { min: 6, message: 'Hasło musi mieć minimum 6 znaków' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Potwierdź hasło"
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Proszę potwierdzić hasło' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Hasła się nie zgadzają!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Rola"
                        name="role"
                        rules={[{ required: true, message: 'Proszę wybrać rolę' }]}
                    >
                        <Select size="large" placeholder="Wybierz rolę">
                            <Select.Option value="FX">FX</Select.Option>
                            <Select.Option value="VT">VT</Select.Option>
                            <Select.Option value="AD">AD</Select.Option>
                            <Select.Option value="SR">SR</Select.Option>
                            <Select.Option value="ADMIN">ADMIN</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large">
                            Zarejestruj się
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default RegisterPage;
