import React from 'react';
import StyledCard from './Card.styled';

export type CardProps = {
    title: string;
    subtitle: string;
    description: string;
    color?: string;
} & Omit<React.ComponentProps<'div'>, 'ref' | 'color'>;

const Card: React.FC<CardProps> = ({
    title,
    subtitle,
    description,
    color = '#424242',
    ...rest
}) => {
    return (
        <StyledCard color={color} {...rest}>
            <div className="card__innerbox">
                <div className="card__img"></div>
                <div className="card__textbox">
                    <div className="card__title">{title}</div>
                    <div className="card__subtitle">{subtitle}</div>
                    <div className="card__bar"></div>
                    <div className="card__description">{description}</div>
                </div>
            </div>
        </StyledCard>
    );
};

export default Card;
