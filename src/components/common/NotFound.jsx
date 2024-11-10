import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404 - Not Found"
      subTitle="Sorry, the page you are looking for does not exist."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      }
    />
  );
};
