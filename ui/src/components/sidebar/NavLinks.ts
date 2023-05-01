import styled from 'styled-components';

const NavLinks = styled.div`
    .navGroup__title {
        color: #bbb;
        margin: 16px 0 0 0;
        font-size: 0.75rem;
        text-transform: uppercase;
    }

    .navGroup__link {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        padding: 16px 12px;
        margin: 8px 0;
        border-radius: 4px;
        transition: 150ms ease-in;

        span {
            text-transform: capitalize;
        }

        &:hover {
            background: rgba(255, 255, 255, 0.1);
            text-decoration: none;
        }

        &.active > span,
        &:hover > span {
            color: ${(props) => props.theme.color.R5};
        }

        &.active > svg,
        &:hover > svg {
            fill: ${(props) => props.theme.color.R5};
            stroke: ${(props) => props.theme.color.R5};
        }
    }
`;

export default NavLinks;
