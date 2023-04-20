import { MdOutlinePersonOutline } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLogout } from '../../hooks';
import { StyledTopbar } from './Topbar.styled';
import IconButton from './IconButton';

export type TopbarProps = {
    height: string;
    leftOffset?: string;
};

const Topbar: React.FC<TopbarProps> = ({ height, leftOffset }) => {
    const { auth } = useAuth();
    const logout = useLogout();
    const navigate = useNavigate();

    const onLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <StyledTopbar height={height} leftOffset={leftOffset}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                Welcome, {auth?.username}
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <IconButton onClick={onLogout}>
                    <MdOutlinePersonOutline />
                </IconButton>
            </div>
        </StyledTopbar>
    );
};

export default Topbar;

export { WithTopbar } from './Topbar.styled';
