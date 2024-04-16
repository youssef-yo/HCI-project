import styled from 'styled-components';

const NavLinks = styled.div`
    .navGroup__title {
        color: #FFFFFF;
        margin: 2px 0 0 0;
        font-size: 2.5rem;
        text-transform: uppercase;
    }

    .navGroup__link {
        color: #FFFFFF;
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
            color: #FFFFFF;
            font-size: 1.1rem;
        }

       

        &:hover {
            background: rgba(255, 255, 255, 0.1);
            text-decoration: none;
        }

        &.active > span,
        &:hover > span {
            color: #FF6B35;
        }

        &.active > svg,
        &:hover > svg {
            fill: #FF6B35;
            stroke: #FF6B35;
        }
    }
`;

export default NavLinks;
