import { Search } from 'lucide-react'
import { Input } from '../ui/input'
const SearchBar = () => {
  return (
    <div>
      <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[350px] lg:w-[200px] xl:w-[300px]"
            />
          </div>
    </div>
  )
}

export default SearchBar
