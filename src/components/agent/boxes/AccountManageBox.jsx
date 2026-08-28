import React from 'react';
import { Key } from 'lucide-react';
import AccountListBox from './AccountListBox';
import AccountEditBox from './AccountEditBox';

export default function AccountManageBox({
  credentials = [],
  onDeleteCredential,
  onAddCredential,
  onRefresh,
  loading = false
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
      gap: '20px'
    }}>
      <AccountListBox
        credentials={credentials}
        onDeleteCredential={onDeleteCredential}
        onRefresh={onRefresh}
        loading={loading}
      />
      <AccountEditBox
        onAddCredential={onAddCredential}
        loading={loading}
      />
    </div>
  );
}
