import { Button } from "@/components/ui/button"
function GroupAnnouncements() {
  return (
    <div>
      <div className="add-announcement m-5">
          <input
            type="text"
            placeholder="Add Announcement title"
            className="w-full p-2 border dark:bg-gray-900 border-gray-300 rounded-md"
          />

          <textarea
            placeholder="Add Announcement description"
            className="w-full p-2 border dark:bg-gray-900 border-gray-300 rounded-md mt-2"
            rows={4}
          ></textarea>


          <Button variant={"outline"} className="mt-2">
            Post
          </Button>
        
        </div>
        <div className="posts-section">
          <h2 className="text-2xl text-center my-4">Recent Announcements</h2>
          <div className="announcement-list">
            <div className="bg-muted p-4 m-2">
              <h3 className="text-xl my-1 font-bold">Announcement Title</h3>
              <p className="text-gray-600 dark:text-gray-400">Announcement description goes here...</p>
              <span className="text-gray-500 my-1 dark:text-gray-300">Posted by: Author Name</span>
            </div>
            <div className="bg-muted p-4 m-2">
              <h3 className="text-xl my-1 font-bold">Announcement Title</h3>
              <p className="text-gray-600 dark:text-gray-400">Announcement description goes here...</p>
              <span className="text-gray-500 my-1 dark:text-gray-300">Posted by: Author Name</span>
            </div>
            <div className="bg-muted p-4 m-2">
              <h3 className="text-xl my-1 font-bold">Announcement Title</h3>
              <p className="text-gray-600 dark:text-gray-400">Announcement description goes here...</p>
              <span className="text-gray-500 my-1 dark:text-gray-300">Posted by: Author Name</span>
            </div>
            <div className="bg-muted p-4 m-2">
              <h3 className="text-xl my-1 font-bold">Announcement Title</h3>
              <p className="text-gray-600 dark:text-gray-400">Announcement description goes here...</p>
              <span className="text-gray-500 my-1 dark:text-gray-300">Posted by: Author Name</span>
            </div>
            <div className="bg-muted p-4 m-2">
              <h3 className="text-xl my-1 font-bold">Announcement Title</h3>
              <p className="text-gray-600 dark:text-gray-400">Announcement description goes here...</p>
              <span className="text-gray-500 my-1 dark:text-gray-300">Posted by: Author Name</span>
            </div>
            <div className="bg-muted p-4 m-2">
              <h3 className="text-xl my-1 font-bold">Announcement Title</h3>
              <p className="text-gray-600 dark:text-gray-400">Announcement description goes here...</p>
              <span className="text-gray-500 my-1 dark:text-gray-300">Posted by: Author Name</span>
            </div>
            
          </div>
        </div>
    </div>
  )
}

export default GroupAnnouncements
