import {
    MdOutlineAssignment,
    MdOutlineHome,
    MdOutlineDescription,
    MdOutlineGroup,
    MdOutlineHub,
} from 'react-icons/md';
import { NavLink, Outlet, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { Sidebar, Topbar, WithSidebar, WithTopbar } from '../components/common';
import { NavLinks } from '../components/sidebar';
import {
    DashSummaryPage,
    DocumentsPage,
    TasksPage,
    UsersPage,
    UserPage,
    UserCreatePage,
    OntologiesPage,
    TaskPage,
    DocumentPage,
    TaskCreatePage,
} from './dashboard';

const DashPage = () => {
    const topbarHeight = '68px';
    const sidebarWidth = '300px';
    const color = "white";
    
    const iconStyle = { fill: {color},
                    fontSize: "1.4rem"}

    

    return (
        <WithSidebar width={sidebarWidth}>
            <Sidebar width={sidebarWidth}>
                {/* <Logo /> */}
                
                <NavLinks>
                    <p className="navGroup__title">ONTO-PAWLS</p>
                    <ColoredLine color={color} />
                    <div>
                        {/* <p className="navGroup__title">Dashboard</p> */}
                        <NavLink className="navGroup__link" to={''} end>
                            <MdOutlineHome style={iconStyle}/>
                            <span>Dashboard</span>
                        </NavLink>
                    </div>
                    <ColoredLine color="white" />
                    <div>
                        {/* <p className="navGroup__title">Users</p> */}
                        <NavLink className="navGroup__link" to={'users'} end>
                            <MdOutlineGroup style={iconStyle} />
                            <span>Users</span>
                        </NavLink>
                    </div>
                    <ColoredLine color="white" />
                    <div>
                        {/* <p className="navGroup__title">Papers</p> */}
                        <NavLink className="navGroup__link" to={'docs'} end>
                            <MdOutlineDescription style={iconStyle} />
                            <span>Documents</span>
                        </NavLink>
                    </div>
                    <ColoredLine color="white" />
                    <div>
                        {/* <p className="navGroup__title">Tasks</p> */}
                        <NavLink className="navGroup__link" to={'tasks'} end>
                            <MdOutlineAssignment style={iconStyle} />
                            <span>Tasks</span>
                        </NavLink>
                    </div>
                    <ColoredLine color="white" />
                    <div>
                        {/* <p className="navGroup__title">Ontologies</p> */}
                        <NavLink className="navGroup__link" to={'ontos'} end>
                            <MdOutlineHub style={iconStyle} />
                            <span>Ontologies</span>
                        </NavLink>
                    </div>
                    <ColoredLine color="white" />
                </NavLinks>
            </Sidebar>

            <WithTopbar height={topbarHeight}>
                <Topbar height={topbarHeight} leftOffset={sidebarWidth} />
                <DashContainer>
                    <Routes>
                        <Route path="/" element={<Outlet />}>
                            <Route path="/" element={<DashSummaryPage />} />
                            <Route path="users" element={<UsersPage />} />
                            <Route path="users/:userId" element={<UserPage />} />
                            <Route path="users/new" element={<UserCreatePage />} />
                            <Route path="docs" element={<DocumentsPage />} />
                            <Route path="docs/:docId" element={<DocumentPage />} />
                            <Route path="tasks" element={<TasksPage />} />
                            <Route path="tasks/:taskId" element={<TaskPage />} />
                            <Route path="tasks/new" element={<TaskCreatePage />} />
                            <Route path="ontos" element={<OntologiesPage />} />
                        </Route>
                    </Routes>
                </DashContainer>
            </WithTopbar>
        </WithSidebar>
    );
};

export default DashPage;

const DashContainer = styled.div(
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
