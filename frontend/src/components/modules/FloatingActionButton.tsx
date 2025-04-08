import * as React from 'react';
import { useState } from 'react';
import { Plus, Edit } from 'lucide-react';
import { ModeToggle } from '../mode-toggle';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
  DialogTitle} from '@/components/ui/dialog'
import CreatePostModule from './Posts/CreatePostModal';
import { MdOutlineGroupAdd } from "react-icons/md";
import CreateGroupModal from './CreateGroupModal';
import { MdAmpStories } from "react-icons/md";
import CreateUpdatesModal from './CreateUpdatesModal';
import { BiSolidCategory } from "react-icons/bi";
import CreateCategoryModal from './CreateCategoryModal';

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-8 right-8 lg:right-96 2xl:right-[32rem] flex flex-col items-center space-y-4">
      {/* Option Buttons */}
      {isOpen && (
        <>
          <Dialog>
            <DialogTrigger>
            <button
              className="w-12 h-12 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
              title="Add new Update"
            >
              <MdAmpStories className="w-5 h-5" />
            </button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px] md:w-full">
              <DialogTitle>Add new Update</DialogTitle>
                <CreateUpdatesModal/>
              <DialogClose />
            </DialogContent>
          </Dialog>
        <Dialog>
          <DialogTrigger>
          <button
            className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
            title="Add Post"
          >
            <Edit className="w-5 h-5" />
          </button>
          </DialogTrigger>
          <DialogContent className="max-w-[425px] md:w-full">
            <DialogTitle>Add Post</DialogTitle>
            <CreatePostModule/>
            <DialogClose />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger>
          <button
            className="w-12 h-12 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
            title="Create Category"
          >
            <BiSolidCategory className="w-5 h-5" />
          </button>
          </DialogTrigger>
          <DialogContent className="max-w-[425px] md:w-full">
            <DialogTitle>Create a Category</DialogTitle>
            <CreateCategoryModal/>
            <DialogClose />
          </DialogContent>
        </Dialog>
        {/*Create Group */}
        <Dialog>
          <DialogTrigger>
          <button
            className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center"
            title="Create Group" 
          >
            <MdOutlineGroupAdd className="w-5 h-5" />
          </button>
          </DialogTrigger>
          <DialogContent className="max-w-[425px] md:w-full">
            <DialogTitle>Create Group</DialogTitle>
            <CreateGroupModal/>
            <DialogClose />
          </DialogContent>
        </Dialog>

        {/* Mode Toggle */}
          <ModeToggle/>
        </>
      )}

      {/* Main FAB Button */}
      <button
        className="w-16 h-16 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center justify-center"
        onClick={toggleOptions}
      >
        <Plus className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
};

export default FloatingActionButton;
