import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const ManageRequests = ({ communityName }: { communityName: string }) => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(true);
  interface Request {
    _id: string;
    username: string;
    profilePicture: string;
    bio: string;
  }
  
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/communities/${communityName}/pending-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPendingRequests(response.data.data);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    fetchPendingRequests();
  }, [token, communityName]);

  const handleMouseEnter = () => setIsHovered(false);
  const handleMouseLeave = () => setIsHovered(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  interface HandleRequestActionParams {
    userId: string;
    action: 'approve' | 'reject';
  }

  const handleRequestAction = async (_id: string, { userId, action }: HandleRequestActionParams): Promise<void> => {
    try {
      await axios.post(`${import.meta.env.VITE_SERVER_URI}/communities/${communityName}/handle-join-request/${userId}/${action}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPendingRequests(prev => prev.filter(request => request._id !== userId));
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  const handleApproveClick = (request: Request) => {
    setSelectedRequest(request);
    setConfirmDialogOpen(true);
  };

  return (
    <div className="relative">
      <Button
        variant={isHovered ? 'default' : 'outline'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClickOpen}
      >
        Manage Requests
        {pendingRequests?.length > 0 && (
          <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Manage Requests</DialogTitle>
          <DialogClose onClick={handleClose} />
          <div>
            {pendingRequests?.length === 0 ? (
              <p>No pending requests</p>
            ) : (
              pendingRequests?.map(request => (
                <div key={request._id} className="flex items-center justify-between cursor-pointer hover:bg-muted p-2 gap-2">
                  <div className="flex items-center gap-2">
                    <img src={request.profilePicture} className="w-10 h-10 rounded-full" alt="" />
                    <div className="flex flex-col">
                      <div className="font-bold">{request.username}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{request.bio}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 text-xs cursor-pointer" onClick={() => handleApproveClick(request)}>Approve</span>
                    <span className="text-red-500 text-xs cursor-pointer" onClick={() => handleRequestAction(request._id, { userId: request._id, action: 'reject' })}>Reject</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      {selectedRequest && (
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <div className="text-center text-lg">
              Are you sure you want to accept {selectedRequest.username} back to {communityName} community?
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
              <Button variant="default" className="bg-green-500 text-white hover:bg-green-700" onClick={() => handleRequestAction(selectedRequest._id, { userId: selectedRequest._id, action: 'approve' })}>
                Accept {selectedRequest.username}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageRequests;
