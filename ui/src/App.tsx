/**
 * This is the top-level component that defines your UI application.
 *
 * This is an appropriate spot for application wide components and configuration,
 * stuff like application chrome (headers, footers, navigation, etc), routing
 * (what urls go where), etc.
 *
 * @see https://github.com/reactjs/react-router-tutorial/tree/master/lessons
 */

import { createGlobalStyle } from 'styled-components';
import { Routes, Route, Outlet } from 'react-router-dom';

import { DashPage, HomePage, LoginPage, PDFCommitPage, PDFTaskPage } from './pages';
import { PersistLogin, RedirectToPage, RequireAuth } from './components';
import { ROLES } from './config/roles';

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Outlet />}>
                    {/* Public Routes */}
                    <Route path="login" element={<LoginPage />} />

                    <Route element={<PersistLogin />}>
                        <Route path="/" element={<RedirectToPage />} />

                        {/* Administrator Routes */}
                        <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                            <Route path="dash/*" element={<DashPage />} />
                        </Route>

                        {/* Annotator Routes */}
                        <Route element={<RequireAuth allowedRoles={[ROLES.Annotator]} />}>
                            <Route path="home/*" element={<HomePage />} />
                        </Route>

                        {/* Administrator and Annotator shared routes */}
                        <Route
                            element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.Annotator]} />}>
                            <Route path="pdf-commit/:commitId" element={<PDFCommitPage />} />
                            <Route path="pdf-task/:taskId" element={<PDFTaskPage />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
            <GlobalStyles />
        </>
    );
};

// Setup the viewport so it takes up all available real-estate.
const GlobalStyles = createGlobalStyle`
    html, body, #root {
        display: flex;
        flex-grow: 1;
    }

    ::-webkit-scrollbar {
        width: 10px;
    }
    ::-webkit-scrollbar-track {
        background: rgba(224, 224, 224, 1);
    }
    ::-webkit-scrollbar-thumb {
        background: rgba(136, 136, 136, 1);

        &:hover {
            background: rgba(85, 85, 85, 1);
        }
    }
`;

export default App;
