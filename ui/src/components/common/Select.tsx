import { MdClose, MdExpandLess, MdExpandMore } from 'react-icons/md';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import StyledSelect from './Select.styled';

export interface Option<T> {
    value: T;
    label: string;
}

type BaseSelectProps<T> = {
    placeHolder: string;
    options: Option<T>[];
    isSearchable?: boolean;
} & Omit<React.ComponentProps<'div'>, 'ref' | 'onChange'>;

type SelectProps<T> = BaseSelectProps<T> & {
    value?: Option<T>;
    onChange?: (value: Option<T>) => void;
};

const Select = <T,>({
    placeHolder,
    options,
    isSearchable = false,
    value,
    onChange = (_) => {},
    ...rest
}: SelectProps<T>) => {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const searchRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSearchValue('');
        if (showMenu && searchRef.current) {
            searchRef.current.focus();
        }
    }, [showMenu]);

    useEffect(() => {
        const handler = (e: Event) => {
            if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };

        window.addEventListener('click', handler);
        return () => {
            window.removeEventListener('click', handler);
        };
    });

    const getDisplay = () => {
        if (!value) {
            return placeHolder;
        }
        return value.label;
    };

    const onItemClick = (option: Option<T>) => {
        onChange(option);
    };

    const isSelected = (option: Option<T>) => {
        if (!value) {
            return false;
        }
        return value.value === option.value;
    };

    const getOptions = () => {
        if (!searchValue) {
            return options;
        }
        return options.filter(
            (option) => option.label.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0
        );
    };

    return (
        <StyledSelect {...rest}>
            <div className="select-input" ref={inputRef} onClick={() => setShowMenu(!showMenu)}>
                <div className="select-selected-value">{getDisplay()}</div>
                <div className="select-tools">
                    <div className="select-tool">
                        {showMenu ? <MdExpandLess /> : <MdExpandMore />}
                    </div>
                </div>
            </div>
            {showMenu && (
                <div className="select-menu">
                    {isSearchable && (
                        <div className="search-box">
                            <input
                                ref={searchRef}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                    )}
                    {getOptions().map((option, index) => (
                        <div
                            key={index}
                            className={`select-item ${isSelected(option) && 'selected'}`}
                            onClick={() => onItemClick(option)}>
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </StyledSelect>
    );
};

export default Select;

type MultiSelectProps<T> = BaseSelectProps<T> & {
    value: Option<T>[];
    onChange?: (value: Option<T>[]) => void;
};

export const MultiSelect = <T,>({
    placeHolder,
    options,
    isSearchable = false,
    value,
    onChange = (_) => {},
    ...rest
}: MultiSelectProps<T>) => {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');

    const searchRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };

        window.addEventListener('click', handler);
        return () => {
            window.removeEventListener('click', handler);
        };
    });

    useEffect(() => {
        setSearchValue('');
        if (showMenu && searchRef.current) {
            searchRef.current.focus();
        }
    }, [showMenu]);

    const getDisplay = () => {
        if (!value || value.length === 0) {
            return placeHolder;
        }
        return (
            <div className="select-tags">
                {value.map((option, index) => (
                    <div key={index} className="select-tag-item">
                        {option.label}
                        <span className="select-tag-close" onClick={(e) => onTagRemove(e, option)}>
                            <MdClose />
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const removeOption = (option: Option<T>) => {
        return value.filter((o) => o.value !== option.value);
    };

    const onTagRemove = (e: MouseEvent, option: Option<T>) => {
        e.stopPropagation();
        const newValue = removeOption(option);
        onChange(newValue);
    };

    const onItemClick = (option: Option<T>) => {
        let newValue;
        if (value.findIndex((o) => o.value === option.value) >= 0) {
            newValue = removeOption(option);
        } else {
            newValue = [...value, option];
        }

        onChange(newValue);
    };

    const isSelected = (option: Option<T>) => {
        return value.filter((o) => o.value === option.value).length > 0;
    };

    const getOptions = () => {
        if (!searchValue) {
            return options;
        }
        return options.filter(
            (option) => option.label.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0
        );
    };

    return (
        <StyledSelect {...rest}>
            <div className="select-input" ref={inputRef} onClick={() => setShowMenu(!showMenu)}>
                <div className="select-selected-value">{getDisplay()}</div>
                <div className="select-tools">
                    <div className="select-tool">
                        {showMenu ? <MdExpandLess /> : <MdExpandMore />}
                    </div>
                </div>
            </div>
            {showMenu && (
                <div className="select-menu">
                    {isSearchable && (
                        <div className="search-box">
                            <input
                                ref={searchRef}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                    )}
                    {getOptions().map((option, index) => (
                        <div
                            key={index}
                            className={`select-item ${isSelected(option) && 'selected'}`}
                            onClick={() => onItemClick(option)}>
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </StyledSelect>
    );
};
