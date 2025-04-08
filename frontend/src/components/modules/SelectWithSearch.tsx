import { useState } from 'react';

const SelectWithSearch = ({ options, setValue, id, initialValue, text }:any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);

    const filteredOptions = options.filter((option:any) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option:any) => {
        setSelectedOption(option);
        setValue(option);
        setIsOpen(false);
    };

    return (
        <div className="relative mt-1">
            {/* Selected Option (Dropdown Button) */}
            {text? <div className='font-bold mb-2 mx'>{text}</div> : null}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                id={id}
                className="w-full bg-white border border-gray-300 dark:bg-black rounded-lg p-2 flex justify-between items-center"
            >
                {initialValue || selectedOption || 'Select an option'}
                <span className="ml-2">&#9662;</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="z-auto mt-1 w-full bg-white dark:bg-black border border-gray-300 rounded-lg shadow-lg">
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border-b border-gray-300 dark:bg-black focus:outline-none"
                    />

                    {/* Option List */}
                    <ul className="max-h-56 overflow-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option:any, index:any) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelect(option)}
                                    className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-muted"
                                >
                                    {option}
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-gray-500">No options found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SelectWithSearch;
