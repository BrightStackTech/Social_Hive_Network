export function LeaveScreen({ setIsMeetingLeft }) {
  return (
    <div className="h-screen flex flex-col flex-1 items-center justify-center" style={{width:"1200px"}}>
      <h1 className="text-4xl">You left the Session!</h1>
      <div className="mt-12">
        <button
          style={{backgroundColor:"rgba(85,104,254,255)"}}
          className="`w-full text-white px-16 py-3 rounded-lg text-sm"
          onClick={() => {
            setIsMeetingLeft(false);
          }}
        >
          Rejoin the Session
        </button>
      </div>
    </div>
  );
}
