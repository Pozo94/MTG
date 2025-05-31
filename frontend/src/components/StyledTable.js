import React from 'react';
import styled from 'styled-components';
import { Table } from 'antd';


export const StyledTable = styled((props) => <Table {...props} />)`
  && tbody > tr:hover > td {
    background: rgba(224, 248, 232, 1);
  }
`;




