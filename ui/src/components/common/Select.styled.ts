import styled from 'styled-components';

const StyledSelect = styled.div`
    position: relative;
    border: 1px solid #ccc;
    border-radius: 4px;

    background-color: #dfdfdf;
    color: #333;

    font-size: 1em;
    font-weight: 400;
    line-height: 1.75;
    letter-spacing: 0.01em;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;

    .select-input {
        padding: 6px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
    }

    .select-menu {
        position: absolute;
        transform: translateY(4px);
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 4px;
        overflow: auto;
        max-height: 220px;
        background-color: #fff;
        z-index: 99;
    }

    .select-item {
        padding: 4px 12px;
        cursor: pointer;
    }

    .select-item:hover {
        background-color: #9fc3f870;
    }

    .select-item.selected {
        background-color: #0d6efd;
        color: #fff;
    }

    .select-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .select-tag-item {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        max-width: 100%;
        padding: 4px 12px;
        border-radius: 16px;

        font-size: 0.8em;
        text-overflow: ellipsis;
        white-space: nowrap;
        background-color: ${(props) => props.theme.color.R3};
    }

    .select-tag-close {
        display: flex;
        align-items: center;
    }

    .search-box {
        padding: 4px;
        background-color: #eee;
    }

    .search-box input {
        width: 100%;
        box-sizing: border-box;
        padding: 4px 12px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
`;

export default StyledSelect;
