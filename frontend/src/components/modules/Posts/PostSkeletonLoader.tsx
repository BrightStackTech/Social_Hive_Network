
function PostSkeletonLoader() {
  return (
    <div>
      <div className="postcard m-10 mt-3 animate-pulse">
  <div className="flex header items-center gap-2">
    <div className="flex gap-2 items-center">
      <div>
        {/* Skeleton for profile picture */}
        <div className="w-10 h-10 rounded-full bg-muted"></div>
      </div>
      <div className="flex-col">
        {/* Skeleton for username */}
        <div className="w-24 h-4 bg-muted rounded-md mb-1"></div>
        {/* Skeleton for post creation time */}
        <div className="w-16 h-4 bg-muted rounded-md"></div>
      </div>
    </div>
    <div className="ml-auto pr-10">
      {/* Skeleton for follow button */}
      <div className="w-16 h-6 bg-muted rounded-md"></div>
    </div>
  </div>

  <div className="w-3/4 h-[2px] mx-auto m-4 bg-muted"></div>

  {/* Skeleton for post title */}
  <div className="w-1/2 h-6 bg-muted rounded-md m-1"></div>

  {/* Skeleton for post content */}
  <div className="w-full h-20 bg-muted rounded-md mt-2 mb-4"></div>

  <div className="w-full h-[2px] bg-muted mb-2"></div>

  <div className="flex items-center justify-around gap-2 m-3">
    {/* Skeleton for Like */}
    <div className="flex p-2 items-center gap-3">
      <div className="w-5 h-5 bg-muted rounded-md"></div>
      <div className="w-8 h-4 bg-muted rounded-md"></div>
    </div>

    {/* Skeleton for Comment */}
    <div className="flex p-2 items-center gap-3">
      <div className="w-5 h-5 bg-muted rounded-md"></div>
      <div className="w-8 h-4 bg-muted rounded-md"></div>
    </div>

    {/* Skeleton for Repost */}
    <div className="flex p-2 items-center gap-3">
      <div className="w-5 h-5 bg-muted rounded-md"></div>
      <div className="w-8 h-4 bg-muted rounded-md"></div>
    </div>
  </div>

  <div className="w-full h-[2px] bg-muted"></div>
</div>

    </div>
  )
}

export default PostSkeletonLoader
