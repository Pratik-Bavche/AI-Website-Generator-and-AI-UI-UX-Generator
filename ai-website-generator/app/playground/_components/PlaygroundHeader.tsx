import { Button } from '@/components/ui/button';
import { OnSaveContext } from '@/context/OnSaveContext';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import React, { useContext } from 'react';

const PlaygroundHeader = () => {
  const { onSaveData, setOnsaveData } = useContext(OnSaveContext);
  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Logo and Title */}
      <div className="flex gap-2 items-center">
        <Image
          src="/logo.svg"
          alt="PromptUX Logo"
          width={35}
          height={35}
          style={{ width: 'auto', height: 'auto' }}
          priority
        />
        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100">
          PromptUX
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 items-center">
        {/* Back to Workspace Button */}
        <Link href="/">
          <Button
            variant="outline"
            className="flex items-center gap-2 cursor-pointer border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LayoutDashboard size={18} /> Dashboard
          </Button>
        </Link>

        {/* Styled Save Button */}
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer shadow hover:shadow-md"
          onClick={() => setOnsaveData(Date.now())}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default PlaygroundHeader;
