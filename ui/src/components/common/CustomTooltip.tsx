// CustomTooltip.js
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import '../../assets/styles/Tooltip.scss';

const CustomTooltip = ({ placement, tooltipText, children }) => {
  return (
    <OverlayTrigger
      placement={placement}
      overlay={<Tooltip id="tooltip" className="custom-tooltip">{tooltipText}</Tooltip>}
    >
      {children}
    </OverlayTrigger>
  );
};

export default CustomTooltip;
