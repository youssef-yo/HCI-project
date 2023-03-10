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
import { Routes, Route } from 'react-router-dom';

import { DashPage, LoginPage, PDFPage } from './pages';
import { RedirectToPage, RequireAuth } from './components';
import { ROLES } from './config/roles';
import { PersistLogin } from './components/PersistLogin';

const App = () => {
    return (
        <>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />

                <Route element={<PersistLogin />}>
                    <Route path="/" element={<RedirectToPage />} />

                    {/* Administrator Routes */}
                    <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                        <Route path="/dash" element={<DashPage />} />
                    </Route>

                    {/* Annotator Routes */}
                    <Route element={<RequireAuth allowedRoles={[ROLES.Annotator]} />}>
                        <Route path="/pdf/:sha" element={<PDFPage />} />
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
`;

export default App;
