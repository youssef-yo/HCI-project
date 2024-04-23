import { MdOutlineAssignment, MdOutlineHome } from 'react-icons/md';
import { NavLink, Outlet, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { Sidebar, Topbar, WithSidebar, WithTopbar } from '../components/common';
import { NavLinks } from '../components/sidebar';
import { HomeSummary, TaskPage, TasksPage } from './home';

const HomePage = () => {
    const topbarHeight = '68px';
    const sidebarWidth = '300px';
    const color = "white";

    const iconStyle = { fill: {color},
                    fontSize: "1.4rem"}

    return (
        <WithSidebar width={sidebarWidth}>
            <Sidebar width={sidebarWidth}>

                <NavLinks>
                    <p className="navGroup__title">ONTO-PAWLS</p>
                    <ColoredLine color={color} />
                    <div>
                        <NavLink className="navGroup__link" to={''} end>
                            <MdOutlineHome style={iconStyle}/>
                            <span>Dashboard</span>
                        </NavLink>
                    </div>
                    <ColoredLine color="white" />
                    <div>
                        <NavLink className="navGroup__link" to={'tasks'} end>
                            <MdOutlineAssignment />
                            <span>Assigned Tasks</span>
                        </NavLink>
                    </div>
                    <ColoredLine color="white" />
                </NavLinks>
            </Sidebar>

            <WithTopbar height={topbarHeight}>
                <Topbar height={topbarHeight} leftOffset={sidebarWidth} />
                <HomeContainer>
                    <Routes>
                        <Route path="/" element={<Outlet />}>
                            <Route path="/" element={<HomeSummary />} />
                            <Route path="tasks" element={<TasksPage />} />
                            <Route path="tasks/:taskId" element={<TaskPage />} />
                        </Route>
                    </Routes>
                </HomeContainer>
            </WithTopbar>
        </WithSidebar>
    );
};

export default HomePage;

const HomeContainer = styled.div(
    ({ theme }) => `
    height: 100%;
    overflow-y: auto;
    padding: ${theme.spacing.md};
    background: #FFFFFF;
`
);

const ColoredLine = ({ color }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: 3
        }}
    />
);
