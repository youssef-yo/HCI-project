import { MdOutlineAssignment, MdOutlineDashboard } from 'react-icons/md';
import { NavLink, Outlet, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { Sidebar, Topbar, WithSidebar, WithTopbar } from '../components/common';
import { Logo, NavLinks } from '../components/sidebar';
import { HomeSummary, TaskPage, TasksPage } from './home';

const HomePage = () => {
    const topbarHeight = '68px';
    const sidebarWidth = '300px';

    return (
        <WithSidebar width={sidebarWidth}>
            <Sidebar width={sidebarWidth}>
                <Logo />

                <NavLinks>
                    <div>
                        <p className="navGroup__title">Home Page</p>
                        <NavLink className="navGroup__link" to={''} end>
                            <MdOutlineDashboard />
                            <span>Home Page</span>
                        </NavLink>
                    </div>
                    <div>
                        <p className="navGroup__title">Tasks</p>
                        <NavLink className="navGroup__link" to={'tasks'} end>
                            <MdOutlineAssignment />
                            <span>Assigned Tasks</span>
                        </NavLink>
                    </div>
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
    background: ${theme.color.N4};
`
);
