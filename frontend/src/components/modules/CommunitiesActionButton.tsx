import * as React from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { MdPostAdd } from 'react-icons/md';
import { TbWorldPlus } from 'react-icons/tb';
import { ModeToggle } from '../mode-toggle';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
  DialogTitle
} from '@/components/ui/dialog';
import CreateComPostModal from './CreateComPostModal';
import CreateCommunityModal from './CreateCommunityModal';

const CommunitiesActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCommunityDialogOpen, setIsCommunityDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };

  const openCommunityDialog = () => {
    setIsCommunityDialogOpen(true);
  };

  const closeCommunityDialog = () => {
    setIsCommunityDialogOpen(false);
  };

  const openPostDialog = () => {
    setIsPostDialogOpen(true);
  };

  const closePostDialog = () => {
    setIsPostDialogOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 lg:right-96 2xl:right-[32rem] flex flex-col items-center space-y-4">
      {/* Option Buttons */}
      {isOpen && (
        <>
          <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
                title="Add a Community Post"
                onClick={openPostDialog}
              >
                <MdPostAdd className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px] md:w-full">
              <DialogTitle>Add a Community Post</DialogTitle>
              <CreateComPostModal onClose={closePostDialog} />
              <DialogClose />
            </DialogContent>
          </Dialog>
          <Dialog open={isCommunityDialogOpen} onOpenChange={setIsCommunityDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center"
                title="Create Community"
                onClick={openCommunityDialog}
              >
                <TbWorldPlus className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px] md:w-full">
              <DialogTitle>Create Community</DialogTitle>
              <CreateCommunityModal onClose={closeCommunityDialog} />
              <DialogClose />
            </DialogContent>
          </Dialog>
          <ModeToggle />
        </>
      )}

      {/* Main FAB Button */}
      <button
        className="w-16 h-16 text-black rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 flex items-center justify-center"
        style={{ backgroundColor: "orange" }}
        onClick={toggleOptions}
      >
        <Plus className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
};

export default CommunitiesActionButton;