'use client';
import { useState } from 'react';

import ConfirmDialog from '../components/confirmDialog';

export function Dialog() {
  const [isOpen, setIsOpen] = useState(false);

  return <ConfirmDialog isOpen={isOpen} />;
}
