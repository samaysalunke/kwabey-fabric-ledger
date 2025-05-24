import React from 'react';
import Layout from '../components/layout/Layout';
import InwardForm from '../components/modules/inward/InwardForm';

const InwardModule: React.FC = () => (
  <Layout>
    <h2>Fabric Inward Entry</h2>
    <InwardForm />
    {/* Optionally, add a list of recent entries here */}
  </Layout>
);

export default InwardModule;
