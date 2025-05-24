import React from 'react';
import Layout from '../components/layout/Layout';
import ApprovalList from '../components/modules/approval/ApprovalList';

const ApprovalModule: React.FC = () => (
  <Layout>
    <h2>Quantity Approval</h2>
    <ApprovalList />
  </Layout>
);

export default ApprovalModule;
