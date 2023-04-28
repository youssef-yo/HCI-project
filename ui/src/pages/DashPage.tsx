import {
    MdOutlineAssignment,
    MdOutlineDashboard,
    MdOutlineDescription,
    MdOutlineGroup,
    MdOutlineHub,
    MdOutlinePersonAddAlt,
} from 'react-icons/md';
import { NavLink, Outlet, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { Sidebar, Topbar, WithSidebar, WithTopbar } from '../components/common';
import { Header } from '../components/sidebar';
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
} from './dashboard';

export const DashPage = () => {
    const topbarHeight = '68px';
    const sidebarWidth = '300px';

    return (
        <WithSidebar width={sidebarWidth}>
            <Sidebar width={sidebarWidth}>
                <Header />

                <NavLinks>
                    <div>
                        <p className="navGroup__title">Dashboard</p>
                        <NavLink className="navGroup__link" to={''} end>
                            <MdOutlineDashboard />
                            <span>Dashboard</span>
                        </NavLink>
                    </div>
                    <div>
                        <p className="navGroup__title">Users</p>
                        <NavLink className="navGroup__link" to={'users'} end>
                            <MdOutlineGroup />
                            <span>Users</span>
                        </NavLink>
                        <NavLink className="navGroup__link" to={'users/new'} end>
                            <MdOutlinePersonAddAlt />
                            <span>Create User</span>
                        </NavLink>
                    </div>
                    <div>
                        <p className="navGroup__title">Papers</p>
                        <NavLink className="navGroup__link" to={'docs'} end>
                            <MdOutlineDescription />
                            <span>Documents</span>
                        </NavLink>
                    </div>
                    <div>
                        <p className="navGroup__title">Tasks</p>
                        <NavLink className="navGroup__link" to={'tasks'} end>
                            <MdOutlineAssignment />
                            <span>Tasks</span>
                        </NavLink>
                    </div>
                    <div>
                        <p className="navGroup__title">Ontologies</p>
                        <NavLink className="navGroup__link" to={'ontos'} end>
                            <MdOutlineHub />
                            <span>Ontologies</span>
                        </NavLink>
                    </div>
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
                            <Route path="ontos" element={<OntologiesPage />} />
                        </Route>
                    </Routes>
                </DashContainer>
            </WithTopbar>
        </WithSidebar>
    );
};

const NavLinks = styled.div`
    .navGroup__title {
        color: #bbb;
        margin: 16px 0 0 0;
        font-size: 0.75rem;
        text-transform: uppercase;
    }

    .navGroup__link {
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
        }

        &:hover {
            background: rgba(255, 255, 255, 0.1);
            text-decoration: none;
        }

        &.active > span,
        &:hover > span {
            color: ${(props) => props.theme.color.R5};
        }

        &.active > svg,
        &:hover > svg {
            fill: ${(props) => props.theme.color.R5};
            stroke: ${(props) => props.theme.color.R5};
        }
    }
`;

const DashContainer = styled.div(
    ({ theme }) => `
    height: 100%;
    overflow-y: auto;
    padding: ${theme.spacing.md};
    background: ${theme.color.N4};
`
);
