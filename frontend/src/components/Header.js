import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Header } = Layout;

const AppHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const selectedKey = () => {
        if (location.pathname === '/') return 'dashboard';
        if (location.pathname.startsWith('/results')) return 'results';
        if (location.pathname.startsWith('/login')) return 'login';
        if (location.pathname.startsWith('/register')) return 'register';
        if (location.pathname.startsWith('/judge')) return 'judge';
        return '';
    };

    const menuItems = [
        {
            key: 'dashboard',
            label: <Link to="/">Dashboard</Link>
        },
        {
            key: 'results',
            label: <Link to="/results">Wyniki</Link>
        },
        ...(token
            ? [
                {
                    key: 'judge',
                    label: <Link to="/judge">Sędziowanie</Link>,


                },
                {
                    key: 'user',
                    label: `👤 ${user?.username} ${user?.role}`,
                    disabled: true,
                    style: { marginLeft: 'auto', cursor: 'default' }
                },

                ...(user?.role === 'ADMIN' ? [
                    {
                        key: 'register',
                        label: <Link to="/register">Dodaj Sędziego</Link>
                    }
                ] : []),
                {
                    key: 'logout',
                    label: 'Wyloguj',
                    onClick: handleLogout
                }
            ]
            : [
                {
                    key: 'login',
                    label: <Link to="/login">Zaloguj się</Link>,
                    style: { marginLeft: 'auto' }
                }
            ])
    ];

    return (
        <Header style={{ background: '#fff', padding: 0 }}>
            <Menu
                mode="horizontal"
                selectedKeys={[selectedKey()]}
                items={menuItems}
                style={{ lineHeight: '64px' }}
            />
        </Header>
    );
};

export default AppHeader;
