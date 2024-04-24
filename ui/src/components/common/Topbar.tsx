import React, { useEffect, useState } from 'react';
import { MdLogout } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useLogout } from '../../hooks';
import { StyledTopbar } from './Topbar.styled';
import IconButton from './IconButton';
import '../../assets/styles/TopBar.scss';
import { useDocumentApi, useTaskApi } from '../../api';

export type TopbarProps = {
    height: string;
    leftOffset?: string;
};

const Topbar: React.FC<TopbarProps> = ({ height, leftOffset }) => {
    // const { auth } = useAuth();
    const logout = useLogout();
    const navigate = useNavigate();

    const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

    const { getDocumentByID } = useDocumentApi();
    const { getTaskByID } = useTaskApi();
    const onLogout = async () => {
        await logout();
        navigate('/login');
    };

    // useEffect(() => {
    //     const pathname = location.pathname;
    //     const pathSegments = pathname.split('/').filter(segment => segment !== '');
    //     setBreadcrumb(pathSegments);
    // }, [location.pathname]);

    const formatSegment = async (pathSegments: string[]) => {
        const formattedSegments = [];
        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            if (segment.match(/^[0-9a-fA-F]{24}$/)) {
                const type  = pathSegments[i-1];
                try {
                    var response = null;
                    if (type === 'docs'){
                        response = await getDocumentByID(segment);
                        formattedSegments.push(response.name || 'Untitled Document');
                        continue;
                    } else if (type === 'tasks') {
                        response = await getTaskByID(segment);
                        formattedSegments.push(response.description || 'Untitled Task');
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
            console.log(pathname);
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
                        {index < breadcrumb.length - 1 && <span className="breadcrumb-separator"> / </span>}
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
                <IconButton title="Logout" onClick={onLogout}>
                    <MdLogout />
                </IconButton>
            </div>
        </StyledTopbar>
    );
};

export default Topbar;

export { WithTopbar } from './Topbar.styled';
