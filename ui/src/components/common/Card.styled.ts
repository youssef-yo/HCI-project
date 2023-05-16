import styled, { css } from 'styled-components';

const applyColor = (color: string) => css`
    .card__bar {
        background-color: ${color};
    }

    .card__img {
        background-image: linear-gradient(-250deg, ${color}, transparent 100%);
    }
    &:nth-child(2n) .card__img {
        background-image: linear-gradient(-70deg, ${color}, transparent 100%);
    }

    &::before {
        background-image: linear-gradient(-70deg, ${color}, transparent 50%);
    }
    &:nth-child(2n)::before {
        background-image: linear-gradient(-250deg, ${color}, transparent 50%);
    }
`;

type StyledCardProps = {
    color: string;
};

const StyledCard = styled.div<StyledCardProps>`
    position: relative;
    width: 100%;
    height: 300px;
    margin-bottom: 40px;
    border-radius: 10px;
    background-color: #fff;
    border: 2px solid #ddd;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 4px 21px -12px rgba(0, 0, 0, 0.66);
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
        box-shadow: 0 34px 32px -33px rgba(0, 0, 0, 0.18);
        transform: translate(0px, -3px);
    }
    &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-image: linear-gradient(-70deg, #424242, transparent 100%);
        opacity: 0.1;
    }
    &:nth-child(2n)::before {
        background-image: linear-gradient(-250deg, #424242, transparent 100%);
    }

    .card__innerbox {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }

    .card__img {
        position: absolute;
        height: 300px;
        width: 400px;
        top: 0;
        left: 0;
    }
    &:nth-child(2n) .card__img {
        left: initial;
        right: 0;
    }

    .card__bar {
        left: -2px;
        width: 50px;
        height: 5px;
        margin: 10px 0;
        border-radius: 5px;
        background-color: #424242;
        transition: width 0.2s ease;
    }
    &:hover .card__bar {
        width: 70px;
    }

    .card__textbox {
        position: absolute;
        top: 7%;
        bottom: 7%;
        left: 430px;
        width: calc(100% - 470px);
        font-size: 1em;
    }
    &:nth-child(2n) .card__textbox {
        left: initial;
        right: 430px;
    }
    .card__textbox::before,
    .card__textbox::after {
        content: '';
        position: absolute;
        display: block;
        background: #ff0000bb;
        background: #fff;
        top: -20%;
        left: -55px;
        height: 140%;
        width: 60px;
        transform: rotate(8deg);
    }
    &:nth-child(2n) .card__textbox::before {
        display: none;
    }
    .card__textbox::after {
        display: none;
        left: initial;
        right: -55px;
    }
    &:nth-child(2n) .card__textbox::after {
        display: block;
    }
    .card__textbox * {
        position: relative;
    }

    .card__title {
        font-size: 1.5em;
        font-weight: 500;
    }

    .card__subtitle {
        font-size: 1.15em;
        font-weight: 400;
        color: #888;
    }

    .card__description {
        z-index: 10;
        font-size: 1em;
        color: #424242;
        height: 125px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    ${(props) => props.color && applyColor(props.color)}
`;

export default StyledCard;
