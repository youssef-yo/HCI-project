import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StyledTopbar } from './Topbar.styled';
import '../../assets/styles/TopBar.scss';
import { useDocumentApi, useTaskApi, useUserApi } from '../../api';
import AccountInfoPopover from '../dashboard/AccountInfoPopover';

export type TopbarProps = {
    height: string;
    leftOffset?: string;
};

const Topbar: React.FC<TopbarProps> = ({ height, leftOffset }) => {
    const [accountInfoPopoverShow, setAccountInfoPopoverShow] = useState<boolean>(false);

    const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

    const { getDocumentByID } = useDocumentApi();
    const { getTaskByID } = useTaskApi();
    const { getUserByID } = useUserApi();

    const location = useLocation();

    const handleAccountInfoModalClose = () => {
        console.log('Closing account info modal');
        setAccountInfoPopoverShow(false);
    };

    const formatSegment = async (pathSegments: string[]) => {
        const formattedSegments = [];
        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            if (segment.match(/^[0-9a-fA-F]{24}$/)) {
                const type  = pathSegments[i-1];
                try {
                    let response = null;
                    console.log(type);
                    if (type === 'docs'){
                        response = await getDocumentByID(segment);
                        formattedSegments.push(response.name || 'Untitled Document');
                        continue;
                    } else if (type === 'tasks') {
                        response = await getTaskByID(segment);
                        formattedSegments.push(response.description || 'Untitled Task');
                        continue;
                    } else if (type === 'users') {
                        response = await getUserByID(segment); 
                        formattedSegments.push(response.fullName || 'Untitled User');
                        continue;
                    }
                } catch (error) {
                    console.error('Error fetching document name:', error);
                }
            }
            formattedSegments.push(segment);
        }
        return formattedSegments;
    };
    

    useEffect(() => {
        const updateBreadcrumb = async () => {
            const pathname = location.pathname;
            const pathSegments = pathname.split('/').filter(segment => segment !== '');
            const formattedSegments = await formatSegment(pathSegments);
            setBreadcrumb(formattedSegments);
        };

        updateBreadcrumb();
    }, [location.pathname]);

    return (
        <StyledTopbar height={height} leftOffset={leftOffset}>
            {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                Welcome, {auth?.username}
            </div> */}
            <div className="breadcrumb-container">
                {breadcrumb.map((crumb, index) => (
                    <React.Fragment key={index}>
                        <Link to={`/${breadcrumb.slice(0, index + 1).join('/')}`} className="breadcrumb-link">{crumb}</Link>
                        {index < breadcrumb.length - 1 && <span className="breadcrumb-separator"> {'>'} </span>}
                    </React.Fragment>
                ))}
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <AccountInfoPopover
                    show={accountInfoPopoverShow}
                    onHide={handleAccountInfoModalClose}
                    setAccountInfoPopoverShow={setAccountInfoPopoverShow}
                    iconColor="white"
                />
            </div>
        </StyledTopbar>
    );
};

export default Topbar;

export { WithTopbar } from './Topbar.styled';
