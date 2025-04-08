import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ComSearchBar = ({ onChange, onSubmit }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = ["Search for communities...", "Search for community posts..."];

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    onChange(event);
  };

  return (
    <form onSubmit={onSubmit} className="relative flex-1 mx-4">
      <button
        type="submit"
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
      >
        <Search />
      </button>
      <Input
        type="search"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder={placeholders[currentPlaceholder]}
        ref={inputRef}
        className={cn(
          "w-full relative text-sm sm:text-base z-50 border-none dark:text-white bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0 pl-10 sm:pl-10 pr-20"
        )}
      />
      <button
        disabled={!searchQuery}
        type="submit"
        className="absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 
                   rounded-full disabled:bg-gray-100 bg-black dark:bg-zinc-900 
                   dark:disabled:bg-zinc-800 transition duration-200 
                   flex items-center justify-center"
      >
        <Search className="text-gray-300 h-4 w-4" />
      </button>
    </form>
  );
};

export default ComSearchBar;